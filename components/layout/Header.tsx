
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const AnimatedLogo: React.FC = () => {
  return (
    <div className="custom-logo-root" aria-hidden="false">
      <div className="img-container" aria-hidden="true">
        <img className="cir-big" src="http://storage.ghavishomard.ir/programs_gallery/big.png" alt="big" />
        <img className="cir-mid" src="http://storage.ghavishomard.ir/programs_gallery/mid.png" alt="mid" />
        <img className="cir-small" src="http://storage.ghavishomard.ir/programs_gallery/small.png" alt="small" />
        <img className="cursor" src="http://storage.ghavishomard.ir/programs_gallery/cursor.png" alt="cursor" />
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = "text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-200 px-3.5 py-2 rounded-xl text-sm font-semibold";
  const activeNavLinkClasses = "text-blue-600 bg-blue-50 font-bold shadow-xs";

  return (
    <header className="bg-white/85 sticky top-0 z-50 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                 <AnimatedLogo />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">انجمن علمی مهندسی کامپیوتر</div>
                <div className="text-xs text-gray-500 font-medium">دانشگاه اصفهان</div>
              </div>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end>خانه</NavLink>
            <NavLink to="/programs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>برنامه‌ها</NavLink>
            <NavLink to="/courses" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>دوره‌ها</NavLink>
            <NavLink to="/jobs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>کاریابی</NavLink>
            <NavLink to="/members" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>اعضای انجمن</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>تماس با ما</NavLink>
          </div>
          <div className="-ms-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">باز کردن منو</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
         <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
  <NavLink to="/" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end onClick={() => setIsMenuOpen(false)}>خانه</NavLink>
  <NavLink to="/programs" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>برنامه‌ها</NavLink>
  <NavLink to="/members" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>اعضای انجمن</NavLink>
  <NavLink to="/jobs" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>کاریابی</NavLink>
  <NavLink to="/courses" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>دوره‌ها</NavLink>
  <NavLink to="/contact" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>تماس با ما</NavLink>
</div>

        </div>
      )}
    </header>
  );
};

export default Header;
