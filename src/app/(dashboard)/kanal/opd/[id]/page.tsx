"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { MASTER_OPD_TEGAL } from "@/components/cards/card-kanal-discovery";
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
  Landmark,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Sparkles,
  UserCheck,
  Building2,
  FileText,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

interface OpdDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OpdDetailPage({ params }: OpdDetailPageProps) {
  const resolvedParams = use(params);
  const opdId = decodeURIComponent(resolvedParams.id);
  const supabase = createClient();

  // Cari data OPD dari master dataset atau fallback
  const opd = MASTER_OPD_TEGAL.find(
    (o) => o.id === opdId || o.kode.toLowerCase() === opdId.toLowerCase()
  ) || {
    id: opdId,
    kode: "OPD",
    nama: opdId.replace(/^opd-/, "").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    deskripsi: "Organisasi Perangkat Daerah & Layanan Publik Pemerintah Kota Tegal",
    sektor: "Layanan Publik",
    alamat: "Jl. Ki Gede Sebayu No. 12, Kota Tegal",
  };

  // Cek Status Keanggotaan Pengguna di OPD ini
  const { data: membership } = useQuery({
    queryKey: ["opd_membership", opd.id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_kanal_memberships")
        .select("*")
        .eq("user_id", user.id)
        .eq("kanal_id", opd.id)
        .maybeSingle();

      return data || null;
    },
  });

  const peranList: string[] = React.useMemo(() => {
    if (!membership?.peran) return ["Warga Penerima Manfaat / Masyarakat Umum"];
    if (Array.isArray(membership.peran)) return membership.peran;
    return typeof membership.peran === "string"
      ? membership.peran.split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["Warga Penerima Manfaat / Masyarakat Umum"];
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
            <span className="text-foreground font-semibold">Kanal OPD & Dinas</span>
          </div>
        </div>

        {/* Hero Card OPD */}
        <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 shadow-xs overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md shrink-0">
                  <Landmark className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {opd.nama}
                    </CardTitle>
                    <Badge className="bg-amber-600 text-white text-xs gap-1 py-0.5">
                      <ShieldCheck className="size-3" />
                      {opd.kode}
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                      Sektor: {opd.sektor}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                    <span>{opd.deskripsi}</span>
                    <span>•</span>
                    <span>Pemerintah Kota Tegal</span>
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
                      className="border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-semibold px-2 py-0.5"
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
                  <Building2 className="size-3.5 text-amber-600" />
                  Instansi Resmi
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Pemkot Tegal (Kode 33.76)
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-amber-600" />
                  Jam Pelayanan Publik
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Senin - Jumat (07.30 - 15.30 WIB)
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <PhoneCall className="size-3.5 text-amber-600" />
                  Layanan Pengaduan
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Call Center & Kanal Terintegrasi
                </p>
              </div>
            </div>

            {/* Menu Fitur Kanal OPD */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-amber-600" />
                Program Bantuan & Layanan Dinas Terpadu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <FileText className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Pengajuan Bantuan & Layanan Warga
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Layanan fasilitasi verifikasi berkas, perizinan, dan rekomendasi program sosial dari dinas terkait.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                    <CheckCircle2 className="size-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground">
                      Penyaluran Program & Sosialisasi
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Pemberitahuan resmi mengenai jadwal sosialisasi program, pendampingan warga, dan pelatihan keahlian.
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
