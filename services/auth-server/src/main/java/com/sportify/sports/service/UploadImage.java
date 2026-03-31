package com.sportify.sports.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UploadImage {

    private final Cloudinary cloudinary;
    private final UserRepository userRepository;

    public String replaceProfileImage(MultipartFile file, String email) {

        try {

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 1️⃣ Delete old image if exists
            if (user.getProfileId() != null) {
                cloudinary.uploader().destroy(
                        user.getProfileId(),
                        ObjectUtils.emptyMap());
            }

            // 2️⃣ Upload new image
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "profile_photos",
                            "resource_type", "image"));

            String publicId = uploadResult.get("public_id").toString();
            String imageUrl = uploadResult.get("secure_url").toString();

            // 3️⃣ Save new values in DB
            user.setProfileId(publicId);
            user.setProfileLink(imageUrl);
            userRepository.save(user);

            return imageUrl;

        } catch (Exception e) {
            throw new RuntimeException("Image replacement failed");
        }
    }
}
