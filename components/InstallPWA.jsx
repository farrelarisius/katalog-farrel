"use client";

import { useState, useEffect } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [bisaInstall, setBisaInstall] = useState(false);

  useEffect(() => {
    // Daftarkan Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("PWA Service Worker terdaftar:", registration.scope);
        })
        .catch((err) => {
          console.error("Gagal mendaftarkan Service Worker:", err);
        });
    }

    // Dengarkan event sebelum install prompt muncul
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setBisaInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setBisaInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!bisaInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-garis bg-latar p-4 shadow-xl sm:left-auto sm:right-6">
      <div className="flex items-center gap-3">
        <img
          src="/icons/icon-192.png"
          alt="App Icon"
          className="h-12 w-12 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold leading-tight">Pasang Aplikasi</h4>
          <p className="text-xs text-teks-lembut">
            Akses katalog lebih cepat langsung dari layar HP Anda.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex-1 rounded-lg bg-utama px-3 py-2 text-xs font-bold text-white transition hover:bg-utama-gelap"
        >
          Pasang Sekarang
        </button>
        <button
          type="button"
          onClick={() => setBisaInstall(false)}
          className="rounded-lg border border-garis px-3 py-2 text-xs font-semibold text-teks-lembut hover:bg-permukaan"
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );
}

