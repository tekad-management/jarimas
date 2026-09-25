"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  statusType?: "Penduduk" | "Pendatang";
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
  alamatLengkap?: string;
}

export function CardIdentityStatus({
  statusType = "Penduduk",
  kota = "Kota Tegal",
  kecamatan = "Tegal Timur",
  kelurahan = "Mintaragen",
  rw = "04",
  rt = "02",
  alamatLengkap = "Jl. Mataram No. 18, Mintaragen, Tegal Timur",
}: IdentityStatusProps) {
  const isPenduduk = statusType === "Penduduk";

  const hierarchySteps = [
    { label: "Kota", value: kota, icon: Building2, desc: "Pemerintah Kota Tegal" },
    { label: "Kecamatan", value: kecamatan, icon: MapPin, desc: `Kecamatan ${kecamatan}` },
    { label: "Kelurahan", value: kelurahan, icon: Home, desc: `Kelurahan ${kelurahan}` },
    { label: "RW", value: `RW ${rw}`, icon: CheckCircle2, desc: `Rukun Warga ${rw}` },
    { label: "RT", value: `RT ${rt}`, icon: CheckCircle2, desc: `Rukun Tetangga ${rt}` },
  ];

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
                Status Kewargaan & Wilayah
              </CardTitle>
              <CardDescription className="text-xs">
                Data kependudukan & pemetaan wilayah administratif
              </CardDescription>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant={isPenduduk ? "default" : "secondary"}
                className={
                  isPenduduk
                    ? "bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-help"
                    : "bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-help"
                }
              >
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                Status: {statusType}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isPenduduk
                  ? "Warga dengan domisili tetap Kota Tegal"
                  : "Warga pendatang / domisili non-permanen terdaftar"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alamat Domisili Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <span className="text-muted-foreground font-medium">Alamat Domisili:</span>
            <span className="font-medium text-foreground">
              {alamatLengkap}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Wilayah Terdaftar
            </span>
          </div>
        </div>

        <Separator />

        {/* Hierarki Wilayah dengan Tooltip & Separator */}
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
