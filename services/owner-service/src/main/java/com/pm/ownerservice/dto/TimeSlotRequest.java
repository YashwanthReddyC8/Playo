package com.pm.ownerservice.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record TimeSlotRequest(
        @NotEmpty(message = "Select at least one day")
        List<@NotBlank(message = "Day cannot be blank") String> daysOfWeek,

        @NotNull(message = "Availability state is required")
        Boolean isActive,

        List<String> inactiveDates,

        @NotBlank(message = "Start time is required")
        @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Start time must be HH:MM")
        String startTime,

        @NotBlank(message = "End time is required")
        @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "End time must be HH:MM")
        String endTime,

        @NotNull(message = "Price is required")
        @Positive(message = "Price must be greater than 0")
        BigDecimal price,

        @NotNull(message = "Max players is required")
        @Positive(message = "Max players must be greater than 0")
        Integer maxPlayers) {
}