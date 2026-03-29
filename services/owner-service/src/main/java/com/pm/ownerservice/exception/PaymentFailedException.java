package com.pm.ownerservice.exception;

/**
 * Exception thrown when payment verification fails
 */
public class PaymentFailedException extends RuntimeException {
    public PaymentFailedException(String message) {
        super(message);
    }

    public PaymentFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
