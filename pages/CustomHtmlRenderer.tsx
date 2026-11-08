import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getCustomPageBySlug } from '../services/api';
import type { CustomPage } from '../types';

const CustomHtmlRenderer: React.FC = () => {
  const location = useLocation();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const slug = location.pathname.replace(/^\/+|\/+$/g, '');
        if (!slug) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = await getCustomPageBySlug(slug);
        if (!isMounted) return;

        if (data && data.isActive) {
          setPage(data);
          document.title = `${data.title} | انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان`;
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading custom page:', err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">در حال بارگذاری صفحه...</p>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black mb-6 shadow-sm border border-blue-100">
          ۴۰۴
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
          صفحه مورد نظر یافت نشد
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          متأسفانه صفحه‌ای با این آدرس پیدا نشد. ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه موقتاً غیرفعال شده باشد.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm"
          >
            بازگشت به صفحه اصلی
          </Link>
          <Link
            to="/programs"
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
          >
            مشاهده رویدادها
          </Link>
        </div>
      </div>
    );
  }

  // Standalone full-screen rendering (no header/footer)
  if (!page.withLayout) {
    return (
      <iframe
        srcDoc={page.htmlContent}
        title={page.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        className="fixed inset-0 w-screen h-screen border-0 z-50 bg-white"
      />
    );
  }

  // Render inside normal site layout
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-4 sm:p-8 my-4">
      <iframe
        srcDoc={page.htmlContent}
        title={page.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        className="w-full min-h-[80vh] border-0 rounded-xl"
      />
    </div>
  );
};

export default CustomHtmlRenderer;
