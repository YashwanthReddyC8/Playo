package com.pm.ownerservice.dto;

import com.pm.ownerservice.entity.Booking;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
        String hostUserId,
        List<String> participantUserIds,
        Map<String, BigDecimal> paymentSplitPercentages,
        List<String> pendingInviteUserIds,
        List<String> pendingJoinRequestUserIds,
        Boolean playEnabled,
        String playVisibility,
        Integer maxPlayers,
        Integer joinedPlayers,
        BigDecimal splitAmount,
        String joinCode,
        String joinLink,
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
                booking.getUserId(),
                List.of(),
                Map.of(),
                List.of(),
                List.of(),
                booking.getPlayEnabled(),
                booking.getPlayVisibility() != null ? booking.getPlayVisibility().name() : null,
                booking.getMaxPlayers(),
                booking.getJoinedPlayers(),
                booking.getSplitAmount(),
                booking.getJoinCode(),
                null,
                booking.getRazorpayOrderId(),
                booking.getRazorpayPaymentId(),
                booking.getStatus().toString(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }
}
