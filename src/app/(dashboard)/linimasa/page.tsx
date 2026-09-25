"use client";

import React, { useEffect, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  CardWelcoming,
  CardIdentityStatus,
  CardStatistics,
  CardKanalDiscovery,
} from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

import {
  Radio,
  RefreshCw,
  Layers,
  Database,
  Users,
  Activity,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

function LinimasaContent() {
  const supabase = createClient();
  const queryClient = useQueryClient();


  // 1. TanStack Query untuk fetch data awal
  const {
    data: wargaData = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["data_warga"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_warga")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        // Mengembalikan array kosong jika tabel belum ada atau terjadi error koneksi
        console.warn("Info query data_warga:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  // 2. Supabase Realtime Subscription (postgres_changes)
  useEffect(() => {
    const channel = supabase
      .channel("realtime:data_warga_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "data_warga",
        },
        (payload) => {
          toast.success("Perubahan Data Realtime Terdeteksi!", {
            description: `Event: ${payload.eventType} pada data warga. Cache otomatis diperbarui.`,
          });

          // Invalidate dan refetch query otomatis
          queryClient.invalidateQueries({ queryKey: ["data_warga"] });
          queryClient.invalidateQueries({ queryKey: ["warga_statistics"] });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Berhasil terhubung ke Supabase Realtime (data_warga).");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Layers className="size-3.5" />
              <span>Portal TEKAD Kota Tegal</span>
              <span>/</span>
              <span className="font-semibold text-foreground">Linimasa Warga</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard Linimasa Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Monitoring status identitas kependudukan, kanal posyandu, dan statistik kependudukan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              <Radio className="size-3 animate-pulse text-emerald-500" />
              Realtime Active
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.info("Memperbarui data linimasa...");
              }}
              disabled={isLoading || isRefetching}
              className="gap-1.5 text-xs h-8"
            >
              <RefreshCw
                className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Grid Kartu Utama */}
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Welcoming Card (Full Width Banner) */}
          <CardWelcoming
            userName="Budi Santoso"
            role="Warga RW 04 Mintaragen"
          />

          {/* 2. Grid 2 Kolom: Status Identitas & Kanal Discovery */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <CardIdentityStatus
                statusType="Penduduk"
                nik="3328012408980002"
                kota="Kota Tegal"
                kecamatan="Tegal Timur"
                kelurahan="Mintaragen"
                rw="04"
                rt="02"
                alamatLengkap="Jl. Mataram No. 18, Mintaragen, Tegal Timur"
              />
            </div>
            <div className="lg:col-span-7">
              <CardKanalDiscovery />
            </div>
          </div>

          {/* 3. Card Statistik & Grafik Rekapitulasi (Full Width) */}
          <CardStatistics isLoading={isLoading} />


          {/* 4. Realtime Data Warga Feed Section */}
          <Card className="border border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Feed Realtime Data Warga (Supabase)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      10 entri data warga terakhir yang tersinkronisasi langsung dengan database
                    </CardDescription>
                  </div>
                </div>

                <Badge variant="secondary" className="text-xs">
                  {wargaData.length} Data Termuat
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin text-primary" />
                  <span>Memuat data warga dari Supabase...</span>
                </div>
              ) : wargaData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/80 text-muted-foreground bg-muted/30">
                        <th className="py-2.5 px-3 font-medium">Nama Anak</th>
                        <th className="py-2.5 px-3 font-medium">NIK</th>
                        <th className="py-2.5 px-3 font-medium">Tempat/Tgl Lahir</th>
                        <th className="py-2.5 px-3 font-medium">Gender</th>
                        <th className="py-2.5 px-3 font-medium">Wali</th>
                        <th className="py-2.5 px-3 font-medium">Status Tinggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {wargaData.map((w: Record<string, any>, idx: number) => (
                        <tr key={w.id || idx} className="hover:bg-muted/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            {w.nama_anak || "-"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">
                            {w.nik_anak || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {w.tempat_tanggal_lahir || "-"}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant={w.jenis_kelamin === "L" ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {w.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {w.nama_wali || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {w.status_tinggal || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
                    <Users className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Belum ada data warga terdaftar di tabel
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                    Data baru yang dimasukkan melalui Server Action akan otomatis muncul di sini secara realtime.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LinimasaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/20 p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin text-primary" />
            <span>Memuat Linimasa Dashboard...</span>
          </div>
        </div>
      }
    >
      <LinimasaContent />
    </Suspense>
  );
}

