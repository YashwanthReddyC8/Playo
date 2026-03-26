package com.sportify.sports.dto;

import com.sportify.commonmodels.entity.Role;
import com.sportify.commonmodels.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Response DTO for user listing and details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserListResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String profileLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert User entity to UserListResponse DTO
     */
    public static UserListResponse fromEntity(User user) {
        return new UserListResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getProfileLink(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
