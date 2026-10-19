import { notFound, redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKlienSesiAdmin } from "@/lib/supabase/admin";
import { buatKlienServer } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const supabaseSesi = await buatKlienSesiAdmin();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const supabase = buatKlienServer();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        action={ubahProduk}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
