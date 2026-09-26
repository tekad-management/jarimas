"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Baby,
  Users,
  School,
  Building2,
  HeartPulse,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { BadgeStatusVerval } from "./badge-status-verval";
import { DialogVervalAnak } from "./dialog-verval-anak";
import { DialogTumbuhKembang } from "./dialog-tumbuh-kembang";
import { FormDialogDataAnak } from "./form-dialog-data-anak";
import { deleteDataAnakAction } from "@/actions/data-anak-actions";
import {
  type DataAnakEntity,
  type StatusValidasi,
  type SekolahAnakType,
  type KanalPembuatType,
  DEFAULT_SEMESTER_ACTIVE,
  hitungUsiaDetail,
} from "@/lib/validators/data-anak-schema";
import {
  MASTER_KECAMATAN_TEGAL,
  MASTER_KELURAHAN_TEGAL,
} from "@/lib/validators/register-schema";

// Role Context Mode for testing & cross-channel operations
export type UserRoleContext = "SEKOLAH" | "RT" | "POSYANDU" | "MONITORING_RW" | "MONITORING_PEMERINTAH";

interface CardTabelDataAnakProps {
  initialRoleContext?: UserRoleContext;
  kanalId?: string;
  kanalNama?: string;
  kelurahanId?: string;
  rw?: string;
  rt?: string;
  title?: string;
  description?: string;
  hideRoleSwitcher?: boolean;
}

// Initial Mock Dataset for instant demo & fallback
const INITIAL_MOCK_DATA_ANAK: DataAnakEntity[] = [
  {
    id: "anak-1",
    nama_lengkap: "Ahmad Rayyan Al-Farizi",
    tanggal_lahir: "2021-04-12",
    jenis_kelamin: "L",
    tinggal_bersama: "Orangtua",
    nama_ortu_wali: "Bambang Sugiarto & Siti Aminah",
    sekolah_anak_type: "SEKOLAH_BERIZIN",
    sekolah_id: "sek-tk-pembina",
    nama_sekolah_custom: "TK Negeri Pembina Tegal",
    semester: DEFAULT_SEMESTER_ACTIVE,
    kab_kota: "Kota Tegal",
    kecamatan_id: "kec-tt",
    kelurahan_id: "kel-mintaragen",
    rw: "02",
    rt: "03",
    created_by_kanal_type: "SEKOLAH",
    created_by_kanal_id: "sek-tk-pembina",
    status_validasi: "MENUNGGU_VALIDASI",
    validated_by_type: null,
    validated_by_id: null,
    catatan_validasi: null,
    created_at: "2026-09-10T08:00:00Z",
    updated_at: "2026-09-10T08:00:00Z",
    tumbuh_kembang: [
      {
        id: "tk-1",
        anak_id: "anak-1",
        tanggal_pemeriksaan: "2026-09-15",
        tinggi_badan_cm: 105.5,
        berat_badan_kg: 17.2,
        lingkar_kepala_cm: 50.2,
        catatan_kesehatan: "Gizi baik, perkembangan motorik sesuai usia, vitamin A lengkap.",
        created_by_posyandu_id: "pos-melati-1",
        status_validasi_sekolah: "VALID",
        validated_by_sekolah_id: "sek-tk-pembina",
        created_at: "2026-09-15T09:00:00Z",
      },
    ],
  },
  {
    id: "anak-2",
    nama_lengkap: "Nadhira Putri Aisyah",
    tanggal_lahir: "2022-08-20",
    jenis_kelamin: "P",
    tinggal_bersama: "Orangtua",
    nama_ortu_wali: "Hendra Kusuma",
    sekolah_anak_type: "SEKOLAH_BERIZIN",
    sekolah_id: "sek-paud-permata",
    nama_sekolah_custom: "KB / PAUD Terpadu Permata",
    semester: DEFAULT_SEMESTER_ACTIVE,
    kab_kota: "Kota Tegal",
    kecamatan_id: "kec-tt",
    kelurahan_id: "kel-panggung",
    rw: "02",
    rt: "01",
    created_by_kanal_type: "SEKOLAH",
    created_by_kanal_id: "sek-paud-permata",
    status_validasi: "VALID",
    validated_by_type: "RT",
    validator_label: "Grup RT 01 / RW 02 Panggung",
    catatan_validasi: "Data domisili KK & Fisik anak cocok sesuai data sensus RT 01 RW 02.",
    created_at: "2026-09-12T08:30:00Z",
    updated_at: "2026-09-13T10:00:00Z",
    tumbuh_kembang: [
      {
        id: "tk-2",
        anak_id: "anak-2",
        tanggal_pemeriksaan: "2026-09-20",
        tinggi_badan_cm: 98.0,
        berat_badan_kg: 14.8,
        lingkar_kepala_cm: 48.5,
        catatan_kesehatan: "Status gizi normal, imunisasi dasar lengkap di Posyandu.",
        created_by_posyandu_id: "pos-mawar-2",
        status_validasi_sekolah: "MENUNGGU_VALIDASI",
        validated_by_sekolah_id: null,
        created_at: "2026-09-20T09:30:00Z",
      },
    ],
  },
  {
    id: "anak-3",
    nama_lengkap: "Muhammad Kenzo Pratama",
    tanggal_lahir: "2023-11-05",
    jenis_kelamin: "L",
    tinggal_bersama: "Orangtua Tunggal",
    nama_ortu_wali: "Dewi Ratnasari",
    sekolah_anak_type: "BELUM_SEKOLAH",
    sekolah_id: null,
    nama_sekolah_custom: null,
    semester: DEFAULT_SEMESTER_ACTIVE,
    kab_kota: "Kota Tegal",
    kecamatan_id: "kec-tb",
    kelurahan_id: "kel-tegalsari",
    rw: "03",
    rt: "04",
    created_by_kanal_type: "POSYANDU",
    created_by_kanal_id: "pos-anggrek-tegalsari",
    status_validasi: "TIDAK_VALID",
    validated_by_type: "RT",
    validator_label: "Grup RT 04 / RW 03 Tegalsari",
    catatan_validasi: "Alamat RT keliru. Keluarga anak tercatat pindah domisili ke RT 05 RW 03. Silakan update.",
    created_at: "2026-09-14T09:00:00Z",
    updated_at: "2026-09-15T11:00:00Z",
  },
  {
    id: "anak-4",
    nama_lengkap: "Salma Anindya Azzahra",
    tanggal_lahir: "2024-02-14",
    jenis_kelamin: "P",
    tinggal_bersama: "Wali",
    nama_ortu_wali: "Kakek H. Sutarman",
    sekolah_anak_type: "BELUM_SEKOLAH",
    sekolah_id: null,
    nama_sekolah_custom: null,
    semester: DEFAULT_SEMESTER_ACTIVE,
    kab_kota: "Kota Tegal",
    kecamatan_id: "kec-ts",
    kelurahan_id: "kel-randugunting",
    rw: "01",
    rt: "02",
    created_by_kanal_type: "RT",
    created_by_kanal_id: "rt-02-rw-01-randugunting",
    status_validasi: "VALID",
    validated_by_type: "POSYANDU",
    validator_label: "Kanal Posyandu Melati Randugunting",
    catatan_validasi: "Balita terdaftar aktif pada posyandu Melati RW 01.",
    created_at: "2026-09-16T10:00:00Z",
    updated_at: "2026-09-17T08:00:00Z",
  },
  {
    id: "anak-5",
    nama_lengkap: "Fathir Rizky Maulana",
    tanggal_lahir: "2020-07-08",
    jenis_kelamin: "L",
    tinggal_bersama: "Orangtua",
    nama_ortu_wali: "Agus Pratama & Yuliana",
    sekolah_anak_type: "SEKOLAH_TIDAK_BERIZIN",
    sekolah_id: null,
    nama_sekolah_custom: "Bimbel Baca Tulis Calistung Mandiri RT 04",
    semester: DEFAULT_SEMESTER_ACTIVE,
    kab_kota: "Kota Tegal",
    kecamatan_id: "kec-mg",
    kelurahan_id: "kel-margadana",
    rw: "03",
    rt: "01",
    created_by_kanal_type: "RT",
    created_by_kanal_id: "rt-01-rw-03-margadana",
    status_validasi: "MENUNGGU_VALIDASI",
    validated_by_type: null,
    validated_by_id: null,
    catatan_validasi: null,
    created_at: "2026-09-18T11:00:00Z",
    updated_at: "2026-09-18T11:00:00Z",
  },
];

export function CardTabelDataAnak({
  initialRoleContext = "SEKOLAH",
  kanalId = "sek-tk-pembina",
  kanalNama = "TK Negeri Pembina Tegal",
  kelurahanId = "kel-mintaragen",
  rw = "02",
  rt = "03",
  title = "Data Anak Usia 0 - 7 Tahun & Workflow Verval Silang Antar-Kanal",
  description = "Pemantauan sensus anak usia 0-7 tahun Semester Ganjil 2026/2027 dengan mekanisme validasi silang antara Sekolah, Grup RT, dan Posyandu.",
  hideRoleSwitcher = false,
}: CardTabelDataAnakProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Active Role Context (Simulasi Peran Akses)
  const [activeRole, setActiveRole] = useState<UserRoleContext>(initialRoleContext);

  // Local Dataset State
  const [dataList, setDataList] = useState<DataAnakEntity[]>(INITIAL_MOCK_DATA_ANAK);
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSekolahType, setFilterSekolahType] = useState<string>("ALL");
  const [filterKecamatan, setFilterKecamatan] = useState<string>("ALL");
  const [filterKelurahan, setFilterKelurahan] = useState<string>("ALL");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [anakToEdit, setAnakToEdit] = useState<DataAnakEntity | null>(null);

  const [isVervalOpen, setIsVervalOpen] = useState(false);
  const [anakToVerval, setAnakToVerval] = useState<DataAnakEntity | null>(null);

  const [isTumbuhKembangOpen, setIsTumbuhKembangOpen] = useState(false);
  const [anakForTumbuhKembang, setAnakForTumbuhKembang] = useState<DataAnakEntity | null>(null);

  // 1. Fetch live data from Supabase if available
  const { data: dbData } = useQuery({
    queryKey: ["data_anak_verval_live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_anak")
        .select("*, tumbuh_kembang:tumbuh_kembang_posyandu(*)")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return null;
      }
      return data as DataAnakEntity[];
    },
  });

  // Sync Supabase live data with fallback data
  useEffect(() => {
    if (dbData && dbData.length > 0) {
      // Merge unique
      setDataList((prev) => {
        const merged = [...dbData];
        INITIAL_MOCK_DATA_ANAK.forEach((mock) => {
          if (!merged.some((m) => m.id === mock.id)) {
            merged.push(mock);
          }
        });
        return merged;
      });
    }
  }, [dbData]);

  // 2. Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel("realtime:data_anak_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "data_anak" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["data_anak_verval_live"] });
          if (payload.eventType === "INSERT") {
            toast.info("Data Anak Baru Terdaftar!", {
              description: `Data anak ${payload.new.nama_lengkap} masuk ke antrean Verval.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  // 3. Stats Calculation
  const stats = useMemo(() => {
    const total = dataList.length;
    const valid = dataList.filter((d) => d.status_validasi === "VALID").length;
    const menunggu = dataList.filter((d) => d.status_validasi === "MENUNGGU_VALIDASI").length;
    const tidakValid = dataList.filter((d) => d.status_validasi === "TIDAK_VALID").length;
    const sekolahBerizin = dataList.filter((d) => d.sekolah_anak_type === "SEKOLAH_BERIZIN").length;
    const belumSekolah = dataList.filter((d) => d.sekolah_anak_type === "BELUM_SEKOLAH").length;
    const tidakBerizin = dataList.filter((d) => d.sekolah_anak_type === "SEKOLAH_TIDAK_BERIZIN").length;

    return {
      total,
      valid,
      menunggu,
      tidakValid,
      sekolahBerizin,
      belumSekolah,
      tidakBerizin,
      persenValid: total > 0 ? Math.round((valid / total) * 100) : 0,
    };
  }, [dataList]);

  // 4. Filtered Data List
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      // Filter Status
      if (filterStatus !== "ALL" && item.status_validasi !== filterStatus) {
        return false;
      }
      // Filter Tipe Sekolah
      if (filterSekolahType !== "ALL" && item.sekolah_anak_type !== filterSekolahType) {
        return false;
      }
      // Filter Kecamatan
      if (filterKecamatan !== "ALL" && item.kecamatan_id !== filterKecamatan) {
        return false;
      }
      // Filter Kelurahan
      if (filterKelurahan !== "ALL" && item.kelurahan_id !== filterKelurahan) {
        return false;
      }
      // Filter Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNama = item.nama_lengkap.toLowerCase().includes(query);
        const matchOrtu = item.nama_ortu_wali.toLowerCase().includes(query);
        const matchSekolah = (item.nama_sekolah_custom || "").toLowerCase().includes(query);
        const matchRtRw = `rt ${item.rt} rw ${item.rw}`.toLowerCase().includes(query);
        if (!matchNama && !matchOrtu && !matchSekolah && !matchRtRw) return false;
      }
      return true;
    });
  }, [dataList, filterStatus, filterSekolahType, filterKecamatan, filterKelurahan, searchQuery]);

  // Handlers
  const handleOpenAdd = () => {
    setAnakToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (anak: DataAnakEntity) => {
    // ATURAN BISNIS: Jika status MENUNGGU_VALIDASI atau VALID, Tombol Edit DI-DISABLE
    if (anak.status_validasi !== "TIDAK_VALID") {
      toast.warning("Aksi Terkunci", {
        description: "Hanya data yang berstatus TIDAK VALID yang dapat diedit/diperbaiki oleh pembuat.",
      });
      return;
    }
    setAnakToEdit(anak);
    setIsFormOpen(true);
  };

  const handleDelete = async (anak: DataAnakEntity) => {
    // ATURAN BISNIS: Jika status MENUNGGU_VALIDASI atau VALID, Tombol Delete DI-DISABLE
    if (anak.status_validasi !== "TIDAK_VALID") {
      toast.warning("Aksi Terkunci", {
        description: "Hanya data berstatus TIDAK VALID yang dapat dihapus dari sistem.",
      });
      return;
    }

    if (!confirm(`Hapus data ${anak.nama_lengkap}?`)) return;

    try {
      const res = await deleteDataAnakAction(anak.id);
      if (res.success) {
        toast.success("Data anak berhasil dihapus.");
        setDataList((prev) => prev.filter((d) => d.id !== anak.id));
      } else {
        toast.error(res.error || "Gagal menghapus data.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghapus data.");
    }
  };

  const handleOpenVerval = (anak: DataAnakEntity) => {
    setAnakToVerval(anak);
    setIsVervalOpen(true);
  };

  const handleOpenTumbuhKembang = (anak: DataAnakEntity) => {
    setAnakForTumbuhKembang(anak);
    setIsTumbuhKembangOpen(true);
  };

  // Convert Role Context to Creator / Verifier Type
  const currentCreatorRole: KanalPembuatType =
    activeRole === "SEKOLAH" ? "SEKOLAH" : activeRole === "POSYANDU" ? "POSYANDU" : "RT";

  const isReadOnlyMonitoring =
    activeRole === "MONITORING_RW" || activeRole === "MONITORING_PEMERINTAH";

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden">
      {/* Header Card */}
      <CardHeader className="bg-gradient-to-b from-muted/50 to-muted/10 border-b border-border/70 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Baby className="size-4" />
              <span>Modul Pendataan Sensus Anak & Verval Lintas Sektor</span>
              <span>•</span>
              <Badge variant="outline" className="text-[11px] font-bold border-emerald-500/30">
                {DEFAULT_SEMESTER_ACTIVE}
              </Badge>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </CardDescription>
          </div>

          {/* Action Header Button: Tambah Data */}
          {!isReadOnlyMonitoring && (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-4 shadow-sm gap-2 self-start md:self-center shrink-0 rounded-xl"
            >
              <Plus className="size-4" />
              <span>Daftarkan Anak (0 - 7 Thn)</span>
            </Button>
          )}
        </div>

        {/* Role Context Simulator Switcher */}
        {!hideRoleSwitcher && (
          <div className="mt-4 pt-3.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-foreground">Simulasi Hak Akses / Peran Aktif:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveRole("SEKOLAH")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === "SEKOLAH"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <School className="size-3.5" />
                <span>Kanal Sekolah (TK/PAUD)</span>
              </button>

              <button
                onClick={() => setActiveRole("RT")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === "RT"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <Building2 className="size-3.5" />
                <span>Grup RT Domisili (Verval)</span>
              </button>

              <button
                onClick={() => setActiveRole("POSYANDU")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === "POSYANDU"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <HeartPulse className="size-3.5" />
                <span>Kanal Posyandu (Verval & Tumbuh Kembang)</span>
              </button>

              <button
                onClick={() => setActiveRole("MONITORING_PEMERINTAH")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === "MONITORING_PEMERINTAH"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <Eye className="size-3.5" />
                <span>Pantau Wilayah (Read-Only)</span>
              </button>
            </div>
          </div>
        )}

        {/* Read-Only Notice Banner if active */}
        {isReadOnlyMonitoring && (
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-950 dark:text-indigo-200 text-xs flex items-center gap-2">
            <Eye className="size-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Mode Pantau Wilayah (Read-Only):</strong> Tingkat RW, Kelurahan, Kecamatan, dan Pemerintah Kota memiliki akses baca penuh terhadap seluruh rekapitulasi data anak dan progres verval.
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* KPI Statistik Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground block">Total Terdata</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-foreground">{stats.total}</span>
              <span className="text-xs text-muted-foreground">Anak</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Semester Ganjil 26/27</div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block">
              Valid Terverifikasi
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.valid}
              </span>
              <span className="text-xs font-semibold text-emerald-600">({stats.persenValid}%)</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Divalidasi RT/Posyandu</div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
            <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 block">
              Menunggu Validasi
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.menunggu}
              </span>
              <span className="text-xs text-muted-foreground">Anak</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Antrean Verval Silang</div>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1">
            <span className="text-[11px] font-medium text-rose-800 dark:text-rose-300 block">
              Perlu Perbaikan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                {stats.tidakValid}
              </span>
              <span className="text-xs text-muted-foreground">Anak</span>
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
              Tombol Edit Terbuka
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama anak, nama orang tua, sekolah, atau RT/RW..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center rounded-lg border border-border/80 bg-background p-0.5">
                <Button
                  variant={viewMode === "GRID" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("GRID")}
                  className="h-7 px-2.5 text-xs font-semibold gap-1.5"
                >
                  <LayoutGrid className="size-3.5" />
                  <span className="hidden sm:inline">Kartu</span>
                </Button>
                <Button
                  variant={viewMode === "TABLE" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("TABLE")}
                  className="h-7 px-2.5 text-xs font-semibold gap-1.5"
                >
                  <TableIcon className="size-3.5" />
                  <span className="hidden sm:inline">Tabel</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
              <SelectTrigger className="text-xs h-8 bg-background">
                <SelectValue placeholder="Status Verval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status Verval</SelectItem>
                <SelectItem value="MENUNGGU_VALIDASI">Menunggu Validasi</SelectItem>
                <SelectItem value="VALID">Valid Terverifikasi</SelectItem>
                <SelectItem value="TIDAK_VALID">Tidak Valid (Perbaikan)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSekolahType} onValueChange={(val) => setFilterSekolahType(val || "ALL")}>
              <SelectTrigger className="text-xs h-8 bg-background">
                <SelectValue placeholder="Status Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status Sekolah</SelectItem>
                <SelectItem value="SEKOLAH_BERIZIN">Sekolah Berizin (TK/PAUD)</SelectItem>
                <SelectItem value="BELUM_SEKOLAH">Belum Sekolah</SelectItem>
                <SelectItem value="SEKOLAH_TIDAK_BERIZIN">Sekolah Tidak Berizin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterKecamatan} onValueChange={(val) => setFilterKecamatan(val || "ALL")}>
              <SelectTrigger className="text-xs h-8 bg-background">
                <SelectValue placeholder="Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kecamatan</SelectItem>
                {MASTER_KECAMATAN_TEGAL.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("ALL");
                  setFilterSekolahType("ALL");
                  setFilterKecamatan("ALL");
                  setFilterKelurahan("ALL");
                }}
                className="text-xs h-8 px-3 font-semibold text-muted-foreground hover:text-foreground gap-1.5 w-full justify-center"
              >
                <RotateCcw className="size-3" />
                <span>Reset Filter</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Data Content: Card View vs Table View */}
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
            <Baby className="size-10 mx-auto text-muted-foreground/50" />
            <h4 className="text-sm font-bold text-foreground">Tidak ada data anak ditemukan</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan data anak usia 0-7 tahun lainnya.
            </p>
          </div>
        ) : viewMode === "GRID" ? (
          /* ========================================================================= */
          /* 1. GRID CARD VIEW */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((anak) => {
              const usia = hitungUsiaDetail(anak.tanggal_lahir);
              const isLocked = anak.status_validasi !== "TIDAK_VALID";
              const hasHealthRecord = anak.tumbuh_kembang && anak.tumbuh_kembang.length > 0;

              return (
                <div
                  key={anak.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Nama & Badge Verval */}
                    <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground leading-snug">
                          {anak.nama_lengkap}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                          <span>{anak.jenis_kelamin === "L" ? "Laki-laki (L)" : "Perempuan (P)"}</span>
                          <span>•</span>
                          <span className="text-foreground font-semibold">
                            {usia?.text || "-"}
                          </span>
                        </div>
                      </div>

                      <BadgeStatusVerval
                        status={anak.status_validasi}
                        validatedByType={anak.validated_by_type}
                        validatorLabel={anak.validator_label}
                        catatanValidasi={anak.catatan_validasi}
                        size="sm"
                        showDetails={false}
                      />
                    </div>

                    {/* Informasi Detail */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Orang Tua / Wali:</span>
                        <span className="font-semibold text-foreground text-right truncate max-w-[160px]">
                          {anak.nama_ortu_wali}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Status Tinggal:</span>
                        <span className="font-medium text-foreground">{anak.tinggal_bersama}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Domisili:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          RT {anak.rt} / RW {anak.rw}, Kota Tegal
                        </span>
                      </div>

                      <div className="pt-1.5 border-t border-border/40">
                        <span className="text-[11px] block text-muted-foreground mb-0.5">
                          Status Lembaga Pendidikan:
                        </span>
                        <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                          <School className="size-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {anak.sekolah_anak_type === "SEKOLAH_BERIZIN"
                              ? anak.nama_sekolah_custom || "Sekolah Berizin (TK/PAUD)"
                              : anak.sekolah_anak_type === "SEKOLAH_TIDAK_BERIZIN"
                              ? `Lembaga Tidak Berizin (${anak.nama_sekolah_custom})`
                              : "Belum Sekolah (Anak Usia Dini)"}
                          </span>
                        </div>
                      </div>

                      {/* Info Jejak Validasi & Catatan */}
                      {anak.validated_by_type && (
                        <div className="pt-1 text-[11px] flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>Divalidasi oleh {anak.validator_label || (anak.validated_by_type === "RT" ? "Grup RT" : "Posyandu")}</span>
                        </div>
                      )}

                      {anak.status_validasi === "TIDAK_VALID" && anak.catatan_validasi && (
                        <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg text-[11px] text-rose-800 dark:text-rose-300 space-y-0.5">
                          <span className="font-bold block flex items-center gap-1">
                            <AlertTriangle className="size-3 text-rose-600" />
                            Catatan Penolakan:
                          </span>
                          <p className="italic leading-snug">&ldquo;{anak.catatan_validasi}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar dengan Aturan Bisnis Verval */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-1.5">
                    {/* Tombol Tumbuh Kembang Posyandu */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTumbuhKembang(anak)}
                      className="h-8 text-[11px] font-semibold gap-1 px-2.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    >
                      <HeartPulse className="size-3.5 text-emerald-600" />
                      <span>Kesehatan ({hasHealthRecord ? anak.tumbuh_kembang?.length : 0})</span>
                    </Button>

                    {/* Tombol Verval untuk RT & Posyandu */}
                    {!isReadOnlyMonitoring && (activeRole === "RT" || activeRole === "POSYANDU") && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenVerval(anak)}
                        className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 px-2.5 shadow-2xs"
                      >
                        <ShieldCheck className="size-3.5" />
                        <span>Verval</span>
                      </Button>
                    )}

                    {/* Tombol Edit & Delete dengan Penguncian Sesuai Aturan Verval */}
                    {!isReadOnlyMonitoring && (
                      <div className="flex items-center gap-1">
                        {/* UPDATE BUTTON */}
                        <Tooltip>
                          <TooltipTrigger>
                            <span>
                              <Button
                                variant={isLocked ? "ghost" : "outline"}
                                size="icon"
                                onClick={() => handleOpenEdit(anak)}
                                disabled={isLocked}
                                className={`size-8 rounded-lg ${
                                  isLocked
                                    ? "text-muted-foreground/40 cursor-not-allowed"
                                    : "border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 hover:text-amber-800"
                                }`}
                              >
                                {isLocked ? <Lock className="size-3.5" /> : <Edit className="size-3.5" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {isLocked ? (
                              <p>
                                <strong>Terkunci:</strong> Data berstatus Menunggu Validasi atau Valid tidak dapat diubah. Hanya data berstatus <strong>Tidak Valid</strong> yang dapat diedit pembuat.
                              </p>
                            ) : (
                              <p>Klik untuk memperbaiki data yang ditolak oleh verifikator.</p>
                            )}
                          </TooltipContent>
                        </Tooltip>

                        {/* DELETE BUTTON */}
                        <Tooltip>
                          <TooltipTrigger>
                            <span>
                              <Button
                                variant={isLocked ? "ghost" : "outline"}
                                size="icon"
                                onClick={() => handleDelete(anak)}
                                disabled={isLocked}
                                className={`size-8 rounded-lg ${
                                  isLocked
                                    ? "text-muted-foreground/40 cursor-not-allowed"
                                    : "border-rose-500/40 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 hover:text-rose-800"
                                }`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {isLocked ? (
                              <p>
                                <strong>Terkunci:</strong> Hanya data berstatus <strong>Tidak Valid</strong> yang dapat dihapus.
                              </p>
                            ) : (
                              <p>Hapus data yang ditolak ini.</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. TABLE VIEW */
          /* ========================================================================= */
          <div className="rounded-xl border border-border/80 overflow-x-auto bg-card">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/50 font-bold text-muted-foreground text-[11px]">
                  <th className="p-3">Nama Anak & Usia</th>
                  <th className="p-3">Status Sekolah</th>
                  <th className="p-3">Orang Tua / Wali</th>
                  <th className="p-3">Domisili</th>
                  <th className="p-3">Sumber Pendaftar</th>
                  <th className="p-3">Status Verval</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredData.map((anak) => {
                  const usia = hitungUsiaDetail(anak.tanggal_lahir);
                  const isLocked = anak.status_validasi !== "TIDAK_VALID";

                  return (
                    <tr key={anak.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">
                        <div>{anak.nama_lengkap}</div>
                        <div className="text-[11px] font-normal text-muted-foreground">
                          {anak.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} • {usia?.text}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-foreground">
                          {anak.sekolah_anak_type === "SEKOLAH_BERIZIN"
                            ? anak.nama_sekolah_custom || "Sekolah Berizin"
                            : anak.sekolah_anak_type === "SEKOLAH_TIDAK_BERIZIN"
                            ? anak.nama_sekolah_custom
                            : "Belum Sekolah"}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {anak.sekolah_anak_type.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="p-3 text-muted-foreground">
                        <div>{anak.nama_ortu_wali}</div>
                        <div className="text-[10px]">({anak.tinggal_bersama})</div>
                      </td>

                      <td className="p-3 font-semibold text-foreground">
                        RT {anak.rt} / RW {anak.rw}
                      </td>

                      <td className="p-3 text-muted-foreground font-medium">
                        Kanal {anak.created_by_kanal_type}
                      </td>

                      <td className="p-3">
                        <BadgeStatusVerval
                          status={anak.status_validasi}
                          validatedByType={anak.validated_by_type}
                          validatorLabel={anak.validator_label}
                          catatanValidasi={anak.catatan_validasi}
                          size="sm"
                        />
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenTumbuhKembang(anak)}
                            className="h-7 text-[11px] px-2 gap-1 border-emerald-500/30 text-emerald-700"
                          >
                            <HeartPulse className="size-3" />
                            <span>Kesehatan</span>
                          </Button>

                          {!isReadOnlyMonitoring && (activeRole === "RT" || activeRole === "POSYANDU") && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenVerval(anak)}
                              className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 px-2.5"
                            >
                              <ShieldCheck className="size-3" />
                              <span>Verval</span>
                            </Button>
                          )}

                          {!isReadOnlyMonitoring && (
                            <>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span>
                                    <Button
                                      variant={isLocked ? "ghost" : "outline"}
                                      size="icon"
                                      onClick={() => handleOpenEdit(anak)}
                                      disabled={isLocked}
                                      className="size-7 rounded"
                                    >
                                      {isLocked ? <Lock className="size-3 text-muted-foreground/40" /> : <Edit className="size-3 text-amber-600" />}
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  {isLocked ? "Terkunci (Hanya status Tidak Valid yang dapat diedit)" : "Edit perbaikan"}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger>
                                  <span>
                                    <Button
                                      variant={isLocked ? "ghost" : "outline"}
                                      size="icon"
                                      onClick={() => handleDelete(anak)}
                                      disabled={isLocked}
                                      className="size-7 rounded"
                                    >
                                      <Trash2 className={`size-3 ${isLocked ? "text-muted-foreground/40" : "text-rose-600"}`} />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  {isLocked ? "Terkunci (Hanya status Tidak Valid yang dapat dihapus)" : "Hapus"}
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* MODAL 1: Form Tambah / Edit Data Anak */}
      <FormDialogDataAnak
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        anakToEdit={anakToEdit}
        creatorRole={currentCreatorRole}
        creatorKanalId={kanalId}
        creatorKanalNama={kanalNama}
        defaultWilayah={{
          kelurahanId,
          rw,
          rt,
        }}
        onSuccess={(saved) => {
          setDataList((prev) => {
            const idx = prev.findIndex((d) => d.id === saved.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = saved;
              return updated;
            }
            return [saved, ...prev];
          });
        }}
      />

      {/* MODAL 2: Verval Silang RT / Posyandu */}
      <DialogVervalAnak
        isOpen={isVervalOpen}
        onOpenChange={setIsVervalOpen}
        anak={anakToVerval}
        verifierType={activeRole === "POSYANDU" ? "POSYANDU" : "RT"}
        verifierName={
          activeRole === "POSYANDU"
            ? kanalNama || "Kanal Posyandu Melati"
            : `Grup RT ${rt || "03"} / RW ${rw || "02"}`
        }
        verifierId={kanalId}
        onSuccess={(updated) => {
          setDataList((prev) =>
            prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
          );
        }}
      />

      {/* MODAL 3: Tumbuh Kembang Posyandu & Validasi Sekolah */}
      <DialogTumbuhKembang
        isOpen={isTumbuhKembangOpen}
        onOpenChange={setIsTumbuhKembangOpen}
        anak={anakForTumbuhKembang}
        activeRole={
          activeRole === "SEKOLAH"
            ? "SEKOLAH"
            : activeRole === "POSYANDU"
            ? "POSYANDU"
            : activeRole === "RT"
            ? "RT"
            : "READ_ONLY"
        }
        activeKanalId={kanalId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["data_anak_verval_live"] });
        }}
      />
    </Card>
  );
}
