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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  HeartPulse,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Home,
  School,
} from "lucide-react";
import { vervalDataAnakAction } from "@/actions/data-anak-actions";
import {
  type DataAnakEntity,
  type ValidatedByType,
  hitungUsiaDetail,
} from "@/lib/validators/data-anak-schema";

interface DialogVervalAnakProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anak: DataAnakEntity | null;
  verifierType: ValidatedByType;
  verifierName?: string;
  verifierId?: string;
  onSuccess?: (updated: DataAnakEntity) => void;
}

export function DialogVervalAnak({
  isOpen,
  onOpenChange,
  anak,
  verifierType,
  verifierName,
  verifierId,
  onSuccess,
}: DialogVervalAnakProps) {
  const [selectedStatus, setSelectedStatus] = useState<"VALID" | "TIDAK_VALID">("VALID");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!anak) return null;

  const usia = hitungUsiaDetail(anak.tanggal_lahir);
  const verifierLabel = verifierName || (verifierType === "RT" ? `Grup RT ${anak.rt} / RW ${anak.rw}` : "Kanal Posyandu Terdekat");

  const handleSubmitVerval = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === "TIDAK_VALID" && (!catatan || catatan.trim().length < 5)) {
      toast.error("Wajib mengisi catatan alasan penolakan (minimal 5 karakter).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await vervalDataAnakAction({
        anak_id: anak.id,
        status_validasi: selectedStatus,
        validated_by_type: verifierType,
        validated_by_id: verifierId || null,
        validator_name: verifierLabel,
        catatan_validasi: catatan.trim() || undefined,
      });

      if (res.success && res.data) {
        toast.success(res.message || "Validasi berhasil disimpan!");
        if (onSuccess) {
          onSuccess(res.data);
        }
        onOpenChange(false);
        setCatatan("");
      } else {
        toast.error(res.error || "Gagal memproses validasi.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem saat validasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>Workflow Verval Silang Antar-Kanal</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Verifikasi & Validasi Data Anak (0-7 Tahun)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pastikan data kependudukan fisik, domisili RT/RW, dan status sekolah anak sesuai dengan fakta lapangan.
          </DialogDescription>
        </DialogHeader>

        {/* Ringkasan Data Anak Yang Diverifikasi */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3 text-xs">
          <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
            <div>
              <p className="text-sm font-bold text-foreground">{anak.nama_lengkap}</p>
              <p className="text-muted-foreground">
                {anak.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} • Usia:{" "}
                <span className="font-semibold text-foreground">{usia?.text || "-"}</span> (
                {anak.tanggal_lahir})
              </p>
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold shrink-0">
              {anak.semester}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div className="space-y-0.5">
              <span className="text-[11px] block font-medium text-foreground">Orang Tua / Wali:</span>
              <p>{anak.nama_ortu_wali} ({anak.tinggal_bersama})</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] block font-medium text-foreground">Domisili Terdata:</span>
              <p>RT {anak.rt} / RW {anak.rw}, Kota Tegal</p>
            </div>

            <div className="space-y-0.5 col-span-2">
              <span className="text-[11px] block font-medium text-foreground">Status Pendidikan:</span>
              <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <School className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {anak.sekolah_anak_type === "SEKOLAH_BERIZIN"
                  ? `Sekolah Berizin (${anak.nama_sekolah_custom || "TK / PAUD Terdaftar"})`
                  : anak.sekolah_anak_type === "SEKOLAH_TIDAK_BERIZIN"
                  ? `Lembaga Tidak Berizin (${anak.nama_sekolah_custom})`
                  : "Belum Bersekolah"}
              </p>
            </div>

            <div className="col-span-2 pt-1 border-t border-border/40 text-[11px] flex items-center justify-between text-muted-foreground">
              <span>Sumber Pendaftar: <strong>Kanal {anak.created_by_kanal_type}</strong></span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                {verifierType === "RT" ? (
                  <Building2 className="size-3 text-emerald-600" />
                ) : (
                  <HeartPulse className="size-3 text-emerald-600" />
                )}
                Verifikator: {verifierLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Form Keputusan Validasi */}
        <form onSubmit={handleSubmitVerval} className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Keputusan Verifikasi & Validasi:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStatus("VALID")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedStatus === "VALID"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 font-bold shadow-xs"
                    : "border-border/80 hover:bg-muted text-muted-foreground font-medium"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Dinyatakan VALID</span>
                </div>
                <span className="text-[10px] mt-1 opacity-80">
                  Data fisik & domisili anak sesuai
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("TIDAK_VALID")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedStatus === "TIDAK_VALID"
                    ? "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20 font-bold shadow-xs"
                    : "border-border/80 hover:bg-muted text-muted-foreground font-medium"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <XCircle className="size-4 text-rose-600 dark:text-rose-400" />
                  <span>TIDAK VALID (Tolak)</span>
                </div>
                <span className="text-[10px] mt-1 opacity-80">
                  Ada ketidaksesuaian domisili/data
                </span>
              </button>
            </div>
          </div>

          {/* Catatan Verifikator (Wajib jika TIDAK_VALID) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center justify-between">
              <span>
                Catatan Verifikasi{" "}
                {selectedStatus === "TIDAK_VALID" && (
                  <span className="text-rose-500 font-bold">* (Wajib diisi)</span>
                )}
              </span>
              {selectedStatus === "TIDAK_VALID" && (
                <span className="text-[11px] text-muted-foreground">Minimal 5 karakter</span>
              )}
            </label>
            <Textarea
              placeholder={
                selectedStatus === "VALID"
                  ? "Opsional: Data anak telah diverifikasi cocok dengan data kependudukan RT/Posyandu."
                  : "Contoh: Alamat RT 02 salah, anak sebenarnya berdomisili di RT 04 RW 02. Harap perbaiki."
              }
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              className="text-xs resize-none"
              required={selectedStatus === "TIDAK_VALID"}
            />
            {selectedStatus === "TIDAK_VALID" && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="size-3 shrink-0" />
                Catatan ini akan muncul di kanal pembuat (Sekolah/Posyandu) agar dapat diperbaiki.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={`text-xs font-bold gap-1.5 text-white ${
                selectedStatus === "VALID"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : selectedStatus === "VALID" ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Konfirmasi Validasi</span>
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" />
                  <span>Tolak & Minta Perbaikan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
