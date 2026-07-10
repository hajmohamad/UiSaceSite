import React, { useState } from 'react';
import { TelegramIcon, InstagramIcon, DocumentDownloadIcon, XMarkIcon } from './icons';

const CenterActionCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const actionItems = [
    { href: 'https://t.me/uisace', icon: <TelegramIcon className="w-6 h-6" />, label: 'تلگرام' },
    { href: 'https://instagram.com/ui_sace', icon: <InstagramIcon className="w-6 h-6" />, label: 'اینستاگرام' },
    { href: 'https://storage.c2.liara.space/charset99/file/Brochure.pdf', icon: <DocumentDownloadIcon className="w-6 h-6" />, label: 'بروشور', download: true },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 p-4 animate-fadeIn">
        {/* دکمه بستن */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="بستن کارت"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* محتوای کارت */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">ارتباط با ما</h2>
        </div>

        <ul className="space-y-2">
          {actionItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                download={item.download}
                className="flex items-center gap-3 p-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-blue-600">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CenterActionCard;
