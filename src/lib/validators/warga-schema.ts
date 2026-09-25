import { z } from "zod";

export const dataWargaSchema = z.object({
  nama_anak: z.string().min(1, "Nama anak wajib diisi"),
  nik_anak: z
    .string()
    .min(1, "NIK anak wajib diisi")
    .regex(/^\d{16}$/, "NIK anak harus berupa 16 digit angka"),
  tempat_tanggal_lahir: z.string().min(1, "Tempat dan tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"], {
    error: "Pilih jenis kelamin L (Laki-laki) atau P (Perempuan)",
  }),
  nama_wali: z.string().min(1, "Nama orang tua / wali wajib diisi"),
  status_tinggal: z.string().min(1, "Status tinggal wajib diisi"),
  rt_wilayah_id: z.string().min(1, "Wilayah RT wajib dipilih"),
  sekolah_id: z.string().nullable().optional(),
  posyandu_id: z.string().nullable().optional(),
});

export type DataWargaInput = z.infer<typeof dataWargaSchema>;
