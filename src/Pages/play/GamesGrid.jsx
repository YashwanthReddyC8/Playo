import GameCard from "./GameCard";
import SkeletonGameCard from "./SkeletonGameCard";
import { games } from "./data/games";

export default function GamesGrid({ loading = false }) {
    if (loading) {
        return (
            <section
                className="
                grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4
                gap-4 md:gap-6
                "
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonGameCard key={i} />
                ))}
            </section>
        );
    }
    return (
        <div className="w-full bg-white rounded-2xl shadow-[0_4px_12px_0_rgba(59,69,64,0.1)]">
            <section className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 md:px-8 mt-6">
                {/* GRID */}
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-stretch lg:justify-items-center">
                    {games.map((game) => (
                        <GameCard
                            key={`${game.game_type}-${game.date}-${game.time}-${game.host.name}`}
                            activity={game}
                        />
                    ))}

                    {/* LOAD MORE */}
                    <div className="flex justify-center mt-12 mb-24">
                        <button
                            className="
                        bg-[#00B562] hover:bg-[#008F4D]
                        text-white font-semibold
                        text-sm tracking-wide
                        h-14 px-8 rounded
                        uppercase transition
                        active:scale-95
                        "
                        >
                            LOAD MORE
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
