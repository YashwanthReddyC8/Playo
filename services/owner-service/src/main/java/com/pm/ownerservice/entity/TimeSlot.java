package com.pm.ownerservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "time_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sport_facility_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SportFacility sportFacility;

    @Column(name = "days_of_week", nullable = false, length = 120)
    private String daysOfWeek;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Backward compatibility for existing DB schema that still has NOT NULL is_available.
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "inactive_dates", length = 2000)
    private String inactiveDates;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        if (isActive == null && isAvailable != null) {
            isActive = isAvailable;
        }
        if (isActive == null) {
            isActive = true;
        }
        isAvailable = isActive;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        if (isActive == null && isAvailable != null) {
            isActive = isAvailable;
        }
        if (isActive == null) {
            isActive = true;
        }
        isAvailable = isActive;
        updatedAt = LocalDateTime.now();
    }
}