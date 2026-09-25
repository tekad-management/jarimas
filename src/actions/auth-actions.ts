"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  registerSchema,
  type RegisterFormInput,
  hitungUsia,
} from "@/lib/validators/register-schema";

export type AuthActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export async function saveRegisteredUserProfile(
  userId: string,
  input: RegisterFormInput
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Data registrasi tidak valid. Silakan periksa kembali formulir.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const data = parsed.data;

    // Logika penentuan status kewargaan
    const status_kewargaan = data.domisili_sama_dengan_kk ? "PENDUDUK" : "PENDATANG";
    const calculatedAge = hitungUsia(data.tanggal_lahir);

    // Kecamatan, Kelurahan, RT, RW final untuk KK & Domisili
    const kk_kecamatan_id = data.kk_kabkota === "KOTA_TEGAL" ? data.kk_kecamatan_id : null;
    const kk_kelurahan_id = data.kk_kabkota === "KOTA_TEGAL" ? data.kk_kelurahan_id : null;
    const kk_rt = data.kk_kabkota === "KOTA_TEGAL" ? data.kk_rt || null : null;
    const kk_rw = data.kk_kabkota === "KOTA_TEGAL" ? data.kk_rw || null : null;

    const domisili_kecamatan_id = data.domisili_sama_dengan_kk
      ? kk_kecamatan_id
      : data.domisili_kecamatan_id || null;

    const domisili_kelurahan_id = data.domisili_sama_dengan_kk
      ? kk_kelurahan_id
      : data.domisili_kelurahan_id || null;

    const domisili_rt = data.domisili_sama_dengan_kk
      ? kk_rt
      : data.domisili_rt || null;

    const domisili_rw = data.domisili_sama_dengan_kk
      ? kk_rw
      : data.domisili_rw || null;

    const alamat_detail = data.alamat_detail?.trim() || null;

    // 1. Simpan ke tabel public.users
    const { error: userError } = await supabase.from("users").upsert({
      id: userId,
      email: data.email,
      username: data.username.toLowerCase(),
      nama_lengkap: data.nama_lengkap,
      tanggal_lahir: data.tanggal_lahir,
      usia: calculatedAge,
      kk_kabkota: data.kk_kabkota,
      kk_kecamatan_id,
      kk_kelurahan_id,
      kk_rt,
      kk_rw,
      domisili_sama_dengan_kk: data.domisili_sama_dengan_kk,
      domisili_kecamatan_id,
      domisili_kelurahan_id,
      domisili_rt,
      domisili_rw,
      alamat_detail,
      status_kewargaan,
      updated_at: new Date().toISOString(),
    });

    if (userError) {
      console.warn("Peringatan saat upsert tabel users:", userError);
    }

    // 2. Simpan role ke tabel public.user_grup_roles
    const { error: roleError } = await supabase.from("user_grup_roles").upsert({
      user_id: userId,
      role: "WARGA",
      created_at: new Date().toISOString(),
    });

    if (roleError) {
      console.warn("Peringatan saat upsert tabel user_grup_roles:", roleError);
    }

    return {
      success: true,
      message: "Profil pengguna dan role warga berhasil disimpan.",
    };
  } catch (err: unknown) {
    console.error("Error saveRegisteredUserProfile:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data profil.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
