package com.pm.ownerservice.service;

import com.pm.ownerservice.dto.CreateCenterRequest;
import com.pm.ownerservice.dto.SportCenterResponse;
import com.pm.ownerservice.dto.UpdateCenterRequest;
import com.pm.ownerservice.entity.SportCenter;
import com.pm.ownerservice.exception.ResourceNotFoundException;
import com.pm.ownerservice.exception.UnauthorizedException;
import com.pm.ownerservice.repository.SportCenterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SportCenterService {

    private final SportCenterRepository sportCenterRepository;

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
     * Create a new center
     */
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
                .capacity(request.capacity())
                .facilities(request.facilities())
                .status(SportCenter.CenterStatus.ACTIVE)
                .build();

        SportCenter savedCenter = sportCenterRepository.save(center);
        log.info("Center created successfully with ID: {}", savedCenter.getId());

        return SportCenterResponse.fromEntity(savedCenter);
    }

    /**
     * Update an existing center (with ownership verification)
     */
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
        center.setCapacity(request.capacity());
        center.setFacilities(request.facilities());

        SportCenter updatedCenter = sportCenterRepository.save(center);
        log.info("Center {} updated successfully", centerId);

        return SportCenterResponse.fromEntity(updatedCenter);
    }

    /**
     * Delete a center (with ownership verification)
     */
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
}
