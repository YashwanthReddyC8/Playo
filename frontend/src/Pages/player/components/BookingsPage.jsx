import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";
import BookingCard from "./BookingCard";
import { BookingCardSkeleton } from "./Skeletons";

import axiosInstance from "../../../api/axios";
import { useAuthStore } from "../../../stores/authStore";
import { venues } from "../../book/venues/data";

const ITEMS_PER_PAGE = 3;

export default function BookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuthStore();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const userId = user?.id || user?.email;
            if (!userId) return;
            const res = await axiosInstance.get(`/api/owners/bookings/user/${userId}`);
            
            const mappedBookings = res.data.map(b => {
                const venue = venues.find(v => v.id === b.venueId);
                const dateObj = new Date(b.bookingDate);
                
                return {
                    id: b.id.toString(),
                    status: b.status === "CONFIRMED" ? 1 : b.status === "CANCELLED" ? 0 : 2, 
                    rawStatus: b.status,
                    venue: venue ? venue.title : `Venue ID: ${b.venueId}`,
                    time: b.timeSlot,
                    date: dateObj.getDate().toString().padStart(2, '0'),
                    month: dateObj.toLocaleString('en-US', { month: 'short' }),
                    court: "Main Court",
                    amount: b.amount,
                    bookingDate: b.bookingDate
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
                            <BookingCard key={booking.id} booking={booking} onCancel={() => handleCancel(booking.id)} />
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

        </div>
    );
}