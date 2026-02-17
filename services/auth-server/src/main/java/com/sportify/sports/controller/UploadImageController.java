package com.sportify.sports.controller;

import com.sportify.sports.entity.User;
import com.sportify.sports.repository.UserRepository;
import com.sportify.sports.security.CustomUserPrincipal;
import com.sportify.sports.service.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadImageController {

    @Autowired
    private final UploadImage imageUploadService;
    @Autowired
    private final UserRepository userRepository;

    @PostMapping("/profile1")
    public ResponseEntity<String> upload() {
        return ResponseEntity.ok("Reached controller");
    }

    @PostMapping("/profile")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            System.out.println("Principal: " + principal);
            System.out.println("File: " + file.getOriginalFilename());
            if (file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "File is required"));
            }

            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Only image files allowed"));
            }

            if (file.getSize() > 2_000_000) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Image must be under 2MB"));
            }

            String imageUrl = imageUploadService
                    .replaceProfileImage(file, principal.getUsername());

            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            e.printStackTrace(); // VERY IMPORTANT
            return ResponseEntity.internalServerError().body("Upload failed");
        }
    }

    // @GetMapping("/profile")
    // public ResponseEntity<?> getProfile(
    // @AuthenticationPrincipal CustomUserPrincipal principal
    // ) {
    // return ResponseEntity.ok(principal.getUser());
    // }

}
