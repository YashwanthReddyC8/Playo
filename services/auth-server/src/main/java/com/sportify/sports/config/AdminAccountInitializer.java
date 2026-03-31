package com.sportify.sports.config;

import com.sportify.commonmodels.entity.Role;
import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@playo.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.name:Playo Admin}")
    private String adminName;

    @Value("${app.admin.phone:9999999999}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        User adminUser = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .phone(adminPhone)
                .role(Role.ADMIN)
                .build();

        userRepository.save(adminUser);
    }
}
