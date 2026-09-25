"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  BarChart3,
  Users,
  HeartPulse,
  GraduationCap,
  Landmark,
  TrendingUp,
  Database,
  Layers,
} from "lucide-react";

export interface CardStatisticsProps {
  isLoading?: boolean;
}

export function CardStatistics({ isLoading: propLoading = false }: CardStatisticsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "kecamatan">("ringkasan");
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Riil Data Statistik Partisipasi dari Supabase
  const { data: statsData, isLoading: isQueryLoading } = useQuery({
    queryKey: ["warga_statistics_realtime"],
    queryFn: async () => {
      try {
        const [usersRes, membershipsRes] = await Promise.all([
          supabase
            .from("users")
            .select("id, domisili_kecamatan_id, kk_kecamatan_id", { count: "exact" }),
          supabase
            .from("user_kanal_memberships")
            .select("id, user_id, tipe_kanal, kanal_nama, metadata", { count: "exact" }),
        ]);

        const users = usersRes.data || [];
        const memberships = membershipsRes.data || [];

        const totalWarga = usersRes.count ?? users.length;
        const totalPosyandu = memberships.filter(
          (m: any) => m.tipe_kanal === "POSYANDU"
        ).length;
        const totalSekolah = memberships.filter(
          (m: any) => m.tipe_kanal === "SEKOLAH"
        ).length;
        const totalOpd = memberships.filter(
          (m: any) => m.tipe_kanal === "OPD"
        ).length;

        return {
          totalWarga,
          totalPosyandu,
          totalSekolah,
          totalOpd,
          users,
          memberships,
        };
      } catch (err) {
        console.warn("Error fetching real statistics from Supabase:", err);
        return {
          totalWarga: 0,
          totalPosyandu: 0,
          totalSekolah: 0,
          totalOpd: 0,
          users: [],
          memberships: [],
        };
      }
    },
    staleTime: 1000 * 30,
  });

  const totalWarga = statsData?.totalWarga ?? 0;
  const totalPosyandu = statsData?.totalPosyandu ?? 0;
  const totalSekolah = statsData?.totalSekolah ?? 0;
  const totalOpd = statsData?.totalOpd ?? 0;

  // 1. Data Grafik BarChart: Ringkasan 4 Metrik Partisipasi
  const overviewChartData = useMemo(() => {
    return [
      {
        kategori: "Total Warga",
        jumlah: totalWarga,
        color: "#3b82f6", // Blue
        desc: "Warga Terdaftar",
      },
      {
        kategori: "Kanal Posyandu",
        jumlah: totalPosyandu,
        color: "#10b981", // Emerald
        desc: "Monitoring Balita",
      },
      {
        kategori: "Kanal Sekolah",
        jumlah: totalSekolah,
        color: "#6366f1", // Indigo
        desc: "Satuan Pendidikan",
      },
      {
        kategori: "Kanal OPD",
        jumlah: totalOpd,
        color: "#f59e0b", // Amber
        desc: "Dinas & Layanan",
      },
    ];
  }, [totalWarga, totalPosyandu, totalSekolah, totalOpd]);

  // 2. Data Grafik BarChart: Distribusi 4 Kecamatan Kota Tegal
  const kecamatanChartData = useMemo(() => {
    const users = statsData?.users || [];
    const memberships = statsData?.memberships || [];

    const kecamatanMap: Record<
      string,
      { wilayah: string; warga: number; posyandu: number; sekolah: number; opd: number }
    > = {
      "tegal-timur": { wilayah: "Tegal Timur", warga: 0, posyandu: 0, sekolah: 0, opd: 0 },
      "tegal-barat": { wilayah: "Tegal Barat", warga: 0, posyandu: 0, sekolah: 0, opd: 0 },
      "tegal-selatan": { wilayah: "Tegal Selatan", warga: 0, posyandu: 0, sekolah: 0, opd: 0 },
      margadana: { wilayah: "Margadana", warga: 0, posyandu: 0, sekolah: 0, opd: 0 },
    };

    // Hitung distribusi Warga
    users.forEach((u: any) => {
      const kec = (u.domisili_kecamatan_id || u.kk_kecamatan_id || "").toLowerCase();
      if (kec.includes("timur") || kec.includes("tt") || kec === "33.76.02") {
        kecamatanMap["tegal-timur"].warga++;
      } else if (kec.includes("barat") || kec.includes("tb") || kec === "33.76.01") {
        kecamatanMap["tegal-barat"].warga++;
      } else if (kec.includes("selatan") || kec.includes("ts") || kec === "33.76.03") {
        kecamatanMap["tegal-selatan"].warga++;
      } else if (kec.includes("margadana") || kec.includes("mg") || kec === "33.76.04") {
        kecamatanMap["margadana"].warga++;
      } else {
        // Fallback rata ke Tegal Timur jika belum diset
        kecamatanMap["tegal-timur"].warga++;
      }
    });

    // Hitung distribusi Kanal
    memberships.forEach((m: any) => {
      const kecMeta = (m.metadata?.kecamatan || m.metadata?.kelurahan_id || "").toLowerCase();
      let targetKec = "tegal-timur";
      if (kecMeta.includes("barat") || kecMeta.includes("tb")) targetKec = "tegal-barat";
      else if (kecMeta.includes("selatan") || kecMeta.includes("ts")) targetKec = "tegal-selatan";
      else if (kecMeta.includes("margadana") || kecMeta.includes("mg")) targetKec = "margadana";

      if (m.tipe_kanal === "POSYANDU") kecamatanMap[targetKec].posyandu++;
      else if (m.tipe_kanal === "SEKOLAH") kecamatanMap[targetKec].sekolah++;
      else if (m.tipe_kanal === "OPD") kecamatanMap[targetKec].opd++;
    });

    return Object.values(kecamatanMap);
  }, [statsData]);

  const isLoading = propLoading || isQueryLoading || !mounted;

  if (isLoading) {
    return (
      <Card className="border border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Statistik Warga & Partisipasi Kanal
              </CardTitle>
              <CardDescription className="text-xs">
                Rekapitulasi riil data pengguna & keanggotaan kanal terintegrasi (Supabase)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs gap-1 py-0.5"
            >
              <Database className="size-3" />
              Live Supabase
            </Badge>

            {/* Toggle View Mode */}
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("ringkasan")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === "ringkasan"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                4 Metrik Kanal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("kecamatan")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === "kecamatan"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Per Kecamatan
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ============================================================================== */}
        {/* 4 KARTU METRIK RINGKAS RIIL SUPABASE */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Warga Bergabung */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-500/25 bg-blue-500/5 p-3 transition-all hover:bg-blue-500/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Users className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                Total Warga Bergabung
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {totalWarga.toLocaleString("id-ID")}{" "}
                <span className="text-[11px] font-normal text-muted-foreground">Warga</span>
              </p>
              <p className="text-[10px] text-muted-foreground/80 truncate">
                Pengguna terdaftar di database
              </p>
            </div>
          </div>

          {/* 2. Anggota Kanal Posyandu */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 transition-all hover:bg-emerald-500/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <HeartPulse className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                Anggota Kanal Posyandu
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {totalPosyandu.toLocaleString("id-ID")}{" "}
                <span className="text-[11px] font-normal text-muted-foreground">Anggota</span>
              </p>
              <p className="text-[10px] text-muted-foreground/80 truncate">
                Kanal Posyandu Kelurahan
              </p>
            </div>
          </div>

          {/* 3. Anggota Kanal Sekolah */}
          <div className="flex items-center gap-3 rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3 transition-all hover:bg-indigo-500/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                Anggota Kanal Sekolah
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {totalSekolah.toLocaleString("id-ID")}{" "}
                <span className="text-[11px] font-normal text-muted-foreground">Anggota</span>
              </p>
              <p className="text-[10px] text-muted-foreground/80 truncate">
                PAUD / TK / SD / SMP / SMK
              </p>
            </div>
          </div>

          {/* 4. Anggota Kanal OPD */}
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 transition-all hover:bg-amber-500/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Landmark className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                Anggota Kanal OPD
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {totalOpd.toLocaleString("id-ID")}{" "}
                <span className="text-[11px] font-normal text-muted-foreground">Anggota</span>
              </p>
              <p className="text-[10px] text-muted-foreground/80 truncate">
                Dinas & Layanan Publik Kota Tegal
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* RECHARTS BAR CHART VISUALISASI DINAMIS */}
        {/* ============================================================================== */}
        <div className="rounded-xl border border-border/70 bg-background/50 p-3 pt-4">
          <div className="flex items-center justify-between pb-2 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {activeTab === "ringkasan"
                  ? "Komparasi Partisipasi 4 Kanal Utama"
                  : "Distribusi Partisipasi di 4 Kecamatan Kota Tegal"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Grafik Partisipasi Terkini
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "ringkasan" ? (
                <BarChart
                  data={overviewChartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="kategori"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.8 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "currentColor", opacity: 0.8 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ fill: "rgba(100, 100, 100, 0.08)" }}
                    formatter={(value: any) => [`${value} Partisipan`, "Jumlah"]}
                  />
                  <Bar
                    dataKey="jumlah"
                    name="Jumlah Partisipan"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  >
                    {overviewChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={kecamatanChartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="wilayah"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.8 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "currentColor", opacity: 0.8 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ fill: "rgba(100, 100, 100, 0.08)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar
                    dataKey="warga"
                    name="Warga Bergabung"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="posyandu"
                    name="Kanal Posyandu"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="sekolah"
                    name="Kanal Sekolah"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="opd"
                    name="Kanal OPD"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
