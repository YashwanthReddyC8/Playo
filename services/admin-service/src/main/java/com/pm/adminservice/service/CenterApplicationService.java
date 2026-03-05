package com.pm.adminservice.service;

import com.pm.adminservice.dto.CenterApplicationRequest;
import com.pm.adminservice.dto.CenterApplicationResponse;
import com.pm.adminservice.model.ApplicationStatus;
import com.pm.adminservice.model.SportsCenterApplication;
import com.pm.adminservice.repository.SportsCenterApplicationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CenterApplicationService {

    private final SportsCenterApplicationRepository repository;

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
    public List<CenterApplicationResponse> getAllApplications() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CenterApplicationResponse approveApplication(Long applicationId) {
        SportsCenterApplication application = repository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Application not found"));

        application.setStatus(ApplicationStatus.APPROVED);
        return toResponse(repository.save(application));
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
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }
}
