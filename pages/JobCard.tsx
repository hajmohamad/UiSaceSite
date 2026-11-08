
import React from 'react';
import type { Job } from '../types';
import { LocationIcon, BriefcaseIcon } from './IconComponents';

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const isExpired = Boolean(job.expiryDate && new Date(job.expiryDate) < new Date());
  const isStopped = Boolean(job.isStopped || job.status === 'stopped');

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col border border-slate-200/80 ${
        isStopped ? 'opacity-75 grayscale-[20%]' : isExpired ? 'opacity-60' : ''
      }`}
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={job.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'}
              alt={`${job.company} logo`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop';
              }}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                {job.title}
              </h2>
              <p className="text-xs sm:text-sm text-teal-600 font-semibold mt-0.5">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {isStopped ? (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                متوقف شده
              </span>
            ) : isExpired ? (
              <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                منقضی شده
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                فعال
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2.5 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <LocationIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{job.location || 'مشخص نشده'}</span>
          </div>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{job.type}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-xs">💰</span>
              <span>{job.salary}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-100">
        <button
          onClick={() => onViewDetails(job)}
          className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-xs ${
            isStopped
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : isExpired
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isStopped ? 'مشاهده جزئیات (فرصت متوقف شده)' : isExpired ? 'منقضی شده' : 'مشاهده جزئیات و شرایط'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
