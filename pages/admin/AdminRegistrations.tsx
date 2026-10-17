import React, { useEffect, useState } from 'react';
import {
  getAdminRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from '../../services/adminApi';
import type { Registration } from '../../types';

const AdminRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getAdminRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری لیست ثبت‌نام‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
    try {
      setProcessingId(id);
      await updateRegistrationStatus(id, status);
      showToast(status === 'approved' ? 'ثبت‌نام تایید شد' : status === 'rejected' ? 'ثبت‌نام رد شد' : 'وضعیت تغییر یافت');
      await loadRegistrations();
    } catch (err: any) {
      alert(err?.message || 'خطا در تغییر وضعیت');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این ثبت‌نام اطمینان دارید؟')) return;
    try {
      setProcessingId(id);
      await deleteRegistration(id);
      showToast('ثبت‌نام حذف شد');
      await loadRegistrations();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف ثبت‌نام');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.name?.toLowerCase().includes(query) ||
      r.phone?.includes(query) ||
      r.studentNumber?.includes(query) ||
      r.program?.title?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">مدیریت ثبت‌نام‌های رویدادها</h1>
        <p className="text-sm text-slate-400 mt-1">
          بررسی فیش‌های واریزی، تایید یا رد درخواست شرکت در رویدادها و کارگاه‌ها
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شماره تماس، رویداد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {st === 'all'
                ? 'همه ثبت‌نام‌ها'
                : st === 'pending'
                ? 'در انتظار بررسی'
                : st === 'approved'
                ? 'تایید شده'
                : 'رد شده'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">در حال دریافت لیست ثبت‌نام‌ها...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>هیچ ثبت‌نامی در این وضعیت یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">شرکت‌کننده</th>
                  <th className="py-4 px-4">شماره تماس</th>
                  <th className="py-4 px-4">رویداد انتخابی</th>
                  <th className="py-4 px-4">وضعیت دانشجو</th>
                  <th className="py-4 px-4">رسید پرداخت</th>
                  <th className="py-4 px-4">وضعیت</th>
                  <th className="py-4 px-6 text-left">اقدامات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white whitespace-nowrap">
                      {reg.name}
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-slate-300 whitespace-nowrap" dir="ltr">
                      {reg.phone}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-300 max-w-xs truncate">
                      {reg.program?.title || `شناسه رویداد: #${reg.programId}`}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      {reg.isStudent ? (
                        <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                          دانشجو: {reg.studentNumber || 'ثبت نشده'}
                        </span>
                      ) : (
                        <span className="text-slate-400">آزاد / غیردانشجو</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {reg.receiptUrl ? (
                        <button
                          onClick={() => setViewReceiptUrl(reg.receiptUrl || null)}
                          className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-500/20"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          مشاهده فیش
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">ندارد (رایگان)</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          reg.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : reg.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {reg.status === 'approved' ? 'تایید شده' : reg.status === 'rejected' ? 'رد شده' : 'در انتظار بررسی'}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        {reg.status !== 'approved' && (
                          <button
                            disabled={processingId === reg.id}
                            onClick={() => handleStatusChange(reg.id, 'approved')}
                            title="تایید ثبت‌نام"
                            className="px-2.5 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold transition-all border border-emerald-500/30"
                          >
                            تایید
                          </button>
                        )}

                        {reg.status !== 'rejected' && (
                          <button
                            disabled={processingId === reg.id}
                            onClick={() => handleStatusChange(reg.id, 'rejected')}
                            title="رد درخواست"
                            className="px-2.5 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition-all border border-rose-500/30"
                          >
                            رد
                          </button>
                        )}

                        <button
                          disabled={processingId === reg.id}
                          onClick={() => handleDelete(reg.id)}
                          title="حذف رکورد"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Receipt Image Modal */}
      {viewReceiptUrl && (
        <div
          onClick={() => setViewReceiptUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs cursor-pointer"
        >
          <div className="bg-slate-800 p-4 rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
              <h4 className="font-bold text-white text-sm">تصویر فیش واریزی</h4>
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <img
              src={viewReceiptUrl}
              alt="Receipt"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-slate-900"
            />
            <div className="mt-3 text-center">
              <a
                href={viewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                باز کردن در اندازه اصلی در تب جدید
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;
