package com.pm.adminservice.controller;

import com.pm.adminservice.dto.CenterApplicationRequest;
import com.pm.adminservice.dto.CenterApplicationResponse;
import com.pm.adminservice.dto.UpdateApplicationStatusRequest;
import com.pm.adminservice.model.ApplicationStatus;
import com.pm.adminservice.service.CenterApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CenterApplicationController {

    private final CenterApplicationService service;

    @PostMapping("/public/center-applications")
    @ResponseStatus(HttpStatus.CREATED)
    public CenterApplicationResponse submitApplication(@RequestBody CenterApplicationRequest request) {
        return service.createApplication(request);
    }

    @GetMapping("/admin/center-applications")
    public Page<CenterApplicationResponse> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search
    ) {
        return service.getAllApplications(page, size, status, city, fromDate, toDate, search);
    }

    @GetMapping("/admin/center-applications/{applicationId}")
    public CenterApplicationResponse getApplicationById(@PathVariable Long applicationId) {
        return service.getApplicationById(applicationId);
    }

    @PatchMapping("/admin/center-applications/{applicationId}/status")
    public CenterApplicationResponse updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody UpdateApplicationStatusRequest request,
            Principal principal
    ) {
        return service.updateApplicationStatus(applicationId, request, principal.getName());
    }

    @DeleteMapping("/admin/center-applications/{applicationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteApplication(@PathVariable Long applicationId, Principal principal) {
        service.softDeleteApplication(applicationId, principal.getName());
    }

    @PutMapping("/admin/center-applications/{applicationId}/approve")
    public CenterApplicationResponse approveApplication(@PathVariable Long applicationId, Principal principal) {
        return service.approveApplication(applicationId, principal.getName());
    }
}
