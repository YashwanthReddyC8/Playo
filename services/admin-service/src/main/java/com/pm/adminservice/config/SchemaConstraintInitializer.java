package com.pm.adminservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SchemaConstraintInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE sports_center_applications " +
                            "DROP CONSTRAINT IF EXISTS sports_center_applications_status_check"
            );

            jdbcTemplate.execute(
                    "ALTER TABLE sports_center_applications " +
                            "ADD CONSTRAINT sports_center_applications_status_check " +
                            "CHECK (status IN ('PENDING','APPROVED','REJECTED'))"
            );
        } catch (Exception ignored) {
        }
    }
}
