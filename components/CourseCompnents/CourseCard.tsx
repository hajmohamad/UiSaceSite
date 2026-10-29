import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const totalVideos = (course.sections || []).reduce(
    (acc, sec) => acc + (sec.videos?.length || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden transform hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 relative flex flex-col group">
      {/* Badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
            course.isPaid
              ? 'bg-amber-400 text-amber-950 border border-amber-300'
              : 'bg-emerald-500 text-white border border-emerald-400/40'
          }`}
        >
          {course.isPaid ? 'دوره تخصصی' : 'رایگان'}
        </span>
      </div>

      <Link to={`/course/${course.id}`} className="block flex flex-col flex-grow">
        {/* Course Banner */}
        <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'}
            alt={course.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
            }}
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2.5">
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              <span>👨‍🏫</span>
              <span>{course.instructor}</span>
            </span>

            {totalVideos > 0 && (
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                <span>🎬</span>
                <span>{totalVideos} ویدیو</span>
              </span>
            )}
          </div>

          <h3
            className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2"
            title={course.title}
          >
            {course.title}
          </h3>

          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-5 flex-grow">
            {course.shortDescription}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              {course.isPaid ? (
                <span className="text-sm font-black text-amber-600">
                  {course.price?.toLocaleString('fa-IR')} تومان
                </span>
              ) : (
                <span className="text-sm font-black text-emerald-600">رایگان</span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20">
              <span>{course.isPaid ? 'ثبت‌نام و مشاهده' : 'ورود به دوره'}</span>
              <span>←</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
