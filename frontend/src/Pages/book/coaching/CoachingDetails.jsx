import { useParams } from "react-router-dom";
import { coachingCenters } from "./data";

export default function CoachingDetails() {
  const { id } = useParams();
  const center = coachingCenters.find((c) => c.id === Number(id));

  if (!center) return <div className="p-6 sm:p-10">Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <img
        src={center.image}
        className="w-full aspect-[16/9] object-cover rounded-xl"
      />
      <h1 className="text-xl sm:text-2xl font-bold mt-4">{center.name}</h1>
      <p className="text-gray-500">{center.location}</p>
      <p className="mt-2">Coach: {center.coach}</p>
      <div className="mt-4">
        ⭐ {center.rating} ({center.reviews})
      </div>
      <button className="mt-6 bg-green-600 text-black px-5 sm:px-6 py-3 rounded-lg">
        Enroll Now
      </button>
    </div>
  );
}
