package com.pm.ownerservice.config;

import com.razorpay.RazorpayClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Razorpay Payment Gateway
 */
@Configuration
@Slf4j
public class RazorpayConfig {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    /**
     * Initialize Razorpay Client Bean
     * Credentials should be set in application-docker.properties or environment
     * variables
     */
    @Bean
    public RazorpayClient razorpayClient() throws Exception {
        if (keyId == null || keySecret == null) {
            log.warn("Razorpay credentials not configured. Please set razorpay.key-id and razorpay.key-secret");
        }
        log.info("Initializing Razorpay Client with Key ID: {}", keyId);
        return new RazorpayClient(keyId, keySecret);
    }
}
