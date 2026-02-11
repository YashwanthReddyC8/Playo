import { useRef, useState, useEffect, useCallback } from "react";

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
  const detectLocation = useCallback(() => {
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
  }, [KEY]);

  useEffect(() => {
    if (!location) {
      detectLocation();
    }
    console.log("Location changed:", location);
  }, [location, detectLocation, KEY]);


  return (
    <div className="relative w-[340px]">
      <div className="
      flex items-center
      bg-gray-100 px-4 py-2 rounded-full
      text-sm border border-gray-200
      focus-within:border-green-500
    ">
        <img
          className="mr-2"
          src="https://cdn-icons-png.flaticon.com/512/9101/9101314.png"
          width="18"
          height="18"
          alt="location"
        />

        <input
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          placeholder="Enter your location"
          className="
          bg-transparent outline-none
          text-sm text-gray-800
          placeholder-gray-500 flex-1
        "
        />

        <button onClick={detectLocation} className="ml-2 text-lg bg-gray-100" style={{ backgroundColor: "#f3f4f6" }}>
          {loading ? "⏳" : <img src="/location-target-svgrepo-com.svg" width="20" height="20" alt="" title="" className="img-small" />}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="
        absolute top-12 left-0 w-full
        bg-white shadow-xl rounded-xl
        overflow-hidden z-50
      ">
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
              className="
              px-4 py-2 text-sm
              text-gray-800
              hover:bg-green-50
              cursor-pointer
            "
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
