package com.sportify.sports.exception;

import com.sportify.sports.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /* ---------- AUTH ERRORS ---------- */

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse badCredentials() {
        return new ErrorResponse("Invalid email or password");
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED) // security best practice
    public ErrorResponse userNotFound() {
        return new ErrorResponse("Invalid email or password");
    }

    @ExceptionHandler({ DisabledException.class, LockedException.class })
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse accountDisabled() {
        return new ErrorResponse("Account is disabled or locked");
    }

    /* ---------- FILE UPLOAD ERRORS ---------- */

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse maxUploadSize() {
        return new ErrorResponse("File size exceeds the allowed limit");
    }

    @ExceptionHandler(MultipartException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse multipartError() {
        return new ErrorResponse("Invalid multipart request");
    }

    /* ---------- VALIDATION ---------- */

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse illegalArgument(IllegalArgumentException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    /* ---------- FALLBACK ---------- */

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse genericError() {
        return new ErrorResponse("An unexpected error occurred");
    }
}