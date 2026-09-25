import * as z from "zod";

// Helper fungsi hitung usia berdasarkan tanggal lahir
export function hitungUsia(tanggalLahirStr: string | Date | undefined | null): number | null {
  if (!tanggalLahirStr) return null;
  const birthDate = typeof tanggalLahirStr === "string" ? new Date(tanggalLahirStr) : tanggalLahirStr;
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

// 1. Zod Validation Schema Komprehensif
export const registerSchema = z
  .object({
    nama_lengkap: z
      .string()
      .min(3, { message: "Nama lengkap minimal 3 karakter" })
      .max(100, { message: "Nama lengkap maksimal 100 karakter" }),
    
    username: z
      .string()
      .min(3, { message: "Nama pengguna (username) minimal 3 karakter" })
      .max(30, { message: "Nama pengguna maksimal 30 karakter" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username hanya boleh berupa huruf, angka, dan garis bawah (_)",
      }),

    email: z
      .string()
      .min(1, { message: "Alamat email wajib diisi" })
      .email({ message: "Format email tidak valid" }),

    password: z
      .string()
      .min(6, { message: "Kata sandi minimal 6 karakter" }),

    tanggal_lahir: z
      .string()
      .min(1, { message: "Tanggal lahir wajib diisi" })
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      }, {
        message: "Tanggal lahir tidak valid atau melebihi hari ini",
      }),

    kk_kabkota: z.enum(["KOTA_TEGAL", "LUAR_KOTA_TEGAL"]),

    kk_kecamatan_id: z.string().optional(),
    kk_kelurahan_id: z.string().optional(),
    kk_rt: z.string().optional(),
    kk_rw: z.string().optional(),

    domisili_sama_dengan_kk: z.boolean().default(true),

    domisili_kecamatan_id: z.string().optional(),
    domisili_kelurahan_id: z.string().optional(),
    domisili_rt: z.string().optional(),
    domisili_rw: z.string().optional(),

    alamat_detail: z
      .string()
      .max(255, { message: "Alamat detail maksimal 255 karakter" })
      .refine((val) => !val || val.trim().length >= 3, {
        message: "Alamat detail minimal 3 karakter jika diisi",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validasi jika KK di Kota Tegal
    if (data.kk_kabkota === "KOTA_TEGAL") {
      if (!data.kk_kecamatan_id || data.kk_kecamatan_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kecamatan sesuai KK wajib dipilih",
          path: ["kk_kecamatan_id"],
        });
      }
      if (!data.kk_kelurahan_id || data.kk_kelurahan_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kelurahan sesuai KK wajib dipilih",
          path: ["kk_kelurahan_id"],
        });
      }
    }

    // Validasi jika Domisili berbeda dengan KK
    if (data.domisili_sama_dengan_kk === false) {
      if (!data.domisili_kecamatan_id || data.domisili_kecamatan_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kecamatan domisili Kota Tegal wajib dipilih",
          path: ["domisili_kecamatan_id"],
        });
      }
      if (!data.domisili_kelurahan_id || data.domisili_kelurahan_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kelurahan domisili Kota Tegal wajib dipilih",
          path: ["domisili_kelurahan_id"],
        });
      }
    }
  });

export type RegisterFormInput = z.infer<typeof registerSchema>;

// Data Master Wilayah Kota Tegal (4 Kecamatan & 27 Kelurahan)
export const MASTER_KECAMATAN_TEGAL = [
  { id: "kec-tb", kode: "33.76.01", nama: "Tegal Barat" },
  { id: "kec-tt", kode: "33.76.02", nama: "Tegal Timur" },
  { id: "kec-ts", kode: "33.76.03", nama: "Tegal Selatan" },
  { id: "kec-mg", kode: "33.76.04", nama: "Margadana" },
];

export const MASTER_KELURAHAN_TEGAL: Record<string, { id: string; kode: string; nama: string }[]> = {
  "kec-tb": [
    { id: "kel-tegalsari", kode: "33.76.01.1001", nama: "Tegalsari" },
    { id: "kel-kraton", kode: "33.76.01.1002", nama: "Kraton" },
    { id: "kel-kemandungan", kode: "33.76.01.1003", nama: "Kemandungan" },
    { id: "kel-debonglor", kode: "33.76.01.1004", nama: "Debong Lor" },
    { id: "kel-muarareja", kode: "33.76.01.1005", nama: "Muarareja" },
    { id: "kel-pekauman", kode: "33.76.01.1006", nama: "Pekauman" },
    { id: "kel-pesurungankidul", kode: "33.76.01.1007", nama: "Pesurungan Kidul" },
  ],
  "kec-tt": [
    { id: "kel-mintaragen", kode: "33.76.02.1001", nama: "Mintaragen" },
    { id: "kel-panggung", kode: "33.76.02.1002", nama: "Panggung" },
    { id: "kel-mangkukusuman", kode: "33.76.02.1003", nama: "Mangkukusuman" },
    { id: "kel-kejambon", kode: "33.76.02.1004", nama: "Kejambon" },
    { id: "kel-slerok", kode: "33.76.02.1005", nama: "Slerok" },
  ],
  "kec-ts": [
    { id: "kel-randugunting", kode: "33.76.03.1001", nama: "Randugunting" },
    { id: "kel-debongkulon", kode: "33.76.03.1002", nama: "Debong Kulon" },
    { id: "kel-debongtengah", kode: "33.76.03.1003", nama: "Debong Tengah" },
    { id: "kel-debongkidul", kode: "33.76.03.1004", nama: "Debong Kidul" },
    { id: "kel-tunon", kode: "33.76.03.1005", nama: "Tunon" },
    { id: "kel-kalinyamatwetan", kode: "33.76.03.1006", nama: "Kalinyamat Wetan" },
    { id: "kel-keturen", kode: "33.76.03.1007", nama: "Keturen" },
    { id: "kel-bandung", kode: "33.76.03.1008", nama: "Bandung" },
  ],
  "kec-mg": [
    { id: "kel-margadana", kode: "33.76.04.1001", nama: "Margadana" },
    { id: "kel-cabawan", kode: "33.76.04.1002", nama: "Cabawan" },
    { id: "kel-kaligangsa", kode: "33.76.04.1003", nama: "Kaligangsa" },
    { id: "kel-kalinyamatkulon", kode: "33.76.04.1004", nama: "Kalinyamat Kulon" },
    { id: "kel-krandon", kode: "33.76.04.1005", nama: "Krandon" },
    { id: "kel-pesurunganlor", kode: "33.76.04.1006", nama: "Pesurungan Lor" },
    { id: "kel-sumurpanggang", kode: "33.76.04.1007", nama: "Sumurpanggang" },
  ],
};

export const LIST_RT_RW = Array.from({ length: 40 }, (_, i) => {
  const formatted = (i + 1).toString().padStart(2, "0");
  return { value: formatted, label: formatted };
});
