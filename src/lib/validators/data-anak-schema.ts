import * as z from "zod";

// ==============================================================================
// 1. TIPE & ENUM STATUS VERVAL DATA ANAK
// ==============================================================================
export type StatusValidasi = "MENUNGGU_VALIDASI" | "VALID" | "TIDAK_VALID";
export type SekolahAnakType = "SEKOLAH_BERIZIN" | "BELUM_SEKOLAH" | "SEKOLAH_TIDAK_BERIZIN";
export type KanalPembuatType = "SEKOLAH" | "RT" | "POSYANDU";
export type ValidatedByType = "RT" | "POSYANDU";
export type TinggalBersamaType = "Orangtua" | "Orangtua Tunggal" | "Wali";

export const DEFAULT_SEMESTER_ACTIVE = "Ganjil 2026/2027 (Juli - Desember 2026)";

// ==============================================================================
// 2. HELPER KALKULASI USIA DETAIL (TAHUN & BULAN)
// ==============================================================================
export interface UsiaDetail {
  tahun: number;
  bulan: number;
  totalBulan: number;
  text: string;
  isEligible0to7: boolean;
}

export function hitungUsiaDetail(tanggalLahirStr: string | Date | undefined | null): UsiaDetail | null {
  if (!tanggalLahirStr) return null;
  const birthDate = typeof tanggalLahirStr === "string" ? new Date(tanggalLahirStr) : tanggalLahirStr;
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) {
    return {
      tahun: 0,
      bulan: 0,
      totalBulan: 0,
      text: "0 Bulan (Baru Lahir)",
      isEligible0to7: true,
    };
  }

  const totalBulan = years * 12 + months;
  // Usia 0 - 7 tahun (sampai dengan 7 tahun 11 bulan / 95 bulan)
  const isEligible0to7 = years <= 7;

  let text = "";
  if (years === 0) {
    text = `${months} Bulan`;
  } else if (months === 0) {
    text = `${years} Tahun`;
  } else {
    text = `${years} Thn ${months} Bln`;
  }

  return {
    tahun: years,
    bulan: months,
    totalBulan,
    text,
    isEligible0to7,
  };
}

// ==============================================================================
// 3. SKEMA VALIDASI FORM DATA ANAK
// ==============================================================================
export const dataAnakFormSchema = z
  .object({
    nama_lengkap: z
      .string()
      .min(2, { message: "Nama lengkap anak minimal 2 karakter" })
      .max(200, { message: "Nama lengkap maksimal 200 karakter" }),
    
    tanggal_lahir: z
      .string()
      .min(1, { message: "Tanggal lahir anak wajib diisi" })
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      }, {
        message: "Tanggal lahir tidak valid atau melebihi hari ini",
      }),
    
    jenis_kelamin: z.enum(["L", "P"], {
      message: "Pilih jenis kelamin anak (Laki-laki / Perempuan)",
    }),

    tinggal_bersama: z.enum(["Orangtua", "Orangtua Tunggal", "Wali"], {
      message: "Pilih status tinggal bersama",
    }),

    nama_ortu_wali: z
      .string()
      .min(2, { message: "Nama orang tua / wali minimal 2 karakter" })
      .max(150, { message: "Nama orang tua / wali maksimal 150 karakter" }),

    sekolah_anak_type: z.enum(["SEKOLAH_BERIZIN", "BELUM_SEKOLAH", "SEKOLAH_TIDAK_BERIZIN"], {
      message: "Pilih tipe status sekolah anak",
    }),

    sekolah_id: z.string().optional().nullable(),
    nama_sekolah_custom: z.string().optional().nullable(),

    semester: z.string().default(DEFAULT_SEMESTER_ACTIVE),
    kab_kota: z.string().default("Kota Tegal"),
    kecamatan_id: z.string().min(1, { message: "Kecamatan domisili wajib dipilih" }),
    kelurahan_id: z.string().min(1, { message: "Kelurahan domisili wajib dipilih" }),
    rw: z.string().min(1, { message: "RW domisili wajib dipilih" }),
    rt: z.string().min(1, { message: "RT domisili wajib dipilih" }),

    created_by_kanal_type: z.enum(["SEKOLAH", "RT", "POSYANDU"]),
    created_by_kanal_id: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Validasi usia 0-7 tahun
    const usia = hitungUsiaDetail(data.tanggal_lahir);
    if (usia && !usia.isEligible0to7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Program ini dikhususkan untuk anak rentang usia 0 - 7 tahun",
        path: ["tanggal_lahir"],
      });
    }

    // Aturan Verval Berdasarkan Kanal Pembuat:
    // Jika dibuat oleh RT atau POSYANDU, tidak boleh memilih SEKOLAH_BERIZIN
    if (
      (data.created_by_kanal_type === "RT" || data.created_by_kanal_type === "POSYANDU") &&
      data.sekolah_anak_type === "SEKOLAH_BERIZIN"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kanal RT & Posyandu hanya dapat mendaftarkan anak dengan status 'Belum Sekolah' atau 'Sekolah Tidak Berizin'",
        path: ["sekolah_anak_type"],
      });
    }

    // Jika SEKOLAH_BERIZIN, wajib ada sekolah_id atau nama_sekolah_custom
    if (data.sekolah_anak_type === "SEKOLAH_BERIZIN" && !data.sekolah_id && !data.nama_sekolah_custom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sekolah berizin wajib dipilih atau dicantumkan",
        path: ["sekolah_id"],
      });
    }

    // Jika SEKOLAH_TIDAK_BERIZIN, wajib mengisi nama_sekolah_custom
    if (data.sekolah_anak_type === "SEKOLAH_TIDAK_BERIZIN" && (!data.nama_sekolah_custom || data.nama_sekolah_custom.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama lembaga / sekolah tidak berizin wajib diisi (contoh: Bimbel Mandiri / Kursus Anak)",
        path: ["nama_sekolah_custom"],
      });
    }
  });

export type DataAnakFormInput = z.infer<typeof dataAnakFormSchema>;

// ==============================================================================
// 4. SKEMA VERIFIKASI & VALIDASI (VERVAL) OLEH RT / POSYANDU
// ==============================================================================
export const vervalActionSchema = z.object({
  anak_id: z.string().min(1, { message: "ID anak wajib disertakan" }),
  status_validasi: z.enum(["VALID", "TIDAK_VALID"], {
    message: "Status validasi harus VALID atau TIDAK_VALID",
  }),
  validated_by_type: z.enum(["RT", "POSYANDU"]),
  validated_by_id: z.string().optional().nullable(),
  validator_name: z.string().optional(),
  catatan_validasi: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  // Jika status TIDAK_VALID, catatan alasan penolakan wajib diisi
  if (data.status_validasi === "TIDAK_VALID" && (!data.catatan_validasi || data.catatan_validasi.trim().length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Catatan alasan penolakan wajib diisi minimal 5 karakter agar pembuat data dapat memperbaikinya",
      path: ["catatan_validasi"],
    });
  }
});

export type VervalActionInput = z.infer<typeof vervalActionSchema>;

// ==============================================================================
// 5. SKEMA TUMBUH KEMBANG POSYANDU
// ==============================================================================
export const tumbuhKembangSchema = z.object({
  anak_id: z.string().min(1, { message: "ID anak wajib disertakan" }),
  tanggal_pemeriksaan: z.string().min(1, { message: "Tanggal pemeriksaan wajib diisi" }),
  tinggi_badan_cm: z
    .number({ message: "Tinggi badan harus angka" })
    .min(30, { message: "Tinggi badan minimal 30 cm" })
    .max(160, { message: "Tinggi badan maksimal 160 cm" }),
  berat_badan_kg: z
    .number({ message: "Berat badan harus angka" })
    .min(1.5, { message: "Berat badan minimal 1.5 kg" })
    .max(60, { message: "Berat badan maksimal 60 kg" }),
  lingkar_kepala_cm: z
    .number({ message: "Lingkar kepala harus angka" })
    .min(25, { message: "Lingkar kepala minimal 25 cm" })
    .max(65, { message: "Lingkar kepala maksimal 65 cm" })
    .optional()
    .nullable(),
  catatan_kesehatan: z.string().max(500).optional().nullable(),
  created_by_posyandu_id: z.string().optional().nullable(),
});

export type TumbuhKembangInput = z.infer<typeof tumbuhKembangSchema>;

// ==============================================================================
// 6. INTERFACE LENGKAP ENTITAS DATABASE
// ==============================================================================
export interface DataAnakEntity {
  id: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  tinggal_bersama: TinggalBersamaType;
  nama_ortu_wali: string;
  sekolah_anak_type: SekolahAnakType;
  sekolah_id?: string | null;
  nama_sekolah_custom?: string | null;
  semester: string;
  kab_kota: string;
  kecamatan_id?: string | null;
  kelurahan_id?: string | null;
  rw: string;
  rt: string;
  created_by_kanal_type: KanalPembuatType;
  created_by_kanal_id?: string | null;
  status_validasi: StatusValidasi;
  validated_by_type?: ValidatedByType | null;
  validated_by_id?: string | null;
  catatan_validasi?: string | null;
  created_at: string;
  updated_at: string;

  // Joined / Populated Fields
  sekolah?: {
    id: string;
    nama: string;
    tingkat: string;
    npsn?: string;
  } | null;
  tumbuh_kembang?: TumbuhKembangEntity[];
  validator_label?: string;
}

export interface TumbuhKembangEntity {
  id: string;
  anak_id: string;
  tanggal_pemeriksaan: string;
  tinggi_badan_cm: number;
  berat_badan_kg: number;
  lingkar_kepala_cm?: number | null;
  catatan_kesehatan?: string | null;
  created_by_posyandu_id?: string | null;
  status_validasi_sekolah: StatusValidasi;
  validated_by_sekolah_id?: string | null;
  created_at: string;
}
