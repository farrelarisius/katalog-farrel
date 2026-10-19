"use client";

import { useState, useMemo } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function KatalogProduk({ daftarProduk = [] }) {
  const [cari, setCari] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  // Dapatkan daftar kategori unik dari data produk
  const listKategori = useMemo(() => {
    const kategoriSet = new Set(
      daftarProduk.map((p) => p.kategori).filter(Boolean)
    );
    return ["Semua", ...Array.from(kategoriSet)];
  }, [daftarProduk]);

  // Filter produk secara real-time berdasarkan kata kunci dan kategori
  const produkTersaring = useMemo(() => {
    const kataKunci = cari.toLowerCase().trim();
    return daftarProduk.filter((produk) => {
      const cocokKategori =
        kategoriAktif === "Semua" || produk.kategori === kategoriAktif;

      if (!cocokKategori) return false;
      if (!kataKunci) return true;

      const nama = produk.nama?.toLowerCase() || "";
      const deskripsi = produk.deskripsi?.toLowerCase() || "";
      const kategori = produk.kategori?.toLowerCase() || "";

      return (
        nama.includes(kataKunci) ||
        deskripsi.includes(kataKunci) ||
        kategori.includes(kataKunci)
      );
    });
  }, [daftarProduk, cari, kategoriAktif]);

  return (
    <div className="flex flex-col gap-6">
      {/* Kolom Pencarian dan Filter Kategori */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari produk..."
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pl-10 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <svg
            className="absolute left-3 top-3 h-4 w-4 text-teks-lembut"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {cari && (
            <button
              type="button"
              onClick={() => setCari("")}
              className="absolute right-3 top-2.5 text-xs text-teks-lembut hover:text-teks"
              title="Bersihkan pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tombol Kategori */}
        <div className="flex flex-wrap gap-2">
          {listKategori.map((kategori) => {
            const isActive = kategoriAktif === kategori;
            return (
              <button
                key={kategori}
                type="button"
                onClick={() => setKategoriAktif(kategori)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                }`}
              >
                {kategori}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Produk atau Status Kosong */}
      {produkTersaring.length === 0 ? (
        <div className="rounded-2xl border border-garis bg-permukaan py-12 text-center text-teks-lembut">
          <p className="font-semibold">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-sm">
            Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
          </p>
          {(cari || kategoriAktif !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                setKategoriAktif("Semua");
              }}
              className="mt-4 text-sm font-semibold text-utama underline underline-offset-4"
            >
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkTersaring.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

