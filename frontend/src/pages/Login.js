import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import DarkModeToggle from '../components/DarkModeToggle';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Real-time email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    if (touched.email && email) {
      if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (touched.password && !password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
  }, [email, password, touched]);

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });
  };

  const isFormValid = () => {
    return validateEmail(email) && password.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true
    });

    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the API directly first to handle errors locally, or let AuthContext throw
      // AuthContext.login calls the API and updates state. It should throw on error.
      await login(email, password, rememberMe);
      // If successful, redirect
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid email or password';

      // If backend sends validation details (array), show the first one
      const errorDetails = error.response?.data?.details;
      if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
        toast.error(errorDetails[0]);
      } else {
        toast.error(errorMessage);
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8 transition-colors">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('login.title')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 space-y-5 transition-colors">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.email && touched.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                }`}
              placeholder="name@email.com"
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('login.password')}
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-primary dark:text-blue-400 hover:underline">
                {t('login.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.password && touched.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                  }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {/* Keep me signed in (Custom Modern Checkbox) */}
          <div className="flex items-center cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe
              ? 'bg-primary border-primary dark:bg-blue-600 dark:border-blue-600'
              : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-500 group-hover:border-primary'
              }`}>
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
              {t('login.rememberMe')}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('login.signingIn') : t('login.signIn')}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('login.noAccount')}{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-primary dark:text-blue-400 hover:underline font-semibold"
            >
              {t('login.signUp')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;