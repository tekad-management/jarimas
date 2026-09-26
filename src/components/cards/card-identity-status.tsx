"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  MASTER_KECAMATAN_TEGAL,
  MASTER_KELURAHAN_TEGAL,
} from "@/lib/validators/register-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  MapPin,
  Home,
  CheckCircle2,
  UserCheck,
  HeartPulse,
  GraduationCap,
  Landmark,
  Users,
  ArrowUpRight,
  Layers,
  Sparkles,
} from "lucide-react";

export interface IdentityStatusProps {
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
  alamatDetail?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveKecamatan(idOrName?: string | null) {
  if (!idOrName) {
    return { id: "kec-tt", kode: "33.76.02", nama: "Tegal Timur", slug: "tegal-timur" };
  }
  const clean = idOrName.toLowerCase().trim();
  const found = MASTER_KECAMATAN_TEGAL.find(
    (k) =>
      k.id.toLowerCase() === clean ||
      k.kode.toLowerCase() === clean ||
      k.nama.toLowerCase() === clean ||
      k.nama.toLowerCase().replace(/\s+/g, "-") === clean
  );
  if (found) {
    return {
      id: found.id,
      kode: found.kode,
      nama: found.nama,
      slug: found.nama.toLowerCase().replace(/\s+/g, "-"),
    };
  }
  return {
    id: idOrName,
    kode: idOrName,
    nama: idOrName,
    slug: slugify(idOrName),
  };
}

function resolveKelurahan(idOrName?: string | null) {
  if (!idOrName) {
    return { id: "kel-mintaragen", kode: "33.76.02.1001", nama: "Mintaragen", slug: "mintaragen" };
  }
  const clean = idOrName.toLowerCase().trim();
  for (const list of Object.values(MASTER_KELURAHAN_TEGAL)) {
    const found = list.find(
      (k) =>
        k.id.toLowerCase() === clean ||
        k.kode.toLowerCase() === clean ||
        k.nama.toLowerCase() === clean ||
        k.nama.toLowerCase().replace(/\s+/g, "-") === clean
    );
    if (found) {
      return {
        id: found.id,
        kode: found.kode,
        nama: found.nama,
        slug: found.nama.toLowerCase().replace(/\s+/g, "-"),
      };
    }
  }
  return {
    id: idOrName,
    kode: idOrName,
    nama: idOrName,
    slug: slugify(idOrName),
  };
}

export function CardIdentityStatus({
  kota: propKota,
  kecamatan: propKecamatan,
  kelurahan: propKelurahan,
  rw: propRw,
  rt: propRt,
  alamatDetail: propAlamatDetail,
}: IdentityStatusProps) {
  const supabase = createClient();

  // 1. Ambil data profil domisili & KK pengguna dari database
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["current-user-full-profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      try {
        const { data: profile } = await supabase
          .from("users")
          .select(
            "id, email, username, nama_lengkap, alamat_detail, kk_kabkota, domisili_sama_dengan_kk, kk_kecamatan_id, kk_kelurahan_id, kk_rw, kk_rt, domisili_kecamatan_id, domisili_kelurahan_id, domisili_rw, domisili_rt"
          )
          .eq("id", user.id)
          .maybeSingle();

        return profile;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Ambil data keanggotaan kanal aktif pengguna
  const { data: userMemberships = [], isLoading: isLoadingMemberships } = useQuery({
    queryKey: ["user_kanal_memberships_active"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_kanal_memberships")
        .select("id, kanal_id, kanal_nama, tipe_kanal, peran, metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    },
    staleTime: 1000 * 30,
  });

  // 3. Resolusi Wilayah KK
  const kota = propKota || "Kota Tegal";
  const isKkLuarKota = userProfile?.kk_kabkota === "LUAR_KOTA_TEGAL";
  const domisiliSamaDenganKk = userProfile?.domisili_sama_dengan_kk ?? true;

  // Nilai Alamat KK
  const kkKecRaw =
    propKecamatan ||
    userProfile?.kk_kecamatan_id ||
    userProfile?.domisili_kecamatan_id ||
    "kec-tt";
  const kkKelRaw =
    propKelurahan ||
    userProfile?.kk_kelurahan_id ||
    userProfile?.domisili_kelurahan_id ||
    "kel-mintaragen";
  const kkRwRaw = propRw || userProfile?.kk_rw || userProfile?.domisili_rw || "01";
  const kkRtRaw = propRt || userProfile?.kk_rt || userProfile?.domisili_rt || "01";

  const kkKec = resolveKecamatan(kkKecRaw);
  const kkKel = resolveKelurahan(kkKelRaw);
  const formattedKkRw = kkRwRaw.toString().padStart(2, "0");
  const formattedKkRt = kkRtRaw.toString().padStart(2, "0");

  // Nilai Alamat Domisili
  const domKecRaw = userProfile?.domisili_kecamatan_id || kkKecRaw;
  const domKelRaw = userProfile?.domisili_kelurahan_id || kkKelRaw;
  const domRwRaw = userProfile?.domisili_rw || kkRwRaw;
  const domRtRaw = userProfile?.domisili_rt || kkRtRaw;

  const domKec = resolveKecamatan(domKecRaw);
  const domKel = resolveKelurahan(domKelRaw);
  const formattedDomRw = domRwRaw.toString().padStart(2, "0");
  const formattedDomRt = domRtRaw.toString().padStart(2, "0");

  // Logika Menampilkan Grup Domisili Terpisah:
  // - Hanya jika Alamat Domisili BEDA dengan Alamat KK DAN KK bukan Luar Kota Tegal
  const showSeparateDomisiliGroup = !isKkLuarKota && !domisiliSamaDenganKk;

  // Alamat detail pengguna asli
  const alamatDetailAsli =
    propAlamatDetail ||
    userProfile?.alamat_detail ||
    `RT ${formattedDomRt} / RW ${formattedDomRw}, Kel. ${domKel.nama}, Kec. ${domKec.nama}, ${kota}`;

  // Hierarki Grup Berbasis Alamat KK (5 Tingkat)
  const kkGroupSteps = useMemo(() => {
    const rtSlug = `rt-${formattedKkRt}-rw-${formattedKkRw}-${slugify(kkKel.nama)}`;
    const rwSlug = `rw-${formattedKkRw}-${slugify(kkKel.nama)}`;
    const kelSlug = `kelurahan-${slugify(kkKel.nama)}`;
    const kecSlug = `kecamatan-${slugify(kkKec.nama)}`;

    return [
      {
        step: "1. Kota",
        label: "Kota",
        value: isKkLuarKota ? "Kota Tegal" : kota,
        href: `/grup/kota-tegal`,
        icon: Building2,
        desc: "Grup Warga Tingkat Kota Tegal",
      },
      {
        step: "2. Kecamatan",
        label: "Kecamatan",
        value: `Kec. ${kkKec.nama}`,
        href: `/grup/${kecSlug}`,
        icon: MapPin,
        desc: `Grup Wilayah Kecamatan ${kkKec.nama}`,
      },
      {
        step: "3. Kelurahan",
        label: "Kelurahan",
        value: `Kel. ${kkKel.nama}`,
        href: `/grup/${kelSlug}`,
        icon: Home,
        desc: `Grup Wilayah Kelurahan ${kkKel.nama}`,
      },
      {
        step: "4. RW",
        label: "RW",
        value: `RW ${formattedKkRw}`,
        href: `/grup/${rwSlug}`,
        icon: CheckCircle2,
        desc: `Grup Rukun Warga ${formattedKkRw} Kelurahan ${kkKel.nama}`,
      },
      {
        step: "5. RT",
        label: "RT",
        value: `RT ${formattedKkRt}`,
        href: `/grup/${rtSlug}`,
        icon: UserCheck,
        desc: `Grup Rukun Tetangga ${formattedKkRt} RW ${formattedKkRw} ${kkKel.nama}`,
      },
    ];
  }, [formattedKkRt, formattedKkRw, kkKel.nama, kkKec.nama, isKkLuarKota, kota]);

  // Hierarki Grup Berbasis Alamat Domisili (5 Tingkat jika berbeda)
  const domisiliGroupSteps = useMemo(() => {
    if (!showSeparateDomisiliGroup) return [];

    const rtSlug = `rt-${formattedDomRt}-rw-${formattedDomRw}-${slugify(domKel.nama)}`;
    const rwSlug = `rw-${formattedDomRw}-${slugify(domKel.nama)}`;
    const kelSlug = `kelurahan-${slugify(domKel.nama)}`;
    const kecSlug = `kecamatan-${slugify(domKec.nama)}`;

    return [
      {
        step: "1. Kota",
        label: "Kota",
        value: kota,
        href: `/grup/kota-tegal`,
        icon: Building2,
        desc: "Grup Domisili Tingkat Kota Tegal",
      },
      {
        step: "2. Kecamatan",
        label: "Kecamatan",
        value: `Kec. ${domKec.nama}`,
        href: `/grup/${kecSlug}`,
        icon: MapPin,
        desc: `Grup Domisili Kecamatan ${domKec.nama}`,
      },
      {
        step: "3. Kelurahan",
        label: "Kelurahan",
        value: `Kel. ${domKel.nama}`,
        href: `/grup/${kelSlug}`,
        icon: Home,
        desc: `Grup Domisili Kelurahan ${domKel.nama}`,
      },
      {
        step: "4. RW",
        label: "RW",
        value: `RW ${formattedDomRw}`,
        href: `/grup/${rwSlug}`,
        icon: CheckCircle2,
        desc: `Grup Domisili RW ${formattedDomRw} Kelurahan ${domKel.nama}`,
      },
      {
        step: "5. RT",
        label: "RT",
        value: `RT ${formattedDomRt}`,
        href: `/grup/${rtSlug}`,
        icon: UserCheck,
        desc: `Grup Domisili RT ${formattedDomRt} RW ${formattedDomRw} ${domKel.nama}`,
      },
    ];
  }, [showSeparateDomisiliGroup, formattedDomRt, formattedDomRw, domKel.nama, domKec.nama, kota]);

  // Klasifikasi Kanal Berdasarkan Tipe
  const posyanduMemberships = useMemo(
    () => userMemberships.filter((m: any) => m.tipe_kanal?.toUpperCase() === "POSYANDU"),
    [userMemberships]
  );

  const sekolahMemberships = useMemo(
    () => userMemberships.filter((m: any) => m.tipe_kanal?.toUpperCase() === "SEKOLAH"),
    [userMemberships]
  );

  const opdMemberships = useMemo(
    () => userMemberships.filter((m: any) => m.tipe_kanal?.toUpperCase() === "OPD"),
    [userMemberships]
  );

  const isLoading = isLoadingProfile || isLoadingMemberships;

  if (isLoading) {
    return (
      <Card className="w-full border border-border/80 bg-card shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-56 rounded" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </Card>
    );
  }

  return (
    <Card className="w-full border border-border/80 bg-card shadow-xs">
      <CardHeader className="p-5 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Layers className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                Informasi Grup & Kanal Pengguna
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground mt-0.5">
                Grup dan kanal komunitas dimana Anda telah terdaftar aktif
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm gap-1.5 py-1.5 px-3.5 font-semibold shadow-2xs"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Terdaftar di {kota}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 space-y-6">
        {/* ============================================================================== */}
        {/* 1. SEKSI GRUP TEMPAT PENGGUNA TELAH TERDAFTAR (BERBASIS ALAMAT KK) */}
        {/* ============================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="size-4.5 text-primary" />
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Grup Wilayah Terdaftar
              </h3>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm font-medium py-1 px-2.5">
              {isKkLuarKota ? "Berbasis Domisili" : "Berbasis Alamat KK"}
            </Badge>
          </div>

          {/* 5-Column Responsive Button Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kkGroupSteps.map((step) => {
              const Icon = step.icon;

              return (
                <Tooltip key={`kk-${step.label}`}>
                  <TooltipTrigger>
                    <Link
                      href={step.href}
                      className="group flex flex-col items-start justify-between rounded-xl sm:rounded-2xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 text-left transition-all duration-150 hover:border-primary/60 hover:bg-primary/5 hover:shadow-xs active:scale-[0.98] w-full cursor-pointer min-h-[84px]"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                          {step.step}
                        </span>
                        <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="mt-2 flex w-full items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {step.value}
                        </span>
                        <ArrowUpRight className="size-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs sm:text-sm">
                    <p className="font-medium">{step.desc}</p>
                    <p className="text-xs text-muted-foreground">Buka rute {step.href}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 1B. SEKSI GRUP DOMISILI (JIKA ALAMAT DOMISILI BERBEDA DENGAN KK) */}
        {/* ============================================================================== */}
        {showSeparateDomisiliGroup && domisiliGroupSteps.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Home className="size-4.5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Grup Domisili
                </h3>
              </div>
              <Badge variant="outline" className="text-xs sm:text-sm font-semibold text-cyan-700 dark:text-cyan-300 border-cyan-500/30 bg-cyan-500/10 py-1 px-3">
                Alamat Domisili Berbeda
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {domisiliGroupSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <Tooltip key={`dom-${step.label}`}>
                    <TooltipTrigger>
                      <Link
                        href={step.href}
                        className="group flex flex-col items-start justify-between rounded-xl sm:rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3.5 sm:p-4 text-left transition-all duration-150 hover:border-cyan-500 hover:bg-cyan-500/15 hover:shadow-xs active:scale-[0.98] w-full cursor-pointer min-h-[84px]"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs font-semibold text-cyan-800/80 dark:text-cyan-300/80">
                            {step.step}
                          </span>
                          <Icon className="size-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="mt-2 flex w-full items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors truncate">
                            {step.value}
                          </span>
                          <ArrowUpRight className="size-3.5 text-cyan-600/50 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs sm:text-sm">
                      <p className="font-medium">{step.desc}</p>
                      <p className="text-xs text-muted-foreground">Buka rute {step.href}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* ============================================================================== */}
        {/* 2. SEKSI KANAL TERDAFTAR (3 KOLOM LEBAR PENUH: POSYANDU, SEKOLAH, OPD) */}
        {/* ============================================================================== */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="size-4.5 text-indigo-500" />
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Kanal Terdaftar
              </h3>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Posyandu, Satuan Pendidikan & OPD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* A. Kanal Posyandu Terdaftar Card */}
            <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                    <HeartPulse className="size-4.5 sm:size-5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    Kanal Posyandu
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 py-0.5 px-2.5"
                >
                  {posyanduMemberships.length}
                </Badge>
              </div>

              <div className="space-y-2 min-h-[48px] flex flex-col justify-center">
                {posyanduMemberships.length > 0 ? (
                  posyanduMemberships.map((m: any) => (
                    <Tooltip key={m.id || m.kanal_id}>
                      <TooltipTrigger>
                        <Link
                          href={`/kanal/posyandu/${m.kanal_id}`}
                          className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-background/90 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-500/15 hover:border-emerald-500/60 active:scale-[0.98] group cursor-pointer w-full shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-bold truncate">{m.kanal_nama}</span>
                            {m.peran && (
                              <span className="text-xs text-muted-foreground truncate">
                                ({m.peran})
                              </span>
                            )}
                          </div>
                          <ArrowUpRight className="size-4 opacity-60 group-hover:opacity-100 transition-transform shrink-0 ml-1.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs sm:text-sm">
                        <p>Buka rute /kanal/posyandu/{m.kanal_id}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground bg-background/60 rounded-xl p-3 border border-border/50">
                    <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                    <span>Belum Terdaftar di Posyandu</span>
                  </div>
                )}
              </div>
            </div>

            {/* B. Kanal Sekolah Terdaftar Card */}
            <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 shrink-0">
                    <GraduationCap className="size-4.5 sm:size-5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    Kanal Sekolah / PAUD
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm font-bold border-indigo-500/30 text-indigo-700 dark:text-indigo-300 py-0.5 px-2.5"
                >
                  {sekolahMemberships.length}
                </Badge>
              </div>

              <div className="space-y-2 min-h-[48px] flex flex-col justify-center">
                {sekolahMemberships.length > 0 ? (
                  sekolahMemberships.map((m: any) => (
                    <Tooltip key={m.id || m.kanal_id}>
                      <TooltipTrigger>
                        <Link
                          href={`/kanal/sekolah/${m.kanal_id}`}
                          className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-background/90 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 transition-all hover:bg-indigo-500/15 hover:border-indigo-500/60 active:scale-[0.98] group cursor-pointer w-full shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                            <span className="font-bold truncate">{m.kanal_nama}</span>
                            {m.peran && (
                              <span className="text-xs text-muted-foreground truncate">
                                ({m.peran})
                              </span>
                            )}
                          </div>
                          <ArrowUpRight className="size-4 opacity-60 group-hover:opacity-100 transition-transform shrink-0 ml-1.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs sm:text-sm">
                        <p>Buka rute /kanal/sekolah/{m.kanal_id}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground bg-background/60 rounded-xl p-3 border border-border/50">
                    <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                    <span>Belum Terdaftar di Satuan Pendidikan</span>
                  </div>
                )}
              </div>
            </div>

            {/* C. Kanal OPD Terdaftar Card */}
            <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
                    <Landmark className="size-4.5 sm:size-5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    Kanal OPD / Dinas
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm font-bold border-amber-500/30 text-amber-800 dark:text-amber-300 py-0.5 px-2.5"
                >
                  {opdMemberships.length}
                </Badge>
              </div>

              <div className="space-y-2 min-h-[48px] flex flex-col justify-center">
                {opdMemberships.length > 0 ? (
                  opdMemberships.map((m: any) => (
                    <Tooltip key={m.id || m.kanal_id}>
                      <TooltipTrigger>
                        <Link
                          href={`/kanal/opd/${m.kanal_id}`}
                          className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-background/90 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 transition-all hover:bg-amber-500/15 hover:border-amber-500/60 active:scale-[0.98] group cursor-pointer w-full shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-bold truncate">{m.kanal_nama}</span>
                            {m.peran && (
                              <span className="text-xs text-muted-foreground truncate">
                                ({m.peran})
                              </span>
                            )}
                          </div>
                          <ArrowUpRight className="size-4 opacity-60 group-hover:opacity-100 transition-transform shrink-0 ml-1.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs sm:text-sm">
                        <p>Buka rute /kanal/opd/{m.kanal_id}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground bg-background/60 rounded-xl p-3 border border-border/50">
                    <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                    <span>Belum Terdaftar di OPD / Dinas</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* ============================================================================== */}
        {/* 3. ALAMAT DOMISILI DETAIL (BAGIAN PALING BAWAH KARTU - LEBAR PENUH) */}
        {/* ============================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/40 p-4 sm:p-5">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
              <MapPin className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                Alamat Domisili Terdaftar:
              </span>
              <span className="font-semibold text-foreground text-sm sm:text-base leading-relaxed break-words mt-1">
                {alamatDetailAsli}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground ml-auto shrink-0 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold py-1.5 px-3.5"
            >
              Wilayah Terverifikasi
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
