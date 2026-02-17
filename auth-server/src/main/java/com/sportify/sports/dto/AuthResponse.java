package com.sportify.sports.dto;

import com.sportify.sports.entity.Role;
import lombok.*;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UserDto user;

    @Getter
    @AllArgsConstructor
    public static class UserDto {
        private String name;
        private String email;
        private Role role;
        private String profileLink;
        private String phone;
    }
}

