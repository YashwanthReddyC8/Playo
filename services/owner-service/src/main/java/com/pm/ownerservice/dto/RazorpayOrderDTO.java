package com.pm.ownerservice.dto;

/**
 * DTO for Razorpay Order response to frontend
 */
public record RazorpayOrderDTO(
        String orderId,
        Long bookingId,
        String amount,
        String currency) {
}
