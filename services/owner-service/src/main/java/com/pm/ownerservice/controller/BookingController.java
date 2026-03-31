package com.pm.ownerservice.controller;

import com.pm.ownerservice.dto.BookingRequestDTO;
import com.pm.ownerservice.dto.BookingResponseDTO;
import com.pm.ownerservice.dto.PaymentVerificationDTO;
import com.pm.ownerservice.dto.RazorpayOrderDTO;
import com.pm.ownerservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
}
