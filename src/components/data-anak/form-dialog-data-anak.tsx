"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Baby,
  User,
  Calendar,
  Home,
  School,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  createDataAnakAction,
  updateDataAnakAction,
} from "@/actions/data-anak-actions";
import {
  type DataAnakEntity,
  type DataAnakFormInput,
  type KanalPembuatType,
  type SekolahAnakType,
  type TinggalBersamaType,
  DEFAULT_SEMESTER_ACTIVE,
  hitungUsiaDetail,
} from "@/lib/validators/data-anak-schema";
import {
  MASTER_KECAMATAN_TEGAL,
  MASTER_KELURAHAN_TEGAL,
  LIST_RT_RW,
} from "@/lib/validators/register-schema";

interface FormDialogDataAnakProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anakToEdit?: DataAnakEntity | null;
  creatorRole: KanalPembuatType;
  creatorKanalId?: string;
  creatorKanalNama?: string;
  defaultWilayah?: {
    kecamatanId?: string;
    kelurahanId?: string;
    rw?: string;
    rt?: string;
  };
  onSuccess?: (saved: DataAnakEntity) => void;
}

export function FormDialogDataAnak({
  isOpen,
  onOpenChange,
  anakToEdit,
  creatorRole,
  creatorKanalId,
  creatorKanalNama,
  defaultWilayah,
  onSuccess,
}: FormDialogDataAnakProps) {
  const isEditing = Boolean(anakToEdit);

  // Form State
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
  const [tinggalBersama, setTinggalBersama] = useState<TinggalBersamaType>("Orangtua");
  const [namaOrtuWali, setNamaOrtuWali] = useState("");

  // Sekolah State
  const [sekolahAnakType, setSekolahAnakType] = useState<SekolahAnakType>(
    creatorRole === "SEKOLAH" ? "SEKOLAH_BERIZIN" : "BELUM_SEKOLAH"
  );
  const [namaSekolahCustom, setNamaSekolahCustom] = useState("");

  // Domisili State
  const [kecamatanId, setKecamatanId] = useState(defaultWilayah?.kecamatanId || "kec-tt");
  const [kelurahanId, setKelurahanId] = useState(defaultWilayah?.kelurahanId || "kel-mintaragen");
  const [rw, setRw] = useState(defaultWilayah?.rw || "01");
  const [rt, setRt] = useState(defaultWilayah?.rt || "01");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Kelurahan berdasarkan Kecamatan
  const kelurahanOptions = useMemo(() => {
    return MASTER_KELURAHAN_TEGAL[kecamatanId] || [];
  }, [kecamatanId]);

  // Usia Dinamis
  const usiaDetail = useMemo(() => {
    return hitungUsiaDetail(tanggalLahir);
  }, [tanggalLahir]);

  // Populate data jika dalam mode Edit
  useEffect(() => {
    if (anakToEdit) {
      setNamaLengkap(anakToEdit.nama_lengkap || "");
      setTanggalLahir(anakToEdit.tanggal_lahir || "");
      setJenisKelamin(anakToEdit.jenis_kelamin || "L");
      setTinggalBersama(anakToEdit.tinggal_bersama || "Orangtua");
      setNamaOrtuWali(anakToEdit.nama_ortu_wali || "");
      setSekolahAnakType(anakToEdit.sekolah_anak_type || "BELUM_SEKOLAH");
      setNamaSekolahCustom(anakToEdit.nama_sekolah_custom || "");
      if (anakToEdit.kecamatan_id) setKecamatanId(anakToEdit.kecamatan_id);
      if (anakToEdit.kelurahan_id) setKelurahanId(anakToEdit.kelurahan_id);
      if (anakToEdit.rw) setRw(anakToEdit.rw.toString().padStart(2, "0"));
      if (anakToEdit.rt) setRt(anakToEdit.rt.toString().padStart(2, "0"));
    } else {
      // Reset Form untuk Tambah Baru
      setNamaLengkap("");
      setTanggalLahir("");
      setJenisKelamin("L");
      setTinggalBersama("Orangtua");
      setNamaOrtuWali("");
      setSekolahAnakType(creatorRole === "SEKOLAH" ? "SEKOLAH_BERIZIN" : "BELUM_SEKOLAH");
      setNamaSekolahCustom(creatorRole === "SEKOLAH" ? creatorKanalNama || "" : "");
      setKecamatanId(defaultWilayah?.kecamatanId || "kec-tt");
      setKelurahanId(defaultWilayah?.kelurahanId || "kel-mintaragen");
      setRw(defaultWilayah?.rw || "01");
      setRt(defaultWilayah?.rt || "01");
    }
  }, [anakToEdit, isOpen, creatorRole, creatorKanalNama, defaultWilayah]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim() || namaLengkap.length < 2) {
      toast.error("Nama lengkap anak minimal 2 karakter.");
      return;
    }
    if (!tanggalLahir) {
      toast.error("Tanggal lahir anak wajib diisi.");
      return;
    }
    if (usiaDetail && !usiaDetail.isEligible0to7) {
      toast.error("Program ini hanya untuk anak rentang usia 0 - 7 tahun.");
      return;
    }
    if (!namaOrtuWali.trim() || namaOrtuWali.length < 2) {
      toast.error("Nama orang tua / wali wajib diisi.");
      return;
    }

    if (sekolahAnakType === "SEKOLAH_TIDAK_BERIZIN" && (!namaSekolahCustom || namaSekolahCustom.trim().length < 2)) {
      toast.error("Nama lembaga / sekolah tidak berizin wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: DataAnakFormInput = {
        nama_lengkap: namaLengkap.trim(),
        tanggal_lahir: tanggalLahir,
        jenis_kelamin: jenisKelamin,
        tinggal_bersama: tinggalBersama,
        nama_ortu_wali: namaOrtuWali.trim(),
        sekolah_anak_type: sekolahAnakType,
        sekolah_id: sekolahAnakType === "SEKOLAH_BERIZIN" ? creatorKanalId || null : null,
        nama_sekolah_custom:
          sekolahAnakType === "SEKOLAH_BERIZIN"
            ? creatorKanalNama || namaSekolahCustom.trim()
            : sekolahAnakType === "SEKOLAH_TIDAK_BERIZIN"
            ? namaSekolahCustom.trim()
            : null,
        semester: DEFAULT_SEMESTER_ACTIVE,
        kab_kota: "Kota Tegal",
        kecamatan_id: kecamatanId,
        kelurahan_id: kelurahanId,
        rw: rw.padStart(2, "0"),
        rt: rt.padStart(2, "0"),
        created_by_kanal_type: creatorRole,
        created_by_kanal_id: creatorKanalId || null,
      };

      if (isEditing && anakToEdit) {
        const res = await updateDataAnakAction(anakToEdit.id, payload);
        if (res.success && res.data) {
          toast.success(res.message || "Data perbaikan berhasil disimpan!");
          if (onSuccess) onSuccess(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error || "Gagal memperbarui data.");
        }
      } else {
        const res = await createDataAnakAction(payload);
        if (res.success && res.data) {
          toast.success(res.message || "Data anak berhasil didaftarkan!");
          if (onSuccess) onSuccess(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error || "Gagal mendaftarkan data anak.");
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Baby className="size-4" />
            <span>Pendataan Anak Usia 0 - 7 Tahun • {DEFAULT_SEMESTER_ACTIVE}</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Perbaikan Data Anak (Verval)" : "Tambah Data Anak Usia 0 - 7 Tahun"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbaiki data yang sebelumnya ditolak oleh verifikator. Setelah disimpan, status akan otomatis di-reset menjadi 'Menunggu Validasi'."
              : `Mendaftarkan data anak melalui Kanal ${creatorRole} untuk diverifikasi dan divalidasi silang oleh RT/Posyandu.`}
          </DialogDescription>
        </DialogHeader>

        {isEditing && anakToEdit?.catatan_validasi && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="size-3.5 text-rose-600" />
              Catatan Penolakan Sebelumnya:
            </span>
            <p className="italic">&ldquo;{anakToEdit.catatan_validasi}&rdquo;</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          {/* Sesi 1: Identitas Anak */}
          <div className="rounded-xl border border-border/80 p-3.5 bg-muted/20 space-y-3">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 border-b border-border/50 pb-2">
              <User className="size-3.5 text-emerald-600" />
              1. Identitas Anak (0 - 7 Tahun)
            </h4>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-foreground">Nama Lengkap Anak *</label>
              <Input
                placeholder="Contoh: Muhammad Rayyan Pratama"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-foreground">Tanggal Lahir *</label>
                  {usiaDetail && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        usiaDetail.isEligible0to7
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-800"
                      }`}
                    >
                      {usiaDetail.text}
                    </Badge>
                  )}
                </div>
                <Input
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Jenis Kelamin *</label>
                <Select
                  value={jenisKelamin}
                  onValueChange={(val) => {
                    if (val === "L" || val === "P") setJenisKelamin(val);
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki (L)</SelectItem>
                    <SelectItem value="P">Perempuan (P)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Tinggal Bersama *</label>
                <Select
                  value={tinggalBersama}
                  onValueChange={(val) => {
                    if (val) setTinggalBersama(val as TinggalBersamaType);
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orangtua">Orang Tua Lengkap</SelectItem>
                    <SelectItem value="Orangtua Tunggal">Orang Tua Tunggal (Ayah/Ibu)</SelectItem>
                    <SelectItem value="Wali">Wali / Keluarga Lain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Nama Orang Tua / Wali *</label>
                <Input
                  placeholder="Contoh: Hendra Kusuma / Siti Fatimah"
                  value={namaOrtuWali}
                  onChange={(e) => setNamaOrtuWali(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Sesi 2: Status Pendidikan / Sekolah */}
          <div className="rounded-xl border border-border/80 p-3.5 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <School className="size-3.5 text-emerald-600" />
                2. Status Pendidikan / Lembaga Sekolah
              </h4>
              <Badge variant="outline" className="text-[10px] font-medium">
                Kanal Pembuat: {creatorRole}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">
                Tipe Sekolah Anak *
              </label>

              {creatorRole === "SEKOLAH" ? (
                // Kanal Sekolah otomatis Sekolah Berizin
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Sekolah Berizin (TK / PAUD / SD Terdaftar: {creatorKanalNama || "Lembaga Sekolah Aktif"})</span>
                </div>
              ) : (
                // Kanal RT & Posyandu TERBATAS pada 'Belum Sekolah' atau 'Sekolah Tidak Berizin'
                <Select
                  value={sekolahAnakType}
                  onValueChange={(val) => {
                    if (val) setSekolahAnakType(val as SekolahAnakType);
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BELUM_SEKOLAH">
                      Belum Sekolah (Balita / Anak Usia Dini Non-Formal)
                    </SelectItem>
                    <SelectItem value="SEKOLAH_TIDAK_BERIZIN">
                      Sekolah Tidak Berizin / Kursus Mandiri / Bimbel Informal
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {sekolahAnakType === "SEKOLAH_TIDAK_BERIZIN" && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">
                  Nama Lembaga / Sekolah Tidak Berizin *
                </label>
                <Input
                  placeholder="Contoh: Bimbel Anak Ceria / Rumah Belajar Calistung Mandiri"
                  value={namaSekolahCustom}
                  onChange={(e) => setNamaSekolahCustom(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
            )}
          </div>

          {/* Sesi 3: Alamat Domisili Kependudukan */}
          <div className="rounded-xl border border-border/80 p-3.5 bg-muted/20 space-y-3">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 border-b border-border/50 pb-2">
              <Home className="size-3.5 text-emerald-600" />
              3. Alamat Domisili Fisik Anak (Kota Tegal 33.76)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Kecamatan *</label>
                <Select
                  value={kecamatanId}
                  onValueChange={(val) => {
                    if (val) {
                      setKecamatanId(val);
                      const kels = MASTER_KELURAHAN_TEGAL[val];
                      if (kels && kels.length > 0) {
                        setKelurahanId(kels[0].id);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MASTER_KECAMATAN_TEGAL.map((kec) => (
                      <SelectItem key={kec.id} value={kec.id}>
                        {kec.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Kelurahan *</label>
                <Select
                  value={kelurahanId}
                  onValueChange={(val) => {
                    if (val) setKelurahanId(val);
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kelurahanOptions.map((kel) => (
                      <SelectItem key={kel.id} value={kel.id}>
                        {kel.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Rukun Warga (RW) *</label>
                <Select
                  value={rw}
                  onValueChange={(val) => {
                    if (val) setRw(val);
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Pilih RW" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {LIST_RT_RW.map((item) => (
                      <SelectItem key={`rw-${item.value}`} value={item.value}>
                        RW {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Rukun Tetangga (RT) *</label>
                <Select
                  value={rt}
                  onValueChange={(val) => {
                    if (val) setRt(val);
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Pilih RT" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {LIST_RT_RW.map((item) => (
                      <SelectItem key={`rt-${item.value}`} value={item.value}>
                        RT {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menyimpan Data...</span>
                </>
              ) : isEditing ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Simpan Perbaikan Verval</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Daftarkan Data Anak</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
