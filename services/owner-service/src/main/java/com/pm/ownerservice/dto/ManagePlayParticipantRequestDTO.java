package com.pm.ownerservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ManagePlayParticipantRequestDTO(
        @NotBlank(message = "Host user ID is required") String hostUserId) {
}