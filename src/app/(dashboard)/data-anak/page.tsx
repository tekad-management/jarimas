"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { CardTabelDataAnak } from "@/components/data-anak";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Baby,
  Layers,
  Radio,
  ArrowLeft,
  ShieldCheck,
  Building2,
  HeartPulse,
  School,
  Sparkles,
  RefreshCw,
  Info,
} from "lucide-react";
import { DEFAULT_SEMESTER_ACTIVE } from "@/lib/validators/data-anak-schema";

function DataAnakPageContent() {
  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigasi Balik & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
            <Link href="/linimasa" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Layers className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Linimasa</span>
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">Data Anak (0 - 7 Thn)</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 gap-1.5 py-1 px-3 text-xs font-semibold"
            >
              <Radio className="size-3 animate-pulse text-emerald-500" />
              Realtime Verval Aktif
            </Badge>
          </div>
        </div>

        {/* Banner Penjelasan Alur Verval Silang */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-cyan-600/10 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Baby className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Sensus & Workflow Verval Data Anak Usia 0 - 7 Tahun
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Sistem Pendataan Terpadu Semester {DEFAULT_SEMESTER_ACTIVE} • Kota Tegal (Kode 33.76)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <School className="size-4 text-emerald-600" />
                <span>1. Kanal Sekolah (TK/PAUD)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Mendaftarkan data siswa sekolah berizin. Data langsung mengalir ke Grup RT & Posyandu sesuai alamat domisili untuk divalidasi.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Building2 className="size-4 text-emerald-600" />
                <span>2. Grup RT & Posyandu (Verval)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Melakukan Verval (Valid / Tidak Valid + Catatan). Menginput anak usia dini yang belum sekolah atau lembaga tidak berizin.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <HeartPulse className="size-4 text-emerald-600" />
                <span>3. Tumbuh Kembang & Pantau</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Posyandu menginput penimbangan (TB, BB, Lingkar Kepala). Sekolah memvalidasi kesehatan, dan Pemerintah Kota memantau rekap.
              </p>
            </div>
          </div>
        </div>

        {/* Master Card & Tabel Data Anak Component */}
        <CardTabelDataAnak
          initialRoleContext="SEKOLAH"
          title="Daftar Data Anak & Status Verval Antar-Kanal"
          description="Gunakan fitur simulasi peran di atas untuk menguji aksi input pendaftaran sekolah, validasi silang RT/Posyandu, pencatatan kesehatan, atau pantauan read-only."
        />
      </div>
    </div>
  );
}

export default function DataAnakPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/20 p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin text-emerald-600" />
            <span>Memuat Modul Data Anak & Verval...</span>
          </div>
        </div>
      }
    >
      <DataAnakPageContent />
    </Suspense>
  );
}
