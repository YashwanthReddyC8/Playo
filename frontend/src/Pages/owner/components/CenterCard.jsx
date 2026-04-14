import React from 'react';
import { Trash2, Edit2, MapPin, Phone, Mail, Eye, CalendarCheck } from 'lucide-react';

export default function CenterCard({ center, onView, onBookings, onEdit, onDelete, isDeleting = false }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Image */}
            {center.imageUrl && (
                <img
                    src={center.imageUrl}
                    alt={center.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => onView(center)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Sport+Center';
                    }}
                />
            )}

            {/* Clickable overlay for text content */}
            <div
                onClick={() => onView(center)}
                className="p-4 cursor-pointer hover:bg-green-50 transition-colors"
            >
                {/* Name and Status */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{center.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${center.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : center.status === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {center.status}
                    </span>
                </div>

                {/* Description */}
                {center.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{center.description}</p>
                )}

                {/* Info Grid */}
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-blue-600" />
                        <span>{center.address}, {center.city}, {center.state} {center.postalCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={16} className="text-blue-600" />
                        <span>{center.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <Mail size={16} className="text-blue-600" />
                        <span>{center.email}</span>
                    </div>
                </div>

                {/* Facilities */}
                {Array.isArray(center.facilities) && center.facilities.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Facilities:</p>
                        <div className="space-y-2">
                            {center.facilities.map((facility) => (
                                <div key={facility.id || facility.sportType} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                    <div className="font-semibold text-gray-800">{facility.sportType}</div>
                                    <div>{facility.totalCourts} courts</div>
                                    {Array.isArray(facility.slots) && facility.slots.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            {facility.slots.map((slot) => {
                                                const daysLabel = Array.isArray(slot.daysOfWeek) ? slot.daysOfWeek.join(', ') : 'MONDAY';
                                                const statusLabel = slot.isActive === false ? 'Closed' : 'Active';
                                                return `${daysLabel}: ${slot.startTime} - ${slot.endTime} • ₹${slot.price} • max ${slot.maxPlayers} • ${statusLabel}`;
                                            }).join(' | ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Array.isArray(center.inactiveDates) && center.inactiveDates.length > 0 && (
                    <p className="text-xs text-red-600 mb-3">
                        Center closed on: {center.inactiveDates.join(', ')}
                    </p>
                )}

                {/* Coordinates */}
                <p className="text-xs text-gray-500 mb-4">
                    📍 {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t space-y-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(center)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <Eye size={16} />
                        Details
                    </button>
                    <button
                        onClick={() => onBookings(center)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        <CalendarCheck size={16} />
                        Bookings
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(center)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit2 size={16} />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(center.id)}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
