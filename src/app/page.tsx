"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  ArrowRight,
  Layers,
  HeartHandshake,
  School,
  ShoppingBag,
  Newspaper,
  BarChart3,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Menu,
  X,
  Store,
  Tag,
  PhoneCall,
  Activity,
  Compass,
  Baby,
  GraduationCap,
  Share2,
  LogIn,
  UserPlus,
} from "lucide-react";

// Data Master Berita & Kabar Komunitas Tegal
const KABAR_DATA = [
  {
    id: "kabar-1",
    kategori: "Kesehatan",
    judul: "Jadwal Posyandu Balita Melati I & Pemberian Vitamin A",
    lokasi: "Kel. Mintaragen, Kec. Tegal Timur",
    tanggal: "26 Sep 2026",
    ringkasan:
      "Pelayanan penimbangan berat badan, imunisasi rutin, dan konsultasi gizi balita gratis di Balai RW 01.",
    penulis: "Kader Posyandu Melati I",
  },
  {
    id: "kabar-2",
    kategori: "Pendidikan",
    judul: "Sosialisasi Penerimaan Peserta Didik Baru PAUD & TK",
    lokasi: "Kel. Kraton, Kec. Tegal Barat",
    tanggal: "28 Sep 2026",
    ringkasan:
      "Pendaftaran terpadu bagi warga domisili Tegal Barat untuk tahun ajaran baru dengan fasilitas beasiswa kelurahan.",
    penulis: "Pokja Pendidikan Kelurahan",
  },
  {
    id: "kabar-3",
    kategori: "Lingkungan",
    judul: "Kerja Bakti Serentak & Penataan Saluran Lingkungan",
    lokasi: "Kel. Randugunting, Kec. Tegal Selatan",
    tanggal: "29 Sep 2026",
    ringkasan:
      "Gotong royong warga RT 02 / RW 04 dalam rangka menjaga kebersihan lingkungan dan pencegahan jentik nyamuk.",
    penulis: "Pengurus RT 02",
  },
  {
    id: "kabar-4",
    kategori: "UMKM & Komunitas",
    judul: "Bazar Produk Unggulan Kuliner & Kerajinan Warga",
    lokasi: "Kel. Margadana, Kec. Margadana",
    tanggal: "01 Okt 2026",
    ringkasan:
      "Pameran UMKM lokal menampilkan aneka olahan khas Tegal dan kerajinan tangan binaan kelurahan.",
    penulis: "Forum UMKM Margadana",
  },
];

// Data Produk UMKM Jarimas Market Kota Tegal
const MARKET_PRODUCTS = [
  {
    id: "p1",
    nama: "Tahu Aci & Tahu Pletok Khas Tegal (Paket Siap Goreng)",
    kategori: "Kuliner",
    harga: 25000,
    penjual: "Ibu Titin (Dapur Bahari)",
    kelurahan: "Mintaragen",
    kecamatan: "Tegal Timur",
    rating: "4.9",
    terjual: 142,
    deskripsi: "Tahu kuning khas Tegal dengan adonan aci bumbu gurih rempah pilihan. Isi 20 pcs lengkap dengan sambal kecap.",
  },
  {
    id: "p2",
    nama: "Teh Poci Wangi Melati Tradisional + Gula Batu Asli",
    kategori: "Kuliner",
    harga: 35000,
    penjual: "Bpk. Slamet Poci",
    kelurahan: "Kraton",
    kecamatan: "Tegal Barat",
    rating: "4.8",
    terjual: 98,
    deskripsi: "Racikan teh tubruk khas Tegal aroma melati kental lengkap dengan gula batu kristal kemasan higienis.",
  },
  {
    id: "p3",
    nama: "Kain Batik Tulis Motif Beras Wutah & Manuk Dadali",
    kategori: "Kerajinan",
    harga: 150000,
    penjual: "Galeri Batik Ibu Sri",
    kelurahan: "Tegalsari",
    kecamatan: "Tegal Barat",
    rating: "5.0",
    terjual: 35,
    deskripsi: "Kain batik katun primisima halus dengan corak klasik pesisiran Kota Tegal buatan pengrajin lokal.",
  },
  {
    id: "p4",
    nama: "Telur Asin Asap Bakar Premium Rasa Gurih Masir",
    kategori: "Kuliner",
    harga: 45000,
    penjual: "Kios Berkah Wahyu",
    kelurahan: "Margadana",
    kecamatan: "Margadana",
    rating: "4.9",
    terjual: 210,
    deskripsi: "Telur bebek kualitas pilihan dengan proses pengasapan aroma wangi sedap dan kuning telur masir berminyak (Isi 6).",
  },
  {
    id: "p5",
    nama: "Kerupuk Antor Bumbu Gurih Renyah Khas Tegal",
    kategori: "Kuliner",
    harga: 18000,
    penjual: "Camilan Mak Nyuss",
    kelurahan: "Slerok",
    kecamatan: "Tegal Timur",
    rating: "4.7",
    terjual: 165,
    deskripsi: "Kerupuk pasir tradisional dengan taburan bumbu bawang gurih berlimpah khas oleh-oleh Tegal (250 gram).",
  },
  {
    id: "p6",
    nama: "Jasa Servis Elektronik & Perbaikan Pompa Air Panggilan",
    kategori: "Jasa",
    harga: 50000,
    penjual: "Mas Joko Servis",
    kelurahan: "Randugunting",
    kecamatan: "Tegal Selatan",
    rating: "4.9",
    terjual: 88,
    deskripsi: "Layanan perbaikan peralatan rumah tangga dan pompa air bergaransi siap datang langsung ke rumah warga.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<string>("Semua");
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof MARKET_PRODUCTS[0] | null>(null);

  // Form State Gabung Komunitas
  const [joinForm, setJoinForm] = useState({
    nama: "",
    kecamatan: "Tegal Timur",
    kelurahan: "Mintaragen",
    peran: "Warga",
  });

  const filteredProducts =
    selectedMarketCategory === "Semua"
      ? MARKET_PRODUCTS
      : MARKET_PRODUCTS.filter((p) => p.kategori === selectedMarketCategory);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Permintaan Bergabung Terkirim!", {
      description: `Selamat datang ${joinForm.nama}! Pengurus RW & Kelurahan ${joinForm.kelurahan} akan memverifikasi pendaftaran Anda.`,
    });
    setJoinModalOpen(false);
    setJoinForm({
      nama: "",
      kecamatan: "Tegal Timur",
      kelurahan: "Mintaragen",
      peran: "Warga",
    });
  };

  const handleOrderProduct = (prod: typeof MARKET_PRODUCTS[0]) => {
    toast.success(`Menghubungkan ke ${prod.penjual}`, {
      description: `Produk: "${prod.nama}" (${prod.kelurahan}, ${prod.kecamatan}). Permintaan pesanan berhasil dicatat.`,
    });
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-all shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Wilayah Badge */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-sm ring-1 ring-emerald-500/30 group-hover:scale-105 transition-transform">
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
                  Kota Tegal
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                Portal Komunitas Kota Tegal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <a
              href="#komunitas"
              className="rounded-lg px-3.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Komunitas
            </a>
            <a
              href="#kabar"
              className="rounded-lg px-3.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Kabar Warga
            </a>
            <a
              href="#market"
              className="rounded-lg px-3.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Jarimas Market
            </a>
            <a
              href="#statistik"
              className="rounded-lg px-3.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Statistik
            </a>
          </nav>

          {/* Desktop CTA Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold h-8.5 px-3.5 gap-1.5 border-border/80 hover:bg-muted/80"
              >
                <LogIn className="size-3.5" />
                <span>Masuk</span>
              </Button>
            </Link>

            <Link href="/register">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8.5 px-4 shadow-xs gap-1.5"
              >
                <UserPlus className="size-3.5" />
                <span>Daftar</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Action Buttons & Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 font-medium border-border/80">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 px-2.5 shadow-xs">
                Daftar
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="size-8 p-0 border-border/80"
              aria-label="Menu navigasi mobile"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/80 bg-background/95 backdrop-blur-lg px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            <a
              href="#komunitas"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Pilar Komunitas
            </a>
            <a
              href="#kabar"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Kabar & Agenda Warga
            </a>
            <a
              href="#market"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Jarimas Market UMKM
            </a>
            <a
              href="#statistik"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Statistik Kota Tegal
            </a>
            <div className="pt-2 flex flex-col gap-2 border-t border-border/60">
              <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-9 justify-center gap-1.5"
                >
                  <LogIn className="size-3.5" />
                  <span>Masuk</span>
                </Button>
              </Link>
              <Link href="/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 gap-1.5">
                  <UserPlus className="size-3.5" />
                  <span>Daftar Akun</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/70 bg-gradient-to-b from-emerald-500/5 via-background to-background">
        {/* Glow ambient background circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-full max-w-4xl h-72 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* Announcement Ribbon */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Sistem Terpadu Warga Kota Tegal</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Jaringan Informasi Masyarakat &{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                Portal Komunitas
              </span>{" "}
              Kota Tegal
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              Menghubungkan lembaga <strong>RT/RW</strong>, <strong>Posyandu</strong>, <strong>Sekolah</strong>, dan <strong>Dunia Usaha Lokal</strong> dalam satu platform terpadu berbasis komunitas yang transparan, aman, dan realtime.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/linimasa">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 h-11 shadow-md hover:shadow-lg transition-all gap-2"
                >
                  <Compass className="size-4" />
                  <span>Jelajahi Linimasa Warga</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setJoinModalOpen(true)}
                className="text-sm font-semibold h-11 px-5 gap-2 border-border/80 hover:bg-muted"
              >
                <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gabung Komunitas</span>
              </Button>
            </div>

            {/* Micro Badge Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 rounded-md bg-muted/60 px-2.5 py-1">
                <CheckCircle2 className="size-3 text-emerald-500" />
                Kode Wilayah 33.76
              </span>
              <span className="flex items-center gap-1 rounded-md bg-muted/60 px-2.5 py-1">
                <Building2 className="size-3 text-emerald-500" />
                4 Kecamatan & 27 Kelurahan
              </span>
              <span className="flex items-center gap-1 rounded-md bg-muted/60 px-2.5 py-1">
                <ShieldCheck className="size-3 text-emerald-500" />
                Non-Sensitive ID Privacy
              </span>
            </div>
          </div>

          {/* Interactive Hero Banner / Feature Integration Preview */}
          <div className="mt-12 md:mt-16 rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Posyandu */}
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-4 transition-all hover:border-emerald-500/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Baby className="size-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-foreground">Kanal Posyandu & Balita</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Pemantauan tumbuh kembang, jadwal vaksinasi, dan pencegahan stunting terkoordinasi per RW.
                  </p>
                </div>
              </div>

              {/* Box 2: Sekolah */}
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-4 transition-all hover:border-teal-500/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-foreground">Kanal Sekolah & Edukasi</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Integrasi data PAUD, TK, SD, hingga SMP resmi yang terikat langsung dengan domisili kelurahan.
                  </p>
                </div>
              </div>

              {/* Box 3: UMKM & Komunitas */}
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-4 transition-all hover:border-blue-500/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Store className="size-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-foreground">Jarimas Market & Warga</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Pemberdayaan ekonomi mikro melalui etalase digital produk lokal olahan warga Kota Tegal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PILAR 1: KOMUNITAS JARIMAS */}
      {/* ========================================================================= */}
      <section id="komunitas" className="py-16 md:py-20 border-b border-border/70 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
              Pilar 1: Integrasi Komunitas
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sinergi Data Warga, Posyandu, & Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Menghilangkan sekat administrasi kependudukan. Informasi terdistribusi secara akurat tanpa perantara rumit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kartu 1: Lingkungan RT/RW */}
            <Card className="border border-border/80 bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Building2 className="size-5" />
                </div>
                <CardTitle className="text-base font-semibold">1. Rukun Tetangga (RT/RW)</CardTitle>
                <CardDescription className="text-xs">
                  Pencatatan domisili warga aman tanpa nomor identitas sensitif (NIK/NISN).
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Pendataan cepat anak balita & usia sekolah</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Verifikasi warga tetap vs pendatang non-permanen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Hierarki wilayah otomatis hingga 5 tingkat</span>
                </div>
              </CardContent>
            </Card>

            {/* Kartu 2: Posyandu Balita */}
            <Card className="border border-border/80 bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  <HeartHandshake className="size-5" />
                </div>
                <CardTitle className="text-base font-semibold">2. Kanal Posyandu Terpadu</CardTitle>
                <CardDescription className="text-xs">
                  Relasi otomatis data warga dengan posyandu kelurahan terdekat.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Penugasan posyandu otomatis via database trigger</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Jadwal imunisasi, vitamin, & penimbangan berkala</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Monitoring status gizi & stunting tingkat kelurahan</span>
                </div>
              </CardContent>
            </Card>

            {/* Kartu 3: Sekolah & Lembaga */}
            <Card className="border border-border/80 bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-2">
                  <School className="size-5" />
                </div>
                <CardTitle className="text-base font-semibold">3. Kanal Sekolah Terkoneksi</CardTitle>
                <CardDescription className="text-xs">
                  Akses data jenjang pendidikan PAUD, TK, SD, hingga SMP.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Pemetaan sekolah terdekat berbasis kelurahan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Sinkronisasi data siswa anak usia wajib belajar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Saluran komunikasi pihak sekolah & orang tua wali</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-2">
            <Link href="/linimasa">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 h-9 gap-1.5 shadow-xs">
                <span>Buka Dashboard Komunitas & Linimasa</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PILAR 2: KABAR JARIMAS (AGENDA & PENGUMUMAN) */}
      {/* ========================================================================= */}
      <section id="kabar" className="py-16 md:py-20 border-b border-border/70 bg-muted/20 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Badge variant="outline" className="border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs mb-1.5">
                Pilar 2: Informasi & Agenda
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Kabar Jarimas Terkini
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pengumuman resmi kegiatan posyandu, kelurahan, dan agenda kemasyarakatan Kota Tegal.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Fitur publikasi kabar kelurahan akan tersedia untuk kader dan RT.")}
              className="text-xs h-8.5 self-start md:self-auto gap-1.5"
            >
              <Newspaper className="size-3.5" />
              <span>Publikasikan Kabar</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KABAR_DATA.map((kabar) => (
              <Card
                key={kabar.id}
                onClick={() =>
                  toast.info(kabar.judul, {
                    description: `${kabar.lokasi} • ${kabar.ringkasan}`,
                  })
                }
                className="group cursor-pointer border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {kabar.kategori}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{kabar.tanggal}</span>
                  </div>
                  <CardTitle className="text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {kabar.judul}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-3 pt-0">
                  <p className="line-clamp-3 text-[11px] leading-relaxed">
                    {kabar.ringkasan}
                  </p>
                  <div className="border-t border-border/60 pt-2 flex items-center justify-between text-[10px]">
                    <span className="truncate text-foreground font-medium">{kabar.lokasi}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">
                      Detail &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PILAR 3: JARIMAS MARKET (UMKM LOKAL KOTA TEGAL) */}
      {/* ========================================================================= */}
      <section id="market" className="py-16 md:py-20 border-b border-border/70 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs mb-1.5">
                Pilar 3: Ekonomi Warga
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Jarimas Market — UMKM Warga Kota Tegal
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Etalase produk kuliner khas, kerajinan lokal, dan layanan jasa dari warga di 27 kelurahan Kota Tegal.
              </p>
            </div>

            {/* Kategori Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-muted/60 p-1 rounded-lg border border-border/80">
              {["Semua", "Kuliner", "Kerajinan", "Jasa"].map((kat) => (
                <button
                  key={kat}
                  onClick={() => setSelectedMarketCategory(kat)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${selectedMarketCategory === kat
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Produk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => (
              <Card key={p.id} className="border border-border/80 bg-card hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Tag className="size-2.5" />
                      {p.kategori}
                    </Badge>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ★ {p.rating} ({p.terjual} terjual)
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold line-clamp-2">
                    {p.nama}
                  </CardTitle>
                  <CardDescription className="text-[11px] line-clamp-2 mt-1">
                    {p.deskripsi}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Penjual: {p.penjual}</p>
                    <p className="text-xs font-bold text-foreground">
                      Rp {p.harga.toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Kel. {p.kelurahan}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setSelectedProduct(p)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 gap-1 shadow-xs"
                  >
                    <ShoppingBag className="size-3" />
                    <span>Pesan</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATISTIK RINGKAS KOTA TEGAL */}
      {/* ========================================================================= */}
      <section id="statistik" className="py-16 md:py-20 border-b border-border/70 bg-muted/20 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
              Transparansi Wilayah
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cakupan Layanan Terpadu Kota Tegal
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pemetaan lengkap seluruh satuan wilayah administratif resmi Kota Tegal (Kode 33.76).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 text-center space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">4</p>
              <p className="text-xs font-bold text-foreground">Kecamatan</p>
              <p className="text-[10px] text-muted-foreground">Tegal Barat, Timur, Selatan, Margadana</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 text-center space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">27</p>
              <p className="text-xs font-bold text-foreground">Kelurahan Resmi</p>
              <p className="text-[10px] text-muted-foreground">100% Terpetakan Secara Bertingkat</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 text-center space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">100+</p>
              <p className="text-xs font-bold text-foreground">Kanal Posyandu & Sekolah</p>
              <p className="text-[10px] text-muted-foreground">Layanan Balita, PAUD, SD, SMP</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 text-center space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">24/7</p>
              <p className="text-xs font-bold text-foreground">Sinkronisasi Realtime</p>
              <p className="text-[10px] text-muted-foreground">Supabase PostgreSQL Engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-14 md:py-20 relative overflow-hidden bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-800 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Mari Bersama Wujudkan Kota Tegal yang Guyub & Terpadu
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Akses data kependudukan, kanal komunitas, jadwal posyandu, dan informasi sekolah secara langsung dalam satu dasbor terpadu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/linimasa">
              <Button
                size="lg"
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm h-11 px-6 shadow-md gap-2"
              >
                <span>Buka Dashboard Linimasa</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-border/80 bg-card py-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                J
              </div>
              <span className="font-bold text-foreground text-sm">jarimas.id</span>
              <span>—</span>
              <span>Portal Komunitas Kota Tegal</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="#komunitas" className="hover:text-foreground">Komunitas</a>
              <a href="#kabar" className="hover:text-foreground">Kabar Warga</a>
              <a href="#market" className="hover:text-foreground">Jarimas Market</a>
              <Link href="/linimasa" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Linimasa Warga &rarr;
              </Link>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <p>© 2026 jarimas.id — Inisiatif Komunitas & Pemerintah Kota Tegal (Kode 33.76).</p>
            <p>Privasi Terjaga • Open Data Kependudukan • Supabase Realtime</p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. MODAL: GABUNG KOMUNITAS */}
      {/* ========================================================================= */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Gabung Komunitas jarimas.id</DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan diri Anda atau keluarga ke kanal komunitas kelurahan domisili Kota Tegal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nama Lengkap *</label>
              <Input
                placeholder="Contoh: Budi Santoso"
                value={joinForm.nama}
                onChange={(e) => setJoinForm({ ...joinForm, nama: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Kecamatan</label>
                <Select
                  value={joinForm.kecamatan}
                  onValueChange={(val) => setJoinForm({ ...joinForm, kecamatan: val || "Tegal Timur" })}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tegal Timur">Tegal Timur</SelectItem>
                    <SelectItem value="Tegal Barat">Tegal Barat</SelectItem>
                    <SelectItem value="Tegal Selatan">Tegal Selatan</SelectItem>
                    <SelectItem value="Margadana">Margadana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Kelurahan Domisili</label>
                <Input
                  placeholder="Contoh: Mintaragen"
                  value={joinForm.kelurahan}
                  onChange={(e) => setJoinForm({ ...joinForm, kelurahan: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Peran / Status</label>
              <Select
                value={joinForm.peran}
                onValueChange={(val) => setJoinForm({ ...joinForm, peran: val || "Warga" })}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warga">Warga Domisili</SelectItem>
                  <SelectItem value="Pengurus RT/RW">Pengurus RT / RW</SelectItem>
                  <SelectItem value="Kader Posyandu">Kader Posyandu</SelectItem>
                  <SelectItem value="Guru / Sekolah">Guru / Pihak Sekolah</SelectItem>
                  <SelectItem value="Pelaku UMKM">Pelaku Usaha / UMKM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setJoinModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                Kirim Pendaftaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 10. MODAL: PESAN PRODUK MARKET */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Pesan Produk UMKM Warga</DialogTitle>
              <DialogDescription className="text-xs">
                Hubungkan langsung pesanan Anda ke pelaku usaha lokal Kota Tegal.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
              <p className="font-bold text-foreground text-sm">{selectedProduct.nama}</p>
              <p className="text-muted-foreground">{selectedProduct.deskripsi}</p>
              <div className="flex items-center justify-between border-t border-border/60 pt-2 font-medium">
                <span>Harga:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  Rp {selectedProduct.harga.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Penjual / Lokasi:</span>
                <span className="font-medium text-foreground">
                  {selectedProduct.penjual} ({selectedProduct.kelurahan})
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedProduct(null)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => handleOrderProduct(selectedProduct)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
              >
                <PhoneCall className="size-3.5" />
                <span>Konfirmasi Pesanan</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
