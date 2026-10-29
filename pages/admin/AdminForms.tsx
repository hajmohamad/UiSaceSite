import React, { useEffect, useState } from 'react';
import {
  getAdminForms,
  createAdminForm,
  updateAdminForm,
  deleteAdminForm,
  getAdminFormResponses,
  deleteAdminFormResponse,
} from '../../services/adminApi';
import type {
  PorslineForm,
  PorslineFormType,
  PorslineFormStatus,
  FormQuestion,
  QuestionType,
  FormResponse,
  FormAnalytics,
} from '../../types';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: string }[] = [
  { type: 'text', label: 'متن کوتاه', icon: '📝' },
  { type: 'textarea', label: 'متن بلند / تشریحی', icon: '📄' },
  { type: 'radio', label: 'چندگزینه‌ای (تک‌انتخاب)', icon: '🔘' },
  { type: 'checkbox', label: 'چندگزینه‌ای (چندانتخاب)', icon: '☑️' },
  { type: 'select', label: 'منوی کشویی', icon: '🔽' },
  { type: 'rating', label: 'امتیاز ستاره‌ای (۱ تا ۵)', icon: '⭐' },
  { type: 'scale', label: 'طیف خطی (۱ تا ۱۰)', icon: '📊' },
  { type: 'boolean', label: 'بله / خیر', icon: '⚖️' },
  { type: 'number', label: 'عدد', icon: '🔢' },
  { type: 'email', label: 'ایمیل', icon: '📧' },
  { type: 'phone', label: 'شماره تماس', icon: '📱' },
  { type: 'date', label: 'تاریخ', icon: '📅' },
  { type: 'file', label: 'آپلود فایل', icon: '📎' },
];

const FORM_TYPES: { type: PorslineFormType; label: string; desc: string; badge: string }[] = [
  { type: 'survey', label: 'نظرسنجی و بازخورد', desc: 'دریافت آرا و نظرات شرکت‌کنندگان', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { type: 'quiz', label: 'آزمون و کوئیز', desc: 'محاسبه خودکار نمره و پاسخ صحیح', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { type: 'registration', label: 'فرم ثبت‌نام و پذیرش', desc: 'دریافت مشخصات و رزرو رویداد', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { type: 'evaluation', label: 'ارزیابی و رضایت‌سنجی', desc: 'سنجش شاخص‌های رضایت', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { type: 'general', label: 'فرم عمومی', desc: 'فرم چندمنظوره و سفارشی', badge: 'bg-slate-700 text-slate-300 border-slate-600' },
];

const AdminForms: React.FC = () => {
  const [forms, setForms] = useState<PorslineForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<PorslineForm | null>(null);
  const [builderTab, setBuilderTab] = useState<'questions' | 'settings' | 'preview'>('questions');

  // Form Under Edit in Builder
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<PorslineFormType>('survey');
  const [formStatus, setFormStatus] = useState<PorslineFormStatus>('active');
  const [formSlug, setFormSlug] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLimitMin, setTimeLimitMin] = useState<number>(0);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Responses / Analytics Modal
  const [responsesModalOpen, setResponsesModalOpen] = useState(false);
  const [activeFormForResponses, setActiveFormForResponses] = useState<PorslineForm | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<FormResponse | null>(null);

  // Delete Form Confirmation
  const [deleteFormTarget, setDeleteFormTarget] = useState<PorslineForm | null>(null);
  const [deleting, setDeleting] = useState(false);

  // QR Code Modal
  const [qrModalForm, setQrModalForm] = useState<PorslineForm | null>(null);

  // Search within responses
  const [responseSearch, setResponseSearch] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await getAdminForms({
        type: typeFilter,
        status: statusFilter,
        search,
      });
      setForms(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری فرم‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [typeFilter, statusFilter]);

  const openCreateBuilder = () => {
    setEditingForm(null);
    setFormTitle('');
    setFormDesc('');
    setFormType('survey');
    setFormStatus('active');
    setFormSlug('');
    setIsPublic(true);
    setAllowMultiple(true);
    setSuccessMessage('از همراهی و پاسخ‌گویی شما سپاسگزاریم!');
    setTimeLimitMin(0);
    setQuestions([]);
    setBuilderTab('questions');
    setBuilderOpen(true);
  };

  const openEditBuilder = (f: PorslineForm) => {
    setEditingForm(f);
    setFormTitle(f.title || '');
    setFormDesc(f.description || '');
    setFormType(f.type || 'survey');
    setFormStatus(f.status || 'active');
    setFormSlug(f.slug || '');
    setIsPublic(f.isPublic ?? true);
    setAllowMultiple(f.allowMultiple ?? true);
    setSuccessMessage(f.successMessage || 'از همراهی و پاسخ‌گویی شما سپاسگزاریم!');
    setTimeLimitMin(f.timeLimitMin || 0);
    setQuestions(f.questions ? [...f.questions] : []);
    setBuilderTab('questions');
    setBuilderOpen(true);
  };

  // Question Management in Builder
  const addQuestion = (type: QuestionType) => {
    const newQ: FormQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      title: 'سوال جدید',
      type,
      required: false,
      order: questions.length + 1,
      options: ['radio', 'checkbox', 'select'].includes(type)
        ? ['گزینه اول', 'گزینه دوم', 'گزینه سوم']
        : undefined,
      points: formType === 'quiz' ? 5 : undefined,
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (index: number, patch: Partial<FormQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...patch };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const moveQuestion = (index: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setQuestions(updated);
  };

  const duplicateQuestion = (index: number) => {
    const original = questions[index];
    const copy: FormQuestion = {
      ...original,
      id: `q_${Date.now()}_copy`,
      title: `${original.title} (کپی)`,
      order: questions.length + 1,
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, copy);
    setQuestions(updated);
  };

  // Option operations for choice questions
  const addOption = (qIdx: number) => {
    const q = questions[qIdx];
    const currentOptions = q.options || [];
    updateQuestion(qIdx, {
      options: [...currentOptions, `گزینه ${currentOptions.length + 1}`],
    });
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    const q = questions[qIdx];
    const currentOptions = [...(q.options || [])];
    currentOptions[optIdx] = val;
    updateQuestion(qIdx, { options: currentOptions });
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    const currentOptions = (q.options || []).filter((_, i) => i !== optIdx);
    updateQuestion(qIdx, { options: currentOptions });
  };

  // Save Form
  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      alert('لطفاً عنوان فرم را وارد کنید.');
      return;
    }
    if (questions.length === 0) {
      alert('لطفاً حداقل یک سوال به فرم اضافه کنید.');
      return;
    }

    try {
      setSubmittingForm(true);
      const payload: Partial<PorslineForm> = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        type: formType,
        status: formStatus,
        slug: formSlug.trim(),
        isPublic,
        allowMultiple,
        successMessage: successMessage.trim(),
        timeLimitMin: Number(timeLimitMin) || 0,
        questions: questions.map((q, idx) => ({ ...q, order: idx + 1 })),
      };

      if (editingForm) {
        await updateAdminForm(editingForm.id, payload);
        showToast('فرم پرسلاین با موفقیت بروزرسانی شد.');
      } else {
        await createAdminForm(payload);
        showToast('فرم جدید با موفقیت ایجاد گردید.');
      }

      setBuilderOpen(false);
      await loadForms();
    } catch (err: any) {
      alert(err?.message || 'خطا در ذخیره فرم');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete Form
  const handleDeleteForm = async () => {
    if (!deleteFormTarget) return;
    try {
      setDeleting(true);
      await deleteAdminForm(deleteFormTarget.id);
      showToast('فرم با موفقیت حذف گردید.');
      setDeleteFormTarget(null);
      await loadForms();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف فرم');
    } finally {
      setDeleting(false);
    }
  };

  // Open Responses Modal
  const openResponsesModal = async (form: PorslineForm) => {
    setActiveFormForResponses(form);
    setResponsesModalOpen(true);
    setSelectedResponseDetail(null);
    try {
      setLoadingResponses(true);
      const data = await getAdminFormResponses(form.id);
      setResponses(data.responses || []);
      setAnalytics(data.analytics || null);
    } catch (err: any) {
      alert(err?.message || 'خطا در بارگذاری پاسخ‌ها');
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleDeleteResponse = async (respId: number) => {
    if (!window.confirm('آیا از حذف این پاسخ اطمینان دارید؟')) return;
    try {
      await deleteAdminFormResponse(respId);
      setResponses(responses.filter((r) => r.id !== respId));
      if (selectedResponseDetail?.id === respId) {
        setSelectedResponseDetail(null);
      }
      showToast('پاسخ با موفقیت حذف شد.');
      await loadForms();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف پاسخ');
    }
  };

  const copyShareLink = (form: PorslineForm) => {
    const url = `${window.location.origin}/form/${form.slug || form.id}`;
    navigator.clipboard.writeText(url);
    showToast('لینک اشتراک‌گذاری فرم کپی شد!');
  };

  // Duplicate / Clone Form
  const handleCloneForm = async (form: PorslineForm) => {
    try {
      const clonedQuestions = (form.questions || []).map((q, idx) => ({
        ...q,
        id: `q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      }));

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const payload = {
        title: `کپی از ${form.title}`,
        description: form.description || '',
        type: form.type,
        status: 'draft' as PorslineFormStatus,
        slug: `${form.slug ? form.slug : 'form'}-copy-${randomSuffix}`,
        isPublic: form.isPublic,
        allowMultiple: form.allowMultiple,
        successMessage: form.successMessage,
        timeLimitMin: form.timeLimitMin || 0,
        questions: clonedQuestions,
      };

      await createAdminForm(payload);
      showToast('یک نسخه کپی از فرم در حالت پیش‌نویس ایجاد شد.');
      await loadForms();
    } catch (err: any) {
      alert(err?.message || 'خطا در شبیه‌سازی فرم');
    }
  };

  // Quick Status Toggle
  const handleQuickStatusToggle = async (form: PorslineForm, newStatus: PorslineFormStatus) => {
    try {
      await updateAdminForm(form.id, {
        ...form,
        status: newStatus,
      });
      setForms((prev) =>
        prev.map((f) => (f.id === form.id ? { ...f, status: newStatus } : f))
      );
      showToast(
        `وضعیت فرم به «${
          newStatus === 'active' ? 'فعال' : newStatus === 'draft' ? 'پیش‌نویس' : 'بسته‌شده'
        }» تغییر یافت.`
      );
    } catch (err: any) {
      alert(err?.message || 'خطا در تغییر وضعیت فرم');
    }
  };

  // Export Responses to CSV / Excel with UTF-8 BOM
  const handleExportCSV = () => {
    if (!activeFormForResponses || responses.length === 0) return;

    const isQuiz = activeFormForResponses.type === 'quiz';
    const headers = [
      'ردیف',
      'شناسه پاسخ',
      'نام پاسخ‌دهنده',
      'شماره تماس / ایمیل',
      'تاریخ و زمان ثبت',
      ...(isQuiz ? ['نمره کسب‌شده', 'حداکثر نمره آزمون', 'درصد نمره'] : []),
      ...activeFormForResponses.questions.map((q) => q.title.replace(/"/g, '""')),
    ];

    const rows = responses.map((r, index) => {
      const quizCols = isQuiz
        ? [
            r.score !== undefined && r.score !== null ? String(r.score) : '-',
            r.maxScore !== undefined && r.maxScore !== null ? String(r.maxScore) : '-',
            r.score !== undefined && r.maxScore ? `${Math.round((r.score / r.maxScore) * 100)}%` : '-',
          ]
        : [];

      const ansCols = activeFormForResponses.questions.map((q) => {
        const val = r.answers ? r.answers[q.id] : undefined;
        if (val === undefined || val === null || val === '') return '';
        if (Array.isArray(val)) return val.join(' | ');
        if (typeof val === 'boolean') return val ? 'بله' : 'خیر';
        return String(val);
      });

      return [
        String(index + 1),
        `#${r.id}`,
        r.respondentName || 'ناشناس',
        r.respondentContact || '-',
        new Date(r.createdAt).toLocaleString('fa-IR'),
        ...quizCols,
        ...ansCols,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `پاسخ‌های_${activeFormForResponses.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('فایل اکسل (CSV) با موفقیت دانلود شد.');
  };

  // Filtered responses based on search term
  const filteredResponses = responses.filter((r) => {
    if (!responseSearch.trim()) return true;
    const q = responseSearch.toLowerCase();
    const nameMatch = (r.respondentName || '').toLowerCase().includes(q);
    const contactMatch = (r.respondentContact || '').toLowerCase().includes(q);
    const answersMatch = Object.values(r.answers || {}).some((ans) =>
      String(ans).toLowerCase().includes(q)
    );
    return nameMatch || contactMatch || answersMatch;
  });

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
          <h1 className="text-2xl font-black text-white">پرسلاین و فرم‌ساز آنلاین</h1>
          <p className="text-sm text-slate-400 mt-1">
            ایجاد انواع نظرسنجی، کوئیز با نمره‌دهی، فرم ثبت‌نام و تحلیل آمار پاسخ‌ها
          </p>
        </div>

        <button
          onClick={openCreateBuilder}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ایجاد پرسلاین جدید
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جستجو در عنوان یا توضیحات پرسلاین..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadForms()}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Type & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه انواع پرسلاین</option>
            <option value="survey">نظرسنجی و بازخورد</option>
            <option value="quiz">آزمون و کوئیز</option>
            <option value="registration">فرم ثبت‌نام</option>
            <option value="evaluation">ارزیابی و رضایت</option>
            <option value="general">فرم عمومی</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="draft">پیش‌نویس</option>
            <option value="closed">پایان یافته</option>
          </select>
        </div>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-16 text-center shadow-xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-400">در حال دریافت لیست پرسلاین‌ها...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-16 text-center text-slate-400 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-200">هیچ پرسلاینی یافت نشد</p>
          <p className="text-xs text-slate-500 mt-1">با کلیک بر روی دکمه «ایجاد پرسلاین جدید»، اولین فرم خود را طراحی کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => {
            const formTypeMeta = FORM_TYPES.find((t) => t.type === form.type) || FORM_TYPES[0];
            return (
              <div
                key={form.id}
                className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-5 hover:border-slate-500 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${formTypeMeta.badge}`}
                    >
                      {formTypeMeta.label}
                    </span>

                    {/* Quick Status Dropdown */}
                    <select
                      value={form.status}
                      onChange={(e) =>
                        handleQuickStatusToggle(form, e.target.value as PorslineFormStatus)
                      }
                      title="تغییر سریع وضعیت فرم"
                      className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer border transition-colors focus:outline-none ${
                        form.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : form.status === 'draft'
                          ? 'bg-slate-700/80 text-slate-300 border-slate-600'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <option value="active" className="bg-slate-900 text-emerald-400">
                        فعال
                      </option>
                      <option value="draft" className="bg-slate-900 text-slate-300">
                        پیش‌نویس
                      </option>
                      <option value="closed" className="bg-slate-900 text-rose-400">
                        بسته‌شده
                      </option>
                    </select>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {form.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
                    {form.description || 'بدون توضیحات تکمیلی'}
                  </p>

                  {/* Stats Info */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/60 text-xs">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-slate-400 block text-[10px]">تعداد سوالات</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">
                        {form.questions?.length || 0} سوال
                      </span>
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-slate-400 block text-[10px]">پاسخ‌های دریافتی</span>
                      <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
                        {form.responseCount || 0} پاسخ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between gap-1.5 flex-wrap">
                  <button
                    onClick={() => openResponsesModal(form)}
                    className="flex-1 min-w-[110px] py-2 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>پاسخ‌ها ({form.responseCount || 0})</span>
                  </button>

                  {/* QR Code */}
                  <button
                    onClick={() => setQrModalForm(form)}
                    title="نمایش و دانلود بارکد QR"
                    className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>

                  {/* Clone Form */}
                  <button
                    onClick={() => handleCloneForm(form)}
                    title="شبیه‌سازی و ایجاد نسخه کپی از این فرم"
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => copyShareLink(form)}
                    title="کپی لینک عمومی"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>

                  <a
                    href={`/form/${form.slug || form.id}`}
                    target="_blank"
                    rel="noreferrer"
                    title="مشاهده فرم به عنوان شرکت‌کننده"
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <button
                    onClick={() => openEditBuilder(form)}
                    title="ویرایش فرم و سوالات"
                    className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setDeleteFormTarget(form)}
                    title="حذف فرم"
                    className="p-2 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          Porsline Builder Modal
         ========================================================================= */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingForm ? `طراحی پرسلاین: ${formTitle || 'بدون عنوان'}` : 'ساخت پرسلاین جدید'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  نوع پرسشنامه: {FORM_TYPES.find((t) => t.type === formType)?.label} ({questions.length} سوال)
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setBuilderTab('questions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    builderTab === 'questions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  طراحی سوالات
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    builderTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تنظیمات فرم
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    builderTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  پیش‌نمایش زنده
                </button>
              </div>

              <button
                onClick={() => setBuilderOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Builder Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: QUESTIONS */}
              {builderTab === 'questions' && (
                <div className="space-y-6">
                  {/* Basic Form Header Inputs */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        عنوان پرسلاین / فرم *
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="مثال: نظرسنجی دورهمی هوش مصنوعی"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        توضیحات مقدماتی فرم
                      </label>
                      <textarea
                        rows={2}
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="توضیح دهید این پرسشنامه برای چه هدفی طراحی شده است..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Add Question Selector Bar */}
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/60 space-y-2.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span>➕ افزودن نوع سوال به فرم:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_TYPES.map((qt) => (
                        <button
                          key={qt.type}
                          type="button"
                          onClick={() => addQuestion(qt.type)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-all shadow-xs"
                        >
                          <span>{qt.icon}</span>
                          <span>{qt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {questions.map((q, qIndex) => {
                      const typeMeta = QUESTION_TYPES.find((t) => t.type === q.type);
                      return (
                        <div
                          key={q.id || qIndex}
                          className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4 transition-all hover:border-slate-600"
                        >
                          {/* Question Card Header */}
                          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/70">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                                {qIndex + 1}
                              </span>
                              <span className="text-sm font-semibold text-slate-200">
                                {typeMeta?.icon} {typeMeta?.label}
                              </span>
                            </div>

                            {/* Question Actions */}
                            <div className="flex items-center gap-1">
                              <label className="flex items-center gap-1.5 cursor-pointer ml-3 text-xs text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={q.required}
                                  onChange={(e) => updateQuestion(qIndex, { required: e.target.checked })}
                                  className="rounded text-blue-600 focus:ring-0"
                                />
                                <span>پاسخ اجباری</span>
                              </label>

                              {qIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(qIndex, 'up')}
                                  title="انتقال به بالا"
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                >
                                  ▲
                                </button>
                              )}
                              {qIndex < questions.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(qIndex, 'down')}
                                  title="انتقال به پایین"
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                >
                                  ▼
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => duplicateQuestion(qIndex)}
                                title="تکرار سوال"
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                              >
                                📋
                              </button>

                              <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                title="حذف سوال"
                                className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Question Title & Description */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] text-slate-400 mb-1">
                                متن صورت سوال *
                              </label>
                              <input
                                type="text"
                                value={q.title}
                                onChange={(e) => updateQuestion(qIndex, { title: e.target.value })}
                                placeholder="متن سوال را وارد کنید..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                نوع و حالت سوال
                              </label>
                              <select
                                value={q.type}
                                onChange={(e) => {
                                  const newType = e.target.value as QuestionType;
                                  const patch: Partial<FormQuestion> = { type: newType };
                                  if (['radio', 'checkbox', 'select'].includes(newType) && !q.options) {
                                    patch.options = ['گزینه اول', 'گزینه دوم', 'گزینه سوم'];
                                  }
                                  updateQuestion(qIndex, patch);
                                }}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {QUESTION_TYPES.map((qt) => (
                                  <option key={qt.type} value={qt.type}>
                                    {qt.icon} {qt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Placeholder / Description Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                متن راهنما یا توضیحات زیر سوال (اختیاری)
                              </label>
                              <input
                                type="text"
                                value={q.description || ''}
                                onChange={(e) => updateQuestion(qIndex, { description: e.target.value })}
                                placeholder="مثلاً: فقط یک گزینه را انتخاب کنید"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                متن پیش‌فرض درون کادر ورودی (Placeholder)
                              </label>
                              <input
                                type="text"
                                value={q.placeholder || ''}
                                onChange={(e) => updateQuestion(qIndex, { placeholder: e.target.value })}
                                placeholder="متن کم‌رنگ درون کادر ورودی..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Options Manager for Choice Questions */}
                          {['radio', 'checkbox', 'select'].includes(q.type) && (
                            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">گزینه‌های پاسخ:</span>
                                <button
                                  type="button"
                                  onClick={() => addOption(qIndex)}
                                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                                >
                                  + افزودن گزینه
                                </button>
                              </div>

                              <div className="space-y-2">
                                {(q.options || []).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-mono w-4 text-center">
                                      {optIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOption(qIndex, optIdx, e.target.value)}
                                      placeholder={`عنوان گزینه ${optIdx + 1}`}
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {(q.options || []).length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(qIndex, optIdx)}
                                        className="p-1 text-slate-500 hover:text-rose-400"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quiz Mode Extra Settings: Correct Answer and Points */}
                          {formType === 'quiz' && (
                            <div className="bg-purple-950/20 p-3.5 rounded-xl border border-purple-800/40 flex flex-col sm:flex-row items-center gap-3">
                              <div className="flex-1 w-full">
                                <label className="block text-[11px] text-purple-300 mb-1 font-semibold">
                                  پاسخ صحیح (برای تصحیح خودکار کوئیز)
                                </label>
                                {['radio', 'select'].includes(q.type) && q.options && q.options.length > 0 ? (
                                  <select
                                    value={q.correctAnswer || ''}
                                    onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                                    className="w-full bg-slate-900 border border-purple-700/60 rounded-xl px-3 py-1.5 text-xs text-white"
                                  >
                                    <option value="">-- انتخاب گزینه صحیح --</option>
                                    {q.options.map((opt, oIdx) => (
                                      <option key={oIdx} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={q.correctAnswer || ''}
                                    onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                                    placeholder="پاسخ صحیح دقیق را وارد کنید..."
                                    className="w-full bg-slate-900 border border-purple-700/60 rounded-xl px-3 py-1.5 text-xs text-white"
                                  />
                                )}
                              </div>

                              <div className="w-full sm:w-32">
                                <label className="block text-[11px] text-purple-300 mb-1 font-semibold">
                                  نمره این سوال
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={q.points || 5}
                                  onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) })}
                                  className="w-full bg-slate-900 border border-purple-700/60 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-center"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SETTINGS */}
              {builderTab === 'settings' && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <h4 className="text-sm font-bold text-white border-b border-slate-700/60 pb-2">
                      نوع و رفتار فرم
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">نوع پرسلاین</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as PorslineFormType)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {FORM_TYPES.map((t) => (
                          <option key={t.type} value={t.type}>
                            {t.label} - {t.desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">وضعیت فرم</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as PorslineFormStatus)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">فعال (پاسخ‌دهی باز است)</option>
                        <option value="draft">پیش‌نویس (فقط مدیران)</option>
                        <option value="closed">بسته‌شده (مهلت تمام شده)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        آدرس اختصاصی (اسلاگ فرم برای اشتراک‌گذاری)
                      </label>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs">
                        <span className="text-slate-500 font-mono" dir="ltr">/form/</span>
                        <input
                          type="text"
                          dir="ltr"
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          placeholder="ai-survey-2026"
                          className="flex-1 bg-transparent text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {formType === 'quiz' && (
                      <div>
                        <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                          محدودیت زمان آزمون (به دقیقه - ۰ یعنی نامحدود)
                        </label>
                        <input
                          type="number"
                          min="0"
                          dir="ltr"
                          value={timeLimitMin}
                          onChange={(e) => setTimeLimitMin(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-purple-700/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <h4 className="text-sm font-bold text-white border-b border-slate-700/60 pb-2">
                      دسترسی و پیام تشکر
                    </h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">فرم عمومی و در دسترس همگان</span>
                        <span className="text-[11px] text-slate-400">آیا فرم در صفحه لیست فرم‌ها نمایش داده شود</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">امکان ثبت پاسخ چندباره</span>
                        <span className="text-[11px] text-slate-400">امکان ارسال بیش از یک پاسخ توسط هر کاربر</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowMultiple}
                        onChange={(e) => setAllowMultiple(e.target.checked)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        پیام نمایش پس از ثبت موفق پاسخ
                      </label>
                      <textarea
                        rows={2}
                        value={successMessage}
                        onChange={(e) => setSuccessMessage(e.target.value)}
                        placeholder="با تشکر، پاسخ شما با موفقیت ثبت گردید..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE PREVIEW */}
              {builderTab === 'preview' && (
                <div className="max-w-2xl mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
                  <div className="text-center pb-6 border-b border-slate-800">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-semibold border border-blue-500/30">
                      {FORM_TYPES.find((t) => t.type === formType)?.label}
                    </span>
                    <h2 className="text-2xl font-black text-white mt-3">{formTitle || 'عنوان فرم شما'}</h2>
                    <p className="text-xs text-slate-400 mt-2">{formDesc || 'توضیحات فرم در اینجا قرار می‌گیرد...'}</p>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="block text-sm font-bold text-slate-200">
                          {idx + 1}. {q.title}
                          {q.required && <span className="text-rose-400 mr-1">*</span>}
                        </label>
                        {q.description && <p className="text-xs text-slate-400">{q.description}</p>}

                        {/* Mode Renders */}
                        {q.type === 'text' && (
                          <input
                            type="text"
                            disabled
                            placeholder={q.placeholder || 'پاسخ کوتاه...'}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                          />
                        )}
                        {q.type === 'textarea' && (
                          <textarea
                            rows={3}
                            disabled
                            placeholder={q.placeholder || 'پاسخ تشریحی...'}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                          />
                        )}
                        {q.type === 'radio' && (
                          <div className="space-y-2">
                            {(q.options || []).map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                                <input type="radio" name={`prev_${q.id}`} disabled className="text-blue-600" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === 'checkbox' && (
                          <div className="space-y-2">
                            {(q.options || []).map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                                <input type="checkbox" disabled className="text-blue-600 rounded" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === 'select' && (
                          <select disabled className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-300">
                            <option>انتخاب کنید...</option>
                            {(q.options || []).map((opt, oIdx) => (
                              <option key={oIdx}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {q.type === 'rating' && (
                          <div className="flex items-center gap-2 text-2xl text-amber-400">
                            {'★'.repeat(5)}
                          </div>
                        )}
                        {q.type === 'scale' && (
                          <div className="flex gap-1 overflow-x-auto py-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <span key={num} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                                {num}
                              </span>
                            ))}
                          </div>
                        )}
                        {q.type === 'boolean' && (
                          <div className="flex gap-3">
                            <button type="button" disabled className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">بله</button>
                            <button type="button" disabled className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">خیر</button>
                          </div>
                        )}
                        {q.type === 'file' && (
                          <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-xs text-slate-400">
                            📎 بخش انتخاب یا کشیدن فایل
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Builder Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-700 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {questions.length} سوال طراحی شده است
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBuilderOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700/60 hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={submittingForm}
                  onClick={handleSaveForm}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {submittingForm && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingForm ? 'ذخیره تغییرات پرسلاین' : 'انتشار و ایجاد پرسلاین'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Responses & Analytics Modal
         ========================================================================= */}
      {responsesModalOpen && activeFormForResponses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>نتایج و پاسخ‌های:</span>
                  <span className="text-blue-400">{activeFormForResponses.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تعداد کل پاسخ‌ها: {responses.length} پاسخ دریافتی
                </p>
              </div>

              <div className="flex items-center gap-2">
                {responses.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    title="دانلود فایل خروجی سازگار با اکسل"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>خروجی اکسل (CSV)</span>
                  </button>
                )}

                <button
                  onClick={() => setResponsesModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Responses Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {loadingResponses ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-400">در حال دریافت داده‌های آماری...</p>
                </div>
              ) : responses.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-sm font-semibold text-slate-300">هنوز پاسخی برای این فرم ثبت نشده است.</p>
                  <button
                    onClick={() => copyShareLink(activeFormForResponses)}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                  >
                    کپی لینک جهت ارسال به کاربران
                  </button>
                </div>
              ) : (
                <>
                  {/* Analytics Summary */}
                  {analytics && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700">
                        <span className="text-xs text-slate-400">کل مشارکت‌کنندگان</span>
                        <p className="text-2xl font-black text-white font-mono mt-1">
                          {analytics.totalResponses}
                        </p>
                      </div>

                      {analytics.averageScore !== undefined && (
                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-purple-700/50">
                          <span className="text-xs text-purple-300">میانگین نمرات آزمون</span>
                          <p className="text-2xl font-black text-purple-400 font-mono mt-1">
                            {analytics.averageScore.toFixed(1)} نمره
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Option Stats Breakdown */}
                  {analytics?.questionStats && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        نمودار و توزیع پاسخ به سوالات چندگزینه‌ای:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analytics.questionStats).map(([qId, optMap]) => {
                          const q = activeFormForResponses.questions.find((x) => x.id === qId);
                          if (!q) return null;
                          const totalAnswers = Object.values(optMap).reduce((a, b) => a + b, 0);
                          return (
                            <div key={qId} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                              <h5 className="text-xs font-bold text-white truncate" title={q.title}>
                                {q.title}
                              </h5>
                              <div className="space-y-2">
                                {Object.entries(optMap).map(([optName, count]) => {
                                  const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                                  return (
                                    <div key={optName} className="space-y-1">
                                      <div className="flex justify-between text-[11px] text-slate-300">
                                        <span className="truncate max-w-[200px]">{optName}</span>
                                        <span className="font-mono text-slate-400">
                                          {count} نفر ({pct}٪)
                                        </span>
                                      </div>
                                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Responses Table */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        لیست پاسخ‌های دریافتی ({filteredResponses.length} از {responses.length}):
                      </h4>

                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="جستجو در نام، تماس یا پاسخ..."
                          value={responseSearch}
                          onChange={(e) => setResponseSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-700 bg-slate-950/60 text-slate-400">
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">نام پاسخ‌دهنده</th>
                            <th className="py-3 px-4">اطلاعات تماس</th>
                            {activeFormForResponses.type === 'quiz' && <th className="py-3 px-4">نمره</th>}
                            <th className="py-3 px-4">تاریخ ارسال</th>
                            <th className="py-3 px-4 text-left">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredResponses.length === 0 ? (
                            <tr>
                              <td colSpan={activeFormForResponses.type === 'quiz' ? 6 : 5} className="py-8 text-center text-slate-500">
                                موردی با این مشخصات یافت نشد.
                              </td>
                            </tr>
                          ) : (
                            filteredResponses.map((resp, rIdx) => (
                              <tr key={resp.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-4 font-mono text-slate-400">{rIdx + 1}</td>
                                <td className="py-3 px-4 font-medium text-white">
                                  {resp.respondentName || 'ناشناس'}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-400" dir="ltr">
                                  {resp.respondentContact || '-'}
                                </td>
                                {activeFormForResponses.type === 'quiz' && (
                                  <td className="py-3 px-4 font-mono font-bold text-purple-400">
                                    {resp.score ?? '-'} {resp.maxScore ? `/ ${resp.maxScore}` : ''}
                                  </td>
                                )}
                                <td className="py-3 px-4 text-slate-400">
                                  {new Date(resp.createdAt).toLocaleDateString('fa-IR')}
                                </td>
                                <td className="py-3 px-4 text-left">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setSelectedResponseDetail(resp)}
                                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                      مشاهده پاسخ‌ها
                                    </button>
                                    <button
                                      onClick={() => handleDeleteResponse(resp.id)}
                                      className="p-1 text-slate-500 hover:text-rose-400"
                                      title="حذف پاسخ"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Individual Response Detail View Modal */}
            {selectedResponseDetail && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <h4 className="text-base font-bold text-white">
                      پاسخ‌های {selectedResponseDetail.respondentName || 'کاربر ناشناس'}
                    </h4>
                    <button
                      onClick={() => setSelectedResponseDetail(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {activeFormForResponses.questions.map((q, idx) => {
                      const userAns = selectedResponseDetail.answers[q.id];
                      const isFile = q.type === 'file';
                      const isImage =
                        isFile &&
                        typeof userAns === 'string' &&
                        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(userAns);

                      return (
                        <div key={q.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                          <p className="text-xs font-semibold text-slate-300">
                            {idx + 1}. {q.title}
                          </p>
                          <div className="text-xs text-blue-400 font-mono bg-slate-950 p-2.5 rounded-lg">
                            {userAns === undefined || userAns === null || userAns === '' ? (
                              <span className="text-slate-500 italic font-sans">بدون پاسخ</span>
                            ) : isFile && typeof userAns === 'string' ? (
                              <div className="space-y-2">
                                {isImage && (
                                  <img
                                    src={userAns}
                                    alt="پیوست"
                                    className="max-h-48 rounded-lg border border-slate-700 object-contain bg-slate-900"
                                  />
                                )}
                                <a
                                  href={userAns}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition-colors text-xs font-sans font-bold"
                                >
                                  📎 دانلود / مشاهده فایل پیوست
                                </a>
                              </div>
                            ) : Array.isArray(userAns) ? (
                              userAns.join('، ')
                            ) : typeof userAns === 'boolean' ? (
                              userAns ? 'بله' : 'خیر'
                            ) : (
                              String(userAns)
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h4 className="text-sm font-bold text-white">بارکد QR پرسلاین</h4>
              <button
                onClick={() => setQrModalForm(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-semibold truncate">
              {qrModalForm.title}
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `${window.location.origin}/form/${qrModalForm.slug || qrModalForm.id}`
                )}`}
                alt="Form QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              با اسکن این بارکد توسط دوربین گوشی، پرسشنامه بلافاصله باز می‌شود. مناسب برای ویدئو پروژکتور، پوستر و اسلایدهای کارگاه.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => copyShareLink(qrModalForm)}
                className="flex-1 py-2 rounded-xl bg-slate-700 text-white text-xs font-semibold hover:bg-slate-600 transition-colors"
              >
                کپی لینک
              </button>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                  `${window.location.origin}/form/${qrModalForm.slug || qrModalForm.id}`
                )}`}
                target="_blank"
                rel="noreferrer"
                download={`QR_${qrModalForm.title}.png`}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors text-center"
              >
                دانلود تصویر QR
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Form Confirmation Modal */}
      {deleteFormTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white text-rose-400 mb-2">تایید حذف پرسلاین</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              آیا از حذف پرسلاین «{deleteFormTarget.title}» و تمام پاسخ‌های ثبت شده آن اطمینان دارید؟
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteFormTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700/60 hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteForm}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
