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
    public static BookingResponseDTO fromEntity(Booking booking) {
        return new BookingResponseDTO(
                booking.getId(),
                booking.getUserId(),
                booking.getVenueId(),
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
