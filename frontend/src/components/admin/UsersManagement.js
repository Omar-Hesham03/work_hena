import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUserType } from '../../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

function UsersManagement() {
  const { language } = useLanguage();
  const tr = (en, ar) => (language === 'ar' ? ar : en);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    user_type: 'all',
    search: ''
  });
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: pagination.page,
        limit: 20,
        ...filters
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteReason('');
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id, deleteReason.trim() || undefined);
      toast.success(deleteReason.trim() ? tr('User deleted and notified! 📧', 'تم حذف المستخدم وإبلاغه! 📧') : tr('User deleted! 🗑️', 'تم حذف المستخدم! 🗑️'));
      setUserToDelete(null);
      setDeleteReason('');
      fetchUsers();
    } catch (error) {
      toast.error(tr('Error deleting user: ', 'خطأ في حذف المستخدم: ') + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateUserType = (user, newType) => {
    setUserToUpdate({ ...user, newType });
  };

  const confirmUpdateUserType = async () => {
    if (!userToUpdate) return;

    try {
      await updateUserType(userToUpdate.id, userToUpdate.newType);
      toast.success(tr('User type updated! ✅', 'تم تحديث نوع المستخدم! ✅'));
      setUserToUpdate(null);
      fetchUsers();
    } catch (error) {
      toast.error(tr('Error updating user: ', 'خطأ في تحديث المستخدم: ') + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{tr('User Type', 'نوع المستخدم')}</label>
            <select
              value={filters.user_type}
              onChange={(e) => setFilters({ ...filters, user_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">{tr('All Users', 'كل المستخدمين')}</option>
              <option value="job_seeker">{tr('Job Seekers', 'باحثون عن عمل')}</option>
              <option value="recruiter">{tr('Recruiters', 'موظفو توظيف')}</option>
              <option value="admin">{tr('Admins', 'أدمن')}</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{tr('Search', 'بحث')}</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={tr('Search by name or email...', 'ابحث بالاسم أو الإيميل...')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">{tr('Loading users...', 'جاري تحميل المستخدمين...')}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">{tr('No users found', 'مافيش مستخدمين')}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tr('User', 'المستخدم')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tr('Type', 'النوع')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tr('Contact', 'التواصل')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tr('Joined', 'انضم')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{tr('Actions', 'إجراءات')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{user.full_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.user_type}
                          onChange={(e) => handleUpdateUserType(user, e.target.value)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                        >
                          <option value="job_seeker">{tr('Job Seeker', 'باحث عن عمل')}</option>
                          <option value="recruiter">{tr('Recruiter', 'مسؤول توظيف')}</option>
                          <option value="admin">{tr('Admin', 'أدمن')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {user.phone && <p className="text-gray-600 dark:text-gray-400">{user.phone}</p>}
                          {user.company_name && <p className="text-gray-600 dark:text-gray-400">{user.company_name}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold"
                        >
                          {tr('Delete', 'حذف')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr('Page', 'صفحة')} {pagination.page} {tr('of', 'من')} {pagination.totalPages} ({pagination.total} {tr('total users', 'مستخدم إجمالي')})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tr('Previous', 'السابق')}
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tr('Next', 'التالي')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 transition-colors shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xl font-bold">
                !
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{tr('Delete User?', 'حذف المستخدم؟')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tr('This action cannot be undone.', 'الإجراء ده مافيش رجوع فيه.')}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 mb-5 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">{tr("You're about to delete:", 'هتحذف:')}</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{userToDelete.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{userToDelete.email}</p>
            </div>

            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{tr('Reason (optional)', 'السبب (اختياري)')}</label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-5"
              placeholder={tr('Why are you removing this account?', 'ليه بتشيل الحساب ده؟')}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteReason('');
                }}
                className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
              >
                {tr('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold"
              >
                {tr('Delete User', 'احذف المستخدم')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type Update Confirmation Modal */}
      {userToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 transition-colors shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{tr('Update User Type?', 'تحديث نوع المستخدم؟')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-5">
              {tr('Change', 'تغيير')} <span className="font-semibold">{userToUpdate.full_name}</span> {tr('to', 'إلى')} <span className="font-semibold capitalize">{userToUpdate.newType}</span>?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUserToUpdate(null)}
                className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
              >
                {tr('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={confirmUpdateUserType}
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

export default UsersManagement;