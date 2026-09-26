"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ALL_MASTER_POSYANDU_TEGAL } from "@/components/cards/card-kanal-discovery";
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
  HeartPulse,
  Home,
  Calendar,
  Users,
  ShieldCheck,
  ArrowLeft,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  Baby,
  UserCheck,
} from "lucide-react";

interface PosyanduDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PosyanduDetailPage({ params }: PosyanduDetailPageProps) {
  const resolvedParams = use(params);
  const posyanduId = decodeURIComponent(resolvedParams.id);
  const supabase = createClient();

  // Cari Posyandu dari dataset master
  const posyandu = ALL_MASTER_POSYANDU_TEGAL.find(
    (p) => p.id === posyanduId || p.nama.toLowerCase().replace(/\s+/g, "-") === posyanduId.toLowerCase()
  ) || {
    id: posyanduId,
    nama: posyanduId.replace(/^pos-/, "").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    kelurahan: "Kota Tegal",
    kelurahanId: "tegal",
    kecamatan: "Kota Tegal",
    kecamatanId: "tegal",
  };

  // Cek Status Keanggotaan Pengguna di Posyandu ini
  const { data: membership } = useQuery({
    queryKey: ["posyandu_membership", posyandu.id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_kanal_memberships")
        .select("*")
        .eq("user_id", user.id)
        .eq("kanal_id", posyandu.id)
        .maybeSingle();

      return data || null;
    },
  });

  const peranList: string[] = React.useMemo(() => {
    if (!membership?.peran) return ["Warga"];
    if (Array.isArray(membership.peran)) return membership.peran;
    return typeof membership.peran === "string"
      ? membership.peran.split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["Warga"];
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
            <span className="text-foreground font-semibold">Kanal Posyandu</span>
          </div>
        </div>

        {/* Hero Card Posyandu */}
        <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 shadow-xs overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
                  <HeartPulse className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {posyandu.nama}
                    </CardTitle>
                    <Badge className="bg-emerald-600 text-white text-xs gap-1 py-0.5">
                      <ShieldCheck className="size-3" />
                      Kanal Resmi Terverifikasi
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Home className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      Kel. {posyandu.kelurahan}
                    </span>
                    <span>•</span>
                    <span>Kec. {posyandu.kecamatan}</span>
                    <span>•</span>
                    <span>Kota Tegal (Kode 33.76)</span>
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
                      className="border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2 py-0.5"
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
                  <Calendar className="size-3.5 text-emerald-600" />
                  Jadwal Kegiatan Rutin
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Setiap Minggu ke-2 & ke-4 (08.00 - 11.30 WIB)
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3.5 text-emerald-600" />
                  Fokus Program
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Penimbangan, Imunisasi & Cegah Stunting
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-emerald-600" />
                  Sasaran Warga
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Bayi, Balita, Ibu Hamil & Lansia
                </p>
              </div>
            </div>

            {/* Menu Layanan Terpadu Posyandu */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600" />
                Layanan & Agenda Posyandu Terintegrasi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Baby className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Pemantauan Tumbuh Kembang Balita
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Penimbangan berat badan, pengukuran tinggi badan, lingkar kepala, dan plotting grafik KMS.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                    <Stethoscope className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Imunisasi & Pemberian Vitamin A
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Layanan vaksinasi dasar lengkap balita bersama Bidan Kelurahan dan Tenaga Medis Puskesmas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <CheckCircle2 className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Pemberian Makanan Tambahan (PMT)
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Penyaluran makanan bergizi seimbang berbahan pangan lokal untuk balita gizi kurang dan ibu hamil KEK.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Clock className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Konsultasi KB & Kesehatan Ibu Hamil
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Konseling bersama Petugas Lapangan Keluarga Berencana (PLKB) dan pemeriksaan berkala ibu hamil.
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
