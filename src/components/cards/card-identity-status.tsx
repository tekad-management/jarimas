"use client";

import React from "react";
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
  MapPin,
  ChevronRight,
  UserCheck,
  Building2,
  Home,
  CheckCircle2,
} from "lucide-react";

export interface IdentityStatusProps {
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
  alamatDetail?: string;
}

function resolveKecamatanName(idOrName?: string | null): string {
  if (!idOrName) return "Tegal Timur";
  const found = MASTER_KECAMATAN_TEGAL.find(
    (k) =>
      k.id === idOrName ||
      k.nama.toLowerCase() === idOrName.toLowerCase() ||
      k.kode === idOrName
  );
  return found ? found.nama : idOrName;
}

function resolveKelurahanName(idOrName?: string | null): string {
  if (!idOrName) return "Mintaragen";
  for (const list of Object.values(MASTER_KELURAHAN_TEGAL)) {
    const found = list.find(
      (k) =>
        k.id === idOrName ||
        k.nama.toLowerCase() === idOrName.toLowerCase() ||
        k.kode === idOrName
    );
    if (found) return found.nama;
  }
  return idOrName;
}

export function CardIdentityStatus({
  kota: propKota,
  kecamatan: propKecamatan,
  kelurahan: propKelurahan,
  rw: propRw,
  rt: propRt,
  alamatDetail: propAlamatDetail,
}: IdentityStatusProps) {
  // 1. Ambil data domisili & alamat_detail asli dari database Supabase
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["current-user-domisili-profile"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      try {
        const { data: profile } = await supabase
          .from("users")
          .select(
            "id, email, username, nama_lengkap, alamat_detail, domisili_kecamatan_id, domisili_kelurahan_id, domisili_rw, domisili_rt, kk_kecamatan_id, kk_kelurahan_id, kk_rw, kk_rt"
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

  // 2. Resolusi Nilai Wilayah & Alamat
  const kota = propKota || "Kota Tegal";
  const rawKecamatan =
    propKecamatan ||
    userProfile?.domisili_kecamatan_id ||
    userProfile?.kk_kecamatan_id ||
    "kec-tt";
  const rawKelurahan =
    propKelurahan ||
    userProfile?.domisili_kelurahan_id ||
    userProfile?.kk_kelurahan_id ||
    "kel-mintaragen";

  const kecamatanName = resolveKecamatanName(rawKecamatan);
  const kelurahanName = resolveKelurahanName(rawKelurahan);

  const rw = propRw || userProfile?.domisili_rw || userProfile?.kk_rw || "01";
  const rt = propRt || userProfile?.domisili_rt || userProfile?.kk_rt || "01";

  // Alamat detail pengguna asli
  const alamatDetailAsli =
    propAlamatDetail ||
    userProfile?.alamat_detail ||
    `RT ${rt} / RW ${rw}, Kel. ${kelurahanName}, Kec. ${kecamatanName}`;

  // 5 Tingkat Hierarki Wilayah Domisili
  const hierarchySteps = [
    { label: "Kota", value: kota, icon: Building2, desc: "Pemerintah Kota Tegal" },
    {
      label: "Kecamatan",
      value: kecamatanName,
      icon: MapPin,
      desc: `Kecamatan ${kecamatanName}`,
    },
    {
      label: "Kelurahan",
      value: kelurahanName,
      icon: Home,
      desc: `Kelurahan ${kelurahanName}`,
    },
    { label: "RW", value: `RW ${rw}`, icon: CheckCircle2, desc: `Rukun Warga ${rw}` },
    { label: "RT", value: `RT ${rt}`, icon: CheckCircle2, desc: `Rukun Tetangga ${rt}` },
  ];

  if (isLoading) {
    return (
      <Card className="border border-border/80 bg-card shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="border border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Informasi Wilayah Domisili
              </CardTitle>
              <CardDescription className="text-xs">
                Data kependudukan & pemetaan wilayah administratif
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs gap-1.5 py-0.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terdaftar di {kota}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alamat Domisili Asli Pengguna */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="flex items-start gap-2.5 min-w-0">
            <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="text-muted-foreground font-medium text-[11px]">
                Alamat Domisili:
              </span>
              <span className="font-semibold text-foreground text-xs leading-relaxed break-words">
                {alamatDetailAsli}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
            <span className="rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Wilayah Terdaftar
            </span>
          </div>
        </div>

        <Separator />

        {/* Hierarki 5 Tingkat Wilayah Domisili */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Hierarki Wilayah Domisili:
            </p>
            <span className="text-[11px] text-muted-foreground">5 Tingkat Wilayah</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-background/50 p-2.5">
            {hierarchySteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === hierarchySteps.length - 1;

              return (
                <React.Fragment key={step.label}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted cursor-default">
                        <Icon className="size-3 text-primary" />
                        <span className="text-muted-foreground">{step.label}:</span>
                        <span className="font-semibold text-foreground">
                          {step.value}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{step.desc}</p>
                    </TooltipContent>
                  </Tooltip>

                  {!isLast && (
                    <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
