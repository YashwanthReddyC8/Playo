package com.pm.ownerservice.dto;

import com.pm.ownerservice.entity.Booking;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Booking response
 */
public record BookingResponseDTO(
        Long id,
        String userId,
        Long venueId,
    String venueName,
    String sportName,
        LocalDate bookingDate,
        String timeSlot,
        BigDecimal amount,
        String razorpayOrderId,
        String razorpayPaymentId,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    /**
     * Convert Booking entity to BookingResponseDTO
     */
    public static BookingResponseDTO fromEntity(Booking booking, String venueName, String sportName) {
        return new BookingResponseDTO(
                booking.getId(),
                booking.getUserId(),
                booking.getVenueId(),
                venueName,
                sportName,
                booking.getBookingDate(),
                booking.getTimeSlot(),
                booking.getAmount(),
                booking.getRazorpayOrderId(),
                booking.getRazorpayPaymentId(),
                booking.getStatus().toString(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }
}
