package com.pm.ownerservice.controller;

import com.pm.ownerservice.dto.CreateCenterRequest;
import com.pm.ownerservice.dto.SportCenterResponse;
import com.pm.ownerservice.dto.UpdateCenterRequest;
import com.pm.ownerservice.security.JwtService;
import com.pm.ownerservice.service.SportCenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owners/centers")
@RequiredArgsConstructor
@Slf4j
public class SportCenterController {

    private final SportCenterService sportCenterService;
    private final JwtService jwtService;

    /**
     * GET /api/owners/centers - Get all centers for the authenticated owner
     */
    @GetMapping
    public ResponseEntity<List<SportCenterResponse>> getOwnerCenters(Authentication authentication) {
        String email = authentication.getName();
        log.info("Fetching centers for owner: {}", email);

        // For now, use email hash as ownerId. In production, extract from token or
        // database
        Long ownerId = (long) email.hashCode();

        List<SportCenterResponse> centers = sportCenterService.getCentersByOwnerId(ownerId);
        return ResponseEntity.ok(centers);
    }

    /**
     * GET /api/owners/centers/{centerId} - Get a specific center
     */
    @GetMapping("/{centerId}")
    public ResponseEntity<SportCenterResponse> getCenterById(
            @PathVariable Long centerId,
            Authentication authentication) {
        String email = authentication.getName();
        Long ownerId = (long) email.hashCode();

        log.info("Fetching center {} for owner {}", centerId, email);
        SportCenterResponse center = sportCenterService.getCenterById(centerId, ownerId);
        return ResponseEntity.ok(center);
    }

    /**
     * POST /api/owners/centers - Create a new center
     */
    @PostMapping
    public ResponseEntity<SportCenterResponse> createCenter(
            @Valid @RequestBody CreateCenterRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Long ownerId = (long) email.hashCode();

        log.info("Creating new center for owner: {}", email);
        SportCenterResponse center = sportCenterService.createCenter(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(center);
    }

    /**
     * PUT /api/owners/centers/{centerId} - Update a center
     */
    @PutMapping("/{centerId}")
    public ResponseEntity<SportCenterResponse> updateCenter(
            @PathVariable Long centerId,
            @Valid @RequestBody UpdateCenterRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Long ownerId = (long) email.hashCode();

        log.info("Updating center {} for owner {}", centerId, email);
        SportCenterResponse center = sportCenterService.updateCenter(centerId, request, ownerId);
        return ResponseEntity.ok(center);
    }

    /**
     * DELETE /api/owners/centers/{centerId} - Delete a center
     */
    @DeleteMapping("/{centerId}")
    public ResponseEntity<Void> deleteCenter(
            @PathVariable Long centerId,
            Authentication authentication) {
        String email = authentication.getName();
        Long ownerId = (long) email.hashCode();

        log.info("Deleting center {} for owner {}", centerId, email);
        sportCenterService.deleteCenter(centerId, ownerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/owners/centers/search/city?city={city} - Get centers by city
     */
    @GetMapping("/search/city")
    public ResponseEntity<List<SportCenterResponse>> getCentersByCity(@RequestParam String city) {
        log.info("Searching centers in city: {}", city);
        List<SportCenterResponse> centers = sportCenterService.getCentersByCity(city);
        return ResponseEntity.ok(centers);
    }

    /**
     * GET /api/owners/centers/public/all - Get all centers (public, no auth
     * required)
     */
    @GetMapping("/public/all")
    public ResponseEntity<List<SportCenterResponse>> getAllCentersPublic() {
        log.info("Fetching all centers (public)");
        List<SportCenterResponse> centers = sportCenterService.getAllCenters();
        return ResponseEntity.ok(centers);
    }
}
