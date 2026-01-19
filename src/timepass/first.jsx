import React, { useState } from "react";
import Header from "../components/Header";

// NOTE:
// This is a PIXEL-CLOSE Playo homepage CLONE using the provided screenshot as reference.
// - All data is HARDCODED
// - Uses Tailwind CSS
// - Drop this file into a Vite/CRA + Tailwind project and render <PlayoHome /> in App.jsx

const venues = [
  { id: 1, name: "RSA Ravi's Turf", dist: "5 km", price: "₹2180/hr", rating: 4.7, img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800" },
  { id: 2, name: "Game Theory - Joseph's", dist: "4.1 km", price: "₹1200/hr", rating: 4.2, img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800" },
  { id: 3, name: "Wellness Sports Inc", dist: "2.7 km", price: "₹900/hr", rating: 4.3, img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800" },
  { id: 4, name: "Hatchback Arena", dist: "6.2 km", price: "₹1500/hr", rating: 4.1, img: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=800" },
];

const games = [
  { id: 1, title: "Badminton Doubles", time: "Mon 7:00 AM", karma: 2950 },
  { id: 2, title: "Football 5v5", time: "Tue 6:00 PM", karma: 1840 },
  { id: 3, title: "Cricket Nets", time: "Wed 5:00 AM", karma: 3220 },
  { id: 4, title: "Tennis Rally", time: "Sun 8:00 AM", karma: 2100 },
];

const sports = [
  { name: "Badminton", img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800" },
  { name: "Football", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800" },
  { name: "Cricket", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800" },
  { name: "Swimming", img: "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=800" },
  { name: "Tennis", img: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=800" },
  { name: "Table Tennis", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800" },
];

export default function PlayoHome() {
  const [location, setLocation] = useState("");
  return (
    <div className="bg-[#f4f6f5] min-h-screen text-gray-800">
      <Header />
      {/* HERO */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-8 px-6 py-12 items-center">
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm w-fit">
                <span>📍</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                  className="bg-transparent outline-none text-sm placeholder-gray-500"
                />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              BOOK SPORTS VENUES.<br />
              JOIN GAMES.<br />
              FIND TRAINERS NEAR YOU.
            </h1>
            <p className="text-gray-600 max-w-md">
              The World's Largest Sports Community to Book Venues, Find Trainers, and Join Games Near You.
            </p>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <img className="rounded-2xl object-cover h-40 w-full" src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800" />
            <img className="rounded-2xl object-cover h-40 w-full" src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800" />
            <img className="rounded-2xl object-cover h-40 w-full" src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800" />
            <img className="rounded-2xl object-cover h-40 w-full" src="https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=800" />
          </div>
        </div>
      </div>

      {/* BOOK VENUES */}
      <Section title="Book Venues" action="SEE ALL VENUES">
        <div className="grid grid-cols-4 gap-6">
          {venues.map(v => (
            <div key={v.id} className="bg-white rounded-2xl overflow-hidden shadow">
              <img src={v.img} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="font-semibold">{v.name}</div>
                <div className="text-sm text-gray-500">{v.dist}</div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-600">⭐ {v.rating}</span>
                  <span className="font-semibold">{v.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* DISCOVER GAMES */}
      <Section title="Discover Games" action="SEE ALL GAMES">
        <div className="grid grid-cols-4 gap-6">
          {games.map(g => (
            <div key={g.id} className="bg-white rounded-2xl p-4 shadow">
              <div className="font-semibold mb-1">{g.title}</div>
              <div className="text-sm text-gray-500">{g.time}</div>
              <div className="text-sm mt-2">🔥 Karma: {g.karma}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* POPULAR SPORTS */}
      <Section title="Popular Sports">
        <div className="grid grid-cols-6 gap-4">
          {sports.map(s => (
            <div key={s.name} className="relative rounded-2xl overflow-hidden h-40">
              <img src={s.img} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-3 left-3 text-white font-semibold">{s.name}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* GREEN CTA STRIP */}
      <div className="bg-green-600 py-12 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-6 px-6">
          {[
            "Find Your Coach",
            "List Your Venue",
            "Tell Us What You Think",
            "Get Ideas"
          ].map(t => (
            <div key={t} className="bg-green-700 rounded-2xl p-6 text-white font-semibold text-center">{t}</div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-bold mb-2">PLAYO</div>
            <div className="text-gray-500">© 2026 Techsam Solutions Pvt Ltd</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <div>About</div><div>Careers</div><div>Contact</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Social</div>
            <div>Instagram</div><div>Facebook</div><div>LinkedIn</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Legal</div>
            <div>Privacy Policy</div><div>Terms</div><div>Cancellation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Section({ title, action, children }) {
  return (
    <div className="max-w-7xl mx-auto px-6 mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {action && <span className="text-green-600 text-sm font-semibold cursor-pointer">{action}</span>}
      </div>
      {children}
    </div>
  );
}
