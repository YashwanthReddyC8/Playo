package com.pm.ownerservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

/**
 * DTO for creating a booking order
 */
public record BookingRequestDTO(
        @NotBlank(message = "User ID is required") String userId,

        @NotNull(message = "Venue ID is required") Long venueId,

        @NotNull(message = "Booking date is required") @FutureOrPresent(message = "Booking date must be in the future or today") LocalDate bookingDate,

        @NotBlank(message = "Time slot is required") @Pattern(regexp = "\\d{2}:\\d{2}-\\d{2}:\\d{2}", message = "Time slot format must be HH:MM-HH:MM") String timeSlot,

        @NotBlank(message = "Sport name is required") String sportName,

        Long facilityId,

        Long timeSlotId,

        @NotNull(message = "Amount is required") @Positive(message = "Amount must be greater than 0") BigDecimal amount) {
}
