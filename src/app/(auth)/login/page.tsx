"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
  Sparkles,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  MapPin,
} from "lucide-react";

// 1. Zod Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Alamat email wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(6, { message: "Kata sandi minimal 6 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. Form Setup with React Hook Form & Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Supabase Auth Handler
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
        return;
      }

      toast.success("Berhasil masuk!");
      router.push("/linimasa");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-emerald-500/5 via-background to-background selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto space-y-6">
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

        {/* Login Card */}
        <Card className="border-border/80 shadow-lg backdrop-blur-xs bg-card/95">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building className="size-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Masuk ke Portal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Silakan masukkan email dan kata sandi Anda untuk mengakses layanan jarimas.id Kota Tegal
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs font-semibold">
                        <Mail className="size-3.5 text-muted-foreground" />
                        <span>Email</span>
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

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold">
                          <Lock className="size-3.5 text-muted-foreground" />
                          <span>Kata Sandi</span>
                        </FormLabel>
                        <button
                          type="button"
                          onClick={() => toast.info("Silakan hubungi administrator kelurahan Anda untuk pemulihan akun.")}
                          className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Lupa sandi?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 6 karakter"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-9 text-xs pr-9"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      <span>Sedang Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Sekarang</span>
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-border/70 py-4 bg-muted/30 rounded-b-xl text-center">
            <p className="text-xs text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
              >
                Daftar di sini
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Security Badge Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Keamanan Data Terenkripsi • Kota Tegal 33.76</span>
        </div>
      </div>
    </div>
  );
}
