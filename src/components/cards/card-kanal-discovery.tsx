"use client";

import React, { useMemo, useState } from "react";
import { useQueryStates, parseAsString } from "nuqs";
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
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Filter,
  UserPlus,
  LogIn,
  Loader2,
} from "lucide-react";

// Data referensi wilayah Kota Tegal
const REGION_DATA: Record<
  string,
  {
    kelurahan: {
      id: string;
      nama: string;
      units: { id: string; nama: string; tipe: "Posyandu" | "Sekolah" }[];
    }[];
  }
> = {
  "tegal-timur": {
    kelurahan: [
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
        id: "slerok",
        nama: "Slerok",
        units: [
          { id: "pos-mawar-slerok", nama: "Posyandu Mawar (Slerok)", tipe: "Posyandu" },
          { id: "sd-slerok-2", nama: "SD Negeri Slerok 2", tipe: "Sekolah" },
        ],
      },
      {
        id: "kejambon",
        nama: "Kejambon",
        units: [
          { id: "pos-dahlia-kejambon", nama: "Posyandu Dahlia (Kejambon)", tipe: "Posyandu" },
          { id: "sd-kejambon-1", nama: "SD Negeri Kejambon 1", tipe: "Sekolah" },
        ],
      },
      {
        id: "panggung",
        nama: "Panggung",
        units: [
          { id: "pos-kenanga-panggung", nama: "Posyandu Kenanga (Panggung)", tipe: "Posyandu" },
          { id: "sd-panggung-3", nama: "SD Negeri Panggung 3", tipe: "Sekolah" },
        ],
      },
    ],
  },
  "tegal-barat": {
    kelurahan: [
      {
        id: "kraton",
        nama: "Kraton",
        units: [
          { id: "pos-cempaka-kraton", nama: "Posyandu Cempaka (Kraton)", tipe: "Posyandu" },
          { id: "sd-kraton-1", nama: "SD Negeri Kraton 1", tipe: "Sekolah" },
        ],
      },
      {
        id: "tegalsari",
        nama: "Tegalsari",
        units: [
          { id: "pos-bahari-tegalsari", nama: "Posyandu Bahari (Tegalsari)", tipe: "Posyandu" },
          { id: "smp-7-tegal", nama: "SMP Negeri 7 Kota Tegal", tipe: "Sekolah" },
        ],
      },
      {
        id: "kemandungan",
        nama: "Kemandungan",
        units: [
          { id: "pos-asri-kemandungan", nama: "Posyandu Asri (Kemandungan)", tipe: "Posyandu" },
        ],
      },
    ],
  },
  "tegal-selatan": {
    kelurahan: [
      {
        id: "randugunting",
        nama: "Randugunting",
        units: [
          { id: "pos-nusa-randugunting", nama: "Posyandu Nusa Indah (Randugunting)", tipe: "Posyandu" },
          { id: "sd-randugunting-1", nama: "SD Negeri Randugunting 1", tipe: "Sekolah" },
        ],
      },
      {
        id: "bandung",
        nama: "Bandung",
        units: [
          { id: "pos-anggrek-bandung", nama: "Posyandu Anggrek (Bandung)", tipe: "Posyandu" },
        ],
      },
    ],
  },
  margadana: {
    kelurahan: [
      {
        id: "margadana-kel",
        nama: "Margadana",
        units: [
          { id: "pos-teratai-margadana", nama: "Posyandu Teratai (Margadana)", tipe: "Posyandu" },
          { id: "sd-margadana-1", nama: "SD Negeri Margadana 1", tipe: "Sekolah" },
        ],
      },
      {
        id: "sumurpanggang",
        nama: "Sumurpanggang",
        units: [
          { id: "pos-melati-sumurpanggang", nama: "Posyandu Melati (Sumurpanggang)", tipe: "Posyandu" },
          { id: "sma-4-tegal", nama: "SMA Negeri 4 Kota Tegal", tipe: "Sekolah" },
        ],
      },
    ],
  },
};

export function CardKanalDiscovery() {
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
    nik_anak: "",
    tempat_tanggal_lahir: "",
    jenis_kelamin: "L",
    nama_wali: "",
    status_tinggal: "Penduduk Tetap",
    rt_wilayah_id: "RT-02-RW-04",
  });

  const availableKelurahan = useMemo(() => {
    if (!filters.kecamatan || !REGION_DATA[filters.kecamatan]) return [];
    return REGION_DATA[filters.kecamatan].kelurahan;
  }, [filters.kecamatan]);

  const availableUnits = useMemo(() => {
    if (!filters.kelurahan) return [];
    const kel = availableKelurahan.find((k) => k.id === filters.kelurahan);
    return kel ? kel.units : [];
  }, [filters.kelurahan, availableKelurahan]);

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
        nik_anak: formData.nik_anak || null,
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
          nik_anak: "",
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
                Filter kanal posyandu / sekolah berbasis URL (nuqs)
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs gap-1">
            <Filter className="size-3" />
            URL-Synced (nuqs)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dropdowns Filter */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 1. Kecamatan */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Building className="size-3 text-muted-foreground" />
              1. Kecamatan
            </label>
            <Select
              value={filters.kecamatan || undefined}
              onValueChange={handleKecamatanChange}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tegal-timur">Kec. Tegal Timur</SelectItem>
                <SelectItem value="tegal-barat">Kec. Tegal Barat</SelectItem>
                <SelectItem value="tegal-selatan">Kec. Tegal Selatan</SelectItem>
                <SelectItem value="margadana">Kec. Margadana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Kelurahan */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Home className="size-3 text-muted-foreground" />
              2. Kelurahan
            </label>
            <Select
              value={filters.kelurahan || undefined}
              onValueChange={handleKelurahanChange}
              disabled={!filters.kecamatan || availableKelurahan.length === 0}
            >
              <SelectTrigger className="w-full text-xs disabled:opacity-50">
                <SelectValue
                  placeholder={
                    filters.kecamatan
                      ? "Pilih Kelurahan"
                      : "Pilih kecamatan dulu"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableKelurahan.map((kel) => (
                  <SelectItem key={kel.id} value={kel.id}>
                    Kel. {kel.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Posyandu / Sekolah */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <School className="size-3 text-muted-foreground" />
              3. Posyandu / Sekolah
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
                      ? "Pilih Posyandu / Sekolah"
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
                {filters.kecamatan.replace("-", " ")}
              </strong>
              {filters.kelurahan && (
                <>
                  {" "}
                  &gt;{" "}
                  <strong className="text-foreground">
                    Kel.{" "}
                    {availableKelurahan.find((k) => k.id === filters.kelurahan)
                      ?.nama || filters.kelurahan}
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
                  <span className="capitalize">{filters.kecamatan || "Kota Tegal"}</span>
                </p>
                <p>
                  <strong>Kelurahan:</strong>{" "}
                  <span>
                    {availableKelurahan.find((k) => k.id === filters.kelurahan)?.nama || "Semua Kelurahan"}
                  </span>
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium">NIK Anak (16 Digit)</label>
                    <Input
                      placeholder="3328xxxxxxxxxxxx"
                      value={formData.nik_anak}
                      onChange={(e) =>
                        setFormData({ ...formData, nik_anak: e.target.value })
                      }
                      maxLength={16}
                      className="text-xs font-mono"
                    />
                  </div>
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
