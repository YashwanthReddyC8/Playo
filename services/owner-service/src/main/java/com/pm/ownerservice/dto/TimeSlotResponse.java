package com.pm.ownerservice.dto;

import com.pm.ownerservice.entity.TimeSlot;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record TimeSlotResponse(
        Long id,
    List<String> daysOfWeek,
    Boolean isActive,
        List<String> inactiveDates,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal price,
        Integer maxPlayers,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static TimeSlotResponse fromEntity(TimeSlot timeSlot) {
        return new TimeSlotResponse(
                timeSlot.getId(),
        Arrays.stream(timeSlot.getDaysOfWeek().split(","))
            .map(String::trim)
            .filter(day -> !day.isEmpty())
            .toList(),
        timeSlot.getIsActive(),
        timeSlot.getInactiveDates() == null || timeSlot.getInactiveDates().isBlank()
            ? List.of()
            : Arrays.stream(timeSlot.getInactiveDates().split(","))
                .map(String::trim)
                .filter(date -> !date.isEmpty())
                .toList(),
                timeSlot.getStartTime(),
                timeSlot.getEndTime(),
                timeSlot.getPrice(),
                timeSlot.getMaxPlayers(),
                timeSlot.getCreatedAt(),
                timeSlot.getUpdatedAt());
    }
}