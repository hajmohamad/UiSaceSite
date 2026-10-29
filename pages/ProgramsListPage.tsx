import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrograms } from '../services/api';
import type { Program } from '../types';

const ProgramCard: React.FC<{ program: Program }> = ({ program }) => {
  const isUpcoming = program.status === 'upcoming';
  const hasCollabs = (program.collaboratorDetails?.length || 0) > 0 || (program.collaborators?.length || 0) > 0;
  const collabCount = program.collaboratorDetails?.length || program.collaborators?.length || 0;

  return (
    <Link
      to={`/programs/${program.id}`}
      className="flex flex-col group bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative"
    >
      {/* Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 flex items-center justify-center">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={program.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600'}
          alt={program.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
              isUpcoming
                ? 'bg-emerald-500/90 text-white border border-emerald-400/40'
                : 'bg-slate-800/80 text-slate-200 border border-slate-700'
            }`}
          >
            {isUpcoming ? 'در پیش رو' : 'پایان یافته'}
          </span>
        </div>

        {/* Price Tag if available */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-md border border-white/20">
            {program.price && program.price > 0
              ? `${program.price.toLocaleString('fa-IR')} تومان`
              : 'رایگان'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Date & Duration */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2.5">
          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            <span>🗓️</span>
            <span>{program.date}</span>
          </span>
          {program.durationHours && program.durationHours > 0 && (
            <span className="flex items-center gap-1 text-gray-500">
              <span>⏱️</span>
              <span>{program.durationHours} ساعت</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2"
          title={program.title}
        >
          {program.title}
        </h3>

        {/* Short Description */}
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed flex-grow mb-4">
          {program.shortDescription}
        </p>

        {/* Card Footer: Collaborators & Read more */}
        <div className="mt-auto pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <div>
            {hasCollabs && (
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                <span>👥</span>
                <span>{collabCount} همکار</span>
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition-all">
            <span>مشاهده جزئیات</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProgramsListPage: React.FC = () => {
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getPrograms().then((data) => {
      if (isMounted) {
        setProgramsList(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedPrograms = useMemo(() => {
    return [...programsList].sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
  }, [programsList]);

  // Extract years from dateISO and Jalali date text
  const programYears = useMemo(() => {
    const years = new Set<number>();
    programsList.forEach((p) => {
      if (p.dateISO) {
        const y = new Date(p.dateISO).getFullYear();
        if (y) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [programsList]);

  const filteredPrograms = useMemo(() => {
    let list = sortedPrograms;

    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (selectedYear !== 'all') {
      list = list.filter((p) => {
        if (!p.dateISO) return false;
        return new Date(p.dateISO).getFullYear() === selectedYear;
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (p.date && p.date.includes(q))
      );
    }

    return list;
  }, [selectedYear, statusFilter, sortedPrograms, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
            <span>🚀</span>
            <span>رویدادهای علمی، کارگاه‌ها و مسابقات</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            برنامه‌ها و رویدادهای انجمن
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
            آرشیو کامل رویدادها، بوت‌کمپ‌ها، دوره‌های تخصصی و کارگاه‌های عملی برگزار شده در دانشگاه اصفهان.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full">
            {programsList.length} برنامه ثبت‌شده
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full">
            {programsList.filter((p) => p.status === 'upcoming').length} در پیش‌رو
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-3">
        {/* Status Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              همه رویدادها ({programsList.length})
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'upcoming'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              پیش‌رو ({programsList.filter((p) => p.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setStatusFilter('past')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'past'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              آرشیو گذشته ({programsList.filter((p) => p.status === 'past').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="جستجو در عنوان یا توضیحات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="h-4 w-4 text-gray-400 absolute right-3.5 top-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Years Filter Row */}
        {programYears.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 px-2 shrink-0">فیلتر سال:</span>
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedYear === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              همه سال‌ها
            </button>
            {programYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                سال {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">در حال دریافت رویدادها...</p>
        </div>
      ) : filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-lg font-bold text-gray-800">هیچ رویدادی یافت نشد</h3>
          <p className="text-gray-500 text-xs mt-1">
            با فیلترهای انتخابی برنامه‌ای پیدا نشد. لطفاً فیلتر سال یا کلمه جستجو را تغییر دهید.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgramsListPage;
