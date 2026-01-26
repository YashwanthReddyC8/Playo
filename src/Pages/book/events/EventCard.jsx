import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/venues/event/${event.id}`)}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <div className="aspect-[16/9]">
        <img src={event.image} className="w-full h-full object-cover" />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h3>
        <div className="text-xs text-gray-500">{event.location}</div>
        <div className="text-xs text-gray-500">{event.date}</div>
      </div>
    </div>
  );
}
