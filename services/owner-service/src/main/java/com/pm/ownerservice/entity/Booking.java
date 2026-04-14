package com.pm.ownerservice.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Long venueId;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "time_slot_id")
    private Long timeSlotId;

    @Column(nullable = false)
    private String sportName;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private String timeSlot; // e.g., "09:00-10:00", "14:00-15:00"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "play_enabled")
    private Boolean playEnabled;

    @Enumerated(EnumType.STRING)
    @Column(name = "play_visibility")
    private PlayVisibility playVisibility;

    @Column(name = "join_code", unique = true, length = 64)
    private String joinCode;

    @Column(name = "max_players")
    private Integer maxPlayers;

    @Column(name = "joined_players")
    private Integer joinedPlayers;

    @Column(name = "joined_user_ids", length = 2000)
    private String joinedUserIds;

    @Column(name = "payment_split_percentages", length = 4000)
    private String paymentSplitPercentages;

    @Column(name = "pending_invite_user_ids", length = 2000)
    private String pendingInviteUserIds;

    @Column(name = "pending_join_request_user_ids", length = 2000)
    private String pendingJoinRequestUserIds;

    @Column(name = "split_amount", precision = 10, scale = 2)
    private BigDecimal splitAmount;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status; // PENDING, CONFIRMED, CANCELLED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (playVisibility == null) {
            playVisibility = PlayVisibility.PRIVATE;
        }

        if (playEnabled == null) {
            playEnabled = false;
        }

        if (joinCode == null || joinCode.isBlank()) {
            joinCode = UUID.randomUUID().toString().replace("-", "");
        }

        if (maxPlayers == null || maxPlayers < 1) {
            maxPlayers = 2;
        }

        if (joinedPlayers == null || joinedPlayers < 1) {
            joinedPlayers = 1;
        }

        if (joinedUserIds == null || joinedUserIds.isBlank()) {
            joinedUserIds = userId;
        }

        if (paymentSplitPercentages == null || paymentSplitPercentages.isBlank()) {
            paymentSplitPercentages = userId + ":100";
        }

        if (pendingInviteUserIds == null) {
            pendingInviteUserIds = "";
        }

        if (pendingJoinRequestUserIds == null) {
            pendingJoinRequestUserIds = "";
        }

        if (splitAmount == null) {
            splitAmount = amount;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Enum for Booking Status
    public enum BookingStatus {
        PENDING, // Order created, awaiting payment
        CONFIRMED, // Payment verified and confirmed
        CANCELLED // Booking cancelled
    }

    public enum PlayVisibility {
        PRIVATE,
        PUBLIC
    }
}
