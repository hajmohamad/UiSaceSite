import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMembers } from '../services/api';
import type { Member } from '../types';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350';

interface MemberCardProps {
  member: Member;
  position: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, position }) => {
  const isSecretary = position.includes('دبیر');
  const isCouncil = position.includes('شورا');

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-5 h-full flex flex-col items-center justify-between group-hover:shadow-xl group-hover:border-blue-300 transition-all duration-300 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-blue-50/70 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <div className="relative mb-4">
          <img
            className="w-28 h-28 rounded-full mx-auto border-3 border-white shadow-md object-cover ring-4 ring-gray-100 group-hover:ring-blue-400 group-hover:scale-105 transition-all duration-300"
            src={member.imageUrl || DEFAULT_AVATAR}
            alt={member.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
          {member.name}
        </h3>

        <div className="mb-3">
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full shadow-xs ${
              isSecretary
                ? 'bg-amber-100 text-amber-900 border border-amber-300/60'
                : isCouncil
                ? 'bg-blue-100 text-blue-900 border border-blue-300/60'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {position}
          </span>
        </div>

        {member.bio && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed px-2 mb-3">
            {member.bio}
          </p>
        )}
      </div>

      <div className="w-full pt-3 border-t border-gray-100 flex items-center justify-center text-xs font-bold text-blue-600 group-hover:text-blue-700">
        <span>مشاهده کارنامه و رویدادها ←</span>
      </div>
    </div>
  );
};

const MembersPage: React.FC = () => {
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<'all' | number>('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMembers().then((data) => {
      if (isMounted) {
        setMembersList(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const membersByYear = useMemo(() => {
    const acc: Record<number, { member: Member; position: string }[]> = {};

    membersList.forEach((member) => {
      (member.memberships || []).forEach((membership) => {
        const { year, position } = membership;
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push({ member, position });
      });
    });

    for (const year in acc) {
      acc[year].sort((a, b) => a.member.id - b.member.id);
    }

    return acc;
  }, [membersList]);

  const sortedYears = useMemo(() => {
    return Object.keys(membersByYear)
      .map(Number)
      .sort((a, b) => b - a);
  }, [membersByYear]);

  const [openYear, setOpenYear] = useState<number | null>(null);

  useEffect(() => {
    if (sortedYears.length > 0 && openYear === null) {
      setOpenYear(sortedYears[0]);
    }
  }, [sortedYears]);

  const handleYearToggle = (year: number) => {
    setOpenYear((prev) => (prev === year ? null : year));
  };

  // Filtered list by search
  const filteredYearsToDisplay = useMemo(() => {
    if (selectedYearFilter !== 'all') {
      return [selectedYearFilter];
    }
    return sortedYears;
  }, [sortedYears, selectedYearFilter]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
            <span>👥</span>
            <span>شورای مرکزی و همکاران فعال</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            اعضای انجمن علمی مهندسی کامپیوتر
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
            آشنایی با دانشجویان و نخبگان فعال در ادوار مختلف انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full">
            {membersList.length} عضو ثبت‌شده
          </span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full">
            {sortedYears.length} دوره انجمن
          </span>
        </div>
      </div>

      {/* Search & Year Quick Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام عضو، سمت (مثلاً دبیر)، یا کلیدواژه..."
            className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Year Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-xs font-bold text-gray-400 px-2 shrink-0">دوره:</span>
          <button
            onClick={() => {
              setSelectedYearFilter('all');
              if (sortedYears.length > 0) setOpenYear(sortedYears[0]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedYearFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            همه ادوار
          </button>
          {sortedYears.map((yr) => {
            const count = (membersByYear[yr] || []).length;
            const isSelected = selectedYearFilter === yr;
            return (
              <button
                key={yr}
                onClick={() => {
                  setSelectedYearFilter(yr);
                  setOpenYear(yr);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>دوره سال {yr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Year Accordions List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">در حال بارگذاری اعضای انجمن...</p>
        </div>
      ) : filteredYearsToDisplay.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="font-bold text-sm text-gray-700">هیچ عضوی در این دوره یافت نشد.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredYearsToDisplay.map((year) => {
            const allMembersInYear = membersByYear[year] || [];
            const filteredInYear = allMembersInYear.filter(({ member, position }) => {
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                member.name.toLowerCase().includes(q) ||
                position.toLowerCase().includes(q) ||
                (member.bio && member.bio.toLowerCase().includes(q))
              );
            });

            const isOpen = openYear === year || selectedYearFilter === year;

            return (
              <div
                key={year}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/90 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => handleYearToggle(year)}
                  className="w-full flex justify-between items-center p-5 text-right hover:bg-slate-50/70 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 font-black text-sm flex items-center justify-center">
                      {year}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        اعضای شورای مرکزی و همکاران سال {year}
                      </h2>
                      <span className="text-xs text-gray-500">
                        {filteredInYear.length} عضو فعال در این دوره
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-semibold hidden sm:inline">
                      {isOpen ? 'بستن لیست' : 'مشاهده اعضا'}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
                        isOpen ? '-rotate-180 text-blue-600' : 'rotate-0'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-6 pt-2 border-t border-gray-100">
                    {filteredInYear.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        عضوی مطابق با جستجوی شما در سال {year} یافت نشد.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-3">
                        {filteredInYear.map(({ member, position }) => (
                          <Link
                            to={`/members/${member.id}`}
                            key={`${member.id}-${year}`}
                            className="block group transform transition duration-300 hover:scale-102"
                          >
                            <MemberCard member={member} position={position} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
