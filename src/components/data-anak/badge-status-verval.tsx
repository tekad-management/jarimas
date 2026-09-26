"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  HeartPulse,
  Info,
} from "lucide-react";
import type { StatusValidasi, ValidatedByType } from "@/lib/validators/data-anak-schema";

interface BadgeStatusVervalProps {
  status: StatusValidasi;
  validatedByType?: ValidatedByType | null;
  validatedById?: string | null;
  validatorLabel?: string | null;
  catatanValidasi?: string | null;
  size?: "sm" | "default" | "lg";
  showDetails?: boolean;
}

export function BadgeStatusVerval({
  status,
  validatedByType,
  validatorLabel,
  catatanValidasi,
  size = "default",
  showDetails = true,
}: BadgeStatusVervalProps) {
  let badgeConfig = {
    label: "Menunggu Validasi",
    icon: Clock,
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold",
    dotColor: "bg-amber-500",
    description: "Data sedang dalam antrean verifikasi silang oleh RT atau Posyandu domisili.",
  };

  if (status === "VALID") {
    badgeConfig = {
      label: "Valid Terverifikasi",
      icon: CheckCircle2,
      className:
        "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold",
      dotColor: "bg-emerald-500",
      description: "Data telah lolos verifikasi dan dinyatakan valid sesuai kependudukan fisik.",
    };
  } else if (status === "TIDAK_VALID") {
    badgeConfig = {
      label: "Tidak Valid (Perlu Perbaikan)",
      icon: AlertCircle,
      className:
        "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold",
      dotColor: "bg-rose-500",
      description: "Data ditolak verifikator karena ketidaksesuaian alamat/status. Silakan klik Edit untuk memperbaikinya.",
    };
  }

  const Icon = badgeConfig.icon;

  const sizeClass =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1"
      : size === "lg"
      ? "text-xs px-3 py-1 gap-1.5"
      : "text-xs px-2.5 py-0.5 gap-1.5";

  const validatorText =
    validatorLabel ||
    (validatedByType === "RT"
      ? "Grup RT Domisili"
      : validatedByType === "POSYANDU"
      ? "Kanal Posyandu"
      : null);

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={`${badgeConfig.className} ${sizeClass} transition-all shadow-2xs cursor-default flex items-center`}
          >
            <span className={`size-1.5 rounded-full ${badgeConfig.dotColor} animate-pulse`} />
            <Icon className="size-3.5 shrink-0" />
            <span>{badgeConfig.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs space-y-1 p-2.5">
          <p className="font-bold">{badgeConfig.label}</p>
          <p className="text-muted-foreground">{badgeConfig.description}</p>
          {validatorText && (
            <p className="text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-border/50">
              Diverifikasi oleh: <strong>{validatorText}</strong>
            </p>
          )}
          {catatanValidasi && (
            <div className="pt-1 text-rose-600 dark:text-rose-400 border-t border-border/50">
              <span className="font-semibold">Catatan Verifikator:</span>
              <p className="italic">{catatanValidasi}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>

      {showDetails && (
        <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
          {validatorText && status !== "MENUNGGU_VALIDASI" && (
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              {validatedByType === "RT" ? (
                <Building2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <HeartPulse className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <span>Divalidasi oleh: {validatorText}</span>
            </span>
          )}
          {status === "TIDAK_VALID" && catatanValidasi && (
            <span className="flex items-start gap-1 text-rose-700 dark:text-rose-300 font-normal leading-tight mt-0.5 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
              <Info className="size-3.5 shrink-0 text-rose-500 mt-0.5" />
              <span>Alasan: &ldquo;{catatanValidasi}&rdquo;</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
