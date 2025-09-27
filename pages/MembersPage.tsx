
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MEMBERS } from '../constants';
import type { Member } from '../types';

interface MemberCardProps {
  member: Member;
  position: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, position }) => {
  return (
    <div className="bg-white text-center rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
      <img
        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200 object-cover"
        src={member.imageUrl}
        alt={member.name}
      />
      <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
      <p className="text-gray-500 font-medium">{position}</p>
    </div>
  );
};

const MembersPage: React.FC = () => {
  const membersByYear = useMemo(() => {
    const acc: Record<number, { member: Member; position: string }[]> = {};

    MEMBERS.forEach(member => {
      member.memberships.forEach(membership => {
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
  }, []);

  const sortedYears = Object.keys(membersByYear)
    .map(Number)
    .sort((a, b) => b - a);
    
  const [openYear, setOpenYear] = useState<number | null>(sortedYears.length > 0 ? sortedYears[0] : null);

  const handleYearToggle = (year: number) => {
    setOpenYear(prevOpenYear => (prevOpenYear === year ? null : year));
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 border-b-4 border-blue-500 pb-2 inline-block">
        اعضای انجمن
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        آشنایی با اعضای فعال و سابق انجمن علمی مهندسی کامپیوتر.
      </p>

      <div className="space-y-6">
        {sortedYears.map((year) => {
          const isOpen = openYear === year;
          return (
            <div key={year} className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden transition-all duration-300">
              <button
                onClick={() => handleYearToggle(year)}
                className="w-full flex justify-between items-center p-5 text-right focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-expanded={isOpen}
                aria-controls={`members-panel-${year}`}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  اعضای سال {year}
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? '-rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div
                id={`members-panel-${year}`}
                className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0">
                     <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                       {membersByYear[year].map(({ member, position }) => (
                         <Link to={`/members/${member.id}`} key={`${member.id}-${year}`} className="block group transform transition duration-300 hover:scale-105">
                           <MemberCard member={member} position={position} />
                         </Link>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersPage;
