import HeroSearch from "./HeroSearch";
import SportCategories from "./SportCategories";
import Filters from "./Filters";
import TrainerCard from "./TrainerCard";
import { trainers } from "./data/trainers";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useState } from "react";

export default function Trainer() {
    const [isEnd, setIsEnd] = useState(false);
    const [trainersToShow, setTrainersToShow] = useState(trainers.slice(0, 6));
    const loadMoreTrainers = () => {
        const currentLength = trainersToShow.length;
        const isMore = currentLength < trainers.length;
        const nextResults = isMore
            ? trainers.slice(currentLength, currentLength + 6)
            : [];
        setTrainersToShow([...trainersToShow, ...nextResults]);
        setIsEnd(trainersToShow.length + nextResults.length >= trainers.length);
    };
    return (
        <div
            id="parent"
            className="flex flex-col gap-6 md:gap-[32px] pt-6"
        >
            <Header />
            {/* TOP WHITE CARD */}
            <div
                id="homeData"
                className="flex mx-4 p-4 md:p-0 flex-col md:mt-[52px] gap-6 md:gap-[52px]
                   bg-white rounded-2xl xl:w-[1032px] md:mx-auto shadow-[0_4px_12px_0_rgba(59,69,64,0.1)]"
            >
                <div className="flex flex-col gap-[52px]">
                    <div className="flex flex-col gap-6 max-w-[926px] md:p-[52px] md:pb-0">
                        <HeroSearch />
                    </div>
                </div>

                {/* SERVICES (SPORT CATEGORIES) */}
                <div
                    id="services"
                    className="max-w-[1032px] w-full mx-auto flex flex-col
                gap-[24px] md:gap-[32px]
                bg-white rounded-2xl md:p-[52px] md:pt-0"
                >
                    <SportCategories />
                </div>
            </div>

            {/* FILTERS */}
            <Filters />

            {/* LISTINGS */}
            <div className="max-w-[1032px] w-full mx-auto flex flex-col gap-[64px]">
                <section
                    id="listingHome"
                    className="grid grid-cols-1 md:grid-cols-3
                     justify-start gap-4 md:gap-6
                     mx-auto max-w-[1032px] w-full
                     px-4 md:px-0"
                >
                    {trainersToShow.map((trainer, index) => (
                        <TrainerCard key={trainer.id} trainer={trainer} index={index} />
                    ))}
                </section>

                {/* LOAD MORE */}
                {!isEnd && <div className="flex justify-center items-center" onClick={loadMoreTrainers}>
                    <div
                        className="bg-[#00b562] text-background py-3 px-4
                       shadow-[#00914e] rounded-2xl font-bold
                       text-[14px] md:text-[16px]
                       cursor-pointer hover:bg-green-700
                       shadow-[0_4px_0_0] transition-all tracking-wider"
                    >
                        LOAD MORE
                    </div>
                </div>}
            </div>
            <Footer />
        </div>
    );
}
