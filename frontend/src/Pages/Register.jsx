import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axios';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // For OTP flow: 1 = form, 2 = otp verification
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Form data for initial registration
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    // OTP verification data
    const [otp, setOtp] = useState('');
    const [otpEmail, setOtpEmail] = useState('');

    // Validation function
    const validate = (data = formData) => {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'Name is required';
        }

        if (!data.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email address';
        }

        if (!data.phone?.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(data.phone)) {
            errors.phone = 'Phone must be 10 digits';
        }

        if (!data.password?.trim()) {
            errors.password = 'Password is required';
        } else if (data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    // Handle OTP field changes
    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
    };

    // Send OTP
    const sendOtp = async () => {
        setError('');
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await axiosInstance.post(`/auth/send-otp`, {
                email: formData.email,
            });

            if (response.data.success) {
                setOtpEmail(formData.email);
                setStep(2);
                toast.success('OTP sent to your email!');
            } else {
                setError(response.data.message || 'Failed to send OTP');
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Verify OTP and register
    const verifyOtp = async () => {
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post(`/auth/verify-otp`, {
                email: otpEmail,
                otp: otp,
                name: formData.name,
                password: formData.password,
                phone: formData.phone,
            });

            if (response.data.token) {
                localStorage.setItem('userToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                toast.success('Registration successful!');
                navigate('/login');
            } else {
                setError(response.data.message || 'OTP verification failed');
                toast.error(response.data.message || 'OTP verification failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'OTP verification failed. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const resendOtp = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(`/auth/resend-otp`, {
                email: otpEmail,
            });

            if (response.data.success) {
                toast.success('OTP resent to your email!');
            } else {
                setError(response.data.message || 'Failed to resend OTP');
                toast.error(response.data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // OTP Registration Flow
    if (step === 1) {
        // Step 1: Enter details
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-600 hover:text-gray-900 font-semibold mb-4 flex items-center gap-2"
                    >
                        ← Back to Login
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600 mb-8">Step 1 of 2 - Enter your details</p>

                    <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {validationErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="9999999999"
                                    maxLength="10"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {validationErrors.phone && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* API Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? 'Sending OTP...' : (
                                <>
                                    Send OTP
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        // Step 2: Verify OTP
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
                    <button
                        onClick={() => {
                            setStep(1);
                            setOtp('');
                            setError('');
                        }}
                        className="text-gray-600 hover:text-gray-900 font-semibold mb-4 flex items-center gap-2"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
                    <p className="text-gray-600 mb-8">Step 2 of 2 - Enter the OTP sent to {otpEmail}</p>

                    <form onSubmit={(e) => { e.preventDefault(); verifyOtp(); }} className="space-y-4">
                        {/* OTP Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={handleOtpChange}
                                placeholder="000000"
                                maxLength="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest font-semibold"
                            />
                        </div>

                        {/* API Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? 'Verifying...' : (
                                <>
                                    Verify & Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Resend OTP */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">Didn't receive the OTP?</p>
                        <button
                            onClick={resendOtp}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-700 font-semibold mt-2 disabled:text-gray-400"
                        >
                            Resend OTP
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

