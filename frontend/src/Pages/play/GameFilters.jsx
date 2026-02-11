import React, { useState } from "react";
import {
    ChevronDown,
    ListFilter,
    Trophy,
    Calendar,
    CreditCard,
} from "lucide-react";

const Filters = () => {
    const [isGameTimeEnabled, setIsGameTimeEnabled] = useState(false);

    return (
        <div className="mt-6 w-full flex gap-2 px-4 md:mx-2 overflow-auto no-scrollbar items-center">
            {/* GameTime Toggle */}
            <div
                onClick={() => setIsGameTimeEnabled(!isGameTimeEnabled)}
                className="flex items-center gap-4 border border-[#E3E8E6] bg-white py-3 px-4 rounded-2xl cursor-pointer min-w-fit transition-all hover:border-[#00B562]/30"
            >
                <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/f1ff7fbe-cf6b-4b1b-adc1-02a185d61707-playo-co/assets/icons/gameTime_logo-1.png"
                    alt="Gametime activities"
                    className="h-6 w-6 object-contain"
                />

                <span className="font-medium text-base text-[#1A1A1A]">
                    GameTime by Playo
                </span>

                <div
                    onClick={() => setIsGameTimeEnabled(v => !v)}
                    className="flex items-center justify-center ml-auto cursor-pointer"
                >
                    <div
                        className={`
                        relative inline-flex items-center
                        h-[16px] w-[24px]
                        rounded-full border-2
                        transition-colors
                        ${isGameTimeEnabled
                                ? "bg-white border-[#00B562]"
                                : "bg-white border-[#3c4540]"
                            }
                        `}
                    >
                        <span
                            className={`
                                border-2 border-main inline-block h-2 w-2 transform rounded-full transition-transform
                                ${isGameTimeEnabled ? "translate-x-[11px] bg-[#00B562] border-[#00B562]" : "translate-x-[2px] bg-white border-[#3c4540]"}
                            `}
                        />
                    </div>
                </div>
            </div>

            {/* Filter & Sort */}
            <div className="flex items-center gap-4 border border-[#E3E8E6] bg-white py-3 px-4 rounded-2xl cursor-pointer min-w-fit hover:border-[#00B562]/30">
                <ListFilter size={16} strokeWidth={2.5} />
                <span className="font-medium text-base">Filter & Sort By</span>
                <ChevronDown size={16} strokeWidth={2.5} />
            </div>

            {/* Sports */}
            <div className="outline-none">
                <div className="flex items-center gap-4 py-3 px-4 rounded-2xl border border-[#E3E8E6] bg-white hover:border-[#00B562]/30">
                    <Trophy size={16} strokeWidth={2.5} />
                    <span className="font-medium text-base">Sports</span>
                    <ChevronDown size={16} strokeWidth={2.5} />
                </div>
            </div>

            {/* Date */}
            <div className="outline-none">
                <div className="flex items-center gap-4 py-3 px-4 rounded-2xl border border-[#E3E8E6] bg-white hover:border-[#00B562]/30">
                    <Calendar size={16} strokeWidth={2.5} />
                    <span className="font-medium text-base">Date</span>
                    <ChevronDown size={16} strokeWidth={2.5} />
                </div>
            </div>

            {/* Pay & Join */}
            <div className="flex items-center gap-4 py-3 px-4 rounded-2xl border border-[#E3E8E6] bg-white min-w-fit hover:border-[#00B562]/30">
                <CreditCard size={16} strokeWidth={2.5} />
                <span className="font-medium text-base">Pay & Join Game</span>
            </div>
        </div>
    );
};

export default Filters;