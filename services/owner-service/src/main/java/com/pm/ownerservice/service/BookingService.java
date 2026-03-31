package com.pm.ownerservice.service;

import com.pm.ownerservice.dto.BookingRequestDTO;
import com.pm.ownerservice.dto.BookingResponseDTO;
import com.pm.ownerservice.dto.PaymentVerificationDTO;
import com.pm.ownerservice.dto.RazorpayOrderDTO;
import com.pm.ownerservice.entity.Booking;
import com.pm.ownerservice.exception.PaymentFailedException;
import com.pm.ownerservice.exception.ResourceNotFoundException;
import com.pm.ownerservice.exception.SlotNotAvailableException;
import com.pm.ownerservice.repository.BookingRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RazorpayClient razorpayClient;
    private final SportCenterService sportCenterService;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    private static final String CURRENCY = "INR";
    private static final int MAX_SLOTS_PER_DATETIME = 1; // One booking per slot

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
        checkSlotAvailability(request.venueId(), request.bookingDate(), request.timeSlot());

        // Create booking with PENDING status
        Booking booking = Booking.builder()
                .userId(request.userId())
                .venueId(request.venueId())
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

            return BookingResponseDTO.fromEntity(confirmedBooking);

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
                .map(BookingResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Get all bookings for a venue
     */
    public List<BookingResponseDTO> getVenueBookings(Long venueId) {
        log.info("Fetching bookings for venue: {}", venueId);
        return bookingRepository.findByVenueId(venueId)
                .stream()
                .map(BookingResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Get a specific booking by ID
     */
    public BookingResponseDTO getBookingById(Long bookingId) {
        log.info("Fetching booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        return BookingResponseDTO.fromEntity(booking);
    }

    /**
     * Cancel a booking
     */
    public BookingResponseDTO cancelBooking(Long bookingId) {
        log.info("Cancelling booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        log.info("Booking {} cancelled", bookingId);
        return BookingResponseDTO.fromEntity(cancelledBooking);
    }

    // Private helper methods

    /**
     * Check if slot is available for the given venue, date, and time
     * 
     * @throws SlotNotAvailableException if slot is already booked
     */
    private void checkSlotAvailability(Long venueId, LocalDate bookingDate, String timeSlot) {
        List<Booking> existingBookings = bookingRepository.findByVenueIdAndBookingDateAndStatus(
                venueId, bookingDate, Booking.BookingStatus.CONFIRMED);

        boolean slotTaken = existingBookings.stream()
                .anyMatch(b -> b.getTimeSlot().equals(timeSlot));

        if (slotTaken) {
            log.warn("Slot {} on {}/{} is already booked for venue {}",
                    timeSlot, bookingDate, venueId);
            throw new SlotNotAvailableException("Time slot " + timeSlot + " is not available on " + bookingDate);
        }

        log.debug("Slot {} is available for venue {} on {}", timeSlot, venueId, bookingDate);
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
