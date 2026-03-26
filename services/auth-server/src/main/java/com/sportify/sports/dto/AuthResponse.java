package com.sportify.sports.dto;

import com.sportify.commonmodels.entity.Role;
import lombok.*;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UserDto user;

    public Role getRole() {
        return user != null ? user.getRole() : null;
    }

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
