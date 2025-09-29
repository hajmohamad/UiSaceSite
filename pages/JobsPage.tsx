
import React, { useState } from 'react';

import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';
import { useJobs } from '../hooks/useJobs';
import type { Job } from './../types';

const JobsPage: React.FC = () => {
  const { jobs } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  return (
  
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900">فرصت‌های شغلی باز</h1>
        <p className="text-center text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
          جدیدترین فرصت‌های شغلی در بهترین شرکت‌ها را کشف کنید. آینده شغلی خود را از اینجا بسازید.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />
          ))}
        </div>
        {selectedJob && (
          <JobDetailModal job={selectedJob} onClose={handleCloseModal} />
        )}
      </div>
  );
};

export default JobsPage;
