import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import DarkModeToggle from '../components/DarkModeToggle';
import api from '../services/api';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false
    });

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link');
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        setPasswordValidation({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password)
        });
    }, [password]);

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error('Password does not meet requirements');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            setDone(true);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reset password. The link may have expired.');
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
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Set New Password</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Choose a strong password</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 transition-colors">
                    {done ? (
                        // Success state
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Password Reset!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your password has been updated successfully. You can now log in with your new password.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="••••••••"
                                />

                                {/* Password requirements */}
                                {password && (
                                    <div className="mt-3 space-y-2">
                                        {[
                                            { met: passwordValidation.minLength, text: 'At least 8 characters' },
                                            { met: passwordValidation.hasUppercase, text: 'At least 1 uppercase letter' },
                                            { met: passwordValidation.hasLowercase, text: 'At least 1 lowercase letter' },
                                            { met: passwordValidation.hasNumber, text: 'At least 1 number' },
                                        ].map((req, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                {req.met ? (
                                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                                    </svg>
                                                )}
                                                <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${confirmPassword && password !== confirmPassword
                                            ? 'border-red-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="••••••••"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid || password !== confirmPassword}
                                className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;