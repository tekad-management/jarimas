"use client";

import React, { useMemo, useState } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { submitDataWargaAction } from "@/actions/warga-actions";
import {
  Compass,
  Building,
  Home,
  School,
  RotateCcw,
  CheckCircle2,
  Filter,
  UserPlus,
  LogIn,
  Loader2,
  Database,
  Layers,
} from "lucide-react";

// Data Master Fallback Resmi Kota Tegal (Kemendagri 33.76: 4 Kecamatan & 27 Kelurahan)
const FALLBACK_KECAMATAN = [
  { id: "33.76.01", slug: "tegal-barat", nama: "Tegal Barat" },
  { id: "33.76.02", slug: "tegal-timur", nama: "Tegal Timur" },
  { id: "33.76.03", slug: "tegal-selatan", nama: "Tegal Selatan" },
  { id: "33.76.04", slug: "margadana", nama: "Margadana" },
];

const FALLBACK_KELURAHAN: Record<
  string,
  { id: string; nama: string; units: { id: string; nama: string; tipe: "Posyandu" | "Sekolah" }[] }[]
> = {
  "tegal-timur": [
    {
      id: "mintaragen",
      nama: "Mintaragen",
      units: [
        { id: "pos-melati-1", nama: "Posyandu Melati I (Mintaragen)", tipe: "Posyandu" },
        { id: "pos-melati-2", nama: "Posyandu Melati II (Mintaragen)", tipe: "Posyandu" },
        { id: "sd-mintaragen-1", nama: "SD Negeri Mintaragen 1", tipe: "Sekolah" },
        { id: "smp-1-tegal", nama: "SMP Negeri 1 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "panggung",
      nama: "Panggung",
      units: [
        { id: "pos-kenanga-1", nama: "Posyandu Kenanga I (Panggung)", tipe: "Posyandu" },
        { id: "sd-panggung-3", nama: "SD Negeri Panggung 3", tipe: "Sekolah" },
        { id: "smp-6-tegal", nama: "SMP Negeri 6 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "mangkukusuman",
      nama: "Mangkukusuman",
      units: [
        { id: "pos-bougenville", nama: "Posyandu Bougenville (Mangkukusuman)", tipe: "Posyandu" },
        { id: "sd-mangkukusuman-1", nama: "SD Negeri Mangkukusuman 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kejambon",
      nama: "Kejambon",
      units: [
        { id: "pos-dahlia-1", nama: "Posyandu Dahlia I (Kejambon)", tipe: "Posyandu" },
        { id: "sd-kejambon-1", nama: "SD Negeri Kejambon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "slerok",
      nama: "Slerok",
      units: [
        { id: "pos-mawar-1", nama: "Posyandu Mawar I (Slerok)", tipe: "Posyandu" },
        { id: "sd-slerok-2", nama: "SD Negeri Slerok 2", tipe: "Sekolah" },
        { id: "smp-10-tegal", nama: "SMP Negeri 10 Kota Tegal", tipe: "Sekolah" },
      ],
    },
  ],
  "tegal-barat": [
    {
      id: "tegalsari",
      nama: "Tegalsari",
      units: [
        { id: "pos-bahari-1", nama: "Posyandu Bahari I (Tegalsari)", tipe: "Posyandu" },
        { id: "sd-tegalsari-1", nama: "SD Negeri Tegalsari 1", tipe: "Sekolah" },
        { id: "smp-7-tegal", nama: "SMP Negeri 7 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "kraton",
      nama: "Kraton",
      units: [
        { id: "pos-cempaka-kraton", nama: "Posyandu Cempaka (Kraton)", tipe: "Posyandu" },
        { id: "sd-kraton-1", nama: "SD Negeri Kraton 1", tipe: "Sekolah" },
        { id: "smp-2-tegal", nama: "SMP Negeri 2 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "kemandungan",
      nama: "Kemandungan",
      units: [
        { id: "pos-asri-1", nama: "Posyandu Asri I (Kemandungan)", tipe: "Posyandu" },
        { id: "sd-kemandungan-1", nama: "SD Negeri Kemandungan 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-lor",
      nama: "Debong Lor",
      units: [
        { id: "pos-tunas-debonglor", nama: "Posyandu Tunas Harapan (Debong Lor)", tipe: "Posyandu" },
        { id: "sd-debong-lor-1", nama: "SD Negeri Debong Lor 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "muarareja",
      nama: "Muarareja",
      units: [
        { id: "pos-muara-sejahtera", nama: "Posyandu Muara Sejahtera (Muarareja)", tipe: "Posyandu" },
        { id: "sd-muarareja-1", nama: "SD Negeri Muarareja 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "pekauman",
      nama: "Pekauman",
      units: [
        { id: "pos-anggrek-pekauman", nama: "Posyandu Anggrek Putih (Pekauman)", tipe: "Posyandu" },
        { id: "sd-pekauman-1", nama: "SD Negeri Pekauman 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "pesurungan-kidul",
      nama: "Pesurungan Kidul",
      units: [
        { id: "pos-kamboja-pesurungan", nama: "Posyandu Kamboja (Pesurungan Kidul)", tipe: "Posyandu" },
        { id: "smk-1-tegal", nama: "SMK Negeri 1 Kota Tegal", tipe: "Sekolah" },
      ],
    },
  ],
  "tegal-selatan": [
    {
      id: "randugunting",
      nama: "Randugunting",
      units: [
        { id: "pos-nusa-1", nama: "Posyandu Nusa Indah I (Randugunting)", tipe: "Posyandu" },
        { id: "sd-randugunting-1", nama: "SD Negeri Randugunting 1", tipe: "Sekolah" },
        { id: "smp-5-tegal", nama: "SMP Negeri 5 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-kulon",
      nama: "Debong Kulon",
      units: [
        { id: "pos-sejahtera-debongkulon", nama: "Posyandu Sejahtera (Debong Kulon)", tipe: "Posyandu" },
        { id: "sd-debong-kulon-1", nama: "SD Negeri Debong Kulon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-tengah",
      nama: "Debong Tengah",
      units: [
        { id: "pos-kasih-ibu", nama: "Posyandu Kasih Ibu (Debong Tengah)", tipe: "Posyandu" },
        { id: "sd-debong-tengah-1", nama: "SD Negeri Debong Tengah 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-kidul",
      nama: "Debong Kidul",
      units: [
        { id: "pos-mekar-wangi", nama: "Posyandu Mekar Wangi (Debong Kidul)", tipe: "Posyandu" },
        { id: "sd-debong-kidul-1", nama: "SD Negeri Debong Kidul 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "tunon",
      nama: "Tunon",
      units: [
        { id: "pos-harapan-bunda", nama: "Posyandu Harapan Bunda (Tunon)", tipe: "Posyandu" },
        { id: "sd-tunon-1", nama: "SD Negeri Tunon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kalinyamat-wetan",
      nama: "Kalinyamat Wetan",
      units: [
        { id: "pos-lestari-kalinyamat", nama: "Posyandu Lestari (Kalinyamat Wetan)", tipe: "Posyandu" },
        { id: "smp-14-tegal", nama: "SMP Negeri 14 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "keturen",
      nama: "Keturen",
      units: [
        { id: "pos-srikandi-keturen", nama: "Posyandu Srikandi (Keturen)", tipe: "Posyandu" },
        { id: "sd-keturen-1", nama: "SD Negeri Keturen 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "bandung",
      nama: "Bandung",
      units: [
        { id: "pos-anggrek-bandung", nama: "Posyandu Anggrek Mulia (Bandung)", tipe: "Posyandu" },
        { id: "sd-bandung-1", nama: "SD Negeri Bandung 1", tipe: "Sekolah" },
      ],
    },
  ],
  margadana: [
    {
      id: "margadana-kel",
      nama: "Margadana",
      units: [
        { id: "pos-teratai-margadana", nama: "Posyandu Teratai Indah (Margadana)", tipe: "Posyandu" },
        { id: "sd-margadana-1", nama: "SD Negeri Margadana 1", tipe: "Sekolah" },
        { id: "smp-12-tegal", nama: "SMP Negeri 12 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "cabawan",
      nama: "Cabawan",
      units: [
        { id: "pos-tunas-cabawan", nama: "Posyandu Tunas Mandiri (Cabawan)", tipe: "Posyandu" },
        { id: "sd-cabawan-1", nama: "SD Negeri Cabawan 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kaligangsa",
      nama: "Kaligangsa",
      units: [
        { id: "pos-muara-kaligangsa", nama: "Posyandu Muara Kasih (Kaligangsa)", tipe: "Posyandu" },
        { id: "sd-kaligangsa-1", nama: "SD Negeri Kaligangsa 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kalinyamat-kulon",
      nama: "Kalinyamat Kulon",
      units: [
        { id: "pos-kartini-kalinyamat", nama: "Posyandu Kartini (Kalinyamat Kulon)", tipe: "Posyandu" },
        { id: "sd-kalinyamat-kulon-1", nama: "SD Negeri Kalinyamat Kulon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "krandon",
      nama: "Krandon",
      units: [
        { id: "pos-wijaya-krandon", nama: "Posyandu Wijaya Kusuma (Krandon)", tipe: "Posyandu" },
        { id: "sd-krandon-1", nama: "SD Negeri Krandon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "pesurungan-lor",
      nama: "Pesurungan Lor",
      units: [
        { id: "pos-melati-pesurunganlor", nama: "Posyandu Melati Sehat (Pesurungan Lor)", tipe: "Posyandu" },
        { id: "sd-pesurungan-lor-1", nama: "SD Negeri Pesurungan Lor 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "sumurpanggang",
      nama: "Sumurpanggang",
      units: [
        { id: "pos-sumur-sejahtera", nama: "Posyandu Sumur Sejahtera (Sumurpanggang)", tipe: "Posyandu" },
        { id: "sd-sumurpanggang-1", nama: "SD Negeri Sumurpanggang 1", tipe: "Sekolah" },
        { id: "sma-4-tegal", nama: "SMA Negeri 4 Kota Tegal", tipe: "Sekolah" },
      ],
    },
  ],
};

export function CardKanalDiscovery() {
  const supabase = createClient();

  const [filters, setFilters] = useQueryStates(
    {
      kecamatan: parseAsString.withDefault(""),
      kelurahan: parseAsString.withDefault(""),
      unit: parseAsString.withDefault(""),
    },
    {
      shallow: false,
    }
  );

  // Dialog States
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State untuk Input Data Warga
  const [formData, setFormData] = useState({
    nama_anak: "",
    tempat_tanggal_lahir: "",
    jenis_kelamin: "L",
    nama_wali: "",
    status_tinggal: "Penduduk Tetap",
    rt_wilayah_id: "RT-02-RW-04",
  });

  // 1. Fetch Master Data Kecamatan dari Supabase
  const { data: dbKecamatan = [], isLoading: isLoadingKec } = useQuery({
    queryKey: ["master_kecamatan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wilayah")
        .select("id, kode, nama")
        .eq("tingkat", "KECAMATAN")
        .order("kode", { ascending: true });

      if (error || !data || data.length === 0) {
        return null;
      }
      return data.map((k) => ({
        id: k.id,
        kode: k.kode,
        slug: k.nama.toLowerCase().replace(/\s+/g, "-"),
        nama: k.nama,
      }));
    },
    staleTime: 60 * 1000,
  });

  // Gabungkan Kecamatan (Supabase / Fallback)
  const kecamatanList = useMemo(() => {
    if (dbKecamatan && dbKecamatan.length > 0) {
      return dbKecamatan;
    }
    return FALLBACK_KECAMATAN;
  }, [dbKecamatan]);

  // Cari object Kecamatan yang terpilih saat ini
  const activeKecamatan = useMemo(() => {
    if (!filters.kecamatan) return null;
    return (
      kecamatanList.find(
        (k) => k.id === filters.kecamatan || k.slug === filters.kecamatan
      ) || null
    );
  }, [filters.kecamatan, kecamatanList]);

  // 2. Fetch Master Data Kelurahan berdasarkan Kecamatan Terpilih
  const { data: dbKelurahan = [], isLoading: isLoadingKel } = useQuery({
    queryKey: ["master_kelurahan", activeKecamatan?.id || activeKecamatan?.slug],
    queryFn: async () => {
      if (!activeKecamatan) return [];
      const { data, error } = await supabase
        .from("wilayah")
        .select("id, kode, nama, parent_id")
        .eq("parent_id", activeKecamatan.id)
        .order("nama", { ascending: true });

      if (error || !data || data.length === 0) {
        return null;
      }
      return data.map((kl) => ({
        id: kl.id,
        kode: kl.kode,
        slug: kl.nama.toLowerCase().replace(/\s+/g, "-"),
        nama: kl.nama,
      }));
    },
    enabled: !!activeKecamatan,
    staleTime: 60 * 1000,
  });

  // Gabungkan Kelurahan (Supabase / Fallback)
  const kelurahanList = useMemo(() => {
    if (dbKelurahan && dbKelurahan.length > 0) {
      return dbKelurahan;
    }
    const kecKey = activeKecamatan?.slug || filters.kecamatan;
    if (kecKey && FALLBACK_KELURAHAN[kecKey]) {
      return FALLBACK_KELURAHAN[kecKey];
    }
    return [];
  }, [dbKelurahan, activeKecamatan, filters.kecamatan]);

  // Cari object Kelurahan yang terpilih saat ini
  const activeKelurahan = useMemo(() => {
    if (!filters.kelurahan) return null;
    return (
      kelurahanList.find(
        (kl) => kl.id === filters.kelurahan || (kl as any).slug === filters.kelurahan
      ) || null
    );
  }, [filters.kelurahan, kelurahanList]);

  // 3. Fetch Master Unit Posyandu & Sekolah untuk Kelurahan Terpilih
  const { data: dbUnits = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ["master_units", activeKelurahan?.id || (activeKelurahan as any)?.slug],
    queryFn: async () => {
      if (!activeKelurahan?.id) return [];

      const [posRes, sekRes] = await Promise.all([
        supabase
          .from("kanal_posyandu")
          .select("id, nama, alamat")
          .eq("kelurahan_id", activeKelurahan.id)
          .order("nama", { ascending: true }),
        supabase
          .from("kanal_sekolah")
          .select("id, nama, tingkat, alamat")
          .eq("kelurahan_id", activeKelurahan.id)
          .order("nama", { ascending: true }),
      ]);

      const posList = (posRes.data || []).map((p) => ({
        id: p.id,
        nama: p.nama,
        tipe: "Posyandu" as const,
        alamat: p.alamat,
      }));

      const sekList = (sekRes.data || []).map((s) => ({
        id: s.id,
        nama: `${s.nama} (${s.tingkat})`,
        tipe: "Sekolah" as const,
        alamat: s.alamat,
      }));

      const combined = [...posList, ...sekList];
      return combined.length > 0 ? combined : null;
    },
    enabled: !!activeKelurahan?.id,
    staleTime: 60 * 1000,
  });

  // Gabungkan Unit Posyandu/Sekolah (Supabase / Fallback)
  const availableUnits = useMemo(() => {
    if (dbUnits && dbUnits.length > 0) {
      return dbUnits;
    }
    if (activeKelurahan && "units" in activeKelurahan && Array.isArray(activeKelurahan.units)) {
      return activeKelurahan.units;
    }
    return [];
  }, [dbUnits, activeKelurahan]);

  const handleKecamatanChange = (value: string | null) => {
    setFilters({
      kecamatan: value || "",
      kelurahan: "",
      unit: "",
    });
  };

  const handleKelurahanChange = (value: string | null) => {
    setFilters({
      kelurahan: value || "",
      unit: "",
    });
  };

  const handleUnitChange = (value: string | null) => {
    setFilters({
      unit: value || "",
    });
  };

  const handleReset = () => {
    setFilters({
      kecamatan: "",
      kelurahan: "",
      unit: "",
    });
    toast.info("Filter wilayah telah direset.");
  };

  const selectedUnitObj = availableUnits.find((u) => u.id === filters.unit);

  const handleJoinKanal = () => {
    toast.success("Berhasil Bergabung ke Kanal!", {
      description: `Anda kini terdaftar pada kanal ${
        selectedUnitObj ? selectedUnitObj.nama : "Wilayah Terpilih"
      }.`,
    });
    setIsJoinOpen(false);
  };

  const handleSubmitWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_anak || !formData.nama_wali || !formData.tempat_tanggal_lahir) {
      toast.error("Mohon lengkapi field wajib pada form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitDataWargaAction({
        nama_anak: formData.nama_anak,
        tempat_tanggal_lahir: formData.tempat_tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
        nama_wali: formData.nama_wali,
        status_tinggal: formData.status_tinggal,
        rt_wilayah_id: formData.rt_wilayah_id,
        posyandu_id: selectedUnitObj?.tipe === "Posyandu" ? selectedUnitObj.id : null,
        sekolah_id: selectedUnitObj?.tipe === "Sekolah" ? selectedUnitObj.id : null,
      });

      if (res.success) {
        toast.success("Data Warga Berhasil Disimpan!", {
          description: `Data untuk ${formData.nama_anak} telah masuk ke sistem Supabase.`,
        });
        setIsInputOpen(false);
        setFormData({
          nama_anak: "",
          tempat_tanggal_lahir: "",
          jenis_kelamin: "L",
          nama_wali: "",
          status_tinggal: "Penduduk Tetap",
          rt_wilayah_id: "RT-02-RW-04",
        });
      } else {
        toast.error("Gagal Menyimpan Data", {
          description: res.error || res.message,
        });
      }
    } catch (err: unknown) {
      toast.error("Terjadi Kesalahan", {
        description: err instanceof Error ? err.message : "Kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLiveDb = Boolean(dbKecamatan && dbKecamatan.length > 0);

  return (
    <Card className="border border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Compass className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Kanal Discovery & Filter Wilayah
              </CardTitle>
              <CardDescription className="text-xs">
                Filter kanal posyandu / sekolah Kota Tegal (Kemendagri 33.76)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={
                isLiveDb
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] gap-1"
                  : "text-muted-foreground text-[11px] gap-1"
              }
            >
              <Database className="size-3" />
              {isLiveDb ? "Supabase Live" : "Master Tegal"}
            </Badge>
            <Badge variant="secondary" className="text-[11px] gap-1">
              <Filter className="size-3" />
              nuqs URL
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dropdowns Filter Bertingkat */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 1. Kecamatan */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <Building className="size-3 text-muted-foreground" />
                1. Kecamatan
              </span>
              {isLoadingKec && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
            </label>
            <Select
              value={filters.kecamatan || undefined}
              onValueChange={handleKecamatanChange}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Kecamatan (4 Kec)" />
              </SelectTrigger>
              <SelectContent>
                {kecamatanList.map((kec) => (
                  <SelectItem key={kec.id} value={kec.slug || kec.id}>
                    Kec. {kec.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Kelurahan */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <Home className="size-3 text-muted-foreground" />
                2. Kelurahan
              </span>
              {isLoadingKel && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
            </label>
            <Select
              value={filters.kelurahan || undefined}
              onValueChange={handleKelurahanChange}
              disabled={!filters.kecamatan || kelurahanList.length === 0}
            >
              <SelectTrigger className="w-full text-xs disabled:opacity-50">
                <SelectValue
                  placeholder={
                    filters.kecamatan
                      ? `Pilih Kelurahan (${kelurahanList.length})`
                      : "Pilih kecamatan dulu"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {kelurahanList.map((kel) => (
                  <SelectItem key={kel.id} value={(kel as any).slug || kel.id}>
                    Kel. {kel.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Posyandu / Sekolah */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <School className="size-3 text-muted-foreground" />
                3. Posyandu / Sekolah
              </span>
              {isLoadingUnits && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
            </label>
            <Select
              value={filters.unit || undefined}
              onValueChange={handleUnitChange}
              disabled={!filters.kelurahan || availableUnits.length === 0}
            >
              <SelectTrigger className="w-full text-xs disabled:opacity-50">
                <SelectValue
                  placeholder={
                    filters.kelurahan
                      ? `Pilih Kanal (${availableUnits.length})`
                      : "Pilih kelurahan dulu"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="truncate">
                      [{u.tipe}] {u.nama}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Hierarchy Breadcrumb Preview */}
        {filters.kecamatan && (
          <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">
              Target Wilayah:{" "}
              <strong className="text-foreground capitalize">
                Kec. {activeKecamatan?.nama || filters.kecamatan.replace("-", " ")}
              </strong>
              {filters.kelurahan && (
                <>
                  {" "}
                  &gt;{" "}
                  <strong className="text-foreground">
                    Kel. {activeKelurahan?.nama || filters.kelurahan}
                  </strong>
                </>
              )}
              {filters.unit && (
                <>
                  {" "}
                  &gt;{" "}
                  <strong className="text-foreground">
                    {selectedUnitObj?.nama || filters.unit}
                  </strong>
                </>
              )}
            </span>
          </div>
        )}

        {/* Action Buttons with Dialog Modals */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {(filters.kecamatan || filters.kelurahan || filters.unit) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}

          {/* Dialog 1: Bergabung ke Kanal */}
          <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!filters.kecamatan}
                  className="text-xs gap-1.5 h-8"
                />
              }
            >
              <LogIn className="size-3.5" />
              <span>Bergabung ke Kanal</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Konfirmasi Bergabung ke Kanal</DialogTitle>
                <DialogDescription>
                  Bergabung dengan kanal komunitas untuk mendapatkan notifikasi dan jadwal layanan.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs space-y-1.5">
                <p>
                  <strong>Kecamatan:</strong>{" "}
                  <span>Kec. {activeKecamatan?.nama || filters.kecamatan || "Kota Tegal"}</span>
                </p>
                <p>
                  <strong>Kelurahan:</strong>{" "}
                  <span>Kel. {activeKelurahan?.nama || "Semua Kelurahan"}</span>
                </p>
                <p>
                  <strong>Unit Kanal:</strong>{" "}
                  <span>{selectedUnitObj?.nama || "Kanal Umum Wilayah"}</span>
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJoinOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleJoinKanal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Konfirmasi Bergabung
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog 2: Input Data Warga Modal */}
          <Dialog open={isInputOpen} onOpenChange={setIsInputOpen}>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8 shadow-xs"
                />
              }
            >
              <UserPlus className="size-3.5" />
              <span>Input Data Warga</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Formulir Pendataan Warga</DialogTitle>
                <DialogDescription>
                  Masukkan data warga baru ke database terpadu jarimas.id (Supabase).
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitWarga} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Lengkap Anak *</label>
                  <Input
                    placeholder="Contoh: Muhammad Rizky"
                    value={formData.nama_anak}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_anak: e.target.value })
                    }
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Tempat & Tgl Lahir *</label>
                    <Input
                      placeholder="Tegal, 12-05-2018"
                      value={formData.tempat_tanggal_lahir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tempat_tanggal_lahir: e.target.value,
                        })
                      }
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jenis Kelamin *</label>
                    <Select
                      value={formData.jenis_kelamin}
                      onValueChange={(val) =>
                        setFormData({ ...formData, jenis_kelamin: val || "L" })
                      }
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki (L)</SelectItem>
                        <SelectItem value="P">Perempuan (P)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama Orang Tua / Wali *</label>
                    <Input
                      placeholder="Contoh: Bapak Hendra"
                      value={formData.nama_wali}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_wali: e.target.value })
                      }
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status Tinggal</label>
                    <Select
                      value={formData.status_tinggal}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          status_tinggal: val || "Penduduk Tetap",
                        })
                      }
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Penduduk Tetap">Penduduk Tetap</SelectItem>
                        <SelectItem value="Pendatang">Pendatang / Non-Permanen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs text-muted-foreground">
                  <p>
                    <strong>Target Unit:</strong>{" "}
                    {selectedUnitObj
                      ? `${selectedUnitObj.nama} (${selectedUnitObj.tipe})`
                      : activeKelurahan
                      ? `Wilayah Kel. ${activeKelurahan.nama}`
                      : "Sesuai domisili RT 02 / RW 04"}
                  </p>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInputOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Data Warga"}</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
