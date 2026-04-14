package com.pm.ownerservice.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinPlaySessionRequestDTO(
        @NotBlank(message = "User ID is required") String userId,
        String joinCode,
        String email) {
}