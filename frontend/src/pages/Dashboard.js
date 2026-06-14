import React, { useContext, Suspense, lazy } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

const RecruiterDashboard = lazy(() => import('../components/RecruiterDashboard'));
const JobSeekerDashboard = lazy(() => import('../components/JobSeekerDashboard'));

function Dashboard() {
  const { user } = useContext(AuthContext);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const tr = (en, ar) => (language === 'ar' ? ar : en);


  if (!user) {
    navigate('/login');
    return null;
  }

  const userTypeDisplay = user.user_type === 'recruiter' ? '[Recruiter]' : '[Freelancer]';
  const firstName = user.full_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Top Navigation */}
      {/* Top Navigation */}
      <Navbar />

      {/* Dashboard Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Suspense fallback={<div className="p-6 text-center text-gray-600 dark:text-gray-400">{tr('Loading dashboard...', 'جاري تحميل لوحة التحكم...')}</div>}>
          {user.user_type === 'recruiter' ? (
            <RecruiterDashboard />
          ) : (
            <JobSeekerDashboard />
          )}
        </Suspense>
      </div>

      {/* Credit Purchase Modal */}

    </div>
  );
}

export default Dashboard;