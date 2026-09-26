"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  HeartPulse,
  Scale,
  Ruler,
  Activity,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  School,
  AlertCircle,
} from "lucide-react";
import {
  addTumbuhKembangAction,
  validateTumbuhKembangBySekolahAction,
} from "@/actions/data-anak-actions";
import {
  type DataAnakEntity,
  type TumbuhKembangEntity,
  hitungUsiaDetail,
} from "@/lib/validators/data-anak-schema";

interface DialogTumbuhKembangProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anak: DataAnakEntity | null;
  activeRole: "SEKOLAH" | "RT" | "POSYANDU" | "READ_ONLY";
  activeKanalId?: string;
  onSuccess?: () => void;
}

export function DialogTumbuhKembang({
  isOpen,
  onOpenChange,
  anak,
  activeRole,
  activeKanalId,
  onSuccess,
}: DialogTumbuhKembangProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form input state
  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [beratBadan, setBeratBadan] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");
  const [catatanKesehatan, setCatatanKesehatan] = useState("");

  if (!anak) return null;

  const usia = hitungUsiaDetail(anak.tanggal_lahir);
  const records = anak.tumbuh_kembang || [];

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    const tb = parseFloat(tinggiBadan);
    const bb = parseFloat(beratBadan);
    const lk = lingkarKepala ? parseFloat(lingkarKepala) : undefined;

    if (isNaN(tb) || tb < 30 || tb > 160) {
      toast.error("Tinggi badan harus diisi angka valid antara 30 - 160 cm.");
      return;
    }
    if (isNaN(bb) || bb < 1.5 || bb > 60) {
      toast.error("Berat badan harus diisi angka valid antara 1.5 - 60 kg.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addTumbuhKembangAction({
        anak_id: anak.id,
        tanggal_pemeriksaan: tanggalPemeriksaan,
        tinggi_badan_cm: tb,
        berat_badan_kg: bb,
        lingkar_kepala_cm: lk,
        catatan_kesehatan: catatanKesehatan.trim() || undefined,
        created_by_posyandu_id: activeKanalId || null,
      });

      if (res.success) {
        toast.success(res.message || "Data tumbuh kembang berhasil dicatat.");
        setIsAdding(false);
        setTinggiBadan("");
        setBeratBadan("");
        setLingkarKepala("");
        setCatatanKesehatan("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal menyimpan data tumbuh kembang.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateHealth = async (
    recordId: string,
    status: "VALID" | "TIDAK_VALID"
  ) => {
    try {
      const res = await validateTumbuhKembangBySekolahAction(
        recordId,
        status,
        activeKanalId || "sekolah-id"
      );
      if (res.success) {
        toast.success(res.message || `Status kesehatan berhasil dinyatakan ${status}`);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal memvalidasi status kesehatan.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <HeartPulse className="size-4" />
            <span>Kesehatan & Tumbuh Kembang Posyandu Terpadu</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Buku Tumbuh Kembang: {anak.nama_lengkap}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pemantauan berkala Tinggi Badan, Berat Badan, Lingkar Kepala, dan status gizi balita oleh Kanal Posyandu dan verifikasi Sekolah.
          </DialogDescription>
        </DialogHeader>

        {/* Ringkasan Profil Anak */}
        <div className="flex items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/80 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Nama Anak & Usia:</span>
            <span className="font-bold text-foreground">
              {anak.nama_lengkap} ({usia?.text || "-"})
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Domisili:</span>
            <span className="font-semibold text-foreground">RT {anak.rt} / RW {anak.rw}</span>
          </div>
          {activeRole === "POSYANDU" && !isAdding && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 gap-1.5 shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Input Penimbangan</span>
            </Button>
          )}
        </div>

        {/* Form Tambah Pengukuran Posyandu */}
        {isAdding && (
          <form
            onSubmit={handleSaveMeasurement}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Activity className="size-4 text-emerald-600" />
                Formulir Penimbangan Posyandu Baru
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Batal
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Tanggal Pemeriksaan *</label>
                <Input
                  type="date"
                  value={tanggalPemeriksaan}
                  onChange={(e) => setTanggalPemeriksaan(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Tinggi Badan (cm) *</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 102.5"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Berat Badan (kg) *</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 16.8"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-3">
                <label className="text-[11px] font-medium text-foreground">Lingkar Kepala (cm) (Opsional)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 49.0"
                  value={lingkarKepala}
                  onChange={(e) => setLingkarKepala(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-foreground">Catatan Kesehatan / Gizi</label>
              <Textarea
                placeholder="Contoh: Balita sehat, imunisasi lengkap, nafsu makan baik, vitamin A telah diberikan."
                value={catatanKesehatan}
                onChange={(e) => setCatatanKesehatan(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Simpan Pengukuran</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Riwayat Pemeriksaan Posyandu */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>Riwayat Pengukuran Berkala</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              Total {records.length} riwayat tercatat
            </span>
          </h4>

          {records.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border/80 text-center space-y-2 text-xs text-muted-foreground">
              <HeartPulse className="size-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">Belum ada riwayat penimbangan Posyandu</p>
              <p className="text-[11px]">
                Kader Posyandu di wilayah domisili anak dapat menginput data tinggi & berat badan saat jadwal posyandu berlangsung.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {records.map((rec, idx) => (
                <div
                  key={rec.id || `tk-${idx}`}
                  className="rounded-xl border border-border/80 bg-card p-3.5 space-y-2 text-xs transition-all hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <span className="flex items-center gap-1.5 font-bold text-foreground">
                      <Calendar className="size-3.5 text-emerald-600" />
                      {rec.tanggal_pemeriksaan}
                    </span>

                    {/* Badge Verval Sekolah */}
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold gap-1 ${
                        rec.status_validasi_sekolah === "VALID"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                          : rec.status_validasi_sekolah === "TIDAK_VALID"
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {rec.status_validasi_sekolah === "VALID" ? (
                        <>
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>Validasi Sekolah: VALID</span>
                        </>
                      ) : rec.status_validasi_sekolah === "TIDAK_VALID" ? (
                        <>
                          <XCircle className="size-3 text-rose-600" />
                          <span>Validasi Sekolah: DITOLAK</span>
                        </>
                      ) : (
                        <>
                          <Clock className="size-3 text-amber-600" />
                          <span>Menunggu Validasi Sekolah</span>
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground block">Tinggi Badan</span>
                      <span className="text-sm font-extrabold text-foreground">
                        {rec.tinggi_badan_cm} <span className="text-[10px] font-normal">cm</span>
                      </span>
                    </div>

                    <div className="p-2 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground block">Berat Badan</span>
                      <span className="text-sm font-extrabold text-foreground">
                        {rec.berat_badan_kg} <span className="text-[10px] font-normal">kg</span>
                      </span>
                    </div>

                    <div className="p-2 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground block">Lingkar Kepala</span>
                      <span className="text-sm font-extrabold text-foreground">
                        {rec.lingkar_kepala_cm ? (
                          <>
                            {rec.lingkar_kepala_cm} <span className="text-[10px] font-normal">cm</span>
                          </>
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                  </div>

                  {rec.catatan_kesehatan && (
                    <div className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded border border-border/40">
                      <span className="font-semibold text-foreground">Catatan Kader Posyandu:</span>{" "}
                      {rec.catatan_kesehatan}
                    </div>
                  )}

                  {/* Tombol Validasi untuk Kanal Sekolah */}
                  {activeRole === "SEKOLAH" && rec.status_validasi_sekolah === "MENUNGGU_VALIDASI" && (
                    <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-border/40">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Validasi oleh Sekolah:
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleValidateHealth(rec.id, "TIDAK_VALID")}
                        className="h-7 text-[11px] text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1"
                      >
                        <XCircle className="size-3" />
                        <span>Tolak</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleValidateHealth(rec.id, "VALID")}
                        className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1"
                      >
                        <CheckCircle2 className="size-3" />
                        <span>Validasi Cocok</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
