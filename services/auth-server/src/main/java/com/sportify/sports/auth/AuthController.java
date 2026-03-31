package com.sportify.sports.auth;

import com.sportify.sports.dto.AuthRequest;
import com.sportify.sports.dto.AuthResponse;
import com.sportify.sports.dto.ChangePasswordRequest;
import com.sportify.sports.dto.ErrorResponse;
import com.sportify.sports.dto.RegisterRequest;
import com.sportify.sports.dto.SuccessResponse;
import com.sportify.sports.dto.SendOtpRequest;
import com.sportify.sports.dto.VerifyOtpRequest;
import com.sportify.sports.dto.OtpResponse;
import com.sportify.commonmodels.entity.Role;
import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.repository.UserRepository;
import com.sportify.sports.security.JwtService;
import com.sportify.sports.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
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
        private final OtpService otpService;

        @PostMapping("/register")
        public AuthResponse register(@RequestBody RegisterRequest request) {

                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already registered");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(Role.USER)
                                .build();

                userRepository.save(user);

                String token = jwtService.generateToken(user.getEmail(), user.getName(), user.getRole().name());

                AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole(),
                                user.getProfileLink(),
                                user.getPhone());

                return new AuthResponse(token, userDto);
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(
                        @RequestBody AuthRequest request) {
                try {
                        authManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getEmail(),
                                                        request.getPassword()));

                        User user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        String token = jwtService.generateToken(user.getEmail(), user.getName(), user.getRole().name());

                        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                                        user.getId(),
                                        user.getName(),
                                        user.getEmail(),
                                        user.getRole(),
                                        user.getProfileLink(),
                                        user.getPhone());
                        return ResponseEntity.ok(new AuthResponse(token, userDto));

                } catch (BadCredentialsException e) {
                        throw new BadCredentialsException("Invalid email or password", e);
                } catch (UsernameNotFoundException e) {
                        throw new UsernameNotFoundException("Invalid email or password");
                } catch (RuntimeException e) {
                        throw e;
                }
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout() {
                return ResponseEntity.ok("Logged out successfully");
        }

        /**
         * Send OTP to email for registration
         * POST /api/auth/send-otp
         */
        @PostMapping("/send-otp")
        public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
                try {
                        otpService.sendOtp(request.getEmail());
                        return ResponseEntity.ok(new OtpResponse(
                                        true,
                                        "OTP sent to " + request.getEmail(),
                                        300 // 5 minutes
                        ));
                } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                        .body(new OtpResponse(false, e.getMessage(), null));
                }
        }

        /**
         * Verify OTP and complete registration
         * POST /api/auth/verify-otp
         */
        @PostMapping("/verify-otp")
        public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
                try {
                        // Verify OTP
                        otpService.verifyOtp(request.getEmail(), request.getOtp());

                        // Check if user already exists
                        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                                return ResponseEntity.badRequest()
                                                .body(new OtpResponse(false, "Email already registered", null));
                        }

                        // Create user
                        User user = User.builder()
                                        .name(request.getName())
                                        .email(request.getEmail())
                                        .password(passwordEncoder.encode(request.getPassword()))
                                        .phone(request.getPhone())
                                        .role(Role.USER)
                                        .build();

                        userRepository.save(user);

                        // Generate token
                        String token = jwtService.generateToken(user.getEmail(), user.getName(), user.getRole().name());

                        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                                        user.getId(),
                                        user.getName(),
                                        user.getEmail(),
                                        user.getRole(),
                                        user.getProfileLink(),
                                        user.getPhone());

                        // Clean up OTP (non-blocking - don't fail the response if cleanup fails)
                        try {
                                otpService.deleteOtp(request.getEmail());
                        } catch (Exception cleanupError) {
                                log.warn("Failed to clean up OTP for email: {}", request.getEmail(), cleanupError);
                                // Continue - don't fail the registration
                        }

                        return ResponseEntity.ok(new AuthResponse(token, userDto));

                } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                        .body(new OtpResponse(false, e.getMessage(), null));
                }
        }

        /**
         * Resend OTP
         * POST /api/auth/resend-otp
         */
        @PostMapping("/resend-otp")
        public ResponseEntity<?> resendOtp(@Valid @RequestBody SendOtpRequest request) {
                try {
                        otpService.sendOtp(request.getEmail());
                        return ResponseEntity.ok(new OtpResponse(
                                        true,
                                        "OTP resent to " + request.getEmail(),
                                        300));
                } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                        .body(new OtpResponse(false, e.getMessage(), null));
                }
        }

        /**
         * Change password for authenticated user
         * Requires valid JWT token and current password verification
         */
        @PostMapping("/change-password")
        public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
                try {
                        // Get authenticated user from SecurityContext
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                        if (authentication == null || !authentication.isAuthenticated()) {
                                return ResponseEntity
                                                .status(HttpStatus.UNAUTHORIZED)
                                                .body(new ErrorResponse("User not authenticated"));
                        }

                        // Extract email from principal (User entity implements UserDetails)
                        String currentUserEmail = null;
                        Object principal = authentication.getPrincipal();

                        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                                currentUserEmail = ((org.springframework.security.core.userdetails.UserDetails) principal)
                                                .getUsername();
                        } else {
                                currentUserEmail = principal.toString();
                        }

                        if (currentUserEmail == null || currentUserEmail.isEmpty()) {
                                return ResponseEntity
                                                .status(HttpStatus.UNAUTHORIZED)
                                                .body(new ErrorResponse("Could not extract user email from token"));
                        }

                        // Retrieve user from database
                        User user = userRepository.findByEmail(currentUserEmail)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        // Verify current password
                        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                                return ResponseEntity
                                                .status(HttpStatus.UNAUTHORIZED)
                                                .body(new ErrorResponse("Current password is incorrect"));
                        }

                        // Prevent using same password as new password
                        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                                return ResponseEntity
                                                .status(HttpStatus.BAD_REQUEST)
                                                .body(new ErrorResponse(
                                                                "New password must be different from current password"));
                        }

                        // Update password
                        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                        userRepository.save(user);

                        return ResponseEntity.ok(new SuccessResponse("Password changed successfully"));

                } catch (RuntimeException e) {
                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .body(new ErrorResponse(e.getMessage()));
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new ErrorResponse("Failed to change password: " + e.getMessage()));
                }
        }
}
