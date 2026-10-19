"use server";

import { buatKlienSesiAdmin } from "@/lib/supabase/admin";
import { buatKlienServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get("email")?.toString().trim();
  const password = data?.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienSesiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message || "Gagal masuk. Silakan periksa kembali.",
    };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKlienSesiAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get("password_baru")?.toString();
  const konfirmasiPassword = data?.get("konfirmasi_password")?.toString();

  const supabase = await buatKlienSesiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda belum masuk atau sesi telah berakhir." };
  }

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return {
      error: error.message || "Gagal mengganti password. Silakan coba lagi.",
    };
  }

  return {
    sukses: true,
    pesan: "Password berhasil diganti.",
  };
}

export async function tambahProduk(formData) {
  const supabaseSesi = await buatKlienSesiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabaseSesi.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga produk harus berupa angka dan tidak boleh negatif.");
  }

  const supabase = buatKlienServer();
  const { error } = await supabase.from("produk").insert([
    {
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    },
  ]);

  if (error) {
    throw new Error(`Gagal menyimpan produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(idOrFormData, maybeFormData) {
  const supabaseSesi = await buatKlienSesiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabaseSesi.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  let id;
  let formData;

  if (maybeFormData instanceof FormData) {
    id = idOrFormData;
    formData = maybeFormData;
  } else {
    formData = idOrFormData;
    id = formData.get("id");
  }

  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga produk harus berupa angka dan tidak boleh negatif.");
  }

  const supabase = buatKlienServer();
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  revalidatePath(`/admin/produk/${id}/ubah`);
  redirect("/admin");
}

export async function hapusProduk(idOrFormData) {
  const supabaseSesi = await buatKlienSesiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabaseSesi.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const id = idOrFormData instanceof FormData ? idOrFormData.get("id") : idOrFormData;
  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const supabase = buatKlienServer();
  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function buatDeskripsiProdukAI({ nama, kategori, fitur, tone }) {
  const supabaseSesi = await buatKlienSesiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabaseSesi.auth.getUser();

  if (userError || !user) {
    throw new Error("Akses ditolak: Anda harus login sebagai admin.");
  }

  if (!nama || !nama.trim()) {
    throw new Error("Nama produk wajib diisi untuk membuat deskripsi AI.");
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `${nama.trim()} merupakan produk ${kategori || "unggulan"} pilihan terbaik. Dibuat dengan bahan berkualitas dan perhatian penuh pada standar mutu, sangat cocok untuk melengkapi kebutuhan harian maupun pesanan spesial Anda.`;
  }

  const prompt = `Kamu adalah copywriter profesional untuk produk UMKM Indonesia.
Tuliskan deskripsi produk yang menarik, ringkas (2 sampai 3 kalimat), dan persuasif dalam bahasa Indonesia yang alami.

Data Produk:
- Nama Produk: ${nama}
- Kategori: ${kategori || "Umum"}
- Fitur / Keunggulan: ${fitur || "Kualitas terjamin, buatan lokal"}
- Nada Bahasa (Tone): ${tone || "Ramah dan profesional"}

Hanya tuliskan teks deskripsi langsung tanpa tanda bintang (*), tanpa judul tambahan, dan tanpa tanda kutip.`;

  const apiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!apiResponse.ok) {
    const errText = await apiResponse.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await apiResponse.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    `${nama} pilihan terbaik dengan mutu dan kualitas terpercaya.`
  );
}

