
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const AnimatedLogo: React.FC = () => {
  return (
    <>
      <style>{`
        .logo-container {
          position: relative;
          width: 48px;
          height: 48px;
          transform: scale(0.22); /* Scale down the 200px container to fit */
          transform-origin: center center;
        }
        .logo-container svg {
          position: absolute;
          top: -75px; /* Adjust positioning */
          left: -75px; /* Adjust positioning */
          width: 200px;
          height: 200px;
        }
        .cir-big {
          animation: spin 2s linear infinite;
        }
        .cir-mid {
          animation: spin 1.5s linear infinite;
        }
        .cir-small {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="logo-container">
          <svg className="cir-big" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" stroke="#3B82F6" strokeWidth="4" stroke-dasharray="10 5"/>
          </svg>
          <svg className="cir-mid" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="38" stroke="#60A5FA" strokeWidth="4"/>
          </svg>
          <svg className="cir-small" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="50" cy="50" r="28" stroke="#93C5FD" strokeWidth="4" stroke-dasharray="1 5"/>
          </svg>
           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M45 45 L60 60 L52 68 L70 70 L68 52 L60 60" stroke="#1E3A8A" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
      </div>
    </>
  );
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = "text-gray-600 hover:text-blue-600 transition-colors duration-300 px-3 py-2 rounded-md text-md font-medium";
  const activeNavLinkClasses = "text-blue-600 font-semibold";

  return (
    <header className="bg-white/80 sticky top-0 z-50 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center gap-1 text-blue-700">
              <div className="w-12 h-12 flex items-center justify-center">
                 <AnimatedLogo />
              </div>
              <div>
                <div className="text-lg font-bold">انجمن علمی مهندسی کامپیوتر</div>
                <div className="text-sm text-gray-500 hidden sm:block">دانشگاه اصفهان</div>
              </div>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ms-10 flex items-baseline space-s-4">
              <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end>خانه</NavLink>
              <NavLink to="/programs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>برنامه‌ها</NavLink>
              <NavLink to="/members" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>اعضای انجمن</NavLink>

              <NavLink to="/contact" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>تماس با ما</NavLink>
            </div>
          </div>
          <div className="-ms-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
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
            <NavLink to="/contact" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>تماس با ما</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
