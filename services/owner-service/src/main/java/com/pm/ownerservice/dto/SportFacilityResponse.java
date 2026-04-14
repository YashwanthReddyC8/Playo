package com.pm.ownerservice.dto;

import com.pm.ownerservice.entity.SportFacility;

import java.time.LocalDateTime;
import java.util.List;

public record SportFacilityResponse(
        Long id,
        String sportType,
        Integer totalCourts,
        List<TimeSlotResponse> slots,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static SportFacilityResponse fromEntity(SportFacility facility) {
                List<TimeSlotResponse> slotResponses = facility.getTimeSlots()
                .stream()
                .map(TimeSlotResponse::fromEntity)
                .toList();

        return new SportFacilityResponse(
                facility.getId(),
                facility.getSportType(),
                facility.getTotalCourts(),
                slotResponses,
                facility.getCreatedAt(),
                facility.getUpdatedAt());
    }
}