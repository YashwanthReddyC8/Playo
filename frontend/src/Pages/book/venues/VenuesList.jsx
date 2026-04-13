import { useState, useEffect } from "react";
import { venues as staticVenues } from "./data";
import VenueCard from "./VenueCard";
import { Search } from "lucide-react";
import axiosInstance from "../../../api/axios";

const PAGE = 6;

export default function VenuesList({ initialSearchTerm = "", initialSportFilter = "All Sports" }) {
  const [visible, setVisible] = useState(PAGE);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sportFilter, setSportFilter] = useState(initialSportFilter);
  const [allVenues, setAllVenues] = useState(staticVenues);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [error, setError] = useState(null);

  // Fetch venues from API
  useEffect(() => {
    setLoadingVenues(true);
    setError(null);
    
    axiosInstance.get("/api/owners/centers/public/all")
      .then(res => {
        console.log("✅ Venues fetched from API:", res.data);
        
        const dynamicVenues = (res.data || []).map(center => ({
          id: center.id,
          title: center.name,
          location: center.city || "Unknown",
          rating: center.rating || 4.5,
          reviews: center.reviews || 0,
          price: center.price ? `₹${center.price}` : "₹₹",
          sports: center.facilities ? center.facilities.split(",").map(s => s.trim()) : [],
          image: center.imageUrl || "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200"
        }));
        
        // Merge dynamic venues with static venues (dynamic first for priority)
        const merged = [...dynamicVenues, ...staticVenues.filter(sv => !dynamicVenues.find(dv => dv.id === sv.id))];
        setAllVenues(merged);
        setLoadingVenues(false);
      })
      .catch(err => {
        console.warn("⚠️ Failed to fetch from API, using static venues only:", err.message);
        setAllVenues(staticVenues);
        setError(null); // Don't show error, just use static data
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

  // Filter venues based on search term AND sport filter
  const filteredVenues = allVenues.filter(v => {
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
      <div className="mb-8 max-w-2xl mx-auto">
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
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          {error}
        </div>
      )}

      {filteredVenues.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-medium">
          No venues found matching your search.
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
