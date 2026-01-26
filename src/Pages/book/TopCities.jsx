export default function TopCities() {
  const cities = ["Bangalore", "Chennai", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Kochi", "Vizag", "Guntur"];
  return (
    <div className="bg-white border-t mt-8 sm:mt-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h2 className="font-semibold mb-3 sm:mb-4">Top Sports Complexes in Cities</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
          {cities.map((c) => (
            <span key={c} className="hover:text-green-600 cursor-pointer">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
