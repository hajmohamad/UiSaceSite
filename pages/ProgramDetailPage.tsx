import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROGRAMS, MEMBERS } from '../constants';

const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const program = PROGRAMS.find((p) => p.id === Number(id));

  if (!program) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600">برنامه مورد نظر یافت نشد!</h1>
        <Link to="/programs" className="text-blue-500 hover:underline mt-4 inline-block">
          بازگشت به لیست برنامه‌ها
        </Link>
      </div>
    );
  }

  const programYear = new Date(program.dateISO).getFullYear();

  const collaborators = program.collaborators
    .map(memberId => MEMBERS.find(m => m.id === memberId))
    .filter((member): member is NonNullable<typeof member> => member !== undefined)
    .map(member => {
        const membershipForYear = member.memberships.find(m => m.year === programYear);
        const mostRecentMembership = [...member.memberships].sort((a, b) => b.year - a.year)[0];
        const displayPosition = membershipForYear ? membershipForYear.position : mostRecentMembership?.position || 'همکار';
        return { ...member, displayPosition };
    });
    
  const hasImages = program.gallery && program.gallery.images.length > 0;
  const hasVideos = program.gallery && program.gallery.videos.length > 0;
  const isUpcoming = program.status === 'upcoming';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
      
      {/* Right Column: Main Content */}
      <div className="lg:col-span-2 space-y-8 order-2 lg:order-2">
         {/* Main Program Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 overflow-hidden">
            <div className="p-6 md:p-8">
                <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">{program.date}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{program.title}</h1>
<div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    <p>{program.fullDescription}</p>
                </div>
            </div>
        </div>
        
        {/* Collaborators Section */}
        {program.status === 'past' && collaborators.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 overflow-hidden">
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span>همکاران این برنامه</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
                        {collaborators.map(member => (
                        <Link to={`/members/${member.id}`} key={member.id} className="flex flex-col items-center group">
                            <img src={member.imageUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto border-4 border-gray-200 object-cover group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300" />
                            <h3 className="mt-3 font-semibold text-gray-700 group-hover:text-blue-600">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.displayPosition}</p>
                        </Link>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Sponsors Section */}
        {program.sponsors.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 overflow-hidden">
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v.01M12 12v.01M12 16v.01M12 16v.01M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>
                        <span>حامیان برنامه</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
                        {program.sponsors.map(sponsor => (
                        <div key={sponsor.id} className="flex flex-col items-center group">
                            <div className="w-28 h-28 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center p-2 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-gray-300">
                            <img src={sponsor.logoUrl} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <h3 className="mt-3 font-semibold text-gray-700">{sponsor.name}</h3>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        
        {/* Gallery Section */}
        {program.status === 'past' && (hasImages || hasVideos) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 overflow-hidden">
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>گالری تصاویر و ویدئوها</span>
                    </h2>
                    {hasImages && (
                        <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">تصاویر</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {program.gallery?.images.map((image, index) => (
                            <div key={index} className="overflow-hidden rounded-lg shadow-md group aspect-w-1 aspect-h-1">
                                <img src={image} alt={`گالری ${program.title} - ${index + 1}`} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    {hasVideos && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">ویدئوها</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {program.gallery?.videos.map((videoUrl, index) => (
                                    <div key={index} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                                    <video 
                                        src={videoUrl} 
                                        controls 
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                    >
                                        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                                    </video>
                                    </div>
                                ))}
                                </div>
                            </div>
                            )}

                </div>
            </div>
        )}

      </div>
      

      {/* Left Column: Sticky Info */}
      <div className="lg:col-span-1 order-1 lg:order-1 lg:sticky top-24 self-start space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 overflow-hidden">
          <div className="relative rounded-t-lg overflow-hidden group">
            <img src={program.imageUrl} alt={program.title} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"/>
            <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-lg ${isUpcoming ? 'bg-green-500' : 'bg-gray-500'}`}>
                {isUpcoming ? 'در پیش رو' : 'پایان یافته'}
            </div>
          </div>
          {isUpcoming && (
              <div className="p-4">
                  <a href={`/programs/${program.id}/register`} className="w-full block text-center bg-green-600 text-white font-bold text-lg py-3 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 shadow-lg">
                      هم‌اکنون ثبت‌نام کنید
                  </a>
              </div>
          )}
        </div>

        {/* Added Stats Boxes */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 p-4 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-blue-100 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 11-6.44-6.44" />
                    </svg>
                </div>
                <p className="text-2xl font-extrabold text-gray-800">{program.registeredCount || 100}</p>
                <p className="text-sm font-medium text-gray-500">نفرات ثبت نامی</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 p-4 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-indigo-100 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-2xl font-extrabold text-gray-800">{program.durationHours || 45}</p>
                <p className="text-sm font-medium text-gray-500">ساعت جلسه</p>
            </div>
        </div>

        <div className="text-center">
            <Link to="/programs" className="inline-block bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-300 border-2 border-blue-500 shadow-sm">
            &larr; بازگشت به همه برنامه‌ها
            </Link>
        </div>
      </div>
      
    </div>
  );
};

export default ProgramDetailPage;
