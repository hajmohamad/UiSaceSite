import React, { useEffect, useState } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  updateAdminUserPassword,
  getUser,
} from '../../services/adminApi';
import type { AdminUser } from '../../types';

const AdminUsers: React.FC = () => {
  const currentUser = getUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Change Password Modal
  const [passwordModalUser, setPasswordModalUser] = useState<AdminUser | null>(null);
  const [changedPassword, setChangedPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete User Modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError('نام کاربری و کلمه عبور الزامی است.');
      return;
    }

    if (newPassword.length < 4) {
      setCreateError('کلمه عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    try {
      setCreateSubmitting(true);
      await createAdminUser({
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
      });

      showToast(`کاربر «${newUsername}» با موفقیت ایجاد شد.`);
      setCreateModalOpen(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('admin');
      await loadUsers();
    } catch (err: any) {
      setCreateError(err?.message || 'خطا در ایجاد کاربر جدید');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    setPasswordError(null);

    if (!changedPassword || changedPassword.length < 4) {
      setPasswordError('کلمه عبور جدید باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    try {
      setPasswordSubmitting(true);
      await updateAdminUserPassword(passwordModalUser.id, changedPassword);
      showToast(`رمز عبور کاربر «${passwordModalUser.username}» تغییر یافت.`);
      setPasswordModalUser(null);
      setChangedPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'خطا در بروزرسانی رمز عبور');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      setDeleting(true);
      await deleteAdminUser(id);
      showToast('کاربر با موفقیت حذف شد.');
      setDeleteConfirmUser(null);
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف کاربر');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-400/40">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت کاربران و مدیران سامانه</h1>
          <p className="text-sm text-slate-400 mt-1">
            تعریف مدیر جدید، تغییر رمز عبور و تنظیم دسترسی‌های ادمین
          </p>
        </div>

        <button
          onClick={() => {
            setNewUsername('');
            setNewPassword('');
            setNewRole('admin');
            setCreateError(null);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          ایجاد کاربر جدید
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">در حال دریافت لیست کاربران...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>هیچ کاربری یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">شناسه</th>
                  <th className="py-4 px-6">نام کاربری</th>
                  <th className="py-4 px-4">نقش دسترسی</th>
                  <th className="py-4 px-4">تاریخ عضویت</th>
                  <th className="py-4 px-6 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {users.map((u) => {
                  const isCurrent = currentUser?.username === u.username;
                  return (
                    <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-slate-500 font-mono text-xs">#{u.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/30">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.username}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                                  حساب شما
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {u.role === 'admin'
                            ? 'مدیر ارشد (Admin)'
                            : u.role === 'editor'
                            ? 'ویرایشگر (Editor)'
                            : u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                      </td>

                      <td className="py-4 px-6 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setChangedPassword('');
                              setPasswordError(null);
                            }}
                            title="تغییر کلمه عبور"
                            className="p-2 text-amber-400 hover:text-white hover:bg-amber-600/30 rounded-lg transition-colors text-xs flex items-center gap-1 bg-amber-500/10 px-2.5 py-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span>تغییر رمز</span>
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              title="حذف کاربر"
                              className="p-2 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">تعریف کاربر مدیر جدید</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نام کاربری (لاتین) *
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="مثال: ali_admin"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  کلمه عبور (حداقل ۴ کاراکتر) *
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نقش و سطح دسترسی
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">مدیر کامل (Admin)</option>
                  <option value="editor">ویرایشگر محتوا (Editor)</option>
                  <option value="support">پشتیبان رویدادها (Support)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {createSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  ایجاد کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">
                تغییر رمز کاربر: {passwordModalUser.username}
              </h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  کلمه عبور جدید (حداقل ۴ کاراکتر)
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={changedPassword}
                  onChange={(e) => setChangedPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2"
                >
                  {passwordSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  ثبت رمز جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">حذف کاربر مدیر</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              آیا از حذف دسترسی کاربر <strong className="text-white">«{deleteConfirmUser.username}»</strong> اطمینان دارید؟
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                حذف کاربر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
