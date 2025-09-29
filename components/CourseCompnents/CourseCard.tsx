
import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 relative flex flex-col">
      {course.isPaid && (
        <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full z-10">
          پولی
        </span>
      )}
      <Link to={`/course/${course.id}`} className="block flex flex-col flex-grow">
        <img className="w-full h-48 object-cover" src={course.imageUrl} alt={course.title} />
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
          <div className="flex justify-between items-center text-sm mb-4">
            <p className="text-gray-600">مدرس: {course.instructor}</p>
            {course.isPaid ? (
              <p className="font-bold text-green-600 text-base">{course.price?.toLocaleString('fa-IR')} تومان</p>
            ) : (
                <p className="font-bold text-green-600 text-base">رایگان</p>
            )}
          </div>
          <p className="text-gray-700 text-base mb-4 flex-grow">{course.shortDescription}</p>
          <div className="text-center mt-auto">
             <span className="inline-block bg-teal-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-teal-600 transition-colors duration-300">
              {course.isPaid ? 'خرید و مشاهده' : 'مشاهده دوره'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
