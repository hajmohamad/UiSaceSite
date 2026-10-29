
import React from 'react';
import type { Job } from '../types';
import { LocationIcon, BriefcaseIcon } from './IconComponents';

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const isExpired = new Date(job.expiryDate) < new Date();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${isExpired ? 'opacity-60' : ''}`}>
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
            <div className="flex items-center">
                <img 
                  src={job.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'} 
                  alt={`${job.company} logo`} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop';
                  }}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm" 
                />
                <div className="mr-3">
                    <h2 className="text-lg font-bold text-slate-800 leading-snug">{job.title}</h2>
                    <p className="text-sm text-slate-500 font-medium">{job.company}</p>
                </div>
            </div>
            {isExpired && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    منقضی شده
                </span>
            )}
        </div>
        
        <div className="mt-6 space-y-3 text-slate-700">
          <div className="flex items-center">
            <LocationIcon className="w-5 h-5 text-teal-600 ml-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <BriefcaseIcon className="w-5 h-5 text-teal-600 ml-2" />
            <span>{job.type}</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 p-4">
        <button
          onClick={() => onViewDetails(job)}
          disabled={isExpired}
          className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isExpired ? 'مشاهده ممکن نیست' : 'مشاهده جزئیات'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
