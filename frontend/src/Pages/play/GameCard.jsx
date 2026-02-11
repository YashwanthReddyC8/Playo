export default function GameCard({ activity }) {
    if (!activity) return null;

    const {
        game_type,
        format,
        host = {},
        slots = {},
        venue = {},
        flags = [],
        booking_status,
        date,
        time,
        sport,
        skill_level,
    } = activity;

    const isLimited = flags.includes("LIMITED_SLOTS");
    const isBooked = booking_status === "BOOKED";

    return (
        <div className="max-w-full md:max-w-[328px] md:min-w-[328px] grow md:grow-0">
            <div
                className="
                flex flex-col space-y-2
                h-[250px]
                p-4
                bg-white
                border border-[#E3E8E6]
                rounded-[16px]
                shadow-card
                cursor-pointer
                overflow-hidden
                "
            >
                {/* GAME TYPE */}
                <div className="flex items-center text-xs md:text-sm text-[#758A80] font-medium capitalize">
                    <span>{game_type}</span>
                    <span className="mx-1">•</span>
                    <span>{format}</span>
                </div>

                {/* PLAYERS / AVAILABILITY */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        {/* HOST IMAGES */}
                        <div className="flex -space-x-3">
                            {host.profile_images.slice(0, 2).map((img, i) => (
                                <div
                                    key={i}
                                    className="h-10 w-10 rounded-full overflow-hidden border border-white"
                                >
                                    <img
                                        src={img}
                                        alt="host"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* SLOT INFO */}
                        <div className="ml-4 font-bold text-sm text-[#1A1A1A]">
                            {slots.availability_label ? (
                                <span className="text-[#E67E22]">
                                    {slots.availability_label}
                                </span>
                            ) : (
                                <>
                                    {slots.going}
                                    {slots.total && (
                                        <span className="text-xs font-medium">
                                            /{slots.total}
                                        </span>
                                    )}{" "}
                                    Going
                                </>
                            )}
                        </div>
                    </div>

                    {/* BOOKED BADGE */}
                    {isBooked && (
                        <span className="text-[10px] font-bold bg-[#E7F8F0] text-[#00B562] px-2 py-1 rounded uppercase">
                            BOOKED
                        </span>
                    )}
                </div>

                {/* HOST + KARMA */}
                <div className="flex text-xs md:text-sm text-[#758A80] font-medium">
                    <span>{host.name}</span>
                    <span className="mx-1">|</span>
                    <span>{host.karma} Karma</span>
                </div>

                {/* DATE & TIME */}
                <div className="text-xs md:text-sm font-semibold text-[#1A1A1A]">
                    <span className="mr-1">
                        {new Date(date).toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                        ,
                    </span>
                    {time}
                </div>

                {/* VENUE */}
                <div className="flex items-center space-x-2 mt-1">
                    <img
                        className="mr-2 h-[18px] w-[18px]"
                        src="https://cdn-icons-png.flaticon.com/512/9101/9101314.png"
                        alt="location"
                    />
                    <span className="text-xs md:text-sm text-[#1A1A1A] truncate">
                        {venue.name} ~{venue.distance_km} Kms
                    </span>
                </div>

                {/* SPORT + SKILL */}
                <div className="flex items-center pt-2">
                    <img
                        src={`/icons/${sport.toLowerCase()}.png`}
                        alt={sport}
                        className="h-[22px] w-[22px]"
                    />

                    <div
                        className="
              ml-2
              bg-[#F1F3F2]
              border
              rounded-lg
              px-2 py-1
              text-xs font-medium
              text-[#1A1A1A]
              truncate
            "
                    >
                        {skill_level}
                    </div>
                </div>
            </div>
        </div>
    );
}
