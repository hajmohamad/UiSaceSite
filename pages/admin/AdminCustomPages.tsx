import React, { useEffect, useState, useRef } from 'react';
import {
  getAdminCustomPages,
  createAdminCustomPage,
  updateAdminCustomPage,
  deleteAdminCustomPage,
} from '../../services/adminApi';
import type { CustomPage } from '../../types';

const AdminCustomPages: React.FC = () => {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [withLayout, setWithLayout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<CustomPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getAdminCustomPages(search);
      setPages(data || []);
    } catch (err: any) {
      showToast(err?.message || 'خطا در دریافت لیست صفحات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [search]);

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setHtmlContent(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>صفحه اختصاصی</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px;
      background: #f8fafc;
      color: #1e293b;
      text-align: center;
    }
    .card {
      background: #ffffff;
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    h1 { color: #2563eb; }
    p { line-height: 1.8; color: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>صفحه جدید</h1>
    <p>محتوای دلخواه خود را در این بخش قرار دهید.</p>
  </div>
</body>
</html>`);
    setIsActive(true);
    setWithLayout(false);
    setModalOpen(true);
  };

  const openEditModal = (page: CustomPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setHtmlContent(page.htmlContent);
    setIsActive(page.isActive);
    setWithLayout(page.withLayout);
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('لطفاً یک فایل با پسوند .html یا .htm انتخاب کنید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        if (!title) {
          // Attempt to extract title tag or use filename
          const match = content.match(/<title>([^<]+)<\/title>/i);
          if (match && match[1]) {
            setTitle(match[1].trim());
          } else {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
        if (!slug) {
          const autoSlug = file.name
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
            .replace(/^-+|-+$/g, '');
          setSlug(autoSlug);
        }
        showToast('محتوای فایل HTML با موفقیت بارگذاری شد');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !htmlContent.trim()) {
      alert('لطفاً عنوان، آدرس URL و محتوای HTML را وارد کنید.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        slug: slug.trim().replace(/^\/+|\/+$/g, '').toLowerCase(),
        htmlContent,
        isActive,
        withLayout,
      };

      if (editingPage) {
        await updateAdminCustomPage(editingPage.id, payload);
        showToast('صفحه با موفقیت ویرایش شد');
      } else {
        await createAdminCustomPage(payload);
        showToast('صفحه جدید با موفقیت ایجاد شد');
      }
      setModalOpen(false);
      await loadPages();
    } catch (err: any) {
      alert(err?.message || 'خطا در ذخیره صفحه');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteAdminCustomPage(deleteTarget.id);
      showToast('صفحه با موفقیت حذف شد');
      setDeleteTarget(null);
      await loadPages();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف صفحه');
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async (page: CustomPage) => {
    const fullUrl = `${window.location.origin}/${page.slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(page.id);
      showToast('آدرس صفحه در کلیپ‌بورد کپی شد');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      prompt('آدرس صفحه:', fullUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            مدیریت صفحات سفارشی HTML
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            بارگذاری صفحات مستقل HTML، لندینگ پیج‌ها و فرم‌های ویژه با رندر مستقیم در هر آدرس URL دلخواه
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن صفحه HTML جدید
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 text-xs">کل صفحات</span>
          <p className="text-2xl font-black text-white mt-1">{pages.length}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-emerald-400 text-xs">صفحات فعال</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {pages.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-purple-400 text-xs">صفحات مستقل (Landing)</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {pages.filter((p) => !p.withLayout).length}
          </p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-blue-400 text-xs">با قالب سایت</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {pages.filter((p) => p.withLayout).length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="جستجو بر اساس عنوان صفحه یا آدرس URL (slug)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-0 text-white placeholder-slate-500 text-sm focus:outline-none w-full"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white text-xs">
            پاک کردن
          </button>
        )}
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/40 rounded-2xl border border-slate-700/60 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">در حال بارگذاری لیست صفحات...</span>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center p-12 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
          <div className="w-16 h-16 mx-auto bg-slate-700/40 text-slate-400 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-base">هنوز صفحه سفارشی ثبت نشده است</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            می‌توانید فایل‌های HTML رویدادها، مسابقات، لندینگ‌پیج‌ها یا برگه‌های اطلاع‌رسانی را بارگذاری کرده و در URL دلخواه به نمایش بگذارید.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            ایجاد اولین صفحه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <div
              key={p.id}
              className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-all shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-base line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        p.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {p.isActive ? 'فعال' : 'پیش‌نویس'}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        p.withLayout
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {p.withLayout ? 'با قالب' : 'مستقل'}
                    </span>
                  </div>
                </div>

                {/* URL Slug */}
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate font-mono text-blue-400 dir-ltr text-left">
                    /{p.slug}
                  </div>
                  <button
                    onClick={() => copyUrl(p)}
                    title="کپی آدرس کامل"
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-colors flex-shrink-0"
                  >
                    {copiedId === p.id ? (
                      <span className="text-emerald-400 text-[10px]">کپی شد!</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>تاریخ ایجاد: {new Date(p.createdAt).toLocaleDateString('fa-IR')}</span>
                  <span>حجم کد: {(p.htmlContent.length / 1024).toFixed(1)} کیلوبایت</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setPreviewContent(p.htmlContent);
                      setPreviewTitle(p.title);
                    }}
                    title="پیش‌نمایش زنده"
                    className="p-2 text-slate-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-lg transition-colors text-xs flex items-center gap-1"
                  >
                    <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    پیش‌نمایش
                  </button>

                  <a
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    title="باز کردن در زبانه جدید"
                    className="p-2 text-slate-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-lg transition-colors text-xs flex items-center gap-1"
                  >
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    مشاهده
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="ویرایش"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {editingPage ? 'ویرایش صفحه HTML سفارشی' : 'افزودن صفحه HTML جدید'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    عنوان صفحه <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: لندینگ رویداد هوش مصنوعی"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    آدرس URL (Slug) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-500 text-xs font-mono">/</span>
                    <input
                      type="text"
                      required
                      placeholder="landing-ai"
                      dir="ltr"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-blue-400 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    آدرس نهایی: <span className="text-blue-400 font-mono" dir="ltr">{window.location.origin}/{slug || '...'}</span>
                  </p>
                </div>
              </div>

              {/* Upload HTML File Shortcut */}
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold">بارگذاری مستقیم فایل HTML</h4>
                    <p className="text-slate-400 text-[11px]">انتخاب فایل آماده از سیستم برای قرارگیری خودکار در ویرایشگر</p>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    انتخاب فایل HTML (.html)
                  </button>
                </div>
              </div>

              {/* HTML Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    محتوای کد HTML <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewContent(htmlContent);
                        setPreviewTitle(title || 'پیش‌نمایش کد');
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      پیش‌نمایش زنده کد
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={12}
                  dir="ltr"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="<!DOCTYPE html>..."
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withLayout}
                    onChange={(e) => setWithLayout(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-white text-xs font-bold block">رندر همراه با قالب سایت (Header و Footer)</span>
                    <span className="text-slate-400 text-[11px] block">در صورت غیرفعال بودن، صفحه به صورت تمام‌صفحه و مستقل (Landing) نمایش داده می‌شود.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-white text-xs font-bold block">صفحه منتشر و فعال باشد</span>
                    <span className="text-slate-400 text-[11px] block">در صورت غیرفعال بودن، دسترسی عمومی به صفحه مسدود خواهد بود.</span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  {saving ? 'در حال ذخیره‌سازی...' : editingPage ? 'به‌روزرسانی صفحه' : 'ایجاد و ذخیره صفحه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewContent !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-white font-bold text-sm">پیش‌نمایش صفحه: {previewTitle}</span>
              </div>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={previewContent}
                title="پیش‌نمایش زنده"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-white font-bold text-base">تأیید حذف صفحه</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              آیا از حذف صفحه «{deleteTarget.title}» با آدرس /{deleteTarget.slug} اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                {deleting ? 'در حال حذف...' : 'بله، حذف شود'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomPages;
