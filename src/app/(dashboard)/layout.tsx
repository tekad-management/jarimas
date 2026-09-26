"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  Layers,
  HeartHandshake,
  School,
  LogIn,
  Menu,
  X,
  Sparkles,
  MapPin,
  ShieldCheck,
  Building,
  User,
  Lock,
  UserPlus,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navLinks = [
    {
      name: "Linimasa",
      href: "/linimasa",
      icon: Layers,
      description: "Feed realtime data & statistik warga",
    },
    {
      name: "Kanal Posyandu",
      href: "/linimasa?unit_type=posyandu",
      icon: HeartHandshake,
      description: "Jadwal posyandu & balita",
    },
    {
      name: "Kanal Sekolah",
      href: "/linimasa?unit_type=sekolah",
      icon: School,
      description: "Informasi PAUD, TK, SD, SMP",
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setLoginModalOpen(false);
      toast.success("Login Berhasil!", {
        description: "Selamat datang kembali di Portal jarimas.id Kota Tegal.",
      });
      setLoginForm({ email: "", password: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all shadow-xs">
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Sisi Kiri: Logo & Badge Kota Tegal */}
          <div className="flex items-center gap-3">
            <Link
              href="/linimasa"
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

          {/* Sisi Tengah/Kanan: Menu Navigasi Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === "/linimasa" && pathname === "/");

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
            })}
          </nav>

          {/* Sisi Kanan: Tombol Masuk & Daftar / Menu Mobile */}
          <div className="flex items-center gap-2.5">
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

            <Link href="/register" className="hidden sm:block">
              <Button
                size="sm"
                className="items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold h-10 px-4 shadow-xs rounded-xl"
              >
                <UserPlus className="size-4" />
                <span>Daftar</span>
              </Button>
            </Link>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs h-9 px-3 font-semibold rounded-xl border-border/80">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3 shadow-xs rounded-xl">
                  Daftar
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
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

        {/* 2. MOBILE NAVIGATION DRAWER / PANEL */}
        {mobileMenuOpen && (
          <div className="border-t border-border/80 bg-background/95 backdrop-blur-lg px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
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
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold h-11 gap-2 rounded-xl"
                  >
                    <UserPlus className="size-4" />
                    <span>Daftar Akun Warga Baru</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN DASHBOARD CONTENT (Padded for Mobile Bottom Nav) */}
      <main className="flex-1 w-full pb-24 md:pb-6">{children}</main>

      {/* 4. MOBILE BOTTOM NAVIGATION BAR (FIXED FOR SMARTPHONES) */}
      <MobileNav />

      {/* 5. FOOTER RESMI */}
      <footer className="border-t border-border/70 bg-card/60 py-6 text-sm text-muted-foreground backdrop-blur-xs hidden md:block">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-foreground">jarimas.id</span>
            <span>—</span>
            <span>Portal Kesejahteraan & Komunitas Terpadu Kota Tegal</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Kode Wilayah 33.76</span>
            <span>•</span>
            <span>4 Kecamatan & 27 Kelurahan</span>
            <span>•</span>
            <span className="text-foreground font-medium">© 2026 Pemerintah Kota Tegal</span>
          </div>
        </div>
      </footer>

      {/* 5. MODAL MASUK / LOGIN */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <Building className="size-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">
              Masuk ke Portal jarimas.id
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Portal Layanan Terpadu Petugas RT/RW, Posyandu, & Kader Komunitas Kota Tegal
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                Email / NIP / ID Petugas
              </label>
              <Input
                type="text"
                placeholder="petugas@tegalkota.go.id"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                className="text-sm sm:text-base h-11 sm:h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                Kata Sandi
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className="text-sm sm:text-base h-11 sm:h-12"
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-0.5">
              <span>Wilayah: Kota Tegal (33.76)</span>
              <button
                type="button"
                onClick={() => toast.info("Silakan hubungi administrator kelurahan Anda.")}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Lupa Sandi?
              </button>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLoginModalOpen(false)}
                className="text-sm font-semibold h-11"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold gap-2 h-11"
              >
                {isLoggingIn ? "Memproses..." : "Masuk ke Sistem"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
