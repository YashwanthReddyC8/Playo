package com.sportify.commonmodels.repository;

import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    /**
     * Count users by role
     */
    long countByRole(Role role);
}
