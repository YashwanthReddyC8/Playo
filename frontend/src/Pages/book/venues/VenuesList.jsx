import { useState, useEffect } from "react";
import VenueCard from "./VenueCard";
import { Search } from "lucide-react";
import axiosInstance from "../../../api/axios";

const PAGE = 6;

const toRadians = (value) => (value * Math.PI) / 180;

const haversineKm = (fromLat, fromLng, toLat, toLng) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export default function VenuesList({ initialSearchTerm = "", initialSportFilter = "All Sports" }) {
  const [visible, setVisible] = useState(PAGE);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sportFilter, setSportFilter] = useState(initialSportFilter);
  const [allVenues, setAllVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [error, setError] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserCoords(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Fetch venues from API
  useEffect(() => {
    setLoadingVenues(true);
    setError(null);

    axiosInstance.get("/api/owners/centers/public/all")
      .then(res => {
        console.log("✅ Venues fetched from API:", res.data);

        const dynamicVenues = (res.data || []).map(center => {
          const facilities = Array.isArray(center.facilities) ? center.facilities : [];
          const sports = facilities
            .map((facility) => facility?.sportType)
            .filter(Boolean);
          const slotPrices = facilities.flatMap((facility) =>
            Array.isArray(facility?.slots)
              ? facility.slots
                .map((slot) => Number(slot?.price))
                .filter((price) => Number.isFinite(price) && price > 0)
              : []
          );
          const minPrice = slotPrices.length > 0 ? Math.min(...slotPrices) : null;

          return {
            id: center.id,
            title: center.name,
            location: center.city || "Unknown",
            rating: center.rating || 4.5,
            reviews: center.reviews || 0,
            price: minPrice ? `₹${minPrice}` : "₹₹",
            sports,
            image: center.imageUrl || "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200",
            latitude: Number(center.latitude),
            longitude: Number(center.longitude),
          };
        });

        setAllVenues(dynamicVenues);
        setLoadingVenues(false);
      })
      .catch(err => {
        console.warn("⚠️ Failed to fetch venues:", err.message);
        setAllVenues([]);
        setError("Failed to load venues. Please try again.");
        setLoadingVenues(false);
      });
  }, []);

  // Update search term when hero search changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setVisible(PAGE);
  }, [initialSearchTerm]);

  // Update sport filter when hero sport filter changes
  useEffect(() => {
    setSportFilter(initialSportFilter);
    setVisible(PAGE);
  }, [initialSportFilter]);

  const showMore = () => setVisible(v => Math.min(v + PAGE, allVenues.length));

  const sportsOptions = [
    "All Sports",
    ...Array.from(
      new Set(
        allVenues.flatMap((venue) => Array.isArray(venue.sports) ? venue.sports : [])
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const venuesWithDistance = allVenues
    .map((venue) => {
      if (!userCoords || !Number.isFinite(venue.latitude) || !Number.isFinite(venue.longitude)) {
        return {
          ...venue,
          distanceKm: null,
        };
      }

      return {
        ...venue,
        distanceKm: haversineKm(
          userCoords.latitude,
          userCoords.longitude,
          venue.latitude,
          venue.longitude
        ),
      };
    })
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  // Filter venues based on search term AND sport filter
  const filteredVenues = venuesWithDistance.filter(v => {
    const matchesSearch = !searchTerm ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.sports || []).some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSport = sportFilter === "All Sports" ||
      (v.sports || []).some(sport => sport.toLowerCase().includes(sportFilter.toLowerCase()));

    return matchesSearch && matchesSport;
  });

  const slice = filteredVenues.slice(0, visible);

  if (loadingVenues) {
    return <div className="text-center py-10 text-gray-500">Loading venues...</div>;
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="hidden mb-8 max-w-2xl mx-auto">
        <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-gray-200">
          <div className="grid place-items-center h-full w-12 text-gray-300">
            <Search size={20} />
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 placeholder-gray-400 bg-transparent"
            type="text"
            id="search"
            placeholder="Search venues by name, location, or sport..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisible(PAGE); // Reset pagination on search
            }}
          />
        </div>
        <div className="mt-3">
          <select
            className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
            value={sportFilter}
            onChange={(e) => {
              setSportFilter(e.target.value);
              setVisible(PAGE);
            }}
          >
            {sportsOptions.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          {error}
        </div>
      )}

      {filteredVenues.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-medium">
          {allVenues.length === 0 ? "No venues available right now." : "No venues found matching your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {slice.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}

      {visible < filteredVenues.length && (
        <div className="flex justify-center mt-6 sm:mt-10">
          <button onClick={showMore} className="bg-green-600 hover:bg-green-700 text-white px-5 sm:px-6 py-2 rounded-lg font-semibold">
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
