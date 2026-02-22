import GameFilters from "./GameFilters";
import GamesGrid from "./GamesGrid";
import Collections from "./Collections";
import AppCTA from "./AppCTA";
import CitiesList from "./CitiesList";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";

export default function Games() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1200);
    }, []);

    return (
        <div className="bg-[#F2F5F2] min-h-screen">
            <main
                className="
                    max-w-[1440px]
                    mx-auto
                    px-3 sm:px-4 md:px-6
                    py-4 md:py-6
                    space-y-6 md:space-y-10
                "
            >

                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Games in Hyderabad
                </h1>

                <GameFilters />
                <GamesGrid loading={loading} />
            </main>

            <Collections />
            <AppCTA />
            <CitiesList />
            <Footer />
        </div>
    );
}
