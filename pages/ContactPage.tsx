
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
    setIsSubmitted(true);
  };

  return (
    <div>
       <h1 className="text-3xl font-extrabold text-gray-900 mb-2 border-b-4 border-blue-500 pb-2 inline-block">
        تماس با ما
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        برای همکاری، پیشنهاد یا هرگونه سوال، با ما در ارتباط باشید.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-gray-200/80">
          {isSubmitted ? (
            <div className="text-center py-10">
              <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 className="text-2xl font-bold text-gray-800">پیام شما ارسال شد!</h2>
              <p className="text-gray-600 mt-2">از تماس شما متشکریم. به زودی با شما در ارتباط خواهیم بود.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">نام شما</label>
                <input type="text" name="name" id="name" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                <input type="email" name="email" id="email" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">پیام شما</label>
                <textarea name="message" id="message" rows={5} required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange}></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 shadow-lg">ارسال پیام</button>
              </div>
            </form>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">اطلاعات تماس</h3>
            <p className="text-gray-600">ایمیل: <a href="mailto:info@example.com" className="text-blue-600">mohamadrahi98@gmail.com</a></p>
            <p className="text-gray-600">آدرس: دانشگاه اصفهان، دانشکده فنی و مهندسی</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
