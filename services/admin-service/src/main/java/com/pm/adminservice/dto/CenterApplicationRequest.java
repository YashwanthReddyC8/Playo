package com.pm.adminservice.dto;

public record CenterApplicationRequest(
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
        String linkedInUrl
) {
}
