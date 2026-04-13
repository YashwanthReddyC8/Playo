package com.pm.adminservice.exception;

/**
 * Exception thrown when a bad request is made (invalid input or operation).
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
