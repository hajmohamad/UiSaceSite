
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-gray-700">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-right">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                UI
              </span>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">انجمن علمی مهندسی کامپیوتر</h4>
                <p className="text-[11px] text-gray-500">دانشگاه اصفهان</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              مرجع رسمی فعالیت‌های علمی، کارگاه‌های تخصصی، مسابقات برنامه‌نویسی و رویدادهای فناوری دانشکده مهندسی کامپیوتر.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">دسترسی سریع</h5>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li><Link to="/programs" className="hover:text-blue-600 transition-colors">برنامه‌ها و رویدادها</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">دوره‌ها و کارگاه‌ها</Link></li>
              <li><Link to="/jobs" className="hover:text-blue-600 transition-colors">فرصت‌های شغلی و کاریابی</Link></li>
              <li><Link to="/members" className="hover:text-blue-600 transition-colors">اعضای شورای مرکزی و همکاران</Link></li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">راه‌های ارتباطی</h5>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>📍 اصفهان، میدان آزادی، دانشگاه اصفهان، دانشکده مهندسی کامپیوتر</li>
              <li>🏢 دفتر انجمن علمی: طبقه همکف دانشکده</li>
              <li>✉️ <a href="mailto:sace@ui.ac.ir" className="text-blue-600 hover:underline">sace@ui.ac.ir</a></li>
              <li><Link to="/contact" className="text-blue-600 font-semibold hover:underline">فرم تماس با ما ←</Link></li>
            </ul>
          </div>

          {/* Socials & Admin */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">شبکه‌های اجتماعی</h5>
            <p className="text-xs text-gray-500">اخبار و اطلاعیه‌های ثبت‌نام رویدادها را در کانال‌های ما دنبال کنید:</p>
            <div className="flex items-center gap-3">
              <a
                href="https://t.me/UI_SACE"
                target="_blank"
                rel="noopener noreferrer"
                title="کانال تلگرام انجمن"
                className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.208-.822 1.23-.696.045-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.04-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.394 4.025-1.63 4.473-1.636z" /></svg>
              </a>
              <a
                href="https://instagram.com/ui_sace"
                target="_blank"
                rel="noopener noreferrer"
                title="صفحه اینستاگرام انجمن"
                className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.792 2.013 10.146 2 12.315 2z" clipRule="evenodd" /></svg>
              </a>
              <a
                href="https://linkedin.com/company/ui-sace"
                target="_blank"
                rel="noopener noreferrer"
                title="صفحه لینکدین انجمن"
                className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.388 0-1.601 1.086-1.601 2.206v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.71zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.336 8.905H4.002v-8.59h2.671v8.59zM17.638 2H6.362A4.362 4.362 0 002 6.362v11.276A4.362 4.362 0 006.362 22h11.276A4.362 4.362 0 0022 17.638V6.362A4.362 4.362 0 0017.638 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
            <div className="pt-2">
              <Link
                to="/admin"
                className="text-[11px] text-gray-400 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
              >
                <span>🔒 ورود به سامانه مدیریت (Admin)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>
            © {new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان. تمامی حقوق محفوظ است.
          </p>
          <p className="text-[11px] text-gray-400">
            توسعه داده شده با ❤️ برای دانشجویان دانشگاه اصفهان
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
