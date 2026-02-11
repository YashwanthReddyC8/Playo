import { useState } from "react";
import { venues } from "./data";
import VenueCard from "./VenueCard";

const PAGE = 6;

export default function VenuesList() {
  const [visible, setVisible] = useState(PAGE);
  const showMore = () => setVisible(v => Math.min(v + PAGE, venues.length));

  const slice = venues.slice(0, visible);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {slice.map((v) => (
          <VenueCard key={v.id} venue={v} />
        ))}
      </div>

      {visible < venues.length && (
        <div className="flex justify-center mt-6 sm:mt-10">
          <button onClick={showMore} className="bg-green-600 hover:bg-green-700 text-white px-5 sm:px-6 py-2 rounded-lg font-semibold">
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
