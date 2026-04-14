package com.pm.ownerservice.controller;

import com.pm.ownerservice.dto.BookingRequestDTO;
import com.pm.ownerservice.dto.BookingResponseDTO;
import com.pm.ownerservice.dto.JoinPlaySessionRequestDTO;
import com.pm.ownerservice.dto.AcceptPlayInviteRequestDTO;
import com.pm.ownerservice.dto.AddPlayParticipantRequestDTO;
import com.pm.ownerservice.dto.ManagePlayParticipantRequestDTO;
import com.pm.ownerservice.dto.UpdateBookingPlayRequestDTO;
import com.pm.ownerservice.dto.UpdatePlaySplitRequestDTO;
import com.pm.ownerservice.dto.PaymentVerificationDTO;
import com.pm.ownerservice.dto.RazorpayOrderDTO;
import com.pm.ownerservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Booking operations
 * Handles creation, verification, and retrieval of bookings
 */
@RestController
@RequestMapping("/api/owners/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /api/bookings/create
     * Create a booking order and initiate Razorpay payment
     * 
     * @param request Booking request details
     * @return Razorpay order details with orderId
     */
    @PostMapping("/create")
    public ResponseEntity<RazorpayOrderDTO> createBookingOrder(
            @Valid @RequestBody BookingRequestDTO request) {

        log.info("Received booking request for user: {}, venue: {}", request.userId(), request.venueId());

        RazorpayOrderDTO orderDTO = bookingService.createBookingOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(orderDTO);
    }

    /**
     * POST /api/bookings/verify
     * Verify payment signature and confirm booking
     * 
     * @param request Payment verification details from Razorpay
     * @return Confirmed booking details
     */
    @PostMapping("/verify")
    public ResponseEntity<BookingResponseDTO> verifyPayment(
            @Valid @RequestBody PaymentVerificationDTO request) {

        log.info("Verifying payment for order: {}", request.razorpayOrderId());

        BookingResponseDTO bookingDTO = bookingService.verifyPaymentAndConfirmBooking(request);

        return ResponseEntity.ok(bookingDTO);
    }

    /**
     * GET /api/bookings/user/{userId}
     * Get all bookings for a specific user
     * 
     * @param userId User ID
     * @return List of bookings
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(@PathVariable String userId) {
        log.info("Fetching bookings for user: {}", userId);

        List<BookingResponseDTO> bookings = bookingService.getUserBookings(userId);

        return ResponseEntity.ok(bookings);
    }

    /**
     * GET /api/bookings/venue/{venueId}
     * Get all bookings for a specific venue
     * 
     * @param venueId Venue ID
     * @return List of bookings
     */
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<BookingResponseDTO>> getVenueBookings(@PathVariable Long venueId) {
        log.info("Fetching bookings for venue: {}", venueId);

        List<BookingResponseDTO> bookings = bookingService.getVenueBookings(venueId);

        return ResponseEntity.ok(bookings);
    }

    /**
     * GET /api/bookings/{bookingId}
     * Get a specific booking by ID
     * 
     * @param bookingId Booking ID
     * @return Booking details
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long bookingId) {
        log.info("Fetching booking: {}", bookingId);

        BookingResponseDTO booking = bookingService.getBookingById(bookingId);

        return ResponseEntity.ok(booking);
    }

    /**
     * DELETE /api/bookings/{bookingId}
     * Cancel a booking
     * 
     * @param bookingId Booking ID
     * @return Cancelled booking details
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long bookingId) {
        log.info("Cancelling booking: {}", bookingId);

        BookingResponseDTO booking = bookingService.cancelBooking(bookingId);

        return ResponseEntity.ok(booking);
    }

    /**
     * GET /api/bookings/play/public
     * Get public play sessions that can be joined.
     */
    @GetMapping("/play/public")
    public ResponseEntity<List<BookingResponseDTO>> getPublicPlaySessions() {
        return ResponseEntity.ok(bookingService.getPublicPlaySessions());
    }

    /**
     * GET /api/bookings/play
     * Get play sessions visible to the given user.
     */
    @GetMapping("/play")
    public ResponseEntity<List<BookingResponseDTO>> getVisiblePlaySessions(
            @RequestParam(value = "viewerUserId", required = false) String viewerUserId) {
        return ResponseEntity.ok(bookingService.getVisiblePlaySessions(viewerUserId, null));
    }

    /**
     * GET /api/bookings/play/visible
     * Get play sessions visible to the given user id/email pair.
     */
    @GetMapping("/play/visible")
    public ResponseEntity<List<BookingResponseDTO>> getVisiblePlaySessionsWithEmail(
            @RequestParam(value = "viewerUserId", required = false) String viewerUserId,
            @RequestParam(value = "viewerEmail", required = false) String viewerEmail) {
        return ResponseEntity.ok(bookingService.getVisiblePlaySessions(viewerUserId, viewerEmail));
    }

    /**
     * GET /api/bookings/play/{joinCode}
     * Load a play session by invite code.
     */
    @GetMapping("/play/{joinCode}")
    public ResponseEntity<BookingResponseDTO> getPlaySessionByJoinCode(@PathVariable String joinCode) {
        return ResponseEntity.ok(bookingService.getPlaySessionByJoinCode(joinCode));
    }

    /**
     * POST /api/bookings/play/{joinCode}/join
     * Join a public or private play session.
     */
    @PostMapping("/play/{joinCode}/join")
    public ResponseEntity<BookingResponseDTO> joinPlaySession(
            @PathVariable String joinCode,
            @Valid @RequestBody JoinPlaySessionRequestDTO request) {
        log.info("User {} requesting join for play session {}", request.userId(), joinCode);
        return ResponseEntity.ok(bookingService.joinPlaySession(joinCode, request.userId(), request.email()));
    }

    /**
     * POST /api/bookings/{bookingId}/play/invitations/accept
     * Accept a host invitation for a private play.
     */
    @PostMapping("/{bookingId}/play/invitations/accept")
    public ResponseEntity<BookingResponseDTO> acceptPlayInvite(
            @PathVariable Long bookingId,
            @Valid @RequestBody AcceptPlayInviteRequestDTO request) {
        return ResponseEntity.ok(bookingService.acceptInviteToPlay(bookingId, request.userId(), request.email()));
    }

    /**
     * POST /api/bookings/{bookingId}/play/requests/{requestUserId}/approve
     * Host approves a public join request.
     */
    @PostMapping("/{bookingId}/play/requests/{requestUserId}/approve")
    public ResponseEntity<BookingResponseDTO> approveJoinRequest(
            @PathVariable Long bookingId,
            @PathVariable String requestUserId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        return ResponseEntity.ok(bookingService.approveJoinRequest(bookingId, requestUserId, request.hostUserId()));
    }

    /**
     * POST /api/bookings/{bookingId}/play/requests/{requestUserId}/reject
     * Host rejects a public join request.
     */
    @PostMapping("/{bookingId}/play/requests/{requestUserId}/reject")
    public ResponseEntity<BookingResponseDTO> rejectJoinRequest(
            @PathVariable Long bookingId,
            @PathVariable String requestUserId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        return ResponseEntity.ok(bookingService.rejectJoinRequest(bookingId, requestUserId, request.hostUserId()));
    }

    /**
     * DELETE /api/bookings/{bookingId}/play/requests/{requestUserId}
     * Backward-compatible alias for rejecting a public join request.
     */
    @DeleteMapping("/{bookingId}/play/requests/{requestUserId}")
    public ResponseEntity<BookingResponseDTO> rejectJoinRequestWithDelete(
            @PathVariable Long bookingId,
            @PathVariable String requestUserId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        return ResponseEntity.ok(bookingService.rejectJoinRequest(bookingId, requestUserId, request.hostUserId()));
    }

    /**
     * PUT /api/bookings/{bookingId}/play
     * Mark an existing booking as a public or private play session.
     */
    @PutMapping("/{bookingId}/play")
    public ResponseEntity<BookingResponseDTO> updateBookingPlaySettings(
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdateBookingPlayRequestDTO request) {
        return ResponseEntity.ok(bookingService.updatePlaySettings(bookingId, request));
    }

    /**
     * DELETE /api/bookings/play/user/{userId}
     * Delete all play sessions created by the user.
     */
    @DeleteMapping("/play/user/{userId}")
    public ResponseEntity<Void> deleteAllPlaySessionsForUser(@PathVariable String userId) {
        bookingService.deleteAllPlaySessionsForUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/bookings/{bookingId}/play
     * Host deletes (disables) one play session.
     */
    @DeleteMapping("/{bookingId}/play")
    public ResponseEntity<Void> deletePlaySession(
            @PathVariable Long bookingId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        bookingService.deletePlaySession(bookingId, request.hostUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/bookings/{bookingId}/play/disable
     * Backward-compatible alias for disabling a play session.
     */
    @PostMapping("/{bookingId}/play/disable")
    public ResponseEntity<Void> disablePlaySession(
            @PathVariable Long bookingId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        bookingService.deletePlaySession(bookingId, request.hostUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/bookings/{bookingId}/play/participants
     * Get participant user IDs for a play session.
     */
    @GetMapping("/{bookingId}/play/participants")
    public ResponseEntity<List<String>> getPlayParticipants(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.getPlayParticipants(bookingId));
    }

    /**
     * POST /api/bookings/{bookingId}/play/participants
     * Host adds a participant to the play.
     */
    @PostMapping("/{bookingId}/play/participants")
    public ResponseEntity<BookingResponseDTO> addParticipant(
            @PathVariable Long bookingId,
            @Valid @RequestBody AddPlayParticipantRequestDTO request) {
        return ResponseEntity.ok(
                bookingService.addParticipantToPlay(bookingId, request.participantUserId(), request.hostUserId()));
    }

    /**
     * DELETE /api/bookings/{bookingId}/play/participants/{participantUserId}
     * Remove a participant from a play session (host only).
     */
    @DeleteMapping("/{bookingId}/play/participants/{participantUserId}")
    public ResponseEntity<BookingResponseDTO> removeParticipant(
            @PathVariable Long bookingId,
            @PathVariable String participantUserId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        return ResponseEntity.ok(bookingService.removeParticipantFromPlay(bookingId, participantUserId, request.hostUserId()));
    }

    /**
     * POST /api/bookings/{bookingId}/play/participants/{participantUserId}/remove
     * Backward-compatible alias for removing a participant from a play session.
     */
    @PostMapping("/{bookingId}/play/participants/{participantUserId}/remove")
    public ResponseEntity<BookingResponseDTO> removeParticipantWithPost(
            @PathVariable Long bookingId,
            @PathVariable String participantUserId,
            @Valid @RequestBody ManagePlayParticipantRequestDTO request) {
        return ResponseEntity.ok(bookingService.removeParticipantFromPlay(bookingId, participantUserId, request.hostUserId()));
    }

    /**
     * PUT /api/bookings/{bookingId}/play/split
     * Host updates participant split percentages.
     */
    @PutMapping("/{bookingId}/play/split")
    public ResponseEntity<BookingResponseDTO> updatePlaySplit(
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdatePlaySplitRequestDTO request) {
        return ResponseEntity.ok(bookingService.updatePlaySplitPercentages(bookingId, request.hostUserId(), request.splitPercentages()));
    }
}
