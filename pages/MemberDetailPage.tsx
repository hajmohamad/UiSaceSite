import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MEMBERS, PROGRAMS } from '../constants';

const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const member = MEMBERS.find((m) => m.id === Number(id));

  if (!member) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600">عضو مورد نظر یافت نشد!</h1>
        <Link to="/members" className="text-blue-500 hover:underline mt-4 inline-block">
          بازگشت به لیست اعضا
        </Link>
      </div>
    );
  }

  const collaboratedPrograms = PROGRAMS.filter(program =>
    program.collaborators.includes(member.id)
  )
  .map(program => {
    const programYear = new Date(program.dateISO).getFullYear();
    const membershipForYear = member.memberships.find(m => m.year === programYear);
    const mostRecentMembership = [...member.memberships].sort((a, b) => b.year - a.year)[0];
    const displayPosition = membershipForYear?.position || mostRecentMembership?.position || 'همکار';
    return { ...program, displayPosition };
  })
  .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

  const sortedMemberships = [...member.memberships].sort((a, b) => b.year - a.year);

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200/75 overflow-hidden">
      <div className="p-6 md:p-10">
        <div className="md:flex md:items-start md:space-s-8">
          <div className="md:w-1/3 text-center md:text-right mb-6 md:mb-0">
            <img 
              src={member.imageUrl} 
              alt={member.name} 
              className="w-48 h-48 rounded-full mx-auto md:mx-0 border-8 border-gray-200 shadow-lg object-cover"
            />
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{member.name}</h1>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-700 mb-2">سوابق عضویت</h2>
              <ul className="space-y-2">
                {sortedMemberships.map(m => (
                  <li key={m.year} className="flex items-center text-gray-600">
                    <span className="font-semibold text-gray-800 bg-gray-200 px-3 py-1 rounded-md text-sm w-16 text-center">{m.year}</span>
                    <span className="mx-3 text-gray-400">&ndash;</span>
                    <span className="font-medium text-blue-600 text-lg">{m.position}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mt-6 border-t pt-4">
              <h2 className="text-lg font-bold text-gray-700 mb-2">درباره</h2>
              <p>{member.bio}</p>
            </div>
          </div>
        </div>

        {collaboratedPrograms.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-3 flex items-center gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5m-5-4h.01M9 7h.01M14 7h.01M14 11h.01M14 15h.01" />
              </svg>
              <span>برنامه‌هایی که در آن‌ها همکاری داشته</span>
            </h2>
            <div className="space-y-4">
              {collaboratedPrograms.map(program => (
                <Link 
                  to={`/programs/${program.id}`} 
                  key={program.id}
                  className="block p-5 bg-slate-50 rounded-xl border border-gray-200 hover:bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className='mb-3 sm:mb-0'>
                      <div className="flex items-center gap-3 mb-2">
                         <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600">{program.title}</h3>
                         <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{program.displayPosition}</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{program.date}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300 self-end sm:self-center">
                        <span>مشاهده جزئیات</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 border-t pt-6">
          <Link 
            to="/members" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span>بازگشت به همه اعضا</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;
