export default function BookingCard({ booking, onCancel }) {
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
                    <p className="text-sm text-gray-500">{booking.court} • ₹{booking.amount}</p>
                    <p className={`text-xs font-bold mt-1 ${booking.status === 1 ? 'text-green-600' : booking.status === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                        {booking.status === 1 ? 'CONFIRMED' : booking.status === 0 ? 'CANCELLED' : 'PENDING'}
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4 md:mt-0 items-center">
                <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">
                    View
                </button>
                {booking.status !== 0 && (
                    <button onClick={onCancel} className="border px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium">
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
