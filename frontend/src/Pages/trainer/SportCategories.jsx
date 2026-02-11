import { sportsCategories } from "./data/sportsCategories";

export default function SportCategories() {
    return (
        <>
            <div className="text-base md:text-xl text-center mb-6">
                <span className="font-extrabold text-gray-900">
                    Hey! What’re you looking to level up on?
                </span>
            </div>

            <div
                className="
          grid grid-cols-3 gap-[14px]
          md:gap-6 md:grid-cols-5 lg:grid-cols-6
          justify-items-center items-center w-full
        "
            >
                {sportsCategories.map((sport) => (
                    <a
                        key={sport.title}
                        href={sport.href}
                        title={sport.title}
                        className="flex flex-col gap-2 cursor-pointer"
                    >
                        <img
                            src={sport.src}
                            alt={sport.alt}
                            title={sport.title}
                            className="
                categoryServices
                h-[100px] w-[100px]
                md:h-[140px] md:w-[140px]
                border-2 border-transparent
                rounded-2xl object-cover
                transition-all
                hover:border-green-500
              "
                        />
                    </a>
                ))}
            </div>
        </>
    );
}
