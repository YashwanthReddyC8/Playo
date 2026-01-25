import React from "react";
import Section from "./Section";

function Home_play() {
  const games = [
    { id: 1, title: "Badminton Doubles", day: "Mon", startTime: "7:00 AM", endTime: "8:00 AM", place: "Play Arena, Madhapur" },
    { id: 2, title: "Football 5v5", day: "Tue", startTime: "6:00 PM", endTime: "7:00 PM", place: "Turf Park, Gachibowli" },
    { id: 3, title: "Cricket Nets", day: "Wed", startTime: "5:00 AM", endTime: "6:00 AM", place: "Cricket Box, Kondapur" },
    { id: 4, title: "Tennis Rally", day: "Sun", startTime: "8:00 AM", endTime: "9:00 AM", place: "Ace Tennis Club, Jubilee Hills" },
  ];

  return (
    <Section title="Discover Games" action="SEE ALL GAMES">
      <div className="grid grid-cols-4 gap-6">
        {games.map((g) => (
          <div
            key={g.id}
            className="
              bg-white rounded-2xl p-4
              border border-gray-200
              hover:border-green-500
              hover:shadow-lg transition cursor-pointer
            "
          >
            <div className="font-semibold text-gray-900 mb-1">
              {g.title}
            </div>

            <div className="text-sm text-gray-500">
              {g.day} • {g.startTime} – {g.endTime}
            </div>

            <div className="text-sm text-gray-400 mt-1">
              {g.place}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Home_play;
