"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function PemesananProduk({ produk }) {
  const [kuantitas, setKuantitas] = useState(1);

  // Ambil opsi varian dari data produk jika ada (format JSON array / koma), atau gunakan varian umum
  const daftarVarian = (() => {
    if (Array.isArray(produk.varian) && produk.varian.length > 0) {
      return produk.varian;
    }
    if (typeof produk.varian === "string") {
      try {
        const parsed = JSON.parse(produk.varian);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return produk.varian.split(",").map((v) => v.trim()).filter(Boolean);
      }
    }
    // Varian bawaan yang relevan berdasarkan kategori produk
    const kat = produk.kategori?.toLowerCase() || "";
    if (kat.includes("minum") || kat.includes("kopi")) {
      return ["Normal / Dingin", "Less Sugar", "Hangat"];
    }
    if (kat.includes("camilan") || kat.includes("bumbu") || kat.includes("snack")) {
      return ["Original", "Pedas Sedang", "Ekstra Pedas"];
    }
    if (kat.includes("kain") || kat.includes("baju") || kat.includes("batik")) {
      return ["Ukuran Standar", "Ukuran Jumbo"];
    }
    if (kat.includes("keyboard") || kat.includes("gaming")) {
      return ["Red Switch", "Brown Switch", "Blue Switch"];
    }
    return ["Standar / Original"];
  })();

  const [varianAktif, setVarianAktif] = useState(daftarVarian[0]);

  // Hitung total harga dinamis
  const hargaSatuan = Number(produk.harga) || 0;
  const totalHarga = hargaSatuan * kuantitas;

  // Format pesan WhatsApp dinamis
  const nomor = toko.nomorWhatsApp?.replace(/\D/g, "") || toko.nomorWhatsApp;
  const teksPesan = `Halo, saya ingin memesan:
- *Produk:* ${produk.nama}
- *Varian:* ${varianAktif}
- *Jumlah:* ${kuantitas}
- *Total:* ${formatRupiah(totalHarga)}

Mohon info ketersediaan stok dan cara pembayarannya. Terima kasih!`;

  const waUrl = `https://wa.me/${nomor}?text=${encodeURIComponent(teksPesan)}`;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-garis bg-permukaan/50 p-5">
      {/* Pemilih Varian */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-teks-lembut">
          Pilih Varian
        </label>
        <div className="flex flex-wrap gap-2">
          {daftarVarian.map((v) => {
            const namaVarian = typeof v === "object" ? v.nama : v;
            const isSelected = varianAktif === namaVarian;
            return (
              <button
                key={namaVarian}
                type="button"
                onClick={() => setVarianAktif(namaVarian)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-utama text-white shadow-sm"
                    : "border border-garis bg-latar text-teks hover:border-utama"
                }`}
              >
                {namaVarian}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pengatur Kuantitas & Subtotal */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-garis pt-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-teks-lembut">
            Jumlah Pesanan
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setKuantitas((k) => Math.max(1, k - 1))}
              disabled={kuantitas <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar font-bold text-teks transition hover:bg-permukaan disabled:opacity-40"
            >
              -
            </button>
            <span className="min-w-8 text-center font-bold text-base">
              {kuantitas}
            </span>
            <button
              type="button"
              onClick={() => setKuantitas((k) => k + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar font-bold text-teks transition hover:bg-permukaan"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Harga Dinamis */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-teks-lembut">Subtotal</span>
          <span className="text-xl font-extrabold text-harga">
            {formatRupiah(totalHarga)}
          </span>
        </div>
      </div>

      {/* Tombol Pemesanan via WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-utama px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-utama-gelap"
      >
        <svg
          className="h-5 w-5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        Pesan via WhatsApp Sekarang
      </a>
    </div>
  );
}

