import { useEffect } from 'react';

interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_TITLE = 'انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان (UI SACE)';
const DEFAULT_DESC =
  'وب‌سایت رسمی انجمن علمی دانشجویی مهندسی کامپیوتر دانشگاه اصفهان - اطلاعیه‌ها، ثبت‌نام کارگاه‌ها، استعلام گواهینامه‌ها و فرصت‌های شغلی';
const DEFAULT_IMAGE = 'http://storage.ghavishomard.ir/programs_gallery/big.png';

export function usePageMeta({
  title,
  description,
  image,
  url,
  type = 'website',
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان` : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESC;
    const metaImg = image || DEFAULT_IMAGE;
    const currentUrl = url || window.location.href;

    // Document Title
    document.title = fullTitle;

    // Helper to set or create a meta tag
    const setMeta = (attribute: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard Meta
    setMeta('name', 'description', metaDesc);

    // OpenGraph Meta (Facebook, Telegram, Bale, Eitaa, LinkedIn)
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDesc);
    setMeta('property', 'og:image', metaImg);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان');
    setMeta('property', 'og:locale', 'fa_IR');

    // Twitter / X Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', metaDesc);
    setMeta('name', 'twitter:image', metaImg);

    return () => {
      // Revert to defaults on unmount if needed
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, image, url, type]);
}

export default usePageMeta;
