import React, { useState, useEffect } from 'react';
import { getSubscriptionPlans, purchaseSubscription } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

function PremiumUpgradeModal({ isOpen, onClose, currentTier }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { t, language } = useLanguage();
    const tr = (en, ar) => (language === 'ar' ? ar : en);

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        try {
            const response = await getSubscriptionPlans();
            const allPlans = response.data.plans;

            // Deduplicate plans: Keep only the best offer for each duration
            const bestPlansMap = new Map();

            allPlans.forEach(plan => {
                const duration = plan.duration_months;
                if (!bestPlansMap.has(duration) || plan.final_price < bestPlansMap.get(duration).final_price) {
                    bestPlansMap.set(duration, plan);
                }
            });

            // Convert map back to array and sort by price
            const uniquePlans = Array.from(bestPlansMap.values()).sort((a, b) => a.final_price - b.final_price);

            setPlans(uniquePlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error(tr('Failed to load subscription plans', 'فشل تحميل خطط الاشتراك'));
        }
    };

    const handlePurchase = async (planId) => {
        setLoading(true);
        setSelectedPlan(planId);

        try {
            const response = await purchaseSubscription(planId);

            if (response.data.success) {
                // Open Paymob iFrame
                const paymentWindow = window.open(
                    response.data.payment.iframeUrl,
                    'paymob-payment',
                    'width=800,height=600'
                );

                // Monitor payment window
                const checkPaymentWindow = setInterval(() => {
                    if (paymentWindow.closed) {
                        clearInterval(checkPaymentWindow);
                        toast.info(tr('Payment window closed. Checking status...', 'اتقفلت نافذة الدفع. جاري التحقق من الحالة...'));
                        // Refresh page or fetch updated subscription status
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Error initiating purchase:', error);
            toast.error(error.response?.data?.error || tr('Failed to initiate purchase', 'فشل بدء عملية الشراء'));
        } finally {
            setLoading(false);
            setSelectedPlan(null);
        }
    };

    if (!isOpen) return null;

    const isPremium = currentTier === 'premium';
    const formatDurationLabel = (months) => (months === 1 ? tr('1 month', 'شهر واحد') : tr(`${months} months`, `${months} أشهر`));
    const formatPlanTitle = (plan) => `${plan.name || tr('Plan', 'الخطة')} · ${formatDurationLabel(plan.duration_months)}`;
    const getPlanHighlights = (plan) => {
        const features = plan.features || {};
        const highlights = [
            tr(`${features.daily_applications || 20} applications/day`, `${features.daily_applications || 20} طلب/اليوم`),
            features.priority_search ? tr('Priority search boost', 'أولوية في البحث') : tr('Standard search visibility', 'ظهور عادي في البحث'),
            features.premium_badge ? tr('Premium badge', 'بادج بريميوم') : null,
            features.ads === false ? tr('No ads', 'من غير إعلانات') : null
        ].filter(Boolean);

        return highlights;
    };

    const featuredPlanId = plans.find((plan) => plan.duration_months === 3)?.id;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_30px_80px_rgba(15,23,42,0.45)] max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/70 dark:border-slate-700/60"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative overflow-hidden rounded-t-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.35),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_45%,_#7c3aed_100%)] text-white p-6 sm:p-8">
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(115deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.12)_70%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex items-start justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                                {t('premium.heroTag')}
                            </div>
                            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                                {t('premium.heroTitle')}
                            </h2>
                            <p className="mt-3 max-w-xl text-sm sm:text-base text-blue-50/90 leading-relaxed">
                                {t('premium.heroSubtitle')}
                            </p>
                        </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-white/90 transition hover:bg-white/15 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>

                    {!isPremium && (
                        <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.16em] text-blue-100/70">{t('premium.summaryFree')}</p>
                                <p className="mt-1 text-lg font-bold">{t('premium.summaryFreeValue')}</p>
                            </div>
                            <div className="rounded-2xl bg-white text-slate-900 px-4 py-3 shadow-lg shadow-black/10">
                                <p className="text-xs uppercase tracking-[0.16em] text-blue-700/70">{t('premium.summaryPremium')}</p>
                                <p className="mt-1 text-lg font-extrabold text-blue-700">{t('premium.summaryPremiumValue')}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.16em] text-blue-100/70">{t('premium.summaryAccess')}</p>
                                <p className="mt-1 text-lg font-bold">{t('premium.summaryAccessValue')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Features */}
                {!isPremium && (
                    <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/30">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                                {t('premium.featuresTitle')}
                            </h3>
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                                {t('premium.featuresNote')}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: '🚀', text: tr('20 Applications Daily', '20 طلب يوميًا'), subtext: tr('vs. 5 on free plan', 'مقابل 5 في الخطة المجانية') },
                                { icon: '🚫', text: tr('Zero Ads', 'من غير إعلانات'), subtext: tr('Clean browsing experience', 'تجربة تصفح أنضف') },
                                { icon: '⭐', text: tr('Premium Badge', 'بادج بريميوم'), subtext: tr('Stand out to recruiters', 'تميّز أمام جهات التوظيف') },
                                { icon: '🏆', text: tr('Top of Search', 'أول الظهور في البحث'), subtext: tr('Appear first in candidate searches', 'يظهر أولًا في بحث المرشحين') }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">{feature.icon}</span>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{feature.text}</p>
                                        <p className="text-sm leading-snug text-slate-600 dark:text-slate-400">{feature.subtext}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Plans */}
                <div className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                        {isPremium ? `📅 ${t('premium.renewSubscription')}` : `💎 ${t('premium.choosePlan')}`}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => {
                            const isFirstTime = plan.is_first_time_offer;
                            const price = plan.final_price;
                            const originalPrice = plan.original_price;
                            const savings = plan.savings;
                            const pricePerMonth = (price / plan.duration_months).toFixed(0);
                            const durationLabel = formatDurationLabel(plan.duration_months);
                            const isFeatured = plan.id === featuredPlanId;
                            const highlights = getPlanHighlights(plan);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex h-full flex-col rounded-3xl border p-5 sm:p-6 transition duration-300 ${isFeatured
                                        ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-[0_18px_40px_rgba(59,130,246,0.18)] dark:border-blue-500 dark:from-slate-900 dark:to-slate-950'
                                        : isFirstTime
                                            ? 'border-emerald-500 bg-emerald-50/60 shadow-sm dark:border-emerald-600 dark:bg-emerald-900/20'
                                            : 'border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-blue-500'
                                        }`}
                                >
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                                    {formatPlanTitle(plan)}
                                                </h4>
                                                {isFeatured && (
                                                    <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                                                        {t('premium.bestValue')}
                                                    </span>
                                                )}
                                                {isFirstTime && (
                                                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                                                        {t('premium.firstTimeOffer')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                {tr(`${durationLabel} of premium access with a cleaner, faster workflow.`, `وصول بريميوم لمدة ${durationLabel} مع تجربة أسرع وأنضف.`)}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {plan.duration_months === 1
                                                    ? tr(`${pricePerMonth} EGP for ${durationLabel}`, `${pricePerMonth} جنيه لمدة ${durationLabel}`)
                                                    : tr(`~${pricePerMonth} EGP per month`, `~${pricePerMonth} جنيه/الشهر`)
                                                }
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-4xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                                                {parseFloat(price).toFixed(0)}
                                            </div>
                                            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                                EGP
                                            </div>
                                        </div>
                                    </div>

                                        <ul className="mt-5 space-y-2">
                                            {highlights.map((item) => (
                                                <li key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">✓</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto pt-5">
                                            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950/60 dark:text-slate-400">
                                                {tr('Premium access lasts for', 'الوصول البريميوم يستمر لمدة')} <span className="font-bold text-slate-900 dark:text-white">{durationLabel}</span> {t('premium.durationSuffix')}.
                                            </div>

                                            <button
                                                onClick={() => handlePurchase(plan.id)}
                                                disabled={loading && selectedPlan === plan.id}
                                                className={`mt-5 w-full rounded-2xl py-3.5 font-semibold transition ${isFeatured
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700'
                                                    : isFirstTime
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {loading && selectedPlan === plan.id ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        {tr('Processing...', 'جاري المعالجة...')}
                                                    </span>
                                                ) : (
                                                    tr(`Purchase for ${parseFloat(price).toFixed(0)} EGP`, `اشترِ بـ ${parseFloat(price).toFixed(0)} جنيه`)
                                                )}
                                            </button>

                                            {isFirstTime && savings > 0 && (
                                                <p className="mt-3 text-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                    {tr(`Save ${parseFloat(savings).toFixed(0)} EGP on your first purchase.`, `وفّر ${parseFloat(savings).toFixed(0)} جنيه في أول عملية شراء.`)}
                                                </p>
                                            )}
                                            {isFirstTime && originalPrice > price && (
                                                <p className="mt-1 text-center text-xs text-slate-500 line-through dark:text-slate-400">
                                                    {parseFloat(originalPrice).toFixed(0)} EGP
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {!plans.length && (
                            <div className="col-span-full text-center py-8 text-slate-600 dark:text-slate-400">
                                {tr('No subscription plans are available right now.', 'لا توجد خطط اشتراك متاحة الآن.')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="rounded-b-[28px] border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                    <p className="mb-3 text-center text-sm text-slate-600 dark:text-slate-400">
                        {t('premium.paymentMethods')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {['Visa', 'Mastercard', 'Vodafone Cash', 'Etisalat Cash', 'Orange Cash', 'WE Pay', 'InstaPay', 'Fawry'].map((method) => (
                            <span key={method} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                {method}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PremiumUpgradeModal;
