package com.pm.ownerservice.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCenterRequest(

        @NotBlank(message = "Center name is required") String name,

        @Size(max = 500, message = "Description cannot exceed 500 characters") String description,

        @NotBlank(message = "Address is required") String address,

        @NotBlank(message = "City is required") String city,

        @NotBlank(message = "State is required") String state,

        @NotBlank(message = "Postal code is required") String postalCode,

        @NotNull(message = "Latitude is required") Double latitude,

        @NotNull(message = "Longitude is required") Double longitude,

        @NotBlank(message = "Phone number is required") @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits") String phoneNumber,

        @NotBlank(message = "Email is required") @Email(message = "Email should be valid") String email,

        String imageUrl,

        List<String> inactiveDates,

        @Valid List<SportFacilityRequest> facilities) {
}
