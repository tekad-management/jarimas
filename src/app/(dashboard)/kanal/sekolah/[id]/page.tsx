"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { MASTER_ALL_SEKOLAH_TEGAL } from "@/components/cards/card-kanal-discovery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Sparkles,
  School,
  UserCheck,
  Award,
  CheckCircle2,
} from "lucide-react";

interface SekolahDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SekolahDetailPage({ params }: SekolahDetailPageProps) {
  const resolvedParams = use(params);
  const sekolahId = decodeURIComponent(resolvedParams.id);
  const supabase = createClient();

  // Cari data sekolah dari master dataset atau fallback
  const sekolah = MASTER_ALL_SEKOLAH_TEGAL.find(
    (s) => s.id === sekolahId || s.npsn === sekolahId || s.nama.toLowerCase().replace(/\s+/g, "-") === sekolahId.toLowerCase()
  ) || {
    id: sekolahId,
    npsn: "NPSN Terdaftar",
    nama: sekolahId.replace(/^sek-/, "").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    jenjang: "SD" as const,
    subJenjang: "SD",
    naungan: "DISDIK" as const,
    status: "NEGERI",
    kelurahan: "Kota Tegal",
    kecamatan: "Kota Tegal",
    alamat: "Kota Tegal, Jawa Tengah",
  };

  // Cek Status Keanggotaan Pengguna di Sekolah ini
  const { data: membership } = useQuery({
    queryKey: ["sekolah_membership", sekolah.id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_kanal_memberships")
        .select("*")
        .eq("user_id", user.id)
        .eq("kanal_id", sekolah.id)
        .maybeSingle();

      return data || null;
    },
  });

  const peranList: string[] = React.useMemo(() => {
    if (!membership?.peran) return ["Orang Tua / Wali Siswa"];
    if (Array.isArray(membership.peran)) return membership.peran;
    return typeof membership.peran === "string"
      ? membership.peran.split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["Orang Tua / Wali Siswa"];
  }, [membership]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigasi Balik & Breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/linimasa">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="size-3.5" />
              Kembali ke Linimasa
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/linimasa" className="hover:underline">
              Linimasa
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Kanal Sekolah</span>
          </div>
        </div>

        {/* Hero Card Sekolah */}
        <Card className="border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-background to-blue-500/5 shadow-xs overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shrink-0">
                  <GraduationCap className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {sekolah.nama}
                    </CardTitle>
                    <Badge className="bg-indigo-600 text-white text-xs gap-1 py-0.5">
                      <ShieldCheck className="size-3" />
                      NPSN: {sekolah.npsn}
                    </Badge>
                    <Badge variant="outline" className="border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      {sekolah.status} • {sekolah.jenjang}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Home className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      Kel. {sekolah.kelurahan}
                    </span>
                    <span>•</span>
                    <span>Kec. {sekolah.kecamatan}</span>
                    <span>•</span>
                    <span>Kota Tegal</span>
                  </CardDescription>
                </div>
              </div>

              {/* Status Keanggotaan */}
              <div className="flex flex-col sm:items-end gap-1.5 self-start">
                <span className="text-[11px] text-muted-foreground font-medium">Status Anda di Kanal:</span>
                <div className="flex flex-wrap gap-1.5">
                  {peranList.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="border-indigo-500/40 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5"
                    >
                      <UserCheck className="size-3 mr-1" />
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0">
            {/* Grid Highlight Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-indigo-600" />
                  Jenjang & Tingkat
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {sekolah.jenjang} ({sekolah.subJenjang})
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-indigo-600" />
                  Tahun Ajaran Aktif
                </span>
                <p className="text-xs font-semibold text-foreground">
                  2026/2027 Semester Ganjil
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-indigo-600" />
                  Komunitas Terintegrasi
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Wali Murid, Guru & Komite
                </p>
              </div>
            </div>

            {/* Menu Fitur Kanal Sekolah */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                Layanan & Informasi Akademik Terpadu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <School className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Pengumuman & Agenda Akademik
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Informasi kalender pendidikan, ujian semester, kegiatan ekstrakurikuler, dan libur sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Award className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Bantuan PIP & Beasiswa Prestasi
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Penyaluran Program Indonesia Pintar (PIP) dan bantuan seragam sekolah dari Pemkot Tegal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Forum Komite & Orang Tua
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Kanal komunikasi aktif antara pengurus komite sekolah, wali murid, dan pihak manajemen sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <BookOpen className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Penerimaan Peserta Didik Baru (PPDB)
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Informasi zonasi kelurahan, syarat berkas administrasi KK/KTP, dan jadwal pendaftaran online.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
