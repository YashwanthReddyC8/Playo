import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTrainerStore from '../stores/trainerStore';
import { Star, MapPin, Phone, Mail, Calendar, Clock, Users, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrainerProfile() {
    const { trainerId } = useParams();
    const navigate = useNavigate();
    const { trainerDetail, sessions, isLoading, getTrainerProfile, getTrainerSessions, bookSession } =
        useTrainerStore();

    const [selectedSession, setSelectedSession] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        if (trainerId) {
            getTrainerProfile(trainerId);
            getTrainerSessions(trainerId);
        }
    }, [trainerId, getTrainerProfile, getTrainerSessions]);

    const handleBookSession = async () => {
        if (!selectedSession) {
            toast.error('Please select a session');
            return;
        }

        setBookingLoading(true);
        try {
            await bookSession(selectedSession.id, { numberOfParticipants: participantCount });
            setShowBookingModal(false);
            setSelectedSession(null);
            setParticipantCount(1);
            toast.success('Session booked successfully! Check your bookings.');
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setBookingLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!trainerDetail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">Trainer not found</p>
                <button
                    onClick={() => navigate('/trainers')}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    Back to Trainers
                </button>
            </div>
        );
    }

    const avgRating =
        trainerDetail.ratings && trainerDetail.ratings.length > 0
            ? (trainerDetail.ratings.reduce((sum, r) => sum + r.rating, 0) / trainerDetail.ratings.length).toFixed(1)
            : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <button
                        onClick={() => navigate('/trainers')}
                        className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2 mb-4"
                    >
                        ← Back to Trainers
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                            {/* Profile Picture */}
                            <div className="mb-4">
                                <img
                                    src={trainerDetail.profilePictureUrl || 'https://via.placeholder.com/300'}
                                    alt={trainerDetail.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>

                            {/* Basic Info */}
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{trainerDetail.name}</h1>
                            <p className="text-orange-500 font-semibold mb-4">{trainerDetail.sport}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            className={i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {avgRating} ({trainerDetail.ratings?.length || 0} reviews)
                                </span>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-4 pb-4 border-b">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone size={18} className="text-orange-500" />
                                    <span className="text-sm">{trainerDetail.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail size={18} className="text-orange-500" />
                                    <span className="text-sm">{trainerDetail.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <MapPin size={18} className="text-orange-500" />
                                    <span className="text-sm">{trainerDetail.city}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center py-3 bg-orange-50 rounded-lg">
                                    <Trophy size={24} className="mx-auto text-orange-500 mb-1" />
                                    <p className="text-2xl font-bold text-gray-900">{trainerDetail.yearsOfExperience}</p>
                                    <p className="text-xs text-gray-600">Years Exp</p>
                                </div>
                                <div className="text-center py-3 bg-orange-50 rounded-lg">
                                    <Users size={24} className="mx-auto text-orange-500 mb-1" />
                                    <p className="text-2xl font-bold text-gray-900">{trainerDetail.totalSessions || 0}</p>
                                    <p className="text-xs text-gray-600">Sessions</p>
                                </div>
                            </div>

                            {/* Book Button */}
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Book a Session
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="flex border-b">
                                {['about', 'sessions', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 font-semibold transition-colors ${activeTab === tab
                                                ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {/* About Tab */}
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                                            <p className="text-gray-700 leading-relaxed">{trainerDetail.bio || 'No bio available'}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3">Specializations</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {trainerDetail.specializations && trainerDetail.specializations.length > 0 ? (
                                                    trainerDetail.specializations.map((spec, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                                            {spec}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-600">No specializations listed</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3">Certifications</h3>
                                            <ul className="space-y-2">
                                                {trainerDetail.certifications && trainerDetail.certifications.length > 0 ? (
                                                    trainerDetail.certifications.map((cert, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                                                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                            {cert}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-600">No certifications listed</p>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Sessions Tab */}
                                {activeTab === 'sessions' && (
                                    <div className="space-y-4">
                                        {sessions && sessions.length > 0 ? (
                                            sessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors"
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{session.title}</h4>
                                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar size={16} />
                                                                    {new Date(session.startDate).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock size={16} />
                                                                    {session.startTime}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Users size={16} />
                                                                    {session.capacity} slots
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-orange-500">₹{session.price}</p>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSession(session);
                                                                    setShowBookingModal(true);
                                                                }}
                                                                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                                                            >
                                                                Book Now
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-600 text-center py-8">No sessions available</p>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === 'reviews' && (
                                    <div className="space-y-4">
                                        {trainerDetail.ratings && trainerDetail.ratings.length > 0 ? (
                                            trainerDetail.ratings.map((review, idx) => (
                                                <div key={idx} className="border-b pb-4 last:border-b-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                                                        <div className="flex gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={
                                                                        i < review.rating
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{review.comment}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-600 text-center py-8">No reviews yet</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Book a Session</h3>

                        {selectedSession && (
                            <div className="bg-orange-50 rounded-lg p-4 mb-4">
                                <p className="font-semibold text-gray-900 mb-2">{selectedSession.title}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                    <div>
                                        <p className="text-gray-600">Date</p>
                                        <p className="font-semibold">{new Date(selectedSession.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Time</p>
                                        <p className="font-semibold">{selectedSession.startTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Price per person</p>
                                        <p className="font-semibold">₹{selectedSession.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Capacity</p>
                                        <p className="font-semibold">{selectedSession.capacity} slots</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Number of Participants</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedSession?.capacity}
                                value={participantCount}
                                onChange={(e) => setParticipantCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        {selectedSession && (
                            <div className="bg-gray-100 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-orange-500">₹{selectedSession.price * participantCount}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBookSession}
                                disabled={bookingLoading}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
                            >
                                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
