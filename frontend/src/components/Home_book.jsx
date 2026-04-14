import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "./Section";
import axiosInstance from "../api/axios";

function Home_book() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    axiosInstance.get("/api/owners/centers/public/all")
      .then((res) => {
        const mapped = (res.data || []).map((center) => {
          const facilities = Array.isArray(center.facilities) ? center.facilities : [];
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
            name: center.name,
            dist: center.city || "Unknown",
            price: minPrice ? `₹${minPrice}/slot` : "Price unavailable",
            rating: center.rating || 4.5,
            img: center.imageUrl || "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800",
          };
        });

        setVenues(mapped.slice(0, 4));
      })
      .catch(() => {
        setVenues([]);
      });
  }, []);

  const visibleVenues = useMemo(() => venues.slice(0, 4), [venues]);

  return (
    <Section title="Book Venues" action="SEE ALL VENUES">
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-4 sm:gap-6
        "
      >
        {visibleVenues.map((v) => (
          <div
            key={v.id}
            onClick={() => navigate(`/venues/venue/${v.id}`)}
            className="
              bg-white rounded-2xl overflow-hidden
              border border-gray-200
              hover:shadow-lg transition
              active:scale-[0.98]
            "
          >
            <img
              src={v.img}
              alt={v.name}
              className="
                w-full object-cover
                h-36 sm:h-40 md:h-44
              "
            />

            <div className="p-4">
              <div className="font-semibold text-gray-900 truncate">
                {v.name}
              </div>

              <div className="text-sm text-gray-500">
                {v.dist}
              </div>

              <div className="flex justify-between mt-2 text-sm">
                <span className="text-green-600 font-semibold">
                  ⭐ {v.rating}
                </span>
                <span className="font-semibold text-blue-500">
                  {v.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleVenues.length === 0 && (
        <div className="text-sm text-gray-500">No venues available right now.</div>
      )}
    </Section>
  );
}

export default Home_book;
