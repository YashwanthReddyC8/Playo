package com.pm.ownerservice.dto;

import com.pm.ownerservice.entity.SportCenter;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record SportCenterResponse(
        Long id,
        Long ownerId,
        String name,
        String description,
        String address,
        String city,
        String state,
        String postalCode,
        Double latitude,
        Double longitude,
        String phoneNumber,
        String email,
        String imageUrl,
        List<String> inactiveDates,
        Integer totalCourts,
        List<SportFacilityResponse> facilities,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    public static SportCenterResponse fromEntity(SportCenter center) {
        List<SportFacilityResponse> facilityResponses = center.getFacilities()
            .stream()
            .map(SportFacilityResponse::fromEntity)
            .toList();

        return new SportCenterResponse(
                center.getId(),
                center.getOwnerId(),
                center.getName(),
                center.getDescription(),
                center.getAddress(),
                center.getCity(),
                center.getState(),
                center.getPostalCode(),
                center.getLatitude(),
                center.getLongitude(),
                center.getPhoneNumber(),
                center.getEmail(),
                center.getImageUrl(),
                center.getInactiveDates() == null || center.getInactiveDates().isBlank()
                    ? List.of()
                    : Arrays.stream(center.getInactiveDates().split(","))
                        .map(String::trim)
                        .filter(date -> !date.isEmpty())
                        .toList(),
                center.getTotalCourts(),
                facilityResponses,
                center.getStatus().toString(),
                center.getCreatedAt(),
                center.getUpdatedAt());
    }
}
