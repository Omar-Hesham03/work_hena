import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import api from '../services/api';

function VerificationBanner() {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);

    // Don't show if: no user, already verified, or dismissed
    if (!user || user.email_verified || dismissed) return null;

    const handleResend = async () => {
        setSending(true);
        try {
            await api.post('/auth/resend-verification');
            toast.success(t('verification.sending'));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-700">
            <div className="container mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <span>⚠️</span>
                    <span>{t('verification.message')}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 underline hover:no-underline disabled:opacity-50"
                    >
                        {sending ? t('verification.sending') : t('verification.resend')}
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition"
                        title="Dismiss"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerificationBanner;