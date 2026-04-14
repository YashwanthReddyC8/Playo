package com.pm.ownerservice.dto;

import jakarta.validation.constraints.NotBlank;

public record AcceptPlayInviteRequestDTO(
        @NotBlank(message = "User ID is required") String userId,
        String email) {
}