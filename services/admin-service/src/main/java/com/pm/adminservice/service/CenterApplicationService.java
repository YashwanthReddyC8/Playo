package com.pm.adminservice.service;

import com.pm.adminservice.dto.CenterApplicationRequest;
import com.pm.adminservice.dto.CenterApplicationResponse;
import com.pm.adminservice.dto.UpdateApplicationStatusRequest;
import com.pm.adminservice.model.ApplicationStatus;
import com.pm.adminservice.model.SportsCenterApplication;
import com.pm.adminservice.repository.SportsCenterApplicationRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CenterApplicationService {

    private final SportsCenterApplicationRepository repository;
    private final OwnerAccountService ownerAccountService;

    @Transactional
    public CenterApplicationResponse createApplication(CenterApplicationRequest request) {
        SportsCenterApplication application = new SportsCenterApplication();
        application.setName(request.name());
        application.setEmail(request.email());
        application.setPhoneNumber(request.phoneNumber());
        application.setSportsCenterName(request.sportsCenterName());
        application.setStreetAddress(request.streetAddress());
        application.setCity(request.city());
        application.setState(request.state());
        application.setZipCode(request.zipCode());
        application.setDigiPin(request.digiPin());
        application.setGoogleMapLink(request.googleMapLink());
        application.setCenterDescription(request.centerDescription());
        application.setBusinessEmail(request.businessEmail());
        application.setBusinessPhoneNumber(request.businessPhoneNumber());
        application.setFacebookUrl(request.facebookUrl());
        application.setTwitterUrl(request.twitterUrl());
        application.setInstagramUrl(request.instagramUrl());
        application.setLinkedInUrl(request.linkedInUrl());
        application.setStatus(ApplicationStatus.PENDING);

        return toResponse(repository.save(application));
    }

    @Transactional(readOnly = true)
    public Page<CenterApplicationResponse> getAllApplications(
            int page,
            int size,
            ApplicationStatus status,
            String city,
            LocalDate fromDate,
            LocalDate toDate,
            String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<SportsCenterApplication> spec = buildFilterSpec(status, city, fromDate, toDate, search);

        return repository.findAll(spec, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CenterApplicationResponse getApplicationById(Long applicationId) {
        SportsCenterApplication application = repository.findOne(
                byId(applicationId).and(notDeleted()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Application not found"));

        return toResponse(application);
    }

    @Transactional
    public CenterApplicationResponse updateApplicationStatus(
            Long applicationId,
            UpdateApplicationStatusRequest request,
            String reviewer) {
        if (request.status() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "status is required");
        }

        if (request.status() != ApplicationStatus.APPROVED && request.status() != ApplicationStatus.REJECTED) {
            throw new ResponseStatusException(BAD_REQUEST, "status must be APPROVED or REJECTED");
        }

        SportsCenterApplication application = repository.findOne(
                byId(applicationId).and(notDeleted()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Application not found"));

        application.setStatus(request.status());
        application.setReviewNotes(request.reviewNotes());
        application.setReviewedBy(reviewer);
        application.setReviewedAt(Instant.now());

        repository.save(application);

        // Send emails based on status
        if (request.status() == ApplicationStatus.APPROVED) {
            // Create OWNER account if not exists
            ownerAccountService.createOrUpdateOwnerAccount(
                    application.getEmail(),
                    application.getName(),
                    application.getPhoneNumber());

            // Send password reset email
            ownerAccountService.sendPasswordResetEmail(
                    application.getEmail(),
                    application.getName());

            // Send approval notification
            ownerAccountService.sendApprovalEmail(
                    application.getEmail(),
                    application.getSportsCenterName(),
                    application.getName());
        } else if (request.status() == ApplicationStatus.REJECTED) {
            // Send rejection notification
            ownerAccountService.sendRejectionEmail(
                    application.getEmail(),
                    application.getSportsCenterName(),
                    application.getName(),
                    request.reviewNotes());
        }

        return toResponse(repository.save(application));
    }

    @Transactional
    public void softDeleteApplication(Long applicationId, String deletedBy) {
        SportsCenterApplication application = repository.findOne(
                byId(applicationId).and(notDeleted()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Application not found"));

        application.setDeletedAt(Instant.now());
        application.setDeletedBy(deletedBy);
        repository.save(application);
    }

    @Transactional
    public CenterApplicationResponse approveApplication(Long applicationId, String reviewer) {
        // Get the application
        SportsCenterApplication application = repository.findOne(
                byId(applicationId).and(notDeleted()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Application not found"));

        // 1. Create OWNER account if not exists
        ownerAccountService.createOrUpdateOwnerAccount(
                application.getEmail(),
                application.getName(),
                application.getPhoneNumber());

        // 2. Send password reset email to set up account
        ownerAccountService.sendPasswordResetEmail(
                application.getEmail(),
                application.getName());

        // 3. Send approval notification
        ownerAccountService.sendApprovalEmail(
                application.getEmail(),
                application.getSportsCenterName(),
                application.getName());

        // 4. Update application status to APPROVED
        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedBy(reviewer);
        application.setReviewedAt(Instant.now());

        return toResponse(repository.save(application));
    }

    private Specification<SportsCenterApplication> buildFilterSpec(
            ApplicationStatus status,
            String city,
            LocalDate fromDate,
            LocalDate toDate,
            String search) {
        Specification<SportsCenterApplication> spec = notDeleted();

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (city != null && !city.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("city")), city.toLowerCase()));
        }

        if (fromDate != null) {
            Instant fromInstant = fromDate.atStartOfDay().toInstant(ZoneOffset.UTC);
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant));
        }

        if (toDate != null) {
            Instant toInstant = toDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("createdAt"), toInstant));
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("sportsCenterName")), pattern),
                    cb.like(cb.lower(root.get("phoneNumber")), pattern)));
        }

        return spec;
    }

    private Specification<SportsCenterApplication> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private Specification<SportsCenterApplication> byId(Long applicationId) {
        return (root, query, cb) -> cb.equal(root.get("id"), applicationId);
    }

    @Transactional(readOnly = true)
    public List<CenterApplicationResponse> getAllApplications() {
        return repository.findAll(notDeleted()).stream()
                .map(this::toResponse)
                .toList();
    }

    private CenterApplicationResponse toResponse(SportsCenterApplication application) {
        return new CenterApplicationResponse(
                application.getId(),
                application.getName(),
                application.getEmail(),
                application.getPhoneNumber(),
                application.getSportsCenterName(),
                application.getStreetAddress(),
                application.getCity(),
                application.getState(),
                application.getZipCode(),
                application.getDigiPin(),
                application.getGoogleMapLink(),
                application.getCenterDescription(),
                application.getBusinessEmail(),
                application.getBusinessPhoneNumber(),
                application.getFacebookUrl(),
                application.getTwitterUrl(),
                application.getInstagramUrl(),
                application.getLinkedInUrl(),
                application.getStatus(),
                application.getReviewNotes(),
                application.getReviewedBy(),
                application.getReviewedAt(),
                application.getCreatedAt(),
                application.getUpdatedAt(),
                application.getDeletedBy(),
                application.getDeletedAt());
    }
}
