package com.pm.ownerservice.service;

import com.pm.ownerservice.dto.BookingRequestDTO;
import com.pm.ownerservice.dto.BookingResponseDTO;
import com.pm.ownerservice.dto.PaymentVerificationDTO;
import com.pm.ownerservice.dto.RazorpayOrderDTO;
import com.pm.ownerservice.entity.Booking;
import com.pm.ownerservice.entity.TimeSlot;
import com.pm.ownerservice.exception.PaymentFailedException;
import com.pm.ownerservice.exception.ResourceNotFoundException;
import com.pm.ownerservice.exception.SlotNotAvailableException;
import com.pm.ownerservice.repository.BookingRepository;
import com.pm.ownerservice.repository.TimeSlotRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RazorpayClient razorpayClient;
    private final SportCenterService sportCenterService;
    private final TimeSlotRepository timeSlotRepository;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    private static final String CURRENCY = "INR";
    /**
     * Create a booking order and call Razorpay API
     * 
     * @param request Booking request with venue, date, time, and amount
     * @return Razorpay Order DTO with orderId
     * @throws SlotNotAvailableException if slot is already booked
     * @throws ResourceNotFoundException if venue doesn't exist
     */
    public RazorpayOrderDTO createBookingOrder(BookingRequestDTO request) {
        log.info("Creating booking order for user: {}, venue: {}, date: {}, time: {}",
                request.userId(), request.venueId(), request.bookingDate(), request.timeSlot());

        // Check slot availability
        validateCenterInactiveDate(request.venueId(), request.bookingDate());
        validateSelectedTimeSlot(request);
        validateInactiveDate(request.timeSlotId(), request.bookingDate());
        checkSlotAvailability(request.venueId(), request.bookingDate(), request.timeSlot(), request.timeSlotId());

        // Create booking with PENDING status
        Booking booking = Booking.builder()
                .userId(request.userId())
                .venueId(request.venueId())
                .facilityId(request.facilityId())
                .timeSlotId(request.timeSlotId())
                .sportName(request.sportName())
                .bookingDate(request.bookingDate())
                .timeSlot(request.timeSlot())
                .amount(request.amount())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created with ID: {} (status: PENDING)", savedBooking.getId());

        // Create Razorpay Order
        try {
            Order razorpayOrder = createRazorpayOrder(savedBooking);

            // Update booking with razorpay order ID
            String orderId = (String) razorpayOrder.get("id");
            savedBooking.setRazorpayOrderId(orderId);
            bookingRepository.save(savedBooking);

            log.info("Razorpay Order created: {}", orderId);

            return new RazorpayOrderDTO(
                    razorpayOrder.get("id"),
                    savedBooking.getId(),
                    razorpayOrder.get("amount").toString(),
                    razorpayOrder.get("currency"));

        } catch (Exception e) {
            // Mark booking as cancelled if Razorpay fails
            savedBooking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(savedBooking);

            log.error("Failed to create Razorpay order for booking {}: {}", savedBooking.getId(), e.getMessage());
            throw new PaymentFailedException("Failed to create payment order: " + e.getMessage(), e);
        }
    }

    /**
     * Verify payment signature and confirm booking
     * 
     * @param request Payment verification details from frontend
     * @return Confirmed booking details
     * @throws PaymentFailedException    if signature verification fails
     * @throws ResourceNotFoundException if booking not found
     */
    public BookingResponseDTO verifyPaymentAndConfirmBooking(PaymentVerificationDTO request) {
        log.info("Verifying payment for order: {}, payment: {}",
                request.razorpayOrderId(), request.razorpayPaymentId());

        // Find booking by order ID
        Booking booking = bookingRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found for order: " + request.razorpayOrderId()));

        try {
            // Verify payment signature using Razorpay Utils
            JSONObject paymentData = new JSONObject()
                    .put("razorpay_order_id", request.razorpayOrderId())
                    .put("razorpay_payment_id", request.razorpayPaymentId())
                    .put("razorpay_signature", request.razorpaySignature());

            boolean isSignatureValid = Utils.verifyPaymentSignature(paymentData, razorpayKeySecret);

            if (!isSignatureValid) {
                throw new PaymentFailedException("Payment signature verification failed");
            }

            // If verification succeeds, update booking status
            booking.setRazorpayPaymentId(request.razorpayPaymentId());
            booking.setStatus(Booking.BookingStatus.CONFIRMED);

            Booking confirmedBooking = bookingRepository.save(booking);
            log.info("Booking {} confirmed with payment: {}", booking.getId(), request.razorpayPaymentId());

            return mapToResponseDTO(confirmedBooking);

        } catch (Exception e) {
            log.error("Payment verification failed for order {}: {}", request.razorpayOrderId(), e.getMessage());
            throw new PaymentFailedException("Payment verification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get all bookings for a user
     */
    public List<BookingResponseDTO> getUserBookings(String userId) {
        log.info("Fetching bookings for user: {}", userId);
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * Get all bookings for a venue
     */
    public List<BookingResponseDTO> getVenueBookings(Long venueId) {
        log.info("Fetching bookings for venue: {}", venueId);
        return bookingRepository.findByVenueId(venueId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * Get a specific booking by ID
     */
    public BookingResponseDTO getBookingById(Long bookingId) {
        log.info("Fetching booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        return mapToResponseDTO(booking);
    }

    /**
     * Cancel a booking
     */
    public BookingResponseDTO cancelBooking(Long bookingId) {
        log.info("Cancelling booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateCancellationWindow(booking);

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        log.info("Booking {} cancelled", bookingId);
        return mapToResponseDTO(cancelledBooking);
    }

    // Private helper methods

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        String venueName = sportCenterService.getCenterNameById(booking.getVenueId());
        String sportName = booking.getFacilityId() != null
                ? sportCenterService.getFacilitySportName(booking.getFacilityId())
                : booking.getSportName();
        return BookingResponseDTO.fromEntity(booking, venueName, sportName);
    }

    /**
     * Check if slot is available for the given venue, date, and time
     * 
     * @throws SlotNotAvailableException if slot is already booked
     */
    private void checkSlotAvailability(Long venueId, LocalDate bookingDate, String timeSlot, Long timeSlotId) {
        long bookedCount = bookingRepository.countByVenueIdAndBookingDateAndTimeSlotAndStatusIn(
                venueId,
                bookingDate,
                timeSlot,
                EnumSet.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED));

        int totalCourts = resolveTotalCourtsForTimeSlot(timeSlotId);
        if (bookedCount >= totalCourts) {
            log.warn("Slot {} on {}/{} is already booked for venue {}",
                    timeSlot, bookingDate, venueId);
            throw new SlotNotAvailableException("Time slot " + timeSlot + " is not available on " + bookingDate);
        }

        log.debug("Slot {} has {} of {} courts booked for venue {} on {}",
                timeSlot, bookedCount, totalCourts, venueId, bookingDate);
    }

    private int resolveTotalCourtsForTimeSlot(Long timeSlotId) {
        if (timeSlotId == null) {
            return 1;
        }

        return timeSlotRepository.findById(timeSlotId)
                .map(timeSlot -> timeSlot.getSportFacility() != null ? timeSlot.getSportFacility().getTotalCourts() : 1)
                .filter(count -> count != null && count > 0)
                .orElse(1);
    }

    private void validateInactiveDate(Long timeSlotId, LocalDate bookingDate) {
        if (timeSlotId == null || bookingDate == null) {
            return;
        }

        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found: " + timeSlotId));

        if (timeSlot.getIsActive() != null && !timeSlot.getIsActive()) {
            throw new SlotNotAvailableException("Center is closed for this slot");
        }

        if (timeSlot.getInactiveDates() == null || timeSlot.getInactiveDates().isBlank()) {
            return;
        }

        boolean inactiveDateSelected = java.util.Arrays.stream(timeSlot.getInactiveDates().split(","))
                .map(String::trim)
                .anyMatch(date -> date.equals(bookingDate.toString()));

        if (inactiveDateSelected) {
            throw new SlotNotAvailableException("Center is closed on " + bookingDate);
        }
    }

    private void validateCenterInactiveDate(Long centerId, LocalDate bookingDate) {
        if (sportCenterService.isCenterInactiveOnDate(centerId, bookingDate)) {
            throw new SlotNotAvailableException("Center is closed on " + bookingDate);
        }
    }

    private void validateSelectedTimeSlot(BookingRequestDTO request) {
        if (request.timeSlotId() == null) {
            return;
        }

        TimeSlot timeSlot = timeSlotRepository.findById(request.timeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found: " + request.timeSlotId()));

        Long centerId = timeSlot.getSportFacility().getSportCenter().getId();
        if (!centerId.equals(request.venueId())) {
            throw new SlotNotAvailableException("Selected slot does not belong to this center");
        }

        if (request.facilityId() != null && !timeSlot.getSportFacility().getId().equals(request.facilityId())) {
            throw new SlotNotAvailableException("Selected slot does not belong to this sport facility");
        }

        validateTimeWindowWithinSlot(timeSlot, request.timeSlot());

        String bookingDay = request.bookingDate().getDayOfWeek().name();
        boolean dayAllowed = java.util.Arrays.stream(timeSlot.getDaysOfWeek().split(","))
                .map(String::trim)
                .anyMatch(day -> day.equalsIgnoreCase(bookingDay));

        if (!dayAllowed) {
            throw new SlotNotAvailableException("Selected slot is not active on " + bookingDay);
        }

        BigDecimal requestedAmount = request.amount();
        if (requestedAmount == null || timeSlot.getPrice() == null || requestedAmount.compareTo(timeSlot.getPrice()) != 0) {
            throw new SlotNotAvailableException("Price mismatch for selected slot");
        }
    }

    private void validateTimeWindowWithinSlot(TimeSlot parentSlot, String requestedTimeSlot) {
        if (requestedTimeSlot == null || !requestedTimeSlot.matches("\\d{2}:\\d{2}-\\d{2}:\\d{2}")) {
            throw new SlotNotAvailableException("Invalid time slot format");
        }

        String[] range = requestedTimeSlot.split("-");
        LocalTime requestedStart = LocalTime.parse(range[0]);
        LocalTime requestedEnd = LocalTime.parse(range[1]);

        if (!requestedEnd.isAfter(requestedStart)) {
            throw new SlotNotAvailableException("Invalid time slot range");
        }

        long requestedMinutes = java.time.Duration.between(requestedStart, requestedEnd).toMinutes();
        if (requestedMinutes != 60) {
            throw new SlotNotAvailableException("Only 1-hour slots are allowed");
        }

        LocalTime slotStart = parentSlot.getStartTime();
        LocalTime slotEnd = parentSlot.getEndTime();
        boolean startsInside = !requestedStart.isBefore(slotStart);
        boolean endsInside = !requestedEnd.isAfter(slotEnd);

        if (!(startsInside && endsInside)) {
            throw new SlotNotAvailableException("Selected time is outside configured slot window");
        }
    }

    private void validateCancellationWindow(Booking booking) {
        if (booking.getBookingDate() == null || booking.getTimeSlot() == null) {
            return;
        }

        LocalDateTime bookingStart = LocalDateTime.of(booking.getBookingDate(), parseBookingStartTime(booking.getTimeSlot()));
        LocalDateTime now = LocalDateTime.now();

        if (!now.isBefore(bookingStart)) {
            throw new SlotNotAvailableException("Booking can only be cancelled before the slot start time");
        }
    }

    private LocalTime parseBookingStartTime(String timeSlot) {
        if (timeSlot == null || !timeSlot.contains("-")) {
            throw new SlotNotAvailableException("Invalid booking time slot format");
        }

        String startTime = timeSlot.split("-")[0].trim();
        return LocalTime.parse(startTime);
    }

    /**
     * Create a Razorpay Order
     * 
     * @param booking The booking entity
     * @return Razorpay Order object
     */
    private Order createRazorpayOrder(Booking booking) throws Exception {
        JSONObject orderRequest = new JSONObject();

        // Amount in paise (1 INR = 100 paise)
        long amountInPaise = booking.getAmount().multiply(new java.math.BigDecimal(100)).longValue();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", CURRENCY);
        orderRequest.put("receipt", "booking_" + booking.getId());

        // Add notes for reference
        JSONObject notes = new JSONObject();
        notes.put("bookingId", booking.getId());
        notes.put("userId", booking.getUserId());
        notes.put("venueId", booking.getVenueId());
        notes.put("bookingDate", booking.getBookingDate());
        notes.put("timeSlot", booking.getTimeSlot());
        orderRequest.put("notes", notes);

        log.debug("Creating Razorpay order: amount={} paise, receipt={}", amountInPaise, "booking_" + booking.getId());
        return razorpayClient.orders.create(orderRequest);
    }
}
