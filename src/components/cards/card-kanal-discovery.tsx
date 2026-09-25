"use client";

import React, { useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Compass,
  Building,
  Home,
  School,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Filter,
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

  const handleAction = () => {
    if (!filters.kecamatan) {
      toast.warning("Silakan pilih Kecamatan terlebih dahulu.");
      return;
    }

    const selectedKecName =
      filters.kecamatan === "tegal-timur"
        ? "Tegal Timur"
        : filters.kecamatan === "tegal-barat"
        ? "Tegal Barat"
        : filters.kecamatan === "tegal-selatan"
        ? "Tegal Selatan"
        : "Margadana";

    const selectedKel = availableKelurahan.find((k) => k.id === filters.kelurahan);
    const selectedUnit = availableUnits.find((u) => u.id === filters.unit);

    toast.success("Kanal Wilayah Ditemukan!", {
      description: `Wilayah: ${selectedKecName} ${
        selectedKel ? `> ${selectedKel.nama}` : ""
      } ${selectedUnit ? `> ${selectedUnit.nama}` : ""}. Siap input data warga!`,
    });
  };

  const isComplete = Boolean(filters.kecamatan && filters.kelurahan);

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
                Cari kanal posyandu / sekolah berdasarkan filter bertingkat URL
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Dropdown 1: Kecamatan */}
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

          {/* Dropdown 2: Kelurahan */}
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

          {/* Dropdown 3: Posyandu / Sekolah */}
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
              Target Wilayah Terpilih:{" "}
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
                    {availableUnits.find((u) => u.id === filters.unit)?.nama ||
                      filters.unit}
                  </strong>
                </>
              )}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {(filters.kecamatan || filters.kelurahan || filters.unit) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reset Filter
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleAction}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 shadow-sm"
          >
            <span>{isComplete ? "Bergabung / Input Data" : "Pilih & Lanjutkan"}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
