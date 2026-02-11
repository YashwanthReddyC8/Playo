import { useState } from "react";
import { coachingCenters } from "./data";
import CoachingCard from "./CoachingCard";

const PAGE = 6;

export default function CoachingList() {
  const [visible, setVisible] = useState(PAGE);
  const showMore = () =>
    setVisible((v) => Math.min(v + PAGE, coachingCenters.length));

  const slice = coachingCenters.slice(0, visible);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {slice.map((c) => (
          <CoachingCard key={c.id} center={c} />
        ))}
      </div>

      {visible < coachingCenters.length && (
        <div className="flex justify-center mt-6 sm:mt-10">
          <button
            onClick={showMore}
            className="bg-green-600 hover:bg-green-700 text-black px-5 sm:px-6 py-2 rounded-lg font-semibold"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
