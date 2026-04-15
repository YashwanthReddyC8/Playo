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
  console.log(venue)
  const locationQuery = encodeURIComponent(venue?.location || venue?.title || "Sports Center");
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
  return (
    <div
      onClick={() => navigate(`/venues/venue/${venue.id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={venue.image}
          alt={venue.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
            {venue.title}
          </h3>
          <div className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 sm:text-xs">
            {venue.price}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 sm:text-xs">
          <span className="line-clamp-1 max-w-[75%] sm:max-w-[70%]">
            {venue.location}
          </span>
          {Number.isFinite(venue?.distanceKm) && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 sm:text-xs">
              ~{venue.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-700 sm:text-sm">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium text-gray-900">{venue.rating}</span>
            <span className="text-[11px] text-gray-400 sm:text-xs">({venue.reviews})</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            window.open(mapsUrl, "_blank", "noopener,noreferrer");
          }}
          className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 sm:text-sm"
        >
          Open in Maps
        </button>
      </div>
    </div>
  );
}
