package com.sportify.sports.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class SendOtpRequest {
    @Email(message = "Valid email is required")
    @NotBlank(message = "Email cannot be blank")
    private String email;
}
