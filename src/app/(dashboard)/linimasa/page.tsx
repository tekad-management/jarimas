"use client";

import React, { Suspense } from "react";
import {
  CardWelcoming,
  CardIdentityStatus,
  CardStatistics,
  CardKanalDiscovery,
  CardRealtimeFeed,
} from "@/components/cards";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Layers,
  RefreshCw,
  Baby,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function LinimasaContent() {
  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium mb-1.5">
              <Layers className="size-4 text-primary" />
              <span>Kota Tegal</span>
              <span>/</span>
              <span className="font-bold text-foreground">Linimasa Warga</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Dashboard Linimasa Terpadu
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
              Monitoring status identitas domisili kependudukan, kanal komunitas, dan statistik partisipasi warga Kota Tegal.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm font-semibold shadow-2xs"
            >
              <Radio className="size-3.5 animate-pulse text-emerald-500" />
              Realtime Aktif
            </Badge>
          </div>
        </div>

        {/* Grid Kartu Utama - Layout Vertikal Penuh */}
        <div className="grid grid-cols-1 gap-6 w-full">
          {/* 1. Baris Atas: Susunan Vertikal Penuh (CardWelcoming & CardIdentityStatus) */}
          <div className="flex flex-col gap-6 w-full">
            <CardWelcoming />
            <CardIdentityStatus />
          </div>

          {/* Quick Banner: Sensus & Verval Data Anak Usia 0 - 7 Tahun */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-cyan-600/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs shrink-0">
                <Baby className="size-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Modul Prioritas Semester Ganjil 2026/2027
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30">
                    Kota Tegal 33.76
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Pendataan & Verval Silang Data Anak Usia 0 - 7 Tahun
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hubungkan data sensus siswa sekolah berizin, balita posyandu, dan grup RT dengan mekanisme validasi silang.
                </p>
              </div>
            </div>

            <Link href="/data-anak" className="shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 gap-1.5 shadow-xs rounded-xl"
              >
                <span>Buka Modul Verval Anak</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          {/* 2. Card Kanal Discovery & Integrasi Komunitas (Full Width) */}
          <CardKanalDiscovery />

          {/* 3. Card Statistik & Grafik Rekapitulasi (Full Width) */}
          <CardStatistics />

          {/* 4. Realtime Data Warga Feed Section (Full Width) */}
          <CardRealtimeFeed />
        </div>
      </div>
    </div>
  );
}

export default function LinimasaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/20 p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin text-primary" />
            <span>Memuat Linimasa Dashboard...</span>
          </div>
        </div>
      }
    >
      <LinimasaContent />
    </Suspense>
  );
}
