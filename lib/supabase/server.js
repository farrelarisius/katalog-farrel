import { createClient } from "@supabase/supabase-js";

/**
 * Membuat koneksi Supabase untuk server (pengunjung).
 * Memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable.
 * Hanya boleh dijalankan di server (Server Component, Server Action, atau Route Handler).
 */
export function buatKlienServer() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = buatKlienServer;

