"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiProdukAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Terintegrasi dengan Gemini AI untuk generate deskripsi otomatis (US-14).
export default function FormProduk({ produk = {}, labelTombol, action, error }) {
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState("");

  const handleGenerateAI = async () => {
    setPesanAI("");
    const form = document.querySelector("#form-produk");
    const nama = form?.querySelector('input[name="nama"]')?.value?.trim();
    const kategori = form?.querySelector('input[name="kategori"]')?.value?.trim();

    if (!nama) {
      setPesanAI("Mohon isi 'Nama produk' terlebih dahulu.");
      return;
    }

    try {
      setLoadingAI(true);
      const hasil = await buatDeskripsiProdukAI({ nama, kategori });
      setDeskripsi(hasil);
      setPesanAI("Deskripsi berhasil dibuat dengan AI!");
    } catch (err) {
      setPesanAI(err.message || "Gagal membuat deskripsi AI.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <form id="form-produk" action={action} className="flex max-w-xl flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {error}
        </div>
      )}
      {produk.id && <input type="hidden" name="id" value={produk.id} />}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Deskripsi</label>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-utama hover:text-utama-gelap disabled:opacity-50"
          >
            {loadingAI ? "⏳ Menulis deskripsi..." : "✨ Buat dengan AI (Gemini)"}
          </button>
        </div>

        {pesanAI && (
          <p className="text-xs text-teks-lembut italic">{pesanAI}</p>
        )}

        <textarea
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Tulis penjelasan produk atau klik tombol 'Buat dengan AI' di atas..."
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
