import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import api from '../services/api';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Invalid verification link.');
            return;
        }
        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            await api.post('/auth/verify-email', { token });
            setStatus('success');

            // Update the user in localStorage so the banner disappears immediately
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                user.email_verified = true;
                localStorage.setItem('user', JSON.stringify(user));
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.response?.data?.error || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors">
            <div className="absolute top-4 right-4">
                <DarkModeToggle />
            </div>

            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center transition-colors">

                {/* Verifying */}
                {status === 'verifying' && (
                    <>
                        <div className="text-5xl mb-4 animate-pulse">✉️</div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verifying your email...</h2>
                        <p className="text-gray-600 dark:text-gray-400">Please wait a moment.</p>
                    </>
                )}

                {/* Success */}
                {status === 'success' && (
                    <>
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your email has been verified successfully. You're all set!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold"
                        >
                            Go to Home
                        </button>
                    </>
                )}

                {/* Error */}
                {status === 'error' && (
                    <>
                        <div className="text-5xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold"
                        >
                            Go to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;