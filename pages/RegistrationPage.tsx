
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROGRAMS } from '../constants';

const RegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const program = PROGRAMS.find((p) => p.id === Number(id));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('لطفاً نام و ایمیل خود را وارد کنید.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید.');
      return;
    }
    setError('');
    console.log({ name, email, programId: program?.id });
    setIsSubmitted(true);
  };

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
  
  if (program.status === 'past') {
      return (
        <div className="text-center py-10 bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-yellow-600 mb-4">مهلت ثبت‌نام به پایان رسیده است</h1>
            <p className="text-gray-600 mb-6">این رویداد قبلاً برگزار شده است و امکان ثبت‌نام جدید وجود ندارد.</p>
            <Link to={`/programs/${program.id}`} className="text-blue-500 hover:underline mt-4 inline-block">
                بازگشت به صفحه برنامه
            </Link>
        </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-16 bg-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
        <svg className="w-20 h-20 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ثبت‌نام شما با موفقیت انجام شد!</h1>
        <p className="text-gray-600 mb-8">
          از اینکه در رویداد <span className="font-semibold text-gray-900">{program.title}</span> ثبت‌نام کردید متشکریم. جزئیات بیشتر به ایمیل شما ارسال خواهد شد.
        </p>
        <div className="flex justify-center items-center space-s-4">
            <Link 
              to="/" 
              className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              صفحه اصلی
            </Link>
            <Link 
              to="/programs" 
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              مشاهده سایر برنامه‌ها
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">ثبت‌نام در رویداد</h2>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{program.title}</h1>
        <p className="mt-2 text-gray-500">{program.date}</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">نام و نام خانوادگی</label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                placeholder="مثال: سارا رضایی"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">آدرس ایمیل</label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center space-s-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              تایید و ثبت‌نام
            </button>
          </div>
        </div>
      </form>
       <div className="mt-6 text-center">
            <Link to={`/programs/${program.id}`} className="text-sm text-gray-500 hover:text-gray-700">
                انصراف و بازگشت
            </Link>
        </div>
    </div>
  );
};

export default RegistrationPage;
