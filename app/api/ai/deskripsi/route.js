import { NextResponse } from "next/server";
import { buatKlienSesiAdmin } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    // 1. Verifikasi bahwa request berasal dari admin yang sudah login
    const supabaseSesi = await buatKlienSesiAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabaseSesi.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda harus login sebagai admin." },
        { status: 401 }
      );
    }

    // 2. Baca payload data produk
    const body = await request.json();
    const {
      nama,
      kategori = "Umum",
      fitur = "Kualitas terbaik dan terjamin",
      tone = "Ramah, persuasif, dan profesional",
    } = body;

    if (!nama || !nama.trim()) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi untuk menghasilkan deskripsi." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Jika belum mengatur GEMINI_API_KEY di environment, berikan deskripsi template cerdas
    if (!apiKey) {
      const templateDeskripsi = `${nama.trim()} merupakan produk ${kategori.trim()} unggulan pilihan terbaik. Dibuat dengan bahan berkualitas dan perhatian penuh pada standar mutu, sangat cocok untuk melengkapi kebutuhan harian maupun pesanan spesial Anda.`;
      return NextResponse.json({
        sukses: true,
        deskripsi: templateDeskripsi,
        catatan: "Menggunakan template cerdas (atur GEMINI_API_KEY di .env.local untuk Gemini API aktif).",
      });
    }

    // 3. Panggil Gemini API (gemini-1.5-flash)
    const prompt = `Kamu adalah copywriter profesional untuk produk UMKM Indonesia.
Tuliskan deskripsi produk yang menarik, ringkas (2 sampai 3 kalimat), dan menggugah selera atau minat pembeli dalam bahasa Indonesia yang alami.

Data Produk:
- Nama Produk: ${nama}
- Kategori: ${kategori}
- Fitur / Keunggulan: ${fitur}
- Nada Bahasa (Tone of Voice): ${tone}

Hanya tuliskan teks deskripsi langsung tanpa format markdown (*), tanpa judul tambahan, dan tanpa tanda kutip pembuka/penutup.`;

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
    const hasilDeskripsi =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      `${nama} berkualitas tinggi dengan cita rasa dan keunggulan terbaik siap Anda nikmati.`;

    return NextResponse.json({
      sukses: true,
      deskripsi: hasilDeskripsi,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Gagal menghasilkan deskripsi AI." },
      { status: 500 }
    );
  }
}

