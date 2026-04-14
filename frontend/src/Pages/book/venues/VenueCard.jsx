import { useNavigate } from "react-router-dom";

export default function VenueCard({ venue }) {
  const navigate = useNavigate();
  const latitude = Number(venue?.latitude);
  const longitude = Number(venue?.longitude);
  const hasCoords =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;
  const locationQuery = encodeURIComponent(venue?.location || venue?.title || "Sports Center");
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
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
        {Number.isFinite(venue?.distanceKm) && (
          <div className="text-xs text-green-700 mb-2 font-medium">
            {venue.distanceKm.toFixed(1)} km away
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <div>⭐ {venue.rating} ({venue.reviews})</div>
          <div className="font-medium">{venue.price}</div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            window.open(mapsUrl, "_blank", "noopener,noreferrer");
          }}
          className="mt-3 w-full border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Open in Maps
        </button>
      </div>
    </div>
  );
}
