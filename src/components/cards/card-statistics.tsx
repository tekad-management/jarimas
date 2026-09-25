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
} from "lucide-react";

const defaultStatisticsData = [
  { wilayah: "Tegal Timur", penduduk: 1420, pendatang: 210, anakSekolah: 480 },
  { wilayah: "Tegal Barat", penduduk: 1250, pendatang: 180, anakSekolah: 410 },
  { wilayah: "Tegal Selatan", penduduk: 1100, pendatang: 145, anakSekolah: 360 },
  { wilayah: "Margadana", penduduk: 980, pendatang: 120, anakSekolah: 320 },
];

export function CardStatistics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPenduduk = defaultStatisticsData.reduce((acc, curr) => acc + curr.penduduk, 0);
  const totalPendatang = defaultStatisticsData.reduce((acc, curr) => acc + curr.pendatang, 0);
  const totalAnakSekolah = defaultStatisticsData.reduce((acc, curr) => acc + curr.anakSekolah, 0);

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
                Statistik & Rekapitulasi Data Warga
              </CardTitle>
              <CardDescription className="text-xs">
                Perbandingan Penduduk Tetap, Pendatang, & Anak Usia Sekolah
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="text-xs gap-1">
            <TrendingUp className="size-3 text-emerald-500" />
            Live Data Kota Tegal
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
              <p className="text-[11px] text-muted-foreground font-medium">Penduduk Tetap</p>
              <p className="text-base font-bold text-foreground">
                {totalPenduduk.toLocaleString("id-ID")} <span className="text-[10px] font-normal text-muted-foreground">Jiwa</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-amber-500/5 p-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <UserPlus className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Pendatang / Non-Permanen</p>
              <p className="text-base font-bold text-foreground">
                {totalPendatang.toLocaleString("id-ID")} <span className="text-[10px] font-normal text-muted-foreground">Jiwa</span>
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
                {totalAnakSekolah.toLocaleString("id-ID")} <span className="text-[10px] font-normal text-muted-foreground">Anak</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recharts Bar Graph */}
        <div className="rounded-lg border border-border/60 bg-background/50 p-3 pt-4">
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={defaultStatisticsData}
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
                    dataKey="penduduk"
                    name="Penduduk Tetap"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="pendatang"
                    name="Pendatang"
                    fill="#f59e0b"
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
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Memuat grafik statistik...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
