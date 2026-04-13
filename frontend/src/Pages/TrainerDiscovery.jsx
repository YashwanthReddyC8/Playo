import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTrainerStore from '../stores/trainerStore';
import { Star, MapPin, Trophy, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrainerDiscovery() {
    const navigate = useNavigate();
    const { trainers, totalPages, currentPage, isLoading, getTrainers } = useTrainerStore();

    const [page, setPage] = useState(1);
    const [search, setSearh] = useState('');
    const [sport, setSport] = useState('');
    const [city, setCity] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    // Common sports for filtering
    const sports = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Swimming', 'Yoga', 'Boxing'];

    useEffect(() => {
        getTrainers(page, 12, sport, city, search);
    }, [page, sport, city, search, getTrainers]);

    const handleSearch = (e) => {
        setSearh(e.target.value);
        setPage(1);
    };

    const handleSportFilter = (selectedSport) => {
        setSport(selectedSport === sport ? '' : selectedSport);
        setPage(1);
    };

    const handleCityFilter = (e) => {
        setCity(e.target.value);
        setPage(1);
    };

    const handleReset = () => {
        setSearh('');
        setSport('');
        setCity('');
        setPage(1);
    };

    const getAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        return (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-12">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">Find Your Trainer</h1>
                    <p className="text-orange-100">Discover professional trainers and book sessions</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search trainers by name or sport..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter size={20} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {/* Filters */}
                    {filterOpen && (
                        <div className="mt-4 pt-4 border-t">
                            {/* City Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                                <input
                                    type="text"
                                    placeholder="Enter city name"
                                    value={city}
                                    onChange={handleCityFilter}
                                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            {/* Sport Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Sports</label>
                                <div className="flex flex-wrap gap-2">
                                    {sports.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleSportFilter(s)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${sport === s
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-orange-500 hover:text-orange-600 font-semibold text-sm"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {(search || sport || city) && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {search && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                Search: {search}
                                <button onClick={() => setSearh('')} className="hover:text-blue-900">
                                    ✕
                                </button>
                            </span>
                        )}
                        {sport && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                                Sport: {sport}
                                <button onClick={() => setSport('')} className="hover:text-green-900">
                                    ✕
                                </button>
                            </span>
                        )}
                        {city && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                                City: {city}
                                <button onClick={() => setCity('')} className="hover:text-purple-900">
                                    ✕
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Trainers Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : trainers && trainers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {trainers.map((trainer) => {
                            const avgRating = getAverageRating(trainer.ratings);
                            return (
                                <div
                                    key={trainer.id}
                                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/trainer/${trainer.id}`)}
                                >
                                    {/* Trainer Image */}
                                    <div className="relative h-48 overflow-hidden bg-gray-200">
                                        <img
                                            src={trainer.profilePictureUrl || 'https://via.placeholder.com/300x200'}
                                            alt={trainer.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-gray-900 text-sm">{avgRating}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{trainer.name}</h3>
                                            <p className="text-orange-500 font-semibold text-sm">{trainer.sport}</p>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <MapPin size={16} className="text-orange-500" />
                                            {trainer.city}
                                        </div>

                                        {/* Experience */}
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Trophy size={16} className="text-orange-500" />
                                            {trainer.yearsOfExperience} years experience
                                        </div>

                                        {/* Bio */}
                                        <p className="text-gray-700 text-sm line-clamp-2">{trainer.bio}</p>

                                        {/* Reviews Count */}
                                        <div className="text-xs text-gray-500">
                                            {trainer.ratings?.length || 0} reviews
                                        </div>

                                        {/* View Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/trainer/${trainer.id}`);
                                            }}
                                            className="w-full mt-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-600 text-lg mb-4">No trainers found matching your criteria</p>
                        {(search || sport || city) && (
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {trainers && trainers.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>

                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = Math.max(1, page - 2) + i;
                            if (pageNum > totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-10 h-10 rounded-lg transition-colors ${page === pageNum
                                            ? 'bg-orange-500 text-white font-semibold'
                                            : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
