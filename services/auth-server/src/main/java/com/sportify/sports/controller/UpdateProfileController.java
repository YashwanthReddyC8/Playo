package com.sportify.sports.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.repository.UserRepository;
import com.sportify.sports.service.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/update")
@RequiredArgsConstructor
public class UpdateProfileController {

    @Autowired
    private final UploadImage imageUploadService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final Cloudinary cloudinary;

    @PostMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "name", required = false) String name) {
        try {
            // Get current user from Security Context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            // Fetch user from DB
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String imageUrl = user.getProfileLink();
            // Upload to Cloudinary
            if (file != null && !file.isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "playo/profiles",
                                "resource_type", "auto",
                                "public_id", "profile_" + user.getId(),
                                "overwrite", true));

                imageUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                // Save to user
                user.setProfileLink(imageUrl);
                user.setProfileId(publicId);
            }
            // Update name
            if (name != null && !name.isBlank()) {
                user.setName(name);
            }
            userRepository.save(user);

            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        }
    }
}
