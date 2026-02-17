package com.sportify.sports.dto;

import lombok.*;

@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
}
