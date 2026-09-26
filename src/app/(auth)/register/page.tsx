"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { saveRegisteredUserProfile } from "@/actions/auth-actions";
import {
  registerSchema,
  type RegisterFormInput,
  hitungUsia,
  MASTER_KECAMATAN_TEGAL,
  MASTER_KELURAHAN_TEGAL,
  LIST_RT_RW,
} from "@/lib/validators/register-schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  User,
  Mail,
  MailCheck,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  MapPin,
  CheckCircle2,
  Calendar as CalendarIcon,
  Building2,
  Home,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "cn";

const BULAN_INDONESIA = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Default date state for custom calendar popover
  const initialDate = new Date(2000, 0, 1);
  const [calMonth, setCalMonth] = useState<number>(initialDate.getMonth());
  const [calYear, setCalYear] = useState<number>(initialDate.getFullYear());

  // 1. Inisialisasi Form dengan React Hook Form & Zod
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      nama_lengkap: "",
      username: "",
      email: "",
      password: "",
      tanggal_lahir: "",
      kk_kabkota: "KOTA_TEGAL",
      kk_kecamatan_id: "kec-tt",
      kk_kelurahan_id: "kel-mintaragen",
      kk_rt: "01",
      kk_rw: "01",
      domisili_sama_dengan_kk: true,
      domisili_kecamatan_id: "kec-tt",
      domisili_kelurahan_id: "kel-mintaragen",
      domisili_rt: "01",
      domisili_rw: "01",
      alamat_detail: "",
    },
  });

  const watchTanggalLahir = form.watch("tanggal_lahir");
  const watchKkKabkota = form.watch("kk_kabkota");
  const watchKkKecamatan = form.watch("kk_kecamatan_id");
  const watchDomisiliSamaDenganKk = form.watch("domisili_sama_dengan_kk");
  const watchDomisiliKecamatan = form.watch("domisili_kecamatan_id");

  // Hitung Usia Dinamis
  const usiaOtomatis = useMemo(() => {
    return hitungUsia(watchTanggalLahir);
  }, [watchTanggalLahir]);

  // Kelurahan terfilter sesuai Kecamatan KK
  const kelurahanKkOptions = useMemo(() => {
    if (!watchKkKecamatan) return [];
    return MASTER_KELURAHAN_TEGAL[watchKkKecamatan] || [];
  }, [watchKkKecamatan]);

  // Kelurahan terfilter sesuai Kecamatan Domisili
  const kelurahanDomisiliOptions = useMemo(() => {
    if (!watchDomisiliKecamatan) return [];
    return MASTER_KELURAHAN_TEGAL[watchDomisiliKecamatan] || [];
  }, [watchDomisiliKecamatan]);

  // Year options for calendar selector (1925 - 2026)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= 1925; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Generate calendar days for selected Month & Year
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday
    // Adjust so Monday = 0, Sunday = 6
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const days: { day: number; dateStr: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (calMonth + 1).toString().padStart(2, "0");
      const dayStr = d.toString().padStart(2, "0");
      days.push({
        day: d,
        dateStr: `${calYear}-${monthStr}-${dayStr}`,
      });
    }

    return { days, offset: adjustedFirstDay };
  }, [calYear, calMonth]);

  // 2. Submit Handler
  const onSubmit = async (values: RegisterFormInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Langkah 1: Registrasi akun ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username.toLowerCase(),
            nama_lengkap: values.nama_lengkap,
            full_name: values.nama_lengkap,
          },
        },
      });

      if (authError) {
        toast.error(authError.message || "Gagal melakukan registrasi akun.");
        return;
      }

      const userId = authData.user?.id;

      if (userId) {
        // Langkah 2: Simpan data profil lengkap & role via Server Action
        const profileResult = await saveRegisteredUserProfile(userId, values);

        if (!profileResult.success) {
          console.warn("Info profil save result:", profileResult.error);
        }
      }

      // Langkah 3: Notifikasi Berhasil & Tampilkan Modal Instruksi Konfirmasi Email
      setRegisteredEmail(values.email);
      setIsSuccessModalOpen(true);

      toast.success("Registrasi berhasil!", {
        description:
          "Buka email Anda dari Supabase, klik 'Confirm email address' dan silahkan masuk.",
        duration: 8000,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan pada sistem pendaftaran.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-10 bg-gradient-to-b from-emerald-500/5 via-background to-background selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-sm ring-1 ring-emerald-500/30 group-hover:shadow-md transition-all">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  jarimas<span className="text-emerald-600 dark:text-emerald-400">.id</span>
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-1.5 py-0 h-4.5"
                >
                  Kota Tegal
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium -mt-0.5">
                <MapPin className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kode 33.76</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <Card className="border-border/80 shadow-xl backdrop-blur-xs bg-card/95">
          <CardHeader className="space-y-1.5 pb-4 text-center border-b border-border/60">
            <div className="mx-auto mb-1 flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserPlus className="size-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Registrasi Akun Warga & Komunitas
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Lengkapi data kependudukan Anda untuk menikmati integrasi layanan posyandu, kanal sekolah, dan linimasa terpadu Kota Tegal.
            </CardDescription>

            <div className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[11px] text-emerald-700 dark:text-emerald-300 mx-auto">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Kepatuhan UU PDP No. 27/2022: Pendaftaran tanpa NIK / NISN / BPJS</span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* ---------------- SECTION 1: INFORMASI AKUN ---------------- */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground tracking-wide uppercase">
                    <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>1. Informasi Akun & Identitas</span>
                  </div>

                  {/* Nama Lengkap */}
                  <FormField
                    control={form.control}
                    name="nama_lengkap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Nama Lengkap
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Nama Sesuai Kartu Identitas"
                            autoComplete="name"
                            disabled={isLoading}
                            className="h-9 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username & Email in 2 columns on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Username with @ prefix */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Nama Pengguna (Username)
                          </FormLabel>
                          <FormControl>
                            <div className="relative flex items-center">
                              <div className="absolute left-2.5 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                @
                              </div>
                              <Input
                                type="text"
                                placeholder="username_warga"
                                autoComplete="username"
                                disabled={isLoading}
                                className="h-9 text-xs pl-9 font-medium"
                                {...field}
                                onChange={(e) => {
                                  // Hilangkan spasi otomatis
                                  const sanitized = e.target.value.replace(/\s+/g, "");
                                  field.onChange(sanitized);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Alamat Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="nama@email.com"
                              autoComplete="email"
                              disabled={isLoading}
                              className="h-9 text-xs"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tanggal Lahir & Usia Otomatis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
                    {/* Tanggal Lahir Popover Picker */}
                    <FormField
                      control={form.control}
                      name="tanggal_lahir"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs font-semibold">
                            Tanggal Lahir
                          </FormLabel>
                          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger
                              disabled={isLoading}
                              className={cn(
                                "h-9 w-full flex items-center justify-between text-left text-xs font-normal border border-input rounded-lg bg-transparent px-3 transition-colors outline-none cursor-pointer hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <CalendarIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                {field.value ? (
                                  (() => {
                                    const [y, m, d] = field.value.split("-");
                                    const mIndex = parseInt(m, 10) - 1;
                                    return `${parseInt(d, 10)} ${BULAN_INDONESIA[mIndex] || m} ${y}`;
                                  })()
                                ) : (
                                  "Pilih Tanggal Lahir"
                                )}
                              </span>
                              <ChevronDown className="size-3.5 text-muted-foreground" />
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-72 p-3 bg-card border border-border shadow-lg rounded-xl z-50"
                              align="start"
                            >
                              {/* Header: Pemilih Bulan & Tahun */}
                              <div className="flex items-center justify-between gap-1.5 mb-2.5 pb-2 border-b border-border/70">
                                {/* Dropdown Bulan */}
                                <select
                                  value={calMonth}
                                  onChange={(e) => setCalMonth(parseInt(e.target.value, 10))}
                                  className="h-8 text-xs font-semibold bg-muted/60 border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  {BULAN_INDONESIA.map((b, idx) => (
                                    <option key={b} value={idx}>
                                      {b}
                                    </option>
                                  ))}
                                </select>

                                {/* Dropdown Tahun */}
                                <select
                                  value={calYear}
                                  onChange={(e) => setCalYear(parseInt(e.target.value, 10))}
                                  className="h-8 text-xs font-semibold bg-muted/60 border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  {yearOptions.map((y) => (
                                    <option key={y} value={y}>
                                      {y}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Day names */}
                              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
                                <span>Sn</span>
                                <span>Sl</span>
                                <span>Rb</span>
                                <span>Km</span>
                                <span>Jm</span>
                                <span>Sb</span>
                                <span>Mg</span>
                              </div>

                              {/* Days grid */}
                              <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: calendarDays.offset }).map((_, i) => (
                                  <div key={`empty-${i}`} className="h-7 w-7" />
                                ))}
                                {calendarDays.days.map((item) => {
                                  const isSelected = field.value === item.dateStr;
                                  return (
                                    <button
                                      key={item.dateStr}
                                      type="button"
                                      onClick={() => {
                                        field.onChange(item.dateStr);
                                        setDatePickerOpen(false);
                                      }}
                                      className={cn(
                                        "size-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all",
                                        isSelected
                                          ? "bg-emerald-600 text-white font-bold shadow-xs"
                                          : "hover:bg-emerald-500/10 hover:text-emerald-600 text-foreground"
                                      )}
                                    >
                                      {item.day}
                                    </button>
                                  );
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Usia Indikator Otomatis */}
                    <div className="flex flex-col justify-end h-full">
                      <div className="text-xs font-semibold text-muted-foreground mb-1.5">
                        Indikator Usia
                      </div>
                      <div className="h-9 px-3 rounded-lg border border-border/80 bg-muted/40 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Kalkulasi:</span>
                        {usiaOtomatis !== null ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            🎂 Usia Anda: {usiaOtomatis} Tahun
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">
                            Pilih tanggal lahir
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kata Sandi dengan Toggle Show/Hide */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Kata Sandi
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              autoComplete="new-password"
                              disabled={isLoading}
                              className="h-9 text-xs pr-9"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ---------------- SECTION 2: ALAMAT SESUAI KK ---------------- */}
                <div className="space-y-3.5 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground tracking-wide uppercase">
                    <Building2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>2. Alamat Asal Sesuai Kartu Keluarga (KK)</span>
                  </div>

                  {/* Radio Pilihan Kabupaten / Kota */}
                  <FormField
                    control={form.control}
                    name="kk_kabkota"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-semibold">
                          Wilayah Asal KK
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange("KOTA_TEGAL");
                              if (!form.getValues("kk_kecamatan_id")) {
                                form.setValue("kk_kecamatan_id", "kec-tt");
                                form.setValue("kk_kelurahan_id", "kel-mintaragen");
                              }
                            }}
                            className={cn(
                              "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all",
                              field.value === "KOTA_TEGAL"
                                ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                                : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <Building2 className="size-4 shrink-0" />
                            <span>Kota Tegal</span>
                            {field.value === "KOTA_TEGAL" && (
                              <Check className="size-3.5 ml-auto text-emerald-600 dark:text-emerald-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              field.onChange("LUAR_KOTA_TEGAL");
                              form.setValue("kk_kecamatan_id", undefined);
                              form.setValue("kk_kelurahan_id", undefined);
                              form.setValue("kk_rt", undefined);
                              form.setValue("kk_rw", undefined);
                            }}
                            className={cn(
                              "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all",
                              field.value === "LUAR_KOTA_TEGAL"
                                ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                                : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <MapPin className="size-4 shrink-0" />
                            <span>Luar Kota Tegal</span>
                            {field.value === "LUAR_KOTA_TEGAL" && (
                              <Check className="size-3.5 ml-auto text-emerald-600 dark:text-emerald-400" />
                            )}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dropdown Kecamatan, Kelurahan, RT, RW KK jika KOTA_TEGAL */}
                  {watchKkKabkota === "KOTA_TEGAL" && (
                    <div className="space-y-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in-50 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Kecamatan KK */}
                        <FormField
                          control={form.control}
                          name="kk_kecamatan_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Kecamatan KK
                              </FormLabel>
                              <select
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Reset Kelurahan sesuai kecamatan baru
                                  const firstKel = MASTER_KELURAHAN_TEGAL[e.target.value]?.[0]?.id;
                                  form.setValue("kk_kelurahan_id", firstKel || "");
                                }}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                              >
                                {MASTER_KECAMATAN_TEGAL.map((kec) => (
                                  <option key={kec.id} value={kec.id}>
                                    {kec.nama}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Kelurahan KK */}
                        <FormField
                          control={form.control}
                          name="kk_kelurahan_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Kelurahan KK
                              </FormLabel>
                              <select
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                              >
                                {kelurahanKkOptions.map((kel) => (
                                  <option key={kel.id} value={kel.id}>
                                    {kel.nama}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* RT & RW KK */}
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="kk_rt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                RT KK
                              </FormLabel>
                              <select
                                value={field.value || "01"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                              >
                                {LIST_RT_RW.map((rt) => (
                                  <option key={rt.value} value={rt.value}>
                                    RT {rt.label}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="kk_rw"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                RW KK
                              </FormLabel>
                              <select
                                value={field.value || "01"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                              >
                                {LIST_RT_RW.map((rw) => (
                                  <option key={rw.value} value={rw.value}>
                                    RW {rw.label}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------------- SECTION 3: ALAMAT DOMISILI ---------------- */}
                <div className="space-y-3.5 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground tracking-wide uppercase">
                    <Home className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>3. Alamat Domisili Tempat Tinggal</span>
                  </div>

                  {/* Switch / Checkbox Domisili Sama dengan KK */}
                  <FormField
                    control={form.control}
                    name="domisili_sama_dengan_kk"
                    render={({ field }) => (
                      <FormItem>
                        <label className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              field.onChange(checked);
                              if (checked && watchKkKabkota === "KOTA_TEGAL") {
                                form.setValue("domisili_kecamatan_id", watchKkKecamatan);
                                form.setValue("domisili_kelurahan_id", form.getValues("kk_kelurahan_id"));
                                form.setValue("domisili_rt", form.getValues("kk_rt"));
                                form.setValue("domisili_rw", form.getValues("kk_rw"));
                              }
                            }}
                            className="size-4.5 mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              Alamat Domisili Sama Dengan Alamat KK
                            </span>
                            <span className="text-[11px] text-muted-foreground leading-relaxed">
                              Centang jika Anda saat ini menetap di alamat yang tercantum pada Kartu Keluarga.
                            </span>
                          </div>
                        </label>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Form Domisili Kota Tegal jika unchecked */}
                  {!watchDomisiliSamaDenganKk && (
                    <div className="space-y-3 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 animate-in fade-in-50 duration-200">
                      <div className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <span>Alamat Domisili Tinggal di Kota Tegal:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Kecamatan Domisili */}
                        <FormField
                          control={form.control}
                          name="domisili_kecamatan_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Kecamatan Domisili
                              </FormLabel>
                              <select
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  const firstKel = MASTER_KELURAHAN_TEGAL[e.target.value]?.[0]?.id;
                                  form.setValue("domisili_kelurahan_id", firstKel || "");
                                }}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                              >
                                {MASTER_KECAMATAN_TEGAL.map((kec) => (
                                  <option key={kec.id} value={kec.id}>
                                    {kec.nama}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Kelurahan Domisili */}
                        <FormField
                          control={form.control}
                          name="domisili_kelurahan_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Kelurahan Domisili
                              </FormLabel>
                              <select
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                              >
                                {kelurahanDomisiliOptions.map((kel) => (
                                  <option key={kel.id} value={kel.id}>
                                    {kel.nama}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* RT & RW Domisili */}
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="domisili_rt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                RT Domisili
                              </FormLabel>
                              <select
                                value={field.value || "01"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                              >
                                {LIST_RT_RW.map((rt) => (
                                  <option key={rt.value} value={rt.value}>
                                    RT {rt.label}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="domisili_rw"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                RW Domisili
                              </FormLabel>
                              <select
                                value={field.value || "01"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                              >
                                {LIST_RT_RW.map((rw) => (
                                  <option key={rw.value} value={rw.value}>
                                    RW {rw.label}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Alamat Detail Jalan / Gang / Blok / No */}
                  <FormField
                    control={form.control}
                    name="alamat_detail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Alamat Detail Jalan / Gang / Blok / No
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="cukup isi nama jalan/gang/blok/ dan nomor"
                            disabled={isLoading}
                            className="h-9 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                      <span>Mendaftarkan Akun & Profil Warga...</span>
                    </>
                  ) : (
                    <>
                      <span>Selesaikan Pendaftaran</span>
                      <ArrowRight className="size-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-border/70 py-4 bg-muted/30 rounded-b-xl text-center">
            <p className="text-xs text-muted-foreground">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Keamanan Data Terenkripsi • Kota Tegal 33.76</span>
        </div>
      </div>

      {/* Modal Dialog Pop-up Sukses Registrasi & Verifikasi Email */}
      <Dialog
        open={isSuccessModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSuccessModalOpen(false);
            router.push("/login");
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-border/80 shadow-2xl backdrop-blur-xs bg-card/95">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <div className="mx-auto mb-1 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-inner">
              <MailCheck className="size-7" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Registrasi Berhasil!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Buka email Anda dari Supabase, klik{" "}
              <span className="text-foreground font-semibold">
                &apos;Confirm email address&apos;
              </span>{" "}
              dan silahkan masuk.
            </DialogDescription>
          </DialogHeader>

          {registeredEmail && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <Mail className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                  Email Tujuan Verifikasi:
                </span>
                <span className="font-semibold truncate">{registeredEmail}</span>
              </div>
            </div>
          )}

          <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg p-2.5 space-y-1 border border-border/60 text-left">
            <p className="font-medium text-foreground">💡 Panduan Cepat:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>
                Periksa folder <strong>Spam / Junk / Promosi</strong> jika email tidak langsung muncul.
              </li>
              <li>
                Setelah tautan konfirmasi diklik, akun Anda aktif dan siap digunakan untuk masuk.
              </li>
            </ul>
          </div>

          <DialogFooter className="pt-2 sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push("/login");
              }}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <span>Mengerti, Ke Halaman Login</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
