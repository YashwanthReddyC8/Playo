export default function BookingCard({ booking }) {
    return (
        <div className="border rounded-xl p-5 flex flex-col md:flex-row justify-between min-h-[140px]">

            {/* Left Info */}
            <div className="flex items-center gap-4 w-full">
                <div className="text-center">
                    <p className="text-3xl font-bold">{booking.date}</p>
                    <p className="text-sm">{booking.month}</p>
                </div>

                <div className="border-l pl-4 space-y-2">
                    <p className="font-medium">ID {booking.id}</p>
                    <p className="font-semibold">{booking.venue}</p>
                    <p className="text-sm">{booking.time}</p>
                    <p className="text-sm">{booking.court}</p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4 md:mt-0">
                <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">
                    View
                </button>
                <button className="border px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">
                    Cancel
                </button>
            </div>
        </div>
    );
}
