export default function HeroSearch() {
    return (
        <>
            <h1 className="font-bold text-main text-2xl md:text-[32px] text-black
                     leading-[1.5] w-full">
                Sports Trainers in Hyderabad
            </h1>

            <div className="relative w-full">
                <input
                    id="search"
                    type="text"
                    placeholder="Search for coaches / academies"
                    className="w-full h-[52px] md:h-[62px]
                     rounded-2xl md:rounded-3xl
                     outline-none border
                     text-main placeholder:text-[#758a80]
                     font-medium px-4 md:px-6
                     bg-[#f1f3f2] border-[#e3e8e6]"
                />

                <div className="absolute right-4 md:right-6 top-[33%] cursor-pointer">
                    <img
                        src="https://playo-website.gumlet.io/playo-website-v3/icons/trainer/search-icon.png"
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                        alt="search"
                    />
                </div>
            </div>
        </>
    );
}
