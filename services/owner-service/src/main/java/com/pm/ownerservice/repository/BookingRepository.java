package com.pm.ownerservice.repository;

import com.pm.ownerservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Find all bookings for a specific user
     */
    List<Booking> findByUserId(String userId);

    /**
     * Find all bookings for a specific venue
     */
    List<Booking> findByVenueId(Long venueId);

    /**
     * Find all bookings for a specific date and venue (to check availability)
     */
    List<Booking> findByVenueIdAndBookingDate(Long venueId, LocalDate bookingDate);

    /**
     * Find booking by razorpay order ID
     */
    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);

    /**
     * Find booking by razorpay payment ID
     */
    Optional<Booking> findByRazorpayPaymentId(String razorpayPaymentId);

    /**
     * Find confirmed bookings for a specific date and venue
     */
    List<Booking> findByVenueIdAndBookingDateAndStatus(Long venueId, LocalDate bookingDate,
            Booking.BookingStatus status);

        long countByVenueIdAndBookingDateAndTimeSlotAndStatusIn(
            Long venueId,
            LocalDate bookingDate,
            String timeSlot,
            Collection<Booking.BookingStatus> statuses);
}
