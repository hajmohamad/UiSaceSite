import React, { useEffect, useState } from 'react';
import {
  getAdminPromoCodes,
  createAdminPromoCode,
  updateAdminPromoCode,
  toggleAdminPromoCode,
  deleteAdminPromoCode,
} from '../../services/adminApi';
import type { PromoCode } from '../../types';
import { JalaliDatePicker } from '../../components/common/JalaliDatePicker';
import { parseDateInput } from '../../services/jalali';

const AdminPromoCodes: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [form, setForm] = useState<Partial<PromoCode>>({
    code: '',
    discountType: 'percent',
    discountValue: 20,
    maxDiscount: undefined,
    maxUses: 0,
    programId: undefined,
    expiryDate: '',
    isActive: true,
    description: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await getAdminPromoCodes();
      setPromoCodes(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در دریافت لیست کدهای تخفیف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      setProcessingId(id);
      await toggleAdminPromoCode(id);
      showToast('وضعیت کد تخفیف تغییر یافت');
      await loadPromoCodes();
    } catch (err: any) {
      alert(err?.message || 'خطا در تغییر وضعیت');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این کد تخفیف مطمئن هستید؟')) return;
    try {
      setProcessingId(id);
      await deleteAdminPromoCode(id);
      showToast('کد تخفیف حذف شد');
      await loadPromoCodes();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف کد تخفیف');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingCode(null);
    setForm({
      code: '',
      discountType: 'percent',
      discountValue: 20,
      maxDiscount: undefined,
      maxUses: 0,
      programId: undefined,
      expiryDate: '',
      isActive: true,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: PromoCode) => {
    setEditingCode(promo);
    setForm({ ...promo });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code?.trim() || !form.discountValue) {
      alert('لطفاً کد تخفیف و مقدار تخفیف را وارد کنید');
      return;
    }

    try {
      const payload: Partial<PromoCode> = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses || 0),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        programId: form.programId ? Number(form.programId) : undefined,
      };

      if (editingCode) {
        await updateAdminPromoCode(editingCode.id, payload);
        showToast('کد تخفیف ویرایش شد');
      } else {
        await createAdminPromoCode(payload);
        showToast('کد تخفیف جدید ایجاد شد');
      }
      setIsModalOpen(false);
      await loadPromoCodes();
    } catch (err: any) {
      alert(err?.message || 'خطا در ثبت کد تخفیف');
    }
  };

  const filtered = promoCodes.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return p.code.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  const totalUsed = promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);
  const activeCount = promoCodes.filter((p) => p.isActive).length;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت کدهای تخفیف (Promo Codes)</h1>
          <p className="text-sm text-slate-400 mt-1">
            تعریف کوپن‌های تخفیف درصدی یا ثابت برای رویدادها، اعضای فعال یا ورودی‌های جدید
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>ایجاد کد تخفیف جدید</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <p className="text-xs text-slate-400">تعداد کدهای تخفیف</p>
          <p className="text-2xl font-black text-white mt-1">{promoCodes.length}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <p className="text-xs text-emerald-400">کدهای فعال</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <p className="text-xs text-amber-400">مجموع دفعات استفاده شده</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{totalUsed}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="جستجو در نام کد تخفیف یا توضیحات..."
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
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">در حال دریافت لیست کدهای تخفیف...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>هیچ کد تخفیفی یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">کد تخفیف</th>
                  <th className="py-4 px-4">نوع و مقدار تخفیف</th>
                  <th className="py-4 px-4">تعداد مصرف / ظرفیت</th>
                  <th className="py-4 px-4">محدودیت دوره</th>
                  <th className="py-4 px-4">تاریخ انقضا</th>
                  <th className="py-4 px-4">وضعیت</th>
                  <th className="py-4 px-6 text-left">اقدامات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filtered.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                          {promo.code}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(promo.code);
                            showToast(`کد ${promo.code} کپی شد`);
                          }}
                          title="کپی کد"
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      {promo.description && (
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs truncate">{promo.description}</p>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      {promo.discountType === 'percent' ? (
                        <div>
                          <span className="font-bold text-blue-400">{promo.discountValue}٪ تخفیف</span>
                          {promo.maxDiscount && (
                            <span className="text-[11px] text-slate-400 block">
                              (سقف: {new Intl.NumberFormat('fa-IR').format(promo.maxDiscount)} ت)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-bold text-emerald-400">
                          {new Intl.NumberFormat('fa-IR').format(promo.discountValue)} تومان
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs font-mono text-slate-300">
                      {promo.usedCount} / {promo.maxUses === 0 ? 'نامحدود' : promo.maxUses}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                      {promo.programId ? `دوره #${promo.programId}` : 'همه دوره‌ها'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                      {promo.expiryDate ? (() => {
                        const parsed = parseDateInput(promo.expiryDate);
                        return parsed ? parsed.formattedLong : promo.expiryDate;
                      })() : 'همیشگی'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          promo.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {promo.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={processingId === promo.id}
                          onClick={() => handleToggle(promo.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            promo.isActive
                              ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border-amber-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/30'
                          }`}
                        >
                          {promo.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                        </button>

                        <button
                          disabled={processingId === promo.id}
                          onClick={() => handleOpenEdit(promo)}
                          title="ویرایش"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          disabled={processingId === promo.id}
                          onClick={() => handleDelete(promo.id)}
                          title="حذف"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-white text-lg">
                {editingCode ? 'ویرایش کد تخفیف' : 'ایجاد کد تخفیف جدید'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">کد تخفیف (انگلیسی و حروف بزرگ) *</label>
                <input
                  type="text"
                  required
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="مثلاً: SACE_STUDENT"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نوع تخفیف</label>
                  <select
                    value={form.discountType || 'percent'}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="percent">درصدی (٪)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    مقدار تخفیف {form.discountType === 'percent' ? '(درصد)' : '(تومان)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.discountValue || 0}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {form.discountType === 'percent' && (
                <div>
                  <label className="block text-slate-300 mb-1">حداکثر سقف تخفیف (تومان - اختیاری)</label>
                  <input
                    type="number"
                    value={form.maxDiscount || ''}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="مثال: 50000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">حداکثر دفعات استفاده (۰ = نامحدود)</label>
                  <input
                    type="number"
                    value={form.maxUses || 0}
                    onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <JalaliDatePicker
                    label="تاریخ انقضا (تقویم شمسی)"
                    value={form.expiryDate || ''}
                    placeholder="بدون انقضا (همیشگی)"
                    onChange={(_, gregorianISO) => setForm({ ...form, expiryDate: gregorianISO })}
                    helperText={form.expiryDate ? `ذخیره میلادی در سیستم: ${form.expiryDate}` : 'در صورت خالی بودن بدون انقضا خواهد بود'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">توضیحات (اختیاری)</label>
                <input
                  type="text"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="مثال: تخفیف ۲۰ درصدی دانشجویان ورودی جدید"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  {editingCode ? 'بروزرسانی کد' : 'ایجاد کد تخفیف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;
