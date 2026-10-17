import React, { useEffect, useState } from 'react';
import {
  getAdminContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from '../../services/adminApi';
import type { ContactMessage } from '../../types';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getAdminContactMessages();
      setMessages(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری پیام‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleStatusChange = async (id: number, status: 'unread' | 'read' | 'replied') => {
    try {
      await updateContactStatus(id, status);
      showToast('وضعیت پیام بروزرسانی شد');
      await loadMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err?.message || 'خطا در بروزرسانی وضعیت');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    try {
      await deleteContactMessage(id);
      showToast('پیام حذف شد');
      if (selectedMessage?.id === id) setSelectedMessage(null);
      await loadMessages();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف پیام');
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
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
        <h1 className="text-2xl font-black text-white">پیام‌های ارسال شده از فرم تماس با ما</h1>
        <p className="text-sm text-slate-400 mt-1">
          مشاهده پیام‌های کاربران، پیشنهادات و انتقادات ارسالی از طریق وب‌سایت
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {(['all', 'unread', 'read', 'replied'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            {st === 'all'
              ? 'همه پیام‌ها'
              : st === 'unread'
              ? 'خوانده نشده'
              : st === 'read'
              ? 'خوانده شده'
              : 'پاسخ داده شده'}
          </button>
        ))}
      </div>

      {/* Table & Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Messages */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-400">در حال دریافت پیام‌ها...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p>هیچ پیامی در این بخش وجود ندارد.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') {
                      handleStatusChange(msg.id, 'read');
                    }
                  }}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-4 ${
                    selectedMessage?.id === msg.id
                      ? 'bg-blue-600/15 border-r-4 border-r-blue-500'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm truncate">{msg.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          msg.status === 'unread'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : msg.status === 'replied'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {msg.status === 'unread' ? 'جدید' : msg.status === 'replied' ? 'پاسخ داده شده' : 'خوانده شده'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{msg.message}</p>
                    <span className="text-[11px] text-slate-500 mt-1 block font-mono" dir="ltr">{msg.email}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Message Detail Panel */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl h-fit">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <h3 className="font-bold text-white text-base">متن پیام</h3>
                <span className="text-xs text-slate-400 font-mono">#{selectedMessage.id}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">فرستنده:</span>
                <p className="text-sm font-semibold text-white">{selectedMessage.name}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">ایمیل فرستنده:</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-xs text-blue-400 hover:underline font-mono"
                  dir="ltr"
                >
                  {selectedMessage.email}
                </a>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">متن پیام ارسالی:</span>
                <div className="p-3.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=پاسخ از انجمن علمی مهندسی کامپیوتر`}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ارسال پاسخ ایمیلی
                </a>

                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                    className="px-3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-semibold transition-all border border-emerald-500/30"
                  >
                    علامت‌گذاری به عنوان پاسخ‌داده‌شده
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">برای مشاهده متن کامل، روی یک پیام کلیک کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
