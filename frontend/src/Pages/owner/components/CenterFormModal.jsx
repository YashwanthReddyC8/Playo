import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CenterFormModal({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
    const [formData, setFormData] = useState(
        initialData || {
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
            capacity: '',
            facilities: '',
        }
    );
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
                capacity: initialData.capacity || '',
                facilities: initialData.facilities || '',
            });
        } else {
            setFormData({
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
                capacity: '',
                facilities: '',
            });
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

        return newErrors;
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
            setFormData(
                initialData || {
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
                    capacity: '',
                    facilities: '',
                }
            );
            // onClose is called by parent after success
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0,0,0,0.15)'}}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
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
                    <div className="grid grid-cols-2 gap-4">
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

                        {/* Capacity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Capacity
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="100"
                            />
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

                        {/* Facilities */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Facilities
                            </label>
                            <input
                                type="text"
                                name="facilities"
                                value={formData.facilities}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Gym, Swimming Pool, Locker Room"
                            />
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
