import { useRef, useState } from "react";

const KEY = import.meta.env.VITE_MAPPLS_KEY;

export default function LocationSearch({ location, setLocation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  // 🔍 AUTOSUGGEST (YOUR PROVIDED ENDPOINT)
  const fetchSuggestions = async (text) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `/mappls/search/places/autosuggest/json?query=${encodeURIComponent(
          text
        )}&access_token=${KEY}`,
        { signal: abortRef.current.signal }
      );

      const data = await res.json();

      console.log("Autosuggest:", data);

      if (data?.suggestedLocations) {
        setSuggestions(data.suggestedLocations);
      } else if (data?.results) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      console.error("Autosuggest failed", e);
      setSuggestions([]);
    }
  };

  // 📍 GPS DETECT
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `/mappls/search/address/rev-geocode?lat=${lat}&lng=${lng}&access_token=${KEY}`
          );
          const data = await res.json();

          console.log("Reverse:", data);

          if (data?.results?.length) {
            setLocation(data.results[0].formatted_address);
            setSuggestions([]);
          }
        } catch (e) {
          alert("Reverse geocode failed");
        }

        setLoading(false);
      },
      (err) => {
        alert("GPS error: " + err.message);
        setLoading(false);
      }
    );
  };

  return (
    <div className="relative w-[340px]">
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full text-sm ml-2" >
        {/* <span className="mr-2">📍</span> */}
        <img className="mr-1" src="https://cdn-icons-png.flaticon.com/512/9101/9101314.png " width="20" height="20" alt="" title="" class="img-small"></img>
        <input
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          placeholder="Enter your location"
          className="bg-transparent outline-none text-sm placeholder-gray-500 flex-1"
        />

        <button onClick={detectLocation} className="ml-2 text-lg">
          {loading ? "⏳" : <img src="/location-target-svgrepo-com.svg" width="20" height="20" alt="" title="" class="img-small"/>}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-white shadow-xl rounded-xl overflow-hidden z-50">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => {
                setLocation(
                  s.placeName ||
                    s.place_address ||
                    s.displayName ||
                    s.formatted_address
                );
                setSuggestions([]);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {s.placeName ||
                s.place_address ||
                s.displayName ||
                s.formatted_address}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
