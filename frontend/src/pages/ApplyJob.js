import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getJobById, applyToJob } from '../services/api';
import DarkModeToggle from '../components/DarkModeToggle';
import ProfileDropdown from '../components/ProfileDropdown';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { Helmet } from 'react-helmet-async';

const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || '';

function ApplyJob() {
  const { jobId } = useParams();
  const { user, logout } = useContext(AuthContext);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const tr = (en, ar) => (language === 'ar' ? ar : en);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'job_seeker') {
      toast.error(tr('Only job seekers can apply to jobs', 'فقط الباحثين عن عمل يقدروا يقدّموا على الوظايف'));
      navigate('/');
      return;
    }

    fetchJob();
  }, [user, navigate]);

  const fetchJob = async () => {
    try {
      const response = await getJobById(jobId);
      setJob(response.data.job);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error(tr('Job not found', 'الوظيفة غير موجودة'));
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await applyToJob({
        job_id: jobId,
        cover_letter: formData.cover_letter || null,
        resume_url: formData.resume_url || null
      });

      toast.success(tr('Application submitted! 🎉', 'تم إرسال الطلب! 🎉'));
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to submit application';
      toast.error(errorMsg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <p className="text-gray-600 dark:text-gray-400">{tr('Loading job details...', 'جاري تحميل تفاصيل الوظيفة...')}</p>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const canonical = `${PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/apply/${jobId}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Helmet>
        <title>{language === 'ar' ? `قدّم على ${job.title} في ${job.company} | WorkHena` : `Apply for ${job.title} at ${job.company} | WorkHena`}</title>
        <meta
          name="description"
          content={language === 'ar' ? `قدّم على ${job.title} في ${job.company} في ${job.location}. ابعت طلبك من خلال WorkHena.` : `Apply for ${job.title} at ${job.company} in ${job.location}. Submit your application through WorkHena.`}
        />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={language === 'ar' ? `قدّم على ${job.title} في ${job.company} | WorkHena` : `Apply for ${job.title} at ${job.company} | WorkHena`} />
        <meta
          property="og:description"
          content={language === 'ar' ? `قدّم على ${job.title} في ${job.company} في ${job.location}. ابعت طلبك من خلال WorkHena.` : `Apply for ${job.title} at ${job.company} in ${job.location}. Submit your application through WorkHena.`}
        />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
              JobBoard
            </h1>
            <div className="flex gap-3 items-center">
              <DarkModeToggle />
              {user && <ProfileDropdown user={user} onLogout={logout} />}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Job Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 transition-colors">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{job.title}</h1>
            <p className="text-primary dark:text-blue-400 font-semibold text-lg sm:text-xl mb-2">{job.company}</p>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              <span>📍 {job.location}</span>
              <span>• {job.job_type}</span>
              {job.salary_range && <span>• 💰 {job.salary_range}</span>}
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-gray-100">{tr('Job Description', 'وصف الوظيفة')}</h3>
              <div
                className="text-sm sm:text-base text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}
              />
            </div>

            <div className="border-t dark:border-gray-700 pt-4 mt-4">
              <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-gray-100">{tr('Requirements', 'المتطلبات')}</h3>
              <div
                className="text-sm sm:text-base text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.requirements) }}
              />
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">{tr('Submit Your Application', 'ابعت طلبك')}</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm sm:text-base">
                  {tr('Cover Letter (Optional)', 'خطاب تقديم (اختياري)')}
                </label>
                <textarea
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  placeholder={tr("Tell the recruiter why you're a great fit for this role...", 'قول لجهة التوظيف ليه أنت مناسب للدور ده...')}
                />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tr('Tip: Highlight your relevant skills and experience', 'نصيحة: ركز على مهاراتك وخبرتك المناسبة')}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm sm:text-base">
                  {tr('Resume/CV Link (Optional)', 'لينك السيرة الذاتية (اختياري)')}
                </label>
                <input
                  type="url"
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  placeholder="https://example.com/your-resume.pdf"
                />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tr('You can paste a link to your resume on Google Drive, Dropbox, or any file hosting service', 'تقدر تحط لينك للسيرة الذاتية على Google Drive أو Dropbox أو أي خدمة رفع ملفات')}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-6">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  ℹ️ <strong>{tr('Note:', 'ملاحظة:')}</strong> {tr('Both fields are optional. You can submit your application without a cover letter or resume, but including them increases your chances!', 'الحقلين اختياريين. تقدر تبعت الطلب من غير خطاب أو سيرة ذاتية، لكن إضافتهم يزود فرصك!')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition font-semibold disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? tr('Submitting...', 'جاري الإرسال...') : tr('Submit Application', 'ابعت الطلب')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base"
                >
                  {tr('Cancel', 'إلغاء')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyJob;