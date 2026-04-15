import { useState } from "react";

export default function HeroSearch({
  onSearchChange,
  onSportFilter,
  sportOptions = ["All Sports"],
  currentSport = "All Sports",
}) {
  const [venueName, setVenueName] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const headingText = currentSport && currentSport !== "All Sports"
    ? `${currentSport} Venues: Discover and Book`
    : "Sports Venues Near You: Discover and Book";

  const handleVenueSearch = (e) => {
    setVenueName(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const handleSportFilter = (e) => {
    setSelectedSport(e.target.value);
    onSportFilter?.(e.target.value);
  };

  return (
    <div className="border">
      <div className="z-20 mx-auto flex w-full max-w-7xl flex-col items-center justify-between space-y-3 px-4 py-4 md:flex-row md:space-y-0 md:px-12">
        <h1 className="mt-3 w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold md:mt-0 md:text-2xl">
          {headingText}
        </h1>
        <div className="flex w-full flex-col items-center justify-end space-y-3 md:w-auto md:flex-row md:space-y-0">
          <div className="relative w-full md:mx-4 md:w-64">
            <div className="flex h-10 flex-col">
              <div className="flex h-10 w-full items-center rounded-lg border-2 border-gray-200 text-gray-700">
                <div className="relative ml-2 h-5 w-5 px-1">
                  <img
                    alt="search-icon"
                    src="https://playo-website.gumlet.io/playo-website-v2/logos-icons/search-icon.svg"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <input
                  className="mx-2 w-full appearance-none border-0 text-sm text-gray-700 focus:outline-none"
                  type="text"
                  placeholder="Search by venue name"
                  value={venueName}
                  onChange={handleVenueSearch}
                />
              </div>
            </div>
          </div>
          <div className="flex h-10 w-full items-center rounded-lg border-2 border-gray-200 text-gray-700 md:w-64">
            <div className="w-full bg-white">
              <div className="flex w-full items-center">
                <div className="mx-2">
                  <img
                    alt="sports-filter"
                    src="https://playo-website.gumlet.io/playo-website-v2/logos-icons/sports-filter.svg"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <select
                  className="w-full appearance-none bg-white text-sm font-semibold text-gray-700 focus:outline-none"
                  value={selectedSport}
                  onChange={handleSportFilter}
                >
                  {sportOptions.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
                <div className="mx-2 hidden md:flex">
                  <img
                    alt="down-arrow"
                    src="https://playo-website.gumlet.io/playo-website-v2/logos-icons/down-arrow-dark.svg"
                    className="h-2 w-3.5 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
