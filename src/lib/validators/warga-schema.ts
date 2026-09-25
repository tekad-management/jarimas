import { z } from "zod";

export const dataWargaSchema = z.object({
  nama_anak: z.string().min(1, "Nama anak wajib diisi"),
  tempat_tanggal_lahir: z.string().min(1, "Tempat dan tanggal lahir wajib diisi"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin wajib diisi"),
  nama_wali: z.string().min(1, "Nama orang tua / wali wajib diisi"),
  status_tinggal: z.string().min(1, "Status tinggal wajib diisi"),
  rt_wilayah_id: z.string().min(1, "Wilayah RT wajib diisi/dipilih"),
  sekolah_id: z.string().optional().nullable(),
  posyandu_id: z.string().optional().nullable(),
});

export type DataWargaInput = z.infer<typeof dataWargaSchema>;
