import { useState, useEffect } from "react";
import { venues as staticVenues } from "./data";
import VenueCard from "./VenueCard";
import { Search } from "lucide-react";
import axiosInstance from "../../../api/axios";

const PAGE = 6;

export default function VenuesList() {
  const [visible, setVisible] = useState(PAGE);
  const [searchTerm, setSearchTerm] = useState("");
  const [allVenues, setAllVenues] = useState(staticVenues);

  useEffect(() => {
    // Fetch newly created venues from backend
    axiosInstance.get("/api/owners/centers")
      .then(res => {
        const dynamicVenues = res.data.map(center => ({
          id: center.id, // Using raw database ID
          title: center.name,
          location: `${center.city}`, // Shortened for matching style
          rating: 4.5, // Mock rating
          reviews: 0,
          price: "₹₹",
          sports: center.facilities ? center.facilities.split(",") : [],
          image: center.imageUrl || "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200"
        }));
        
        // Merge without ID clashes
        const merged = [...dynamicVenues, ...staticVenues.filter(sv => !dynamicVenues.find(dv => dv.id === sv.id))];
        setAllVenues(merged);
      })
      .catch(err => console.error("Failed to fetch dynamic venues", err));
  }, []);

  const showMore = () => setVisible(v => Math.min(v + PAGE, allVenues.length));

  const filteredVenues = allVenues.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.sports || []).some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const slice = filteredVenues.slice(0, visible);

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
