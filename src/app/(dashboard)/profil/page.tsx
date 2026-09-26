"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Building2,
  Home,
  Save,
  LogOut,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Layers,
  HeartPulse,
  GraduationCap,
  Landmark,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [username, setUsername] = useState("");
  const [alamatDetail, setAlamatDetail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch data profil pengguna dari Supabase
  const { data: profile, isLoading } = useQuery({
    queryKey: ["current_user_profile_detail"],
    queryFn: async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/?auth=required");
        return null;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      const { data: memberships } = await supabase
        .from("user_kanal_memberships")
        .select("id, tipe_kanal, kanal_nama, peran")
        .eq("user_id", authUser.id);

      return {
        authUser,
        userData: userData || {},
        memberships: memberships || [],
      };
    },
  });

  // Sinkronisasi input form saat data profil termuat
  useEffect(() => {
    if (profile?.userData) {
      setNamaLengkap(
        profile.userData.nama_lengkap ||
        profile.authUser.user_metadata?.nama_lengkap ||
        ""
      );
      setUsername(
        profile.userData.username ||
        profile.authUser.user_metadata?.username ||
        ""
      );
      setAlamatDetail(profile.userData.alamat_detail || "");
    }
  }, [profile]);

  // 2. Simpan Pembaruan Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.authUser) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          nama_lengkap: namaLengkap,
          username: username.toLowerCase().trim(),
          alamat_detail: alamatDetail.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.authUser.id);

      if (error) {
        toast.error("Gagal menyimpan profil: " + error.message);
        return;
      }

      toast.success("Profil Berhasil Diperbarui!", {
        description: "Data identitas Anda telah tersimpan secara realtime.",
      });

      queryClient.invalidateQueries({ queryKey: ["current_user_profile_detail"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-full-profile"] });
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Keluar Akun
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar: " + error.message);
      return;
    }
    toast.success("Berhasil keluar dari akun");
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const uData = profile?.userData || {};
  const userInitials = (namaLengkap || username || "W")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigasi Balik & Judul */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/linimasa">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-3.5 gap-2 font-semibold text-xs sm:text-sm"
              >
                <ArrowLeft className="size-4" />
                <span>Kembali ke Linimasa</span>
              </Button>
            </Link>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm font-semibold self-start sm:self-auto shadow-2xs"
          >
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Akun Kependudukan Terdaftar</span>
          </Badge>
        </div>

        {/* 1. KARTU HEADER PROFIL PENGGUNA */}
        <Card className="border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-28 sm:h-36 relative" />
          <CardContent className="p-5 sm:p-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
              <div className="flex items-end gap-4">
                <Avatar className="size-24 sm:size-28 ring-4 ring-background shadow-md">
                  <AvatarFallback className="bg-emerald-700 text-white font-black text-2xl sm:text-3xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 mb-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black text-foreground truncate">
                    {namaLengkap || "Warga Terdaftar"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                    {username ? `@${username}` : profile?.authUser?.email}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="h-11 px-5 rounded-xl font-bold text-xs sm:text-sm gap-2 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <LogOut className="size-4" />
                <span>Keluar dari Akun</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                <Mail className="size-4.5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase">Email Akun</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {profile?.authUser?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                <MapPin className="size-4.5 text-teal-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase">Domisili RW/RT</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                    RW {uData.domisili_rw || uData.kk_rw || "01"} / RT {uData.domisili_rt || uData.kk_rt || "01"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                <Calendar className="size-4.5 text-cyan-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase">Status Warga</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 truncate">
                    {uData.status_kewargaan || "Penduduk Terdaftar"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. FORMULIR PENGATURAN PROFIL */}
        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <User className="size-5.5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                  Pengaturan Data Identitas
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Perbarui nama lengkap, nama pengguna, dan alamat tinggal detail Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-0">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground">
                    Nama Lengkap (Sesuai KTP/KK)
                  </label>
                  <Input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    placeholder="Nama Lengkap"
                    className="h-11 sm:h-12 text-sm sm:text-base rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground">
                    Username Akun
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama_pengguna"
                    className="h-11 sm:h-12 text-sm sm:text-base rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">
                  Alamat Detail Domisili (Jalan / Gang / Nomor Rumah)
                </label>
                <Input
                  type="text"
                  value={alamatDetail}
                  onChange={(e) => setAlamatDetail(e.target.value)}
                  placeholder="Contoh: Jl. Belanak No. 12, Kel. Mintaragen"
                  className="h-11 sm:h-12 text-sm sm:text-base rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 sm:h-12 px-6 rounded-xl text-sm sm:text-base gap-2 shadow-xs"
                >
                  <Save className="size-4.5" />
                  <span>{isSaving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 3. KANAL & KEANGGOTAAN TERDAFTAR */}
        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                <Layers className="size-5.5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                  Keanggotaan Kanal Komunitas
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Daftar kanal posyandu, satuan pendidikan, dan OPD yang terhubung dengan akun Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-0">
            {profile?.memberships && profile.memberships.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.memberships.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-border/70 bg-muted/30 flex items-center gap-3 shadow-2xs"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                      {m.tipe_kanal === "POSYANDU" ? (
                        <HeartPulse className="size-5" />
                      ) : m.tipe_kanal === "SEKOLAH" ? (
                        <GraduationCap className="size-5" />
                      ) : (
                        <Landmark className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {m.kanal_nama}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {m.tipe_kanal} • {m.peran || "Anggota"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl border border-dashed border-border/80 bg-muted/10">
                <p className="text-sm font-semibold text-foreground">
                  Belum Ada Kanal Tambahan yang Terdaftar
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Anda dapat bergabung ke kanal Posyandu atau Sekolah melalui menu penjelajahan kanal di Linimasa.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
