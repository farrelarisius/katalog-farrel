import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKlienSesiAdmin } from "@/lib/supabase/admin";
import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  const supabaseSesi = await buatKlienSesiAdmin();

  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Ambil data produk menggunakan koneksi server (SUPABASE_SECRET_KEY)
  // agar data yang tampil di admin selalu sesuai dan lengkap dengan database Supabase
  const supabase = buatKlienServer();
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("id", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {error ? (
        <div className="rounded-lg border border-garis bg-permukaan p-4 text-sm text-bahaya">
          Gagal memuat produk: {error.message}
        </div>
      ) : !daftarProduk || daftarProduk.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
