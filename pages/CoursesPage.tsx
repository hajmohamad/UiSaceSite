import React, { useState, useEffect, useMemo } from 'react';
import { getCourses } from '../services/api';
import CourseCard from '../components/CourseCompnents/CourseCard';
import type { Course } from '../types';

const CoursesPage: React.FC = () => {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getCourses().then((data) => {
      if (isMounted) {
        setCoursesList(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    return coursesList.filter((c) => {
      const matchType =
        filterType === 'all'
          ? true
          : filterType === 'free'
          ? !c.isPaid
          : c.isPaid;

      const q = search.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [coursesList, filterType, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
            <span>💻</span>
            <span>آکادمی و دوره‌های تخصصی</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            دوره‌های آموزشی انجمن علمی
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
            ویدیوها و جزوات آموزشی، آموزش مهارت‌های بازار کار، فریم‌ورک‌های مدرن و مباحث آکادمیک مهندسی کامپیوتر.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full">
            {coursesList.length} دوره فعال
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full">
            {coursesList.filter((c) => !c.isPaid).length} دوره رایگان
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            همه دوره‌ها ({coursesList.length})
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'free'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            رایگان ({coursesList.filter((c) => !c.isPaid).length})
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'paid'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ویژه ({coursesList.filter((c) => c.isPaid).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="جستجو در عنوان یا مدرس دوره..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">در حال بارگذاری دوره‌ها...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-lg font-bold text-gray-800">هیچ دوره‌ای با این مشخصات یافت نشد</h3>
          <p className="text-gray-500 text-xs mt-1">لطفاً عبارت جستجو یا فیلتر نوع دوره را تغییر دهید.</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
