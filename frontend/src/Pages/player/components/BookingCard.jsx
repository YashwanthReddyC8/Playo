export default function BookingCard({ booking, onCancel, onView, onMakePlay }) {
    const dayLabel = booking.date || booking.day || "--";
    const monthLabel = booking.month || "---";
    const venueLabel = booking.venueName || booking.venue || "Unknown Venue";
    const sportLabel = booking.sportName || booking.court || "Unknown Sport";

    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-start gap-4">
                <div className="min-w-[64px] rounded-lg bg-gray-50 px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{dayLabel}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-500 sm:text-sm">{monthLabel}</p>
                </div>

                <div className="flex-1 space-y-1 sm:space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">ID {booking.id}</span>
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${booking.status === 1 ? 'bg-green-50 text-green-700' : booking.status === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {booking.status === 1 ? 'CONFIRMED' : booking.status === 0 ? 'CANCELLED' : 'PENDING'}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{venueLabel}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>{booking.time}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                        <span className="text-gray-500">{sportLabel}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                        <span className="font-medium text-gray-700">₹{booking.amount}</span>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:gap-3 md:w-auto md:justify-end">
                <button onClick={onView} className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto">
                    View
                </button>
                {booking.status === 1 && onMakePlay && (
                    <button onClick={onMakePlay} className="w-full rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 sm:w-auto">
                        {booking.playVisibility === "PUBLIC" ? "Update Play" : "Make Play"}
                    </button>
                )}
                {booking.status === 1 && !onMakePlay && (
                    <button disabled title="Play creation is available only before slot start time" className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 sm:w-auto">
                        Make Play
                    </button>
                )}
                {booking.status !== 0 && (
                    onCancel ? (
                        <button onClick={onCancel} className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 sm:w-auto">
                            Cancel
                        </button>
                    ) : (
                        <button disabled title="Cancellation is only allowed before the slot starts" className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 sm:w-auto">
                            Cancel
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
