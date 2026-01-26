import { useParams } from "react-router-dom";
import { venues } from "./data";

export default function VenueDetails() {
  const { id } = useParams();
  const venue = venues.find((v) => v.id === Number(id));

  if (!venue) return <div className="p-6 sm:p-10">Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <img src={venue.image} className="w-full aspect-[16/9] object-cover rounded-xl" />
      <h1 className="text-xl sm:text-2xl font-bold mt-4">{venue.title}</h1>
      <p className="text-gray-500">{venue.location}</p>
      <div className="mt-4 flex flex-wrap gap-4 sm:gap-6">
        <div>⭐ {venue.rating} ({venue.reviews})</div>
        <div>{venue.price}</div>
      </div>
      <button className="mt-6 bg-green-600 text-white px-5 sm:px-6 py-3 rounded-lg">Book Now</button>
    </div>
  );
}
