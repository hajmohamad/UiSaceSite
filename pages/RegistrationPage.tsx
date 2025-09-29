import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROGRAMS } from '../constants';

// تابع کمکی برای ارسال فرم (POST API)
export async function postRegistration(formData: FormData) {
  const res = await fetch('/api/registrations', {
    method: 'POST',
    // توجه: برای FormData نباید Content-Type را ست کنیم — مرورگر خودش می‌سازد
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `خطا در ارسال اطلاعات: ${res.status}`);
  }

  return res.json();
}

const RegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const program = PROGRAMS.find((p) => p.id === Number(id));

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // دانشجویی
  const [isStudent, setIsStudent] = useState<'yes' | 'no' | ''>('');
  const [studentNumber, setStudentNumber] = useState('');

  // رسید تراکنش (برای دوره‌های پولی)
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview(null);
      return;
    }
    const url = URL.createObjectURL(receiptFile);
    setReceiptPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

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

  const validatePhone = (p: string) => {
    // الگوی ساده برای شماره موبایل ایران: با 0 یا +98 شروع شود یا مستقیم 9xxxxxxxxx
    const re = /^(?:\+98|0)?9\d{9}$/;
    return re.test(p.replace(/\s|-/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    if (!phone.trim()) {
      setError('لطفاً شماره تلفن را وارد کنید.');
      return;
    }

    if (!validatePhone(phone)) {
      setError('لطفاً یک شماره تلفن معتبر وارد کنید (مثال: 09123456789).');
      return;
    }

    if (isStudent === 'yes' && !studentNumber.trim()) {
      setError('لطفاً شماره دانشجویی خود را وارد کنید.');
      return;
    }

    if (program.price && Number(program.price) > 0 && !receiptFile) {
      setError('این دوره پولی است؛ لطفاً عکس رسید تراکنش را آپلود کنید.');
      return;
    }

    // ساختن FormData برای ارسال شامل فایل
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('phone', phone.trim());
    formData.append('programId', String(program.id));
    formData.append('isStudent', String(isStudent === 'yes'));
    if (isStudent === 'yes') formData.append('studentNumber', studentNumber.trim());
    if (receiptFile) formData.append('receipt', receiptFile);

    try {
      setIsSubmitting(true);
      // استفاده از تابع API که بالاتر صادر شده
      await postRegistration(formData);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطایی در ارسال رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">ثبت‌نام در رویداد</h2>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{program.title}</h1>
        <p className="mt-2 text-gray-500">{program.date}</p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-16 bg-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
          <svg className="w-20 h-20 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ثبت‌نام شما با موفقیت انجام شد!</h1>
          <p className="text-gray-600 mb-8">
            از اینکه در رویداد <span className="font-semibold text-gray-900">{program.title}</span> ثبت‌نام کردید متشکریم. جزئیات بیشتر به شماره شما ارسال خواهد شد.
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
      ) : (
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">شماره تلفن</label>
              <div className="mt-1">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                  placeholder="مثال: 09123456789"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">آیا شما دانشجوی دانشگاه اصفهان هستید؟</p>
              <div className="mt-2 flex items-center gap-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isStudent"
                    value="yes"
                    checked={isStudent === 'yes'}
                    onChange={() => setIsStudent('yes')}
                    className="form-radio h-4 w-4"
                  />
                  <span className="mr-2">بله</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isStudent"
                    value="no"
                    checked={isStudent === 'no'}
                    onChange={() => setIsStudent('no')}
                    className="form-radio h-4 w-4"
                  />
                  <span className="mr-2">خیر</span>
                </label>
              </div>
            </div>

            {isStudent === 'yes' && (
              <div>
                <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">شماره دانشجویی</label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="studentNumber"
                    name="studentNumber"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                    placeholder="شماره دانشجویی خود را وارد کنید"
                  />
                </div>
              </div>
            )}

            {program.price && Number(program.price) > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-sm font-medium text-yellow-800">این دوره پولی است.</p>
                <p className="mt-1 font-semibold text-gray-900">مبلغ: {new Intl.NumberFormat('fa-IR').format(Number(program.price))} تومان</p>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">آپلود عکس رسید تراکنش</label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                      className="text-sm"
                    />
                    {receiptPreview && (
                      <img src={receiptPreview} alt="preview" className="h-16 w-24 object-cover rounded-md border" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-s-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-60"
              >
                {isSubmitting ? 'در حال ارسال...' : 'تایید و ثبت‌نام'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link to={`/programs/${program.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          انصراف و بازگشت
        </Link>
      </div>
    </div>
  );
};

export default RegistrationPage;
