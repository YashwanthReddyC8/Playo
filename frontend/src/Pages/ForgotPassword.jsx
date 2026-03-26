import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { forgotPassword, isLoading, error } = useAuthStore();
    const [email, setEmail] = useState('');
    const [validationError, setValidationError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const validateForm = () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setValidationError('Valid email is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (!validateForm()) return;

        const success = await forgotPassword(email);
        if (success) {
            setEmailSent(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link
                    to="/login"
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Login
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-600">Enter your email to receive a password reset link</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {emailSent ? (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <CheckCircle className="w-16 h-16 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Sent!</h2>
                            <p className="text-gray-600 mb-6">
                                Check your email for a link to reset your password. The link will expire in 1 hour.
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirecting to login in 3 seconds...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${validationError ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                                {validationError && (
                                    <p className="text-red-500 text-sm mt-1">{validationError}</p>
                                )}
                            </div>

                            {/* API Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Info Message */}
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                                We'll send you an email with instructions to reset your password.
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    {!emailSent && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Remember your password?{' '}
                                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
