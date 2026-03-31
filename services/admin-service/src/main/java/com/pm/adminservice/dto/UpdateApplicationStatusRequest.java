package com.pm.adminservice.dto;

import com.pm.adminservice.model.ApplicationStatus;

public record UpdateApplicationStatusRequest(
        ApplicationStatus status,
        String reviewNotes
) {
}
