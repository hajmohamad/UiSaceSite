import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminPrograms,
  getAdminRegistrations,
  getAdminContactMessages,
  getAdminUsers,
  getAdminForms,
  getAdminFiles,
} from '../../services/adminApi';
import type { Program, Registration, ContactMessage, AdminUser, PorslineForm } from '../../types';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [forms, setForms] = useState<PorslineForm[]>([]);
  const [filesCount, setFilesCount] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [programsData, regsData, msgsData, usersData, formsData, filesData] = await Promise.all([
          getAdminPrograms().catch(() => []),
          getAdminRegistrations().catch(() => []),
          getAdminContactMessages().catch(() => []),
          getAdminUsers().catch(() => []),
          getAdminForms().catch(() => []),
          getAdminFiles().catch(() => ({ files: [], total: 0 })),
        ]);

        setPrograms(programsData);
        setRegistrations(regsData);
        setMessages(msgsData);
        setUsers(usersData);
        setForms(formsData);
        setFilesCount(filesData.total || (filesData.files && filesData.files.length) || 0);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const upcomingCount = programs.filter((p) => p.status === 'upcoming').length;
  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">در حال بارگذاری اطلاعات پیشخوان...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">سلام به پنل مدیریت خوش آمدید 👋</h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            از این بخش می‌توانید رویدادها، کاربران و مدیران جدید، ثبت‌نام‌های شرکت‌کنندگان و پیام‌های دریافتی را مدیریت و ویرایش کنید.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/programs"
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ایجاد رویداد جدید
            </Link>
            <Link
              to="/admin/forms"
              className="inline-flex items-center gap-2 bg-blue-700/80 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all border border-blue-400/40 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              پرسلاین و فرم‌ساز
            </Link>
            <Link
              to="/admin/files"
              className="inline-flex items-center gap-2 bg-indigo-700/70 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-indigo-400/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              مدیریت فایل‌ها و آپلود
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-slate-600/40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              تعریف کاربر مدیر
            </Link>
          </div>
        </div>

        {/* Decorative circle background */}
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Programs */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">کل رویدادها</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{programs.length}</span>
              <span className="text-[11px] text-emerald-400 font-medium">({upcomingCount} پیش‌رو)</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/50">
            <Link to="/admin/programs" className="text-xs text-blue-400 hover:text-blue-300">
              مدیریت رویدادها ←
            </Link>
          </div>
        </div>

        {/* Card 2: Forms / Porsline */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">پرسلاین و فرم‌ها</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs">
                📝
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{forms.length}</span>
              <span className="text-[11px] text-purple-300 font-medium">
                ({forms.reduce((acc, f) => acc + (f.responseCount || 0), 0)} پاسخ)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/50">
            <Link to="/admin/forms" className="text-xs text-purple-400 hover:text-purple-300">
              فرم‌ساز و نتایج ←
            </Link>
          </div>
        </div>

        {/* Card 3: Files Manager */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">فایل‌های سرور</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs">
                📁
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{filesCount}</span>
              <span className="text-[11px] text-slate-400">فایل ذخیره شده</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/50">
            <Link to="/admin/files" className="text-xs text-cyan-400 hover:text-cyan-300">
              پوشه آپلود ←
            </Link>
          </div>
        </div>

        {/* Card 4: Registrations */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">ثبت‌نام‌ها</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{registrations.length}</span>
              {pendingRegsCount > 0 ? (
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {pendingRegsCount} جدید
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">بررسی شده</span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/50">
            <Link to="/admin/registrations" className="text-xs text-amber-400 hover:text-amber-300">
              مشاهده ثبت‌نام‌ها ←
            </Link>
          </div>
        </div>

        {/* Card 5: Users */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">کاربران مدیر</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{users.length}</span>
              <span className="text-[10px] text-slate-400">مدیر سیستم</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/50">
            <Link to="/admin/users" className="text-xs text-indigo-400 hover:text-indigo-300">
              مدیریت دسترسی ←
            </Link>
          </div>
        </div>

        {/* Card 6: Messages */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">پیام‌های تماس</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{messages.length}</span>
              {unreadMessagesCount > 0 ? (
                <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
                  {unreadMessagesCount} خوانده نشده
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400">بدون پیام جدید</span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/50">
            <Link to="/admin/messages" className="text-xs text-emerald-400 hover:text-emerald-300">
              مشاهده صندوق پیام ←
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Recent Events & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📅</span> آخرین رویدادها
            </h2>
            <Link to="/admin/programs" className="text-xs text-blue-400 hover:underline">
              مشاهده همه
            </Link>
          </div>

          {programs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">هیچ رویدادی ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {programs.slice(0, 5).map((prog) => (
                <div
                  key={prog.id}
                  className="p-3.5 bg-slate-900/60 border border-slate-700/40 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prog.imageUrl || 'https://via.placeholder.com/60'}
                      alt={prog.title}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{prog.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{prog.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        prog.status === 'upcoming'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {prog.status === 'upcoming' ? 'پیش‌رو' : 'پایان‌یافته'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📝</span> آخرین ثبت‌نام‌ها
            </h2>
            <Link to="/admin/registrations" className="text-xs text-blue-400 hover:underline">
              مشاهده همه
            </Link>
          </div>

          {registrations.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">هنوز هیچ ثبت‌نامی ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 5).map((reg) => (
                <div
                  key={reg.id}
                  className="p-3.5 bg-slate-900/60 border border-slate-700/40 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{reg.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{reg.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        reg.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : reg.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {reg.status === 'approved' ? 'تایید شده' : reg.status === 'rejected' ? 'رد شده' : 'در انتظار'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
