import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllJobs, saveJob, unsaveJob, checkIfJobSaved, getRecommendedJobs, getSubscriptionStatus } from '../services/api';
import { getMyProfile } from '../services/api';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';
import AvatarDisplay from '../components/AvatarDisplay';
import ProfileDropdown from '../components/ProfileDropdown';
import ApplicationCounter from '../components/ApplicationCounter';
import NativeAd from '../components/NativeAd';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'WorkHena';
const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || '';

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const { t, language } = useLanguage();
  const tr = (en, ar) => (language === 'ar' ? ar : en);

  const getMatchLevel = (percentage) => {
    if (percentage >= 85) return { level: tr('Excellent', 'ممتاز'), color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900' };
    if (percentage >= 70) return { level: tr('Great', 'رائع'), color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900' };
    if (percentage >= 55) return { level: tr('Good', 'جيد'), color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900' };
    if (percentage >= 40) return { level: tr('Fair', 'مقبول'), color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900' };
    return { level: tr('Low', 'ضعيف'), color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700' };
  };
  const navigate = useNavigate();

  const showAIFeatures = user && user.user_type === 'job_seeker';

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Monetization state
  // const [showUpgradeModal, setShowUpgradeModal] = useState(false); // Moved to Navbar
  const [isPremium, setIsPremium] = useState(false);

  // AI Matching state
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' or 'recent'
  const [showMatchInfo, setShowMatchInfo] = useState(false);
  const stripHtmlAndTruncate = (html, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const JOBS_PER_PAGE = 12;

  useEffect(() => {
    if (!authLoading) {
      fetchJobs(1, false);
    }
  }, [user, sortBy, authLoading]); // Add sortBy as dependency

  useEffect(() => {
    setCurrentPage(1);
    fetchJobs(1, false); // Reset to page 1 when filters change
  }, [searchTerm, locationFilter, jobTypeFilter, workModeFilter]);

  useEffect(() => {
    if (jobs.length > 0 && user && user.user_type === 'job_seeker') {
      checkSavedJobs(jobs);
    }
  }, [jobs, user]);

  // Check subscription status
  useEffect(() => {
    if (user && user.user_type === 'job_seeker') {
      getSubscriptionStatus().then(res => {
        setIsPremium(res.data.subscription.tier === 'premium');
      }).catch(console.error);
    }
  }, [user]);

  const fetchJobs = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = {
        page,
        limit: JOBS_PER_PAGE
      };

      if (locationFilter) params.location = locationFilter;
      if (jobTypeFilter) params.job_type = jobTypeFilter;
      if (workModeFilter) params.work_mode = workModeFilter;
      if (searchTerm) params.search = searchTerm;

      // Use backend AI matching when in "recommended" mode and user has profile
      const useBackendMatching = sortBy === 'recommended' && showAIFeatures && user?.user_type === 'job_seeker';

      const response = useBackendMatching
        ? await getRecommendedJobs(params)  // Backend AI matching
        : await getAllJobs(params);          // Regular jobs

      const newJobs = response.data.jobs;
      const pagination = response.data.pagination;

      if (append) {
        setJobs(prev => [...prev, ...newJobs]);
      } else {
        setJobs(newJobs);
      }

      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
      setHasMore(pagination.hasMore);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const checkSavedJobs = async (jobs) => {
    if (!user || user.user_type !== 'job_seeker') return;

    try {
      const savedResults = await Promise.all(
        jobs.map(async (job) => {
          const response = await checkIfJobSaved(job.id);
          return response.data.isSaved ? job.id : null;
        })
      );

      const savedIds = new Set(savedResults.filter(Boolean));
      setSavedJobIds(savedIds);
    } catch (error) {
      console.error('Error checking saved jobs:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setJobTypeFilter('');
    setWorkModeFilter('');
  };

  const handleApply = (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.user_type !== 'job_seeker') {
      toast.error(tr('Only job seekers can apply to jobs', 'فقط الباحثين عن عمل يقدروا يقدّموا على الوظايف'));
      return;
    }
    navigate(`/apply/${jobId}`);
  };

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'job_seeker') {
      toast.error(tr('Only job seekers can save jobs', 'فقط الباحثين عن عمل يقدروا يحفظوا الوظايف'));
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        await unsaveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || tr('Error saving job', 'حصل خطأ أثناء حفظ الوظيفة'));
    }
  };

  const userTypeDisplay = user ? (user.user_type === 'recruiter' ? '[Recruiter]' : '[Freelancer]') : '';
  const firstName = user ? user.full_name.split(' ')[0] : '';
  const canonical = `${PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/`;


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      <Helmet>
        <title>WorkHena | Jobs, Hiring, and Career Growth</title>
        <meta
          name="description"
          content="WorkHena helps job seekers find great jobs and recruiters hire faster with smart matching, saved jobs, and streamlined hiring tools."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content="WorkHena | Jobs, Hiring, and Career Growth" />
        <meta
          property="og:description"
          content="WorkHena helps job seekers find great jobs and recruiters hire faster with smart matching, saved jobs, and streamlined hiring tools."
        />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: canonical
          })}
        </script>
      </Helmet>
      {/* Navigation Bar */}
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-12 sm:py-20 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">{t('home.heroTitle')}</h1>
          <p className="text-lg sm:text-xl">{t('home.heroSubtitle')}</p>
        </div>
      </section>

      {/* AI Profile Prompt */}
      {user && user.user_type === 'job_seeker' && !isPremium && !showAIFeatures && (
        <section className="container mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-800 dark:to-pink-800 rounded-lg shadow-md p-6 text-white">
            {/* Content same as before */}
            <div className="flex items-start gap-4">
              <span className="text-4xl">🤖</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{t('home.aiPromptTitle')}</h3>
                <p className="mb-4">{t('home.aiPromptBody')}</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 bg-white text-purple-600 dark:text-purple-800 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  {t('home.completeProfile')}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 transition-colors">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{t('home.searchTitle')}</h2>

            {/* Sort Toggle - Only show if AI features are enabled (setup pending for free users logic later maybe) */}
            {showAIFeatures && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setSortBy('recommended')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${sortBy === 'recommended'
                    ? 'bg-primary dark:bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  🤖 {t('home.recommended')}
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${sortBy === 'recent'
                    ? 'bg-primary dark:bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  🕒 {t('home.recent')}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder={t('home.locationPlaceholder')}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('home.jobTypePlaceholder')}</option>
                <option value="full-time">{tr('Full-time', 'دوام كامل')}</option>
                <option value="part-time">{tr('Part-time', 'دوام جزئي')}</option>
                <option value="contract">{tr('Contract', 'عقد')}</option>
                <option value="flexible">{tr('Flexible', 'مرن')}</option>
              </select>
            </div>

            <div>
              <select
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('home.workModePlaceholder')}</option>
                <option value="on-site">{tr('On-site', 'في المقر')}</option>
                <option value="remote">{tr('Remote', 'عن بُعد')}</option>
                <option value="hybrid">{tr('Hybrid', 'هجين')}</option>
              </select>
            </div>
          </div>

          {(searchTerm || locationFilter || jobTypeFilter || workModeFilter) && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr('Page', 'صفحة')} {currentPage} {tr('of', 'من')} {totalPages}
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-primary dark:text-blue-400 hover:underline"
              >
                {t('home.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-gray-100">
          {sortBy === 'recommended' && showAIFeatures ? `🤖 ${t('home.recommendedForYou')}` : tr('All Jobs', 'كل الوظايف')}
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">{tr('Loading jobs...', 'جاري تحميل الوظايف...')}</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center transition-colors">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tr('No jobs available at the moment.', 'مافيش وظايف متاحة دلوقتي.')}
            </p>
            {jobs.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                {t('home.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => {
              // Backend already provides match_score and match_reasons
              const matchScore = job.match_score || 0;
              const matchReasons = job.match_reasons || [];
              const matchLevel = matchScore > 0 ? getMatchLevel(matchScore) : null;

              const jobCard = (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition relative flex flex-col">
                  {/* Save Button */}
                  {user && user.user_type === 'job_seeker' && (
                    <button
                      onClick={(e) => handleSaveJob(e, job.id)}
                      className="absolute top-4 end-4 text-2xl hover:scale-110 transition z-10"
                      title={savedJobIds.has(job.id) ? tr('Unsave job', 'إزالة من المحفوظات') : tr('Save job', 'حفظ الوظيفة')}
                    >
                      {savedJobIds.has(job.id) ? (
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* AI Match Badge */}
                  {showAIFeatures && matchScore > 0 && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${matchLevel.bgColor} ${matchLevel.color} w-fit`}>
                      <span>{matchScore}%</span>
                      <span>{matchLevel.level} {tr('Match', 'تطابق')}</span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 pe-8">{job.title}</h3>
                  <p className="text-primary dark:text-blue-400 font-semibold mb-2">{job.company}</p>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <span className="mr-2">📍</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 px-3 py-1 rounded-full text-sm w-fit">
                      {job.job_type}
                    </span>
                    {job.work_mode && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm w-fit ${job.work_mode === 'remote' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                        job.work_mode === 'hybrid' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                        {job.work_mode === 'remote' ? `🏠 ${tr('Remote', 'عن بُعد')}` :
                          job.work_mode === 'hybrid' ? `🔄 ${tr('Hybrid', 'هجين')}` :
                            `🏢 ${tr('On-site', 'في المقر')}`}
                      </span>
                    )}
                  </div>
                  {job.salary_range && (
                    <p className="text-secondary dark:text-green-400 font-semibold mb-3">💰 {job.salary_range}</p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    {stripHtmlAndTruncate(job.description, 80)}
                  </p>

                  {/* Match Reasons */}
                  {showAIFeatures && matchReasons.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">{tr('Why this job:', 'ليه الوظيفة دي:')}</p>
                      <ul className="space-y-1">
                        {matchReasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                            <span>✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleApply(job.id)}
                    className="w-full bg-primary dark:bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold"
                  >
                    {tr('Apply Now', 'قدّم الآن')}
                  </button>
                </div>
              );

              // Inject Native Ad after the 2nd item (index 1) for non-premium users
              if (index === 1 && user?.user_type === 'job_seeker' && !isPremium) {
                return (
                  <React.Fragment key={`group - ${job.id} `}>
                    {jobCard}
                    {/* Native Ad triggers global modal via event or just redirects? For now assume it communicates status via Navbar context later if needed, or we keep local handler but modal is global? 
                        The global Navbar handles the modal. The NativeAd button needs to trigger it. 
                        Actually, NativeAd has a button. We might need a way to open the global modal from here. 
                        For this refactor, let's keep it simple: The NativeAd button might need to broadcast an event or we export a context. 
                        BUT, ApplicationCounter was the main request. NativeAd 'Upgrade' button can just navigate to a pricing page or we leave it for now.
                        Let's check NativeAd props. It accepts onUpgradeClick.
                        We can't easily open the modal in Navbar from here without Context.
                        QUICK FIX: Dispatch a custom event 'open-upgrade-modal' that Navbar listens to. 
                    */}
                    <NativeAd onUpgradeClick={() => window.dispatchEvent(new Event('open-upgrade-modal'))} />
                  </React.Fragment>
                );
              }

              return jobCard;
            })}
          </div>
        )}
        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => fetchJobs(currentPage + 1, true)}
              disabled={loadingMore}
              className="px-8 py-3 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {loadingMore ? tr('Loading...', 'جاري التحميل...') : tr(`Load More Jobs (${currentPage} of ${totalPages})`, `حمّل وظايف أكتر (${currentPage} من ${totalPages})`)}
            </button>
          </div>
        )}
      </section>

      {/* Premium Upgrade Modal logic moved to Navbar */}
    </div>
  );
}

export default Home;