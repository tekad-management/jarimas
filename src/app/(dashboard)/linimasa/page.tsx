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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Layers className="size-3.5" />
              <span>Kota Tegal</span>
              <span>/</span>
              <span className="font-semibold text-foreground">Linimasa Warga</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard Linimasa Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Monitoring status identitas domisili kependudukan, kanal komunitas, dan statistik partisipasi warga.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              <Radio className="size-3 animate-pulse text-emerald-500" />
              Realtime Active
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
