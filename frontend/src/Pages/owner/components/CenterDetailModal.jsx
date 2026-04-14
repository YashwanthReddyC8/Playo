import React from 'react';
import { X, MapPin, Phone, Mail, Zap, Calendar } from 'lucide-react';

export default function CenterDetailModal({ isOpen, onClose, center = null }) {
    if (!isOpen || !center) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b sticky top-0 bg-white">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800">{center.name}</h2>
                        <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-semibold ${center.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : center.status === 'INACTIVE'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {center.status}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image */}
                    {center.imageUrl && (
                        <div>
                            <img
                                src={center.imageUrl}
                                alt={center.name}
                                className="w-full h-64 object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/500x300?text=Sport+Center';
                                }}
                            />
                        </div>
                    )}

                    {/* Description */}
                    {center.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                            <p className="text-gray-700">{center.description}</p>
                        </div>
                    )}

                    {/* Location Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Location</h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <p className="font-medium text-gray-800">{center.address}</p>
                                    <p className="text-gray-600">
                                        {center.city}, {center.state} {center.postalCode}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 font-mono">
                                📍 Latitude: {center.latitude?.toFixed(6)}
                                <br />
                                📍 Longitude: {center.longitude?.toFixed(6)}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Phone className="text-blue-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-800">{center.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="text-blue-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-800">{center.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Facilities */}
                    <div className="grid grid-cols-1 gap-4">
                        {Array.isArray(center.facilities) && center.facilities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <Zap size={20} className="text-orange-600" />
                                    Facilities
                                </h3>
                                <div className="space-y-3">
                                    {center.facilities.map((facility) => (
                                        <div key={facility.id || facility.sportType} className="bg-gray-50 p-4 rounded-lg text-gray-700">
                                            <div className="font-semibold text-gray-800">{facility.sportType}</div>
                                            <div className="text-sm">{facility.totalCourts} courts</div>
                                            {Array.isArray(facility.slots) && facility.slots.length > 0 && (
                                                <div className="mt-2 space-y-2 text-sm text-gray-600">
                                                    {facility.slots.map((slot) => (
                                                        <div key={slot.id || `${slot.startTime}-${slot.endTime}`} className="rounded-md bg-white px-3 py-2 border border-gray-200">
                                                            <div className="font-medium text-gray-700">
                                                                {Array.isArray(slot.daysOfWeek) ? slot.daysOfWeek.join(', ') : 'MONDAY'}
                                                            </div>
                                                            <div>
                                                                {slot.startTime} - {slot.endTime} • ₹{slot.price} • max {slot.maxPlayers}
                                                            </div>
                                                            <div className={`text-xs font-semibold ${slot.isActive === false ? 'text-red-600' : 'text-green-600'}`}>
                                                                {slot.isActive === false ? 'Closed on selected days' : 'Open for booking'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(center.inactiveDates) && center.inactiveDates.length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <div className="font-semibold">Center-level closed dates</div>
                                <div className="mt-1">{center.inactiveDates.join(', ')}</div>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="border-t pt-4">
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    Created:
                                </span>
                                <span>{new Date(center.createdAt).toLocaleDateString()} {new Date(center.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    Last Updated:
                                </span>
                                <span>{new Date(center.updatedAt).toLocaleDateString()} {new Date(center.updatedAt).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <div className="p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
