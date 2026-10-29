
import React, { useState } from 'react';

import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';
import { useJobs } from '../hooks/useJobs';
import type { Job } from './../types';

const JobsPage: React.FC = () => {
  const { jobs, loading } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());

    const matchType =
      filterType === 'ALL' ||
      (filterType === 'FULL_TIME' && (job.type.includes('تمام') || job.type.toLowerCase().includes('full'))) ||
      (filterType === 'PART_TIME' && (job.type.includes('پاره') || job.type.toLowerCase().includes('part'))) ||
      (filterType === 'INTERN' && (job.type.includes('کارآموز') || job.type.includes('پروژه') || job.type.toLowerCase().includes('intern')));

    return matchSearch && matchType;
  });

  return (
    <div className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-4">
          💼 کاریابی و ارتباط با صنعت
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          فرصت‌های شغلی و کارآموزی
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          فرصت‌های برتر شغلی و دوره‌های کارآموزی مهندسی عمران معرفی‌شده توسط انجمن علمی دانشگاه اصفهان
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان، شرکت، شهر..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-sm transition-all"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'همه موقعیت‌ها' },
              { id: 'FULL_TIME', label: 'تمام‌وقت' },
              { id: 'PART_TIME', label: 'پاره‌وقت' },
              { id: 'INTERN', label: 'کارآموزی / پروژه‌ای' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  filterType === tab.id
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium">در حال دریافت فرصت‌های شغلی...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-slate-400">
            💼
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">موقعیت شغلی مطابق جستجو یافت نشد</h3>
          <p className="text-slate-500 text-sm">لطفاً واژه جستجو را تغییر دهید یا فیلتر دیگری را انتخاب کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default JobsPage;
