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

const toDisplayName = (identifier) => {
    const raw = String(identifier || "").trim();
    if (!raw) return "Player";
    const base = raw.includes("@") ? raw.split("@")[0] : raw;
    return base
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeSportName = (sportName) => {
    const raw = String(sportName || "").trim();
    if (!raw || raw.toLowerCase() === "unknown sport" || raw.toLowerCase() === "unknown") {
        return "General Sport";
    }
    return raw;
};

export default function BookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewBooking, setViewBooking] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [playBooking, setPlayBooking] = useState(null);
    const [playForm, setPlayForm] = useState({ playVisibility: "PUBLIC", maxPlayers: 2 });
    const [playSubmitting, setPlaySubmitting] = useState(false);
    const [newParticipantUserId, setNewParticipantUserId] = useState("");
    const [splitDraft, setSplitDraft] = useState({});
    const { user } = useAuthStore();

    const currentUserId = String(user?.id || user?.email || "");

    const updateBookingFromResponse = (responseBooking) => {
        if (!responseBooking) return;

        setBookings((current) => current.map((booking) => (
            String(booking.id) === String(responseBooking.id)
                ? {
                    ...booking,
                    hostUserId: responseBooking.hostUserId || booking.hostUserId,
                    participantUserIds: Array.isArray(responseBooking.participantUserIds) ? responseBooking.participantUserIds : booking.participantUserIds,
                    paymentSplitPercentages: responseBooking.paymentSplitPercentages || booking.paymentSplitPercentages,
                    playVisibility: responseBooking.playVisibility || booking.playVisibility,
                    maxPlayers: responseBooking.maxPlayers || booking.maxPlayers,
                    joinedPlayers: responseBooking.joinedPlayers || booking.joinedPlayers,
                    splitAmount: responseBooking.splitAmount || booking.splitAmount,
                    joinLink: responseBooking.joinLink || booking.joinLink,
                    joinCode: responseBooking.joinCode || booking.joinCode,
                }
                : booking
        )));
    };

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
                    playVisibility: b.playVisibility || "PRIVATE",
                    maxPlayers: b.maxPlayers || 2,
                    joinedPlayers: b.joinedPlayers || 1,
                    hostUserId: b.hostUserId || b.userId || null,
                    participantUserIds: Array.isArray(b.participantUserIds) ? b.participantUserIds : [],
                    paymentSplitPercentages: b.paymentSplitPercentages || {},
                    splitAmount: b.splitAmount || b.amount,
                    joinLink: b.joinLink || null,
                    joinCode: b.joinCode || null,
                    venueName: b.venueName || `Venue ID: ${b.venueId}`,
                    venue: b.venueName || `Venue ID: ${b.venueId}`,
                    time: b.timeSlot,
                    date: dateObj.getDate().toString().padStart(2, '0'),
                    month: dateObj.toLocaleString('en-US', { month: 'short' }),
                    sportName: normalizeSportName(b.sportName),
                    court: normalizeSportName(b.sportName),
                    amount: b.amount,
                    bookingDate: b.bookingDate,
                    canCancel: b.status !== "CANCELLED" && isCancelableBooking(b.bookingDate, b.timeSlot)
                    , canMakePlay: b.status === "CONFIRMED" && isCancelableBooking(b.bookingDate, b.timeSlot)
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
            setSplitDraft(res.data?.paymentSplitPercentages || {});
        } catch (error) {
            console.error("Error fetching booking details:", error);
            setViewBooking({
                id: booking.id,
                venueName: booking.venueName,
                sportName: booking.sportName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.time,
                amount: booking.amount,
                hostUserId: booking.hostUserId,
                participantUserIds: booking.participantUserIds || [],
                paymentSplitPercentages: booking.paymentSplitPercentages || {},
                status: booking.rawStatus,
            });
            setSplitDraft(booking.paymentSplitPercentages || {});
        } finally {
            setViewLoading(false);
        }
    };

    const handleOpenPlaySettings = (booking) => {
        setPlayBooking(booking);
        setPlayForm({
            playVisibility: booking.playVisibility || "PUBLIC",
            maxPlayers: booking.maxPlayers || 2,
        });
    };

    const handleSavePlaySettings = async () => {
        if (!playBooking) return;
        try {
            setPlaySubmitting(true);
            const res = await axiosInstance.put(`/api/owners/bookings/${playBooking.id}/play`, {
                playVisibility: playForm.playVisibility,
                maxPlayers: Number(playForm.maxPlayers) || 2,
            });

            updateBookingFromResponse(res.data);
            setPlayBooking(null);
        } catch (error) {
            console.error("Error updating play settings:", error);
            alert(error?.response?.data?.message || "Failed to update play settings.");
        } finally {
            setPlaySubmitting(false);
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

    const handleRemoveParticipant = async (bookingId, participantUserId) => {
        try {
            const response = await axiosInstance.post(
                `/api/owners/bookings/${bookingId}/play/participants/${encodeURIComponent(participantUserId)}/remove`,
                { hostUserId: currentUserId }
            );

            setViewBooking(response.data);
            setSplitDraft(response.data?.paymentSplitPercentages || {});
            updateBookingFromResponse(response.data);
        } catch (error) {
            console.error("Error removing participant:", error);
            alert(error?.response?.data?.message || "Failed to remove participant");
        }
    };

    const handleAddParticipant = async (bookingId) => {
        const participantUserId = newParticipantUserId.trim();
        if (!participantUserId) {
            alert("Enter participant email or user ID");
            return;
        }

        try {
            const response = await axiosInstance.post(`/api/owners/bookings/${bookingId}/play/participants`, {
                hostUserId: currentUserId,
                participantUserId,
            });
            setViewBooking(response.data);
            setSplitDraft(response.data?.paymentSplitPercentages || {});
            updateBookingFromResponse(response.data);
            setNewParticipantUserId("");
            alert("Invite sent. Participant must accept before joining.");
        } catch (error) {
            console.error("Error adding participant:", error);
            alert(error?.response?.data?.message || "Failed to add participant");
        }
    };

    const handleSaveSplitPercentages = async (bookingId) => {
        try {
            const payload = Object.fromEntries(
                Object.entries(splitDraft || {}).map(([participantId, value]) => [
                    participantId,
                    Number(value),
                ])
            );

            const response = await axiosInstance.put(`/api/owners/bookings/${bookingId}/play/split`, {
                hostUserId: currentUserId,
                splitPercentages: payload,
            });
            setViewBooking(response.data);
            setSplitDraft(response.data?.paymentSplitPercentages || {});
            updateBookingFromResponse(response.data);
        } catch (error) {
            console.error("Error updating split percentages:", error);
            alert(error?.response?.data?.message || "Failed to update split percentages");
        }
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
                                onMakePlay={booking.canMakePlay ? () => handleOpenPlaySettings(booking) : undefined}
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
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                            <button
                                onClick={() => setViewBooking(null)}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        {viewLoading ? (
                            <p className="text-sm text-gray-500">Loading booking details...</p>
                        ) : (
                            <div className="mt-4 space-y-5 text-sm">
                                <div className="rounded-xl border border-gray-300 p-4 text-center sm:p-5">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">Booking ID</p>
                                            <p className="text-base font-semibold text-gray-900">{viewBooking.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">Status</p>
                                            <p className="text-base font-semibold text-gray-900">{viewBooking.status}</p>
                                        </div>
                                        <div className="mt-5">
                                            <p className="text-xs font-semibold text-gray-500">Venue</p>
                                            <p className="text-base font-semibold text-gray-900">{viewBooking.venueName || `Venue ID: ${viewBooking.venueId}`}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">Sport</p>
                                            <p className="text-gray-800">{normalizeSportName(viewBooking.sportName)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">Date</p>
                                            <p className="text-gray-800">{viewBooking.bookingDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">Slot</p>
                                            <p className="text-gray-800">{viewBooking.timeSlot}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">Amount</p>
                                            <p className="text-gray-800">₹{viewBooking.amount}</p>
                                        </div>
                                    </div>
                                </div>

                                {viewBooking.playEnabled && (
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-gray-300 p-4 text-center sm:p-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500">Play</p>
                                                    <p className="text-base font-semibold text-gray-900">{viewBooking.playVisibility}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500">Participants</p>
                                                    <p className="text-base font-semibold text-gray-900">{viewBooking.joinedPlayers || 0}/{viewBooking.maxPlayers || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-center font-semibold text-gray-900">Participant Users</p>
                                            <div className="mt-3 space-y-2">
                                                {(viewBooking.participantUserIds || []).map((participantId) => {
                                                    const isHost = String(participantId) === String(viewBooking.hostUserId);
                                                    const canManage = currentUserId === String(viewBooking.hostUserId);

                                                    return (
                                                        <div key={participantId} className="flex items-center justify-between rounded-xl border border-gray-300 px-3 py-2">
                                                            <span className="text-xs text-gray-700">
                                                                {toDisplayName(participantId)}{isHost ? " (Host)" : ""}
                                                            </span>
                                                            {!isHost && canManage && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveParticipant(viewBooking.id, participantId)}
                                                                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {currentUserId === String(viewBooking.hostUserId) && (
                                            <div className="space-y-4">
                                                <div className="rounded-xl border border-gray-300 p-4 sm:p-5">
                                                    <p className="text-center font-semibold text-gray-900">Add Participant</p>
                                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                                        <input
                                                            type="text"
                                                            placeholder="Participant email or user ID"
                                                            value={newParticipantUserId}
                                                            onChange={(event) => setNewParticipantUserId(event.target.value)}
                                                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddParticipant(viewBooking.id)}
                                                            className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-gray-300 p-4 sm:p-5">
                                                    <p className="text-center font-semibold text-gray-900">Payment Split (%)</p>
                                                    <div className="mt-3 space-y-2">
                                                        {(viewBooking.participantUserIds || []).map((participantId) => (
                                                            <div key={`split-${participantId}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                                <span className="w-full text-xs text-gray-700 sm:w-1/2 sm:truncate">{toDisplayName(participantId)}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={splitDraft?.[participantId] ?? ""}
                                                                    onChange={(event) => setSplitDraft((current) => ({
                                                                        ...current,
                                                                        [participantId]: event.target.value,
                                                                    }))}
                                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:w-1/2"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveSplitPercentages(viewBooking.id)}
                                                        className="mx-auto mt-4 flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Save Split
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {playBooking && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Make Booking a Play</h3>
                            <button
                                onClick={() => setPlayBooking(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-gray-700 mb-2">Play Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPlayForm((current) => ({ ...current, playVisibility: "PRIVATE" }))}
                                        className={`rounded-lg border px-3 py-2 font-semibold ${playForm.playVisibility === "PRIVATE" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200"}`}
                                    >
                                        Private
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlayForm((current) => ({ ...current, playVisibility: "PUBLIC" }))}
                                        className={`rounded-lg border px-3 py-2 font-semibold ${playForm.playVisibility === "PUBLIC" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200"}`}
                                    >
                                        Public
                                    </button>
                                </div>
                            </div>

                            <label className="block">
                                <span className="block font-medium text-gray-700 mb-2">Max Players</span>
                                <input
                                    type="number"
                                    min="2"
                                    value={playForm.maxPlayers}
                                    onChange={(e) => setPlayForm((current) => ({ ...current, maxPlayers: Math.max(2, Number(e.target.value) || 2) }))}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                                />
                            </label>

                            <p className="text-gray-500">
                                Public bookings can be joined by other players and will split the amount. Private bookings keep a shareable invite link.
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setPlayBooking(null)}
                                className="flex-1 border px-4 py-2 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePlaySettings}
                                disabled={playSubmitting}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {playSubmitting ? "Saving..." : "Save Play Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}