package com.pm.adminservice.controller;

import com.pm.adminservice.dto.CenterApplicationRequest;
import com.pm.adminservice.dto.CenterApplicationResponse;
import com.pm.adminservice.service.CenterApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
    public List<CenterApplicationResponse> getAllApplications() {
        return service.getAllApplications();
    }

    @PutMapping("/admin/center-applications/{applicationId}/approve")
    public CenterApplicationResponse approveApplication(@PathVariable Long applicationId) {
        return service.approveApplication(applicationId);
    }
}
