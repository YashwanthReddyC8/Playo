import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import { toast as toastify } from "react-hot-toast";

const initialForm = {
    name: "",
    email: "",
    phone: "",
    centerName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    digiPin: "",
    mapLocation: "",
    description: "",
    businessEmail: "",
    businessPhone: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const zipRegex = /^\d{5,6}$/;
const digiPinRegex = /^[A-Za-z0-9-]{4,20}$/;

const isValidUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

const validateForm = (form) => {
    const errors = {};

    if (!form.name.trim()) errors.name = "Name is required.";
    if (!emailRegex.test(form.email.trim())) errors.email = "Enter a valid email.";
    if (!phoneRegex.test(form.phone.trim())) errors.phone = "Enter a valid 10-digit phone number.";

    if (!form.centerName.trim()) errors.centerName = "Sports center name is required.";
    if (!form.street.trim()) errors.street = "Street is required.";
    if (!form.city.trim()) errors.city = "City is required.";
    if (!form.state.trim()) errors.state = "State is required.";
    if (!zipRegex.test(form.zipCode.trim())) errors.zipCode = "Enter a valid zip code.";
    if (!form.mapLocation.trim()) errors.mapLocation = "Map location is required.";

    if (!form.description.trim()) {
        errors.description = "Description is required.";
    } else if (form.description.trim().length < 20) {
        errors.description = "Description should be at least 20 characters.";
    }

    if (form.digiPin.trim() && !digiPinRegex.test(form.digiPin.trim())) {
        errors.digiPin = "Digi Pin can contain letters, numbers, and hyphen.";
    }

    if (form.businessEmail.trim() && !emailRegex.test(form.businessEmail.trim())) {
        errors.businessEmail = "Enter a valid business email.";
    }

    if (form.businessPhone.trim() && !phoneRegex.test(form.businessPhone.trim())) {
        errors.businessPhone = "Enter a valid 10-digit business phone number.";
    }

    const socialFields = ["facebook", "twitter", "instagram", "linkedin"];
    socialFields.forEach((field) => {
        const value = form[field].trim();
        if (value && !isValidUrl(value)) {
            errors[field] = "Enter a valid URL (http/https).";
        }
    });

    return errors;
};

const FieldError = ({ message }) => {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-600">{message}</p>;
};

export default function OpenCenterFormModal({ isOpen, onClose }) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const portalTarget = useMemo(
        () => document.getElementById("modal-root") || document.body,
        []
    );

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const resetAndClose = () => {
        setForm(initialForm);
        setErrors({});
        setApiError("");
        onClose?.();
    };

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        setApiError("");

        const validationErrors = validateForm(form);
        setErrors(validationErrors);
        // if (Object.keys(validationErrors).length > 0) return;

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            phoneNumber: form.phone.trim(),
            sportsCenterName: form.centerName.trim(),
            streetAddress: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            zipCode: form.zipCode.trim(),
            digiPin: form.digiPin.trim() || null,
            googleMapLink: form.mapLocation.trim(),
            centerDescription: form.description.trim(),
            businessEmail: form.businessEmail.trim() || null,
            businessPhoneNumber: form.businessPhone.trim() || null,
            facebookUrl: form.facebook.trim() || null,
            twitterUrl: form.twitter.trim() || null,
            instagramUrl: form.instagram.trim() || null,
            linkedInUrl: form.linkedin.trim() || null,
        };

        try {
            setIsSubmitting(true);
            await axiosInstance.post("/api/public/center-applications", payload);
            resetAndClose();
            toast.info("Our team will review your application and get back to you within 3-5 business days. Via email.");
            toastify.success("Your application has been submitted successfully!");
        } catch (error) {
            setApiError(
                error?.response?.data?.message ||
                "Unable to submit the application right now. Please try again."
            );
            toastify.error("Failed to submit application. Please check the form and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/50 p-4 md:p-8">
            <div className="mx-auto h-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl relative">
                <button
                    type="button"
                    onClick={resetAndClose}
                    className="absolute right-4 top-4 z-10 text-2xl text-gray-500 hover:text-black"
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="flex h-full flex-col">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-white pr-16">
                        <h2 className="text-2xl font-bold">Open Your Sports Center</h2>
                        <p className="mt-1 text-sm text-emerald-50">
                            Welcome to the "Open Your Sports Center" form! We are excited to help you kickstart your journey in the sports industry. Please fill out the following information to get started on opening your very own sports center on our platform. We look forward to supporting you every step of the way!
                        </p>
                    </div>

                    <form className="flex-1 overflow-y-auto p-6" onSubmit={handleOnSubmit}>
                        <div className="space-y-8">
                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-gray-800">Personal Information</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                                        <FieldError message={errors.name} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
                                        <FieldError message={errors.email} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required />
                                        <FieldError message={errors.phone} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-gray-800">Sports Center Information</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="centerName" value={form.centerName} onChange={handleChange} placeholder="Sports Center Name" required />
                                        <FieldError message={errors.centerName} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="street" value={form.street} onChange={handleChange} placeholder="Street Address" required />
                                        <FieldError message={errors.street} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                                        <FieldError message={errors.city} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="state" value={form.state} onChange={handleChange} placeholder="State" required />
                                        <FieldError message={errors.state} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="Zip Code" required />
                                        <FieldError message={errors.zipCode} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="digiPin" value={form.digiPin} onChange={handleChange} placeholder="DIGI Pin (Optional)" />
                                        <FieldError message={errors.digiPin} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="mapLocation" value={form.mapLocation} onChange={handleChange} placeholder="Google Map Link / Coordinates" required />
                                        <FieldError message={errors.mapLocation} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <textarea className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2" name="description" value={form.description} onChange={handleChange} placeholder="Center Description" required />
                                        <FieldError message={errors.description} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-gray-800">Business Contact Information</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="businessEmail" value={form.businessEmail} onChange={handleChange} placeholder="Business Email" type="email" />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Business email will be the default username after account creation.
                                        </p>
                                        <FieldError message={errors.businessEmail} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="businessPhone" value={form.businessPhone} onChange={handleChange} placeholder="Business Phone Number" />
                                        <FieldError message={errors.businessPhone} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-gray-800">Social Media Links (Optional)</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="facebook" value={form.facebook} onChange={handleChange} placeholder="Facebook URL (Optional)" />
                                        <FieldError message={errors.facebook} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="twitter" value={form.twitter} onChange={handleChange} placeholder="Twitter/X URL (Optional)" />
                                        <FieldError message={errors.twitter} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="instagram" value={form.instagram} onChange={handleChange} placeholder="Instagram URL (Optional)" />
                                        <FieldError message={errors.instagram} />
                                    </div>
                                    <div>
                                        <input className="w-full rounded-lg border border-gray-300 px-3 py-2" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL (Optional)" />
                                        <FieldError message={errors.linkedin} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {apiError && <p className="mt-4 text-sm text-red-600">{apiError}</p>}

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                            <button
                                type="button"
                                onClick={resetAndClose}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        portalTarget
    );
}
