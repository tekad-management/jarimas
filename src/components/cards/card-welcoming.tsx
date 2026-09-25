"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, Activity, ShieldCheck } from "lucide-react";

interface CardWelcomingProps {
  userName?: string;
  role?: string;
}

export function CardWelcoming({
  userName = "Warga Tekad",
  role = "Masyarakat Tegal",
}: CardWelcomingProps) {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateFormatted = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);

      const timeFormatted = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now);

      setCurrentDate(dateFormatted);
      setCurrentTime(timeFormatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Salam berdasarkan waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <Card className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 shadow-md backdrop-blur-sm">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <Sparkles className="size-3 text-emerald-500" />
              Sistem Terpadu TEKAD
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs font-normal">
              {role}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Sistem Aktif
            </span>
          </div>
        </div>

        <CardTitle className="text-xl font-bold tracking-tight text-foreground md:text-2xl mt-2">
          {getGreeting()},{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
            {userName}
          </span>{" "}
          👋
        </CardTitle>
        <CardDescription className="text-sm">
          Selamat datang di Linimasa Portal Pendataan & Layanan Kesejahteraan Terpadu Kota Tegal.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3 shadow-xs">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calendar className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Hari & Tanggal</p>
              <p className="truncate text-xs font-semibold text-foreground">
                {currentDate || "Memuat..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3 shadow-xs">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Waktu Sekarang</p>
              <p className="truncate font-mono text-xs font-semibold text-foreground">
                {currentTime ? `${currentTime} WIB` : "Memuat..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3 shadow-xs">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Status Verifikasi</p>
              <p className="truncate text-xs font-semibold text-foreground">
                Terhubung ke Supabase
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
