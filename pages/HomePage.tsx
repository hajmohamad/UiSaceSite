import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrograms, getMembers, getStats, getCourses } from '../services/api';
import type { Program, Member, Course } from '../types';

const HomePage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    membersCount: 0,
    programsCount: 0,
    upcomingProgramsCount: 0,
    coursesCount: 0,
    jobsCount: 0,
  });

  useEffect(() => {
    let isMounted = true;
    getPrograms().then(data => {
      if (isMounted) setPrograms(data || []);
    });
    getMembers().then(data => {
      if (isMounted) setMembers(data || []);
    });
    getCourses().then(data => {
      if (isMounted) setCourses(data || []);
    });
    getStats().then(data => {
      if (isMounted) setStats(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingPrograms = programs
    .filter(p => p.status === 'upcoming')
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    .slice(0, 3);

  const galleryImages = programs
    .filter(p => p.status === 'past' && p.gallery && p.gallery.images.length > 0)
    .flatMap(p => p.gallery!.images)
    .slice(0, 8);

  const topCourses = courses.slice(0, 3);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.92)), url('http://storage.ghavishomard.ir/programs_gallery/2025-09-27%2004.45.46.jpg')`,
          minHeight: '520px',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12">
          {/* Badge */}


          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 max-w-4xl tracking-tight">
            انجمن علمی مهندسی کامپیوتر
          </h1>
          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mb-10 leading-relaxed font-normal">
            بزرگ‌ترین بستر دانشجویی برای یادگیری برنامه‌نویسی، شبکه‌سازی، کارگاه‌های صنعتی و پروژه‌های نوآورانه.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
             <Link
               to="/programs"
               className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all transform hover:-translate-y-0.5 duration-200 shadow-xl shadow-blue-600/30 text-sm"
             >
                مشاهده رویدادها و کارگاه‌ها
             </Link>
             <Link
               to="/courses"
               className="bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-7 rounded-2xl backdrop-blur-md transition-all border border-white/20 text-sm hover:border-white/40"
             >
                دوره‌های آموزشی
             </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">انجمن ما در یک نگاه</h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">نگاهی سریع به اعداد و ارقامی که فعالیت‌های ما را در طول زمان شکل داده‌اند.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-4xl font-extrabold text-gray-800">{stats.membersCount || members.length || 13}+</p>
            <p className="text-gray-500 mt-2 text-lg">عضو فعال</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80">
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-4xl font-extrabold text-gray-800">{stats.programsCount || programs.length || 19}+</p>
            <p className="text-gray-500 mt-2 text-lg">برنامه برگزار شده</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80">
            <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <p className="text-4xl font-extrabold text-gray-800">10+</p>
            <p className="text-gray-500 mt-2 text-lg">کارگاه تخصصی</p>
          </div>
        </div>
      </div>
      
      {/* Why Join Us Section */}
      <div className="text-center">
         <h2 className="text-3xl font-bold text-gray-800 mb-3">چرا به انجمن ما بپیوندید؟</h2>
        <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">ما بستری برای رشد، شبکه‌سازی و خلق فرصت‌های جدید فراهم می‌کنیم که مسیر حرفه‌ای شما را هموارتر می‌کند.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200/80 text-center transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">یادگیری و توسعه مهارت‌ها</h3>
              <p className="text-gray-600">با شرکت در کارگاه‌های تخصصی، بوت‌کمپ‌ها و سخنرانی‌های علمی، دانش و مهارت خود را به‌روز نگه دارید.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200/80 text-center transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">شبکه‌سازی حرفه‌ای</h3>
              <p className="text-gray-600">با اساتید برجسته، فارغ‌التحصیلان موفق و متخصصان صنعت ارتباط برقرار کرده و شبکه‌ی حرفه‌ای خود را بسازید.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200/80 text-center transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">تجربه‌های عملی و تیمی</h3>
              <p className="text-gray-600">با مشارکت در برگزاری رویدادهای بزرگ و پروژه‌های واقعی، کار تیمی و مهارت‌های اجرایی خود را تقویت کنید.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200/80 text-center transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">ساختن رزومه قوی</h3>
              <p className="text-gray-600">فعالیت‌های شما در انجمن علمی، یک نقطه قوت ارزشمند در رزومه تحصیلی و شغلی شما خواهد بود.</p>
            </div>
        </div>
      </div>
      
       {/* Testimonials Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 py-16 px-8">
          <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">صدای اعضای ما</h2>
              <p className="text-lg text-gray-500 mb-12">بشنوید که اعضای فعلی و سابق ما درباره تجربه خود در انجمن چه می‌گویند.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
              <div className="bg-slate-50 p-8 rounded-xl border border-gray-200/80">
                  <p className="text-gray-700 italic mb-6">"عضویت در انجمن علمی یکی از بهترین تصمیمات دوران دانشجویی من بود. اینجا نه تنها مهارت‌های فنی خودم رو تقویت کردم، بلکه یاد گرفتم چطور در یک تیم کار کنم و یک رویداد بزرگ رو از صفر تا صد مدیریت کنم."</p>
                  <div className="flex items-center">
                      <img className="w-14 h-14 rounded-full object-cover border-2 border-blue-200" src="http://storage.ghavishomard.ir/members/photo_2025-09-27%2004.15.21.jpeg" alt="محمد"/>
                      <div className="mr-4">
                          <p className="font-bold text-gray-800">محمد</p>
                          <p className="text-sm text-gray-500">دبیر انجمن - ۱۴۰۳</p>
                      </div>
                  </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl border border-gray-200/80">
                  <p className="text-gray-700 italic mb-6">"فضای دوستانه و علمی انجمن به من انگیزه داد تا از محدوده‌ی کلاس‌های درس فراتر برم. آشنایی با افراد متخصص و شرکت در پروژه‌های گروهی، دید من رو نسبت به آینده شغلی‌ام کاملا تغییر داد."</p>
                  <div className="flex items-center">
                      <img className="w-14 h-14 rounded-full object-cover border-2 border-blue-200" src="http://storage.ghavishomard.ir/members/24-10-18_10-53-30-603.jpg" alt="امیرعلی گلی"/>
                      <div className="mr-4">
                          <p className="font-bold text-gray-800">امیرعلی گلی</p>
                          <p className="text-sm text-gray-500">عضو سابق</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Upcoming Programs Section */}
      {upcomingPrograms.length > 0 && (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">آخرین برنامه‌های پیش رو</h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">فرصت‌های جدید برای یادگیری و همکاری را از دست ندهید.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto text-right">
          {upcomingPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200/80 flex flex-col transition-transform transform hover:-translate-y-2 duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
              <p className="text-gray-500 font-medium mb-4">{program.date}</p>
              <p className="text-gray-600 flex-grow mb-4">{program.shortDescription}</p>
              <div className="mt-auto">
                 <Link 
                  to={`/programs/${program.id}`} 
                  className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md inline-block"
                >
                  بیشتر بدانید
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Courses Showcase Section */}
      {topCourses.length > 0 && (
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto mb-10">
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">دوره‌های آموزشی و تخصصی</h2>
              <p className="text-gray-500 text-sm">مهارت‌های برنامه‌نویسی و مهندسی نرم‌افزار را با برترین مدرسین یاد بگیرید.</p>
            </div>
            <Link
              to="/courses"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              مشاهده همه دوره‌ها ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-right">
            {topCourses.map((c) => (
              <Link
                key={c.id}
                to={`/course/${c.id}`}
                className="group bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col"
              >
                <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                    c.isPaid ? 'bg-amber-400 text-amber-900' : 'bg-emerald-500 text-white'
                  }`}>
                    {c.isPaid ? 'دوره ویژه' : 'رایگان'}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                    <span>👨‍🏫 مدرس:</span>
                    <span className="font-semibold text-gray-700">{c.instructor}</span>
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed flex-1 mb-4">
                    {c.shortDescription}
                  </p>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600">
                      {c.isPaid ? `${c.price?.toLocaleString('fa-IR')} تومان` : 'کاملاً رایگان'}
                    </span>
                    <span className="text-blue-600 font-semibold group-hover:underline">
                      مشاهده جلسات ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced Gallery Section */}
      {galleryImages.length > 0 && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">گالری لحظات</h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">گوشه‌ای از خاطرات و لحظات به یاد ماندنی رویدادهای گذشته.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {galleryImages.map((img, index) => (
              <div key={index} className="relative aspect-w-1 aspect-h-1 rounded-xl overflow-hidden shadow-lg group cursor-pointer border-4 border-white">
                <img 
                  src={img} 
                  alt={`لحظه ماندگار ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA Section */}
      <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">به ما بپیوندید!</h2>
        <p className="text-gray-600 mb-6">با مشاهده لیست کامل برنامه‌ها و آشنایی با اعضای انجمن، بخشی از جامعه پویای ما باشید.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            to="/programs" 
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 shadow-lg"
          >
            مشاهده همه برنامه‌ها
          </Link>
          <Link 
            to="/members" 
            className="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 duration-300 shadow-lg"
          >
            آشنایی با اعضا
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;