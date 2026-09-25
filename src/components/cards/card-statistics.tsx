"use client";

import React, { useEffect, useState } from "react";
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
} from "recharts";
import {
  BarChart3,
  Users,
  UserPlus,
  GraduationCap,
  TrendingUp,
  Activity,
} from "lucide-react";

interface StatisticsDataPoint {
  wilayah: string;
  warga: number;
  anggotaKanal: number;
  anakSekolah: number;
}

const defaultStatisticsData: StatisticsDataPoint[] = [
  { wilayah: "Tegal Timur", warga: 1420, anggotaKanal: 890, anakSekolah: 480 },
  { wilayah: "Tegal Barat", warga: 1250, anggotaKanal: 760, anakSekolah: 410 },
  { wilayah: "Tegal Selatan", warga: 1100, anggotaKanal: 620, anakSekolah: 360 },
  { wilayah: "Margadana", warga: 980, anggotaKanal: 540, anakSekolah: 320 },
];

export function CardStatistics({
  isLoading = false,
  data = defaultStatisticsData,
}: {
  isLoading?: boolean;
  data?: StatisticsDataPoint[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalWarga = data.reduce((acc, curr) => acc + curr.warga, 0);
  const totalAnggotaKanal = data.reduce((acc, curr) => acc + curr.anggotaKanal, 0);
  const totalAnakSekolah = data.reduce((acc, curr) => acc + curr.anakSekolah, 0);

  if (isLoading || !mounted) {
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
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
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
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Statistik Warga & Partisipasi Kanal
              </CardTitle>
              <CardDescription className="text-xs">
                Rekapitulasi total warga terdata, anggota kanal aktif, & anak usia sekolah
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="text-xs gap-1">
            <TrendingUp className="size-3 text-emerald-500" />
            Live Data jarimas.id
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI Mini Cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-blue-500/5 p-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Total Warga Terdata</p>
              <p className="text-base font-bold text-foreground">
                {totalWarga.toLocaleString("id-ID")}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">Jiwa</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-indigo-500/5 p-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Activity className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Anggota Kanal Komunitas</p>
              <p className="text-base font-bold text-foreground">
                {totalAnggotaKanal.toLocaleString("id-ID")}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">Aktif</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-emerald-500/5 p-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Anak Usia Sekolah</p>
              <p className="text-base font-bold text-foreground">
                {totalAnakSekolah.toLocaleString("id-ID")}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">Anak</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recharts Bar Graph */}
        <div className="rounded-lg border border-border/60 bg-background/50 p-3 pt-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="wilayah"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
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
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Bar
                  dataKey="warga"
                  name="Warga Terdata"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="anggotaKanal"
                  name="Anggota Kanal"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="anakSekolah"
                  name="Anak Usia Sekolah"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
