import React, { useEffect, useState } from 'react';
import {
  getAdminJobs,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  toggleAdminJobStatus,
  getAdminJobSettings,
  updateAdminJobSettings,
} from '../../services/adminApi';
import type { Job, JobFeatureSettings } from '../../types';
import FilePickerModal from '../../components/admin/FilePickerModal';
import { JalaliDatePicker } from '../../components/common/JalaliDatePicker';

interface JobFormData {
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  responsibilities: string; // newline separated
  qualifications: string; // newline separated
  expiryDate: string;
  status: 'active' | 'stopped';
}

const initialFormData: JobFormData = {
  title: '',
  company: '',
  logo: '',
  location: 'اصفهان',
  type: 'تمام‌وقت',
  salary: '',
  description: '',
  responsibilities: '',
  qualifications: '',
  expiryDate: '',
  status: 'active',
};

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'stopped'>('all');

  // Feature Settings State
  const [settings, setSettings] = useState<JobFeatureSettings>({
    enabled: true,
    stoppedMessage: 'سامانه کاریابی و ثبت فرصت‌های شغلی موقتاً متوقف شده است. به زودی با موقعیت‌های جدید بازمی‌گردیم.',
    contactEmail: 'sace.ui.ac@gmail.com',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // File Picker for Logo
  const [filePickerOpen, setFilePickerOpen] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, settingsData] = await Promise.all([
        getAdminJobs().catch(() => []),
        getAdminJobSettings().catch(() => null),
      ]);

      if (Array.isArray(jobsData)) {
        setJobs(jobsData);
      }
      if (settingsData && typeof settingsData.enabled === 'boolean') {
        setSettings(settingsData);
      }
    } catch (err: any) {
      console.error(err);
      showToast('خطا در دریافت اطلاعات موقعیت‌های شغلی');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const updated = await updateAdminJobSettings(settings);
      setSettings(updated);
      setSettingsDirty(false);
      showToast(
        updated.enabled
          ? 'فیچر کاریابی فعال شد و در سایت در دسترس است.'
          : 'فیچر کاریابی با موفقیت متوقف شد و اطلاعیه در سایت فعال گردید.'
      );
    } catch (err: any) {
      console.error(err);
      showToast('خطا در ذخیره تنظیمات فیچر کاریابی: ' + (err.message || ''));
    } finally {
      setSavingSettings(false);
    }
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData(initialFormData);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      logo: job.logo || '',
      location: job.location || '',
      type: job.type || 'تمام‌وقت',
      salary: job.salary || '',
      description: job.description || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      qualifications: Array.isArray(job.qualifications) ? job.qualifications.join('\n') : '',
      expiryDate: job.expiryDate ? job.expiryDate.split('T')[0] : '',
      status: job.isStopped || job.status === 'stopped' ? 'stopped' : 'active',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('عنوان موقعیت شغلی الزامی است');
      return;
    }
    if (!formData.company.trim()) {
      setFormError('نام شرکت یا سازمان الزامی است');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const parsedResponsibilities = formData.responsibilities
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const parsedQualifications = formData.qualifications
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const isStopped = formData.status === 'stopped';

      const payload: Partial<Job> = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        logo: formData.logo.trim(),
        location: formData.location.trim(),
        type: formData.type.trim(),
        salary: formData.salary.trim() ? formData.salary.trim() : undefined,
        description: formData.description.trim(),
        responsibilities: parsedResponsibilities,
        qualifications: parsedQualifications,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : '',
        status: formData.status,
        isStopped: isStopped,
      };

      if (editingJob) {
        await updateAdminJob(editingJob.id, payload);
        showToast('موقعیت شغلی با موفقیت ویرایش شد.');
      } else {
        await createAdminJob(payload);
        showToast('موقعیت شغلی جدید با موفقیت اضافه شد.');
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'خطا در ثبت اطلاعات موقعیت شغلی');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleJob = async (job: Job) => {
    try {
      const updated = await toggleAdminJobStatus(job.id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      const isNowStopped = updated.isStopped || updated.status === 'stopped';
      showToast(
        isNowStopped
          ? `فرصت شغلی «${job.title}» متوقف شد.`
          : `فرصت شغلی «${job.title}» مجدداً فعال شد.`
      );
    } catch (err: any) {
      console.error(err);
      showToast('خطا در تغییر وضعیت فرصت شغلی');
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteConfirmId) return;
    try {
      setDeleting(true);
      await deleteAdminJob(deleteConfirmId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirmId));
      showToast('موقعیت شغلی با موفقیت حذف شد.');
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در حذف موقعیت شغلی');
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const isStopped = job.isStopped || job.status === 'stopped';
    if (statusFilter === 'active' && isStopped) return false;
    if (statusFilter === 'stopped' && !isStopped) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(q)) ||
      (job.company && job.company.toLowerCase().includes(q)) ||
      (job.location && job.location.toLowerCase().includes(q)) ||
      (job.description && job.description.toLowerCase().includes(q))
    );
  });

  const totalCount = jobs.length;
  const stoppedCount = jobs.filter((j) => j.isStopped || j.status === 'stopped').length;
  const activeCount = totalCount - stoppedCount;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-400/40">
          <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💼</span>
            <h1 className="text-2xl font-black text-white tracking-tight">مدیریت فیچر کاریابی و موقعیت‌های شغلی</h1>
          </div>
          <p className="text-slate-400 text-sm">
            امکان افزودن، ویرایش، متوقف کردن فرصت‌های شغلی و کنترل وضعیت کلی سامانه کاریابی انجمن
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>افزودن موقعیت شغلی جدید</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">کل موقعیت‌های شغلی</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            📋
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">موقعیت‌های فعال</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            🟢
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">موقعیت‌های متوقف‌شده</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stoppedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl">
            ⏸️
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">وضعیت کل سامانه کاریابی</p>
            <p className={`text-base font-bold mt-1 ${settings.enabled ? 'text-emerald-400' : 'text-rose-400'}`}>
              {settings.enabled ? 'فعال و در دسترس' : 'متوقف شده (غیرفعال)'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
            settings.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {settings.enabled ? '🚀' : '🛑'}
          </div>
        </div>
      </div>

      {/* Feature Master Control Card (Requirement: متوقف کردن فیچر کاریابی) */}
      <div className={`rounded-2xl p-6 border transition-all ${
        settings.enabled
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900 border-teal-500/30'
          : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/70">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full animate-pulse ${settings.enabled ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
              <h2 className="text-lg font-bold text-white">کنترل و وضعیت سراسری فیچر کاریابی</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                settings.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {settings.enabled ? 'سامانه روشن است' : 'سامانه متوقف شده است'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
              از این قسمت می‌توانید فیچر کاریابی را به طور کامل متوقف یا مجدداً فعال کنید. در صورت توقف، صفحه کاریابی با پیام اطلاعیه متوقف‌شده به مخاطبان نمایش داده می‌شود.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setSettings({ ...settings, enabled: !settings.enabled });
                setSettingsDirty(true);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                settings.enabled
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <span>{settings.enabled ? '🛑 متوقف کردن فیچر کاریابی' : '▶️ فعال‌سازی مجدد فیچر کاریابی'}</span>
            </button>
          </div>
        </div>

        {/* Stopped Message input */}
        <div className="pt-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            متن پیام اطلاعیه در زمان متوقف بودن فیچر کاریابی:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={settings.stoppedMessage}
              onChange={(e) => {
                setSettings({ ...settings, stoppedMessage: e.target.value });
                setSettingsDirty(true);
              }}
              placeholder="سامانه کاریابی و ثبت فرصت‌های شغلی موقتاً متوقف شده است..."
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {settingsDirty && (
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="self-end px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 whitespace-nowrap"
              >
                {savingSettings && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>ذخیره تنظیمات فیچر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در عنوان، نام شرکت، شهر..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: `همه موقعیت‌ها (${totalCount})` },
            { id: 'active', label: `فقط فعال (${activeCount})` },
            { id: 'stopped', label: `فقط متوقف شده (${stoppedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List / Table */}
      {loading ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-2xl border border-slate-700">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-500 border-t-transparent mb-3"></div>
          <p className="text-slate-400 text-sm">در حال بارگذاری موقعیت‌های شغلی...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-base font-bold text-slate-300">موقعیت شغلی مطابق جستجو یافت نشد</h3>
          <p className="text-slate-500 text-xs mt-1">می‌توانید موقعیت جدید اضافه کنید یا فیلتر را تغییر دهید.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold"
          >
            + افزودن موقعیت جدید
          </button>
        </div>
      ) : (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 text-xs">
                  <th className="py-4 px-6">فرصت شغلی و شرکت</th>
                  <th className="py-4 px-4">موقعیت و نوع</th>
                  <th className="py-4 px-4">حقوق / دستمزد</th>
                  <th className="py-4 px-4">وضعیت</th>
                  <th className="py-4 px-6 text-left">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredJobs.map((job) => {
                  const isStopped = job.isStopped || job.status === 'stopped';
                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-slate-700/30 transition-colors ${
                        isStopped ? 'bg-slate-900/40 opacity-75' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={
                              job.logo ||
                              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
                            }
                            alt={job.company}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop';
                            }}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <h4 className="font-bold text-white text-sm truncate">{job.title}</h4>
                            <p className="text-xs text-teal-400 font-medium mt-0.5">{job.company}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                        <div className="font-medium text-white">{job.location || 'مشخص نشده'}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{job.type}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300 font-medium">
                        {job.salary || 'توافقی'}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isStopped
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isStopped ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          {isStopped ? 'متوقف شده' : 'فعال'}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Stop/Resume Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleJob(job)}
                            title={isStopped ? 'فعال‌سازی مجدد این موقعیت' : 'متوقف کردن این موقعیت'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isStopped
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                          >
                            {isStopped ? '▶️ فعال‌سازی' : '⏸️ متوقف کردن'}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(job)}
                            title="ویرایش موقعیت شغلی"
                            className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(job.id)}
                            title="حذف موقعیت شغلی"
                            className="p-2 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingJob ? '✏️ ویرایش موقعیت شغلی' : '➕ افزودن موقعیت شغلی جدید'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    عنوان موقعیت شغلی *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثلاً: برنامه‌نویس React / کارآموز DevOps"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نام شرکت یا سازمان *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="مثلاً: اسنپ، دیجی‌کالا، ایرانیکارت..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    شهر / موقعیت مکانی
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="مثلاً: اصفهان، تهران، دورکاری"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نوع همکاری
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="تمام‌وقت">تمام‌وقت</option>
                    <option value="پاره‌وقت">پاره‌وقت</option>
                    <option value="کارآموزی">کارآموزی</option>
                    <option value="پروژه‌ای">پروژه‌ای</option>
                    <option value="دورکاری">دورکاری / ریموت</option>
                  </select>
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    میزان حقوق / دستمزد (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="توافقی یا مثلاً ۲۰ تا ۲۵ میلیون"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Status Toggle (Active vs Stopped) */}
                <div className="sm:col-span-2 bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white">وضعیت این موقعیت شغلی</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      در صورتی که متوقف شود، نشان «متوقف شده» روی آن قرار می‌گیرد و دیگر قابل ثبت نیست.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'active' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.status === 'active'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      فعال
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'stopped' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.status === 'stopped'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      متوقف شده
                    </button>
                  </div>
                </div>

                {/* Logo URL and FilePicker */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    لوگوی شرکت (آدرس اینترنتی یا انتخاب از فایل‌ها)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://... یا انتخاب از رسانه‌ها"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setFilePickerOpen(true)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      📁 رسانه‌ها
                    </button>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="sm:col-span-2">
                  <JalaliDatePicker
                    label="تاریخ انقضا (تقویم شمسی - اختیاری)"
                    value={formData.expiryDate}
                    placeholder="بدون انقضا (همیشگی)"
                    onChange={(_, gregorianISO) => setFormData({ ...formData, expiryDate: gregorianISO })}
                    helperText={formData.expiryDate ? `ذخیره میلادی در سیستم: ${formData.expiryDate}` : undefined}
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    توضیحات کلی موقعیت شغلی
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="شرح مختصری از فضای تیم، پروژه و اهداف همکاری..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Responsibilities */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    وظایف و مسئولیت‌ها (هر سطر یک مورد)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    placeholder="توسعه بک‌اند با Go یا Node.js&#10;طراحی دیتابیس PostgreSQL&#10;پیاده‌سازی تست‌ها..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>

                {/* Qualifications */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    شرایط احراز و مهارت‌های مورد نیاز (هر سطر یک مورد)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="تسلط بر مفاهیم شی‌گرایی&#10;آشنایی با Git و Docker&#10;روحیه کار تیمی..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-teal-600/30 flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingJob ? 'ذخیره تغییرات' : 'افزودن موقعیت شغلی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">تایید حذف موقعیت شغلی</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              آیا از حذف این موقعیت شغلی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteJob}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Picker Modal for Logo */}
      <FilePickerModal
        isOpen={filePickerOpen}
        onClose={() => setFilePickerOpen(false)}
        onSelect={(url) => {
          setFormData({ ...formData, logo: url });
          setFilePickerOpen(false);
        }}
        title="انتخاب لوگوی شرکت از رسانه‌ها"
        onlyImages={true}
      />
    </div>
  );
};

export default AdminJobs;
