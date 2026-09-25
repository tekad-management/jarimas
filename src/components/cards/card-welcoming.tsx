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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Calendar, Clock, Activity, ShieldCheck } from "lucide-react";

interface CardWelcomingProps {
  userName?: string;
  role?: string;
  avatarUrl?: string;
}

export function CardWelcoming({
  userName = "Budi Santoso",
  role = "Warga RW 04 Mintaragen",
  avatarUrl,
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

  // Inisial nama untuk Avatar Fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 shadow-md backdrop-blur-sm">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="ring-2 ring-emerald-500/30">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
              <AvatarFallback className="bg-emerald-600 font-bold text-white">
                {initials || "W"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs"
                >
                  <Sparkles className="size-3 text-emerald-500" />
                  jarimas.id
                </Badge>
                <Badge variant="secondary" className="text-xs font-normal">
                  {role}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground md:text-2xl mt-1">
                Selamat Datang di <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">jarimas.id</span>, {userName}!
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Status: Aktif Terverifikasi</span>
          </div>
        </div>

        <CardDescription className="text-xs sm:text-sm mt-1">
          Sistem Pendataan Terpadu & Kanal Komunitas Kesejahteraan Warga Kota Tegal.
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
              <p className="text-xs text-muted-foreground">Waktu Saat Ini</p>
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
              <p className="text-xs text-muted-foreground">Koneksi Database</p>
              <p className="truncate text-xs font-semibold text-foreground">
                Supabase Realtime Siap
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
