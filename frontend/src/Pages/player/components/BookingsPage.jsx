import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";
import BookingCard from "./BookingCard";
import { BookingCardSkeleton } from "./Skeletons";

import axiosInstance from "../../../api/axios";
import { useAuthStore } from "../../../stores/authStore";

const ITEMS_PER_PAGE = 3;

const parseBookingDate = (bookingDate) => {
    const [year, month, day] = bookingDate.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const parseBookingStartMinutes = (timeSlot) => {
    if (!timeSlot || !timeSlot.includes("-")) return null;
    const [startTime] = timeSlot.split("-");
    const [hour, minute] = startTime.split(":").map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
};

const getCurrentLocalMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const isCancelableBooking = (bookingDate, timeSlot) => {
    const dateObj = parseBookingDate(bookingDate);
    const today = new Date();
    const currentDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const bookingDateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

    if (bookingDateKey !== currentDateKey) {
        return dateObj > new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    const startMinutes = parseBookingStartMinutes(timeSlot);
    if (startMinutes === null) return false;

    return getCurrentLocalMinutes() < startMinutes;
};

export default function BookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewBooking, setViewBooking] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const { user } = useAuthStore();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const userId = user?.id || user?.email;
            if (!userId) return;
            const res = await axiosInstance.get(`/api/owners/bookings/user/${userId}`);

            const mappedBookings = res.data.map(b => {
                const dateObj = parseBookingDate(b.bookingDate);
                
                return {
                    id: b.id.toString(),
                    status: b.status === "CONFIRMED" ? 1 : b.status === "CANCELLED" ? 0 : 2, 
                    rawStatus: b.status,
                    venueName: b.venueName || `Venue ID: ${b.venueId}`,
                    venue: b.venueName || `Venue ID: ${b.venueId}`,
                    time: b.timeSlot,
                    date: dateObj.getDate().toString().padStart(2, '0'),
                    month: dateObj.toLocaleString('en-US', { month: 'short' }),
                    sportName: b.sportName || "Unknown Sport",
                    court: b.sportName || "Unknown Sport",
                    amount: b.amount,
                    bookingDate: b.bookingDate,
                    canCancel: b.status !== "CANCELLED" && isCancelableBooking(b.bookingDate, b.timeSlot)
                };
            });
            mappedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            setBookings(mappedBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        
        try {
            await axiosInstance.delete(`/api/owners/bookings/${bookingId}`);
            fetchBookings();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking.");
        }
    };

    const handleViewBooking = async (booking) => {
        try {
            setViewLoading(true);
            const res = await axiosInstance.get(`/api/owners/bookings/${booking.id}`);
            setViewBooking(res.data);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            setViewBooking({
                id: booking.id,
                venueName: booking.venueName,
                sportName: booking.sportName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.time,
                amount: booking.amount,
                status: booking.rawStatus,
            });
        } finally {
            setViewLoading(false);
        }
    };

    // Filter bookings
    const filteredBookings = useMemo(() => {
        if (activeTab === "cancelled") {
            return bookings.filter(b => b.status === 0);
        }
        return bookings;
    }, [bookings, activeTab]);

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    // Reset page when switching tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Paginate
    const paginatedBookings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBookings, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="p-6 pb-2">

            {/* Tabs */}
            <div className="flex bg-gray-100 p-2 rounded-lg max-w-md">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 py-2 rounded-lg font-semibold mx-2 transition
            ${activeTab === "all"
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    All Bookings
                </button>

                <button
                    onClick={() => setActiveTab("cancelled")}
                    className={`flex-1 py-2 rounded-lg font-semibold transition
            ${activeTab === "cancelled"
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    Cancelled
                </button>
            </div>

            {/* Bookings List */}
            <div className="mt-6 space-y-4">

                {loading
                    ? Array(3).fill().map((_, i) => (
                        <BookingCardSkeleton key={i} />
                    ))
                    : paginatedBookings.length > 0
                        ? paginatedBookings.map((booking) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onView={() => handleViewBooking(booking)}
                                        onCancel={booking.canCancel ? () => handleCancel(booking.id) : undefined}
                                    />
                        ))
                        : (
                            <div className="text-center py-10 text-gray-500">
                                No bookings found.
                            </div>
                        )
                }

            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {viewBooking && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Booking Details</h3>
                            <button
                                onClick={() => setViewBooking(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        {viewLoading ? (
                            <p className="text-sm text-gray-500">Loading booking details...</p>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">Booking ID:</span> {viewBooking.id}</p>
                                <p><span className="font-semibold">Venue:</span> {viewBooking.venueName || `Venue ID: ${viewBooking.venueId}`}</p>
                                <p><span className="font-semibold">Sport:</span> {viewBooking.sportName || "Unknown Sport"}</p>
                                <p><span className="font-semibold">Date:</span> {viewBooking.bookingDate}</p>
                                <p><span className="font-semibold">Slot:</span> {viewBooking.timeSlot}</p>
                                <p><span className="font-semibold">Amount:</span> ₹{viewBooking.amount}</p>
                                <p><span className="font-semibold">Status:</span> {viewBooking.status}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}