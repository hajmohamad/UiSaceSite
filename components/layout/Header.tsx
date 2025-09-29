
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const AnimatedLogo: React.FC = () => {
  return (
    <>
    <style>{`
  /* responsive logo sizing via a CSS variable */
  .custom-logo-root {
    --logo-size: 48px; /* default */
    position: relative;
    width: var(--logo-size);
    height: var(--logo-size);
    display: inline-block;
  }

  /* container covers the root and centers images */
  .custom-logo-root .img-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* each image is centered; scale is controlled by --s for each img */
  .custom-logo-root .img-container img {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: center center;
    transform: translate(-50%, -50%) scale(var(--s, 1));
    max-width: none;
    width: calc(var(--logo-size) * var(--scaleFactor, 1)); /* fallback if needed */
    height: auto;
    user-select: none;
    -webkit-user-drag: none;
  }

  /* sizes / stacking / animations for each ring */
  .custom-logo-root .cir-big   { --s: 1.6; z-index: 10; animation: spin 3s linear infinite; }
  .custom-logo-root .cir-mid   { --s: 1.2; z-index: 20; animation: spin 2s linear infinite; }
  .custom-logo-root .cir-small { --s: 0.75; z-index: 30; animation: spin 1.25s linear infinite; }
  .custom-logo-root .cursor    { --s: 0.45; z-index: 40; /* static (no rotate) by default */ }

  /* spin uses translate center so scaling + rotation keep center aligned */
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* small screens -> smaller logo */
  @media (max-width: 640px) {
    .custom-logo-root { --logo-size: 34px; }
    .custom-logo-root .cir-big   { --s: 1.4; }
    .custom-logo-root .cir-mid   { --s: 1.0; }
    .custom-logo-root .cir-small { --s: 0.65; }
    .custom-logo-root .cursor    { --s: 0.4; }
  }

  /* large screens -> a bit bigger */
  @media (min-width: 1024px) {
    .custom-logo-root { --logo-size: 64px; }
    .custom-logo-root .cir-big   { --s: 1.8; }
    .custom-logo-root .cir-mid   { --s: 1.3; }
    .custom-logo-root .cir-small { --s: 0.9; }
    .custom-logo-root .cursor    { --s: 0.55; }
  }

  /* accessibility: احترام به reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .custom-logo-root .cir-big,
    .custom-logo-root .cir-mid,
    .custom-logo-root .cir-small {
      animation: none;
      transform: translate(-50%, -50%); /* keep them centered but not rotating */
    }
  }
    .custom-logo-root .img-container {
  transform: translateX(var(--logo-shift-x, 10px));
}
  .custom-logo-root { overflow: visible; } /* مطمئن می‌شویم چیزی برش نشود */
.custom-logo-root { position: relative; overflow: visible; }

/* موقعیت کرسر نسبت به روت (نه نسبت به img-container) */
.custom-logo-root > .cursor {
  position: absolute;
  left: 100%;
  top: 100%;
  transform: translate(-50%, -50%) scale(var(--s,0.45));
  z-index: 9999;
  pointer-events: none;
}

`}</style>

      <div className="custom-logo-root" aria-hidden="false">
        <div className="img-container" aria-hidden="true">
          <img className="cir-big" src="https://charset99.storage.c2.liara.space/programs_gallery/big.png" alt="big" />
          <img className="cir-mid" src="https://charset99.storage.c2.liara.space/programs_gallery/mid.png" alt="mid" />
          <img className="cir-small" src="https://charset99.storage.c2.liara.space/programs_gallery/small.png" alt="small" />
                <img className="cursor" src="https://charset99.storage.c2.liara.space/programs_gallery/cursor.png" alt="cursor" />

        </div>
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
                <NavLink to="/jobs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}> کاریابی </NavLink>
              <NavLink to="/contact" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>تماس با ما</NavLink>
            </div>
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
            <NavLink to="/jobs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}> کاریابی </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>تماس با ما</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
