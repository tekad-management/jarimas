-- ==============================================================================
-- SKEMA & MIGRASI DATA ANAK USIA 0 - 7 TAHUN (SEMESTER GANJIL 2026/2027)
-- DENGAN WORKFLOW VERVAL (VERIFIKASI & VALIDASI) SILANG ANTAR-KANAL
-- Kota Tegal (Kode Kemendagri: 33.76)
-- ==============================================================================

-- 1. TABEL UTAMA: public.data_anak
CREATE TABLE IF NOT EXISTS public.data_anak (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(200) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin VARCHAR(5) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    tinggal_bersama VARCHAR(50) NOT NULL CHECK (tinggal_bersama IN ('Orangtua', 'Orangtua Tunggal', 'Wali')),
    nama_ortu_wali VARCHAR(150) NOT NULL,
    sekolah_anak_type VARCHAR(50) NOT NULL CHECK (sekolah_anak_type IN ('SEKOLAH_BERIZIN', 'BELUM_SEKOLAH', 'SEKOLAH_TIDAK_BERIZIN')),
    sekolah_id UUID REFERENCES public.kanal_sekolah(id) ON DELETE SET NULL,
    nama_sekolah_custom VARCHAR(200),
    semester VARCHAR(100) NOT NULL DEFAULT 'Ganjil 2026/2027 (Juli - Desember 2026)',
    kab_kota VARCHAR(100) NOT NULL DEFAULT 'Kota Tegal',
    kecamatan_id UUID REFERENCES public.wilayah(id) ON DELETE SET NULL,
    kelurahan_id UUID REFERENCES public.wilayah(id) ON DELETE SET NULL,
    rw VARCHAR(10) NOT NULL,
    rt VARCHAR(10) NOT NULL,
    created_by_kanal_type VARCHAR(20) NOT NULL CHECK (created_by_kanal_type IN ('SEKOLAH', 'RT', 'POSYANDU')),
    created_by_kanal_id UUID,
    status_validasi VARCHAR(30) NOT NULL DEFAULT 'MENUNGGU_VALIDASI' CHECK (status_validasi IN ('MENUNGGU_VALIDASI', 'VALID', 'TIDAK_VALID')),
    validated_by_type VARCHAR(20) CHECK (validated_by_type IN ('RT', 'POSYANDU')),
    validated_by_id UUID,
    catatan_validasi TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL: public.tumbuh_kembang_posyandu (Data Kesehatan & Metrik Anak)
CREATE TABLE IF NOT EXISTS public.tumbuh_kembang_posyandu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anak_id UUID NOT NULL REFERENCES public.data_anak(id) ON DELETE CASCADE,
    tanggal_pemeriksaan DATE NOT NULL DEFAULT CURRENT_DATE,
    tinggi_badan_cm NUMERIC(5,2),
    berat_badan_kg NUMERIC(5,2),
    lingkar_kepala_cm NUMERIC(5,2),
    catatan_kesehatan TEXT,
    created_by_posyandu_id UUID,
    status_validasi_sekolah VARCHAR(30) NOT NULL DEFAULT 'MENUNGGU_VALIDASI' CHECK (status_validasi_sekolah IN ('MENUNGGU_VALIDASI', 'VALID', 'TIDAK_VALID')),
    validated_by_sekolah_id UUID REFERENCES public.kanal_sekolah(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEX UNTUK PERFORMA QUERY & FILTER
CREATE INDEX IF NOT EXISTS idx_data_anak_status_validasi ON public.data_anak(status_validasi);
CREATE INDEX IF NOT EXISTS idx_data_anak_domisili ON public.data_anak(kelurahan_id, rw, rt);
CREATE INDEX IF NOT EXISTS idx_data_anak_sekolah_id ON public.data_anak(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_data_anak_created_by ON public.data_anak(created_by_kanal_type, created_by_kanal_id);
CREATE INDEX IF NOT EXISTS idx_tumbuh_kembang_anak_id ON public.tumbuh_kembang_posyandu(anak_id);

-- 4. TRIGGER AUTO-UPDATE `updated_at` PADA public.data_anak
CREATE OR REPLACE FUNCTION public.handle_data_anak_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_data_anak_updated_at ON public.data_anak;
CREATE TRIGGER trg_data_anak_updated_at
BEFORE UPDATE ON public.data_anak
FOR EACH ROW
EXECUTE FUNCTION public.handle_data_anak_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.data_anak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tumbuh_kembang_posyandu ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Policy data_anak
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_anak' AND policyname = 'Public read data_anak') THEN
        CREATE POLICY "Public read data_anak" ON public.data_anak FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_anak' AND policyname = 'Public insert data_anak') THEN
        CREATE POLICY "Public insert data_anak" ON public.data_anak FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_anak' AND policyname = 'Public update data_anak') THEN
        CREATE POLICY "Public update data_anak" ON public.data_anak FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_anak' AND policyname = 'Public delete data_anak') THEN
        CREATE POLICY "Public delete data_anak" ON public.data_anak FOR DELETE USING (true);
    END IF;

    -- Policy tumbuh_kembang_posyandu
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tumbuh_kembang_posyandu' AND policyname = 'Public read tumbuh_kembang_posyandu') THEN
        CREATE POLICY "Public read tumbuh_kembang_posyandu" ON public.tumbuh_kembang_posyandu FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tumbuh_kembang_posyandu' AND policyname = 'Public insert tumbuh_kembang_posyandu') THEN
        CREATE POLICY "Public insert tumbuh_kembang_posyandu" ON public.tumbuh_kembang_posyandu FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tumbuh_kembang_posyandu' AND policyname = 'Public update tumbuh_kembang_posyandu') THEN
        CREATE POLICY "Public update tumbuh_kembang_posyandu" ON public.tumbuh_kembang_posyandu FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tumbuh_kembang_posyandu' AND policyname = 'Public delete tumbuh_kembang_posyandu') THEN
        CREATE POLICY "Public delete tumbuh_kembang_posyandu" ON public.tumbuh_kembang_posyandu FOR DELETE USING (true);
    END IF;
END $$;

-- 6. PUBLIKASI SUPABASE REALTIME
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'data_anak'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.data_anak;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tumbuh_kembang_posyandu'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tumbuh_kembang_posyandu;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 7. SEED CONTOH DATA ANAK & TUMBUH KEMBANG (SEMESTER GANJIL 2026/2027)
-- ==============================================================================
DO $$
DECLARE
    v_kel_mintaragen_id UUID;
    v_kel_panggung_id UUID;
    v_kel_tegalsari_id UUID;
    v_kel_randugunting_id UUID;
    v_sekolah_tk_id UUID;
    v_sekolah_paud_id UUID;
    v_posyandu_id UUID;
    v_anak1_id UUID;
    v_anak2_id UUID;
    v_anak3_id UUID;
    v_anak4_id UUID;
BEGIN
    -- Ambil referensi kelurahan jika ada
    SELECT id INTO v_kel_mintaragen_id FROM public.wilayah WHERE kode = '33.76.02.1001' LIMIT 1;
    SELECT id INTO v_kel_panggung_id FROM public.wilayah WHERE kode = '33.76.02.1002' LIMIT 1;
    SELECT id INTO v_kel_tegalsari_id FROM public.wilayah WHERE kode = '33.76.01.1001' LIMIT 1;
    SELECT id INTO v_kel_randugunting_id FROM public.wilayah WHERE kode = '33.76.03.1001' LIMIT 1;

    -- Ambil referensi sekolah jika ada
    SELECT id INTO v_sekolah_tk_id FROM public.kanal_sekolah WHERE tingkat IN ('TK', 'PAUD') LIMIT 1;
    SELECT id INTO v_posyandu_id FROM public.kanal_posyandu LIMIT 1;

    -- 1. Anak dari Kanal Sekolah (TK Pembina) -> Status: MENUNGGU_VALIDASI (Mengalir ke RT & Posyandu Mintaragen)
    INSERT INTO public.data_anak (
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        tinggal_bersama,
        nama_ortu_wali,
        sekolah_anak_type,
        sekolah_id,
        nama_sekolah_custom,
        semester,
        kab_kota,
        kelurahan_id,
        rw,
        rt,
        created_by_kanal_type,
        created_by_kanal_id,
        status_validasi,
        validated_by_type,
        validated_by_id,
        catatan_validasi
    ) VALUES (
        'Ahmad Rayyan Al-Farizi',
        '2021-04-12',
        'L',
        'Orangtua',
        'Bambang Sugiarto & Siti Aminah',
        'SEKOLAH_BERIZIN',
        v_sekolah_tk_id,
        'TK Negeri Pembina Tegal',
        'Ganjil 2026/2027 (Juli - Desember 2026)',
        'Kota Tegal',
        v_kel_mintaragen_id,
        '02',
        '03',
        'SEKOLAH',
        COALESCE(v_sekolah_tk_id, gen_random_uuid()),
        'MENUNGGU_VALIDASI',
        NULL,
        NULL,
        NULL
    ) RETURNING id INTO v_anak1_id;

    -- 2. Anak dari Kanal Sekolah -> Status: VALID (Telah Divalidasi oleh RT 01 / RW 02)
    INSERT INTO public.data_anak (
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        tinggal_bersama,
        nama_ortu_wali,
        sekolah_anak_type,
        sekolah_id,
        nama_sekolah_custom,
        semester,
        kab_kota,
        kelurahan_id,
        rw,
        rt,
        created_by_kanal_type,
        created_by_kanal_id,
        status_validasi,
        validated_by_type,
        validated_by_id,
        catatan_validasi
    ) VALUES (
        'Nadhira Putri Aisyah',
        '2022-08-20',
        'P',
        'Orangtua',
        'Hendra Kusuma',
        'SEKOLAH_BERIZIN',
        v_sekolah_tk_id,
        'KB / PAUD Terpadu Permata',
        'Ganjil 2026/2027 (Juli - Desember 2026)',
        'Kota Tegal',
        v_kel_panggung_id,
        '02',
        '01',
        'SEKOLAH',
        COALESCE(v_sekolah_tk_id, gen_random_uuid()),
        'VALID',
        'RT',
        gen_random_uuid(),
        'Data domisili KK & Fisik anak cocok sesuai data sensus RT 01 RW 02.'
    ) RETURNING id INTO v_anak2_id;

    -- 3. Anak dari Kanal Posyandu -> Status: TIDAK_VALID (Ditolak oleh RT dengan Catatan untuk Perbaikan)
    INSERT INTO public.data_anak (
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        tinggal_bersama,
        nama_ortu_wali,
        sekolah_anak_type,
        sekolah_id,
        nama_sekolah_custom,
        semester,
        kab_kota,
        kelurahan_id,
        rw,
        rt,
        created_by_kanal_type,
        created_by_kanal_id,
        status_validasi,
        validated_by_type,
        validated_by_id,
        catatan_validasi
    ) VALUES (
        'Muhammad Kenzo Pratama',
        '2023-11-05',
        'L',
        'Orangtua Tunggal',
        'Dewi Ratnasari',
        'BELUM_SEKOLAH',
        NULL,
        NULL,
        'Ganjil 2026/2027 (Juli - Desember 2026)',
        'Kota Tegal',
        v_kel_tegalsari_id,
        '03',
        '04',
        'POSYANDU',
        COALESCE(v_posyandu_id, gen_random_uuid()),
        'TIDAK_VALID',
        'RT',
        gen_random_uuid(),
        'Alamat RT/RW keliru. Keluarga anak tercatat pindah domisili ke RT 05 RW 03.'
    ) RETURNING id INTO v_anak3_id;

    -- 4. Anak dari Grup RT -> Status: VALID (Divalidasi Posyandu)
    INSERT INTO public.data_anak (
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        tinggal_bersama,
        nama_ortu_wali,
        sekolah_anak_type,
        sekolah_id,
        nama_sekolah_custom,
        semester,
        kab_kota,
        kelurahan_id,
        rw,
        rt,
        created_by_kanal_type,
        created_by_kanal_id,
        status_validasi,
        validated_by_type,
        validated_by_id,
        catatan_validasi
    ) VALUES (
        'Salma Anindya Azzahra',
        '2024-02-14',
        'P',
        'Wali',
        'Kakek H. Sutarman',
        'BELUM_SEKOLAH',
        NULL,
        NULL,
        'Ganjil 2026/2027 (Juli - Desember 2026)',
        'Kota Tegal',
        v_kel_randugunting_id,
        '01',
        '02',
        'RT',
        gen_random_uuid(),
        'VALID',
        'POSYANDU',
        COALESCE(v_posyandu_id, gen_random_uuid()),
        'Balita terdaftar aktif pada posyandu Melati RW 01.'
    ) RETURNING id INTO v_anak4_id;

    -- Data Tumbuh Kembang Posyandu untuk Anak 1 & 2
    IF v_anak1_id IS NOT NULL THEN
        INSERT INTO public.tumbuh_kembang_posyandu (
            anak_id,
            tanggal_pemeriksaan,
            tinggi_badan_cm,
            berat_badan_kg,
            lingkar_kepala_cm,
            catatan_kesehatan,
            created_by_posyandu_id,
            status_validasi_sekolah,
            validated_by_sekolah_id
        ) VALUES (
            v_anak1_id,
            '2026-09-15',
            105.5,
            17.2,
            50.2,
            'Gizi baik, perkembangan motorik sesuai usia, vitamin A lengkap.',
            v_posyandu_id,
            'VALID',
            v_sekolah_tk_id
        );
    END IF;

    IF v_anak2_id IS NOT NULL THEN
        INSERT INTO public.tumbuh_kembang_posyandu (
            anak_id,
            tanggal_pemeriksaan,
            tinggi_badan_cm,
            berat_badan_kg,
            lingkar_kepala_cm,
            catatan_kesehatan,
            created_by_posyandu_id,
            status_validasi_sekolah,
            validated_by_sekolah_id
        ) VALUES (
            v_anak2_id,
            '2026-09-20',
            98.0,
            14.8,
            48.5,
            'Status gizi normal, imunisasi dasar lengkap di Posyandu.',
            v_posyandu_id,
            'MENUNGGU_VALIDASI',
            NULL
        );
    END IF;

END $$;
