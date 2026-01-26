export default function HeroSearch() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold mb-3">
          Sports Venues in Chengicherla: Discover and Book
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 border rounded-lg px-3 sm:px-4 py-2"
            placeholder="Search by venue name"
          />
          <select className="border rounded-lg px-3 sm:px-4 py-2 sm:w-48">
            <option>All Sports</option>
            <option>Badminton</option>
            <option>Cricket</option>
            <option>Football</option>
          </select>
        </div>
      </div>
    </div>
  );
}
