export default function HeroSearch() {
    return (
        <>
            <h1 className="
        font-extrabold text-gray-900
        text-2xl md:text-[32px]
        leading-[1.4] w-full
      ">
                Sports Trainers in Hyderabad
            </h1>

            <div className="relative w-full">
                <input
                    id="search"
                    type="text"
                    placeholder="Search for coaches / academies"
                    className="
            w-full h-[52px] md:h-[62px]
            rounded-2xl md:rounded-3xl
            outline-none border border-gray-200
            text-gray-800 placeholder-gray-500
            font-medium px-4 md:px-6
            bg-gray-100
            focus:border-green-500
            transition
          "
                />

                <div className="absolute right-4 md:right-6 top-[33%] cursor-pointer">
                    <img
                        src="https://playo-website.gumlet.io/playo-website-v3/icons/trainer/search-icon.png"
                        className="w-5 h-5 md:w-6 md:h-6 object-contain opacity-70"
                        alt="search"
                    />
                </div>
            </div>
        </>
    );
}
