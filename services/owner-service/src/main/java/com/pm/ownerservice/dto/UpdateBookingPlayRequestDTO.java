package com.pm.ownerservice.dto;

import jakarta.validation.constraints.Min;

public record UpdateBookingPlayRequestDTO(
        String playVisibility,
        @Min(value = 2, message = "Max players must be at least 2") Integer maxPlayers) {
}