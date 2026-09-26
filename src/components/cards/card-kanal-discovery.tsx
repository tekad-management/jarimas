"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Compass,
  Home,
  RotateCcw,
  Loader2,
  HeartPulse,
  HeartHandshake,
  GraduationCap,
  School,
  Landmark,
  Building2,
  Check,
  CheckCircle2,
  UserCheck,
  Users,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Building,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react";

// ==============================================================================
// 1. DATA MASTER RESMI KOTA TEGAL (4 KECAMATAN & 27 KELURAHAN)
// ==============================================================================
export const FALLBACK_KECAMATAN = [
  { id: "tegal-barat", slug: "tegal-barat", nama: "Tegal Barat" },
  { id: "tegal-timur", slug: "tegal-timur", nama: "Tegal Timur" },
  { id: "tegal-selatan", slug: "tegal-selatan", nama: "Tegal Selatan" },
  { id: "margadana", slug: "margadana", nama: "Margadana" },
];

export const FALLBACK_KELURAHAN: Record<
  string,
  {
    id: string;
    nama: string;
  }[]
> = {
  "tegal-timur": [
    { id: "mintaragen", nama: "Mintaragen" },
    { id: "panggung", nama: "Panggung" },
    { id: "mangkukusuman", nama: "Mangkukusuman" },
    { id: "kejambon", nama: "Kejambon" },
    { id: "slerok", nama: "Slerok" },
  ],
  "tegal-barat": [
    { id: "tegalsari", nama: "Tegalsari" },
    { id: "kraton", nama: "Kraton" },
    { id: "kemandungan", nama: "Kemandungan" },
    { id: "debong-lor", nama: "Debong Lor" },
    { id: "muarareja", nama: "Muarareja" },
    { id: "pekauman", nama: "Pekauman" },
    { id: "pesurungan-kidul", nama: "Pesurungan Kidul" },
  ],
  "tegal-selatan": [
    { id: "randugunting", nama: "Randugunting" },
    { id: "debong-kulon", nama: "Debong Kulon" },
    { id: "debong-tengah", nama: "Debong Tengah" },
    { id: "debong-kidul", nama: "Debong Kidul" },
    { id: "tunon", nama: "Tunon" },
    { id: "kalinyamat-wetan", nama: "Kalinyamat Wetan" },
    { id: "keturen", nama: "Keturen" },
    { id: "bandung", nama: "Bandung" },
  ],
  margadana: [
    { id: "margadana-kel", nama: "Margadana" },
    { id: "cabawan", nama: "Cabawan" },
    { id: "kaligangsa", nama: "Kaligangsa" },
    { id: "kalinyamat-kulon", nama: "Kalinyamat Kulon" },
    { id: "krandon", nama: "Krandon" },
    { id: "pesurungan-lor", nama: "Pesurungan Lor" },
    { id: "sumurpanggang", nama: "Sumurpanggang" },
  ],
};

// Pemetaan Cerdas 27 Kelurahan ke Kecamatan di Kota Tegal
export const MASTER_KELURAHAN_KECAMATAN_MAP: Record<string, { kel: string; kec: string; kelId: string; kecId: string }> = {
  // Tegal Timur
  "mintaragen": { kel: "Mintaragen", kec: "Tegal Timur", kelId: "mintaragen", kecId: "tegal-timur" },
  "panggung": { kel: "Panggung", kec: "Tegal Timur", kelId: "panggung", kecId: "tegal-timur" },
  "mangkukusuman": { kel: "Mangkukusuman", kec: "Tegal Timur", kelId: "mangkukusuman", kecId: "tegal-timur" },
  "kejambon": { kel: "Kejambon", kec: "Tegal Timur", kelId: "kejambon", kecId: "tegal-timur" },
  "slerok": { kel: "Slerok", kec: "Tegal Timur", kelId: "slerok", kecId: "tegal-timur" },

  // Tegal Barat
  "tegalsari": { kel: "Tegalsari", kec: "Tegal Barat", kelId: "tegalsari", kecId: "tegal-barat" },
  "kraton": { kel: "Kraton", kec: "Tegal Barat", kelId: "kraton", kecId: "tegal-barat" },
  "kemandungan": { kel: "Kemandungan", kec: "Tegal Barat", kelId: "kemandungan", kecId: "tegal-barat" },
  "debong lor": { kel: "Debong Lor", kec: "Tegal Barat", kelId: "debong-lor", kecId: "tegal-barat" },
  "muarareja": { kel: "Muarareja", kec: "Tegal Barat", kelId: "muarareja", kecId: "tegal-barat" },
  "pekauman": { kel: "Pekauman", kec: "Tegal Barat", kelId: "pekauman", kecId: "tegal-barat" },
  "pesurungan kidul": { kel: "Pesurungan Kidul", kec: "Tegal Barat", kelId: "pesurungan-kidul", kecId: "tegal-barat" },

  // Tegal Selatan
  "randugunting": { kel: "Randugunting", kec: "Tegal Selatan", kelId: "randugunting", kecId: "tegal-selatan" },
  "debong kulon": { kel: "Debong Kulon", kec: "Tegal Selatan", kelId: "debong-kulon", kecId: "tegal-selatan" },
  "debong tengah": { kel: "Debong Tengah", kec: "Tegal Selatan", kelId: "debong-tengah", kecId: "tegal-selatan" },
  "debong kidul": { kel: "Debong Kidul", kec: "Tegal Selatan", kelId: "debong-kidul", kecId: "tegal-selatan" },
  "tunon": { kel: "Tunon", kec: "Tegal Selatan", kelId: "tunon", kecId: "tegal-selatan" },
  "kalinyamat wetan": { kel: "Kalinyamat Wetan", kec: "Tegal Selatan", kelId: "kalinyamat-wetan", kecId: "tegal-selatan" },
  "keturen": { kel: "Keturen", kec: "Tegal Selatan", kelId: "keturen", kecId: "tegal-selatan" },
  "bandung": { kel: "Bandung", kec: "Tegal Selatan", kelId: "bandung", kecId: "tegal-selatan" },

  // Margadana
  "margadana": { kel: "Margadana", kec: "Margadana", kelId: "margadana-kel", kecId: "margadana" },
  "cabawan": { kel: "Cabawan", kec: "Margadana", kelId: "cabawan", kecId: "margadana" },
  "kaligangsa": { kel: "Kaligangsa", kec: "Margadana", kelId: "kaligangsa", kecId: "margadana" },
  "kalinyamat kulon": { kel: "Kalinyamat Kulon", kec: "Margadana", kelId: "kalinyamat-kulon", kecId: "margadana" },
  "krandon": { kel: "Krandon", kec: "Margadana", kelId: "krandon", kecId: "margadana" },
  "pesurungan lor": { kel: "Pesurungan Lor", kec: "Margadana", kelId: "pesurungan-lor", kecId: "margadana" },
  "sumurpanggang": { kel: "Sumurpanggang", kec: "Margadana", kelId: "sumurpanggang", kecId: "margadana" },
};

// ==============================================================================
// 2. DATA MASTER RESMI POSYANDU SE-KOTA TEGAL (27 KELURAHAN)
// ==============================================================================
export interface MasterPosyanduItem {
  id: string;
  nama: string;
  kelurahan: string;
  kelurahanId: string;
  kecamatan: string;
  kecamatanId: string;
  jadwal?: string;
}

export const ALL_MASTER_POSYANDU_TEGAL: MasterPosyanduItem[] = [
  // --- TEGAL TIMUR ---
  { id: "pos-kejambon-kamboja-1", nama: "Posyandu Kamboja 1", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-kamboja-2", nama: "Posyandu Kamboja 2", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-kemuning-1", nama: "Posyandu Kemuning 1", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-kemuning-2", nama: "Posyandu Kemuning 2", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-terataimerah", nama: "Posyandu Teratai Merah", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-tanjungsari", nama: "Posyandu Tanjungsari", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-mawarmelati", nama: "Posyandu Mawar Melati", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-seruni", nama: "Posyandu Seruni", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-kejambon-arimbi", nama: "Posyandu Arimbi", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  { id: "pos-slerok-srikandi", nama: "Posyandu Srikandi", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-arjuna-1", nama: "Posyandu Arjuna 1", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-arjuna-2", nama: "Posyandu Arjuna 2", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-werkudoro-1", nama: "Posyandu Werkudoro 1", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-werkudoro-2", nama: "Posyandu Werkudoro 2", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-nakula-1", nama: "Posyandu Nakula 1", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-nakula-2", nama: "Posyandu Nakula 2", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-abimanyu", nama: "Posyandu Abimanyu", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-subali", nama: "Posyandu Subali", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-sukosrono", nama: "Posyandu Sukosrono", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-bima-1", nama: "Posyandu Bima 1", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-bima-2", nama: "Posyandu Bima 2", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-sumbodro-1", nama: "Posyandu Sumbodro 1", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-slerok-sumbodro-2", nama: "Posyandu Sumbodro 2", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  { id: "pos-panggung-dahlia", nama: "Posyandu Dahlia", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-anyelir", nama: "Posyandu Anyelir", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-jayaabadi", nama: "Posyandu Jaya Abadi", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-harapan", nama: "Posyandu Harapan", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-mekarsari", nama: "Posyandu Mekarsari", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-anggrek-1", nama: "Posyandu Anggrek 1", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-anggrek-2", nama: "Posyandu Anggrek 2", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-bahteraserayu", nama: "Posyandu Bahtera Serayu", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-nusaindah-1", nama: "Posyandu Nusa Indah 1", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-nusaindah-2", nama: "Posyandu Nusa Indah 2", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-kuntummelati", nama: "Posyandu Kuntum Melati", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-dewishinta", nama: "Posyandu Dewi Shinta", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-seruni", nama: "Posyandu Seruni", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-bahtera-a", nama: "Posyandu Bahtera A", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-bahtera-b", nama: "Posyandu Bahtera B", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-melati", nama: "Posyandu Melati", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-panggung-tulip", nama: "Posyandu Tulip", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  { id: "pos-mintaragen-anyelir", nama: "Posyandu Anyelir", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-teratai", nama: "Posyandu Teratai", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-melati", nama: "Posyandu Melati", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-kenanga", nama: "Posyandu Kenanga", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-bougenville", nama: "Posyandu Bougenville", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-flamboyan", nama: "Posyandu Flamboyan", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-anggrek", nama: "Posyandu Anggrek", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-sedapmalam", nama: "Posyandu Sedap Malam", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-seruni", nama: "Posyandu Seruni", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-nusaindah-1", nama: "Posyandu Nusa Indah 1", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-nusaindah-2", nama: "Posyandu Nusa Indah 2", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mintaragen-mawar", nama: "Posyandu Mawar", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  { id: "pos-mangkukusuman-fatmawati", nama: "Posyandu Fatmawati", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mangkukusuman-kartini", nama: "Posyandu Kartini", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mangkukusuman-cempaka", nama: "Posyandu Cempaka", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mangkukusuman-kenanga", nama: "Posyandu Kenanga", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "pos-mangkukusuman-melati", nama: "Posyandu Melati", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // --- TEGAL BARAT ---
  { id: "pos-pekauman-tunas", nama: "Posyandu Tunas", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pekauman-duku", nama: "Posyandu Duku", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pekauman-garuda", nama: "Posyandu Garuda", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pekauman-belimbing", nama: "Posyandu Belimbing", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pekauman-jalak", nama: "Posyandu Jalak", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pekauman-nanas", nama: "Posyandu Nanas", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pekauman-delima", nama: "Posyandu Delima", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  { id: "pos-pesurungankidul-melati-1", nama: "Posyandu Melati 1", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pesurungankidul-melati-2", nama: "Posyandu Melati 2", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pesurungankidul-melati-3", nama: "Posyandu Melati 3", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pesurungankidul-melati-4", nama: "Posyandu Melati 4", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pesurungankidul-melati-5", nama: "Posyandu Melati 5", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-pesurungankidul-melati-6", nama: "Posyandu Melati 6", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  { id: "pos-kemandungan-anggrek-1", nama: "Posyandu Anggrek 1", kelurahan: "Kemandungan", kelurahanId: "kemandungan", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kemandungan-anggrek-2", nama: "Posyandu Anggrek 2", kelurahan: "Kemandungan", kelurahanId: "kemandungan", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kemandungan-melati-1", nama: "Posyandu Melati 1", kelurahan: "Kemandungan", kelurahanId: "kemandungan", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kemandungan-melati-2", nama: "Posyandu Melati 2", kelurahan: "Kemandungan", kelurahanId: "kemandungan", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  { id: "pos-kraton-kartini-1", nama: "Posyandu Kartini 1", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kraton-kartini-2", nama: "Posyandu Kartini 2", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kraton-kartini-3", nama: "Posyandu Kartini 3", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kraton-kartini-4", nama: "Posyandu Kartini 4", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kraton-kartini-5", nama: "Posyandu Kartini 5", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kraton-kartini-6", nama: "Posyandu Kartini 6", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-kraton-kartini-7", nama: "Posyandu Kartini 7", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  { id: "pos-tegalsari-kenanga-1", nama: "Posyandu Kenanga 1", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-2", nama: "Posyandu Kenanga 2", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-3", nama: "Posyandu Kenanga 3", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-4", nama: "Posyandu Kenanga 4", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-5", nama: "Posyandu Kenanga 5", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-6", nama: "Posyandu Kenanga 6", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-7", nama: "Posyandu Kenanga 7", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-8", nama: "Posyandu Kenanga 8", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-9", nama: "Posyandu Kenanga 9", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-10", nama: "Posyandu Kenanga 10", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-11", nama: "Posyandu Kenanga 11", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-12", nama: "Posyandu Kenanga 12", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-tegalsari-kenanga-13", nama: "Posyandu Kenanga 13", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  { id: "pos-debonglor-melati-1", nama: "Posyandu Melati 1", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-debonglor-melati-2", nama: "Posyandu Melati 2", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-debonglor-melati-3", nama: "Posyandu Melati 3", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-debonglor-melati-4", nama: "Posyandu Melati 4", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-debonglor-melati-5", nama: "Posyandu Melati 5", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  { id: "pos-muarareja-mawar-1", nama: "Posyandu Mawar 1", kelurahan: "Muarareja", kelurahanId: "muarareja", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-muarareja-mawar-2", nama: "Posyandu Mawar 2", kelurahan: "Muarareja", kelurahanId: "muarareja", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-muarareja-mawar-3", nama: "Posyandu Mawar 3", kelurahan: "Muarareja", kelurahanId: "muarareja", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-muarareja-mawar-4", nama: "Posyandu Mawar 4", kelurahan: "Muarareja", kelurahanId: "muarareja", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "pos-muarareja-mawar-5", nama: "Posyandu Mawar 5", kelurahan: "Muarareja", kelurahanId: "muarareja", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  // --- TEGAL SELATAN ---
  { id: "pos-bandung-melati-1", nama: "Posyandu Melati I", kelurahan: "Bandung", kelurahanId: "bandung", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-bandung-melati-2", nama: "Posyandu Melati II", kelurahan: "Bandung", kelurahanId: "bandung", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-bandung-melati-3", nama: "Posyandu Melati III", kelurahan: "Bandung", kelurahanId: "bandung", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-bandung-melati-4", nama: "Posyandu Melati IV", kelurahan: "Bandung", kelurahanId: "bandung", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-bandung-melati-5", nama: "Posyandu Melati V", kelurahan: "Bandung", kelurahanId: "bandung", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-tunon-mawar-1", nama: "Posyandu Mawar I", kelurahan: "Tunon", kelurahanId: "tunon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-tunon-mawar-2", nama: "Posyandu Mawar II", kelurahan: "Tunon", kelurahanId: "tunon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-tunon-mawar-3", nama: "Posyandu Mawar III", kelurahan: "Tunon", kelurahanId: "tunon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-tunon-mawar-4", nama: "Posyandu Mawar IV", kelurahan: "Tunon", kelurahanId: "tunon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-keturen-kemuning-1", nama: "Posyandu Kemuning I", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-keturen-kemuning-2", nama: "Posyandu Kemuning II", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-keturen-kemuning-3-utara", nama: "Posyandu Kemuning III Utara", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-keturen-kemuning-3-selatan", nama: "Posyandu Kemuning III Selatan", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-kalinyamatwetan-dahlia-1", nama: "Posyandu Dahlia I", kelurahan: "Kalinyamat Wetan", kelurahanId: "kalinyamat-wetan", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-kalinyamatwetan-dahlia-2", nama: "Posyandu Dahlia II", kelurahan: "Kalinyamat Wetan", kelurahanId: "kalinyamat-wetan", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-kalinyamatwetan-dahlia-3", nama: "Posyandu Dahlia III", kelurahan: "Kalinyamat Wetan", kelurahanId: "kalinyamat-wetan", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-kalinyamatwetan-dahlia-4", nama: "Posyandu Dahlia IV", kelurahan: "Kalinyamat Wetan", kelurahanId: "kalinyamat-wetan", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-randugunting-ketilang", nama: "Posyandu Ketilang", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-nuri", nama: "Posyandu Nuri", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-rajawali", nama: "Posyandu Rajawali", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-garuda", nama: "Posyandu Garuda", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-meliwis", nama: "Posyandu Meliwis", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-merpati", nama: "Posyandu Merpati", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-garuda-b", nama: "Posyandu Garuda B", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-puter", nama: "Posyandu Puter", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-ababil", nama: "Posyandu Ababil", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-kasuari", nama: "Posyandu Kasuari", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-cendrawasih", nama: "Posyandu Cendrawasih", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-randugunting-merak", nama: "Posyandu Merak", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-debongtengah-anggrek-1", nama: "Posyandu Anggrek 1", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-anggrek-2", nama: "Posyandu Anggrek 2", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-anyelir-a", nama: "Posyandu Anyelir A", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-anyelir-b", nama: "Posyandu Anyelir B", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-tulip", nama: "Posyandu Tulip", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-lengkeng", nama: "Posyandu Lengkeng", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-teratai", nama: "Posyandu Teratai", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongtengah-bougenville", nama: "Posyandu Bougenville", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-debongkulon-mawar", nama: "Posyandu Mawar", kelurahan: "Debong Kulon", kelurahanId: "debong-kulon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongkulon-kenanga", nama: "Posyandu Kenanga", kelurahan: "Debong Kulon", kelurahanId: "debong-kulon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongkulon-cempaka", nama: "Posyandu Cempaka", kelurahan: "Debong Kulon", kelurahanId: "debong-kulon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongkulon-nusaindah", nama: "Posyandu Nusa Indah", kelurahan: "Debong Kulon", kelurahanId: "debong-kulon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongkulon-melati", nama: "Posyandu Melati", kelurahan: "Debong Kulon", kelurahanId: "debong-kulon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  { id: "pos-debongkidul-mekarwangi", nama: "Posyandu Mekar Wangi", kelurahan: "Debong Kidul", kelurahanId: "debong-kidul", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "pos-debongkidul-melati", nama: "Posyandu Melati", kelurahan: "Debong Kidul", kelurahanId: "debong-kidul", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // --- MARGADANA ---
  { id: "pos-cabawan-anggrek-rw1", nama: "Posyandu Anggrek RW 1", kelurahan: "Cabawan", kelurahanId: "cabawan", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-cabawan-bougenville-rw2", nama: "Posyandu Bougenville RW 2", kelurahan: "Cabawan", kelurahanId: "cabawan", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-cabawan-cempaka-rw3", nama: "Posyandu Cempaka RW 3", kelurahan: "Cabawan", kelurahanId: "cabawan", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-cabawan-dahlia-rw4", nama: "Posyandu Dahlia RW 4", kelurahan: "Cabawan", kelurahanId: "cabawan", kecamatan: "Margadana", kecamatanId: "margadana" },

  { id: "pos-kaligangsa-dahlia", nama: "Posyandu Dahlia", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kaligangsa-rosella", nama: "Posyandu Rosella", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kaligangsa-cempaka", nama: "Posyandu Cempaka", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kaligangsa-bougenville", nama: "Posyandu Bougenville", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kaligangsa-anggrek", nama: "Posyandu Anggrek", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kaligangsa-melati", nama: "Posyandu Melati", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kaligangsa-flamboyan", nama: "Posyandu Flamboyan", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },

  { id: "pos-krandon-intan", nama: "Posyandu Intan", kelurahan: "Krandon", kelurahanId: "krandon", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-krandon-mutiara", nama: "Posyandu Mutiara", kelurahan: "Krandon", kelurahanId: "krandon", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-krandon-permata", nama: "Posyandu Permata", kelurahan: "Krandon", kelurahanId: "krandon", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-krandon-berlian", nama: "Posyandu Berlian", kelurahan: "Krandon", kelurahanId: "krandon", kecamatan: "Margadana", kecamatanId: "margadana" },

  { id: "pos-margadana-suflir", nama: "Posyandu Suflir", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-anyelir", nama: "Posyandu Anyelir", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-cempaka-1", nama: "Posyandu Cempaka 1", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-cempaka-2", nama: "Posyandu Cempaka 2", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-kesambisari", nama: "Posyandu Kesambisari", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-jagadipa", nama: "Posyandu Jagadipa", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-bougenville", nama: "Posyandu Bougenville", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-dahlia", nama: "Posyandu Dahlia", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-wijayakusuma", nama: "Posyandu Wijaya Kusuma", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-kenanga", nama: "Posyandu Kenanga", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-anggrekbulan", nama: "Posyandu Anggrek Bulan", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-sedapmalam", nama: "Posyandu Sedap Malam", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-lavender", nama: "Posyandu Lavender", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-margadana-edelveis", nama: "Posyandu Edelveis", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },

  { id: "pos-sumurpanggang-melati", nama: "Posyandu Melati", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-sumurpanggang-nurhikmah", nama: "Posyandu Nur Hikmah", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-sumurpanggang-ragasela", nama: "Posyandu Ragasela", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-sumurpanggang-cempaka", nama: "Posyandu Cempaka", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-sumurpanggang-mawar", nama: "Posyandu Mawar", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-sumurpanggang-manggis", nama: "Posyandu Manggis", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },

  { id: "pos-pesurunganlor-mawar", nama: "Posyandu Mawar", kelurahan: "Pesurungan Lor", kelurahanId: "pesurungan-lor", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-pesurunganlor-anggrek", nama: "Posyandu Anggrek", kelurahan: "Pesurungan Lor", kelurahanId: "pesurungan-lor", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-pesurunganlor-melati", nama: "Posyandu Melati", kelurahan: "Pesurungan Lor", kelurahanId: "pesurungan-lor", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-pesurunganlor-jayasamudera", nama: "Posyandu Jaya Samudera", kelurahan: "Pesurungan Lor", kelurahanId: "pesurungan-lor", kecamatan: "Margadana", kecamatanId: "margadana" },

  { id: "pos-kalinyamatkulon-melati-1", nama: "Posyandu Melati 1", kelurahan: "Kalinyamat Kulon", kelurahanId: "kalinyamat-kulon", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kalinyamatkulon-melati-2", nama: "Posyandu Melati 2", kelurahan: "Kalinyamat Kulon", kelurahanId: "kalinyamat-kulon", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kalinyamatkulon-melati-3", nama: "Posyandu Melati 3", kelurahan: "Kalinyamat Kulon", kelurahanId: "kalinyamat-kulon", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "pos-kalinyamatkulon-melati-4", nama: "Posyandu Melati 4", kelurahan: "Kalinyamat Kulon", kelurahanId: "kalinyamat-kulon", kecamatan: "Margadana", kecamatanId: "margadana" },
];

// ==============================================================================
// 3. DATA MASTER SATUAN PENDIDIKAN RESMI KOTA TEGAL (LENGKAP NAUNGAN & SUB-JENJANG)
// ==============================================================================
export type JenjangSekolahType = "PAUD" | "SD" | "SMP" | "SMA_SMK" | "SLB" | "KESETARAAN";
export type NaunganSekolahType = "DISDIK" | "KEMENAG";

export interface MasterSekolahItem {
  id: string;
  npsn: string;
  nama: string;
  jenjang: JenjangSekolahType;
  subJenjang: string; // "TK", "KB", "Pos PAUD", "PAUD TPQ", "TPA", "RA", "SD", "MI", "SMP", "MTs", "SMA", "SMK", "MA", "SLB SD", "SLB SMP", "SLB SMA", "SLB", "Paket A", "Paket B", "Paket C", "PKBM", "SKB"
  naungan: NaunganSekolahType;
  status: "NEGERI" | "SWASTA";
  kelurahan: string;
  kelurahanId: string;
  kecamatan: string;
  kecamatanId: string;
  alamat?: string;
}

export const MASTER_ALL_SEKOLAH_TEGAL: MasterSekolahItem[] = [
  // --- TEGAL BARAT ---
  // PAUD
  { id: "20351671", npsn: "20351671", nama: "TK NEGERI PEMBINA KOTA TEGAL", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20351661", npsn: "20351661", nama: "TK AL-IRSYAD AL-ISLAMIYAH", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "69743498", npsn: "69743498", nama: "RA AT TAQWA", jenjang: "PAUD", subJenjang: "RA", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20351660", npsn: "20351660", nama: "TK HANG TUAH 16", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20351655", npsn: "20351655", nama: "TK PIUS", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "69960275", npsn: "69960275", nama: "KB GLOBAL INBYRA SCHOOL", jenjang: "PAUD", subJenjang: "KB", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kemandungan", kelurahanId: "kemandungan", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "69960276", npsn: "69960276", nama: "TPA AISYIYAH KOTA TEGAL", jenjang: "PAUD", subJenjang: "TPA", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "69960277", npsn: "69960277", nama: "POS PAUD MEKAR BERSAMA", jenjang: "PAUD", subJenjang: "Pos PAUD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "69960278", npsn: "69960278", nama: "PAUD TPQ NURUL FALAH", jenjang: "PAUD", subJenjang: "PAUD TPQ", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  // SD
  { id: "20329798", npsn: "20329798", nama: "SD NEGERI PEKAUMAN 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329914", npsn: "20329914", nama: "SD AL-IRSYAD KOTA TEGAL", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329911", npsn: "20329911", nama: "SD IHSANIYAH GAJAHMADA", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329968", npsn: "20329968", nama: "SD NEGERI KRATON 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329876", npsn: "20329876", nama: "SD PIUS TEGAL", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329770", npsn: "20329770", nama: "SD NEGERI TEGALSARI 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "60713972", npsn: "60713972", nama: "MIS MIFTAHUL ULUM TEGALSARI", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329891", npsn: "20329891", nama: "SD NEGERI DEBONG LOR", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Debong Lor", kelurahanId: "debong-lor", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329948", npsn: "20329948", nama: "SD NEGERI KEMANDUNGAN 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kemandungan", kelurahanId: "kemandungan", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329938", npsn: "20329938", nama: "SD NEGERI MUARAREJA 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Muarareja", kelurahanId: "muarareja", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  // SMP
  { id: "20329853", npsn: "20329853", nama: "SMP ALIRSYAD", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "60727455", npsn: "60727455", nama: "MTSS MODEL IHSANIYAH", jenjang: "SMP", subJenjang: "MTs", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329819", npsn: "20329819", nama: "SMP PIUS", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329825", npsn: "20329825", nama: "SMP NEGERI 13", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329832", npsn: "20329832", nama: "SMP NEGERI 3 TEGAL", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329829", npsn: "20329829", nama: "SMP NEGERI 6 TEGAL", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  // SMA/SMK
  { id: "20329846", npsn: "20329846", nama: "SMA NEGERI 2 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329772", npsn: "20329772", nama: "SMAS AL IRSYAD TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329784", npsn: "20329784", nama: "SMAS IHSANIYAH TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329848", npsn: "20329848", nama: "SMAS PIUS TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329856", npsn: "20329856", nama: "SMK NEGERI 1 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20329858", npsn: "20329858", nama: "SMK NEGERI 3 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "20341454", npsn: "20341454", nama: "SMK ASTRINDO KOTA TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pesurungan Kidul", kelurahanId: "pesurungan-kidul", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  // KESETARAAN
  { id: "p9959947", npsn: "P9959947", nama: "PKBM BINA HARAPAN (Paket A, B, C)", jenjang: "KESETARAAN", subJenjang: "PKBM", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "p9908267", npsn: "P9908267", nama: "PKBM BUDI LUHUR (Paket B & C)", jenjang: "KESETARAAN", subJenjang: "Paket C", naungan: "DISDIK", status: "SWASTA", kelurahan: "Pekauman", kelurahanId: "pekauman", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "p9908268", npsn: "P9908268", nama: "PKBM MAJU BERSAMA (Paket B)", jenjang: "KESETARAAN", subJenjang: "Paket B", naungan: "DISDIK", status: "SWASTA", kelurahan: "Tegalsari", kelurahanId: "tegalsari", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },
  { id: "p9959977", npsn: "P9959977", nama: "UPTD SPNF SKB KOTA TEGAL (Paket A, B, C)", jenjang: "KESETARAAN", subJenjang: "SKB", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kraton", kelurahanId: "kraton", kecamatan: "Tegal Barat", kecamatanId: "tegal-barat" },

  // --- TEGAL TIMUR ---
  // PAUD
  { id: "20359984", npsn: "20359984", nama: "TK AISYIYAH BUSTANUL ATHFAL I", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20351677", npsn: "20351677", nama: "TK NEGERI PEMBINA TEGAL TIMUR", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "69884926", npsn: "69884926", nama: "RA SAKILA KERTI", jenjang: "PAUD", subJenjang: "RA", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "69977271", npsn: "69977271", nama: "RA USAMAH 2", jenjang: "PAUD", subJenjang: "RA", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "69818059", npsn: "69818059", nama: "KB AISYIYAH KEJAMBON", jenjang: "PAUD", subJenjang: "KB", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // SD
  { id: "20329958", npsn: "20329958", nama: "SD NEGERI KEJAMBON 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329912", npsn: "20329912", nama: "SD IHSANIYAH 1 TEGAL", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329962", npsn: "20329962", nama: "SD NEGERI MANGKUKUSUMAN 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329796", npsn: "20329796", nama: "SD NEGERI PANGGUNG 2", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329909", npsn: "20329909", nama: "SD IT USAMAH", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329934", npsn: "20329934", nama: "SD NEGERI MINTARAGEN 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Mintaragen", kelurahanId: "mintaragen", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329767", npsn: "20329767", nama: "SD NEGERI SLEROK 1", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // SMP
  { id: "20329817", npsn: "20329817", nama: "SMP NEGERI 1", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329833", npsn: "20329833", nama: "SMP NEGERI 2", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329831", npsn: "20329831", nama: "SMP NEGERI 4", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329816", npsn: "20329816", nama: "SMP NEGERI 10", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329824", npsn: "20329824", nama: "SMP IHSANIYAH", jenjang: "SMP", subJenjang: "SMP", naungan: "DISDIK", status: "SWASTA", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // SMA/SMK
  { id: "20329847", npsn: "20329847", nama: "SMA NEGERI 1 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329845", npsn: "20329845", nama: "SMA NEGERI 3 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329844", npsn: "20329844", nama: "SMA NEGERI 4 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329812", npsn: "20329812", nama: "SMAS MUHAMMADIYAH", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "SWASTA", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329841", npsn: "20329841", nama: "SMK NEGERI 2 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20362559", npsn: "20362559", nama: "SMK IHSANIYAH TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // SLB
  { id: "20329773", npsn: "20329773", nama: "SLB NEGERI KOTA TEGAL (SD, SMP, SMA)", jenjang: "SLB", subJenjang: "SLB SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329774", npsn: "20329774", nama: "SLB NEGERI KOTA TEGAL SMPLB", jenjang: "SLB", subJenjang: "SLB SMP", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "20329775", npsn: "20329775", nama: "SLB NEGERI KOTA TEGAL SMALB", jenjang: "SLB", subJenjang: "SLB SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kejambon", kelurahanId: "kejambon", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // KESETARAAN
  { id: "p9959971", npsn: "P9959971", nama: "PKBM CITRA MANDIRI (Paket A, B, C)", jenjang: "KESETARAAN", subJenjang: "PKBM", naungan: "DISDIK", status: "SWASTA", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "p9970024", npsn: "P9970024", nama: "PKBM SAKILA KERTI (Paket A & B)", jenjang: "KESETARAAN", subJenjang: "Paket A", naungan: "DISDIK", status: "SWASTA", kelurahan: "Panggung", kelurahanId: "panggung", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "p2970158", npsn: "P2970158", nama: "PKBM SARANA MAJU (Paket C)", jenjang: "KESETARAAN", subJenjang: "Paket C", naungan: "DISDIK", status: "SWASTA", kelurahan: "Slerok", kelurahanId: "slerok", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },
  { id: "p9962931", npsn: "P9962931", nama: "PKBM STAR OF TOMORROW", jenjang: "KESETARAAN", subJenjang: "PKBM", naungan: "DISDIK", status: "SWASTA", kelurahan: "Mangkukusuman", kelurahanId: "mangkukusuman", kecamatan: "Tegal Timur", kecamatanId: "tegal-timur" },

  // --- TEGAL SELATAN ---
  // PAUD
  { id: "69966113", npsn: "69966113", nama: "TK NEGERI PEMBINA TEGAL SELATAN", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "69958134", npsn: "69958134", nama: "RA HIDAYATUL MUBTADIIEN", jenjang: "PAUD", subJenjang: "RA", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20350569", npsn: "20350569", nama: "TK AISYIYAH BUSTANUL ATHFAL II", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "69818068", npsn: "69818068", nama: "KB BIAS ASSALAM", jenjang: "PAUD", subJenjang: "KB", naungan: "DISDIK", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // SD
  { id: "60713973", npsn: "60713973", nama: "MIS ASSALAFIYAH", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "60713974", npsn: "60713974", nama: "MIS DARUNNAJAH", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Debong Kulon", kelurahanId: "debong-kulon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "60713975", npsn: "60713975", nama: "MIS IHSANIYAH 01", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "60713979", npsn: "60713979", nama: "MIS NURUL HUDA 01", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "60713977", npsn: "60713977", nama: "MIS MAMBAUL ULUM", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Bandung", kelurahanId: "bandung", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20329867", npsn: "20329867", nama: "SD NEGERI RANDUGUNTING", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // SMP
  { id: "20364867", npsn: "20364867", nama: "MTSS ASSALAFIYAH", jenjang: "SMP", subJenjang: "MTs", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20364868", npsn: "20364868", nama: "MTSS MAMBAUL ULUM", jenjang: "SMP", subJenjang: "MTs", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Tunon", kelurahanId: "tunon", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // SMA/SMK
  { id: "70054237", npsn: "70054237", nama: "SMA NEGERI 6 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kalinyamat Wetan", kelurahanId: "kalinyamat-wetan", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20360818", npsn: "20360818", nama: "SMK AL-IRSYAD TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20354541", npsn: "20354541", nama: "SMK ASSALAFIYAH KOTA TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Keturen", kelurahanId: "keturen", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20329861", npsn: "20329861", nama: "SMK DINAMIKA KOTA TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },
  { id: "20341469", npsn: "20341469", nama: "SMK AL IKHLASH KOTA TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Randugunting", kelurahanId: "randugunting", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // SLB
  { id: "69946325", npsn: "69946325", nama: "SLB SPK MUHAMMADIYAH", jenjang: "SLB", subJenjang: "SLB SD", naungan: "DISDIK", status: "SWASTA", kelurahan: "Debong Tengah", kelurahanId: "debong-tengah", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // KESETARAAN
  { id: "p9962828", npsn: "P9962828", nama: "PKBM ARUM INDAH (Paket A & B)", jenjang: "KESETARAAN", subJenjang: "Paket B", naungan: "DISDIK", status: "SWASTA", kelurahan: "Debong Kidul", kelurahanId: "debong-kidul", kecamatan: "Tegal Selatan", kecamatanId: "tegal-selatan" },

  // --- MARGADANA ---
  // PAUD
  { id: "20351684", npsn: "20351684", nama: "TK NEGERI PEMBINA KECAMATAN MARGADANA", jenjang: "PAUD", subJenjang: "TK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "69977270", npsn: "69977270", nama: "RA AL FURQON", jenjang: "PAUD", subJenjang: "RA", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "69743496", npsn: "69743496", nama: "RA AL-IZZAH", jenjang: "PAUD", subJenjang: "RA", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "69818077", npsn: "69818077", nama: "KB INSAN CERDAS", jenjang: "PAUD", subJenjang: "KB", naungan: "DISDIK", status: "SWASTA", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },

  // SD
  { id: "20329866", npsn: "20329866", nama: "SD NEGERI CABAWAN 2 TEGAL", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Cabawan", kelurahanId: "cabawan", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "20329883", npsn: "20329883", nama: "SD NEGERI KALIGANGSA 04", jenjang: "SD", subJenjang: "SD", naungan: "DISDIK", status: "NEGERI", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "69752199", npsn: "69752199", nama: "MI AR-RIDHO", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "60713970", npsn: "60713970", nama: "MIS AR - RAHMAN", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "60713968", npsn: "60713968", nama: "MIS NURUL HIKMAH", jenjang: "SD", subJenjang: "MI", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Krandon", kelurahanId: "krandon", kecamatan: "Margadana", kecamatanId: "margadana" },

  // SMP
  { id: "20364865", npsn: "20364865", nama: "MTSN KOTA TEGAL", jenjang: "SMP", subJenjang: "MTs", naungan: "KEMENAG", status: "NEGERI", kelurahan: "Pesurungan Lor", kelurahanId: "pesurungan-lor", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "20364866", npsn: "20364866", nama: "MTSS RAUDHATUL ULUM", jenjang: "SMP", subJenjang: "MTs", naungan: "KEMENAG", status: "SWASTA", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },

  // SMA/SMK
  { id: "20363066", npsn: "20363066", nama: "MAN TEGAL", jenjang: "SMA_SMK", subJenjang: "MA", naungan: "KEMENAG", status: "NEGERI", kelurahan: "Pesurungan Lor", kelurahanId: "pesurungan-lor", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "20329843", npsn: "20329843", nama: "SMA NEGERI 5 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMA", naungan: "DISDIK", status: "NEGERI", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "20360538", npsn: "20360538", nama: "SMK HARKAT NEGERI KOTA TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "NEGERI", kelurahan: "Margadana", kelurahanId: "margadana-kel", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "20329860", npsn: "20329860", nama: "SMK ISTEK KALIGANGSA", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },
  { id: "20329842", npsn: "20329842", nama: "SMK MUHAMMADIYAH 2 TEGAL", jenjang: "SMA_SMK", subJenjang: "SMK", naungan: "DISDIK", status: "SWASTA", kelurahan: "Kaligangsa", kelurahanId: "kaligangsa", kecamatan: "Margadana", kecamatanId: "margadana" },

  // KESETARAAN
  { id: "p9959949", npsn: "P9959949", nama: "PKBM KI HAJAR DEWANTARA (Paket A, B, C)", jenjang: "KESETARAAN", subJenjang: "PKBM", naungan: "DISDIK", status: "SWASTA", kelurahan: "Sumurpanggang", kelurahanId: "sumurpanggang", kecamatan: "Margadana", kecamatanId: "margadana" },
];

// ==============================================================================
// 4. DATA MASTER ORGANISASI PERANGKAT DAERAH (OPD) KOTA TEGAL
// ==============================================================================
export interface MasterOpdItem {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  sektor: string;
}

export const MASTER_OPD_TEGAL: MasterOpdItem[] = [
  {
    id: "opd-dinkes",
    kode: "DINKES",
    nama: "Dinas Kesehatan Kota Tegal",
    deskripsi: "Pusat Koordinasi Posyandu, Puskesmas, Imunisasi & Penanganan Stunting",
    sektor: "Kesehatan & Gizi",
  },
  {
    id: "opd-disdikbud",
    kode: "DISDIKBUD",
    nama: "Dinas Pendidikan dan Kebudayaan",
    deskripsi: "Kebijakan PAUD, SD, SMP, Beasiswa Siswa & Kurikulum Sekolah",
    sektor: "Pendidikan & Kebudayaan",
  },
  {
    id: "opd-dinsos",
    kode: "DINSOS",
    nama: "Dinas Sosial Kota Tegal",
    deskripsi: "Penyaluran PKH, BPNT, DTKS, Bantuan Disabilitas & Lansia",
    sektor: "Sosial & Bantuan",
  },
  {
    id: "opd-disdukcapil",
    kode: "DISDUKCAPIL",
    nama: "Dinas Kependudukan dan Pencatatan Sipil",
    deskripsi: "Layanan KTP Digital, Kartu Keluarga, Akta Kelahiran & KIA",
    sektor: "Kependudukan",
  },
  {
    id: "opd-dp3ap2kb",
    kode: "DP3AP2KB",
    nama: "Dinas P3AP2KB Kota Tegal",
    deskripsi: "Pemberdayaan Perempuan, Perlindungan Anak, PLKB & Keluarga Berencana",
    sektor: "Keluarga & Anak",
  },
  {
    id: "opd-diskominfo",
    kode: "DISKOMINFO",
    nama: "Dinas Komunikasi dan Informatika",
    deskripsi: "Layanan Pengaduan Warga, Satu Data Kota Tegal & Portal Informasi Publik",
    sektor: "Komunikasi & TI",
  },
  {
    id: "opd-dinkopukm",
    kode: "DINKOPUKM",
    nama: "Dinas Koperasi, UKM dan Perdagangan",
    deskripsi: "Bantuan Modal UMKM, Sertifikasi Halal, Pasar Murah & Pelatihan Usaha",
    sektor: "Ekonomi & UMKM",
  },
  {
    id: "opd-bpbd",
    kode: "BPBD",
    nama: "Badan Penanggulangan Bencana Daerah",
    deskripsi: "Pencegahan Banjir Rob, Tanggap Darurat Kebakaran & Cuaca Ekstrem",
    sektor: "Kebencanaan & SAR",
  },
  {
    id: "opd-bappeda",
    kode: "BAPPEDA",
    nama: "Badan Perencanaan Pembangunan Daerah",
    deskripsi: "Musrenbang Warga, Riset Daerah & Evaluasi Program Pembangunan",
    sektor: "Perencanaan Kota",
  },
  {
    id: "opd-satpolpp",
    kode: "SATPOL PP",
    nama: "Satuan Polisi Pamong Praja",
    deskripsi: "Penegakan Peraturan Daerah, Ketertiban Umum & Perlindungan Masyarakat",
    sektor: "Ketertiban Umum",
  },
  {
    id: "opd-disnakerin",
    kode: "DISNAKERIN",
    nama: "Dinas Tenaga Kerja dan Perindustrian",
    deskripsi: "Bursa Kerja (Job Fair), Pelatihan BLK & Hubungan Industrial",
    sektor: "Ketenagakerjaan",
  },
  {
    id: "opd-disporapar",
    kode: "DISPORAPAR",
    nama: "Dinas Pemuda, Olahraga dan Pariwisata",
    deskripsi: "Pengembangan Pariwisata Bahari, Fasilitas Olahraga & Kepemudaan",
    sektor: "Pariwisata & Olahraga",
  },
];

// Opsi Multi-Peran Posyandu
export const PERAN_POSYANDU_OPTIONS = [
  { id: "Tenaga Medis", label: "Tenaga Medis", badge: "Kesehatan", desc: "Bidan, Dokter Puskesmas, Perawat" },
  { id: "PLKB", label: "PLKB", badge: "KB & P2KB", desc: "Petugas Lapangan Keluarga Berencana" },
  { id: "Kader Posyandu", label: "Kader Posyandu", badge: "Kader", desc: "Pengurus & Kader Penimbang/Pencatat" },
  { id: "Warga", label: "Warga", badge: "Masyarakat", desc: "Orang Tua Balita, Remaja, Lansia / Warga" },
];

// Opsi Multi-Peran Sekolah
export const PERAN_SEKOLAH_OPTIONS = [
  { id: "Orang Tua / Wali Siswa", label: "Orang Tua / Wali Siswa", badge: "Wali Murid", desc: "Orang tua atau wali siswa terdaftar" },
  { id: "Siswa", label: "Siswa", badge: "Pelajar", desc: "Pelajar aktif pada satuan pendidikan ini" },
  { id: "Guru / Tenaga Kependidikan", label: "Guru / Tenaga Kependidikan", badge: "Pendidik", desc: "Tenaga pendidik, staf TU, & guru" },
  { id: "Komite Sekolah", label: "Komite Sekolah", badge: "Komite", desc: "Perwakilan pengurus komite sekolah" },
  { id: "Alumni / Warga", label: "Alumni / Warga", badge: "Alumni", desc: "Alumni, tokoh sekitar, atau simpatisan" },
];

// Opsi Multi-Peran OPD
export const PERAN_OPD_OPTIONS = [
  { id: "Aparatur / Staf OPD", label: "Aparatur / Staf OPD", badge: "Pegawai", desc: "ASN, Non-ASN, atau staf internal dinas" },
  { id: "Kader Pendamping Program", label: "Kader Pendamping Program", badge: "Pendamping", desc: "Kader TPK, Pendamping PKH, Fasilitator" },
  { id: "Warga Penerima Manfaat / Masyarakat Umum", label: "Warga Penerima Manfaat / Masyarakat Umum", badge: "Warga", desc: "Masyarakat umum, pemohon layanan, penerima program" },
];

// Opsi Dropdown Kategori Jenjang Satuan PAUD & PNF
export const OPSI_JENJANG_SEKOLAH = [
  { value: "semua", label: "Semua Satuan PAUD & PNF" },
  { value: "TK", label: "TK (Taman Kanak-Kanak)" },
  { value: "RA", label: "RA (Raudhatul Athfal)" },
  { value: "KB", label: "KB (Kelompok Bermain)" },
  { value: "POS_PAUD", label: "Pos PAUD / PAUD TPQ" },
  { value: "TPA", label: "TPA (Tempat Penitipan Anak)" },
  { value: "PKBM", label: "PKBM (Pendidikan Kesetaraan)" },
  { value: "SKB", label: "SKB (Sanggar Kegiatan Belajar)" },
];

// ==============================================================================
// 5. KOMPONEN UTAMA BERBASIS TABBED: CardKanalDiscovery
// ==============================================================================
export function CardKanalDiscovery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Tab State: "posyandu" | "sekolah" | "opd"
  const [activeTab, setActiveTab] = useState<string>("posyandu");

  // Sync tab state with URL query param (?tab=posyandu / sekolah / opd)
  useEffect(() => {
    const tabParam = searchParams.get("tab") || searchParams.get("unit_type");
    if (tabParam && ["posyandu", "sekolah", "opd"].includes(tabParam.toLowerCase())) {
      setActiveTab(tabParam.toLowerCase());
      if (tabParam.toLowerCase() === "posyandu") {
        setShowPosyanduResults(true);
      } else if (tabParam.toLowerCase() === "opd") {
        setShowOpdResults(true);
      }
    }
  }, [searchParams]);

  // --------------------------------------------------------------------------
  // STATE TAB 1: KANAL POSYANDU
  // --------------------------------------------------------------------------
  const [kecamatanPosyandu, setKecamatanPosyandu] = useState<string>("semua");
  const [kelurahanPosyandu, setKelurahanPosyandu] = useState<string>("semua");
  const [searchPosyanduText, setSearchPosyanduText] = useState<string>("");
  const [showPosyanduResults, setShowPosyanduResults] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // STATE TAB 2: KANAL SEKOLAH (Fokus Satuan PAUD & PNF se-Kota Tegal)
  // --------------------------------------------------------------------------
  const [searchSekolahText, setSearchSekolahText] = useState<string>("");
  const [kecamatanSekolah, setKecamatanSekolah] = useState<string>("semua");
  const [kelurahanSekolah, setKelurahanSekolah] = useState<string>("semua");
  const [jenjangSekolah, setJenjangSekolah] = useState<string>("semua");

  // --------------------------------------------------------------------------
  // STATE TAB 3: KANAL OPD
  // --------------------------------------------------------------------------
  const [searchOpdText, setSearchOpdText] = useState<string>("");
  const [showOpdResults, setShowOpdResults] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // MODAL GABUNG KANAL STATE
  // --------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    tipe: "POSYANDU" | "SEKOLAH" | "OPD";
    id: string;
    nama: string;
    detail: string;
    kelurahan?: string;
    kecamatan?: string;
    jenjang?: string;
  } | null>(null);

  const [selectedPeran, setSelectedPeran] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ambil data kelurahan untuk dropdown Posyandu
  const availableKelurahanList = useMemo(() => {
    if (!kecamatanPosyandu || kecamatanPosyandu === "semua") {
      return Object.values(FALLBACK_KELURAHAN).flat();
    }
    return FALLBACK_KELURAHAN[kecamatanPosyandu] || [];
  }, [kecamatanPosyandu]);

  // Reset kelurahan jika kecamatan posyandu berganti
  const handleKecamatanPosyanduChange = (val: string | null) => {
    setKecamatanPosyandu(val || "semua");
    setKelurahanPosyandu("semua");
  };

  // Ambil data kelurahan untuk dropdown Sekolah (PAUD & PNF)
  const availableKelurahanSekolahList = useMemo(() => {
    if (!kecamatanSekolah || kecamatanSekolah === "semua") {
      return Object.values(FALLBACK_KELURAHAN).flat();
    }
    return FALLBACK_KELURAHAN[kecamatanSekolah] || [];
  }, [kecamatanSekolah]);

  // Reset kelurahan jika kecamatan sekolah berganti
  const handleKecamatanSekolahChange = (val: string | null) => {
    setKecamatanSekolah(val || "semua");
    setKelurahanSekolah("semua");
  };

  // Posyandu Filtered Results
  const filteredPosyanduList = useMemo(() => {
    return ALL_MASTER_POSYANDU_TEGAL.filter((p) => {
      // Filter Kecamatan
      if (kecamatanPosyandu !== "semua" && p.kecamatanId !== kecamatanPosyandu) {
        return false;
      }
      // Filter Kelurahan
      if (kelurahanPosyandu !== "semua" && p.kelurahanId !== kelurahanPosyandu) {
        return false;
      }
      // Filter Search
      if (searchPosyanduText.trim()) {
        const query = searchPosyanduText.toLowerCase();
        const matchNama = p.nama.toLowerCase().includes(query);
        const matchKel = p.kelurahan.toLowerCase().includes(query);
        const matchKec = p.kecamatan.toLowerCase().includes(query);
        if (!matchNama && !matchKel && !matchKec) return false;
      }
      return true;
    });
  }, [kecamatanPosyandu, kelurahanPosyandu, searchPosyanduText]);

  // --------------------------------------------------------------------------
  // Kueri Supabase Realtime untuk Seluruh Data Satuan PAUD & PNF
  // --------------------------------------------------------------------------
  const {
    data: dbSekolahList,
    isLoading: isLoadingSekolah,
    error: dbSekolahError,
  } = useQuery({
    queryKey: ["kanal_sekolah_full_list"],
    queryFn: async () => {
      try {
        // Ambil data sekolah dan wilayah secara paralel untuk resolusi nama wilayah 100% presisi
        const [sekolahRes, wilayahRes] = await Promise.all([
          supabase
            .from("kanal_sekolah")
            .select("id, npsn, nama, nama_sekolah, jenjang, tingkat, alamat, kelurahan_id, kecamatan_id")
            .order("nama", { ascending: true })
            .limit(1000),
          supabase
            .from("wilayah")
            .select("id, nama, parent_id")
        ]);

        const data = sekolahRes.data;
        const wilayahList = wilayahRes.data || [];

        // Buat map wilayah
        const wilayahMap = new Map<string, { id: string; nama: string; parentId?: string }>();
        wilayahList.forEach((w: any) => {
          wilayahMap.set(w.id, { id: w.id, nama: w.nama, parentId: w.parent_id });
        });

        if (sekolahRes.error) {
          console.warn("Supabase kanal_sekolah warning/RLS notice:", sekolahRes.error.message);
          return null;
        }

        if (data && data.length > 0) {
          return data.map((item: any) => {
            const schoolName = item.nama || item.nama_sekolah || "PAUD / PNF";
            const sub = item.tingkat || item.jenjang || "PAUD";
            const isKemenag = ["RA", "MI", "MTs", "MA", "PAUD TPQ"].includes(sub);

            // 1. Resolusi Kelurahan dari foreign key wilayah
            const kelObj = item.kelurahan_id ? wilayahMap.get(item.kelurahan_id) : null;
            let rawKel = kelObj?.nama || "";

            // 2. Resolusi Kecamatan dari foreign key wilayah atau parent kelurahan
            const kecObj = item.kecamatan_id 
              ? wilayahMap.get(item.kecamatan_id) 
              : (kelObj?.parentId ? wilayahMap.get(kelObj.parentId) : null);
            let rawKec = kecObj?.nama || "";

            // 3. Ekstrak nama Kelurahan & Kecamatan dari alamat jika belum teresolusi
            if (!rawKel && item.alamat) {
              const kelMatch = item.alamat.match(/(?:Kel(?:urahan)?\.?|Desa)\s*([^,]+)/i);
              if (kelMatch && kelMatch[1]) rawKel = kelMatch[1].trim();
            }
            if (!rawKec && item.alamat) {
              const kecMatch = item.alamat.match(/(?:Kec(?:amatan)?\.?)\s*([^,]+)/i);
              if (kecMatch && kecMatch[1]) rawKec = kecMatch[1].trim();
            }

            // 4. Pencocokan Cerdas ke 27 Kelurahan Resmi Kota Tegal (100% Coverage)
            if (!rawKel || rawKel === "Kota Tegal" || !rawKec || rawKec === "Kota Tegal") {
              const combined = ((schoolName || "") + " " + (item.alamat || "")).toLowerCase();
              for (const [key, val] of Object.entries(MASTER_KELURAHAN_KECAMATAN_MAP)) {
                if (combined.includes(key)) {
                  rawKel = (!rawKel || rawKel === "Kota Tegal") ? val.kel : rawKel;
                  rawKec = (!rawKec || rawKec === "Kota Tegal") ? val.kec : rawKec;
                  break;
                }
              }
            }

            // 5. Pemetaan Khusus TK Negeri Pembina (4 Lembaga di Kota Tegal)
            const upperName = schoolName.toUpperCase();
            if (upperName.includes("PEMBINA KOTA TEGAL") || upperName.includes("PEMBINA TEGAL BARAT") || item.npsn === "20351671") {
              rawKel = "Pekauman";
              rawKec = "Tegal Barat";
            } else if (upperName.includes("PEMBINA TEGAL TIMUR") || item.npsn === "20351677") {
              rawKel = "Panggung";
              rawKec = "Tegal Timur";
            } else if (upperName.includes("PEMBINA TEGAL SELATAN") || item.npsn === "69966113") {
              rawKel = "Keturen";
              rawKec = "Tegal Selatan";
            } else if (upperName.includes("PEMBINA KECAMATAN MARGADANA") || upperName.includes("PEMBINA MARGADANA") || item.npsn === "20351684") {
              rawKel = "Margadana";
              rawKec = "Margadana";
            } else {
              rawKel = rawKel || "Kota Tegal";
              rawKec = rawKec || "Kota Tegal";
            }

            // Normalisasi ID wilayah untuk pencocokan filter
            const normKelId = rawKel.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
            const normKecId = rawKec.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

            return {
              id: item.id || item.npsn,
              npsn: item.npsn || "-",
              nama: schoolName,
              jenjang: (item.jenjang || "PAUD") as JenjangSekolahType,
              subJenjang: sub,
              naungan: isKemenag ? ("KEMENAG" as const) : ("DISDIK" as const),
              status: schoolName.toUpperCase().includes("NEGERI") ? ("NEGERI" as const) : ("SWASTA" as const),
              kelurahan: rawKel,
              kelurahanId: normKelId,
              kecamatan: rawKec,
              kecamatanId: normKecId,
              alamat: item.alamat || `Kel. ${rawKel}, Kec. ${rawKec}, Kota Tegal`,
            };
          });
        }

        return null;
      } catch (err) {
        console.error("Error fetching PAUD/PNF from Supabase:", err);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Sekolah Filtered Results (Presisi PAUD & PNF)
  const filteredSekolahList = useMemo(() => {
    // 1. Tentukan sumber data (utamakan dari Supabase dbSekolahList jika ada, fallback ke MASTER_ALL_SEKOLAH_TEGAL)
    const sourceList: MasterSekolahItem[] = (dbSekolahList && dbSekolahList.length > 0)
      ? dbSekolahList
      : MASTER_ALL_SEKOLAH_TEGAL;

    // 2. Filter data secara responsif & presisi
    return sourceList.filter((s) => {
      // Pastikan hanya kategori PAUD & PNF yang tampil di Tab ini
      const isPaudPnf =
        ["PAUD", "KESETARAAN"].includes(s.jenjang) ||
        ["TK", "RA", "KB", "Pos PAUD", "PAUD TPQ", "TPA", "PKBM", "SKB"].includes(s.subJenjang) ||
        s.nama.toLowerCase().includes("pkbm") ||
        s.nama.toLowerCase().includes("skb") ||
        s.nama.toLowerCase().includes("paud") ||
        s.nama.toUpperCase().includes("TK ") ||
        s.nama.toUpperCase().includes("RA ") ||
        s.nama.toUpperCase().includes("KB ") ||
        s.nama.toUpperCase().includes("TPA ") ||
        s.nama.toUpperCase().includes("PEMBINA");

      if (!isPaudPnf) return false;

      // 1. Filter Kecamatan
      if (
        kecamatanSekolah &&
        kecamatanSekolah !== "semua" &&
        kecamatanSekolah !== "all"
      ) {
        const cleanKec = kecamatanSekolah.replace("tegal-", "").toLowerCase().trim();
        const sKec = s.kecamatan.toLowerCase().trim();
        const sKecId = s.kecamatanId.toLowerCase().trim();
        const matchKec =
          sKecId === kecamatanSekolah ||
          sKecId.includes(cleanKec) ||
          sKec.includes(cleanKec) ||
          cleanKec.includes(sKec) ||
          (s.alamat && s.alamat.toLowerCase().includes(cleanKec)) ||
          s.nama.toLowerCase().includes(cleanKec);

        if (!matchKec) return false;
      }

      // 2. Filter Kelurahan
      if (
        kelurahanSekolah &&
        kelurahanSekolah !== "semua" &&
        kelurahanSekolah !== "all"
      ) {
        const cleanKel = kelurahanSekolah.replace(/-kel$/, "").replace(/-/g, " ").toLowerCase().trim();
        const schoolKel = s.kelurahan.toLowerCase().replace(/-/g, " ").trim();
        const schoolKelId = s.kelurahanId.toLowerCase().trim();
        const matchKel =
          schoolKelId === kelurahanSekolah ||
          schoolKelId === cleanKel ||
          schoolKel.includes(cleanKel) ||
          cleanKel.includes(schoolKel) ||
          (s.alamat && s.alamat.toLowerCase().includes(cleanKel)) ||
          (s.nama.toLowerCase().includes(cleanKel) && !s.nama.toLowerCase().includes("kota tegal"));

        if (!matchKel) return false;
      }

      // 3. Filter Jenjang / Kategori
      if (
        jenjangSekolah &&
        jenjangSekolah !== "semua" &&
        jenjangSekolah !== "all"
      ) {
        if (jenjangSekolah === "TK") {
          if (s.subJenjang !== "TK" && !s.nama.toUpperCase().includes("TK ") && !s.nama.toUpperCase().includes("PEMBINA")) return false;
        } else if (jenjangSekolah === "RA") {
          if (s.subJenjang !== "RA" && !s.nama.toUpperCase().includes("RA ")) return false;
        } else if (jenjangSekolah === "KB") {
          if (s.subJenjang !== "KB" && !s.nama.toUpperCase().includes("KB ")) return false;
        } else if (jenjangSekolah === "POS_PAUD") {
          const isPos = ["Pos PAUD", "PAUD TPQ", "SPS"].includes(s.subJenjang) ||
            s.nama.toUpperCase().includes("POS PAUD") ||
            s.nama.toUpperCase().includes("PAUD TPQ") ||
            s.nama.toUpperCase().includes("SPS");
          if (!isPos) return false;
        } else if (jenjangSekolah === "TPA") {
          if (s.subJenjang !== "TPA" && !s.nama.toUpperCase().includes("TPA ")) return false;
        } else if (jenjangSekolah === "PKBM") {
          if (s.subJenjang !== "PKBM" && !s.nama.toUpperCase().includes("PKBM")) return false;
        } else if (jenjangSekolah === "SKB") {
          if (s.subJenjang !== "SKB" && !s.nama.toUpperCase().includes("SKB")) return false;
        } else if (jenjangSekolah === "PAUD") {
          if (s.jenjang !== "PAUD") return false;
        } else if (jenjangSekolah === "KESETARAAN") {
          if (s.jenjang !== "KESETARAAN") return false;
        }
      }

      // 4. Filter Pencarian Teks
      if (searchSekolahText.trim()) {
        const query = searchSekolahText.toLowerCase().trim();
        const matchNama = s.nama.toLowerCase().includes(query);
        const matchNpsn = s.npsn.toLowerCase().includes(query);
        const matchKel = s.kelurahan.toLowerCase().includes(query);
        const matchKec = s.kecamatan.toLowerCase().includes(query);
        const matchAlamat = (s.alamat || "").toLowerCase().includes(query);
        if (!matchNama && !matchNpsn && !matchKel && !matchKec && !matchAlamat) return false;
      }

      return true;
    });
  }, [
    dbSekolahList,
    kecamatanSekolah,
    kelurahanSekolah,
    jenjangSekolah,
    searchSekolahText,
  ]);

  // OPD Filtered Results
  const filteredOpdList = useMemo(() => {
    return MASTER_OPD_TEGAL.filter((opd) => {
      if (!searchOpdText.trim()) return true;
      const query = searchOpdText.toLowerCase();
      return (
        opd.nama.toLowerCase().includes(query) ||
        opd.kode.toLowerCase().includes(query) ||
        opd.sektor.toLowerCase().includes(query) ||
        opd.deskripsi.toLowerCase().includes(query)
      );
    });
  }, [searchOpdText]);

  // Buka Modal Gabung
  const handleOpenJoinModal = (item: {
    tipe: "POSYANDU" | "SEKOLAH" | "OPD";
    id: string;
    nama: string;
    detail: string;
    kelurahan?: string;
    kecamatan?: string;
    jenjang?: string;
  }) => {
    setModalData(item);
    // Set default peran berdasarkan tipe kanal
    if (item.tipe === "POSYANDU") {
      setSelectedPeran(["Warga"]);
    } else if (item.tipe === "SEKOLAH") {
      setSelectedPeran(["Orang Tua / Wali Siswa"]);
    } else {
      setSelectedPeran(["Warga Penerima Manfaat / Masyarakat Umum"]);
    }
    setIsModalOpen(true);
  };

  // Toggle Peran Modal
  const handleTogglePeran = (roleId: string) => {
    setSelectedPeran((prev) =>
      prev.includes(roleId)
        ? prev.length > 1
          ? prev.filter((r) => r !== roleId)
          : prev // Cegah uncheck semua (minimal 1)
        : [...prev, roleId]
    );
  };

  // Submit Modal Gabung
  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalData) return;

    if (selectedPeran.length === 0) {
      toast.error("Pilih minimal satu peran Anda dalam kanal ini.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await joinKanalAction({
        kanalId: modalData.id,
        kanalNama: modalData.nama,
        tipeKanal: modalData.tipe,
        peran: selectedPeran,
        metadata: {
          kelurahan: modalData.kelurahan,
          kecamatan: modalData.kecamatan,
          jenjang: modalData.jenjang,
          detail: modalData.detail,
        },
      });

      if (response.success) {
        toast.success(`Berhasil bergabung ke kanal ${modalData.nama}!`, {
          description: `Peran Anda: ${selectedPeran.join(", ")}`,
        });

        queryClient.invalidateQueries({ queryKey: ["user_kanal_memberships"] });
        setIsModalOpen(false);

        // Redirect ke rute kanal spesifik
        const categorySlug = modalData.tipe.toLowerCase();
        router.push(`/kanal/${categorySlug}/${encodeURIComponent(modalData.id)}`);
      } else {
        toast.error(response.error || "Gagal bergabung ke kanal.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-2 border-border/80 bg-card shadow-sm">
      {/* Header Utama */}
      <CardHeader className="border-b border-border/60 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
              <Compass className="size-4.5" />
              <span>Eksplorasi & Integrasi Komunitas</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
              Kanal Discovery & Integrasi Komunitas
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium mt-1">
              Temukan dan bergabunglah dengan kanal Posyandu, Satuan PAUD & PNF, serta OPD resmi se-Kota Tegal.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          {/* Tabbed Navigation Bar */}
          <TabsList className="grid w-full grid-cols-3 h-14 sm:h-16 bg-muted/70 p-1.5 sm:p-2 rounded-2xl gap-1.5">
            <TabsTrigger
              value="posyandu"
              className="gap-2 text-xs sm:text-base py-2.5 h-full rounded-xl data-[state=active]:bg-background data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-sm font-bold transition-all"
            >
              <HeartHandshake className="size-4.5 sm:size-5 text-emerald-600 dark:text-emerald-400" />
              <span>Kanal Posyandu</span>
            </TabsTrigger>

            <TabsTrigger
              value="sekolah"
              className="gap-2 text-xs sm:text-base py-2.5 h-full rounded-xl data-[state=active]:bg-background data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm font-bold transition-all"
            >
              <GraduationCap className="size-4.5 sm:size-5 text-blue-600 dark:text-blue-400" />
              <span>PAUD & PNF</span>
            </TabsTrigger>

            <TabsTrigger
              value="opd"
              className="gap-2 text-xs sm:text-base py-2.5 h-full rounded-xl data-[state=active]:bg-background data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-300 data-[state=active]:shadow-sm font-bold transition-all"
            >
              <Building2 className="size-4.5 sm:size-5 text-amber-600 dark:text-amber-400" />
              <span>Kanal OPD</span>
            </TabsTrigger>
          </TabsList>

          {/* ================================================================= */}
          {/* TAB 1: KANAL POSYANDU (Filter Bertahap: Kecamatan -> Kelurahan -> Tampilkan) */}
          {/* ================================================================= */}
          <TabsContent value="posyandu" className="space-y-6 focus-visible:outline-none">
            {/* Box Filter Wilayah */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <HeartPulse className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">Filter Wilayah Posyandu</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Pilih Kecamatan dan Kelurahan untuk memuat daftar Posyandu
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold px-3 py-1">
                  Layanan Kesehatan & Anak
                </Badge>
              </div>

              {/* Form Grid: Kecamatan, Kelurahan, & Tombol Tampilkan */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                {/* 1. Dropdown Kecamatan */}
                <div className="sm:col-span-4 space-y-2">
                  <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                    <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>1. Kecamatan Domisili</span>
                  </label>
                  <Select value={kecamatanPosyandu} onValueChange={handleKecamatanPosyanduChange}>
                    <SelectTrigger className="w-full text-sm sm:text-base h-12 bg-background font-medium">
                      <SelectValue placeholder="Pilih Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Kecamatan (Kota Tegal)</SelectItem>
                      {FALLBACK_KECAMATAN.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          Kecamatan {k.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Dropdown Kelurahan */}
                <div className="sm:col-span-4 space-y-2">
                  <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                    <Building className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>2. Kelurahan Domisili</span>
                  </label>
                  <Select value={kelurahanPosyandu} onValueChange={(val) => setKelurahanPosyandu(val || "semua")}>
                    <SelectTrigger className="w-full text-sm sm:text-base h-12 bg-background font-medium">
                      <SelectValue placeholder="Pilih Kelurahan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">
                        {kecamatanPosyandu === "semua" ? "Semua Kelurahan" : "Semua Kelurahan di Kecamatan Ini"}
                      </SelectItem>
                      {availableKelurahanList.map((kel) => (
                        <SelectItem key={kel.id} value={kel.id}>
                          Kelurahan {kel.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Tombol Tampilkan & Reset */}
                <div className="sm:col-span-4 flex items-center gap-2.5">
                  <Button
                    type="button"
                    onClick={() => setShowPosyanduResults(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base h-12 gap-2 font-bold shadow-sm rounded-xl"
                  >
                    <Eye className="size-4" />
                    <span>Tampilkan Posyandu</span>
                  </Button>

                  {showPosyanduResults && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setKecamatanPosyandu("semua");
                        setKelurahanPosyandu("semua");
                        setSearchPosyanduText("");
                        setShowPosyanduResults(false);
                      }}
                      className="h-12 w-12 text-muted-foreground hover:text-foreground shrink-0 rounded-xl border-border/80"
                      title="Reset Filter"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Area Hasil Daftar Posyandu */}
            {!showPosyanduResults ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-3.5">
                  <SlidersHorizontal className="size-7" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">Daftar Posyandu Siap Dimuat</h4>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-lg font-medium leading-relaxed">
                  Silakan tentukan Kecamatan & Kelurahan domisili Anda di atas, kemudian klik tombol{" "}
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">"Tampilkan Posyandu"</span>{" "}
                  untuk menelusuri data resmi Posyandu Kota Tegal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Bar Tambahan di atas hasil */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 sm:p-4 rounded-xl border-2 border-border/80 shadow-2xs">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari nama posyandu..."
                      value={searchPosyanduText}
                      onChange={(e) => setSearchPosyanduText(e.target.value)}
                      className="pl-10 pr-9 text-sm sm:text-base h-11 bg-background font-medium rounded-xl"
                    />
                    {searchPosyanduText && (
                      <button
                        type="button"
                        onClick={() => setSearchPosyanduText("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground self-end sm:self-auto shrink-0">
                    <span>Ditemukan:</span>
                    <Badge variant="secondary" className="font-bold text-sm text-foreground px-3 py-1">
                      {filteredPosyanduList.length} Posyandu
                    </Badge>
                  </div>
                </div>

                {/* List Posyandu */}
                {filteredPosyanduList.length === 0 ? (
                  <div className="rounded-2xl border-2 border-border bg-card p-10 text-center">
                    <HeartHandshake className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-base font-bold text-foreground">Tidak Ada Posyandu Ditemukan</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Coba sesuaikan kata kunci pencarian atau ganti pilihan kelurahan.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 max-h-[560px] overflow-y-auto pr-1">
                    {filteredPosyanduList.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between rounded-2xl border-2 border-border/80 bg-card p-5 transition-all hover:border-emerald-500 hover:shadow-md space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-base font-bold text-foreground leading-snug line-clamp-2">{p.nama}</h4>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 font-bold shrink-0">
                              Posyandu
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <span className="font-semibold text-foreground">Kel. {p.kelurahan}</span>
                            <span>•</span>
                            <span>Kec. {p.kecamatan}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground font-medium">Kota Tegal</span>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleOpenJoinModal({
                                tipe: "POSYANDU",
                                id: p.id,
                                nama: p.nama,
                                detail: `Kel. ${p.kelurahan}, Kec. ${p.kecamatan}`,
                                kelurahan: p.kelurahan,
                                kecamatan: p.kecamatan,
                              })
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm h-10 px-4 gap-1.5 shadow-xs font-bold rounded-xl"
                          >
                            <span>Gabung</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ================================================================= */}
          {/* TAB 2: KANAL SEKOLAH (Fokus Khusus Satuan PAUD & PNF) */}
          {/* ================================================================= */}
          <TabsContent value="sekolah" className="space-y-6 focus-visible:outline-none">
            {/* Keterangan Ringkas Fokus Layanan */}
            <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 p-4 sm:p-5 text-sm sm:text-base text-blue-950 dark:text-blue-200 font-medium">
              <Sparkles className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="leading-relaxed">
                <span className="font-bold">Informasi Layanan:</span> Kanal Sekolah saat ini melayani pencarian Satuan PAUD & PNF se-Kota Tegal.
              </p>
            </div>

            {/* Box Form Filter Bersih & Sederhana */}
            <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-500/20 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">Pencarian Satuan PAUD & PNF Kota Tegal</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Temukan kanal resmi TK, RA, KB, Pos PAUD, PAUD TPQ, TPA, PKBM, hingga SKB se-Kota Tegal
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-bold px-3 py-1">
                  PAUD & PNF
                </Badge>
              </div>

              {/* Form Kontrol: Search Bar, Dropdown Kecamatan, Dropdown Kelurahan, & Dropdown Kategori */}
              <div className="space-y-4">
                {/* 1. Input Search Bar (Lebar Penuh) */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <Search className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Cari Nama PAUD / PNF atau NPSN:</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ketik nama PAUD / PNF atau nomor NPSN (contoh: Sakila Kerti, Pembina, Al-Irsyad, SKB)..."
                      value={searchSekolahText}
                      onChange={(e) => setSearchSekolahText(e.target.value)}
                      className="pl-11 pr-10 text-sm sm:text-base h-12 bg-background rounded-xl font-medium"
                    />
                    {searchSekolahText && (
                      <button
                        type="button"
                        onClick={() => setSearchSekolahText("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Grid Filter: Dropdown Kecamatan, Dropdown Kelurahan, & Dropdown Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Dropdown Kecamatan */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="size-4 text-muted-foreground" />
                      <span>Kecamatan</span>
                    </label>
                    <Select value={kecamatanSekolah} onValueChange={handleKecamatanSekolahChange}>
                      <SelectTrigger className="w-full text-sm sm:text-base h-12 bg-background font-medium">
                        <SelectValue placeholder="Semua Kecamatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Kecamatan</SelectItem>
                        {FALLBACK_KECAMATAN.map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            Kecamatan {k.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown Kelurahan */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Building className="size-4 text-muted-foreground" />
                      <span>Kelurahan</span>
                    </label>
                    <Select value={kelurahanSekolah} onValueChange={(val) => setKelurahanSekolah(val || "semua")}>
                      <SelectTrigger className="w-full text-sm sm:text-base h-12 bg-background font-medium">
                        <SelectValue placeholder="Semua Kelurahan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">
                          {kecamatanSekolah === "semua" ? "Semua Kelurahan" : "Semua Kelurahan di Kecamatan Ini"}
                        </SelectItem>
                        {availableKelurahanSekolahList.map((kel) => (
                          <SelectItem key={kel.id} value={kel.id}>
                            Kelurahan {kel.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown Kategori Jenjang PAUD & PNF */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      <span>Jenis Satuan</span>
                    </label>
                    <Select value={jenjangSekolah} onValueChange={(val) => setJenjangSekolah(val || "semua")}>
                      <SelectTrigger className="w-full text-sm sm:text-base h-12 bg-background font-medium">
                        <SelectValue placeholder="Semua Satuan PAUD & PNF" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPSI_JENJANG_SEKOLAH.map((j) => (
                          <SelectItem key={j.value} value={j.value}>
                            {j.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Area Hasil Daftar Sekolah PAUD & PNF */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3.5 sm:p-4 rounded-xl border-2 border-border/80 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground font-semibold">Filter Aktif:</span>
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5">
                    {kecamatanSekolah === "semua"
                      ? "Semua Kecamatan"
                      : `Kec. ${FALLBACK_KECAMATAN.find((k) => k.id === kecamatanSekolah)?.nama || kecamatanSekolah}`}
                  </Badge>
                  {kelurahanSekolah !== "semua" && (
                    <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5">
                      Kel. {availableKelurahanSekolahList.find((k) => k.id === kelurahanSekolah)?.nama || kelurahanSekolah}
                    </Badge>
                  )}
                  {jenjangSekolah !== "semua" && (
                    <Badge variant="secondary" className="text-xs font-bold px-2.5 py-0.5">
                      {OPSI_JENJANG_SEKOLAH.find((j) => j.value === jenjangSekolah)?.label || jenjangSekolah}
                    </Badge>
                  )}
                  {searchSekolahText.trim() && (
                    <Badge variant="secondary" className="text-xs font-mono font-bold px-2.5 py-0.5">
                      "{searchSekolahText.trim()}"
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground self-end sm:self-auto shrink-0">
                  <span>Hasil:</span>
                  <Badge variant="secondary" className="font-bold text-sm text-foreground px-3 py-1">
                    Ditemukan {filteredSekolahList.length} lembaga PAUD/PNF
                  </Badge>
                </div>
              </div>

              {isLoadingSekolah ? (
                <div className="rounded-2xl border-2 border-border bg-card p-10 text-center">
                  <Loader2 className="size-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">Memuat data satuan PAUD & PNF...</p>
                </div>
              ) : filteredSekolahList.length === 0 ? (
                <div className="rounded-2xl border-2 border-border bg-card p-10 text-center">
                  <School className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-base font-bold text-foreground">Tidak Ada Lembaga PAUD/PNF Ditemukan</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coba ubah kata kunci pencarian atau sesuaikan filter kecamatan & kelurahan.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 max-h-[580px] overflow-y-auto pr-1">
                  {filteredSekolahList.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col justify-between rounded-2xl border-2 border-border/80 bg-card p-5 transition-all hover:border-blue-500 hover:shadow-md space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                            {s.nama}
                          </h4>
                          <Badge
                            variant={s.status === "NEGERI" ? "default" : "secondary"}
                            className={`text-xs px-2 py-0.5 shrink-0 font-bold ${
                              s.status === "NEGERI" ? "bg-blue-600 text-white" : ""
                            }`}
                          >
                            {s.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md text-foreground font-semibold">
                            NPSN: {s.npsn}
                          </span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-500/40 text-blue-800 dark:text-blue-300 bg-blue-500/10 font-bold">
                            {s.subJenjang || s.jenjang}
                          </Badge>
                          {s.naungan && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground font-medium">
                              {s.naungan}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium pt-1 border-t border-border/40">
                          <Building className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <span className="line-clamp-1">
                            Kel. {s.kelurahan}, Kec. {s.kecamatan}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Kanal Komunitas</span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            handleOpenJoinModal({
                              tipe: "SEKOLAH",
                              id: s.id,
                              nama: s.nama,
                              detail: `Jenjang: ${s.subJenjang || s.jenjang}, Kel. ${s.kelurahan}`,
                              kelurahan: s.kelurahan,
                              kecamatan: s.kecamatan,
                              jenjang: s.subJenjang || s.jenjang,
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-10 px-4 gap-1.5 shadow-xs font-bold rounded-xl"
                        >
                          <span>Gabung Kanal</span>
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* TAB 3: KANAL OPD & DINAS */}
          {/* ================================================================= */}
          <TabsContent value="opd" className="space-y-6 focus-visible:outline-none">
            {/* Box Filter Pencarian OPD */}
            <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">Kanal Organisasi Perangkat Daerah (OPD)</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Terhubung dengan Dinas & Badan Resmi Pemerintah Kota Tegal
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-bold px-3 py-1">
                  Layanan Publik & Bantuan
                </Badge>
              </div>

              {/* Form Input Pencarian & Tombol Tampilkan */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-8 space-y-2">
                  <label className="text-sm sm:text-base font-bold text-foreground">Pencarian Nama Dinas / Program Layanan</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Contoh: Kesehatan, Pendidikan, Sosial, Dukcapil, Satpol..."
                      value={searchOpdText}
                      onChange={(e) => setSearchOpdText(e.target.value)}
                      className="pl-10 pr-9 text-sm sm:text-base h-12 bg-background font-medium rounded-xl"
                    />
                    {searchOpdText && (
                      <button
                        type="button"
                        onClick={() => setSearchOpdText("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-4 flex items-center gap-2.5">
                  <Button
                    type="button"
                    onClick={() => setShowOpdResults(true)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base h-12 gap-2 font-bold shadow-sm rounded-xl"
                  >
                    <Eye className="size-4" />
                    <span>Tampilkan Kanal OPD</span>
                  </Button>

                  {showOpdResults && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSearchOpdText("");
                        setShowOpdResults(false);
                      }}
                      className="h-12 w-12 text-muted-foreground hover:text-foreground shrink-0 rounded-xl border-border/80"
                      title="Reset Filter"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Area Hasil Daftar OPD */}
            {!showOpdResults ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-3.5">
                  <Landmark className="size-7" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">Daftar OPD & Dinas Siap Dimuat</h4>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-lg font-medium leading-relaxed">
                  Ketik nama dinas yang dicari atau klik langsung tombol{" "}
                  <span className="font-bold text-amber-700 dark:text-amber-300">"Tampilkan Kanal OPD"</span>{" "}
                  untuk menampilkan seluruh instansi layanan publik di Kota Tegal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 bg-card p-3.5 sm:p-4 rounded-xl border-2 border-border/80 shadow-2xs">
                  <span className="text-sm font-semibold text-muted-foreground">Kanal Organisasi Perangkat Daerah Resmi</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <span>Ditemukan:</span>
                    <Badge variant="secondary" className="font-bold text-sm text-foreground px-3 py-1">
                      {filteredOpdList.length} OPD
                    </Badge>
                  </div>
                </div>

                {filteredOpdList.length === 0 ? (
                  <div className="rounded-2xl border-2 border-border bg-card p-10 text-center">
                    <Building2 className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-base font-bold text-foreground">Tidak Ada OPD Ditemukan</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Coba sesuaikan kata kunci pencarian Anda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 max-h-[560px] overflow-y-auto pr-1">
                    {filteredOpdList.map((opd) => (
                      <div
                        key={opd.id}
                        className="flex flex-col justify-between rounded-2xl border-2 border-border/80 bg-card p-5 transition-all hover:border-amber-500 hover:shadow-md space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-base font-bold text-foreground leading-snug">{opd.nama}</h4>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 font-bold shrink-0">
                              {opd.kode}
                            </Badge>
                          </div>

                          <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold bg-amber-500/10">
                            {opd.sektor}
                          </Badge>

                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 font-medium">
                            {opd.deskripsi}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground font-medium">Pemerintah Kota Tegal</span>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleOpenJoinModal({
                                tipe: "OPD",
                                id: opd.id,
                                nama: opd.nama,
                                detail: opd.deskripsi,
                              })
                            }
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm h-10 px-4 gap-1.5 shadow-xs font-bold rounded-xl"
                          >
                            <span>Gabung</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* ===================================================================== */}
      {/* 6. MODAL GABUNG KANAL TERPADU (Multi-Peran & Konfirmasi Ringkasan) */}
      {/* ===================================================================== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg p-5 sm:p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${
                  modalData?.tipe === "POSYANDU"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : modalData?.tipe === "SEKOLAH"
                    ? "bg-blue-500/15 text-blue-600"
                    : "bg-amber-500/15 text-amber-600"
                }`}
              >
                {modalData?.tipe === "POSYANDU" && <HeartHandshake className="size-5" />}
                {modalData?.tipe === "SEKOLAH" && <GraduationCap className="size-5" />}
                {modalData?.tipe === "OPD" && <Building2 className="size-5" />}
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  Form Gabung Kanal {modalData?.tipe === "POSYANDU" ? "Posyandu" : modalData?.tipe === "SEKOLAH" ? "Sekolah" : "OPD"}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Pilih peran Anda untuk verifikasi data warga</p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitJoin} className="space-y-4 pt-2">
            {/* Teks Ringkasan Lokasi / Kanal */}
            <div
              className={`rounded-xl border-2 p-4 space-y-1.5 ${
                modalData?.tipe === "POSYANDU"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : modalData?.tipe === "SEKOLAH"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground">
                <CheckCircle2
                  className={`size-4 ${
                    modalData?.tipe === "POSYANDU"
                      ? "text-emerald-600"
                      : modalData?.tipe === "SEKOLAH"
                      ? "text-blue-600"
                      : "text-amber-600"
                  }`}
                />
                <span>Konfirmasi Pilihan Kanal:</span>
              </div>

              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                {modalData?.tipe === "POSYANDU" && (
                  <>
                    Anda Memilih Bergabung Ke Posyandu:{" "}
                    <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{modalData.nama}</strong>, Kel.{" "}
                    {modalData.kelurahan}, Kec. {modalData.kecamatan}, Kota Tegal
                  </>
                )}
                {modalData?.tipe === "SEKOLAH" && (
                  <>
                    Anda Memilih Bergabung Ke Sekolah:{" "}
                    <strong className="text-blue-700 dark:text-blue-300 font-bold">{modalData.nama}</strong>, {modalData.detail}
                  </>
                )}
                {modalData?.tipe === "OPD" && (
                  <>
                    Anda Memilih Terhubung dengan:{" "}
                    <strong className="text-amber-700 dark:text-amber-300 font-bold">{modalData.nama}</strong>
                  </>
                )}
              </p>
            </div>

            {/* Checkbox Multi-Peran */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <UserCheck className="size-4 text-muted-foreground" />
                  <span>Tentukan Peran Anda (Bisa Pilih Lebih Dari Satu):</span>
                </label>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {selectedPeran.length} peran dipilih
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {(modalData?.tipe === "POSYANDU"
                  ? PERAN_POSYANDU_OPTIONS
                  : modalData?.tipe === "SEKOLAH"
                  ? PERAN_SEKOLAH_OPTIONS
                  : PERAN_OPD_OPTIONS
                ).map((role) => {
                  const isChecked = selectedPeran.includes(role.id);
                  const themeClasses =
                    modalData?.tipe === "POSYANDU"
                      ? isChecked
                        ? "border-emerald-500 bg-emerald-500/10 shadow-2xs ring-1 ring-emerald-500/30"
                        : "border-border/80 bg-card hover:border-emerald-400 hover:bg-muted/40"
                      : modalData?.tipe === "SEKOLAH"
                      ? isChecked
                        ? "border-blue-500 bg-blue-500/10 shadow-2xs ring-1 ring-blue-500/30"
                        : "border-border/80 bg-card hover:border-blue-400 hover:bg-muted/40"
                      : isChecked
                      ? "border-amber-500 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500/30"
                      : "border-border/80 bg-card hover:border-amber-400 hover:bg-muted/40";

                  const checkBtnClasses =
                    modalData?.tipe === "POSYANDU"
                      ? isChecked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-muted-foreground/40 bg-background"
                      : modalData?.tipe === "SEKOLAH"
                      ? isChecked
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-muted-foreground/40 bg-background"
                      : isChecked
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-muted-foreground/40 bg-background";

                  return (
                    <div
                      key={role.id}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onClick={() => handleTogglePeran(role.id)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          handleTogglePeran(role.id);
                        }
                      }}
                      className={`flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all duration-150 select-none ${themeClasses}`}
                    >
                      <div className={`flex size-5 items-center justify-center rounded-md border-2 transition-colors shrink-0 mt-0.5 ${checkBtnClasses}`}>
                        {isChecked && <Check className="size-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold leading-tight text-foreground">
                            {role.label}
                          </span>
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-semibold shrink-0">
                            {role.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">{role.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="h-11 sm:h-12 text-sm font-semibold rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedPeran.length === 0}
                className={`text-white text-sm sm:text-base font-bold h-11 sm:h-12 gap-2 shadow-xs rounded-xl ${
                  modalData?.tipe === "POSYANDU"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : modalData?.tipe === "SEKOLAH"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Konfirmasi & Gabung Kanal</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Backward Compatibility Named Exports
export function CardPosyanduDiscovery() {
  return <CardKanalDiscovery />;
}
export function CardSekolahDiscovery() {
  return <CardKanalDiscovery />;
}
export function CardOpdDiscovery() {
  return <CardKanalDiscovery />;
}

export default CardKanalDiscovery;
