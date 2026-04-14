package com.pm.ownerservice.dto;

import jakarta.validation.constraints.NotBlank;

public record AddPlayParticipantRequestDTO(
        @NotBlank(message = "Host user ID is required") String hostUserId,
        @NotBlank(message = "Participant user ID is required") String participantUserId) {
}