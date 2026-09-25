"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { joinKanalAction } from "@/actions/kanal-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Compass,
  Building,
  Home,
  School,
  RotateCcw,
  CheckCircle2,
  Filter,
  Loader2,
  Database,
  HeartPulse,
  GraduationCap,
  Landmark,
  Check,
  Users,
} from "lucide-react";

// ==============================================================================
// 1. DATA MASTER RESMI KOTA TEGAL (4 KECAMATAN & 27 KELURAHAN)
// ==============================================================================
const FALLBACK_KECAMATAN = [
  { id: "33.76.01", slug: "tegal-barat", nama: "Tegal Barat" },
  { id: "33.76.02", slug: "tegal-timur", nama: "Tegal Timur" },
  { id: "33.76.03", slug: "tegal-selatan", nama: "Tegal Selatan" },
  { id: "33.76.04", slug: "margadana", nama: "Margadana" },
];

const FALLBACK_KELURAHAN: Record<
  string,
  {
    id: string;
    nama: string;
    units: { id: string; nama: string; tipe: "Posyandu" | "Sekolah" }[];
  }[]
> = {
  "tegal-timur": [
    {
      id: "mintaragen",
      nama: "Mintaragen",
      units: [
        { id: "pos-melati-1", nama: "Posyandu Melati I (Mintaragen)", tipe: "Posyandu" },
        { id: "pos-melati-2", nama: "Posyandu Melati II (Mintaragen)", tipe: "Posyandu" },
        { id: "pos-melati-3", nama: "Posyandu Melati III (Mintaragen)", tipe: "Posyandu" },
        { id: "sd-mintaragen-1", nama: "SD Negeri Mintaragen 1", tipe: "Sekolah" },
        { id: "sd-mintaragen-3", nama: "SD Negeri Mintaragen 3", tipe: "Sekolah" },
        { id: "smp-1-tegal", nama: "SMP Negeri 1 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "panggung",
      nama: "Panggung",
      units: [
        { id: "pos-kenanga-1", nama: "Posyandu Kenanga I (Panggung)", tipe: "Posyandu" },
        { id: "pos-kenanga-2", nama: "Posyandu Kenanga II (Panggung)", tipe: "Posyandu" },
        { id: "sd-panggung-3", nama: "SD Negeri Panggung 3", tipe: "Sekolah" },
        { id: "sd-panggung-5", nama: "SD Negeri Panggung 5", tipe: "Sekolah" },
        { id: "smp-6-tegal", nama: "SMP Negeri 6 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "mangkukusuman",
      nama: "Mangkukusuman",
      units: [
        { id: "pos-bougenville", nama: "Posyandu Bougenville (Mangkukusuman)", tipe: "Posyandu" },
        { id: "pos-teratai", nama: "Posyandu Teratai (Mangkukusuman)", tipe: "Posyandu" },
        { id: "sd-mangkukusuman-1", nama: "SD Negeri Mangkukusuman 1", tipe: "Sekolah" },
        { id: "smp-3-tegal", nama: "SMP Negeri 3 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "kejambon",
      nama: "Kejambon",
      units: [
        { id: "pos-dahlia-1", nama: "Posyandu Dahlia I (Kejambon)", tipe: "Posyandu" },
        { id: "pos-dahlia-2", nama: "Posyandu Dahlia II (Kejambon)", tipe: "Posyandu" },
        { id: "sd-kejambon-1", nama: "SD Negeri Kejambon 1", tipe: "Sekolah" },
        { id: "sd-kejambon-2", nama: "SD Negeri Kejambon 2", tipe: "Sekolah" },
        { id: "smp-8-tegal", nama: "SMP Negeri 8 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "slerok",
      nama: "Slerok",
      units: [
        { id: "pos-mawar-1", nama: "Posyandu Mawar I (Slerok)", tipe: "Posyandu" },
        { id: "pos-mawar-2", nama: "Posyandu Mawar II (Slerok)", tipe: "Posyandu" },
        { id: "sd-slerok-2", nama: "SD Negeri Slerok 2", tipe: "Sekolah" },
        { id: "sd-slerok-4", nama: "SD Negeri Slerok 4", tipe: "Sekolah" },
        { id: "smp-10-tegal", nama: "SMP Negeri 10 Kota Tegal", tipe: "Sekolah" },
      ],
    },
  ],
  "tegal-barat": [
    {
      id: "tegalsari",
      nama: "Tegalsari",
      units: [
        { id: "pos-bahari-1", nama: "Posyandu Bahari I (Tegalsari)", tipe: "Posyandu" },
        { id: "pos-bahari-2", nama: "Posyandu Bahari II (Tegalsari)", tipe: "Posyandu" },
        { id: "sd-tegalsari-1", nama: "SD Negeri Tegalsari 1", tipe: "Sekolah" },
        { id: "smp-7-tegal", nama: "SMP Negeri 7 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "kraton",
      nama: "Kraton",
      units: [
        { id: "pos-cempaka-kraton", nama: "Posyandu Cempaka (Kraton)", tipe: "Posyandu" },
        { id: "pos-flamboyan-kraton", nama: "Posyandu Flamboyan (Kraton)", tipe: "Posyandu" },
        { id: "sd-kraton-1", nama: "SD Negeri Kraton 1", tipe: "Sekolah" },
        { id: "sd-kraton-3", nama: "SD Negeri Kraton 3", tipe: "Sekolah" },
        { id: "smp-2-tegal", nama: "SMP Negeri 2 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "kemandungan",
      nama: "Kemandungan",
      units: [
        { id: "pos-asri-1", nama: "Posyandu Asri I (Kemandungan)", tipe: "Posyandu" },
        { id: "pos-asri-2", nama: "Posyandu Asri II (Kemandungan)", tipe: "Posyandu" },
        { id: "sd-kemandungan-1", nama: "SD Negeri Kemandungan 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-lor",
      nama: "Debong Lor",
      units: [
        { id: "pos-tunas-debonglor", nama: "Posyandu Tunas Harapan (Debong Lor)", tipe: "Posyandu" },
        { id: "sd-debong-lor-1", nama: "SD Negeri Debong Lor 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "muarareja",
      nama: "Muarareja",
      units: [
        { id: "pos-muara-sejahtera", nama: "Posyandu Muara Sejahtera (Muarareja)", tipe: "Posyandu" },
        { id: "sd-muarareja-1", nama: "SD Negeri Muarareja 1", tipe: "Sekolah" },
        { id: "smp-13-tegal", nama: "SMP Negeri 13 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "pekauman",
      nama: "Pekauman",
      units: [
        { id: "pos-anggrek-pekauman", nama: "Posyandu Anggrek Putih (Pekauman)", tipe: "Posyandu" },
        { id: "sd-pekauman-1", nama: "SD Negeri Pekauman 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "pesurungan-kidul",
      nama: "Pesurungan Kidul",
      units: [
        { id: "pos-kamboja-pesurungan", nama: "Posyandu Kamboja (Pesurungan Kidul)", tipe: "Posyandu" },
        { id: "sd-pesurungan-kidul-1", nama: "SD Negeri Pesurungan Kidul 1", tipe: "Sekolah" },
        { id: "smk-1-tegal", nama: "SMK Negeri 1 Kota Tegal", tipe: "Sekolah" },
      ],
    },
  ],
  "tegal-selatan": [
    {
      id: "randugunting",
      nama: "Randugunting",
      units: [
        { id: "pos-nusa-1", nama: "Posyandu Nusa Indah I (Randugunting)", tipe: "Posyandu" },
        { id: "pos-nusa-2", nama: "Posyandu Nusa Indah II (Randugunting)", tipe: "Posyandu" },
        { id: "sd-randugunting-1", nama: "SD Negeri Randugunting 1", tipe: "Sekolah" },
        { id: "sd-randugunting-6", nama: "SD Negeri Randugunting 6", tipe: "Sekolah" },
        { id: "smp-5-tegal", nama: "SMP Negeri 5 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-kulon",
      nama: "Debong Kulon",
      units: [
        { id: "pos-sejahtera-debongkulon", nama: "Posyandu Sejahtera (Debong Kulon)", tipe: "Posyandu" },
        { id: "sd-debong-kulon-1", nama: "SD Negeri Debong Kulon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-tengah",
      nama: "Debong Tengah",
      units: [
        { id: "pos-kasih-ibu", nama: "Posyandu Kasih Ibu (Debong Tengah)", tipe: "Posyandu" },
        { id: "sd-debong-tengah-1", nama: "SD Negeri Debong Tengah 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "debong-kidul",
      nama: "Debong Kidul",
      units: [
        { id: "pos-mekar-wangi", nama: "Posyandu Mekar Wangi (Debong Kidul)", tipe: "Posyandu" },
        { id: "sd-debong-kidul-1", nama: "SD Negeri Debong Kidul 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "tunon",
      nama: "Tunon",
      units: [
        { id: "pos-harapan-bunda", nama: "Posyandu Harapan Bunda (Tunon)", tipe: "Posyandu" },
        { id: "sd-tunon-1", nama: "SD Negeri Tunon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kalinyamat-wetan",
      nama: "Kalinyamat Wetan",
      units: [
        { id: "pos-lestari-kalinyamat", nama: "Posyandu Lestari (Kalinyamat Wetan)", tipe: "Posyandu" },
        { id: "sd-kalinyamat-wetan-1", nama: "SD Negeri Kalinyamat Wetan 1", tipe: "Sekolah" },
        { id: "smp-14-tegal", nama: "SMP Negeri 14 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "keturen",
      nama: "Keturen",
      units: [
        { id: "pos-srikandi-keturen", nama: "Posyandu Srikandi (Keturen)", tipe: "Posyandu" },
        { id: "sd-keturen-1", nama: "SD Negeri Keturen 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "bandung",
      nama: "Bandung",
      units: [
        { id: "pos-anggrek-bandung", nama: "Posyandu Anggrek Mulia (Bandung)", tipe: "Posyandu" },
        { id: "sd-bandung-1", nama: "SD Negeri Bandung 1", tipe: "Sekolah" },
      ],
    },
  ],
  margadana: [
    {
      id: "margadana-kel",
      nama: "Margadana",
      units: [
        { id: "pos-teratai-margadana", nama: "Posyandu Teratai Indah (Margadana)", tipe: "Posyandu" },
        { id: "pos-ceria-margadana", nama: "Posyandu Ceria (Margadana)", tipe: "Posyandu" },
        { id: "sd-margadana-1", nama: "SD Negeri Margadana 1", tipe: "Sekolah" },
        { id: "smp-12-tegal", nama: "SMP Negeri 12 Kota Tegal", tipe: "Sekolah" },
      ],
    },
    {
      id: "cabawan",
      nama: "Cabawan",
      units: [
        { id: "pos-tunas-cabawan", nama: "Posyandu Tunas Mandiri (Cabawan)", tipe: "Posyandu" },
        { id: "sd-cabawan-1", nama: "SD Negeri Cabawan 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kaligangsa",
      nama: "Kaligangsa",
      units: [
        { id: "pos-muara-kaligangsa", nama: "Posyandu Muara Kasih (Kaligangsa)", tipe: "Posyandu" },
        { id: "sd-kaligangsa-1", nama: "SD Negeri Kaligangsa 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "kalinyamat-kulon",
      nama: "Kalinyamat Kulon",
      units: [
        { id: "pos-kartini-kalinyamat", nama: "Posyandu Kartini (Kalinyamat Kulon)", tipe: "Posyandu" },
        { id: "sd-kalinyamat-kulon-1", nama: "SD Negeri Kalinyamat Kulon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "krandon",
      nama: "Krandon",
      units: [
        { id: "pos-wijaya-krandon", nama: "Posyandu Wijaya Kusuma (Krandon)", tipe: "Posyandu" },
        { id: "sd-krandon-1", nama: "SD Negeri Krandon 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "pesurungan-lor",
      nama: "Pesurungan Lor",
      units: [
        { id: "pos-melati-pesurunganlor", nama: "Posyandu Melati Sehat (Pesurungan Lor)", tipe: "Posyandu" },
        { id: "sd-pesurungan-lor-1", nama: "SD Negeri Pesurungan Lor 1", tipe: "Sekolah" },
      ],
    },
    {
      id: "sumurpanggang",
      nama: "Sumurpanggang",
      units: [
        { id: "pos-sumur-sejahtera", nama: "Posyandu Sumur Sejahtera (Sumurpanggang)", tipe: "Posyandu" },
        { id: "pos-melati-asri", nama: "Posyandu Melati Asri (Sumurpanggang)", tipe: "Posyandu" },
        { id: "sd-sumurpanggang-1", nama: "SD Negeri Sumurpanggang 1", tipe: "Sekolah" },
        { id: "sd-sumurpanggang-3", nama: "SD Negeri Sumurpanggang 3", tipe: "Sekolah" },
        { id: "sma-4-tegal", nama: "SMA Negeri 4 Kota Tegal", tipe: "Sekolah" },
      ],
    },
  ],
};

// ==============================================================================
// 2. DATA MASTER OPD (ORGANISASI PERANGKAT DAERAH) KOTA TEGAL
// ==============================================================================
export const MASTER_OPD_TEGAL = [
  {
    id: "opd-dinkes",
    kode: "DINKES",
    nama: "Dinas Kesehatan Kota Tegal",
    deskripsi: "Imunisasi, Penanganan Stunting, Sanitasi & Layanan Puskesmas",
    sektor: "Kesehatan & Gizi",
  },
  {
    id: "opd-disdikbud",
    kode: "DISDIKBUD",
    nama: "Dinas Pendidikan dan Kebudayaan Kota Tegal",
    deskripsi: "PPDB, Bantuan Pendidikan, Beasiswa, PAUD, SD & SMP",
    sektor: "Pendidikan",
  },
  {
    id: "opd-dinsos",
    kode: "DINSOS",
    nama: "Dinas Sosial Kota Tegal",
    deskripsi: "Bantuan Sosial (PKH, BPNT, DTKS), Lansia & Disabilitas",
    sektor: "Sosial & Bantuan",
  },
  {
    id: "opd-disdukcapil",
    kode: "DISDUKCAPIL",
    nama: "Dinas Kependudukan dan Pencatatan Sipil",
    deskripsi: "Akta Kelahiran, KIA, KTP Digital, Kartu Keluarga & Adminduk",
    sektor: "Kependudukan",
  },
  {
    id: "opd-dp3ap2kb",
    kode: "DP3AP2KB",
    nama: "DP3AP2KB Kota Tegal",
    deskripsi: "Perlindungan Anak, Pemberdayaan Perempuan & Pembinaan Posyandu",
    sektor: "Perlindungan Anak & KB",
  },
  {
    id: "opd-dinkopumkm",
    kode: "DINKOPUMKMPERINDAG",
    nama: "Dinas Koperasi, UKM dan Perdagangan",
    deskripsi: "Pemberdayaan UMKM, Pasar Tradisional & Stabilitas Pangan",
    sektor: "Ekonomi & Usaha Warga",
  },
  {
    id: "opd-dlh",
    kode: "DLH",
    nama: "Dinas Lingkungan Hidup Kota Tegal",
    deskripsi: "Pengelolaan Sampah, Bank Sampah Lingkungan & Kebersihan Kota",
    sektor: "Lingkungan Hidup",
  },
  {
    id: "opd-bpbd",
    kode: "BPBD",
    nama: "Badan Penanggulangan Bencana Daerah (BPBD)",
    deskripsi: "Mitigasi Banjir Rob, Siaga Bencana & Tanggap Darurat",
    sektor: "Kebencanaan & Siaga",
  },
  {
    id: "opd-satpolpp",
    kode: "SATPOL PP",
    nama: "Satuan Polisi Pamong Praja Kota Tegal",
    deskripsi: "Ketertiban Umum, Penegakan Perda & Perlindungan Warga",
    sektor: "Ketertiban & Linmas",
  },
  {
    id: "opd-diskominfo",
    kode: "DISKOMINFO",
    nama: "Dinas Komunikasi dan Informatika",
    deskripsi: "Kanal Pengaduan Publik, Transformasi Digital & Smart City",
    sektor: "Layanan Digital & Aduan",
  },
  {
    id: "opd-disnakerin",
    kode: "DISNAKERIN",
    nama: "Dinas Tenaga Kerja dan Perindustrian",
    deskripsi: "Bursa Kerja, Pelatihan Vokasi Warga & Sertifikasi Keahlian",
    sektor: "Ketenagakerjaan",
  },
];

// ==============================================================================
// 3. MASTER SATUAN PENDIDIKAN (PAUD/TK/SD/SMP/SMA/SMK) KOTA TEGAL
// ==============================================================================
export const MASTER_ALL_SEKOLAH_TEGAL = [
  // PAUD & TK
  { id: "tk-pertiwi-mintaragen", nama: "TK Pertiwi Mintaragen", tingkat: "TK", kelurahan: "Mintaragen", kecamatan: "Tegal Timur" },
  { id: "tk-kemala-panggung", nama: "TK Kemala Bhayangkari Tegal", tingkat: "TK", kelurahan: "Panggung", kecamatan: "Tegal Timur" },
  { id: "tk-aba-mangkukusuman", nama: "TK Aisyiyah Bustanul Athfal 1", tingkat: "TK", kelurahan: "Mangkukusuman", kecamatan: "Tegal Timur" },
  { id: "ra-al-hidayah-kejambon", nama: "RA Al-Hidayah Kejambon", tingkat: "RA", kelurahan: "Kejambon", kecamatan: "Tegal Timur" },
  { id: "paud-melati-slerok", nama: "PAUD Melati Slerok", tingkat: "PAUD", kelurahan: "Slerok", kecamatan: "Tegal Timur" },
  { id: "tk-bahari-tegalsari", nama: "TK Bahari Mandiri", tingkat: "TK", kelurahan: "Tegalsari", kecamatan: "Tegal Barat" },
  { id: "tk-aba-kraton", nama: "TK ABA Kraton", tingkat: "TK", kelurahan: "Kraton", kecamatan: "Tegal Barat" },
  { id: "paud-ceria-kemandungan", nama: "PAUD Ceria Kemandungan", tingkat: "PAUD", kelurahan: "Kemandungan", kecamatan: "Tegal Barat" },
  { id: "tk-muslimat-pekauman", nama: "TK Muslimat Pekauman", tingkat: "TK", kelurahan: "Pekauman", kecamatan: "Tegal Barat" },
  { id: "paud-kasih-randugunting", nama: "PAUD Kasih Bunda Randugunting", tingkat: "PAUD", kelurahan: "Randugunting", kecamatan: "Tegal Selatan" },
  { id: "tk-aisyiyah-debongtengah", nama: "TK Aisyiyah Debong Tengah", tingkat: "TK", kelurahan: "Debong Tengah", kecamatan: "Tegal Selatan" },
  { id: "tk-pertiwi-tunon", nama: "TK Pertiwi Tunon", tingkat: "TK", kelurahan: "Tunon", kecamatan: "Tegal Selatan" },
  { id: "paud-tunas-bandung", nama: "PAUD Tunas Harapan Bandung", tingkat: "PAUD", kelurahan: "Bandung", kecamatan: "Tegal Selatan" },
  { id: "tk-pertiwi-margadana", nama: "TK Pertiwi Margadana", tingkat: "TK", kelurahan: "Margadana", kecamatan: "Margadana" },
  { id: "tk-diponegoro-kaligangsa", nama: "TK Diponegoro Kaligangsa", tingkat: "TK", kelurahan: "Kaligangsa", kecamatan: "Margadana" },
  { id: "tk-kemala-sumurpanggang", nama: "TK Kemala Sumurpanggang", tingkat: "TK", kelurahan: "Sumurpanggang", kecamatan: "Margadana" },

  // SD (Sekolah Dasar)
  { id: "sd-mintaragen-1", nama: "SD Negeri Mintaragen 1", tingkat: "SD", kelurahan: "Mintaragen", kecamatan: "Tegal Timur" },
  { id: "sd-mintaragen-3", nama: "SD Negeri Mintaragen 3", tingkat: "SD", kelurahan: "Mintaragen", kecamatan: "Tegal Timur" },
  { id: "sd-panggung-3", nama: "SD Negeri Panggung 3", tingkat: "SD", kelurahan: "Panggung", kecamatan: "Tegal Timur" },
  { id: "sd-panggung-5", nama: "SD Negeri Panggung 5", tingkat: "SD", kelurahan: "Panggung", kecamatan: "Tegal Timur" },
  { id: "sd-mangkukusuman-1", nama: "SD Negeri Mangkukusuman 1", tingkat: "SD", kelurahan: "Mangkukusuman", kecamatan: "Tegal Timur" },
  { id: "sd-kejambon-1", nama: "SD Negeri Kejambon 1", tingkat: "SD", kelurahan: "Kejambon", kecamatan: "Tegal Timur" },
  { id: "sd-kejambon-2", nama: "SD Negeri Kejambon 2", tingkat: "SD", kelurahan: "Kejambon", kecamatan: "Tegal Timur" },
  { id: "sd-slerok-2", nama: "SD Negeri Slerok 2", tingkat: "SD", kelurahan: "Slerok", kecamatan: "Tegal Timur" },
  { id: "sd-slerok-4", nama: "SD Negeri Slerok 4", tingkat: "SD", kelurahan: "Slerok", kecamatan: "Tegal Timur" },
  { id: "sd-tegalsari-1", nama: "SD Negeri Tegalsari 1", tingkat: "SD", kelurahan: "Tegalsari", kecamatan: "Tegal Barat" },
  { id: "sd-kraton-1", nama: "SD Negeri Kraton 1", tingkat: "SD", kelurahan: "Kraton", kecamatan: "Tegal Barat" },
  { id: "sd-kraton-3", nama: "SD Negeri Kraton 3", tingkat: "SD", kelurahan: "Kraton", kecamatan: "Tegal Barat" },
  { id: "sd-kemandungan-1", nama: "SD Negeri Kemandungan 1", tingkat: "SD", kelurahan: "Kemandungan", kecamatan: "Tegal Barat" },
  { id: "sd-debong-lor-1", nama: "SD Negeri Debong Lor 1", tingkat: "SD", kelurahan: "Debong Lor", kecamatan: "Tegal Barat" },
  { id: "sd-muarareja-1", nama: "SD Negeri Muarareja 1", tingkat: "SD", kelurahan: "Muarareja", kecamatan: "Tegal Barat" },
  { id: "sd-pekauman-1", nama: "SD Negeri Pekauman 1", tingkat: "SD", kelurahan: "Pekauman", kecamatan: "Tegal Barat" },
  { id: "sd-pesurungan-kidul-1", nama: "SD Negeri Pesurungan Kidul 1", tingkat: "SD", kelurahan: "Pesurungan Kidul", kecamatan: "Tegal Barat" },
  { id: "sd-randugunting-1", nama: "SD Negeri Randugunting 1", tingkat: "SD", kelurahan: "Randugunting", kecamatan: "Tegal Selatan" },
  { id: "sd-randugunting-6", nama: "SD Negeri Randugunting 6", tingkat: "SD", kelurahan: "Randugunting", kecamatan: "Tegal Selatan" },
  { id: "sd-debong-kulon-1", nama: "SD Negeri Debong Kulon 1", tingkat: "SD", kelurahan: "Debong Kulon", kecamatan: "Tegal Selatan" },
  { id: "sd-debong-tengah-1", nama: "SD Negeri Debong Tengah 1", tingkat: "SD", kelurahan: "Debong Tengah", kecamatan: "Tegal Selatan" },
  { id: "sd-debong-kidul-1", nama: "SD Negeri Debong Kidul 1", tingkat: "SD", kelurahan: "Debong Kidul", kecamatan: "Tegal Selatan" },
  { id: "sd-tunon-1", nama: "SD Negeri Tunon 1", tingkat: "SD", kelurahan: "Tunon", kecamatan: "Tegal Selatan" },
  { id: "sd-kalinyamat-wetan-1", nama: "SD Negeri Kalinyamat Wetan 1", tingkat: "SD", kelurahan: "Kalinyamat Wetan", kecamatan: "Tegal Selatan" },
  { id: "sd-keturen-1", nama: "SD Negeri Keturen 1", tingkat: "SD", kelurahan: "Keturen", kecamatan: "Tegal Selatan" },
  { id: "sd-bandung-1", nama: "SD Negeri Bandung 1", tingkat: "SD", kelurahan: "Bandung", kecamatan: "Tegal Selatan" },
  { id: "sd-margadana-1", nama: "SD Negeri Margadana 1", tingkat: "SD", kelurahan: "Margadana", kecamatan: "Margadana" },
  { id: "sd-cabawan-1", nama: "SD Negeri Cabawan 1", tingkat: "SD", kelurahan: "Cabawan", kecamatan: "Margadana" },
  { id: "sd-kaligangsa-1", nama: "SD Negeri Kaligangsa 1", tingkat: "SD", kelurahan: "Kaligangsa", kecamatan: "Margadana" },
  { id: "sd-kalinyamat-kulon-1", nama: "SD Negeri Kalinyamat Kulon 1", tingkat: "SD", kelurahan: "Kalinyamat Kulon", kecamatan: "Margadana" },
  { id: "sd-krandon-1", nama: "SD Negeri Krandon 1", tingkat: "SD", kelurahan: "Krandon", kecamatan: "Margadana" },
  { id: "sd-pesurungan-lor-1", nama: "SD Negeri Pesurungan Lor 1", tingkat: "SD", kelurahan: "Pesurungan Lor", kecamatan: "Margadana" },
  { id: "sd-sumurpanggang-1", nama: "SD Negeri Sumurpanggang 1", tingkat: "SD", kelurahan: "Sumurpanggang", kecamatan: "Margadana" },
  { id: "sd-sumurpanggang-3", nama: "SD Negeri Sumurpanggang 3", tingkat: "SD", kelurahan: "Sumurpanggang", kecamatan: "Margadana" },

  // SMP (Sekolah Menengah Pertama)
  { id: "smp-1-tegal", nama: "SMP Negeri 1 Kota Tegal", tingkat: "SMP", kelurahan: "Mintaragen", kecamatan: "Tegal Timur" },
  { id: "smp-2-tegal", nama: "SMP Negeri 2 Kota Tegal", tingkat: "SMP", kelurahan: "Kraton", kecamatan: "Tegal Barat" },
  { id: "smp-3-tegal", nama: "SMP Negeri 3 Kota Tegal", tingkat: "SMP", kelurahan: "Mangkukusuman", kecamatan: "Tegal Timur" },
  { id: "smp-5-tegal", nama: "SMP Negeri 5 Kota Tegal", tingkat: "SMP", kelurahan: "Randugunting", kecamatan: "Tegal Selatan" },
  { id: "smp-6-tegal", nama: "SMP Negeri 6 Kota Tegal", tingkat: "SMP", kelurahan: "Panggung", kecamatan: "Tegal Timur" },
  { id: "smp-7-tegal", nama: "SMP Negeri 7 Kota Tegal", tingkat: "SMP", kelurahan: "Tegalsari", kecamatan: "Tegal Barat" },
  { id: "smp-8-tegal", nama: "SMP Negeri 8 Kota Tegal", tingkat: "SMP", kelurahan: "Kejambon", kecamatan: "Tegal Timur" },
  { id: "smp-10-tegal", nama: "SMP Negeri 10 Kota Tegal", tingkat: "SMP", kelurahan: "Slerok", kecamatan: "Tegal Timur" },
  { id: "smp-12-tegal", nama: "SMP Negeri 12 Kota Tegal", tingkat: "SMP", kelurahan: "Margadana", kecamatan: "Margadana" },
  { id: "smp-13-tegal", nama: "SMP Negeri 13 Kota Tegal", tingkat: "SMP", kelurahan: "Muarareja", kecamatan: "Tegal Barat" },
  { id: "smp-14-tegal", nama: "SMP Negeri 14 Kota Tegal", tingkat: "SMP", kelurahan: "Kalinyamat Wetan", kecamatan: "Tegal Selatan" },

  // SMA & SMK
  { id: "sma-1-tegal", nama: "SMA Negeri 1 Kota Tegal", tingkat: "SMA", kelurahan: "Mintaragen", kecamatan: "Tegal Timur" },
  { id: "sma-4-tegal", nama: "SMA Negeri 4 Kota Tegal", tingkat: "SMA", kelurahan: "Sumurpanggang", kecamatan: "Margadana" },
  { id: "smk-1-tegal", nama: "SMK Negeri 1 Kota Tegal", tingkat: "SMK", kelurahan: "Pesurungan Kidul", kecamatan: "Tegal Barat" },
];

export function CardKanalDiscovery() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Nuqs URL Filter State
  const [filters, setFilters] = useQueryStates(
    {
      kecamatan: parseAsString.withDefault(""),
      kelurahan: parseAsString.withDefault(""),
      unit: parseAsString.withDefault(""),
    },
    {
      shallow: false,
    }
  );

  // 3 Modal Dialog States
  const [isPosyanduModalOpen, setIsPosyanduModalOpen] = useState(false);
  const [isSekolahModalOpen, setIsSekolahModalOpen] = useState(false);
  const [isOpdModalOpen, setIsOpdModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States for Modal 1: Posyandu
  const [posyanduForm, setPosyanduForm] = useState({
    kelurahanId: "",
    posyanduId: "",
    peran: "Ibu Balita / Orang Tua",
  });

  // Form States for Modal 2: Sekolah
  const [sekolahForm, setSekolahForm] = useState({
    jenjangFilter: "SEMUA",
    sekolahId: "",
    peran: "Orang Tua / Wali Siswa",
  });

  // Form States for Modal 3: OPD
  const [opdForm, setOpdForm] = useState({
    opdId: "",
    peran: "Warga Penerima Layanan",
  });

  // 1. Ambil Profil Pengguna Aktif (untuk mendeteksi Kelurahan Domisili otomatis)
  const { data: userProfile } = useQuery({
    queryKey: ["current-user-kanal-profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      try {
        const { data } = await supabase
          .from("users")
          .select("id, email, username, nama_lengkap, domisili_kelurahan_id, kk_kelurahan_id")
          .eq("id", user.id)
          .maybeSingle();

        return {
          authId: user.id,
          id: data?.id,
          email: data?.email,
          username: data?.username,
          nama_lengkap: data?.nama_lengkap,
          domisili_kelurahan_id: (data?.domisili_kelurahan_id as string | null) || null,
          kk_kelurahan_id: (data?.kk_kelurahan_id as string | null) || null,
        };
      } catch {
        return {
          authId: user.id,
          id: undefined,
          email: undefined,
          username: undefined,
          nama_lengkap: undefined,
          domisili_kelurahan_id: null,
          kk_kelurahan_id: null,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Ambil Keanggotaan Kanal Aktif Pengguna
  const { data: userMemberships = [] } = useQuery({
    queryKey: ["user_kanal_memberships_active"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_kanal_memberships")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    },
    staleTime: 1000 * 30,
  });

  // Inisialisasi Kelurahan Domisili pada Posyandu Form
  useEffect(() => {
    if (userProfile?.domisili_kelurahan_id && !posyanduForm.kelurahanId) {
      setPosyanduForm((prev) => ({
        ...prev,
        kelurahanId: userProfile.domisili_kelurahan_id || "mintaragen",
      }));
    } else if (!posyanduForm.kelurahanId) {
      setPosyanduForm((prev) => ({
        ...prev,
        kelurahanId: "mintaragen",
      }));
    }
  }, [userProfile, posyanduForm.kelurahanId]);

  // 2. Fetch Master Data Kecamatan dari Supabase
  const { data: dbKecamatan = [], isLoading: isLoadingKec } = useQuery({
    queryKey: ["master_kecamatan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wilayah")
        .select("id, kode, nama")
        .eq("tingkat", "KECAMATAN")
        .order("kode", { ascending: true });

      if (error || !data || data.length === 0) {
        return null;
      }
      return data.map((k) => ({
        id: k.id,
        kode: k.kode,
        slug: k.nama.toLowerCase().replace(/\s+/g, "-"),
        nama: k.nama,
      }));
    },
    staleTime: 60 * 1000,
  });

  const kecamatanList = useMemo(() => {
    if (dbKecamatan && dbKecamatan.length > 0) {
      return dbKecamatan;
    }
    return FALLBACK_KECAMATAN;
  }, [dbKecamatan]);

  const activeKecamatan = useMemo(() => {
    if (!filters.kecamatan) return null;
    return (
      kecamatanList.find(
        (k) => k.id === filters.kecamatan || k.slug === filters.kecamatan
      ) || null
    );
  }, [filters.kecamatan, kecamatanList]);

  // 3. Fetch Master Data Kelurahan
  const { data: dbKelurahan = [], isLoading: isLoadingKel } = useQuery({
    queryKey: ["master_kelurahan", activeKecamatan?.id || activeKecamatan?.slug],
    queryFn: async () => {
      if (!activeKecamatan) return [];
      const { data, error } = await supabase
        .from("wilayah")
        .select("id, kode, nama, parent_id")
        .eq("parent_id", activeKecamatan.id)
        .order("nama", { ascending: true });

      if (error || !data || data.length === 0) {
        return null;
      }
      return data.map((kl) => ({
        id: kl.id,
        kode: kl.kode,
        slug: kl.nama.toLowerCase().replace(/\s+/g, "-"),
        nama: kl.nama,
      }));
    },
    enabled: !!activeKecamatan,
    staleTime: 60 * 1000,
  });

  const kelurahanList = useMemo(() => {
    if (dbKelurahan && dbKelurahan.length > 0) {
      return dbKelurahan;
    }
    const kecKey = activeKecamatan?.slug || filters.kecamatan;
    if (kecKey && FALLBACK_KELURAHAN[kecKey]) {
      return FALLBACK_KELURAHAN[kecKey];
    }
    return [];
  }, [dbKelurahan, activeKecamatan, filters.kecamatan]);

  const activeKelurahan = useMemo(() => {
    if (!filters.kelurahan) return null;
    return (
      kelurahanList.find(
        (kl) => kl.id === filters.kelurahan || (kl as any).slug === filters.kelurahan
      ) || null
    );
  }, [filters.kelurahan, kelurahanList]);

  // 4. Fetch Master Units untuk Discovery Filter
  const { data: dbUnits = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ["master_units", activeKelurahan?.id || (activeKelurahan as any)?.slug],
    queryFn: async () => {
      if (!activeKelurahan?.id) return [];

      const [posRes, sekRes] = await Promise.all([
        supabase
          .from("kanal_posyandu")
          .select("id, nama, alamat")
          .eq("kelurahan_id", activeKelurahan.id)
          .order("nama", { ascending: true }),
        supabase
          .from("kanal_sekolah")
          .select("id, nama, tingkat, alamat")
          .eq("kelurahan_id", activeKelurahan.id)
          .order("nama", { ascending: true }),
      ]);

      const posList = (posRes.data || []).map((p) => ({
        id: p.id,
        nama: p.nama,
        tipe: "Posyandu" as const,
        alamat: p.alamat,
      }));

      const sekList = (sekRes.data || []).map((s) => ({
        id: s.id,
        nama: `${s.nama} (${s.tingkat})`,
        tipe: "Sekolah" as const,
        alamat: s.alamat,
      }));

      const combined = [...posList, ...sekList];
      return combined.length > 0 ? combined : null;
    },
    enabled: !!activeKelurahan?.id,
    staleTime: 60 * 1000,
  });

  const availableUnits = useMemo(() => {
    if (dbUnits && dbUnits.length > 0) {
      return dbUnits;
    }
    if (activeKelurahan && "units" in activeKelurahan && Array.isArray(activeKelurahan.units)) {
      return activeKelurahan.units;
    }
    return [];
  }, [dbUnits, activeKelurahan]);

  // Daftar Semua 27 Kelurahan Kota Tegal untuk Form Posyandu Modal
  const all27Kelurahan = useMemo(() => {
    const list: { id: string; nama: string; kecamatan: string }[] = [];
    Object.entries(FALLBACK_KELURAHAN).forEach(([kecKey, kelList]) => {
      const kecName =
        FALLBACK_KECAMATAN.find((k) => k.slug === kecKey)?.nama || kecKey;
      kelList.forEach((kel) => {
        list.push({
          id: kel.id,
          nama: kel.nama,
          kecamatan: kecName,
        });
      });
    });
    return list;
  }, []);

  // Daftar Posyandu pada Kelurahan yang dipilih di Modal Posyandu
  const posyanduOptionsInSelectedKel = useMemo(() => {
    const targetKelId = posyanduForm.kelurahanId;
    if (!targetKelId) return [];

    for (const kelList of Object.values(FALLBACK_KELURAHAN)) {
      const found = kelList.find(
        (k) =>
          k.id === targetKelId ||
          k.nama.toLowerCase() === targetKelId.toLowerCase() ||
          k.id === `kel-${targetKelId.toLowerCase()}`
      );
      if (found) {
        return found.units.filter((u) => u.tipe === "Posyandu");
      }
    }
    // Fallback umum
    return [
      { id: "pos-utama-1", nama: "Posyandu Melati I", tipe: "Posyandu" as const },
      { id: "pos-utama-2", nama: "Posyandu Melati II", tipe: "Posyandu" as const },
    ];
  }, [posyanduForm.kelurahanId]);

  // Daftar Sekolah Filtered by Jenjang
  const filteredSekolahOptions = useMemo(() => {
    if (sekolahForm.jenjangFilter === "SEMUA") {
      return MASTER_ALL_SEKOLAH_TEGAL;
    }
    return MASTER_ALL_SEKOLAH_TEGAL.filter(
      (s) => s.tingkat === sekolahForm.jenjangFilter
    );
  }, [sekolahForm.jenjangFilter]);

  // Handlers untuk Discovery Filter
  const handleKecamatanChange = (value: string | null) => {
    setFilters({
      kecamatan: value || "",
      kelurahan: "",
      unit: "",
    });
  };

  const handleKelurahanChange = (value: string | null) => {
    setFilters({
      kelurahan: value || "",
      unit: "",
    });
  };

  const handleUnitChange = (value: string | null) => {
    setFilters({
      unit: value || "",
    });
  };

  const handleReset = () => {
    setFilters({
      kecamatan: "",
      kelurahan: "",
      unit: "",
    });
    toast.info("Filter wilayah telah direset.");
  };

  const selectedUnitObj = availableUnits.find((u) => u.id === filters.unit);

  // ==============================================================================
  // 4. SUBMISSION HANDLERS UNTUK 3 MODAL GABUNG KANAL
  // ==============================================================================

  // Form 1: Gabung Kanal Posyandu
  const handleJoinPosyandu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posyanduForm.posyanduId) {
      toast.error("Pilih Posyandu terlebih dahulu.");
      return;
    }

    const selectedPosyandu = posyanduOptionsInSelectedKel.find(
      (p) => p.id === posyanduForm.posyanduId
    );
    const namaKanal = selectedPosyandu?.nama || "Posyandu Wilayah";

    setIsSubmitting(true);
    try {
      const res = await joinKanalAction({
        kanalId: posyanduForm.posyanduId,
        kanalNama: namaKanal,
        tipeKanal: "POSYANDU",
        peran: posyanduForm.peran,
        metadata: {
          kelurahan_id: posyanduForm.kelurahanId,
        },
      });

      if (res.success) {
        toast.success("Berhasil Bergabung ke Kanal Posyandu!", {
          description: `Anda telah terdaftar di ${namaKanal} sebagai ${posyanduForm.peran}.`,
        });
        setIsPosyanduModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["user_kanal_memberships_active"] });
      } else {
        toast.error("Gagal Bergabung", {
          description: res.error || "Terjadi kesalahan saat memproses pendaftaran.",
        });
      }
    } catch (err) {
      toast.error("Kesalahan Sistem", {
        description: err instanceof Error ? err.message : "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form 2: Gabung Kanal Sekolah
  const handleJoinSekolah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sekolahForm.sekolahId) {
      toast.error("Pilih Satuan Pendidikan terlebih dahulu.");
      return;
    }

    const selectedSekolah = MASTER_ALL_SEKOLAH_TEGAL.find(
      (s) => s.id === sekolahForm.sekolahId
    );
    const namaKanal = selectedSekolah?.nama || "Satuan Pendidikan";

    setIsSubmitting(true);
    try {
      const res = await joinKanalAction({
        kanalId: sekolahForm.sekolahId,
        kanalNama: namaKanal,
        tipeKanal: "SEKOLAH",
        peran: sekolahForm.peran,
        metadata: {
          tingkat: selectedSekolah?.tingkat,
          kelurahan: selectedSekolah?.kelurahan,
          kecamatan: selectedSekolah?.kecamatan,
        },
      });

      if (res.success) {
        toast.success("Berhasil Bergabung ke Kanal Sekolah!", {
          description: `Anda telah terdaftar di ${namaKanal} sebagai ${sekolahForm.peran}.`,
        });
        setIsSekolahModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["user_kanal_memberships_active"] });
      } else {
        toast.error("Gagal Bergabung", {
          description: res.error || "Terjadi kesalahan saat memproses pendaftaran.",
        });
      }
    } catch (err) {
      toast.error("Kesalahan Sistem", {
        description: err instanceof Error ? err.message : "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form 3: Gabung Kanal OPD
  const handleJoinOpd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdForm.opdId) {
      toast.error("Pilih OPD / Dinas terlebih dahulu.");
      return;
    }

    const selectedOpd = MASTER_OPD_TEGAL.find((o) => o.id === opdForm.opdId);
    const namaKanal = selectedOpd?.nama || "OPD Kota Tegal";

    setIsSubmitting(true);
    try {
      const res = await joinKanalAction({
        kanalId: opdForm.opdId,
        kanalNama: namaKanal,
        tipeKanal: "OPD",
        peran: opdForm.peran,
        metadata: {
          kode_opd: selectedOpd?.kode,
          sektor: selectedOpd?.sektor,
        },
      });

      if (res.success) {
        toast.success("Berhasil Bergabung ke Kanal OPD!", {
          description: `Anda telah terdaftar di ${namaKanal} sebagai ${opdForm.peran}.`,
        });
        setIsOpdModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["user_kanal_memberships_active"] });
      } else {
        toast.error("Gagal Bergabung", {
          description: res.error || "Terjadi kesalahan saat memproses pendaftaran.",
        });
      }
    } catch (err) {
      toast.error("Kesalahan Sistem", {
        description: err instanceof Error ? err.message : "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLiveDb = Boolean(dbKecamatan && dbKecamatan.length > 0);

  return (
    <Card className="border border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Compass className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Kanal Discovery & Integrasi Komunitas
              </CardTitle>
              <CardDescription className="text-xs">
                Bergabung ke kanal Posyandu, Sekolah, atau Organisasi Perangkat Daerah Kota Tegal
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={
                isLiveDb
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] gap-1"
                  : "text-muted-foreground text-[11px] gap-1"
              }
            >
              <Database className="size-3" />
              {isLiveDb ? "Supabase Live" : "Master Tegal"}
            </Badge>
            <Badge variant="secondary" className="text-[11px] gap-1">
              <Filter className="size-3" />
              nuqs URL
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ============================================================================== */}
        {/* 3 OPSI TOMBOL UTAMA GABUNG KANAL (Posyandu, Sekolah, OPD) */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* 1. Kanal Posyandu Button */}
          <button
            type="button"
            onClick={() => setIsPosyanduModalOpen(true)}
            className="group relative flex flex-col items-start justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-left transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:shadow-xs active:scale-[0.98]"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="size-4.5" />
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/15 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
              >
                Domisili Kelurahan
              </Badge>
            </div>
            <div className="mt-2.5 space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                1. Kanal Posyandu
              </h4>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Pilih posyandu terdekat di kelurahan domisili Anda
              </p>
            </div>
          </button>

          {/* 2. Kanal Sekolah Button */}
          <button
            type="button"
            onClick={() => setIsSekolahModalOpen(true)}
            className="group relative flex flex-col items-start justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 text-left transition-all hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:shadow-xs active:scale-[0.98]"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="size-4.5" />
              </div>
              <Badge
                variant="outline"
                className="border-indigo-500/40 bg-indigo-500/15 text-[10px] font-medium text-indigo-700 dark:text-indigo-300"
              >
                PAUD / TK / SD / SMP
              </Badge>
            </div>
            <div className="mt-2.5 space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                2. Kanal Sekolah
              </h4>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Pilih satuan pendidikan anak di Kota Tegal
              </p>
            </div>
          </button>

          {/* 3. Kanal OPD Button */}
          <button
            type="button"
            onClick={() => setIsOpdModalOpen(true)}
            className="group relative flex flex-col items-start justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-left transition-all hover:border-amber-500/60 hover:bg-amber-500/10 hover:shadow-xs active:scale-[0.98]"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Landmark className="size-4.5" />
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/15 text-[10px] font-medium text-amber-700 dark:text-amber-300"
              >
                Dinas & Layanan
              </Badge>
            </div>
            <div className="mt-2.5 space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                3. Kanal OPD / Dinas
              </h4>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Pilih dinas daerah terkait program & layanan publik
              </p>
            </div>
          </button>
        </div>

        {/* ============================================================================== */}
        {/* KEANGGOTAAN KANAL AKTIF USER (JIKA ADA) */}
        {/* ============================================================================== */}
        {userMemberships.length > 0 && (
          <div className="rounded-lg border border-border/70 bg-muted/30 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Users className="size-3.5 text-primary" />
                Kanal yang Telah Anda Ikuti ({userMemberships.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {userMemberships.map((m: any) => (
                <Badge
                  key={m.id || m.kanal_id}
                  variant="outline"
                  className="bg-background/80 text-[11px] gap-1 py-0.5 px-2 font-normal"
                >
                  <Check className="size-3 text-emerald-500" />
                  <strong className="font-medium text-foreground">{m.kanal_nama}</strong>
                  <span className="text-muted-foreground">({m.peran || m.tipe_kanal})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* DROPDOWN FILTER WILAYAH BERTINGKAT (DISCOVERY BROWSER) */}
        {/* ============================================================================== */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Filter className="size-3.5" />
              Penjelajah Wilayah & Kanal Terdaftar:
            </span>
            {(filters.kecamatan || filters.kelurahan || filters.unit) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                Reset Filter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* 1. Kecamatan */}
            <div className="space-y-1">
              <label className="flex items-center justify-between text-[11px] font-medium text-foreground">
                <span className="flex items-center gap-1">
                  <Building className="size-3 text-muted-foreground" />
                  Kecamatan
                </span>
                {isLoadingKec && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              </label>
              <Select
                value={filters.kecamatan || undefined}
                onValueChange={handleKecamatanChange}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  {kecamatanList.map((kec) => (
                    <SelectItem key={kec.id} value={kec.slug || kec.id}>
                      Kec. {kec.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Kelurahan */}
            <div className="space-y-1">
              <label className="flex items-center justify-between text-[11px] font-medium text-foreground">
                <span className="flex items-center gap-1">
                  <Home className="size-3 text-muted-foreground" />
                  Kelurahan
                </span>
                {isLoadingKel && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              </label>
              <Select
                value={filters.kelurahan || undefined}
                onValueChange={handleKelurahanChange}
                disabled={!filters.kecamatan || kelurahanList.length === 0}
              >
                <SelectTrigger className="w-full text-xs disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      filters.kecamatan
                        ? `Pilih Kelurahan (${kelurahanList.length})`
                        : "Pilih kecamatan dulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {kelurahanList.map((kel) => (
                    <SelectItem key={kel.id} value={(kel as any).slug || kel.id}>
                      Kel. {kel.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Posyandu / Sekolah */}
            <div className="space-y-1">
              <label className="flex items-center justify-between text-[11px] font-medium text-foreground">
                <span className="flex items-center gap-1">
                  <School className="size-3 text-muted-foreground" />
                  Posyandu / Sekolah
                </span>
                {isLoadingUnits && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              </label>
              <Select
                value={filters.unit || undefined}
                onValueChange={handleUnitChange}
                disabled={!filters.kelurahan || availableUnits.length === 0}
              >
                <SelectTrigger className="w-full text-xs disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      filters.kelurahan
                        ? `Pilih Kanal (${availableUnits.length})`
                        : "Pilih kelurahan dulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <span className="truncate">
                        [{u.tipe}] {u.nama}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Selected Hierarchy Breadcrumb Preview */}
        {filters.kecamatan && (
          <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">
              Target Wilayah:{" "}
              <strong className="text-foreground capitalize">
                Kec. {activeKecamatan?.nama || filters.kecamatan.replace("-", " ")}
              </strong>
              {filters.kelurahan && (
                <>
                  {" "}
                  &gt;{" "}
                  <strong className="text-foreground">
                    Kel. {activeKelurahan?.nama || filters.kelurahan}
                  </strong>
                </>
              )}
              {filters.unit && (
                <>
                  {" "}
                  &gt;{" "}
                  <strong className="text-foreground">
                    {selectedUnitObj?.nama || filters.unit}
                  </strong>
                </>
              )}
            </span>
          </div>
        )}
      </CardContent>

      {/* ============================================================================== */}
      {/* MODAL 1: FORM GABUNG KANAL POSYANDU */}
      {/* ============================================================================== */}
      <Dialog open={isPosyanduModalOpen} onOpenChange={setIsPosyanduModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <HeartPulse className="size-5" />
              <DialogTitle>Form Gabung Kanal Posyandu</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Pilih Posyandu berdasarkan kelurahan domisili Anda untuk menerima jadwal imunisasi dan monitoring balita.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinPosyandu} className="space-y-3.5 pt-1">
            {/* 1. Kelurahan Domisili */}
            <div className="space-y-1">
              <label className="text-xs font-medium">1. Kelurahan Domisili *</label>
              <Select
                value={posyanduForm.kelurahanId}
                onValueChange={(val) =>
                  setPosyanduForm({
                    ...posyanduForm,
                    kelurahanId: val || "",
                    posyanduId: "",
                  })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Kelurahan Domisili" />
                </SelectTrigger>
                <SelectContent>
                  {all27Kelurahan.map((kel) => (
                    <SelectItem key={kel.id} value={kel.id}>
                      Kel. {kel.nama} ({kel.kecamatan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Pilihan Posyandu */}
            <div className="space-y-1">
              <label className="text-xs font-medium">2. Pilih Posyandu *</label>
              <Select
                value={posyanduForm.posyanduId}
                onValueChange={(val) =>
                  setPosyanduForm({ ...posyanduForm, posyanduId: val || "" })
                }
                disabled={!posyanduForm.kelurahanId}
              >
                <SelectTrigger className="w-full text-xs disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      posyanduForm.kelurahanId
                        ? `Pilih Posyandu (${posyanduOptionsInSelectedKel.length})`
                        : "Pilih kelurahan terlebih dahulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {posyanduOptionsInSelectedKel.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Peran / Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium">3. Peran / Status Partisipasi</label>
              <Select
                value={posyanduForm.peran}
                onValueChange={(val) =>
                  setPosyanduForm({
                    ...posyanduForm,
                    peran: val || "Ibu Balita / Orang Tua",
                  })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ibu Balita / Orang Tua">Ibu Balita / Orang Tua</SelectItem>
                  <SelectItem value="Kader Posyandu">Kader Posyandu</SelectItem>
                  <SelectItem value="Bidan / Tenaga Medis">Bidan / Tenaga Medis Kelurahan</SelectItem>
                  <SelectItem value="Warga Pemerhati Gizi">Warga Pemerhati Kesehatan & Gizi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPosyanduModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !posyanduForm.posyanduId}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Gabung Kanal Posyandu"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================================== */}
      {/* MODAL 2: FORM GABUNG KANAL SEKOLAH */}
      {/* ============================================================================== */}
      <Dialog open={isSekolahModalOpen} onOpenChange={setIsSekolahModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="size-5" />
              <DialogTitle>Form Gabung Kanal Sekolah</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Pilih Satuan Pendidikan (PAUD / TK / SD / SMP) di Kota Tegal untuk mendapatkan info & koordinasi akademik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSekolah} className="space-y-3.5 pt-1">
            {/* 1. Filter Tingkat / Jenjang */}
            <div className="space-y-1">
              <label className="text-xs font-medium">1. Jenjang Pendidikan</label>
              <Select
                value={sekolahForm.jenjangFilter}
                onValueChange={(val) =>
                  setSekolahForm({
                    ...sekolahForm,
                    jenjangFilter: val || "SEMUA",
                    sekolahId: "",
                  })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMUA">Semua Jenjang (PAUD / TK / SD / SMP / SMA / SMK)</SelectItem>
                  <SelectItem value="PAUD">PAUD (Pendidikan Anak Usia Dini)</SelectItem>
                  <SelectItem value="TK">TK (Taman Kanak-Kanak)</SelectItem>
                  <SelectItem value="RA">RA (Raudhatul Athfal)</SelectItem>
                  <SelectItem value="SD">SD (Sekolah Dasar)</SelectItem>
                  <SelectItem value="SMP">SMP (Sekolah Menengah Pertama)</SelectItem>
                  <SelectItem value="SMA">SMA (Sekolah Menengah Atas)</SelectItem>
                  <SelectItem value="SMK">SMK (Sekolah Menengah Kejuruan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Pilihan Sekolah */}
            <div className="space-y-1">
              <label className="text-xs font-medium">2. Pilih Satuan Pendidikan *</label>
              <Select
                value={sekolahForm.sekolahId}
                onValueChange={(val) =>
                  setSekolahForm({ ...sekolahForm, sekolahId: val || "" })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Satuan Pendidikan Kota Tegal" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSekolahOptions.map((sek) => (
                    <SelectItem key={sek.id} value={sek.id}>
                      [{sek.tingkat}] {sek.nama} ({sek.kelurahan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Peran di Sekolah */}
            <div className="space-y-1">
              <label className="text-xs font-medium">3. Peran / Status di Sekolah</label>
              <Select
                value={sekolahForm.peran}
                onValueChange={(val) =>
                  setSekolahForm({
                    ...sekolahForm,
                    peran: val || "Orang Tua / Wali Siswa",
                  })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orang Tua / Wali Siswa">Orang Tua / Wali Siswa</SelectItem>
                  <SelectItem value="Guru / Tenaga Pendidik">Guru / Tenaga Pendidik</SelectItem>
                  <SelectItem value="Komite Sekolah / Mitra">Komite Sekolah / Mitra</SelectItem>
                  <SelectItem value="Siswa / Alumni">Siswa / Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSekolahModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !sekolahForm.sekolahId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Gabung Kanal Sekolah"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================================== */}
      {/* MODAL 3: FORM GABUNG KANAL OPD */}
      {/* ============================================================================== */}
      <Dialog open={isOpdModalOpen} onOpenChange={setIsOpdModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Landmark className="size-5" />
              <DialogTitle>Form Gabung Kanal OPD / Dinas</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Pilih Organisasi Perangkat Daerah / Dinas terkait untuk informasi program bantuan dan layanan publik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinOpd} className="space-y-3.5 pt-1">
            {/* 1. Pilihan OPD */}
            <div className="space-y-1">
              <label className="text-xs font-medium">1. Pilih OPD / Dinas Terkait *</label>
              <Select
                value={opdForm.opdId}
                onValueChange={(val) =>
                  setOpdForm({ ...opdForm, opdId: val || "" })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Dinas / Instansi Kota Tegal" />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_OPD_TEGAL.map((opd) => (
                    <SelectItem key={opd.id} value={opd.id}>
                      [{opd.kode}] {opd.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deskripsi Singkat OPD Terpilih */}
            {opdForm.opdId && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground block mb-0.5">
                  Fokus Sektor: {MASTER_OPD_TEGAL.find((o) => o.id === opdForm.opdId)?.sektor}
                </span>
                {MASTER_OPD_TEGAL.find((o) => o.id === opdForm.opdId)?.deskripsi}
              </div>
            )}

            {/* 2. Peran / Kepentingan */}
            <div className="space-y-1">
              <label className="text-xs font-medium">2. Peran / Kepentingan Warga</label>
              <Select
                value={opdForm.peran}
                onValueChange={(val) =>
                  setOpdForm({
                    ...opdForm,
                    peran: val || "Warga Penerima Layanan",
                  })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warga Penerima Layanan">Warga Penerima Layanan Publik</SelectItem>
                  <SelectItem value="Mitra Penggerak Komunitas">Mitra Penggerak Komunitas / Relawan</SelectItem>
                  <SelectItem value="Pelaku Usaha / UMKM">Pelaku Usaha / UMKM Binaan</SelectItem>
                  <SelectItem value="Pengawas & Aspirasi Publik">Pengawas & Penyampai Aspirasi Publik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpdModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !opdForm.opdId}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isSubmitting ? "Menyimpan..." : "Gabung Kanal OPD"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
