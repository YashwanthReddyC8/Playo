import React from "react";
import Section from "./Section";

function Home_book() {
  const venues = [
    { id: 1, name: "RSA Ravi's Turf", dist: "5 km", price: "₹2180/hr", rating: 4.7, img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800" },
    { id: 2, name: "Game Theory - Joseph's", dist: "4.1 km", price: "₹1200/hr", rating: 4.2, img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800" },
    { id: 3, name: "Wellness Sports Inc", dist: "2.7 km", price: "₹900/hr", rating: 4.3, img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800" },
    { id: 4, name: "Hatchback Arena", dist: "6.2 km", price: "₹1500/hr", rating: 4.1, img: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=800" },
  ];

  return (
    <Section title="Book Venues" action="SEE ALL VENUES">
      <div className="grid grid-cols-4 gap-6">
        {venues.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition"
          >
            <img src={v.img} className="h-40 w-full object-cover" alt={v.name} />

            <div className="p-4">
              <div className="font-semibold text-gray-900">{v.name}</div>
              <div className="text-sm text-gray-500">{v.dist}</div>

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
    </Section>
  );
}

export default Home_book;
