import React, { useEffect, useState, useRef } from 'react';
import {
  getAdminFiles,
  uploadAdminFiles,
  deleteAdminFile,
  renameAdminFile,
  replaceAdminFile,
} from '../../services/adminApi';
import type { UploadedFileItem } from '../../types';

const AdminFiles: React.FC = () => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'images' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drag & drop upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename Modal State
  const [renameTarget, setRenameTarget] = useState<UploadedFileItem | null>(null);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Replace State
  const [replaceTarget, setReplaceTarget] = useState<UploadedFileItem | null>(null);
  const [replacing, setReplacing] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<UploadedFileItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<UploadedFileItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await getAdminFiles();
      setFiles(res.files || []);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری لیست فایل‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFilesUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    try {
      setUploading(true);
      const fileArray = Array.from(fileList);
      const res = await uploadAdminFiles(fileArray);
      showToast(`${res.count || fileArray.length} فایل با موفقیت آپلود شد.`);
      await loadFiles();
    } catch (err: any) {
      alert(err?.message || 'خطا در آپلود فایل');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = async (url: string, path: string) => {
    const fullUrl = window.location.origin + url;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedPath(path);
      showToast('آدرس فایل با موفقیت کپی شد');
      setTimeout(() => setCopiedPath(null), 2500);
    } catch {
      // Fallback
      prompt('آدرس فایل:', fullUrl);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteAdminFile(deleteTarget.path);
      showToast('فایل با موفقیت حذف شد');
      setDeleteTarget(null);
      await loadFiles();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف فایل');
    } finally {
      setDeleting(false);
    }
  };

  const openRenameModal = (file: UploadedFileItem) => {
    setRenameTarget(file);
    setNewName(file.name);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !newName.trim()) return;

    try {
      setRenaming(true);
      await renameAdminFile(renameTarget.path, newName.trim());
      showToast('نام فایل با موفقیت تغییر کرد');
      setRenameTarget(null);
      await loadFiles();
    } catch (err: any) {
      alert(err?.message || 'خطا در تغییر نام فایل');
    } finally {
      setRenaming(false);
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;

    try {
      setReplacing(true);
      await replaceAdminFile(replaceTarget.path, file);
      showToast('محتوای فایل با موفقیت جایگزین شد');
      setReplaceTarget(null);
      await loadFiles();
    } catch (err: any) {
      alert(err?.message || 'خطا در جایگزینی فایل');
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    if (typeFilter === 'images' && !f.isImage) return false;
    if (typeFilter === 'other' && f.isImage) return false;
    if (!search.trim()) return true;
    return (
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.path.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const imagesCount = files.filter((f) => f.isImage).length;

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

      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت فایل‌ها و پوشه آپلود</h1>
          <p className="text-sm text-slate-400 mt-1">
            مشاهده، آپلود مستقیم، تغییر نام، جایگزینی و حذف فایل‌های ذخیره شده در سرور
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30">
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال آپلود...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>آپلود فایل جدید</span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              disabled={uploading}
              onChange={(e) => handleFilesUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">کل فایل‌ها</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs">
              📁
            </div>
          </div>
          <p className="text-xl font-bold text-white mt-2 font-mono">{files.length}</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">تصاویر</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">
              🖼️
            </div>
          </div>
          <p className="text-xl font-bold text-white mt-2 font-mono">{imagesCount}</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">سایر فایل‌ها</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs">
              📄
            </div>
          </div>
          <p className="text-xl font-bold text-white mt-2 font-mono">{files.length - imagesCount}</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">حجم مصرفی</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xs">
              💾
            </div>
          </div>
          <p className="text-xl font-bold text-white mt-2 font-mono">{formatFileSize(totalBytes)}</p>
        </div>
      </div>

      {/* Drag & Drop Upload Banner */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFilesUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-700/60 text-blue-400 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-200">
          فایل‌های خود را به اینجا بکشید یا برای انتخاب فایل کلیک کنید
        </p>
        <p className="text-xs text-slate-500 mt-1">
          پشتیبانی از انواع تصاویر (PNG, JPG, WebP, SVG) و سایر اسناد
        </p>
      </div>

      {/* Controls Bar: Search, Filter, Mode */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جستجو بر اساس نام فایل..."
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

        {/* Filter and View Mode */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Type Filters */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60">
            {(['all', 'images', 'other'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTypeFilter(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === tf
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === 'all' ? 'همه' : tf === 'images' ? 'تصاویر' : 'سایر'}
              </button>
            ))}
          </div>

          {/* Grid / Table toggle */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewMode('grid')}
              title="نمایش شبکه‌ای"
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="نمایش جدولی"
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-16 text-center shadow-xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-400">در حال دریافت لیست فایل‌های پوشه آپلود...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-16 text-center text-slate-400 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-200">هیچ فایلی یافت نشد</p>
          <p className="text-xs text-slate-500 mt-1">با زدن دکمه «آپلود فایل جدید» فایل‌های خود را به سرور اضافه کنید.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.path}
              className="group bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 hover:border-slate-500 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div
                onClick={() => setPreviewFile(file)}
                className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative cursor-pointer"
              >
                {file.isImage ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center p-3">
                    <span className="text-3xl font-black uppercase text-slate-500 block mb-1">
                      {file.ext}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">سند / فایل</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-3">
                <p
                  className="text-xs font-semibold text-slate-200 truncate"
                  title={file.name}
                  dir="ltr"
                >
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="uppercase font-mono text-slate-500">{file.ext}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-1">
                <button
                  onClick={() => handleCopyUrl(file.url, file.path)}
                  title="کپی لینک"
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    copiedPath === file.path
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {copiedPath === file.path ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => openRenameModal(file)}
                  title="تغییر نام فایل"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/15 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setReplaceTarget(file);
                    replaceInputRef.current?.click();
                  }}
                  title="جایگزینی با فایل جدید"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/15 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={() => setDeleteTarget(file)}
                  title="حذف فایل"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">فایل</th>
                  <th className="py-4 px-4">نوع</th>
                  <th className="py-4 px-4">حجم</th>
                  <th className="py-4 px-4">تاریخ آخرین تغییر</th>
                  <th className="py-4 px-6 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredFiles.map((file) => (
                  <tr key={file.path} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setPreviewFile(file)}
                          className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0 border border-slate-700"
                        >
                          {file.isImage ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold uppercase text-slate-400">{file.ext}</span>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <p className="font-semibold text-white text-xs truncate" dir="ltr">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5" dir="ltr">
                            {file.url}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-400 uppercase font-mono">
                      {file.ext}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                      {formatFileSize(file.size)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-400">
                      {formatDate(file.modTime)}
                    </td>

                    <td className="py-3 px-6 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyUrl(file.url, file.path)}
                          title="کپی آدرس کامل"
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => openRenameModal(file)}
                          title="تغییر نام"
                          className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            setReplaceTarget(file);
                            replaceInputRef.current?.click();
                          }}
                          title="جایگزینی فایل"
                          className="p-2 text-amber-400 hover:text-white hover:bg-amber-600/30 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setDeleteTarget(file)}
                          title="حذف فایل"
                          className="p-2 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors"
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
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">تغییر نام فایل</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed" dir="ltr">
              {renameTarget.name}
            </p>

            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نام جدید (همراه با پسوند)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={renaming}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  {renaming && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  ذخیره نام جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">تایید حذف فایل</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">
              آیا از حذف این فایل از سرور اطمینان دارید؟
            </p>
            <p className="text-xs font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700 truncate mb-6" dir="ltr">
              {deleteTarget.name}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image / File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <span className="text-sm font-bold text-white truncate max-w-md" dir="ltr">
                {previewFile.name}
              </span>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 flex items-center justify-center overflow-auto bg-slate-950">
              {previewFile.isImage ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <span className="text-6xl font-black uppercase text-slate-600 block mb-3">
                    {previewFile.ext}
                  </span>
                  <p className="text-sm text-slate-300">پیش‌نمایش آنلاین برای این پسوند فایل پشتیبانی نمی‌شود.</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                  >
                    دانلود یا باز کردن مستقیم در تب جدید
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>حجم: {formatFileSize(previewFile.size)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(previewFile.url, previewFile.path)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                >
                  کپی لینک
                </button>
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-semibold"
                >
                  مشاهده فایل اصلی
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFiles;
