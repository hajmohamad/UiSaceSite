import React, { useState } from 'react';
import { postContact } from '../services/api';

const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await postContact(formState);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err?.message || 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
          <span>📬</span>
          <span>پل ارتباطی با دانشجویان و علاقه‌مندان</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          تماس با انجمن علمی مهندسی کامپیوتر
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2.5 leading-relaxed">
          انتقادات، پیشنهادات برای برگزاری کارگاه‌ها، همکاری در پروژه‌های تیمی یا هرگونه سوال را از طریق فرم زیر یا راه‌های ارتباطی با ما در میان بگذارید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/70 rounded-bl-full pointer-events-none"></div>

          {isSubmitted ? (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-3xl shadow-sm">
                ✓
              </div>
              <h2 className="text-2xl font-black text-gray-900">پیام شما با موفقیت ارسال شد!</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                از همراهی و پیام شما سپاسگزاریم. اعضای شورای مرکزی انجمن در اسرع وقت پیام شما را بررسی کرده و پاسخ خواهند داد.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  ارسال پیام جدید
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>✍️</span>
                <span>فرم ارسال پیام آنلاین</span>
              </h3>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1.5">
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="مثال: علی رضایی"
                  className="block w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5">
                  آدرس ایمیل یا شماره تماس <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="name@example.com یا 09123456789"
                  className="block w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-right"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-gray-700 mb-1.5">
                  متن پیام یا پیشنهاد شما <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  required
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="متن پیام خود را با جزئیات بنویسید..."
                  className="block w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isLoading ? 'در حال ارسال پیام...' : 'ارسال پیام به انجمن'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info Cards Column */}
        <div className="space-y-4">
          {/* Card 1: Office info */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/90 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                🏢
              </span>
              <span>دفتر حضوری انجمن</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">📍</span>
                <span>اصفهان، میدان آزادی، دانشگاه اصفهان، دانشکده مهندسی کامپیوتر</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">🚪</span>
                <span>دفتر انجمن علمی: طبقه همکف دانشکده مهندسی کامپیوتر (جنب لابی اصلی)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">🕒</span>
                <span>ساعات حضور اعضا: شنبه تا چهارشنبه، ساعت ۱۰ الی ۱۵</span>
              </p>
            </div>
          </div>

          {/* Card 2: Digital communication */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/90 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm">
                💬
              </span>
              <span>ارتباط دیجیتال</span>
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <p className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-500">کانال تلگرام:</span>
                <a
                  href="https://t.me/UI_SACE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sky-600 hover:underline font-mono"
                >
                  @UI_SACE
                </a>
              </p>
              <p className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-500">اینستاگرام:</span>
                <a
                  href="https://instagram.com/ui_sace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-pink-600 hover:underline font-mono"
                >
                  @ui_sace
                </a>
              </p>
              <p className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-500">ایمیل دبیرخانه:</span>
                <a
                  href="mailto:sace@ui.ac.ir"
                  className="font-bold text-blue-600 hover:underline font-mono text-[11px]"
                >
                  sace@ui.ac.ir
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
