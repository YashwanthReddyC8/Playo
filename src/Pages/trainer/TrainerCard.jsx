export default function TrainerCard({ trainer, index }) {
    return (
        <a
            id={index}
            href={`/trainer/details/${trainer.slug}`}
            title={trainer.name}
            className="
                rounded-2xl border border-[#e3e8e6] bg-white
                overflow-hidden w-full cursor-pointer
                shadow-[0_4px_12px_0_rgba(59,69,64,0.1)]
                h-full block active:scale-[0.98] transition-transform"
        >
            {/* ───────────────── HEADER (icons + rating) ───────────────── */}
            <div className="pb-6 flex justify-between items-center p-4">
                {/* Services Icons */}
                <div className="flex items-center relative grow">
                    <div className="absolute flex justify-center items-center gap-1 rounded-full">
                        {trainer.services.map((service, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full border border-[#e3e8e6]
                           overflow-hidden bg-white"
                            >
                                <img
                                    src={service.icon}
                                    alt={service.name}
                                    title={service.name}
                                    width="32"
                                    height="32"
                                    className="w-full h-full"
                                />
                            </div>
                        ))}

                        {trainer.services.length > 2 && (
                            <div className="bg-background text-sm text-main px-2">
                                +{trainer.services.length - 2} More
                            </div>
                        )}
                    </div>
                </div>

                {/* Rating / New */}
                <div className="flex items-center">
                    <div className="flex items-center px-2 py-1 bg-green-600 text-white rounded-lg">
                        <span className="text-sm font-medium">
                            ★ {trainer.rating}
                        </span>
                    </div>
                </div>
            </div>

            {/* ───────────────── IMAGE CAROUSEL ───────────────── */}
            <div className="relative pb-6">
                <div
                    className="flex overflow-x-auto gap-3 scrollbar-hide"
                    style={{ scrollbarWidth: "none" }}
                >
                    {trainer.images.map((img, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 max-h-[132px] h-full
                         flex gap-3 relative
                         first:ml-4 last:mr-4"
                        >
                            <div className="flex relative rounded-lg overflow-hidden">
                                <img
                                    src={img.src}
                                    alt={trainer.name}
                                    title={trainer.name}
                                    className="
                                        w-[200px] sm:w-[235px]
                                        h-[112px] sm:h-[132px]
                                        aspect-[16/9]
                                        object-cover"
                                />

                                {/* Label (Trainer / Academy) */}
                                {img.label && (
                                    <div className="absolute w-full text-center bottom-1">
                                        <span
                                            className="
                                                text-sm w-[92px] bg-white
                                                px-2 py-1 rounded-md shadow-sm
                                                text-main font-semibold uppercase
                                            "
                                        >
                                            {img.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Text Card inside carousel */}
                            {img.description && (
                                <div
                                    className="
                                        text-sm bg-[#e1ffa3] font-medium
                                        rounded-md w-[200px] sm:w-[235px] h-[112px] sm:h-[132px]
                                        flex justify-center text-black
                                        px-4 py-6 items-center flex-wrap
                                        break-all overflow-hidden overflow-y-auto
                                    "
                                >
                                    <div className="line-clamp-4">
                                        {img.description}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ───────────────── DETAILS ───────────────── */}
            <div className="px-4 flex flex-col gap-2">
                {/* Name */}
                <h2 className="md:text-xl text-gray-900 font-bold truncate">
                    {trainer.name}
                </h2>

                <div className="text-sm text-gray-500 font-medium truncate">
                    {trainer.location}
                </div>

                {/* Audience */}
                <div className="flex flex-col w-full gap-6 mt-2">
                    <div className="text-sm flex items-center gap-2 text-gray-500">
                        <img
                            src="https://playo-website.gumlet.io/playo-website-v3/icons/trainer/kidsAdult.png"
                            alt={trainer.audience}
                            width="24"
                            height="24"
                        />
                        <span className="text-gray-700 font-medium">
                            {trainer.audience}
                        </span>
                    </div>


                    {/* CTA */}
                    <div className="flex flex-col w-full gap-2">
                        <div
                            id={`${trainer.id}button`}
                            className="
                                bg-orange-400 text-white
                                py-3 px-4 rounded-2xl
                                font-bold text-xs md:text-sm
                                text-center tracking-wider
                                cursor-pointer w-full
                                hover:bg-orange-500
                                transition uppercase
                            "
                        >
                            Instant Connect 🚀
                        </div>

                        <div className="text-center text-sm text-gray-500 pb-4">
                            {trainer.interestCount} showed Interest
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}
