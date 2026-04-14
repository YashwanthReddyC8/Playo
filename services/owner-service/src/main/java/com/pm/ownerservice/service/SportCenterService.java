package com.pm.ownerservice.service;

import com.pm.ownerservice.dto.CreateCenterRequest;
import com.pm.ownerservice.dto.SportFacilityRequest;
import com.pm.ownerservice.dto.SportCenterResponse;
import com.pm.ownerservice.dto.UpdateCenterRequest;
import com.pm.ownerservice.entity.SportCenter;
import com.pm.ownerservice.entity.SportFacility;
import com.pm.ownerservice.entity.TimeSlot;
import com.pm.ownerservice.exception.ResourceNotFoundException;
import com.pm.ownerservice.exception.UnauthorizedException;
import com.pm.ownerservice.repository.SportFacilityRepository;
import com.pm.ownerservice.repository.SportCenterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SportCenterService {

    private final SportCenterRepository sportCenterRepository;
    private final SportFacilityRepository sportFacilityRepository;

    /**
     * Get all centers for an owner
     */
    public List<SportCenterResponse> getCentersByOwnerId(Long ownerId) {
        log.info("Fetching centers for owner: {}", ownerId);
        return sportCenterRepository.findByOwnerId(ownerId)
                .stream()
                .map(SportCenterResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific center by ID (with ownership verification)
     */
    public SportCenterResponse getCenterById(Long centerId, Long ownerId) {
        log.info("Fetching center {} for owner {}", centerId, ownerId);
        SportCenter center = sportCenterRepository.findByIdAndOwnerId(centerId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Center not found or access denied"));
        return SportCenterResponse.fromEntity(center);
    }

    /**
     * Get a specific center by ID for public/customer access
     */
    public SportCenterResponse getPublicCenterById(Long centerId) {
        log.info("Fetching center {} for public access", centerId);
        SportCenter center = sportCenterRepository.findById(centerId)
                .orElseThrow(() -> new ResourceNotFoundException("Center not found"));
        return SportCenterResponse.fromEntity(center);
    }

    /**
     * Create a new center
     */
    @Transactional
    @CacheEvict(value = {"sportCenterNames", "facilityNames"}, allEntries = true)
    public SportCenterResponse createCenter(CreateCenterRequest request, Long ownerId) {
        log.info("Creating new center for owner: {}", ownerId);

        SportCenter center = SportCenter.builder()
                .ownerId(ownerId)
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .phoneNumber(request.phoneNumber())
                .email(request.email())
                .imageUrl(request.imageUrl())
                .inactiveDates(joinDates(request.inactiveDates()))
                .totalCourts(resolveTotalCourts(request.facilities()))
                .status(SportCenter.CenterStatus.ACTIVE)
                .build();

        SportCenter savedCenter = sportCenterRepository.save(center);

            attachFacilities(savedCenter, request.facilities());
            savedCenter = sportCenterRepository.save(savedCenter);

        log.info("Center created successfully with ID: {}", savedCenter.getId());

        return SportCenterResponse.fromEntity(savedCenter);
    }

    /**
     * Update an existing center (with ownership verification)
     */
    @Transactional
    @CacheEvict(value = {"sportCenterNames", "facilityNames"}, allEntries = true)
    public SportCenterResponse updateCenter(Long centerId, UpdateCenterRequest request, Long ownerId) {
        log.info("Updating center {} for owner {}", centerId, ownerId);

        SportCenter center = sportCenterRepository.findByIdAndOwnerId(centerId, ownerId)
                .orElseThrow(() -> new UnauthorizedException("You don't have permission to update this center"));

        center.setName(request.name());
        center.setDescription(request.description());
        center.setAddress(request.address());
        center.setCity(request.city());
        center.setState(request.state());
        center.setPostalCode(request.postalCode());
        center.setLatitude(request.latitude());
        center.setLongitude(request.longitude());
        center.setPhoneNumber(request.phoneNumber());
        center.setEmail(request.email());
        center.setImageUrl(request.imageUrl());
        center.setInactiveDates(joinDates(request.inactiveDates()));
        center.setTotalCourts(resolveTotalCourts(request.facilities()));
        center.getFacilities().clear();
        attachFacilities(center, request.facilities());

        SportCenter updatedCenter = sportCenterRepository.save(center);
        log.info("Center {} updated successfully", centerId);

        return SportCenterResponse.fromEntity(updatedCenter);
    }

    /**
     * Delete a center (with ownership verification)
     */
    @Transactional
    @CacheEvict(value = {"sportCenterNames", "facilityNames"}, allEntries = true)
    public void deleteCenter(Long centerId, Long ownerId) {
        log.info("Deleting center {} for owner {}", centerId, ownerId);

        SportCenter center = sportCenterRepository.findByIdAndOwnerId(centerId, ownerId)
                .orElseThrow(() -> new UnauthorizedException("You don't have permission to delete this center"));

        sportCenterRepository.delete(center);
        log.info("Center {} deleted successfully", centerId);
    }

    /**
     * Get centers by city
     */
    public List<SportCenterResponse> getCentersByCity(String city) {
        log.info("Fetching centers in city: {}", city);
        return sportCenterRepository.findByCity(city)
                .stream()
                .map(SportCenterResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all centers (public - no ownership filtering)
     */
    public List<SportCenterResponse> getAllCenters() {
        log.info("Fetching all centers");
        return sportCenterRepository.findAll()
                .stream()
                .map(SportCenterResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "sportCenterNames", key = "#centerId")
    public String getCenterNameById(Long centerId) {
        return sportCenterRepository.findById(centerId)
                .map(SportCenter::getName)
                .orElse("Unknown Venue");
    }

    public boolean isCenterInactiveOnDate(Long centerId, LocalDate date) {
        if (centerId == null || date == null) {
            return false;
        }

        return sportCenterRepository.findById(centerId)
                .map(SportCenter::getInactiveDates)
                .filter(rawDates -> rawDates != null && !rawDates.isBlank())
                .map(rawDates -> Arrays.stream(rawDates.split(","))
                        .map(String::trim)
                        .anyMatch(rawDate -> rawDate.equals(date.toString())))
                .orElse(false);
    }

    @Cacheable(value = "facilityNames", key = "#facilityId")
    public String getFacilitySportName(Long facilityId) {
        return sportFacilityRepository.findById(facilityId)
                .map(SportFacility::getSportType)
                .orElse("Unknown Sport");
    }

    private Integer resolveTotalCourts(List<SportFacilityRequest> facilities) {
        if (facilities == null || facilities.isEmpty()) {
            return 1;
        }

        int totalCourts = facilities.stream()
                .map(SportFacilityRequest::totalCourts)
                .filter(count -> count != null && count > 0)
                .mapToInt(Integer::intValue)
                .sum();

        return totalCourts > 0 ? totalCourts : 1;
    }

    private void attachFacilities(SportCenter center, List<SportFacilityRequest> facilities) {
        List<SportFacility> managedFacilities = center.getFacilities();
        managedFacilities.clear();

        if (facilities == null || facilities.isEmpty()) {
            return;
        }

        for (SportFacilityRequest facilityRequest : facilities) {
            SportFacility facility = SportFacility.builder()
                    .sportCenter(center)
                    .sportType(facilityRequest.sportType())
                    .totalCourts(facilityRequest.totalCourts())
                    .build();

            List<TimeSlot> slotEntities = new ArrayList<>();
            if (facilityRequest.slots() != null) {
                for (var slotRequest : facilityRequest.slots()) {
                    TimeSlot slot = TimeSlot.builder()
                            .sportFacility(facility)
                            .daysOfWeek(joinDaysOfWeek(slotRequest.daysOfWeek()))
                            .isActive(Boolean.TRUE.equals(slotRequest.isActive()))
                            .inactiveDates(joinDates(slotRequest.inactiveDates()))
                            .startTime(LocalTime.parse(slotRequest.startTime()))
                            .endTime(LocalTime.parse(slotRequest.endTime()))
                            .price(slotRequest.price())
                            .maxPlayers(slotRequest.maxPlayers())
                            .build();
                    slotEntities.add(slot);
                }
            }

            facility.setTimeSlots(slotEntities);
            managedFacilities.add(facility);
        }
    }

    private String joinDaysOfWeek(List<String> daysOfWeek) {
        if (daysOfWeek == null || daysOfWeek.isEmpty()) {
            return "MONDAY";
        }

        StringJoiner joiner = new StringJoiner(",");
        daysOfWeek.stream()
                .filter(day -> day != null && !day.isBlank())
                .map(String::trim)
                .map(String::toUpperCase)
                .sorted(Comparator.naturalOrder())
                .forEach(joiner::add);
        String joined = joiner.toString();
        return joined.isBlank() ? "MONDAY" : joined;
    }

    private String joinDates(List<String> dates) {
        if (dates == null || dates.isEmpty()) {
            return "";
        }

        return dates.stream()
                .filter(date -> date != null && !date.isBlank())
                .map(String::trim)
                .sorted()
                .collect(Collectors.joining(","));
    }
}
