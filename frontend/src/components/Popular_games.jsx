import React, { useEffect, useState } from "react";
import Section from "./Section";
import axiosInstance from "../api/axios";

function Popular_games({ onSportClick }) {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    axiosInstance.get("/api/owners/centers/public/all")
      .then((res) => {
        const facilitySports = (res.data || [])
          .flatMap((center) => Array.isArray(center?.facilities) ? center.facilities : [])
          .map((facility) => facility?.sportType)
          .filter(Boolean);

        const uniqueSports = Array.from(new Set(facilitySports)).sort((a, b) => a.localeCompare(b));

        setSports(uniqueSports.map((name) => ({
          name,
          img: `https://source.unsplash.com/600x400/?${encodeURIComponent(name)},sport`,
        })));
      })
      .catch(() => {
        setSports([]);
      });
  }, []);

  return (
    <Section title="Popular Sports">
      <div
        className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-6
        gap-3 sm:gap-4
      "
      >
        {sports.map((s) => (
          <div
            key={s.name}
            onClick={() => onSportClick?.(s.name)}
            className="
            relative rounded-2xl overflow-hidden
            h-28 sm:h-32 md:h-36 lg:h-40
            group cursor-pointer
            active:scale-[0.97] transition-transform
          "
          >
            <img
              src={s.img}
              alt={s.name}
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

            <div
              className="
              absolute bottom-3 left-3
              text-white font-semibold text-sm sm:text-base
              group-hover:text-orange-400 transition
            "
            >
              {s.name}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Popular_games;
