import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DarkModeToggle from '../components/DarkModeToggle';
import api from '../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8 transition-colors">
            <div className="absolute top-4 right-4">
                <DarkModeToggle />
            </div>

            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Forgot Password?</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        No worries, we'll send you a reset link
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 transition-colors">
                    {sent ? (
                        // Success state
                        <div className="text-center">
                            <div className="text-6xl mb-4">📧</div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Check your email!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                If <span className="font-semibold text-primary dark:text-blue-400">{email}</span> is registered, you'll receive a reset link shortly. Check your spam folder too!
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        // Form state
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="name@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition text-sm"
                            >
                                ← Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;