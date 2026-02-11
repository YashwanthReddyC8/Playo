const filters = [
    "Services", "Age", "Batch", "Coach Only", "Academy Only"
];

export default function Filters() {
    return (
        <div className="flex gap-3 my-6 flex-wrap justify-center">
            {filters.map((f, i) => (
                <div key={i} className=" md:first:ml-0 first:ml-4 last:mr-4 z-[4] min-w-[123px] md:min-w-[156px]" style={{ touchAction: "manipulation", overscrollBehavior: "contain" }}>
                    <button
                        className="
                            flex items-center gap-1 md:gap-[10px]
                            px-2 md:px-4 py-1 md:py-2
                            rounded-lg md:rounded-2xl
                            cursor-pointer
                            !bg-orange-400 !text-white
                            border !border-orange-500
                            hover:!bg-orange-500
                            transition
                        "
                    >
                        <div className=" flex gap-2 ">
                            <img src="https://playo-website.gumlet.io/playo-website-v3/icons/trainer/Sport Icon.png" className=" w-5 h-5 md:w-6 md:h-6 p-1 filter grayscale-0" alt="Service Filter" title="Service Filter" />
                            <span className=" text-sm md:text-base font-medium text-black">
                                {f}
                            </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5  text-main rotate-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
