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
        description: "Selamat datang kembali di Portal TEKAD Kota Tegal.",
      });
      setLoginForm({ email: "", password: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-all shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Sisi Kiri: Logo & Badge Kota Tegal */}
          <div className="flex items-center gap-3">
            <Link
              href="/linimasa"
              className="group flex items-center gap-2.5 transition-transform active:scale-95"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-sm ring-1 ring-emerald-500/30 group-hover:shadow-md transition-all">
                <Sparkles className="size-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    jarimas<span className="text-emerald-600 dark:text-emerald-400">.id</span>
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-1.5 py-0 h-4.5"
                  >
                    TEKAD
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium -mt-0.5">
                  <MapPin className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Kota Tegal</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Sisi Tengah/Kanan: Menu Navigasi Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === "/linimasa" && pathname === "/");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sisi Kanan: Tombol Masuk / Login & Menu Mobile */}
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => setLoginModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8.5 px-3.5 shadow-xs transition-all"
            >
              <LogIn className="size-3.5" />
              <span>Masuk / Login</span>
            </Button>

            {/* Mobile Hamburger Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden size-8.5 p-0 text-foreground border-border/80"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* 2. MOBILE NAVIGATION DRAWER / PANEL */}
        {mobileMenuOpen && (
          <div className="border-t border-border/80 bg-background/95 backdrop-blur-lg px-4 py-3 md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4" />
                      <span>{link.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{link.description}</span>
                  </Link>
                );
              })}

              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 h-9"
                >
                  <LogIn className="size-3.5" />
                  <span>Masuk / Login Petugas</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 w-full">{children}</main>

      {/* 4. FOOTER RESMI */}
      <footer className="border-t border-border/70 bg-card/60 py-6 text-xs text-muted-foreground backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-foreground">jarimas.id</span>
            <span>—</span>
            <span>Portal Kesejahteraan & Komunitas Terpadu Kota Tegal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Kemendagri Kode 33.76</span>
            <span>•</span>
            <span>4 Kecamatan & 27 Kelurahan</span>
            <span>•</span>
            <span className="text-foreground font-medium">© 2026 Pemerintah Kota Tegal</span>
          </div>
        </div>
      </footer>

      {/* 5. MODAL MASUK / LOGIN */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building className="size-5" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Masuk ke Portal jarimas.id
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Portal Layanan Terpadu Petugas RT/RW, Posyandu, & Kader Komunitas Kota Tegal
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <User className="size-3 text-muted-foreground" />
                Email / NIP / ID Petugas
              </label>
              <Input
                type="text"
                placeholder="petugas@tegalkota.go.id"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Lock className="size-3 text-muted-foreground" />
                Kata Sandi
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>Wilayah: Kota Tegal (33.76)</span>
              <button
                type="button"
                onClick={() => toast.info("Silakan hubungi administrator kelurahan Anda.")}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Lupa Sandi?
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLoginModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoggingIn}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
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
