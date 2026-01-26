import { useNavigate } from "react-router-dom";

export default function VenueCard({ venue }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/venues/venue/${venue.id}`)}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <div className="aspect-[16/9]">
        <img src={venue.image} alt={venue.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{venue.title}</h3>
        <div className="text-xs text-gray-500 mb-2">{venue.location}</div>
        <div className="flex items-center justify-between text-sm">
          <div>⭐ {venue.rating} ({venue.reviews})</div>
          <div className="font-medium">{venue.price}</div>
        </div>
      </div>
    </div>
  );
}
