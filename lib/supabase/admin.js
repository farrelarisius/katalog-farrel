import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat koneksi Supabase sesi admin memakai @supabase/ssr dan cookie.
 * Memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY dari environment variable.
 * Digunakan untuk login, keluar, ganti password, dan kelola produk.
 */
export async function buatKlienSesiAdmin() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Method setAll dipanggil dari Server Component (bisa diabaikan jika middleware menangani refresh)
        }
      },
    },
  });
}

export const buatKlienAdmin = buatKlienSesiAdmin;

