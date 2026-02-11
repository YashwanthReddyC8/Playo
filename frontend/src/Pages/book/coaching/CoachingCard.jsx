import { useNavigate } from "react-router-dom";

export default function CoachingCard({ center }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/venues/coaching/${center.id}`)}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <div className="aspect-[16/9]">
        <img src={center.image} className="w-full h-full object-cover" />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{center.name}</h3>
        <div className="text-xs text-gray-500">Coach: {center.coach}</div>
        <div className="text-xs text-gray-500 mb-2">{center.location}</div>
        <div className="text-sm">⭐ {center.rating} ({center.reviews})</div>
      </div>
    </div>
  );
}
