"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ShieldCheck } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      {/* 1. TOP DYNAMIC NAVBAR */}
      <Navbar />

      {/* 2. MAIN DASHBOARD CONTENT (Padded for Mobile Bottom Nav) */}
      <main className="flex-1 w-full pb-24 md:pb-6">{children}</main>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (FIXED FOR SMARTPHONES) */}
      <MobileNav />

      {/* 4. FOOTER RESMI */}
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
    </div>
  );
}
