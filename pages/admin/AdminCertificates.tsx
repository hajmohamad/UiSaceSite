import React, { useEffect, useState } from 'react';
import {
  getAdminCertificates,
  createAdminCertificate,
  batchCreateAdminCertificates,
  updateAdminCertificate,
  toggleAdminCertificateStatus,
  deleteAdminCertificate,
} from '../../services/adminApi';
import type { Certificate, BatchCertificateRequest, BatchCertificateItem } from '../../types';
import { JalaliDatePicker } from '../../components/common/JalaliDatePicker';
import { getTodayJalali, formatJalali, parseDateInput } from '../../services/jalali';

const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const todayJ = getTodayJalali();
  const defaultShamsiToday = formatJalali(todayJ.jy, todayJ.jm, todayJ.jd, 'numeric', false);

  // Single cert form state
  const [singleForm, setSingleForm] = useState<Partial<Certificate>>({
    studentName: '',
    gender: 'male',
    titlePrefix: 'جناب آقای',
    nationalId: '',
    studentNumber: '',
    programTitle: '',
    programDate: '',
    durationHours: 8,
    instructor: '',
    associationHead: 'دبیر انجمن علمی مهندسی کامپیوتر',
    grade: '',
    issueDate: defaultShamsiToday,
    customText: '',
    status: 'valid',
    description: '',
  });

  // Batch cert form state
  const [batchForm, setBatchForm] = useState<BatchCertificateRequest>({
    programTitle: '',
    programDate: '',
    durationHours: 8,
    instructor: '',
    associationHead: 'دبیر انجمن علمی مهندسی کامپیوتر',
    issueDate: defaultShamsiToday,
    customText: '',
    items: [],
  });
  const [batchText, setBatchText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await getAdminCertificates();
      setCertificates(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در دریافت لیست گواهینامه‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      setProcessingId(id);
      await toggleAdminCertificateStatus(id);
      showToast('وضعیت گواهینامه بروزرسانی شد');
      await loadCertificates();
    } catch (err: any) {
      alert(err?.message || 'خطا در تغییر وضعیت گواهینامه');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف کامل این گواهینامه مطمئن هستید؟')) return;
    try {
      setProcessingId(id);
      await deleteAdminCertificate(id);
      showToast('گواهینامه حذف شد');
      await loadCertificates();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف گواهینامه');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.studentName || !singleForm.programTitle) {
      alert('لطفاً نام دانشجو و عنوان رویداد را وارد کنید');
      return;
    }

    try {
      if (editingCert) {
        await updateAdminCertificate(editingCert.id, singleForm);
        showToast('گواهینامه با موفقیت ویرایش شد');
      } else {
        await createAdminCertificate(singleForm);
        showToast('گواهینامه جدید صادر گردید');
      }
      setIsSingleModalOpen(false);
      setEditingCert(null);
      await loadCertificates();
    } catch (err: any) {
      alert(err?.message || 'خطا در ذخیره اطلاعات گواهینامه');
    }
  };

  const handleOpenEdit = (cert: Certificate) => {
    setEditingCert(cert);
    setSingleForm({ ...cert });
    setIsSingleModalOpen(true);
  };

  const handleOpenCreateSingle = () => {
    setEditingCert(null);
    setSingleForm({
      studentName: '',
      gender: 'male',
      titlePrefix: 'جناب آقای',
      nationalId: '',
      studentNumber: '',
      programTitle: '',
      programDate: '',
      durationHours: 8,
      instructor: '',
      associationHead: 'دبیر انجمن علمی مهندسی کامپیوتر',
      grade: '',
      issueDate: defaultShamsiToday,
      customText: '',
      status: 'valid',
      description: '',
    });
    setIsSingleModalOpen(true);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.programTitle.trim()) {
      alert('لطفاً عنوان دوره را مشخص فرمایید');
      return;
    }

    // Parse batch text lines (Format: نام, کدملی, شماره دانشجویی, نمره, جنسیت/عنوان, متن اختصاصی)
    const lines = batchText.trim().split('\n');
    const items: BatchCertificateItem[] = [];

    for (const line of lines) {
      const parts = line.split(/[,;\t|]/).map((p) => p.trim());
      if (parts[0]) {
        const rawGenderOrTitle = parts[4] || '';
        let titlePrefix = '';
        let gender = '';

        if (rawGenderOrTitle.includes('خانم') || rawGenderOrTitle.toLowerCase() === 'female' || rawGenderOrTitle === 'زن') {
          titlePrefix = 'سرکار خانم';
          gender = 'female';
        } else if (rawGenderOrTitle.includes('آقا') || rawGenderOrTitle.toLowerCase() === 'male' || rawGenderOrTitle === 'مرد') {
          titlePrefix = 'جناب آقای';
          gender = 'male';
        } else if (rawGenderOrTitle) {
          titlePrefix = rawGenderOrTitle;
        }

        items.push({
          studentName: parts[0],
          nationalId: parts[1] || '',
          studentNumber: parts[2] || '',
          grade: parts[3] || '',
          gender,
          titlePrefix,
          customText: parts[5] || '',
        });
      }
    }

    if (items.length === 0) {
      alert('هیچ دانشجویی در متن ورودی یافت نشد');
      return;
    }

    try {
      const payload: BatchCertificateRequest = {
        ...batchForm,
        items,
      };
      const res = await batchCreateAdminCertificates(payload);
      showToast(res.message || `تعداد ${res.count} مدرک صادر شد`);
      setIsBatchModalOpen(false);
      setBatchText('');
      await loadCertificates();
    } catch (err: any) {
      alert(err?.message || 'خطا در صدور گروهی گواهینامه‌ها');
    }
  };

  const filteredCertificates = certificates.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.id.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.nationalId?.includes(q) ||
      c.studentNumber?.includes(q) ||
      c.programTitle.toLowerCase().includes(q)
    );
  });

  const validCount = certificates.filter((c) => c.status === 'valid').length;
  const revokedCount = certificates.filter((c) => c.status === 'revoked').length;

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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">سامانه صدور و مدیریت گواهینامه‌ها</h1>
          <p className="text-sm text-slate-400 mt-1">
            صدور مدارک معتبر دانشگاهی مجهز به QR-Code اصالت‌سنجی برای دوره‌ها و کارگاه‌ها
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>صدور گروهی برای دوره</span>
          </button>

          <button
            onClick={handleOpenCreateSingle}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>صدور مدرک تکی</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <p className="text-xs text-slate-400">کل گواهینامه‌های صادر شده</p>
          <p className="text-2xl font-black text-white mt-1">{certificates.length}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <p className="text-xs text-emerald-400">گواهینامه‌های دارای اصالت معتبر</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{validCount}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <p className="text-xs text-rose-400">گواهینامه‌های باطل شده</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{revokedCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="جستجو بر اساس نام دانشجو، کد ملی، شماره دانشجویی، کد مدرک یا عنوان دوره..."
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
            <p className="text-sm text-slate-400">در حال دریافت لیست گواهینامه‌ها...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>هیچ گواهینامه‌ای یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">کد گواهی</th>
                  <th className="py-4 px-4">نام دانشجو</th>
                  <th className="py-4 px-4">کد ملی / ش.دانشجویی</th>
                  <th className="py-4 px-4">دوره / کارگاه</th>
                  <th className="py-4 px-4">تاریخ صدور</th>
                  <th className="py-4 px-4">وضعیت</th>
                  <th className="py-4 px-6 text-left">اقدامات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-blue-400 whitespace-nowrap">
                      <a
                        href={`/certificates/${cert.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                        title="مشاهده نسخه رسمی گواهینامه"
                      >
                        {cert.id}
                        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>

                    <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                      {cert.studentName}
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                      {cert.studentNumber || cert.nationalId || '-'}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-300 max-w-xs truncate">
                      {cert.programTitle}
                      {cert.durationHours > 0 && ` (${cert.durationHours} س)`}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-300 whitespace-nowrap font-mono">
                      {cert.issueDate ? (() => {
                        const p = parseDateInput(cert.issueDate);
                        return p ? p.formattedNumeric : cert.issueDate;
                      })() : '-'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          cert.status === 'valid'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {cert.status === 'valid' ? 'معتبر' : 'باطل شده'}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={processingId === cert.id}
                          onClick={() => handleToggleStatus(cert.id)}
                          title={cert.status === 'valid' ? 'ابطال گواهینامه' : 'فعال‌سازی مجدد'}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            cert.status === 'valid'
                              ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border-rose-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/30'
                          }`}
                        >
                          {cert.status === 'valid' ? 'ابطال' : 'احیا'}
                        </button>

                        <button
                          disabled={processingId === cert.id}
                          onClick={() => handleOpenEdit(cert)}
                          title="ویرایش"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          disabled={processingId === cert.id}
                          onClick={() => handleDelete(cert.id)}
                          title="حذف کامل"
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

      {/* Single Cert Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-xl w-full border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-white text-lg">
                {editingCert ? 'ویرایش گواهینامه' : 'صدور گواهینامه جدید'}
              </h3>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">نام و نام خانوادگی دانشجو *</label>
                <input
                  type="text"
                  required
                  value={singleForm.studentName || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, studentName: e.target.value })}
                  placeholder="مثال: محمد امینی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* تعیین جنسیت و پیشوند عنوان شخص */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">عنوان / جنسیت شخص</label>
                  <select
                    value={singleForm.titlePrefix || (singleForm.gender === 'female' ? 'سرکار خانم' : singleForm.gender === 'male' ? 'جناب آقای' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      let gen = singleForm.gender;
                      if (val === 'جناب آقای') gen = 'male';
                      else if (val === 'سرکار خانم') gen = 'female';
                      else if (val === '') gen = '';
                      setSingleForm({ ...singleForm, titlePrefix: val, gender: gen });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="جناب آقای">جناب آقای (مرد)</option>
                    <option value="سرکار خانم">سرکار خانم (زن)</option>
                    <option value="">بدون عنوان (فقط نام کامل)</option>
                    <option value="سرکار خانم / جناب آقای">سرکار خانم / جناب آقای (هر دو)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">پیشوند سفارشی (اختیاری)</label>
                  <input
                    type="text"
                    value={singleForm.titlePrefix || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, titlePrefix: e.target.value })}
                    placeholder="مثلاً: مهندس، پژوهشگر ارجمند"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">کد ملی</label>
                  <input
                    type="text"
                    value={singleForm.nationalId || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, nationalId: e.target.value })}
                    placeholder="1270000000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">شماره دانشجویی</label>
                  <input
                    type="text"
                    value={singleForm.studentNumber || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, studentNumber: e.target.value })}
                    placeholder="9923456"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان دوره یا کارگاه *</label>
                <input
                  type="text"
                  required
                  value={singleForm.programTitle || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, programTitle: e.target.value })}
                  placeholder="مثال: کارگاه آموزش تخصصی یادگیری ماشین و پایتون"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* شخصی‌سازی متن گواهینامه */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">متن اختصاصی گواهینامه (اختیاری)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultText = `دوره آموزشی تخصصی «${singleForm.programTitle || 'عنوان دوره'}»${singleForm.durationHours ? ` به مدت ${singleForm.durationHours} ساعت` : ''}${singleForm.programDate ? ` در تاریخ ${singleForm.programDate}` : ''} را با موفقیت به پایان رسانده و این گواهینامه به پاس تلاش و شایستگی ایشان اعطا می‌گردد.`;
                      setSingleForm({ ...singleForm, customText: defaultText });
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    درج متن پیش‌فرض جهت ویرایش
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={singleForm.customText || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, customText: e.target.value })}
                  placeholder="در صورت خالی بودن، متن رسمی پیش‌فرض سیستم درج می‌گردد. می‌توانید متن را کاملاً دلخواه تایپ فرمایید."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">مدت زمان (ساعت)</label>
                  <input
                    type="number"
                    value={singleForm.durationHours || 0}
                    onChange={(e) => setSingleForm({ ...singleForm, durationHours: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <JalaliDatePicker
                    label="تاریخ برگزاری"
                    value={singleForm.programDate || ''}
                    placeholder="انتخاب تاریخ دوره..."
                    onChange={(_, __, displayLong) => setSingleForm({ ...singleForm, programDate: displayLong })}
                  />
                </div>
                <div>
                  <JalaliDatePicker
                    label="تاریخ صدور"
                    value={singleForm.issueDate || ''}
                    placeholder="انتخاب تاریخ صدور..."
                    onChange={(shamsiNum) => setSingleForm({ ...singleForm, issueDate: shamsiNum })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نام مدرس</label>
                  <input
                    type="text"
                    value={singleForm.instructor || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, instructor: e.target.value })}
                    placeholder="دکتر ..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">سمت / دبیر انجمن</label>
                  <input
                    type="text"
                    value={singleForm.associationHead || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, associationHead: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">رتبه / درجه ارزشیابی (اختیاری)</label>
                <input
                  type="text"
                  value={singleForm.grade || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, grade: e.target.value })}
                  placeholder="مثال: رتبه برتر، نمره ۱۰۰، عالی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  {editingCert ? 'بروزرسانی' : 'صدور مدرک'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Cert Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <h3 className="font-bold text-white text-lg">صدور گروهی گواهینامه برای دوره</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  برای صدور مدارک تمام شرکت‌کنندگان یک دوره به صورت یکجا
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان دوره یا کارگاه *</label>
                <input
                  type="text"
                  required
                  value={batchForm.programTitle}
                  onChange={(e) => setBatchForm({ ...batchForm, programTitle: e.target.value })}
                  placeholder="مثال: بوت‌کمپ پایتون و جنگو پاییز ۱۴۰۳"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  متن اختصاصی مشترک برای تمام شرکت‌کنندگان این دوره (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={batchForm.customText || ''}
                  onChange={(e) => setBatchForm({ ...batchForm, customText: e.target.value })}
                  placeholder="در صورت خالی بودن، متن رسمی پیش‌فرض سیستم برای تمام افراد استفاده خواهد شد..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">مدت زمان (ساعت)</label>
                  <input
                    type="number"
                    value={batchForm.durationHours || 0}
                    onChange={(e) => setBatchForm({ ...batchForm, durationHours: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <JalaliDatePicker
                    label="تاریخ دوره"
                    value={batchForm.programDate || ''}
                    placeholder="انتخاب تاریخ دوره..."
                    onChange={(_, __, displayLong) => setBatchForm({ ...batchForm, programDate: displayLong })}
                  />
                </div>
                <div>
                  <JalaliDatePicker
                    label="تاریخ صدور"
                    value={batchForm.issueDate || ''}
                    placeholder="انتخاب تاریخ صدور..."
                    onChange={(shamsiNum) => setBatchForm({ ...batchForm, issueDate: shamsiNum })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">نام مدرس</label>
                  <input
                    type="text"
                    value={batchForm.instructor || ''}
                    onChange={(e) => setBatchForm({ ...batchForm, instructor: e.target.value })}
                    placeholder="مهندس احمدی"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  لیست شرکت‌کنندگان (هر خط یک نفر) *
                </label>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  فرمت هر سطر: <code className="text-amber-400">نام کامل, کد ملی, شماره دانشجویی, نمره یا رتبه, جنسیت یا پیشوند (خانم/آقا), متن اختصاصی (اختیاری)</code>
                  <br />
                  می‌توانید اطلاعات را مستقیماً از ستون‌های اکسل کپی و پیست نمایید.
                </p>
                <textarea
                  required
                  rows={8}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`علی محمدی, 1270123456, 9912345, عالی, آقا
سارا رضایی, 1289876543, 9823456, خیلی خوب, خانم
رضا حسینی, 1295554443, 4001234, -, آقا`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono leading-relaxed placeholder-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg cursor-pointer"
                >
                  صدور تمام مدارک گروهی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
