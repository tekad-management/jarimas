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
import {
  MapPin,
  ChevronRight,
  UserCheck,
  Building2,
  Home,
  CheckCircle2,
  FileText,
} from "lucide-react";

export interface IdentityStatusProps {
  statusType?: "Penduduk" | "Pendatang";
  nik?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
  alamatLengkap?: string;
}

export function CardIdentityStatus({
  statusType = "Penduduk",
  nik = "3328012408980002",
  kota = "Kota Tegal",
  kecamatan = "Tegal Timur",
  kelurahan = "Mintaragen",
  rw = "04",
  rt = "02",
  alamatLengkap = "Jl. Mataram No. 18, Mintaragen, Tegal Timur",
}: IdentityStatusProps) {
  const isPenduduk = statusType === "Penduduk";
  const maskedNik =
    nik.length >= 8
      ? `${nik.slice(0, 4)}********${nik.slice(-4)}`
      : nik;

  const hierarchySteps = [
    { label: "Kota", value: kota, icon: Building2 },
    { label: "Kecamatan", value: kecamatan, icon: MapPin },
    { label: "Kelurahan", value: kelurahan, icon: Home },
    { label: "RW", value: `RW ${rw}`, icon: CheckCircle2 },
    { label: "RT", value: `RT ${rt}`, icon: CheckCircle2 },
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
                Status Identitas Kependudukan
              </CardTitle>
              <CardDescription className="text-xs">
                Informasi registrasi domisili dan hierarki wilayah
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={isPenduduk ? "default" : "secondary"}
            className={
              isPenduduk
                ? "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                : "bg-amber-600 hover:bg-amber-700 text-white font-medium"
            }
          >
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            Status: {statusType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* NIK & Alamat Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">NIK Terdaftar:</span>
            <span className="font-mono font-medium text-foreground">
              {maskedNik}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <MapPin className="size-3.5" />
            <span className="truncate">{alamatLengkap}</span>
          </div>
        </div>

        {/* Hierarki Wilayah */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Hierarki Wilayah Administrasi:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-background/50 p-2.5">
            {hierarchySteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === hierarchySteps.length - 1;

              return (
                <React.Fragment key={step.label}>
                  <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted">
                    <Icon className="size-3 text-primary" />
                    <span className="text-muted-foreground">{step.label}:</span>
                    <span className="font-semibold text-foreground">
                      {step.value}
                    </span>
                  </div>
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
