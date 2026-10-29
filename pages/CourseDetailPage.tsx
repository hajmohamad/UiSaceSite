import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../services/api';
import VideoPlayer from '../components/CourseCompnents/VideoPlayer';
import FileList from '../components/CourseCompnents/FileList';
import type { Course, CourseVideo } from '../types';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [openSectionId, setOpenSectionId] = useState<number | string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      getCourseById(id).then(data => {
        if (isMounted) {
          if (data) {
            setCourse(data);
            if (data.sections && data.sections.length > 0) {
              setOpenSectionId(data.sections[0].id);
              if (data.sections[0].videos && data.sections[0].videos.length > 0) {
                setSelectedVideo(data.sections[0].videos[0]);
              }
            }
          }
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleSection = (sId: number | string) => {
    if (openSectionId === sId) {
      setOpenSectionId(null);
    } else {
      setOpenSectionId(sId);
    }
  };

  const isLoggedIn = false; // شبیه‌سازی

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-500">در حال بارگذاری اطلاعات دوره...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">دوره مورد نظر یافت نشد!</h2>
        <Link
          to="/"
          className="mt-4 inline-block bg-teal-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-teal-600 transition-colors"
        >
          بازگشت به لیست دوره‌ها
        </Link>
      </div>
    );
  }

  const isLocked = course.isPaid && !isLoggedIn;

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        to="/courses"
        className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-6 font-medium group transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        بازگشت به لیست دوره‌ها
      </Link>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden p-6 md:p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-lg text-gray-600 mb-6">مدرس: {course.instructor}</p>
        <p className="text-gray-700 leading-relaxed mb-8">{course.longDescription}</p>

        {isLocked ? (
          <div className="text-center bg-gray-50 p-6 md:p-8 rounded-lg">
            <div className="max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-600 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="text-2xl font-bold">محتوای دوره قفل است</h2>
              </div>
              <p className="mb-6">
                این یک دوره پولی است. برای دسترسی به محتوای دوره، لطفاً ابتدا وارد حساب کاربری خود شوید.
              </p>
              <button className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-teal-600 transition-colors duration-300">
                ورود به حساب کاربری
              </button>
            </div>
          </div>
        ) : (
          <div>
            {selectedVideo && (
              <div className="mb-8">
                <VideoPlayer video={selectedVideo} />
              </div>
            )}

            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
              سرفصل‌ها و محتوای دوره
            </h2>
            <div className="space-y-4">
              {course.sections.map(section => {
                const isOpen = openSectionId === section.id;

                return (
                  <div
                    key={section.id}
                    className="bg-gray-50 rounded-lg shadow-sm border overflow-hidden"
                  >
                    {/* دکمه باز/بسته */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex justify-between items-center p-5 text-right text-2xl font-semibold text-gray-800 hover:bg-gray-100"
                    >
                      {section.title}
                      <span className="text-teal-600 text-1xl transition-transform duration-300">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* محتوای فصل با انیمیشن */}
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-screen opacity-100 p-5' : 'max-h-0 opacity-0 p-0'
                      }`}
                    >
                      {section.videos.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-gray-700 mb-3">ویدیوها</h4>
                          <ul className="space-y-2">
                            {section.videos.map(video => (
                              <li key={video.id}>
                                <button
                                  onClick={() => setSelectedVideo(video)}
                                  className={`w-full text-right flex items-center p-3 rounded-md transition-colors ${
                                    selectedVideo?.id === video.id
                                      ? 'bg-teal-100 text-teal-800 font-semibold'
                                      : 'hover:bg-gray-100'
                                  }`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-5 h-5 ml-3 flex-shrink-0 ${
                                      selectedVideo?.id === video.id
                                        ? 'text-teal-600'
                                        : 'text-gray-400'
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {video.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.files.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-700 mb-3">فایل‌ها</h4>
                          <FileList files={section.files} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
