package com.sportify.sports.controller;

import com.sportify.commonmodels.entity.Role;
import com.sportify.sports.service.UserAdminService;
import com.sportify.sports.dto.UpdateUserRoleRequest;
import com.sportify.sports.dto.UserListResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.stream.Collectors;

/**
 * Admin Controller for user management
 * All endpoints require ADMIN role
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Validated
@Slf4j
public class UserAdminController {

    private final UserAdminService userAdminService;

    /**
     * Get all users (paginated) - Admin only
     * GET /api/admin/users
     * 
     * @param pageable pagination parameters
     * @return paginated list of users
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserListResponse>> getAllUsers(Pageable pageable) {
        try {
            log.info("Admin requesting all users: page={}, size={}",
                    pageable.getPageNumber(), pageable.getPageSize());

            Page<com.sportify.commonmodels.entity.User> userPage = userAdminService.getAllUsers(pageable);
            Page<UserListResponse> responsePage = new PageImpl<>(
                    userPage.getContent()
                            .stream()
                            .map(UserListResponse::fromEntity)
                            .collect(Collectors.toList()),
                    pageable,
                    userPage.getTotalElements());

            return ResponseEntity.ok(responsePage);

        } catch (Exception e) {
            log.error("Error fetching all users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user by ID - Admin only
     * GET /api/admin/users/{id}
     * 
     * @param userId user ID
     * @return user details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable("id") @NotNull Long userId) {
        try {
            log.info("Admin requesting user details: userId={}", userId);

            var user = userAdminService.getUserById(userId);
            UserListResponse response = UserListResponse.fromEntity(user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    /**
     * Update user role - Admin only
     * PATCH /api/admin/users/{id}/role
     * 
     * @param userId  user ID
     * @param request request containing new role
     * @return updated user
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable("id") @NotNull Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        try {
            log.info("Admin updating user role: userId={}, newRole={}", userId, request.getNewRole());

            var updatedUser = userAdminService.updateUserRole(userId, request.getNewRole());
            UserListResponse response = UserListResponse.fromEntity(updatedUser);

            return ResponseEntity.ok(new UpdateRoleResponse(
                    true,
                    "User role updated successfully",
                    response));

        } catch (Exception e) {
            log.warn("Error updating user role {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    /**
     * Delete user (soft delete) - Admin only
     * DELETE /api/admin/users/{id}
     * 
     * @param userId user ID
     * @return deletion result
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable("id") @NotNull Long userId) {
        try {
            log.info("Admin deleting user (soft delete): userId={}", userId);

            userAdminService.softDeleteUser(userId);

            return ResponseEntity.ok(new DeleteResponse(
                    true,
                    "User deleted successfully",
                    userId));

        } catch (Exception e) {
            log.warn("Error deleting user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    /**
     * Restore deleted user - Admin only
     * POST /api/admin/users/{id}/restore
     * 
     * @param userId user ID
     * @return restored user
     */
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreUser(@PathVariable("id") @NotNull Long userId) {
        try {
            log.info("Admin restoring user: userId={}", userId);

            var restoredUser = userAdminService.restoreDeletedUser(userId);
            UserListResponse response = UserListResponse.fromEntity(restoredUser);

            return ResponseEntity.ok(new UpdateRoleResponse(
                    true,
                    "User restored successfully",
                    response));

        } catch (Exception e) {
            log.warn("Error restoring user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    // ============================================================================
    // Response DTOs
    // ============================================================================

    /**
     * Generic error response
     */
    record ErrorResponse(boolean success, String message) {
    }

    /**
     * Response for role update operation
     */
    record UpdateRoleResponse(boolean success, String message, UserListResponse user) {
    }

    /**
     * Response for delete operation
     */
    record DeleteResponse(boolean success, String message, Long userId) {
    }
}
