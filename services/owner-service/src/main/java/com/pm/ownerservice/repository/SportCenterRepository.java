package com.pm.ownerservice.repository;

import com.pm.ownerservice.entity.SportCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SportCenterRepository extends JpaRepository<SportCenter, Long> {

    List<SportCenter> findByOwnerId(Long ownerId);

    Optional<SportCenter> findByIdAndOwnerId(Long id, Long ownerId);

    List<SportCenter> findByCity(String city);

    List<SportCenter> findByOwnerIdAndStatus(Long ownerId, SportCenter.CenterStatus status);
}
