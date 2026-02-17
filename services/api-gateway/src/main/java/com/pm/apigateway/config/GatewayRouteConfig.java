package com.pm.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;

@Configuration
public class GatewayRouteConfig {
    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-server", r -> r
                        .path("/api/auth/**")
                        .uri("lb://auth-server"))

                // Admin Service Routes
                .route("admin-service", r -> r
                        .path("/api/admin/**")
                        .uri("lb://admin-service"))

                // Booking Service Routes
                .route("booking-service", r -> r
                        .path("/api/booking/**", "/api/reservations/**")
                        .uri("lb://booking-service"))

                // Owner Service Routes
                .route("owner-service", r -> r
                        .path("/api/owner/**", "/api/venues/**")
                        .uri("lb://owner-service"))

                // Trainer Service Routes
                .route("trainer-service", r -> r
                        .path("/api/trainer/**", "/api/sessions/**")
                        .uri("lb://trainer-service"))

                .build();
    }
}
