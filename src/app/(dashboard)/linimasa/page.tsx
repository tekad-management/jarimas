"use client";

import React, { Suspense } from "react";
import {
  CardWelcoming,
  CardIdentityStatus,
  CardStatistics,
  CardKanalDiscovery,
  CardRealtimeFeed,
} from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Layers,
  RefreshCw,
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
