"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Radio,
  RefreshCw,
  Database,
  UserCheck,
  UserPlus,
  MapPin,
  Clock,
  Sparkles,
  Baby,
  Activity,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export interface RealtimeFeedItem {
  id: string;
  source: "users" | "data_warga";
  nama: string;
  subTitle?: string;
  wilayah: string;
  alamatDetail?: string;
  badgeLabel: string;
  badgeVariant?: "default" | "secondary" | "outline";
  waktu: string;
  timestamp: number;
  isNew?: boolean;
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

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Baru saja";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Baru saja";
  if (diffMin < 60) return `${Math.max(1, diffMin)} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  return `${diffDay} hari lalu`;
}

export function CardRealtimeFeed() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [feedItems, setFeedItems] = useState<RealtimeFeedItem[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "USERS" | "WARGA">("ALL");

  // 1. Fetch 10 Entri Terbaru dari Supabase (Users & Data Warga)
  const {
    data: initialData = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["realtime_feed_warga"],
    queryFn: async () => {
      try {
        const [usersRes, wargaRes] = await Promise.all([
          supabase
            .from("users")
            .select(
              "id, nama_lengkap, username, email, usia, domisili_kecamatan_id, domisili_kelurahan_id, domisili_rw, domisili_rt, alamat_detail, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("data_warga")
            .select(
              "id, nama_anak, nama_wali, tempat_tanggal_lahir, jenis_kelamin, status_tinggal, rt_wilayah_id, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        const items: RealtimeFeedItem[] = [];

        // Parse user accounts
        (usersRes.data || []).forEach((u: any) => {
          const kec = resolveKecamatanName(u.domisili_kecamatan_id);
          const kel = resolveKelurahanName(u.domisili_kelurahan_id);
          const rt = u.domisili_rt || "01";
          const rw = u.domisili_rw || "01";
          const wilayahStr = `Kel. ${kel}, Kec. ${kec} (RT ${rt}/RW ${rw})`;

          items.push({
            id: `user-${u.id}`,
            source: "users",
            nama: u.nama_lengkap || u.username || "Warga Baru",
            subTitle: u.username ? `@${u.username}` : u.email,
            wilayah: wilayahStr,
            alamatDetail: u.alamat_detail || undefined,
            badgeLabel: "Akun Warga Terdaftar",
            badgeVariant: "default",
            waktu: formatRelativeTime(u.created_at),
            timestamp: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
          });
        });

        // Parse data warga / balita
        (wargaRes.data || []).forEach((w: any) => {
          items.push({
            id: `warga-${w.id}`,
            source: "data_warga",
            nama: w.nama_anak || "Balita Baru",
            subTitle: `Wali: ${w.nama_wali || "-"} • ${w.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}`,
            wilayah: `Wilayah ${w.rt_wilayah_id || "Kota Tegal"}`,
            alamatDetail: w.tempat_tanggal_lahir ? `Lahir: ${w.tempat_tanggal_lahir}` : undefined,
            badgeLabel: "Pendataan Balita/Warga",
            badgeVariant: "secondary",
            waktu: formatRelativeTime(w.created_at),
            timestamp: w.created_at ? new Date(w.created_at).getTime() : Date.now(),
          });
        });

        // Urutkan 10 data terbaru secara gabungan
        return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
      } catch (err) {
        console.warn("Error fetching realtime feed:", err);
        return [];
      }
    },
    staleTime: 1000 * 30,
  });

  // Sinkronisasi data awal ke internal state
  useEffect(() => {
    if (initialData.length > 0) {
      setFeedItems(initialData);
    }
  }, [initialData]);

  // 2. Supabase Realtime Subscription (postgres_changes pada tabel users dan data_warga)
  useEffect(() => {
    const channel = supabase
      .channel("realtime:feed_warga_live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "users",
        },
        (payload) => {
          const u = payload.new as any;
          const kec = resolveKecamatanName(u.domisili_kecamatan_id);
          const kel = resolveKelurahanName(u.domisili_kelurahan_id);
          const rt = u.domisili_rt || "01";
          const rw = u.domisili_rw || "01";

          const newItem: RealtimeFeedItem = {
            id: `user-${u.id || Date.now()}`,
            source: "users",
            nama: u.nama_lengkap || u.username || "Warga Baru",
            subTitle: u.username ? `@${u.username}` : u.email,
            wilayah: `Kel. ${kel}, Kec. ${kec} (RT ${rt}/RW ${rw})`,
            alamatDetail: u.alamat_detail || undefined,
            badgeLabel: "Akun Warga Terdaftar",
            badgeVariant: "default",
            waktu: "Baru saja",
            timestamp: Date.now(),
            isNew: true,
          };

          toast.success("Warga Baru Terdaftar!", {
            description: `${newItem.nama} telah bergabung ke ekosistem jarimas.id.`,
          });

          setFeedItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)].slice(0, 10));
          queryClient.invalidateQueries({ queryKey: ["warga_statistics_realtime"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "data_warga",
        },
        (payload) => {
          const w = payload.new as any;
          const newItem: RealtimeFeedItem = {
            id: `warga-${w.id || Date.now()}`,
            source: "data_warga",
            nama: w.nama_anak || "Balita Baru",
            subTitle: `Wali: ${w.nama_wali || "-"} • ${w.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}`,
            wilayah: `Wilayah ${w.rt_wilayah_id || "Kota Tegal"}`,
            alamatDetail: w.tempat_tanggal_lahir ? `Lahir: ${w.tempat_tanggal_lahir}` : undefined,
            badgeLabel: "Pendataan Balita/Warga",
            badgeVariant: "secondary",
            waktu: "Baru saja",
            timestamp: Date.now(),
            isNew: true,
          };

          toast.success("Data Warga Baru Masuk!", {
            description: `Data ${newItem.nama} tersinkronisasi realtime.`,
          });

          setFeedItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)].slice(0, 10));
          queryClient.invalidateQueries({ queryKey: ["warga_statistics_realtime"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  // Filter items sesuai tab
  const filteredFeed = useMemo(() => {
    if (filterType === "USERS") return feedItems.filter((i) => i.source === "users");
    if (filterType === "WARGA") return feedItems.filter((i) => i.source === "data_warga");
    return feedItems;
  }, [feedItems, filterType]);

  return (
    <Card className="border border-border/80 bg-card shadow-xs">
      <CardHeader className="p-5 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Database className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                Feed Realtime Data Warga
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground mt-0.5">
                10 pendaftaran akun warga & data terbaru yang tersinkronisasi langsung via Supabase Realtime
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold gap-1.5 py-1.5 px-3 shadow-2xs"
            >
              <Radio className="size-3.5 animate-pulse text-emerald-500" />
              <span>Realtime Aktif</span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.info("Memperbarui feed warga realtime...");
              }}
              disabled={isLoading || isRefetching}
              className="gap-2 text-xs sm:text-sm h-10 px-4 font-semibold"
            >
              <RefreshCw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              filterType === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua Aktivitas ({feedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("USERS")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              filterType === "USERS"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Akun Warga ({feedItems.filter((i) => i.source === "users").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("WARGA")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              filterType === "WARGA"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendataan Warga ({feedItems.filter((i) => i.source === "data_warga").length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 space-y-3.5">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex items-center gap-3.5">
                  <Skeleton className="size-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredFeed.length > 0 ? (
          <div className="space-y-2.5">
            {filteredFeed.map((item) => (
              <div
                key={item.id}
                className={`group relative flex flex-col gap-2.5 rounded-xl sm:rounded-2xl border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between shadow-2xs ${
                  item.isNew
                    ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30 animate-in fade-in slide-in-from-top-2"
                    : "border-border/70 bg-background/70 hover:border-border hover:bg-muted/30"
                }`}
              >
                {/* Left Side: Avatar & Information */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      item.source === "users"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {item.source === "users" ? (
                      <UserCheck className="size-5.5" />
                    ) : (
                      <Baby className="size-5.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-foreground truncate">
                        {item.nama}
                      </span>
                      {item.subTitle && (
                        <span className="text-xs sm:text-sm text-muted-foreground truncate font-normal">
                          {item.subTitle}
                        </span>
                      )}
                      {item.isNew && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs px-2 py-0.5 gap-1 animate-pulse font-bold">
                          <Sparkles className="size-3" />
                          Terbaru
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="size-3.5 text-muted-foreground/80 shrink-0" />
                        <span className="truncate">{item.wilayah}</span>
                      </span>
                      {item.alamatDetail && (
                        <>
                          <span>•</span>
                          <span className="text-muted-foreground/90 truncate font-normal">
                            {item.alamatDetail}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Badges & Relative Timestamp */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                  <Badge
                    variant={item.source === "users" ? "outline" : "secondary"}
                    className="text-xs sm:text-sm font-semibold py-1 px-3"
                  >
                    {item.badgeLabel}
                  </Badge>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <Clock className="size-3.5 text-muted-foreground/70" />
                    <span>{item.waktu}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-muted/10">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <UserPlus className="size-6" />
            </div>
            <p className="text-base font-bold text-foreground">
              Belum ada aktivitas warga terdaftar
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Pendaftaran warga baru melalui formulir registrasi akan otomatis muncul di feed ini secara realtime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
