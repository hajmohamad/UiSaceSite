import React, { useEffect, useState, useMemo } from 'react';
import {
  getAdminMediaLinks,
  replaceAdminMediaLinks,
} from '../../services/adminApi';
import type { MediaLinkItem, MediaStats, ReplaceMediaResponse } from '../../types';

const AdminMediaLinks: React.FC = () => {
  const [linksText, setLinksText] = useState('');
  const [links, setLinks] = useState<MediaLinkItem[]>([]);
  const [stats, setStats] = useState<MediaStats>({
    totalOccurrences: 0,
    uniqueLinks: 0,
    storageLinks: 0,
    localLinks: 0,
  });
  const [loading, setLoading] = useState(true);

  // Active Tab: 'raw' | 'lineByLine' | 'domainReplace' | 'table'
  const [activeTab, setActiveTab] = useState<'raw' | 'lineByLine' | 'domainReplace' | 'table'>('lineByLine');

  // Search filter
  const [search, setSearch] = useState('');

  // Line-by-line replacement state
  const [editedNewText, setEditedNewText] = useState('');
  const [updateStaticFiles, setUpdateStaticFiles] = useState(true);
  const [replacing, setReplacing] = useState(false);

  // Domain search & replace state
  const [findDomain, setFindDomain] = useState('');
  const [replaceDomain, setReplaceDomain] = useState('');

  // Confirmation & Results Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'line_by_line' | 'find_replace'>('line_by_line');
  const [lastResult, setLastResult] = useState<ReplaceMediaResponse | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await getAdminMediaLinks();
      setLinks(res.links || []);
      setLinksText(res.linksText || '');
      setEditedNewText(res.linksText || '');
      setStats(res.stats || {
        totalOccurrences: 0,
        uniqueLinks: 0,
        storageLinks: 0,
        localLinks: 0,
      });
    } catch (err: any) {
      showToast(err?.message || 'خطا در اسکن و دریافت لینک‌های مدیا');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Compute line-by-line differences
  const diffSummary = useMemo(() => {
    const origLines = linksText.split('\n').filter((l) => l.trim().length > 0);
    const newLines = editedNewText.split('\n').filter((l) => l.trim().length > 0);

    const changes: { index: number; oldUrl: string; newUrl: string }[] = [];
    const min = Math.min(origLines.length, newLines.length);

    for (let i = 0; i < min; i++) {
      const oldU = origLines[i].trim();
      const newU = newLines[i].trim();
      if (oldU !== newU && newU !== '') {
        changes.push({ index: i + 1, oldUrl: oldU, newUrl: newU });
      }
    }

    return {
      totalOriginal: origLines.length,
      totalNew: newLines.length,
      changedCount: changes.length,
      changes,
    };
  }, [linksText, editedNewText]);

  // Compute domain replace matches
  const domainMatchesCount = useMemo(() => {
    if (!findDomain.trim()) return 0;
    return links.filter((l) => l.url.includes(findDomain.trim())).length;
  }, [findDomain, links]);

  // Filtered links for table / text
  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter(
      (l) => l.url.toLowerCase().includes(q) || l.sources.some((s) => s.toLowerCase().includes(q))
    );
  }, [links, search]);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(linksText);
      setCopiedAll(true);
      showToast('تمام لینک‌ها در کلیپ‌بورد کپی شد (هر خط یک لینک)');
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      prompt('کپی لینک‌ها:', linksText);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([linksText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uisace-media-links-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('فایل متنی لینک‌ها دانلود شد');
  };

  const executeReplacement = async () => {
    try {
      setReplacing(true);
      let payload: any = {
        updateStaticFiles,
      };

      if (confirmMode === 'line_by_line') {
        payload = {
          ...payload,
          mode: 'line_by_line',
          originalText: linksText,
          newText: editedNewText,
        };
      } else {
        payload = {
          ...payload,
          mode: 'find_replace',
          find: findDomain.trim(),
          replace: replaceDomain.trim(),
        };
      }

      const res = await replaceAdminMediaLinks(payload);
      setLastResult(res);
      setConfirmModalOpen(false);
      showToast(`جایگزینی موفق: ${res.replacedCount} رکورد با موفقیت به‌روزرسانی شد`);
      // Reload links
      await fetchLinks();
    } catch (err: any) {
      alert(err?.message || 'خطا در انجام عملیات جایگزینی');
    } finally {
      setReplacing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            استخراج و جایگزینی سراسری لینک‌های مدیا
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            دریافت تمامی آدرس‌های عکس، ویدیو، فایل‌های استورج و داخلی (هر خط یک لینک) و جایگزینی خط‌به‌خط یا دامنه‌ای در کل سایت
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLinks}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-600/50"
            title="اسکن مجدد"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            اسکن مجدد
          </button>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copiedAll ? 'کپی شد!' : 'کپی همه لینک‌ها'}
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            دانلود .txt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 text-xs">کل ارجاعات مدیا</span>
          <p className="text-2xl font-black text-white mt-1">{stats.totalOccurrences}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-blue-400 text-xs">لینک‌های یکتا (Unique)</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{stats.uniqueLinks}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-purple-400 text-xs">لینک‌های هاست و استورج</span>
          <p className="text-2xl font-black text-purple-400 mt-1">{stats.storageLinks}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <span className="text-emerald-400 text-xs">لینک‌های داخلی (/uploads)</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.localLinks}</p>
        </div>
      </div>

      {/* Last Result Banner */}
      {lastResult && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-start justify-between gap-3 text-emerald-200">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-emerald-300">نتیجه عملیات اخیر:</h4>
            <p className="text-xs">
              تعداد <span className="font-bold underline">{lastResult.replacedCount}</span> مورد با موفقیت جایگزین شد.
            </p>
            {lastResult.affected && (
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                {Object.entries(lastResult.affected).map(([tbl, cnt]) => (
                  <span key={tbl} className="bg-emerald-900/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                    {tbl}: {cnt} مورد
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setLastResult(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-700/80 gap-2 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab('lineByLine')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lineByLine'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          جایگزینی خط‌به‌خط لینک‌ها
          {diffSummary.changedCount > 0 && (
            <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {diffSummary.changedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('domainReplace')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'domainReplace'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          جایگزینی سراسری دامنه / متن
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'raw'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          مشاهده لیست خام (هر خط یک لینک)
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'table'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          جدول جزئیات لینک‌ها ({links.length})
        </button>
      </div>

      {/* Tab 1: Line-by-Line Replacement */}
      {activeTab === 'lineByLine' && (
        <div className="space-y-5 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="font-bold text-white text-base">جایگزینی خط‌به‌خط لینک‌ها</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                لیست لینک‌های قبلی در سمت چپ قرار دارد. در کادر سمت راست، لینک‌های جدید را در همان شماره خط بنویسید یا لیست جدید را به صورت کامل پیست کنید.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs bg-slate-700/60 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-600/50">
                تغییر یافته: <b className="text-amber-400">{diffSummary.changedCount}</b> از {diffSummary.totalOriginal} خط
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Original Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  لینک‌های فعلی در سایت ({diffSummary.totalOriginal} خط)
                </span>
                <button
                  onClick={handleCopyAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  کپی همه
                </button>
              </div>
              <textarea
                readOnly
                dir="ltr"
                rows={16}
                value={linksText}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-slate-300 font-mono text-xs focus:outline-none select-all leading-relaxed whitespace-pre"
              />
            </div>

            {/* Right: New Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  لینک‌های جدید (ویرایش یا پیست کنید) ({diffSummary.totalNew} خط)
                </span>
                <button
                  onClick={() => setEditedNewText(linksText)}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  بازنشانی به حالت اولیه
                </button>
              </div>
              <textarea
                dir="ltr"
                rows={16}
                value={editedNewText}
                onChange={(e) => setEditedNewText(e.target.value)}
                placeholder="لینک‌های جدید را در این کادر خط به خط وارد نمایید..."
                className="w-full bg-slate-900 border border-blue-500/40 rounded-2xl p-4 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed whitespace-pre"
              />
            </div>
          </div>

          {/* Diff preview box */}
          {diffSummary.changedCount > 0 && (
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-amber-300 font-bold text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  پیش‌نمایش تغییرات آماده برای اعمال ({diffSummary.changedCount} لینک تغییر می‌یابد):
                </h4>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {diffSummary.changes.map((ch) => (
                  <div
                    key={ch.index}
                    className="p-2.5 bg-slate-800/80 rounded-xl text-xs font-mono dir-ltr flex flex-col gap-1 border border-slate-700/60"
                  >
                    <div className="text-rose-400 line-through truncate flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">L{ch.index}:</span>
                      {ch.oldUrl}
                    </div>
                    <div className="text-emerald-400 truncate flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">L{ch.index}:</span>
                      {ch.newUrl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-700/60">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={updateStaticFiles}
                onChange={(e) => setUpdateStaticFiles(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
              />
              <span>همگام‌سازی و به‌روزرسانی فایل‌های constants.ts، arvanconstan.ts و seeds</span>
            </label>

            <button
              disabled={diffSummary.changedCount === 0 || replacing}
              onClick={() => {
                setConfirmMode('line_by_line');
                setConfirmModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              اعمال جایگزینی خط‌به‌خط ({diffSummary.changedCount} مورد)
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Domain / Global Replace */}
      {activeTab === 'domainReplace' && (
        <div className="space-y-6 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/70">
          <div>
            <h3 className="font-bold text-white text-base">جایگزینی سراسری دامنه یا مسیر استورج</h3>
            <p className="text-slate-400 text-xs mt-1">
              اگر فایل‌های خود را به باکت، CDN یا هاست جدیدی منتقل کرده‌اید، می‌توانید آدرس دامنه قدیمی را با دامنه جدید در تمام سایت جایگزین کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                متن یا دامنه قدیمی (جستجو) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="مثال: http://storage.ghavishomard.ir"
                value={findDomain}
                onChange={(e) => setFindDomain(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-rose-300 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                تعداد لینک‌های منطبق در سایت: <b className="text-amber-400">{domainMatchesCount}</b> مورد
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                متن یا دامنه جدید (جایگزین) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="مثال: https://storage.c2.liara.space/charset99"
                value={replaceDomain}
                onChange={(e) => setReplaceDomain(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                تمام موارد بالا به این آدرس تبدیل خواهند شد.
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-2">
            <span className="text-xs text-slate-400 font-bold block">پیش‌تنظیم‌های متداول برای راحتی شما:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFindDomain('http://storage.ghavishomard.ir');
                  setReplaceDomain('https://storage.c2.liara.space/charset99');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-blue-500/30 transition-colors"
              >
                انتقال از ghavishomard به Liara Space
              </button>
              <button
                type="button"
                onClick={() => {
                  setFindDomain('https://storage.c2.liara.space/charset99');
                  setReplaceDomain('http://storage.ghavishomard.ir');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-blue-500/30 transition-colors"
              >
                انتقال از Liara Space به ghavishomard
              </button>
              <button
                type="button"
                onClick={() => {
                  setFindDomain('http://');
                  setReplaceDomain('https://');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
              >
                ارتقای تمام لینک‌های http به https
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-700/60">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={updateStaticFiles}
                onChange={(e) => setUpdateStaticFiles(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
              />
              <span>همگام‌سازی و به‌روزرسانی فایل‌های constants.ts، arvanconstan.ts و seeds</span>
            </label>

            <button
              disabled={!findDomain.trim() || domainMatchesCount === 0 || replacing}
              onClick={() => {
                setConfirmMode('find_replace');
                setConfirmModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              جایگزینی سراسری ({domainMatchesCount} مورد منطبق)
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Raw Text List */}
      {activeTab === 'raw' && (
        <div className="space-y-4 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/70">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="font-bold text-white text-base">لیست کامل تمام لینک‌ها (هر خط یک لینک)</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                مجموعاً {links.length} لینک یکتا استخراج شده است. می‌توانید کل متن را کپی یا دانلود کنید.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                {copiedAll ? 'کپی شد!' : 'کپی کل متن'}
              </button>
              <button
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-all"
              >
                دانلود TXT
              </button>
            </div>
          </div>

          <textarea
            readOnly
            dir="ltr"
            rows={20}
            value={linksText}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-emerald-400 font-mono text-xs focus:outline-none select-all leading-relaxed whitespace-pre"
          />
        </div>
      )}

      {/* Tab 4: Detailed Table */}
      {activeTab === 'table' && (
        <div className="space-y-4 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-white text-base">جدول مشخصات و محل استفاده رسانه‌ها</h3>
            <input
              type="text"
              placeholder="فیلتر لینک‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] border-b border-slate-700/60">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">پیش‌نمایش</th>
                  <th className="p-3">آدرس مدیا (URL)</th>
                  <th className="p-3">نوع</th>
                  <th className="p-3">تعداد تکرار</th>
                  <th className="p-3">محل استفاده در سایت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredLinks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      {item.url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                        <img
                          src={item.url}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-slate-900"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-[10px]">
                          فایل
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono dir-ltr text-left text-blue-400 max-w-md truncate">
                      <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {item.url}
                      </a>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          item.isLocal
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {item.isLocal ? 'محلی' : 'استورج'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{item.occurrences}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg">تأیید عملیات جایگزینی لینک‌ها</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                {confirmMode === 'line_by_line' ? (
                  <>
                    شما در حال جایگزینی <span className="font-bold text-amber-400">{diffSummary.changedCount}</span> لینک مدیا در پایگاه داده و فایل‌های پروژه هستید.
                  </>
                ) : (
                  <>
                    شما در حال جایگزینی عبارت «<span className="font-mono text-rose-300 dir-ltr">{findDomain}</span>» با «<span className="font-mono text-emerald-300 dir-ltr">{replaceDomain}</span>» در تمام پایگاه داده هستید.
                  </>
                )}
              </p>
              {updateStaticFiles && (
                <p className="text-blue-300 text-xs mt-2 bg-blue-900/30 p-2.5 rounded-xl border border-blue-500/30">
                  فایل‌های سورس‌کد (constants.ts و seeds) نیز به صورت خودکار با لینک‌های جدید همگام خواهند شد.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-5 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-600 transition-all"
              >
                انصراف
              </button>
              <button
                onClick={executeReplacement}
                disabled={replacing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
              >
                {replacing ? 'در حال اعمال جایگزینی...' : 'بله، جایگزینی انجام شود'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaLinks;
