import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const SPORT_OPTIONS = ['Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball'];
const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const pad = (value) => String(value).padStart(2, '0');

const dateKeyFromParts = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

const getCurrentMonthCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstWeekday = firstDay.getDay(); // 0=Sun, 1=Mon ...

    const dates = [];
    for (let day = 1; day <= lastDay.getDate(); day += 1) {
        const current = new Date(year, month, day);
        dates.push({
            key: dateKeyFromParts(year, month, day),
            label: day,
            weekday: current.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        });
    }

    return {
        monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        firstWeekday,
        dates,
    };
};

const toWeekDay = (value) => {
    if (!value) return 'MONDAY';
    const normalized = String(value).trim().toUpperCase();
    if (WEEK_DAYS.includes(normalized)) return normalized;

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    }

    return 'MONDAY';
};

const createEmptySlot = () => ({
    daysOfWeek: ['MONDAY'],
    isActive: true,
    inactiveDates: [],
    startTime: '06:00',
    endTime: '07:00',
    price: '',
    maxPlayers: '',
});

const normalizeTimeValue = (value, fallback = '06:00') => {
    if (!value) return fallback;
    const raw = String(value).trim();
    if (raw.length >= 5) {
        return raw.slice(0, 5);
    }
    return fallback;
};

const createEmptyFacility = () => ({
    sportType: SPORT_OPTIONS[0],
    totalCourts: 1,
    slots: [createEmptySlot()],
});

const normalizeDateList = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean).map((date) => String(date).trim()).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
        return value.split(',').map((date) => date.trim()).filter(Boolean);
    }
    return [];
};

const normalizeFacilities = (facilities) => {
    let parsedFacilities = facilities;

    if (typeof parsedFacilities === 'string') {
        try {
            parsedFacilities = JSON.parse(parsedFacilities);
        } catch {
            parsedFacilities = [];
        }
    }

    if (!Array.isArray(parsedFacilities) || parsedFacilities.length === 0) {
        return [createEmptyFacility()];
    }

    return parsedFacilities.map((facility) => ({
        sportType: facility.sportType || SPORT_OPTIONS[0],
        totalCourts: facility.totalCourts || 1,
        slots: Array.isArray(facility.slots) && facility.slots.length > 0
            ? facility.slots.map((slot) => ({
                daysOfWeek: Array.isArray(slot.daysOfWeek) && slot.daysOfWeek.length > 0
                    ? slot.daysOfWeek.map(toWeekDay)
                    : slot.slotDate
                        ? [toWeekDay(slot.slotDate)]
                        : ['MONDAY'],
                isActive: slot.isActive ?? true,
                inactiveDates: Array.isArray(slot.inactiveDates)
                    ? slot.inactiveDates
                    : typeof slot.inactiveDates === 'string' && slot.inactiveDates.trim()
                        ? slot.inactiveDates.split(',').map((date) => date.trim()).filter(Boolean)
                        : [],
                startTime: normalizeTimeValue(slot.startTime, '06:00'),
                endTime: normalizeTimeValue(slot.endTime, '07:00'),
                price: slot.price || '',
                maxPlayers: slot.maxPlayers || '',
            }))
            : [createEmptySlot()],
    }));
};

export default function CenterFormModal({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
    const defaultFormData = {
            name: '',
            description: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            latitude: '',
            longitude: '',
            phoneNumber: '',
            email: '',
            imageUrl: '',
            inactiveDates: [],
            facilities: [createEmptyFacility()],
        };

    const [formData, setFormData] = useState(() => (
        initialData
            ? {
                ...initialData,
                facilities: normalizeFacilities(initialData.facilities),
            }
            : defaultFormData
    ));
    const [errors, setErrors] = useState({});

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                postalCode: initialData.postalCode || '',
                latitude: initialData.latitude || '',
                longitude: initialData.longitude || '',
                phoneNumber: initialData.phoneNumber || '',
                email: initialData.email || '',
                imageUrl: initialData.imageUrl || '',
                inactiveDates: normalizeDateList(initialData.inactiveDates),
                facilities: normalizeFacilities(initialData.facilities),
            });
        } else {
            setFormData(defaultFormData);
        }
        setErrors({});
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Center name is required';
        }

        if (!formData.address?.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city?.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state?.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.postalCode?.trim()) {
            newErrors.postalCode = 'Postal code is required';
        }

        if (!formData.latitude) {
            newErrors.latitude = 'Latitude is required';
        } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
            newErrors.latitude = 'Latitude must be between -90 and 90';
        }

        if (!formData.longitude) {
            newErrors.longitude = 'Longitude is required';
        } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
            newErrors.longitude = 'Longitude must be between -180 and 180';
        }

        if (!formData.phoneNumber?.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
            newErrors.phoneNumber = 'Phone number must be 10 digits';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email must be valid';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        if (!Array.isArray(formData.facilities) || formData.facilities.length === 0) {
            newErrors.facilities = 'Add at least one sport facility';
        }

        formData.facilities?.forEach((facility, facilityIndex) => {
            if (!facility?.sportType?.trim()) {
                newErrors[`facility-${facilityIndex}-sportType`] = 'Sport type is required';
            }

            if (!facility?.totalCourts || Number(facility.totalCourts) <= 0) {
                newErrors[`facility-${facilityIndex}-totalCourts`] = 'Courts must be greater than 0';
            }

            if (!Array.isArray(facility.slots) || facility.slots.length === 0) {
                newErrors[`facility-${facilityIndex}-slots`] = 'Add at least one time slot';
            }

            facility.slots?.forEach((slot, slotIndex) => {
                    if (!Array.isArray(slot.daysOfWeek) || slot.daysOfWeek.length === 0) {
                        newErrors[`facility-${facilityIndex}-slot-${slotIndex}-daysOfWeek`] = 'Select at least one day';
                }
                if (!slot.startTime) {
                    newErrors[`facility-${facilityIndex}-slot-${slotIndex}-startTime`] = 'Start time is required';
                }
                if (!slot.endTime) {
                    newErrors[`facility-${facilityIndex}-slot-${slotIndex}-endTime`] = 'End time is required';
                }
                if (!slot.price || Number(slot.price) <= 0) {
                    newErrors[`facility-${facilityIndex}-slot-${slotIndex}-price`] = 'Price must be greater than 0';
                }
                if (!slot.maxPlayers || Number(slot.maxPlayers) <= 0) {
                    newErrors[`facility-${facilityIndex}-slot-${slotIndex}-maxPlayers`] = 'Max players must be greater than 0';
                }
            });
        });

        return newErrors;
    };

    const updateFacility = (facilityIndex, field, value) => {
        setFormData((prev) => ({
            ...prev,
            facilities: (Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]).map((facility, index) => (
                index === facilityIndex ? { ...facility, [field]: value } : facility
            )),
        }));
    };

    const updateSlot = (facilityIndex, slotIndex, field, value) => {
        setFormData((prev) => ({
            ...prev,
            facilities: (Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]).map((facility, index) => {
                if (index !== facilityIndex) return facility;
                return {
                    ...facility,
                    slots: (Array.isArray(facility.slots) ? facility.slots : [createEmptySlot()]).map((slot, currentSlotIndex) => (
                        currentSlotIndex === slotIndex ? { ...slot, [field]: value } : slot
                    )),
                };
            }),
        }));
    };

    const toggleCenterInactiveDate = (dateKey) => {
        setFormData((prev) => ({
            ...prev,
            inactiveDates: (Array.isArray(prev.inactiveDates) ? prev.inactiveDates : []).includes(dateKey)
                ? prev.inactiveDates.filter((currentDate) => currentDate !== dateKey)
                : [...(Array.isArray(prev.inactiveDates) ? prev.inactiveDates : []), dateKey],
        }));
    };

    const resetCenterInactiveDates = () => {
        setFormData((prev) => ({
            ...prev,
            inactiveDates: [],
        }));
    };

    const closeCenterMonth = () => {
        setFormData((prev) => ({
            ...prev,
            inactiveDates: currentMonthCalendar.dates.map((item) => item.key),
        }));
    };

    const toggleSlotDay = (facilityIndex, slotIndex, day) => {
        setFormData((prev) => ({
            ...prev,
            facilities: (Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]).map((facility, index) => {
                if (index !== facilityIndex) return facility;

                return {
                    ...facility,
                    slots: (Array.isArray(facility.slots) ? facility.slots : [createEmptySlot()]).map((slot, currentSlotIndex) => {
                        if (currentSlotIndex !== slotIndex) return slot;

                        const currentDays = Array.isArray(slot.daysOfWeek) ? slot.daysOfWeek : ['MONDAY'];
                        const nextDays = currentDays.includes(day)
                            ? currentDays.filter((currentDay) => currentDay !== day)
                            : [...currentDays, day];

                        return {
                            ...slot,
                            daysOfWeek: nextDays.length > 0 ? nextDays : ['MONDAY'],
                        };
                    }),
                };
            }),
        }));
    };

    const addFacility = () => {
        setFormData((prev) => ({
            ...prev,
            facilities: [...(Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]), createEmptyFacility()],
        }));
    };

    const removeFacility = (facilityIndex) => {
        setFormData((prev) => ({
            ...prev,
            facilities: (Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]).filter((_, index) => index !== facilityIndex),
        }));
    };

    const addSlot = (facilityIndex) => {
        setFormData((prev) => ({
            ...prev,
            facilities: (Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]).map((facility, index) => (
                index === facilityIndex
                    ? { ...facility, slots: [...(Array.isArray(facility.slots) ? facility.slots : [createEmptySlot()]), createEmptySlot()] }
                    : facility
            )),
        }));
    };

    const removeSlot = (facilityIndex, slotIndex) => {
        setFormData((prev) => ({
            ...prev,
            facilities: (Array.isArray(prev.facilities) ? prev.facilities : [createEmptyFacility()]).map((facility, index) => (
                index === facilityIndex
                    ? { ...facility, slots: (Array.isArray(facility.slots) ? facility.slots : [createEmptySlot()]).filter((_, currentIndex) => currentIndex !== slotIndex) }
                    : facility
            )),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors above');
            return;
        }

        try {
            await onSubmit(formData);
            setFormData(initialData ? {
                ...initialData,
                facilities: normalizeFacilities(initialData.facilities),
            } : defaultFormData);
            // onClose is called by parent after success
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    if (!isOpen) return null;

    const currentMonthCalendar = getCurrentMonthCalendar();

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0,0,0,0.15)'}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[94vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">
                        {initialData ? 'Update Center' : 'Create New Center'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Center Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Fitness Hub"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="center@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="9876543210"
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="123 Main Street"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="New York"
                            />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State *
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="NY"
                            />
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code *
                            </label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.postalCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="10001"
                            />
                            {errors.postalCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                            )}
                        </div>

                        {/* Latitude */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.latitude ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="40.7128"
                            />
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                        </div>

                        {/* Longitude */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.longitude ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="-74.0060"
                            />
                            {errors.longitude && (
                                <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Describe your center..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Center Active Dates Calendar</p>
                                    <p className="text-xs text-gray-500">All dates are active by default. Deselect dates to mark center inactive for this month.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={resetCenterInactiveDates}
                                        className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
                                    >
                                        Select All Active This Month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeCenterMonth}
                                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Mark Month Closed
                                    </button>
                                </div>
                            </div>

                            <p className="mt-2 text-xs text-gray-500">{currentMonthCalendar.monthLabel}</p>
                            <div className="mt-3 grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        {day}
                                    </div>
                                ))}

                                                        {Array.from({ length: currentMonthCalendar.firstWeekday }).map((_, index) => (
                                                            <div key={`blank-${index}`} className="rounded-lg border border-transparent px-2 py-2" />
                                                        ))}

                                {currentMonthCalendar.dates.map((item) => {
                                    const inactive = Array.isArray(formData.inactiveDates) && formData.inactiveDates.includes(item.key);
                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => toggleCenterInactiveDate(item.key)}
                                            className={`rounded-lg border px-2 py-2 text-left text-xs transition ${inactive ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700 hover:border-green-400'}`}
                                        >
                                            <div className="font-bold">{item.label}</div>
                                            <div className="text-[10px] uppercase opacity-70">{inactive ? 'Inactive' : 'Active'}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            {Array.isArray(formData.inactiveDates) && formData.inactiveDates.length > 0 && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Inactive center dates: {formData.inactiveDates.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Sports Facilities */}
                        <div className="lg:col-span-2 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sports Facilities *
                                    </label>
                                    <p className="text-xs text-gray-500">Add one or more sports with courts and hourly slots.</p>
                                </div>
                                <button type="button" onClick={addFacility} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700">
                                    Add Sport
                                </button>
                            </div>

                            {errors.facilities && <p className="text-red-500 text-xs">{errors.facilities}</p>}

                            {Array.isArray(formData.facilities) && formData.facilities.map((facility, facilityIndex) => (
                                <div key={facilityIndex} className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sport Type *</label>
                                            <select
                                                value={facility.sportType}
                                                onChange={(event) => updateFacility(facilityIndex, 'sportType', event.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            >
                                                {SPORT_OPTIONS.map((sport) => (
                                                    <option key={sport} value={sport}>{sport}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Courts *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={facility.totalCourts}
                                                onChange={(event) => updateFacility(facilityIndex, 'totalCourts', event.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeFacility(facilityIndex)}
                                                disabled={formData.facilities.length === 1}
                                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
                                            >
                                                Remove Sport
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-700">Weekly Calendar & Time Slots</h4>
                                            <button type="button" onClick={() => addSlot(facilityIndex)} className="rounded-lg border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50">
                                                Add Slot
                                            </button>
                                        </div>

                                        {facility.slots.map((slot, slotIndex) => (
                                            <div key={slotIndex} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 xl:grid-cols-12">
                                                <div className="xl:col-span-5">
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">Active Days *</label>
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7">
                                                        {WEEK_DAYS.map((day) => {
                                                            const selected = Array.isArray(slot.daysOfWeek) && slot.daysOfWeek.includes(day);
                                                            return (
                                                                <button
                                                                    key={day}
                                                                    type="button"
                                                                    onClick={() => toggleSlotDay(facilityIndex, slotIndex, day)}
                                                                    className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${selected ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'}`}
                                                                >
                                                                    {day.slice(0, 3)}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors[`facility-${facilityIndex}-slot-${slotIndex}-daysOfWeek`] && (
                                                        <p className="mt-1 text-xs text-red-500">{errors[`facility-${facilityIndex}-slot-${slotIndex}-daysOfWeek`]}</p>
                                                    )}
                                                </div>

                                                <div className="xl:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSlot(facilityIndex, slotIndex, 'isActive', !slot.isActive)}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${slot.isActive ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-600'}`}
                                                    >
                                                        {slot.isActive ? 'Active' : 'Closed'}
                                                    </button>
                                                    <p className="mt-1 text-[11px] text-gray-500">Active means anyone can book. Closed blocks bookings on those days.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
                                                    <input type="time" value={slot.startTime} onChange={(event) => updateSlot(facilityIndex, slotIndex, 'startTime', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
                                                    <input type="time" value={slot.endTime} onChange={(event) => updateSlot(facilityIndex, slotIndex, 'endTime', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                                                    <input type="number" min="1" value={slot.price} onChange={(event) => updateSlot(facilityIndex, slotIndex, 'price', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Players</label>
                                                    <input type="number" min="1" value={slot.maxPlayers} onChange={(event) => updateSlot(facilityIndex, slotIndex, 'maxPlayers', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                                                </div>
                                                <div className="flex items-end justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSlot(facilityIndex, slotIndex)}
                                                        disabled={facility.slots.length === 1}
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 disabled:opacity-50"
                                                    >
                                                        Remove Slot
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Image URL */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
