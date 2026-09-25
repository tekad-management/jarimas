"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dataWargaSchema, type DataWargaInput } from "@/lib/validators/warga-schema";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function submitDataWargaAction(
  input: DataWargaInput | unknown
): Promise<ActionResponse> {
  const parsed = dataWargaSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi data gagal. Silakan periksa kembali formulir Anda.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("data_warga")
      .insert({
        nama_anak: parsed.data.nama_anak,
        nik_anak: parsed.data.nik_anak,
        tempat_tanggal_lahir: parsed.data.tempat_tanggal_lahir,
        jenis_kelamin: parsed.data.jenis_kelamin,
        nama_wali: parsed.data.nama_wali,
        status_tinggal: parsed.data.status_tinggal,
        rt_wilayah_id: parsed.data.rt_wilayah_id,
        sekolah_id: parsed.data.sekolah_id ?? null,
        posyandu_id: parsed.data.posyandu_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error insert data_warga:", error);
      return {
        success: false,
        message: error.message || "Gagal menyimpan data warga ke database.",
      };
    }

    revalidatePath("/linimasa");

    return {
      success: true,
      message: "Data warga berhasil disimpan.",
      data,
    };
  } catch (err: unknown) {
    console.error("Error submitDataWargaAction:", err);
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan pada server saat menyimpan data.",
    };
  }
}
