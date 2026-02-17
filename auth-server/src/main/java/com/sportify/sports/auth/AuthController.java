package com.sportify.sports.auth;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sportify.sports.dto.AuthRequest;
import com.sportify.sports.dto.AuthResponse;
import com.sportify.sports.dto.RegisterRequest;
import com.sportify.sports.entity.Role;
import com.sportify.sports.entity.User;
import com.sportify.sports.repository.UserRepository;
import com.sportify.sports.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        @Autowired
        private final UserRepository userRepository;
        @Autowired
        private final PasswordEncoder passwordEncoder;
        @Autowired
        private final AuthenticationManager authManager;
        @Autowired
        private final JwtService jwtService;
        @Autowired
        private final Cloudinary cloudinary;

        @PostMapping("/register")
        public AuthResponse register(@RequestBody RegisterRequest request) {

                // 1️⃣ Check if email already exists
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already registered");
                }

                // 2️⃣ Create user
                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(Role.ADMIN) // default role
                                .build();

                // 3️⃣ Save to DB
                userRepository.save(user);

                // 4️⃣ Generate JWT
                String token = jwtService.generateToken(user.getEmail());

                AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                                user.getName(),
                                user.getEmail(),
                                user.getRole(),
                                user.getProfileLink(),
                                user.getPhone());

                return new AuthResponse(token, userDto);
        }

        @PostMapping("/login")
        public AuthResponse login(@RequestBody AuthRequest request) {
                System.out.println("DEBUG: Login request received for " + request.getEmail());

                authManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                // fetch full user from DB
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String token = jwtService.generateToken(user.getEmail());

                AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                                user.getName(),
                                user.getEmail(),
                                user.getRole(),
                                user.getProfileLink(),
                                user.getPhone());
                return new AuthResponse(token, userDto);
        }

        @PostMapping("/profile-image")
        public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file) {
                try {
                        // Get current user from Security Context
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        String email = auth.getName();

                        // Fetch user from DB
                        User user = userRepository.findByEmail(email)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        // Upload to Cloudinary
                        Map uploadResult = cloudinary.uploader().upload(
                                        file.getBytes(),
                                        ObjectUtils.asMap(
                                                "folder", "playo/profiles",
                                                "resource_type", "auto",
                                                "public_id", "profile_" + user.getId(),
                                                "overwrite", true
                        ));

                        String imageUrl = (String) uploadResult.get("secure_url");
                        String publicId = (String) uploadResult.get("public_id");

                        // Save to user
                        user.setProfileLink(imageUrl);
                        user.setProfileId(publicId);
                        userRepository.save(user);

                        return ResponseEntity.ok(imageUrl);

                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to upload image: " + e.getMessage());
                }
        }
}
