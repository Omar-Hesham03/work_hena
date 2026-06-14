import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'language';

const translations = {
  en: {
    navbar: {
      login: 'Login',
      signUp: 'Sign Up',
      home: 'Home',
      dashboard: 'Dashboard',
      editProfile: 'Edit Profile',
      savedJobs: 'Saved Jobs',
      findCandidates: 'Find Candidates',
      adminPanel: 'Admin Panel',
      logout: 'Log out',
      language: 'AR',
      languageTitle: 'Switch to Egyptian Arabic'
    },
    verification: {
      message: 'Please verify your email address to get the most out of WorkHena.',
      resend: 'Resend email',
      sending: 'Sending...'
    },
    applicationCounter: {
      applications: 'Applications:',
      upgrade: 'Upgrade to Premium',
      manage: 'Manage subscription'
    },
    creditCounter: {
      credits: 'Credits:',
      purchase: 'Purchase Credits'
    },
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your JobBoard account',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Keep me signed in',
      signIn: 'Sign In',
      signingIn: 'Signing In...',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up'
    },
    register: {
      title: 'Create Account',
      subtitle: 'Join JobBoard today',
      fullName: 'Full Name *',
      email: 'Email *',
      password: 'Password *',
      phone: 'Phone (Optional)',
      role: 'I am a *',
      jobSeeker: 'Job Seeker',
      recruiter: 'Recruiter',
      companyName: 'Company Name *',
      createAccount: 'Create Account',
      creating: 'Creating Account...',
      haveAccount: 'Already have an account?',
      signIn: 'Sign In'
    },
    home: {
      heroTitle: 'Find Your Dream Job',
      heroSubtitle: 'Connect with top companies and start your career journey today',
      aiPromptTitle: 'Get AI-Powered Job Recommendations!',
      aiPromptBody: 'Complete your profile to unlock personalized job matches based on your skills, experience, and preferences.',
      completeProfile: 'Complete Your Profile',
      searchTitle: 'Search & Filter Jobs',
      recommended: 'Recommended',
      recent: 'Recent',
      clearFilters: 'Clear Filters',
      searchPlaceholder: 'Search by title, company...',
      locationPlaceholder: 'All Locations',
      jobTypePlaceholder: 'All Job Types',
      workModePlaceholder: 'All Work Modes',
      recommendedForYou: 'Recommended For You'
    },
    premium: {
      heroTag: 'Premium for freelancers',
      heroTitle: 'Choose the plan that matches your pace',
      heroSubtitle: 'Unlock more applications, better visibility, and a cleaner browsing experience with a plan built for serious job seekers.',
      summaryFree: 'Free plan',
      summaryPremium: 'Premium',
      summaryAccess: 'Access',
      summaryFreeValue: '5 applications/day',
      summaryPremiumValue: '20 applications/day',
      summaryAccessValue: 'Priority search + badge',
      featuresTitle: 'What you get',
      featuresNote: 'Built for faster hiring success',
      choosePlan: 'Choose Your Plan',
      renewSubscription: 'Renew Subscription',
      purchase: 'Purchase for',
      bestValue: 'Best value',
      firstTimeOffer: 'First time offer',
      durationSuffix: 'after purchase',
      paymentMethods: 'We accept all major payment methods'
    },
    creditModal: {
      title: 'Purchase Credits',
      currentBalance: 'Current Balance:',
      firstPurchase: '20% OFF YOUR FIRST PURCHASE!',
      howItWorks: 'How Credits Work:',
      jobPost: 'Job Post = 5 credits.',
      creditsNeverExpire: 'Credits never expire and roll over each month.',
      findCandidates: 'Access "Find Candidates" feature as long as you got credits.',
      buyAnytime: 'Buy credits anytime - no subscription required.',
      choosePackage: 'Choose Your Package',
      mostPopular: 'MOST POPULAR',
      purchase: 'Purchase for',
      paymentMethods: 'We accept all major payment methods'
    },
    dropdown: {
      verified: 'Verified',
      unverified: 'Unverified',
      home: 'Home',
      dashboard: 'Dashboard',
      editProfile: 'Edit Profile',
      savedJobs: 'Saved Jobs',
      findCandidates: 'Find Candidates',
      adminPanel: 'Admin Panel',
      logout: 'Log out'
    }
  },
  ar: {
    navbar: {
      login: 'سجّل دخول',
      signUp: 'اعمل حساب',
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      editProfile: 'تعديل البروفايل',
      savedJobs: 'الوظايف المحفوظة',
      findCandidates: 'ابحث عن مرشحين',
      adminPanel: 'لوحة الأدمن',
      logout: 'تسجيل الخروج',
      language: 'EN',
      languageTitle: 'Switch to English'
    },
    verification: {
      message: 'من فضلك فعّل الإيميل عشان تستفيد من WorkHena بالكامل.',
      resend: 'إعادة إرسال الإيميل',
      sending: 'جاري الإرسال...'
    },
    applicationCounter: {
      applications: 'الطلبات:',
      upgrade: 'رقّي للبريميوم',
      manage: 'إدارة الاشتراك'
    },
    creditCounter: {
      credits: 'الرصيد:',
      purchase: 'اشترِ كريديت'
    },
    login: {
      title: 'أهلاً بيك تاني',
      subtitle: 'سجّل دخولك في حساب JobBoard',
      email: 'الإيميل',
      password: 'الباسورد',
      forgotPassword: 'نسيت الباسورد؟',
      rememberMe: 'خلّيني داخل',
      signIn: 'سجّل دخول',
      signingIn: 'جاري تسجيل الدخول...',
      noAccount: 'معندكش حساب؟',
      signUp: 'اعمل حساب'
    },
    register: {
      title: 'اعمل حساب',
      subtitle: 'انضم لـ JobBoard النهارده',
      fullName: 'الاسم بالكامل *',
      email: 'الإيميل *',
      password: 'الباسورد *',
      phone: 'الموبايل (اختياري)',
      role: 'أنا *',
      jobSeeker: 'باحث عن شغل',
      recruiter: 'موظف توظيف',
      companyName: 'اسم الشركة *',
      createAccount: 'اعمل حساب',
      creating: 'جاري إنشاء الحساب...',
      haveAccount: 'عندك حساب بالفعل؟',
      signIn: 'سجّل دخول'
    },
    home: {
      heroTitle: 'اعثر على شغلك الأحلام',
      heroSubtitle: 'اتواصل مع شركات قوية وابدأ مشوارك المهني النهارده',
      aiPromptTitle: 'خد ترشيحات شغل بالذكاء الاصطناعي!',
      aiPromptBody: 'كمّل بروفايلك عشان تفتح ترشيحات مخصّصة على حسب مهاراتك وخبرتك وتفضيلاتك.',
      completeProfile: 'كمّل بروفايلك',
      searchTitle: 'ابحث وفلتر الوظايف',
      recommended: 'مقترحة',
      recent: 'الأحدث',
      clearFilters: 'امسح الفلاتر',
      searchPlaceholder: 'ابحث بالمسمى أو الشركة...',
      locationPlaceholder: 'كل الأماكن',
      jobTypePlaceholder: 'كل أنواع الشغل',
      workModePlaceholder: 'كل أنماط الشغل',
      recommendedForYou: 'مقترحة ليك'
    },
    premium: {
      heroTag: 'بريميوم للفريلانسرز',
      heroTitle: 'اختار الخطة اللي مناسبة ليك',
      heroSubtitle: 'طلبات أكتر، ظهور أحسن، وتجربة أهدى بخطة معمولة للناس الجادين في التقديم.',
      summaryFree: 'الخطة المجانية',
      summaryPremium: 'البريميوم',
      summaryAccess: 'المميزات',
      summaryFreeValue: '5 طلبات/اليوم',
      summaryPremiumValue: '20 طلب/اليوم',
      summaryAccessValue: 'أولوية في البحث + بادج',
      featuresTitle: 'هتاخد إيه؟',
      featuresNote: 'مُصممة عشان تسرّع فرصك',
      choosePlan: 'اختار خطتك',
      renewSubscription: 'جدّد الاشتراك',
      purchase: 'اشتري بـ',
      bestValue: 'أفضل قيمة',
      firstTimeOffer: 'عرض لأول مرة',
      durationSuffix: 'بعد الشراء',
      paymentMethods: 'بنقبل كل وسائل الدفع الأساسية'
    },
    creditModal: {
      title: 'اشترِ كريديت',
      currentBalance: 'الرصيد الحالي:',
      firstPurchase: 'خصم 20% لأول عملية شراء!',
      howItWorks: 'إزاي الكريديت بيشتغل:',
      jobPost: 'نشر وظيفة = 5 كريديت.',
      creditsNeverExpire: 'الكريديت مابيخلصش وبيتراكم كل شهر.',
      findCandidates: 'تقدر تستخدم "ابحث عن مرشحين" طول ما عندك رصيد.',
      buyAnytime: 'اشترِ كريديت في أي وقت - من غير اشتراك.',
      choosePackage: 'اختار الباقة',
      mostPopular: 'الأكثر طلبًا',
      purchase: 'اشتري بـ',
      paymentMethods: 'بنقبل كل وسائل الدفع الأساسية'
    },
    dropdown: {
      verified: 'موثّق',
      unverified: 'غير موثّق',
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      editProfile: 'تعديل البروفايل',
      savedJobs: 'الوظايف المحفوظة',
      findCandidates: 'ابحث عن مرشحين',
      adminPanel: 'لوحة الأدمن',
      logout: 'تسجيل الخروج'
    }
  }
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === 'ar' ? 'ar' : 'en';
  });

  const isArabic = language === 'ar';

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [language, isArabic]);

  const toggleLanguage = useCallback(() => {
    setLanguage((currentLanguage) => (currentLanguage === 'en' ? 'ar' : 'en'));
  }, []);

  const t = useCallback((key, fallback = '') => {
    const parts = key.split('.');
    let value = translations[language];

    for (const part of parts) {
      value = value?.[part];
    }

    if (typeof value !== 'string') {
      return fallback;
    }

    return value;
  }, [language]);

  const value = useMemo(() => ({
    language,
    isArabic,
    setLanguage,
    toggleLanguage,
    t
  }), [language, isArabic, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);