
import React from 'react';
import { courses } from '../constants';
import CourseCard from '../components/CourseCompnents/CourseCard';

const CoursesPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">لیست دوره‌ها</h1>
      <p className="text-lg text-gray-600 mb-8">دوره‌های آموزشی ما را مرور کنید و یادگیری را شروع کنید.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
