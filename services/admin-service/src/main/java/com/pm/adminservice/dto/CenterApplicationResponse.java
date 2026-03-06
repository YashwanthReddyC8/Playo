package com.pm.adminservice.dto;

import com.pm.adminservice.model.ApplicationStatus;
import java.time.Instant;

public record CenterApplicationResponse(
        Long id,
        String name,
        String email,
        String phoneNumber,
        String sportsCenterName,
        String streetAddress,
        String city,
        String state,
        String zipCode,
        String digiPin,
        String googleMapLink,
        String centerDescription,
        String businessEmail,
        String businessPhoneNumber,
        String facebookUrl,
        String twitterUrl,
        String instagramUrl,
        String linkedInUrl,
        ApplicationStatus status,
        String reviewNotes,
        String reviewedBy,
        Instant reviewedAt,
        Instant createdAt,
        Instant updatedAt,
        String deletedBy,
        Instant deletedAt
) {
}

