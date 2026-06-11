import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarDisplay from './AvatarDisplay';

function ProfileDropdown({ user, onLogout, onNavigate }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Don't render if no user (after all hooks)
  if (!user) {
    return null;
  }

  const firstName = user.full_name.split(' ')[0];
  const userTypeDisplay = user.user_type === 'recruiter' ? '[Recruiter]' : user.user_type === 'admin' ? '[Admin]' : '[Freelancer]';
  const isVerified = Boolean(user.email_verified);
  const verificationBadge = isVerified
    ? {
        label: 'Verified',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      }
    : {
        label: 'Unverified',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
      };

  const handleNavigation = (path) => {
    setShowDropdown(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <AvatarDisplay avatarId={user.avatar} size="sm" />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-10 md:hidden"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-20 border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <AvatarDisplay avatarId={user.avatar} size="md" />
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{firstName}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userTypeDisplay}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${verificationBadge.className}`}>
                      {isVerified ? (
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.172 7.707 9.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 7a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clipRule="evenodd" />
                        </svg>
                      )}
                      {verificationBadge.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigation('/')}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
              >
                <span className="text-lg">🏠</span>
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/dashboard');
                }}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
              >
                <span className="text-lg">📊</span>
                <span>Dashboard</span>
              </button>

              {user.user_type === 'job_seeker' && (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <span className="text-lg">✏️</span>
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/saved-jobs')}
                    className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>Saved Jobs</span>
                  </button>
                </>
              )}

              {user.user_type === 'recruiter' && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/dashboard?tab=find-candidates');
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
                >
                  <span className="text-lg">🔍</span>
                  <span>Find Candidates</span>
                </button>
              )}

              {user.user_type === 'admin' && (
                <button
                  onClick={() => handleNavigation('/admin')}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Admin Panel</span>
                </button>
              )}

              {/* Divider */}
              <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3"
              >
                <span className="text-lg">🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileDropdown;