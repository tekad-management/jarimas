"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Layers,
  HeartHandshake,
  GraduationCap,
  Building2,
  User,
} from "lucide-react";

function MobileNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || searchParams.get("unit_type");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    {
      name: "Linimasa",
      href: "/linimasa",
      icon: Layers,
      isActive: (pathname === "/linimasa" || pathname === "/") && !activeTabParam,
    },
    {
      name: "Posyandu",
      href: "/linimasa?tab=posyandu",
      icon: HeartHandshake,
      isActive:
        pathname.startsWith("/kanal/posyandu") ||
        ((pathname === "/linimasa" || pathname === "/") && activeTabParam === "posyandu"),
    },
    {
      name: "PAUD & PNF",
      href: "/linimasa?tab=sekolah",
      icon: GraduationCap,
      isActive:
        pathname.startsWith("/kanal/sekolah") ||
        ((pathname === "/linimasa" || pathname === "/") && activeTabParam === "sekolah"),
    },
    {
      name: "OPD",
      href: "/linimasa?tab=opd",
      icon: Building2,
      isActive:
        pathname.startsWith("/kanal/opd") ||
        ((pathname === "/linimasa" || pathname === "/") && activeTabParam === "opd"),
    },
    {
      name: isLoggedIn ? "Profil" : "Akun",
      href: isLoggedIn ? "/profil" : "/login",
      icon: User,
      isActive:
        pathname.startsWith("/profil") ||
        pathname === "/login" ||
        pathname === "/register",
    },
  ];

  return (
    <nav
      aria-label="Navigasi Seluler Bawah"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[52px] rounded-xl transition-all duration-150 active:scale-90 select-none ${
                active
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
              }`}
            >
              <div
                className={`flex items-center justify-center size-8 rounded-full transition-all ${
                  active
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "bg-transparent"
                }`}
              >
                <Icon className={`size-5 transition-transform ${active ? "scale-110" : "scale-100"}`} />
              </div>
              <span
                className={`text-[11px] leading-tight tracking-tight mt-0.5 ${
                  active ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-medium"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavContent />
    </Suspense>
  );
}

export default MobileNav;
