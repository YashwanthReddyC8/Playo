package com.pm.ownerservice.dto;

import com.pm.ownerservice.entity.SportCenter;
import java.time.LocalDateTime;

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
        Integer capacity,
        String facilities,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    public static SportCenterResponse fromEntity(SportCenter center) {
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
                center.getCapacity(),
                center.getFacilities(),
                center.getStatus().toString(),
                center.getCreatedAt(),
                center.getUpdatedAt());
    }
}
