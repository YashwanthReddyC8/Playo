package com.pm.ownerservice.repository;

import com.pm.ownerservice.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findBySportFacilityId(Long sportFacilityId);

    Optional<TimeSlot> findByIdAndSportFacilityId(Long id, Long sportFacilityId);
}