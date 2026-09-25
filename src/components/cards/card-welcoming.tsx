"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Calendar, Clock, ShieldCheck } from "lucide-react";

interface CardWelcomingProps {
  userName?: string;
  role?: string;
  avatarUrl?: string;
}

export function CardWelcoming({
  userName,
  role = "Warga Kota Tegal",
  avatarUrl,
}: CardWelcomingProps) {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  // 1. Ambil data sesi pengguna aktif via Supabase Auth & Tabel users
  const { data: activeUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      try {
        const { data: profile } = await supabase
          .from("users")
          .select("id, email, username, nama_lengkap, domisili_kelurahan_id, domisili_rw, domisili_rt, kk_kelurahan_id, kk_rw, kk_rt")
          .eq("id", user.id)
          .maybeSingle();

        return {
          id: user.id,
          email: user.email,
          nama_lengkap:
            profile?.nama_lengkap ||
            user.user_metadata?.nama_lengkap ||
            user.user_metadata?.full_name ||
            null,
          username:
            profile?.username || user.user_metadata?.username || null,
          rw: profile?.domisili_rw || profile?.kk_rw || null,
          rt: profile?.domisili_rt || profile?.kk_rt || null,
        };
      } catch {
        return {
          id: user.id,
          email: user.email,
          nama_lengkap:
            user.user_metadata?.nama_lengkap ||
            user.user_metadata?.full_name ||
            null,
          username: user.user_metadata?.username || null,
          rw: null,
          rt: null,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });

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

  // 2. Skeleton Loading State
  if (isUserLoading) {
    return (
      <Card className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 shadow-md backdrop-blur-sm p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-full" />
              </div>
              <Skeleton className="h-7 w-64 md:w-80 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </Card>
    );
  }

  // 3. Nama Pengguna Aktif & Role
  const activeName =
    activeUser?.nama_lengkap ||
    (activeUser?.username ? `@${activeUser.username}` : null) ||
    userName ||
    "Warga Kota Tegal";

  const activeRole = activeUser
    ? activeUser.rw
      ? `Warga RW ${activeUser.rw}`
      : "Warga Terdaftar"
    : role;

  // Inisial nama untuk Avatar Fallback
  const initials = activeName
    .replace(/^@/, "")
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
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
              {avatarUrl && <AvatarImage src={avatarUrl} alt={activeName} />}
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
                  {activeRole}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground md:text-2xl mt-1">
                Selamat Datang di <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">jarimas.id</span>, {activeName}!
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
