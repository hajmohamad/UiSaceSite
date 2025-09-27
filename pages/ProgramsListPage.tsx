import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PROGRAMS } from '../constants';
import type { Program } from '../types';

const ProgramCard: React.FC<{ program: Program }> = ({ program }) => {
  const isUpcoming = program.status === 'upcoming';

return (
  <Link 
    to={`/programs/${program.id}`} 
    className="flex flex-col group bg-white/30 backdrop-blur-lg rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 border border-white/40"
  >
    {/* قسمت تصویر بزرگ‌تر */}
  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
  <img 
    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
    src={program.imageUrl} 
    alt={program.title} 
  />
  <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-lg ${isUpcoming ? 'bg-green-500' : 'bg-gray-500'}`}>
    {isUpcoming ? 'در پیش رو' : 'پایان یافته'}
  </div>
</div>

    
    <div className="p-6 flex flex-col flex-grow"> {/* کمی padding بیشتر */}
      <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2 h-14 line-clamp-2" title={program.title}>{program.title}</h3>
      <p className="text-sm text-gray-500 mb-4 font-semibold">{program.date}</p>
      <p className="text-gray-600 flex-grow mb-5 text-sm line-clamp-3">{program.shortDescription}</p>
      
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center">
        <div className="text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300 flex items-center gap-2">
          <span>مشاهده جزئیات</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

};

const ProgramsListPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const sortedPrograms = useMemo(() => 
    [...PROGRAMS].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()), 
  []);

  const programYears = useMemo(() => {
    const years = new Set(PROGRAMS.map(p => new Date(p.dateISO).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, []);

  const filteredPrograms = useMemo(() => {
    let programs = sortedPrograms;

    if (selectedYear !== 'all') {
      programs = programs.filter(p => new Date(p.dateISO).getFullYear() === selectedYear);
    }

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      programs = programs.filter(p =>
        p.title.toLowerCase().includes(lowercasedQuery) ||
        p.shortDescription.toLowerCase().includes(lowercasedQuery)
      );
    }

    return programs;
  }, [selectedYear, sortedPrograms, searchQuery]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 border-b-4 border-blue-500 pb-2 inline-block">
        برنامه‌ها و رویدادها
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        لیست کارگاه‌ها، سمینارها و مسابقات برگزار شده توسط انجمن.
      </p>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="جستجو در عنوان یا توضیحات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {/* Year Filter */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center space-s-1 flex-wrap">
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex-grow ${
              selectedYear === 'all' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            همه
          </button>
          {programYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex-grow ${
                selectedYear === year ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>


      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md border">
            <h3 className="text-xl font-bold text-gray-700">نتیجه‌ای یافت نشد</h3>
            <p className="text-gray-500 mt-2">هیچ برنامه‌ای با این مشخصات یافت نشد. لطفا جستجوی خود را تغییر دهید.</p>
        </div>
      )}
    </div>
  );
};

export default ProgramsListPage;
