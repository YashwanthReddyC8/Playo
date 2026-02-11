package com.sportify.sports.auth;

import com.sportify.sports.dto.AuthRequest;
import com.sportify.sports.dto.AuthResponse;
import com.sportify.sports.dto.RegisterRequest;
import com.sportify.sports.entity.Role;
import com.sportify.sports.entity.User;
import com.sportify.sports.repository.UserRepository;
import com.sportify.sports.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
}
