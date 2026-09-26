"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  LogIn,
  UserPlus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Layers,
  HeartHandshake,
  School,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  Baby,
} from "lucide-react";

interface UserProfile {
  id: string;
  email?: string;
  nama_lengkap?: string;
  username?: string;
  kelurahan_nama?: string;
  rw?: string;
  rt?: string;
}

interface NavbarProps {
  isLandingPage?: boolean;
}

export function Navbar({ isLandingPage = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);

  // 1. Deteksi status autentikasi Supabase secara Realtime
  useEffect(() => {
    const supabase = createClient();

    const fetchUserProfile = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          setIsLoadingAuth(false);
          return;
        }

        // Ambil data detail profil dari tabel public.users
        const { data: profile } = await supabase
          .from("users")
          .select("id, email, username, nama_lengkap, domisili_kelurahan_id, domisili_rw, domisili_rt, kk_kelurahan_id, kk_rw, kk_rt")
          .eq("id", authUser.id)
          .maybeSingle();

        setUser({
          id: authUser.id,
          email: authUser.email,
          nama_lengkap:
            profile?.nama_lengkap ||
            authUser.user_metadata?.nama_lengkap ||
            authUser.user_metadata?.full_name ||
            "Warga Kota Tegal",
          username:
            profile?.username || authUser.user_metadata?.username || null,
          rw: profile?.domisili_rw || profile?.kk_rw || null,
          rt: profile?.domisili_rt || profile?.kk_rt || null,
        });
      } catch (err) {
        console.warn("Gagal memuat profil pengguna:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    fetchUserProfile();

    // Langganan perubahan status auth (login, logout, refresh token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile();
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Handler Logout Pengguna
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      setProfilePopoverOpen(false);
      setMobileMenuOpen(false);

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Gagal keluar akun: " + error.message);
        return;
      }

      setUser(null);
      toast.success("Berhasil keluar dari akun", {
        description: "Sesi login Anda telah dihapus. Sampai jumpa kembali!",
      });

      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Terjadi kesalahan saat logout.");
    }
  };

  // Navigasi menu utama
  const navLinks = [
    {
      name: "Linimasa",
      href: "/linimasa",
      icon: Layers,
      description: "Feed realtime data & statistik warga",
    },
    {
      name: "Kanal Posyandu",
      href: "/linimasa?tab=posyandu",
      icon: HeartHandshake,
      description: "Jadwal posyandu & balita",
    },
    {
      name: "Kanal PAUD & Sekolah",
      href: "/linimasa?tab=sekolah",
      icon: School,
      description: "Informasi PAUD, TK, SD, SMP",
    },
    {
      name: "Data Anak (0-7 Thn)",
      href: "/data-anak",
      icon: Baby,
      description: "Sensus & verval silang data anak",
    },
  ];

  // Inisial avatar pengguna
  const userInitials = (user?.nama_lengkap || user?.username || "W")
    .replace(/^@/, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const displayName = user?.nama_lengkap || (user?.username ? `@${user.username}` : "Akun Warga");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* SISI KIRI: LOGO & BADGE WILAYAH KOTA TEGAL */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3">
          <Link
            href={user ? "/linimasa" : "/"}
            className="group flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="flex size-10 sm:size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-sm ring-1 ring-emerald-500/30 group-hover:shadow-md transition-all">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  jarimas<span className="text-emerald-600 dark:text-emerald-400">.id</span>
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-md"
                >
                  Kota Tegal
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <MapPin className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Kode 33.76 • Jateng</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* SISI TENGAH: MENU NAVIGASI DESKTOP */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-1.5">
          {user ? (
            // Navigasi saat sudah login
            navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === "/linimasa" && pathname === "/linimasa");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs"
                      : "text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300 font-medium"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })
          ) : isLandingPage ? (
            // Navigasi saat berada di Landing Page publik
            <>
              <a
                href="#komunitas"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300 transition-colors"
              >
                Komunitas
              </a>
              <a
                href="#kabar"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300 transition-colors"
              >
                Kabar Warga
              </a>
              <a
                href="#market"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300 transition-colors"
              >
                Jarimas Market
              </a>
              <a
                href="#statistik"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300 transition-colors"
              >
                Statistik
              </a>
            </>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300"
            >
              <span>Beranda Publik</span>
            </Link>
          )}
        </nav>

        {/* ========================================================================= */}
        {/* SISI KANAN: STATUS AUTH (MASUK/DAFTAR vs DROPDOWN PROFIL) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5">
          {!isLoadingAuth && user ? (
            // =====================================================================
            // KONDISI SUDAH LOGIN: TAMPILKAN TOMBOL / DROPDOWN PROFIL PENGGUNA
            // =====================================================================
            <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
              <PopoverTrigger
                type="button"
                className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card p-1.5 sm:px-3 sm:py-2 text-left shadow-2xs transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Avatar className="size-9 sm:size-9.5 ring-2 ring-emerald-500/30">
                  <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs sm:text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col min-w-0 max-w-[140px]">
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {user.rw ? `Warga RW ${user.rw}` : "Warga Terdaftar"}
                  </span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground hidden sm:block" />
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-72 sm:w-80 p-3 rounded-2xl border border-border/80 shadow-lg bg-card/98 backdrop-blur-md"
              >
                {/* Header Profil Ringkas */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
                  <Avatar className="size-11 ring-2 ring-emerald-500/30 shrink-0">
                    <AvatarFallback className="bg-emerald-600 text-white font-bold text-base">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.nama_lengkap || "Warga Terdaftar"}
                    </p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] py-0 px-1.5 font-semibold"
                    >
                      <ShieldCheck className="size-2.5 mr-1" />
                      Aktif Terverifikasi
                    </Badge>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Menu Pilihan Dropdown: 1. Atur Profil & 2. Keluar */}
                <div className="space-y-1">
                  {/* Pilihan 1: Atur Profil */}
                  <Link
                    href="/profil"
                    onClick={() => setProfilePopoverOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 group"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20">
                      <UserCheck className="size-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold">Atur Profil</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Perbarui data identitas & domisili
                      </span>
                    </div>
                  </Link>

                  {/* Pilihan 2: Keluar (Sign Out) */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15 transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20">
                      <LogOut className="size-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold">Keluar</span>
                      <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-normal">
                        Akhiri sesi login di perangkat ini
                      </span>
                    </div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            // =====================================================================
            // KONDISI BELUM LOGIN: TAMPILKAN TOMBOL MASUK DAN DAFTAR
            // =====================================================================
            <>
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="items-center gap-2 text-sm font-semibold h-10 px-4 border-border/90 hover:bg-muted rounded-xl"
                >
                  <LogIn className="size-4" />
                  <span>Masuk</span>
                </Button>
              </Link>

              <Link href="/registrasi" className="hidden sm:block">
                <Button
                  size="sm"
                  className="items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold h-10 px-4 shadow-xs rounded-xl"
                >
                  <UserPlus className="size-4" />
                  <span>Daftar</span>
                </Button>
              </Link>

              {/* Mobile Quick Auth Buttons */}
              <div className="flex sm:hidden items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 px-3 font-semibold rounded-xl border-border/80"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/registrasi">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3 shadow-xs rounded-xl"
                  >
                    Daftar
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Mobile Hamburger Drawer Button */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden size-9.5 p-0 text-foreground border-border/80 rounded-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER NAVIGATION MENU */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="border-t border-border/80 bg-background/98 backdrop-blur-lg px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="space-y-2">
            {user ? (
              <>
                {/* Info Pengguna Mobile */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
                  <Avatar className="size-10 ring-2 ring-emerald-500/30">
                    <AvatarFallback className="bg-emerald-600 text-white font-bold text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                          : "text-slate-800 hover:bg-muted hover:text-foreground dark:text-slate-200 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <span>{link.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </Link>
                  );
                })}

                <div className="pt-3 flex flex-col gap-2 border-t border-border/60">
                  <Link
                    href="/profil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full text-sm h-11 justify-center gap-2 font-semibold rounded-xl"
                    >
                      <Settings className="size-4" />
                      <span>Atur Profil Pengguna</span>
                    </Button>
                  </Link>

                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full text-sm h-11 justify-center gap-2 font-bold rounded-xl"
                  >
                    <LogOut className="size-4" />
                    <span>Keluar dari Akun</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <Link
                    href="/#komunitas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-muted dark:text-slate-200 rounded-xl"
                  >
                    Komunitas
                  </Link>
                  <Link
                    href="/#kabar"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-muted dark:text-slate-200 rounded-xl"
                  >
                    Kabar Warga
                  </Link>
                  <Link
                    href="/#market"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-muted dark:text-slate-200 rounded-xl"
                  >
                    Jarimas Market
                  </Link>
                  <Link
                    href="/#statistik"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-muted dark:text-slate-200 rounded-xl"
                  >
                    Statistik
                  </Link>
                </div>

                <div className="pt-3 flex flex-col gap-2.5 border-t border-border/60">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full text-sm h-11 justify-center gap-2 font-semibold rounded-xl"
                    >
                      <LogIn className="size-4" />
                      <span>Masuk ke Akun</span>
                    </Button>
                  </Link>
                  <Link href="/registrasi" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold h-11 gap-2 rounded-xl"
                    >
                      <UserPlus className="size-4" />
                      <span>Daftar Akun Warga Baru</span>
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
