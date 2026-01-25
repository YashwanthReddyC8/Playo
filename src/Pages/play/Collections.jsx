export default function Collections() {
    return (
        <section className="bg-white py-14">
            <div className="max-w-[1440px] mx-auto px-6">
                <h2 className="text-lg font-bold mb-6">
                    Collections For You
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {["Top Venues", "Best Coaches", "Events"].map(t => (
                        <div
                            key={t}
                            className="h-56 rounded-2xl bg-gray-200 flex items-end p-4 font-bold"
                        >
                            {t}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
