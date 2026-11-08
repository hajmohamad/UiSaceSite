import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { verifyCertificate } from '../services/api';
import type { Certificate } from '../types';

const CertificatesVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();

  const [query, setQuery] = useState(id || searchParams.get('q') || searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const certRef = useRef<HTMLDivElement>(null);

  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.trim();
    if (!q) return;

    try {
      setLoading(true);
      setError(null);
      setCertificates([]);
      setSelectedCert(null);

      const results = await verifyCertificate(q);
      if (results && results.length > 0) {
        setCertificates(results);
        setSelectedCert(results[0]);
      } else {
        setError('هیچ گواهینامه‌ای با مشخصات وارد شده یافت نشد.');
      }
    } catch (err: any) {
      setError(err?.message || 'گواهینامه‌ای با مشخصات وارد شده در سامانه ثبت نشده است.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = id || searchParams.get('q') || searchParams.get('code');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [id, searchParams]);

  // Generate offline Base64 QR Code when selectedCert changes
  useEffect(() => {
    if (selectedCert) {
      const verificationUrl = `${window.location.origin}/certificates/${encodeURIComponent(selectedCert.id)}`;
      QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => {
          console.error('Error generating QR code:', err);
        });
    } else {
      setQrCodeDataUrl('');
    }
  }, [selectedCert]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Direct PDF Download using dynamic import of html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!certRef.current || !selectedCert) return;

    try {
      setIsGeneratingPdf(true);

      // Dynamically load html2canvas and jspdf on demand
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Brief tick to ensure all images & DOM updates are settled
      await new Promise((resolve) => setTimeout(resolve, 150));

      const element = certRef.current;

      const canvas = await html2canvas(element, {
        scale: 2.5, // Crisp 250+ DPI for fast generation and sharp text
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('certificate-print-sheet');
          if (clonedEl) {
            clonedEl.style.width = '1122px';
            clonedEl.style.height = '793px';
            clonedEl.style.maxWidth = '1122px';
            clonedEl.style.maxHeight = '793px';
            clonedEl.style.minHeight = '793px';
            clonedEl.style.padding = '30px 48px';
            clonedEl.style.boxSizing = 'border-box';
            clonedEl.style.display = 'flex';
            clonedEl.style.flexDirection = 'column';
            clonedEl.style.justifyContent = 'space-between';
            clonedEl.style.boxShadow = 'none';
            clonedEl.style.borderRadius = '0';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      // Create A4 Landscape PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

      const safeName = (selectedCert.studentName || 'دانشجو').replace(/\s+/g, '_');
      const filename = `گواهینامه_${safeName}_${selectedCert.id}.pdf`;

      pdf.save(filename);
    } catch (err: any) {
      console.error('Failed to generate PDF, falling back to print:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  const verificationUrl = selectedCert
    ? `${window.location.origin}/certificates/${encodeURIComponent(selectedCert.id)}`
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header - Hidden in Print */}
      <div className="print:hidden space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <span>🎓</span>
            <span>سامانه ملی استعلام اصالت مدارک دیجیتال</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            استعلام اصالت گواهینامه
          </h1>
          <p className="text-sm text-gray-600">
            برای بررسی اصالت گواهینامه‌های صادره از سوی انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان، کد گواهینامه، کد ملی یا شماره دانشجویی را در کادر زیر وارد فرمایید.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="کد گواهی (مثلاً CERT-UI-1001)، کد ملی یا شماره دانشجویی..."
              className="w-full px-5 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <span>استعلام</span>
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">گواهینامه یافت نشد</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              <p className="text-xs text-gray-500 mt-2">
                در صورت وجود هرگونه مغایرت، می‌توانید با دبیرخانه انجمن علمی از طریق بخش تماس با ما ارتباط برقرار فرمایید.
              </p>
            </div>
          </div>
        )}

        {/* Multiple Certificates Selector */}
        {certificates.length > 1 && (
          <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              تعداد {certificates.length} مدرک یافت شد؛ مدرک مورد نظر را انتخاب نمایید:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {certificates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCert(c)}
                  className={`p-3 text-right rounded-lg border text-xs transition-all cursor-pointer ${
                    selectedCert?.id === c.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold">{c.programTitle}</p>
                  <p className="text-gray-500 font-mono mt-1 text-[11px]">{c.id} | {c.issueDate}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certificate Display Area */}
      {selectedCert && (
        <div className="mt-8 space-y-6">
          {/* Action Bar - Print / Copy Link - Hidden in Print */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              {selectedCert.status === 'valid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  اصالت گواهینامه معتبر و تایید شده است
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  ⚠️ این گواهینامه ابطال گردیده است
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(verificationUrl);
                  alert('لینک مستقیم استعلام اصالت کپی شد!');
                }}
                className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>کپی لینک استعلام</span>
              </button>

              <button
                onClick={handleNativePrint}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>پرینت</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>در حال ساخت PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>دانلود فایل PDF گواهینامه</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Embedded Print Style Tag to Guarantee 1-Page A4 Landscape */}
          <style>{`
            @page {
              size: A4 landscape !important;
              margin: 0 !important;
            }
            @media print {
              @page {
                size: A4 landscape !important;
                margin: 0 !important;
              }
              html, body {
                width: 297mm !important;
                height: 210mm !important;
                max-width: 297mm !important;
                max-height: 210mm !important;
                overflow: hidden !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              header, footer, nav, aside, .print\\:hidden, #root > div > header, #root > div > footer {
                display: none !important;
              }
              #certificate-print-sheet {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 297mm !important;
                height: 210mm !important;
                max-width: 297mm !important;
                max-height: 210mm !important;
                margin: 0 !important;
                padding: 8mm 12mm !important;
                box-sizing: border-box !important;
                border: 4px double #d97706 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                break-inside: avoid !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
            }
          `}</style>

          {/* Printable Official Certificate Sheet */}
          <div
            ref={certRef}
            id="certificate-print-sheet"
            className="certificate-print-sheet relative bg-white text-gray-900 p-6 sm:p-8 rounded-2xl border-8 border-double border-amber-600/40 shadow-2xl overflow-hidden flex flex-col justify-between print:m-0 print:p-6 print:border-4 print:shadow-none print:w-full print:max-w-none"
            style={{ minHeight: '560px', aspectRatio: '297 / 210' }}
          >
            {/* Watermark: Official University of Isfahan Logo in center */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center">
              <img
                src="/ui-logo.png"
                alt="واترمارک دانشگاه اصفهان"
                className="w-72 h-72 sm:w-80 sm:h-80 object-contain select-none"
                crossOrigin="anonymous"
              />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-600" />

            {/* Certificate Header */}
            <div className="text-center pb-3 print:pb-1.5 border-b-2 border-amber-600/20 relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                {/* Right Hierarchy */}
                <div className="text-right text-[11px] sm:text-xs text-gray-700 leading-snug font-semibold">
                  <p>جمهوری اسلامی ایران</p>
                  <p>وزارت علوم، تحقیقات و فناوری</p>
                  <p className="text-blue-900 font-bold">دانشگاه اصفهان</p>
                </div>

                {/* Center: Official University of Isfahan Logo */}
                <div className="flex flex-col items-center justify-center">
                  <img
                    src="/ui-logo.png"
                    alt="آرم رسمی دانشگاه اصفهان"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Left: Certificate Meta */}
                <div className="text-left text-[11px] sm:text-xs font-mono text-gray-600 leading-snug">
                  <p>شماره گواهی: <span className="font-bold text-gray-900">{selectedCert.id}</span></p>
                  <p>تاریخ صدور: <span className="font-bold text-gray-900">{selectedCert.issueDate}</span></p>
                  <p>اصالت: <span className="font-bold text-emerald-700">تایید شده دیجیتال</span></p>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-blue-950 mt-0.5">
                دانشکده مهندسی کامپیوتر دانشگاه اصفهان
              </h2>
              <p className="text-xs text-amber-800 font-bold mt-0.5">
                انجمن علمی دانشجویی مهندسی کامپیوتر (UI SACE)
              </p>

              <div className="mt-2 inline-block">
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-700 tracking-wider px-6 py-0.5 border-y border-amber-600/40">
                  گواهینامه پایان دوره آموزشی
                </h3>
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="py-3 sm:py-5 print:py-2 text-center space-y-2.5 sm:space-y-3.5 print:space-y-1.5 leading-relaxed relative my-auto">
              <p className="text-sm sm:text-base text-gray-700">
                بدین‌وسیله گواهی می‌شود که{' '}
                {selectedCert.titlePrefix ? (
                  <span className="font-bold text-gray-900">{selectedCert.titlePrefix}</span>
                ) : selectedCert.gender === 'female' ? (
                  <span className="font-bold text-gray-900">سرکار خانم</span>
                ) : selectedCert.gender === 'male' ? (
                  <span className="font-bold text-gray-900">جناب آقای</span>
                ) : null}
              </p>

              <h4 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight underline decoration-amber-500/50 underline-offset-8">
                {selectedCert.studentName}
              </h4>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-600">
                {selectedCert.studentNumber && (
                  <span>شماره دانشجویی: <strong className="font-mono text-gray-900">{selectedCert.studentNumber}</strong></span>
                )}
                {selectedCert.nationalId && (
                  <span>کد ملی: <strong className="font-mono text-gray-900">{selectedCert.nationalId}</strong></span>
                )}
              </div>

              {/* متن گواهینامه: یا متن اختصاصی شخصی‌سازی‌شده یا متن استاندارد پیش‌فرض */}
              {selectedCert.customText ? (
                <p className="text-xs sm:text-sm text-gray-800 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                  {selectedCert.customText
                    .replace(/\{name\}/g, selectedCert.studentName)
                    .replace(/\{program\}/g, selectedCert.programTitle)
                    .replace(/\{hours\}/g, String(selectedCert.durationHours || ''))
                    .replace(/\{date\}/g, selectedCert.programDate || '')
                    .replace(/\{grade\}/g, selectedCert.grade || '')}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-800 max-w-2xl mx-auto leading-relaxed">
                  دوره آموزشی تخصصی <strong className="text-blue-950 font-black text-sm sm:text-base">«{selectedCert.programTitle}»</strong>
                  {selectedCert.durationHours > 0 && (
                    <span> به مدت <strong className="font-bold text-blue-900">{selectedCert.durationHours} ساعت</strong></span>
                  )}
                  {selectedCert.programDate && (
                    <span> در تاریخ <strong className="font-bold text-gray-900">{selectedCert.programDate}</strong></span>
                  )}
                  <span> را با موفقیت به پایان رسانده و این گواهینامه به پاس تلاش و شایستگی ایشان اعطا می‌گردد.</span>
                </p>
              )}

              {selectedCert.grade && (
                <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-900">
                  درجه / رتبه ارزیابی: {selectedCert.grade}
                </div>
              )}
            </div>

            {/* Certificate Footer: QR Code & Signatures */}
            <div className="pt-3 print:pt-1.5 border-t-2 border-amber-600/20 grid grid-cols-3 items-end text-center text-xs relative">
              {/* Instructor */}
              <div className="space-y-1.5">
                <p className="font-bold text-gray-800 text-[11px] sm:text-xs">
                  {selectedCert.instructor ? selectedCert.instructor : 'استاد و مدرس دوره'}
                </p>
                <div className="pt-1.5 border-t border-dashed border-gray-400 max-w-[130px] mx-auto">
                  <span className="text-[10px] text-gray-500">امضای مدرس دوره</span>
                </div>
              </div>

              {/* QR Code Verifier (Offline base64 Data URL) */}
              <div className="flex flex-col items-center justify-center space-y-1">
                {qrCodeDataUrl ? (
                  <div className="p-1 bg-white border border-gray-300 rounded-lg shadow-xs">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR اصالت گواهینامه"
                      className="w-16 h-16 sm:w-20 sm:h-20"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400">
                    QR Code
                  </div>
                )}
                <span className="text-[9px] text-gray-500 font-mono">اسکن جهت استعلام اصالت</span>
              </div>

              {/* Association Head & Official Stamp */}
              <div className="space-y-1.5 relative">
                <div className="relative pt-1.5 border-t border-dashed border-gray-400 max-w-[140px] mx-auto">
                  {/* Official Blue Ink Stamp of UI SACE */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none opacity-85 w-24 h-24 -rotate-6">
                    <img
                      src="/sace-stamp.png"
                      alt="مهر رسمی انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان"
                      className="w-full h-full object-contain filter drop-shadow-xs"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="font-bold text-gray-800 text-[11px] sm:text-xs relative z-10">
                    {selectedCert.associationHead || 'دبیر انجمن علمی مهندسی کامپیوتر'}
                  </p>
                  <span className="text-[10px] text-gray-500 relative z-10">مهر و امضای انجمن</span>
                </div>
              </div>
            </div>

            {/* Revocation Banner if Revoked */}
            {selectedCert.status === 'revoked' && (
              <div className="absolute inset-0 bg-red-900/80 backdrop-blur-xs flex items-center justify-center p-6 text-center text-white">
                <div className="max-w-md bg-red-950 p-6 rounded-2xl border-2 border-red-500 shadow-2xl">
                  <p className="text-3xl font-black mb-2">⚠️ گواهینامه ابطال شده</p>
                  <p className="text-sm text-red-200">
                    این گواهینامه بنا به تصمیم کمیته اجرایی یا مغایرت اطلاعات در سامانه ابطال گردیده و فاقد هرگونه اعتبار قانونی می‌باشد.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="print:hidden text-center mt-12">
        <Link to="/" className="text-xs text-blue-600 hover:underline">
          بازگشت به صفحه اصلی انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان
        </Link>
      </div>
    </div>
  );
};

export default CertificatesVerifyPage;
