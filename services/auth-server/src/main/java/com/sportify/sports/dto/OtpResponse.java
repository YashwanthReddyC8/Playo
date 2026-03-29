package com.sportify.sports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpResponse {
    private Boolean success;
    private String message;
    private Integer expiresIn; // seconds
}
