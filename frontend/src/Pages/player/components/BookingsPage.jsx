import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";
import BookingCard from "./BookingCard";
import { BookingCardSkeleton } from "./Skeletons";

const ITEMS_PER_PAGE = 3;

export default function BookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Simulated API call
    useEffect(() => {
        setTimeout(() => {
            setBookings([
                { id: "DBUPYKAS", status: 1, venue: "Skanda Badminton, Nagole", time: "4:30 PM - 5:30 PM", date: "08", month: "Feb", court: "Synthetic Court 4" },
                { id: "RJFPFNG", status: 1, venue: "Skanda Badminton, Nagole", time: "3:30 PM - 4:30 PM", date: "08", month: "Feb", court: "Synthetic Court 4" },
                { id: "JBLFYDXA", status: 0, venue: "SSBA, Boduppal", time: "7:00 PM - 8:00 PM", date: "03", month: "Feb", court: "Synthetic Court 2" },
                { id: "TEST123", status: 0, venue: "Skanda Badminton, Nagole", time: "6:00 PM - 7:00 PM", date: "10", month: "Feb", court: "Court 3" },
                { id: "TEST456", status: 1, venue: "Skanda Badminton, Nagole", time: "2:00 PM - 3:00 PM", date: "15", month: "Feb", court: "Court 1" },
            ]);
            setLoading(false);
        }, 1500);
    }, []);

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
                            <BookingCard key={booking.id} booking={booking} />
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