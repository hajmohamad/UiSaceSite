import React, { useEffect, useState } from 'react';
import { getAdminFiles, uploadAdminFiles } from '../../services/adminApi';
import type { UploadedFileItem } from '../../types';

interface FilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, fileItem?: UploadedFileItem) => void;
  title?: string;
  onlyImages?: boolean;
}

const FilePickerModal: React.FC<FilePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'انتخاب فایل از کتابخانه رسانه',
  onlyImages = true,
}) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await getAdminFiles();
      setFiles(res.files || []);
    } catch (err) {
      console.error('Failed to load files in picker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelectedPath(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    try {
      setUploading(true);
      const fileArray = Array.from(fileList);
      const res = await uploadAdminFiles(fileArray);
      await loadFiles();
      if (res.files && res.files.length > 0) {
        setSelectedPath(res.files[0].path);
      }
    } catch (err: any) {
      alert(err?.message || 'خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    if (onlyImages && !f.isImage) return false;
    if (!search.trim()) return true;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  const selectedFile = files.find((f) => f.path === selectedPath);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">یک فایل را انتخاب کنید یا فایل جدید بارگذاری نمایید</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50"
          >
            ✕
          </button>
        </div>

        {/* Toolbar: Search & Direct Upload */}
        <div className="p-4 border-b border-slate-700/60 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در نام فایل‌ها..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20 w-full sm:w-auto justify-center">
            {uploading ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال آپلود...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>آپلود فایل جدید</span>
              </>
            )}
            <input
              type="file"
              accept={onlyImages ? 'image/*' : '*/*'}
              multiple
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Content: File Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-400">در حال بارگذاری فایل‌های سرور...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-slate-300">فایلی یافت نشد</p>
              <p className="text-xs mt-1">می‌توانید با دکمه آپلود، فایل جدیدی اضافه کنید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredFiles.map((file) => {
                const isSelected = selectedPath === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => setSelectedPath(file.path)}
                    onDoubleClick={() => {
                      onSelect(file.url, file);
                      onClose();
                    }}
                    className={`cursor-pointer group rounded-2xl p-2.5 transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/50'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-slate-700/40'
                    }`}
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
                      {file.isImage ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-2xl font-bold uppercase text-slate-400">{file.ext}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-right">
                      <p className="text-xs font-medium text-slate-200 truncate" title={file.name} dir="ltr">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/80 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 truncate max-w-sm" dir="ltr">
            {selectedFile ? selectedFile.url : 'فایلی انتخاب نشده است'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700"
            >
              انصراف
            </button>
            <button
              disabled={!selectedFile}
              onClick={() => {
                if (selectedFile) {
                  onSelect(selectedFile.url, selectedFile);
                  onClose();
                }
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 shadow-lg shadow-blue-600/30 transition-all"
            >
              انتخاب این فایل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePickerModal;
