import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import axiosInstance from "../../../api/axios";
import toast from "react-hot-toast";

export default function CenterBookingsModal({ isOpen, onClose, center }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && center) {
            fetchBookings();
        }
    }, [isOpen, center]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/api/owners/bookings/venue/${center.id}`);
            const sortedBookings = res.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            setBookings(sortedBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !center) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Bookings for {center.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and view all reservations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-16">
                            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No Bookings Yet</h3>
                            <p className="text-gray-500 mt-1">When users book this venue, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="border border-gray-100 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-gray-100 text-center rounded-lg px-4 py-2 min-w-[80px]">
                                            <div className="text-2xl font-black text-gray-800">{new Date(booking.bookingDate).getDate().toString().padStart(2, '0')}</div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase">{new Date(booking.bookingDate).toLocaleString('en-US', { month: 'short' })}</div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{booking.timeSlot}</p>
                                            <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                                            <p className="text-sm font-medium text-gray-700 mt-1">User ID: {booking.userId}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2 w-full sm:w-auto">
                                        <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                        <p className="font-bold text-gray-800">₹{booking.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
