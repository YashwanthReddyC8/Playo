export default function AppCTA() {
    return (
        <div className="bg-green-600 text-white py-6">
            <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center">
                <span className="font-semibold">
                    To create a game, download Playo app
                </span>
                <div className="flex gap-3">
                    <img src="/google-play.png" className="h-10" />
                    <img src="/app-store.png" className="h-10" />
                </div>
            </div>
        </div>
    );
}
