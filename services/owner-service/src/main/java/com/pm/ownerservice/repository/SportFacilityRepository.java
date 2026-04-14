package com.pm.ownerservice.repository;

import com.pm.ownerservice.entity.SportFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SportFacilityRepository extends JpaRepository<SportFacility, Long> {

    List<SportFacility> findBySportCenterId(Long sportCenterId);

    Optional<SportFacility> findByIdAndSportCenterId(Long id, Long sportCenterId);
}