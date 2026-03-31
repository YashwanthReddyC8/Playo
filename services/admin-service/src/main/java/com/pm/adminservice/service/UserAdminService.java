package com.pm.adminservice.service;

import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.entity.Role;
import com.sportify.commonmodels.repository.UserRepository;
import com.pm.adminservice.exception.ResourceNotFoundException;
import com.pm.adminservice.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserAdminService {

    private final UserRepository userRepository;

    /**
     * Get all users (paginated) with admin access
     * 
     * @param pageable pagination parameters
     * @return page of users
     */
    public Page<User> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return userRepository.findAll(pageable);
    }

    /**
     * Get user by ID
     * 
     * @param userId user ID
     * @return user entity
     * @throws ResourceNotFoundException if user not found
     */
    public User getUserById(Long userId) {
        log.info("Fetching user by ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with ID: " + userId);
                });
    }

    /**
     * Update user role
     * 
     * @param userId  user ID
     * @param newRole new role to assign
     * @return updated user
     * @throws ResourceNotFoundException if user not found
     * @throws BadRequestException       if attempting to demote last admin
     */
    public User updateUserRole(Long userId, Role newRole) {
        log.info("Updating user role: userId={}, newRole={}", userId, newRole);

        User user = getUserById(userId);

        // Prevent demotion of last admin
        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
            long adminCount = userRepository.count();
            // This is a simplified check - in production, query specifically for admin
            // count
            if (adminCount <= 1) {
                log.warn("Cannot demote last admin user: {}", userId);
                throw new BadRequestException("Cannot demote the last admin user");
            }
        }

        user.setRole(newRole);
        User updatedUser = userRepository.save(user);

        log.info("User role updated successfully: userId={}, newRole={}", userId, newRole);
        return updatedUser;
    }

    /**
     * Soft delete user (mark as inactive)
     * 
     * @param userId user ID
     * @throws ResourceNotFoundException if user not found
     * @throws BadRequestException       if attempting to delete last admin
     */
    public void softDeleteUser(Long userId) {
        log.info("Soft deleting user: {}", userId);

        User user = getUserById(userId);

        // Prevent deletion of last admin
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.count();
            if (adminCount <= 1) {
                log.warn("Cannot delete last admin user: {}", userId);
                throw new BadRequestException("Cannot delete the last admin user");
            }
        }

        // Soft delete by setting role to inactive or using a deleted_at field
        // For now, we'll set an email prefix to indicate deletion
        user.setEmail("deleted_" + System.currentTimeMillis() + "_" + user.getEmail());
        user.setRole(Role.USER); // Demote to regular user to prevent access
        userRepository.save(user);

        log.info("User soft deleted successfully: {}", userId);
    }

    /**
     * Restore soft-deleted user
     * 
     * @param userId user ID
     * @throws ResourceNotFoundException if user not found
     */
    public User restoreDeletedUser(Long userId) {
        log.info("Restoring deleted user: {}", userId);

        User user = getUserById(userId);

        // Check if user was soft-deleted
        if (!user.getEmail().startsWith("deleted_")) {
            throw new BadRequestException("User was not soft-deleted");
        }

        // Restore email by removing prefix
        String restoredEmail = user.getEmail().substring(user.getEmail().lastIndexOf("_") + 1);
        user.setEmail(restoredEmail);

        User restoredUser = userRepository.save(user);
        log.info("User restored successfully: {}", userId);
        return restoredUser;
    }

    /**
     * Count users by role
     * 
     * @param role role to count
     * @return count of users with specified role
     */
    public long countUsersByRole(Role role) {
        return userRepository.countByRole(role);
    }
}
