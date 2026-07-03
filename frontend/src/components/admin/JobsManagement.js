import React, { useState, useEffect } from 'react';
import { getAdminJobs, deleteAdminJob, updateJobStatus } from '../../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

function JobsManagement() {
  const { language } = useLanguage();
  const tr = (en, ar) => (language === 'ar' ? ar : en);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [jobToDelete, setJobToDelete] = useState(null);
  const [jobToUpdate, setJobToUpdate] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAdminJobs({
        page: pagination.page,
        limit: 20,
        ...filters
      });
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setDeleteReason('');
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await deleteAdminJob(jobToDelete.id, deleteReason.trim() || undefined);
      toast.success(deleteReason.trim() ? tr('Job deleted and recruiter notified! 📧', 'تم حذف الوظيفة وإبلاغ جهة التوظيف! 📧') : tr('Job deleted! 🗑️', 'تم حذف الوظيفة! 🗑️'));
      setJobToDelete(null);
      setDeleteReason('');
      fetchJobs();
    } catch (error) {
      toast.error(tr('Error deleting job: ', 'خطأ في حذف الوظيفة: ') + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateStatus = (job, newStatus) => {
    setJobToUpdate({ ...job, newStatus });
  };

  const confirmUpdateStatus = async () => {
    if (!jobToUpdate) return;

    try {
      await updateJobStatus(jobToUpdate.id, jobToUpdate.newStatus);
      toast.success(tr('Job status updated! ✅', 'تم تحديث حالة الوظيفة! ✅'));
      setJobToUpdate(null);
      fetchJobs();
    } catch (error) {
      toast.error(tr('Error updating job: ', 'خطأ في تحديث الوظيفة: ') + (error.response?.data?.error || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'closed': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'filled': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{tr('Status', 'الحالة')}</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">{tr('All Jobs', 'كل الوظايف')}</option>
              <option value="open">{tr('Open', 'مفتوحة')}</option>
              <option value="closed">{tr('Closed', 'مغلقة')}</option>
              <option value="filled">{tr('Filled', 'تم شغلها')}</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{tr('Search', 'بحث')}</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={tr('Search by title or company...', 'ابحث بالمسمى أو الشركة...')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-600 dark:text-gray-400">
            {tr('Loading jobs...', 'جاري تحميل الوظايف...')}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-600 dark:text-gray-400">
            {tr('No jobs found', 'مافيش وظايف')}
          </div>
        ) : (
          <>
            {jobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{job.title}</h3>
                    <p className="text-primary dark:text-blue-400 font-semibold mb-2">{job.company}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>📍 {job.location}</span>
                      <span>• {job.job_type}</span>
                      {job.salary_range && <span>• 💰 {job.salary_range}</span>}
                    </div>
                  </div>

                  <select
                    value={job.status}
                    onChange={(e) => handleUpdateStatus(job, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(job.status)}`}
                  >
                    <option value="open">{tr('Open', 'مفتوحة')}</option>
                    <option value="closed">{tr('Closed', 'مغلقة')}</option>
                    <option value="filled">{tr('Filled', 'تم شغلها')}</option>
                  </select>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      {tr('Posted by:', 'نُشرت بواسطة:')} <span className="font-semibold text-gray-800 dark:text-gray-200">{job.users.full_name}</span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteJob(job)}
                    className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition font-semibold"
                  >
                    {tr('Delete Job', 'احذف الوظيفة')}
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr('Page', 'صفحة')} {pagination.page} {tr('of', 'من')} {pagination.totalPages} ({pagination.total} {tr('total jobs', 'وظيفة إجمالي')})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tr('Previous', 'السابق')}
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tr('Next', 'التالي')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 transition-colors shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xl font-bold">
                !
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{tr('Delete Job?', 'حذف الوظيفة؟')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tr('This action cannot be undone.', 'الإجراء ده مافيش رجوع فيه.')}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 mb-5 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">{tr("You're about to delete:", 'هتحذف:')}</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{jobToDelete.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{jobToDelete.company}</p>
            </div>

            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{tr('Reason (optional)', 'السبب (اختياري)')}</label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-5"
              placeholder={tr('Why are you removing this job?', 'ليه بتشيل الوظيفة دي؟')}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setJobToDelete(null);
                  setDeleteReason('');
                }}
                className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
              >
                {tr('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={confirmDeleteJob}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold"
              >
                {tr('Delete Job', 'احذف الوظيفة')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {jobToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 transition-colors shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{tr('Update Status?', 'تحديث الحالة؟')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-5">
              {tr('Change', 'تغيير')} <span className="font-semibold">{jobToUpdate.title}</span> {tr('status to', 'الحالة إلى')} <span className="font-semibold capitalize">{jobToUpdate.newStatus}</span>?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setJobToUpdate(null)}
                className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
              >
                {tr('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={confirmUpdateStatus}
                className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-600 transition font-semibold"
              >
                {tr('Confirm', 'تأكيد')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsManagement;