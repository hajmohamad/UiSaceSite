import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'uisace_pwa_dismissed';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // If user previously dismissed, don't nag immediately
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-blue-200 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-gray-900">
      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
        UI
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900">نصب اپلیکیشن انجمن علمی</h4>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          دسترسی آفلاین و سریع‌تر به رویدادها و دوره‌ها
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          نصب
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
          aria-label="بستن"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
