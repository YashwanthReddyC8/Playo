package com.pm.ownerservice.service;

import com.pm.ownerservice.dto.BookingRequestDTO;
import com.pm.ownerservice.dto.BookingResponseDTO;
import com.pm.ownerservice.dto.PaymentVerificationDTO;
import com.pm.ownerservice.dto.RazorpayOrderDTO;
import com.pm.ownerservice.dto.UpdateBookingPlayRequestDTO;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.Set;
import java.util.UUID;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
        validateBookingStartNotPassed(request.bookingDate(), request.timeSlot());
        checkSlotAvailability(request.venueId(), request.bookingDate(), request.timeSlot(), request.timeSlotId());

        Booking.PlayVisibility playVisibility = resolvePlayVisibility(request.playVisibility());
        boolean playEnabled = request.playVisibility() != null && !request.playVisibility().isBlank();

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
                .playEnabled(playEnabled)
                .playVisibility(playVisibility)
            .joinCode(UUID.randomUUID().toString().replace("-", ""))
            .maxPlayers(resolveMaxPlayers(request.maxPlayers()))
            .joinedPlayers(1)
                .joinedUserIds(request.userId())
                .splitAmount(resolveSplitAmount(request.amount(), request.maxPlayers(), playVisibility))
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
     * Get all public play sessions that can be joined
     */
    public List<BookingResponseDTO> getPublicPlaySessions() {
        return bookingRepository.findByPlayEnabledTrueAndStatusOrderByCreatedAtDesc(Booking.BookingStatus.CONFIRMED)
                .stream()
            .filter(booking -> booking.getPlayVisibility() == Booking.PlayVisibility.PUBLIC)
            .filter(booking -> !isPlayExpired(booking))
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * Get all visible play sessions for a user.
     */
    public List<BookingResponseDTO> getVisiblePlaySessions(String viewerUserId, String viewerEmail) {
        return bookingRepository.findByPlayEnabledTrueAndStatusOrderByCreatedAtDesc(Booking.BookingStatus.CONFIRMED)
                .stream()
                .filter(booking -> !isPlayExpired(booking))
                .filter(booking -> isSessionVisibleToUser(booking, viewerUserId, viewerEmail))
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * Get a session by invite code for private join links.
     */
    public BookingResponseDTO getPlaySessionByJoinCode(String joinCode) {
        Booking booking = bookingRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Play session not found for code: " + joinCode));

        if (Boolean.FALSE.equals(booking.getPlayEnabled()) || isPlayExpired(booking)) {
            throw new ResourceNotFoundException("Play session expired");
        }

        return mapToResponseDTO(booking);
    }

    /**
     * Request to join an existing public play session.
     */
    public BookingResponseDTO joinPlaySession(String joinCode, String userId, String email) {
        Booking booking = bookingRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Play session not found for code: " + joinCode));

        if (Boolean.FALSE.equals(booking.getPlayEnabled()) || isPlayExpired(booking)) {
            throw new SlotNotAvailableException("This play session has expired");
        }

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new SlotNotAvailableException("Only confirmed sessions can be joined");
        }

        List<String> participants = getParticipants(booking);
        List<String> pendingRequests = getPendingJoinRequests(booking);
        List<String> pendingInvites = getPendingInvites(booking);

        String normalizedUserId = userId == null ? "" : userId.trim();
        String normalizedEmail = email == null ? "" : email.trim();
        String participantIdentifier = !normalizedEmail.isBlank() ? normalizedEmail : normalizedUserId;

        if ((!normalizedUserId.isBlank() && participants.contains(normalizedUserId))
                || (!normalizedEmail.isBlank() && participants.contains(normalizedEmail))) {
            throw new SlotNotAvailableException("User already joined this play session");
        }

        if (participantIdentifier.isBlank()) {
            throw new SlotNotAvailableException("User identifier is required to join play");
        }

        if (booking.getPlayVisibility() == Booking.PlayVisibility.PRIVATE) {
            int maxPlayers = booking.getMaxPlayers() != null && booking.getMaxPlayers() > 0 ? booking.getMaxPlayers() : 2;
            if (participants.size() >= maxPlayers) {
                throw new SlotNotAvailableException("This play session is already full");
            }

            participants.add(participantIdentifier);
            String inviteIdentifier = resolveInviteIdentifier(pendingInvites, normalizedUserId, normalizedEmail);
            if (inviteIdentifier != null) {
                pendingInvites.remove(inviteIdentifier);
            }

            booking.setPendingInviteUserIds(serializeIdentifierList(pendingInvites));
            booking.setJoinedUserIds(String.join(",", participants));
            booking.setJoinedPlayers(participants.size());
            booking.setSplitAmount(resolveSplitAmount(booking.getAmount(), booking.getMaxPlayers(), booking.getPlayVisibility()));
            booking.setPaymentSplitPercentages(serializeSplitPercentages(buildEvenSplitPercentages(participants)));

            Booking updatedBooking = bookingRepository.save(booking);
            log.info("User {} joined private play session {} via link", participantIdentifier, booking.getId());
            return mapToResponseDTO(updatedBooking);
        }

        if (pendingRequests.contains(participantIdentifier)) {
            throw new SlotNotAvailableException("Join request already pending host approval");
        }

        int maxPlayers = booking.getMaxPlayers() != null && booking.getMaxPlayers() > 0 ? booking.getMaxPlayers() : 2;
        if (participants.size() >= maxPlayers) {
            throw new SlotNotAvailableException("This play session is already full");
        }

        pendingRequests.add(participantIdentifier);
        booking.setPendingJoinRequestUserIds(serializeIdentifierList(pendingRequests));

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("User {} requested to join play session {}", participantIdentifier, booking.getId());
        return mapToResponseDTO(updatedBooking);
    }

    public BookingResponseDTO acceptInviteToPlay(Long bookingId, String userId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled()) || isPlayExpired(booking)) {
            throw new SlotNotAvailableException("This play session has expired");
        }

        List<String> pendingInvites = getPendingInvites(booking);
        String inviteIdentifier = resolveInviteIdentifier(pendingInvites, userId, email);
        if (inviteIdentifier == null) {
            throw new SlotNotAvailableException("No pending invite found for user");
        }

        String participantIdentifier;
        if (inviteIdentifier.contains("@")) {
            participantIdentifier = inviteIdentifier;
        } else {
            participantIdentifier = userId != null && !userId.isBlank() ? userId.trim() : inviteIdentifier;
        }

        List<String> participants = getParticipants(booking);
        if (!participants.contains(participantIdentifier)) {
            int maxPlayers = booking.getMaxPlayers() != null && booking.getMaxPlayers() > 0 ? booking.getMaxPlayers() : 2;
            if (participants.size() >= maxPlayers) {
                throw new SlotNotAvailableException("This play session is already full");
            }
            participants.add(participantIdentifier);
        }

        pendingInvites.remove(inviteIdentifier);
        booking.setPendingInviteUserIds(serializeIdentifierList(pendingInvites));
        booking.setJoinedUserIds(String.join(",", participants));
        booking.setJoinedPlayers(participants.size());
        booking.setSplitAmount(resolveSplitAmount(booking.getAmount(), booking.getMaxPlayers(), booking.getPlayVisibility()));
        booking.setPaymentSplitPercentages(serializeSplitPercentages(buildEvenSplitPercentages(participants)));

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO approveJoinRequest(Long bookingId, String requestUserId, String hostUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new SlotNotAvailableException("Play is not enabled for this booking");
        }

        if (!Objects.equals(booking.getUserId(), hostUserId)) {
            throw new SlotNotAvailableException("Only play host can approve join requests");
        }

        List<String> pendingRequests = getPendingJoinRequests(booking);
        if (!pendingRequests.contains(requestUserId)) {
            throw new ResourceNotFoundException("Join request not found for user: " + requestUserId);
        }

        List<String> participants = getParticipants(booking);
        if (!participants.contains(requestUserId)) {
            int maxPlayers = booking.getMaxPlayers() != null && booking.getMaxPlayers() > 0 ? booking.getMaxPlayers() : 2;
            if (participants.size() >= maxPlayers) {
                throw new SlotNotAvailableException("This play session is already full");
            }
            participants.add(requestUserId);
        }

        pendingRequests.remove(requestUserId);
        booking.setPendingJoinRequestUserIds(serializeIdentifierList(pendingRequests));
        booking.setJoinedUserIds(String.join(",", participants));
        booking.setJoinedPlayers(participants.size());
        booking.setSplitAmount(resolveSplitAmount(booking.getAmount(), booking.getMaxPlayers(), booking.getPlayVisibility()));
        booking.setPaymentSplitPercentages(serializeSplitPercentages(buildEvenSplitPercentages(participants)));

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO rejectJoinRequest(Long bookingId, String requestUserId, String hostUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new SlotNotAvailableException("Play is not enabled for this booking");
        }

        if (!Objects.equals(booking.getUserId(), hostUserId)) {
            throw new SlotNotAvailableException("Only play host can manage join requests");
        }

        List<String> pendingRequests = getPendingJoinRequests(booking);
        boolean removed = pendingRequests.remove(requestUserId);
        if (!removed) {
            throw new ResourceNotFoundException("Join request not found for user: " + requestUserId);
        }

        booking.setPendingJoinRequestUserIds(serializeIdentifierList(pendingRequests));
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    /**
     * Update play visibility settings on an existing booking.
     */
    public BookingResponseDTO updatePlaySettings(Long bookingId, UpdateBookingPlayRequestDTO request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new SlotNotAvailableException("Only confirmed bookings can be converted to play sessions");
        }

        validateBookingStartNotPassed(booking.getBookingDate(), booking.getTimeSlot());

        Booking.PlayVisibility visibility = resolvePlayVisibility(request.playVisibility());
        int maxPlayers = resolveMaxPlayers(request.maxPlayers());

        booking.setPlayEnabled(true);
        booking.setPlayVisibility(visibility);
        booking.setMaxPlayers(maxPlayers);
        List<String> participants = getParticipants(booking);
        if (!participants.contains(booking.getUserId())) {
            participants.add(0, booking.getUserId());
        }
        booking.setJoinedUserIds(String.join(",", participants));
        booking.setJoinedPlayers(Math.max(participants.size(), 1));
        if (booking.getJoinCode() == null || booking.getJoinCode().isBlank()) {
            booking.setJoinCode(UUID.randomUUID().toString().replace("-", ""));
        }
        booking.setSplitAmount(resolveSplitAmount(booking.getAmount(), maxPlayers, visibility));
        booking.setPaymentSplitPercentages(serializeSplitPercentages(buildEvenSplitPercentages(participants)));

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    /**
     * Delete all play sessions for a user.
     */
    public int deleteAllPlaySessionsForUser(String userId) {
        List<Booking> userBookings = bookingRepository.findByUserId(userId);
        int updatedCount = 0;

        for (Booking booking : userBookings) {
            if (Boolean.TRUE.equals(booking.getPlayEnabled())) {
                booking.setPlayEnabled(false);
                booking.setPlayVisibility(Booking.PlayVisibility.PRIVATE);
                booking.setJoinedPlayers(1);
                booking.setJoinedUserIds(booking.getUserId());
                booking.setPendingInviteUserIds("");
                booking.setPendingJoinRequestUserIds("");
                booking.setSplitAmount(booking.getAmount());
                booking.setPaymentSplitPercentages(booking.getUserId() + ":100");
                updatedCount += 1;
            }
        }

        if (updatedCount > 0) {
            bookingRepository.saveAll(userBookings);
        }

        return updatedCount;
    }

    public void deletePlaySession(Long bookingId, String hostUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new SlotNotAvailableException("Play is not enabled for this booking");
        }

        if (!Objects.equals(booking.getUserId(), hostUserId)) {
            throw new SlotNotAvailableException("Only play host can delete this play");
        }

        booking.setPlayEnabled(false);
        booking.setPlayVisibility(Booking.PlayVisibility.PRIVATE);
        booking.setJoinedPlayers(1);
        booking.setJoinedUserIds(booking.getUserId());
        booking.setPendingInviteUserIds("");
        booking.setPendingJoinRequestUserIds("");
        booking.setSplitAmount(booking.getAmount());
        booking.setPaymentSplitPercentages(booking.getUserId() + ":100");
        bookingRepository.save(booking);
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
        if (sportName == null || sportName.isBlank() || "Unknown Sport".equalsIgnoreCase(sportName) || "Unknown".equalsIgnoreCase(sportName)) {
            sportName = "General Sport";
        }
        List<String> participants = getParticipants(booking);
        List<String> pendingInvites = getPendingInvites(booking);
        List<String> pendingJoinRequests = getPendingJoinRequests(booking);
        String joinLink = booking.getJoinCode() == null || booking.getJoinCode().isBlank()
                ? null
                : frontendUrl + "/games/join/" + booking.getJoinCode();

        return new BookingResponseDTO(
                booking.getId(),
                booking.getUserId(),
                booking.getVenueId(),
                venueName,
                sportName,
                booking.getBookingDate(),
                booking.getTimeSlot(),
                booking.getAmount(),
                booking.getUserId(),
                participants,
                parseSplitPercentages(booking),
                pendingInvites,
                pendingJoinRequests,
                booking.getPlayEnabled(),
                booking.getPlayVisibility() != null ? booking.getPlayVisibility().name() : null,
                booking.getMaxPlayers(),
                participants.size(),
                booking.getSplitAmount(),
                booking.getJoinCode(),
                joinLink,
                booking.getRazorpayOrderId(),
                booking.getRazorpayPaymentId(),
                booking.getStatus().toString(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }

    private Booking.PlayVisibility resolvePlayVisibility(String playVisibility) {
        if (playVisibility == null || playVisibility.isBlank()) {
            return Booking.PlayVisibility.PRIVATE;
        }

        try {
            return Booking.PlayVisibility.valueOf(playVisibility.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return Booking.PlayVisibility.PRIVATE;
        }
    }

    private Integer resolveMaxPlayers(Integer maxPlayers) {
        return maxPlayers != null && maxPlayers > 1 ? maxPlayers : 2;
    }

    private BigDecimal resolveSplitAmount(BigDecimal amount, Integer maxPlayers, Booking.PlayVisibility playVisibility) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }

        if (playVisibility != Booking.PlayVisibility.PUBLIC) {
            return amount;
        }

        int players = resolveMaxPlayers(maxPlayers);
        return amount.divide(BigDecimal.valueOf(players), 2, RoundingMode.HALF_UP);
    }

    private void validateBookingStartNotPassed(LocalDate bookingDate, String timeSlot) {
        if (bookingDate == null || timeSlot == null || !timeSlot.contains("-")) {
            return;
        }

        String startTime = timeSlot.split("-")[0].trim();
        LocalTime slotStart = LocalTime.parse(startTime);
        LocalDateTime bookingStart = LocalDateTime.of(bookingDate, slotStart);

        if (!LocalDateTime.now().isBefore(bookingStart)) {
            throw new SlotNotAvailableException("Cannot create or update play after slot start time");
        }
    }

    private boolean isPlayExpired(Booking booking) {
        if (booking == null || booking.getBookingDate() == null || booking.getTimeSlot() == null || !booking.getTimeSlot().contains("-")) {
            return true;
        }

        String startTime = booking.getTimeSlot().split("-")[0].trim();
        LocalTime slotStart = LocalTime.parse(startTime);
        LocalDateTime bookingStart = LocalDateTime.of(booking.getBookingDate(), slotStart);
        return !LocalDateTime.now().isBefore(bookingStart);
    }

    public List<String> getPlayParticipants(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new ResourceNotFoundException("Play not enabled for booking: " + bookingId);
        }

        return getParticipants(booking);
    }

    public BookingResponseDTO removeParticipantFromPlay(Long bookingId, String participantUserId, String hostUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new SlotNotAvailableException("Play is not enabled for this booking");
        }

        if (!Objects.equals(booking.getUserId(), hostUserId)) {
            throw new SlotNotAvailableException("Only play host can manage participants");
        }

        if (booking.getUserId().equals(participantUserId)) {
            throw new SlotNotAvailableException("Host cannot be removed from own play");
        }

        List<String> participants = getParticipants(booking);
        boolean removed = participants.remove(participantUserId);

        if (!removed) {
            throw new ResourceNotFoundException("Participant not found in this play");
        }

        booking.setJoinedUserIds(String.join(",", participants));
        booking.setJoinedPlayers(participants.size());
        booking.setSplitAmount(resolveSplitAmount(booking.getAmount(), booking.getMaxPlayers(), booking.getPlayVisibility()));
        booking.setPaymentSplitPercentages(serializeSplitPercentages(buildEvenSplitPercentages(participants)));

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO addParticipantToPlay(Long bookingId, String participantUserId, String hostUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new SlotNotAvailableException("Play is not enabled for this booking");
        }

        if (!Objects.equals(booking.getUserId(), hostUserId)) {
            throw new SlotNotAvailableException("Only play host can manage participants");
        }

        if (participantUserId == null || participantUserId.isBlank()) {
            throw new SlotNotAvailableException("Participant email or user ID is required");
        }

        List<String> participants = getParticipants(booking);
        List<String> pendingInvites = getPendingInvites(booking);
        List<String> pendingRequests = getPendingJoinRequests(booking);

        if (participants.contains(participantUserId)) {
            throw new SlotNotAvailableException("User already joined this play session");
        }

        if (pendingInvites.contains(participantUserId)) {
            throw new SlotNotAvailableException("Invite already pending for this user");
        }

        if (pendingRequests.contains(participantUserId)) {
            throw new SlotNotAvailableException("User already has a pending public join request");
        }

        int maxPlayers = booking.getMaxPlayers() != null && booking.getMaxPlayers() > 0 ? booking.getMaxPlayers() : 2;
        if (participants.size() >= maxPlayers) {
            throw new SlotNotAvailableException("This play session is already full");
        }

        pendingInvites.add(participantUserId);
        booking.setPendingInviteUserIds(serializeIdentifierList(pendingInvites));

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO updatePlaySplitPercentages(Long bookingId, String hostUserId, Map<String, BigDecimal> splitPercentages) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Boolean.TRUE.equals(booking.getPlayEnabled())) {
            throw new SlotNotAvailableException("Play is not enabled for this booking");
        }

        if (!Objects.equals(booking.getUserId(), hostUserId)) {
            throw new SlotNotAvailableException("Only play host can manage payment splits");
        }

        List<String> participants = getParticipants(booking);
        if (splitPercentages == null || splitPercentages.isEmpty()) {
            throw new SlotNotAvailableException("Split percentages are required");
        }

        Set<String> expectedUsers = new LinkedHashSet<>(participants);
        Set<String> providedUsers = new LinkedHashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<String, BigDecimal> entry : splitPercentages.entrySet()) {
            String userId = entry.getKey();
            BigDecimal percentage = entry.getValue();

            if (userId == null || userId.isBlank()) {
                throw new SlotNotAvailableException("Split user ID cannot be empty");
            }

            if (!expectedUsers.contains(userId)) {
                throw new SlotNotAvailableException("Split contains non-participant user: " + userId);
            }

            if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0) {
                throw new SlotNotAvailableException("Split percentage must be greater than 0 for user: " + userId);
            }

            providedUsers.add(userId);
            total = total.add(percentage);
        }

        if (!providedUsers.equals(expectedUsers)) {
            throw new SlotNotAvailableException("Split percentages must include every participant exactly once");
        }

        if (total.compareTo(BigDecimal.valueOf(100)) != 0) {
            throw new SlotNotAvailableException("Split percentages must total 100");
        }

        booking.setPaymentSplitPercentages(serializeSplitPercentages(splitPercentages));
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    private List<String> getParticipants(Booking booking) {
        if (booking == null) {
            return new ArrayList<>();
        }

        String raw = booking.getJoinedUserIds();
        if (raw == null || raw.isBlank()) {
            return new ArrayList<>(List.of(booking.getUserId()));
        }

        Set<String> participants = new LinkedHashSet<>();
        Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .forEach(participants::add);

        if (booking.getUserId() != null && !booking.getUserId().isBlank()) {
            participants.add(booking.getUserId());
        }

        return new ArrayList<>(participants);
    }

    private List<String> getPendingInvites(Booking booking) {
        return parseIdentifierList(booking.getPendingInviteUserIds());
    }

    private List<String> getPendingJoinRequests(Booking booking) {
        return parseIdentifierList(booking.getPendingJoinRequestUserIds());
    }

    private List<String> parseIdentifierList(String raw) {
        if (raw == null || raw.isBlank()) {
            return new ArrayList<>();
        }

        Set<String> values = new LinkedHashSet<>();
        Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .forEach(values::add);

        return new ArrayList<>(values);
    }

    private String serializeIdentifierList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }

        return values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private String resolveInviteIdentifier(List<String> pendingInvites, String userId, String email) {
        if (pendingInvites == null || pendingInvites.isEmpty()) {
            return null;
        }

        String normalizedUserId = userId == null ? "" : userId.trim();
        String normalizedEmail = email == null ? "" : email.trim();

        for (String pendingInvite : pendingInvites) {
            if (pendingInvite == null || pendingInvite.isBlank()) {
                continue;
            }

            if (!normalizedUserId.isBlank() && pendingInvite.equals(normalizedUserId)) {
                return pendingInvite;
            }

            if (!normalizedEmail.isBlank() && pendingInvite.equalsIgnoreCase(normalizedEmail)) {
                return pendingInvite;
            }
        }

        return null;
    }

    private boolean isSessionVisibleToUser(Booking booking, String viewerUserId, String viewerEmail) {
        if (booking.getPlayVisibility() == Booking.PlayVisibility.PUBLIC) {
            return true;
        }

        if (viewerUserId == null || viewerUserId.isBlank()) {
            return false;
        }

        if (viewerUserId.equals(booking.getUserId())) {
            return true;
        }

        String normalizedEmail = viewerEmail == null ? "" : viewerEmail.trim().toLowerCase();

        return getParticipants(booking).stream().anyMatch(value -> matchesIdentity(value, viewerUserId, normalizedEmail))
                || getPendingInvites(booking).stream().anyMatch(value -> matchesIdentity(value, viewerUserId, normalizedEmail))
                || getPendingJoinRequests(booking).stream().anyMatch(value -> matchesIdentity(value, viewerUserId, normalizedEmail));
    }

    private boolean matchesIdentity(String candidate, String viewerUserId, String viewerEmail) {
        if (candidate == null || candidate.isBlank()) {
            return false;
        }

        String normalizedCandidate = candidate.trim();
        if (viewerUserId != null && !viewerUserId.isBlank() && normalizedCandidate.equals(viewerUserId.trim())) {
            return true;
        }

        return viewerEmail != null && !viewerEmail.isBlank() && normalizedCandidate.equalsIgnoreCase(viewerEmail);
    }

    private Map<String, BigDecimal> buildEvenSplitPercentages(List<String> participants) {
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        if (participants == null || participants.isEmpty()) {
            return result;
        }

        BigDecimal hundred = BigDecimal.valueOf(100);
        BigDecimal base = hundred.divide(BigDecimal.valueOf(participants.size()), 2, RoundingMode.DOWN);
        BigDecimal running = BigDecimal.ZERO;

        for (int index = 0; index < participants.size(); index += 1) {
            String userId = participants.get(index);
            BigDecimal value = index == participants.size() - 1 ? hundred.subtract(running) : base;
            result.put(userId, value);
            running = running.add(value);
        }

        return result;
    }

    private Map<String, BigDecimal> parseSplitPercentages(Booking booking) {
        Map<String, BigDecimal> parsed = new LinkedHashMap<>();
        String raw = booking.getPaymentSplitPercentages();
        if (raw == null || raw.isBlank()) {
            return buildEvenSplitPercentages(getParticipants(booking));
        }

        for (String chunk : raw.split(",")) {
            String value = chunk.trim();
            if (value.isBlank() || !value.contains(":")) {
                continue;
            }

            String[] pair = value.split(":", 2);
            String userId = pair[0].trim();
            String percent = pair[1].trim();
            if (userId.isBlank() || percent.isBlank()) {
                continue;
            }

            try {
                parsed.put(userId, new BigDecimal(percent));
            } catch (NumberFormatException ignored) {
                // skip malformed persisted value
            }
        }

        if (parsed.isEmpty()) {
            return buildEvenSplitPercentages(getParticipants(booking));
        }

        return parsed;
    }

    private String serializeSplitPercentages(Map<String, BigDecimal> splitPercentages) {
        if (splitPercentages == null || splitPercentages.isEmpty()) {
            return "";
        }

        return splitPercentages.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue().stripTrailingZeros().toPlainString())
                .reduce((left, right) -> left + "," + right)
                .orElse("");
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
