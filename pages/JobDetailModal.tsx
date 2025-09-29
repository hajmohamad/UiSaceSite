
import React, { useState, FormEvent } from 'react';
import type { Job } from '../types';
import { CloseIcon, LocationIcon, BriefcaseIcon, ClockIcon } from './IconComponents';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;
  
  const isExpired = new Date(job.expiryDate) < new Date();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!resume) {
      alert('لطفاً فایل رزومه خود را انتخاب کنید.');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`رزومه شما برای موقعیت شغلی "${job.title}" با موفقیت ارسال شد.`);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b sticky top-0 bg-white rounded-t-lg z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
            <p className="text-slate-600">{job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <CloseIcon className="w-6 h-6 text-slate-500" />
          </button>
        </header>

        <div className="overflow-y-auto p-6 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-center space-i-2">
              <LocationIcon className="w-5 h-5 text-teal-700" />
              <span className="font-medium text-teal-800">{job.location}</span>
            </div>
             <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-center space-i-2">
              <BriefcaseIcon className="w-5 h-5 text-teal-700" />
              <span className="font-medium text-teal-800">{job.type}</span>
            </div>
             <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-center space-i-2">
              <ClockIcon className="w-5 h-5 text-teal-700" />
              <span className="font-medium text-teal-800">{isExpired ? 'منقضی شده' : `تا ${new Date(job.expiryDate).toLocaleDateString('fa-IR')}`}</span>
            </div>
          </div>
          
          {job.salary && <p className="mb-6 text-lg"><strong>حقوق:</strong> {job.salary}</p>}
        
          <h3 className="text-xl font-semibold mb-2">شرح شغل</h3>
          <p className="text-slate-700 mb-6">{job.description}</p>
          
          <h3 className="text-xl font-semibold mb-2">مسئولیت‌ها</h3>
          <ul className="list-disc list-inside space-y-2 mb-6 text-slate-700">
            {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
          </ul>

          <h3 className="text-xl font-semibold mb-2">شرایط احراز</h3>
          <ul className="list-disc list-inside space-y-2 mb-6 text-slate-700">
            {job.qualifications.map((item, index) => <li key={index}>{item}</li>)}
          </ul>

          {!isExpired && (
            <div className="bg-slate-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-center">ارسال رزومه برای این موقعیت</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">نام و نام خانوادگی</label>
                    <input type="text" id="name" required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                    <input type="email" id="email" required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                </div>
                 <div>
                    <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-1">فایل رزومه (PDF, DOCX)</label>
                    <input type="file" id="resume" required onChange={handleFileChange} accept=".pdf,.doc,.docx" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors duration-300 disabled:bg-teal-400 disabled:cursor-wait"
                >
                    {isSubmitting ? 'در حال ارسال...' : 'ارسال رزومه'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default JobDetailModal;
