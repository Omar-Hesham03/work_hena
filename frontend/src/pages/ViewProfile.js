import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || '';

function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const tr = (en, ar) => (language === 'ar' ? ar : en);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const canonical = `${PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/view-profile/${userId}`;

  const fetchProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      setProfile(response.data.profile);
      setUser(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(tr('Could not load profile', 'تعذّر تحميل البروفايل'));
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <p className="text-gray-600 dark:text-gray-400">{tr('Loading profile...', 'جاري تحميل البروفايل...')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Helmet>
        <title>{tr('Candidate Profile | WorkHena', 'بروفايل المرشح | WorkHena')}</title>
        <meta
          name="description"
          content={tr(
            'View a candidate profile on WorkHena, including skills, experience, portfolio links, and contact details where available.',
            'اعرض بروفايل مرشح على WorkHena، بما في ذلك المهارات والخبرة وروابط الأعمال وبيانات التواصل المتاحة.'
          )}
        />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={tr('Candidate Profile | WorkHena', 'بروفايل المرشح | WorkHena')} />
        <meta
          property="og:description"
          content={tr(
            'View a candidate profile on WorkHena, including skills, experience, portfolio links, and contact details where available.',
            'اعرض بروفايل مرشح على WorkHena، بما في ذلك المهارات والخبرة وروابط الأعمال وبيانات التواصل المتاحة.'
          )}
        />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary dark:text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
            JobBoard
          </h1>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <NotificationBell />
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ← {tr('Back', 'رجوع')}
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white rounded-lg shadow-md p-8 mb-6 transition-colors">
          <h1 className="text-4xl font-bold mb-2">{user.full_name}</h1>
          <p className="text-blue-100 dark:text-blue-200 text-lg mb-4">{user.email}</p>
          {user.phone && <p className="text-blue-100 dark:text-blue-200">📞 {user.phone}</p>}

          {profile && (
            <div className="mt-4 flex flex-wrap gap-4">
              {profile.location && (
                <span className="bg-white bg-opacity-20 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  📍 {profile.location}
                </span>
              )}
              {profile.availability && (
                <span className="bg-white bg-opacity-20 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  🕐 {profile.availability}
                </span>
              )}
              {profile.expected_salary && (
                <span className="bg-white bg-opacity-20 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  💰 {profile.expected_salary}
                </span>
              )}
            </div>
          )}
        </div>

        {!profile ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors">
            <p className="text-gray-600 dark:text-gray-400">{tr("This candidate hasn't completed their profile yet.", 'المرشح ده لسه مكمّلش بروفايله.')}</p>
          </div>
        ) : (
          <>
            {profile.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{tr('About', 'نبذة')}</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{tr('Skills', 'المهارات')}</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 px-4 py-2 rounded-full font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{tr('Work Experience', 'الخبرة العملية')}</h2>
                <div className="space-y-6">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-primary dark:border-blue-500 pl-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{exp.position}</h3>
                      <p className="text-primary dark:text-blue-400 font-semibold text-lg">{exp.company}</p>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {exp.start_date} - {exp.current ? tr('Present', 'حتى الآن') : exp.end_date}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 dark:text-gray-300">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.education && profile.education.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{tr('Education', 'التعليم')}</h2>
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-secondary dark:border-green-500 pl-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{edu.degree}</h3>
                      <p className="text-secondary dark:text-green-400 font-semibold text-lg">{edu.institution}</p>
                      {edu.field && <p className="text-gray-600 dark:text-gray-400">{edu.field}</p>}
                      <p className="text-gray-600 dark:text-gray-400">
                        {edu.start_date} - {edu.current ? tr('Present', 'حتى الآن') : edu.end_date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.portfolio_links && profile.portfolio_links.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{tr('Portfolio & Projects', 'الأعمال والمشاريع')}</h2>
                <div className="space-y-4">
                  {profile.portfolio_links.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h3>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-blue-400 hover:underline break-all"
                      >
                        🔗 {item.url}
                      </a>
                      {item.description && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{tr('Links & Contact', 'الروابط والتواصل')}</h2>
              <div className="space-y-3">
                {profile.resume_link && (
                  <a
                    href={profile.resume_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary dark:text-blue-400 hover:underline"
                  >
                    <span className="text-2xl">📄</span>
                    <span className="font-semibold">{tr('View Resume/CV', 'عرض السيرة الذاتية')}</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary dark:text-blue-400 hover:underline"
                  >
                    <span className="text-2xl">💼</span>
                    <span className="font-semibold">{tr('LinkedIn Profile', 'بروفايل LinkedIn')}</span>
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary dark:text-blue-400 hover:underline"
                  >
                    <span className="text-2xl">💻</span>
                    <span className="font-semibold">{tr('GitHub Profile', 'بروفايل GitHub')}</span>
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary dark:text-blue-400 hover:underline"
                  >
                    <span className="text-2xl">🌐</span>
                    <span className="font-semibold">{tr('Personal Website', 'الموقع الشخصي')}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 text-white rounded-lg shadow-md p-6 text-center transition-colors">
              <h3 className="text-2xl font-bold mb-2">{tr('Interested in this candidate?', 'مهتم بالمرشح ده؟')}</h3>
              <p className="mb-4">{tr('Reach out via email:', 'تواصل عبر الإيميل:')} <a href={`mailto:${user.email}`} className="underline font-semibold">{user.email}</a></p>
              {user.phone && (
                <p>{tr('Or call:', 'أو اتصل:')} <span className="font-semibold">{user.phone}</span></p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewProfile;
