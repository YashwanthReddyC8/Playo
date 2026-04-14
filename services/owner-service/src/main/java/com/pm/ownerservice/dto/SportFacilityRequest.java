package com.pm.ownerservice.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SportFacilityRequest(
        @NotBlank(message = "Sport type is required") String sportType,

        @NotNull(message = "Total courts is required")
        @Positive(message = "Total courts must be greater than 0")
        Integer totalCourts,

        @Valid List<TimeSlotRequest> slots) {
}