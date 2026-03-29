package com.pm.ownerservice.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for verifying payment after Razorpay transaction
 */
public record PaymentVerificationDTO(
        @NotBlank(message = "Razorpay Order ID is required") String razorpayOrderId,

        @NotBlank(message = "Razorpay Payment ID is required") String razorpayPaymentId,

        @NotBlank(message = "Razorpay Signature is required") String razorpaySignature) {
}
