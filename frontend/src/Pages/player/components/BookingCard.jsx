export default function BookingCard({ booking, onCancel, onView, onMakePlay }) {
    const dayLabel = booking.date || booking.day || "--";
    const monthLabel = booking.month || "---";
    const venueLabel = booking.venueName || booking.venue || "Unknown Venue";
    const sportLabel = booking.sportName || booking.court || "Unknown Sport";

    return (
        <div className="border rounded-xl p-5 flex flex-col md:flex-row justify-between min-h-[140px]">

            {/* Left Info */}
            <div className="flex items-center gap-4 w-full">
                <div className="text-center">
                    <p className="text-3xl font-bold">{dayLabel}</p>
                    <p className="text-sm">{monthLabel}</p>
                </div>

                <div className="border-l pl-4 space-y-2">
                    <p className="font-medium">ID {booking.id}</p>
                    <p className="font-semibold">{venueLabel}</p>
                    <p className="text-sm">{booking.time}</p>
                    <p className="text-sm text-gray-500">{sportLabel} • ₹{booking.amount}</p>
                    <p className={`text-xs font-bold mt-1 ${booking.status === 1 ? 'text-green-600' : booking.status === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                        {booking.status === 1 ? 'CONFIRMED' : booking.status === 0 ? 'CANCELLED' : 'PENDING'}
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4 md:mt-0 items-center">
                <button onClick={onView} className="border px-4 py-2 rounded-lg hover:bg-gray-100">
                    View
                </button>
                {booking.status === 1 && onMakePlay && (
                    <button onClick={onMakePlay} className="border px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium">
                        {booking.playVisibility === "PUBLIC" ? "Update Play" : "Make Play"}
                    </button>
                )}
                {booking.status === 1 && !onMakePlay && (
                    <button disabled title="Play creation is available only before slot start time" className="border px-4 py-2 rounded-lg text-gray-400 bg-gray-100 font-medium cursor-not-allowed">
                        Make Play
                    </button>
                )}
                {booking.status !== 0 && (
                    onCancel ? (
                        <button onClick={onCancel} className="border px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium">
                            Cancel
                        </button>
                    ) : (
                        <button disabled title="Cancellation is only allowed before the slot starts" className="border px-4 py-2 rounded-lg text-gray-400 bg-gray-100 font-medium cursor-not-allowed">
                            Cancel
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
