-- ==============================================================================
-- SCRIPT SEEDING DATA SATUAN PENDIDIKAN RESMI KOTA TEGAL (6 JENJANG SEKOLAH)
-- File: src/lib/supabase/seed-sekolah-tegal.sql
-- Jenjang: PAUD, SD, SMP, SMA_SMK, SLB, KESETARAAN
-- ==============================================================================

-- 1. Pastikan tabel public.kanal_sekolah dan kolom pendukung tersedia
CREATE TABLE IF NOT EXISTS public.kanal_sekolah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npsn VARCHAR(30),
    nama VARCHAR(150) NOT NULL,
    jenjang VARCHAR(50) NOT NULL, -- PAUD, SD, SMP, SMA_SMK, SLB, KESETARAAN
    tingkat VARCHAR(50),          -- TK, KB, RA, SD, MI, SMP, MTs, SMA, SMK, MA, SLB, PKBM, SKB
    kelurahan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE,
    kecamatan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE,
    alamat TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tambahkan kolom jika tabel lama sudah ada
ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS npsn VARCHAR(30);

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS nama VARCHAR(255);

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS nama_sekolah VARCHAR(255);

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS jenjang VARCHAR(50);

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS tingkat VARCHAR(50);

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS kelurahan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS kecamatan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS alamat TEXT;

ALTER TABLE IF EXISTS public.kanal_sekolah 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Lepaskan batasan NOT NULL jika tabel lama memblokir INSERT
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.kanal_sekolah ALTER COLUMN nama DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.kanal_sekolah ALTER COLUMN nama_sekolah DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.kanal_sekolah ALTER COLUMN tingkat DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.kanal_sekolah ALTER COLUMN jenjang DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.kanal_sekolah ALTER COLUMN kelurahan_id DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- 2. Pastikan ada UNIQUE constraint pada kolom npsn
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_kanal_sekolah_npsn'
    ) THEN
        ALTER TABLE public.kanal_sekolah 
            ADD CONSTRAINT uq_kanal_sekolah_npsn UNIQUE (npsn);
    END IF;
END $$;

-- 3. Pastikan RLS diaktifkan & Policy publik diizinkan
ALTER TABLE IF EXISTS public.kanal_sekolah ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Sekolah" ON public.kanal_sekolah;
CREATE POLICY "Public Read Sekolah" ON public.kanal_sekolah FOR SELECT USING (true);
GRANT SELECT ON public.kanal_sekolah TO anon, authenticated;

-- 4. Eksekusi Seeding Data Sekolah
DO $$
DECLARE
    v_item RECORD;
    v_kel_id UUID;
    v_kec_id UUID;
    v_total_inserted INT := 0;
BEGIN
    -- Tabel penampung sementara (Temporary Table)
    CREATE TEMP TABLE IF NOT EXISTS tmp_sekolah_master (
        npsn VARCHAR(30) NOT NULL,
        nama VARCHAR(150) NOT NULL,
        jenjang VARCHAR(50) NOT NULL,
        tingkat VARCHAR(50) NOT NULL,
        nama_kelurahan VARCHAR(100) NOT NULL,
        nama_kecamatan VARCHAR(100) NOT NULL,
        alamat_keterangan TEXT
    ) ON COMMIT DROP;

    TRUNCATE TABLE tmp_sekolah_master;

    -- ==========================================================================
    -- A. KECAMATAN TEGAL BARAT
    -- (Kelurahan: Pekauman, Kraton, Tegalsari, Debong Lor, Kemandungan, Pesurungan Kidul, Muarareja)
    -- ==========================================================================

    -- 1. PAUD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20351671', 'TK NEGERI PEMBINA KOTA TEGAL', 'PAUD', 'TK', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20351661', 'TK AL-IRSYAD AL-ISLAMIYAH', 'PAUD', 'TK', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('69743498', 'RA AT TAQWA', 'PAUD', 'RA', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20351660', 'TK HANG TUAH 16', 'PAUD', 'TK', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20351655', 'TK PIUS', 'PAUD', 'TK', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal'),
    ('69960275', 'KB GLOBAL INBYRA SCHOOL', 'PAUD', 'KB', 'Kemandungan', 'Tegal Barat', 'Kelurahan Kemandungan, Kec. Tegal Barat, Kota Tegal');

    -- 2. SD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329798', 'SD NEGERI PEKAUMAN 1', 'SD', 'SD', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329914', 'SD AL-IRSYAD KOTA TEGAL', 'SD', 'SD', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329911', 'SD IHSANIYAH GAJAHMADA', 'SD', 'SD', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329968', 'SD NEGERI KRATON 1', 'SD', 'SD', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal'),
    ('20329876', 'SD PIUS TEGAL', 'SD', 'SD', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal'),
    ('20329770', 'SD NEGERI TEGALSARI 1', 'SD', 'SD', 'Tegalsari', 'Tegal Barat', 'Kelurahan Tegalsari, Kec. Tegal Barat, Kota Tegal'),
    ('60713972', 'MIS MIFTAHUL ULUM TEGALSARI', 'SD', 'MI', 'Tegalsari', 'Tegal Barat', 'Kelurahan Tegalsari, Kec. Tegal Barat, Kota Tegal'),
    ('20329891', 'SD NEGERI DEBONG LOR', 'SD', 'SD', 'Debong Lor', 'Tegal Barat', 'Kelurahan Debong Lor, Kec. Tegal Barat, Kota Tegal'),
    ('20329948', 'SD NEGERI KEMANDUNGAN 1', 'SD', 'SD', 'Kemandungan', 'Tegal Barat', 'Kelurahan Kemandungan, Kec. Tegal Barat, Kota Tegal'),
    ('20329938', 'SD NEGERI MUARAREJA 1', 'SD', 'SD', 'Muarareja', 'Tegal Barat', 'Kelurahan Muarareja, Kec. Tegal Barat, Kota Tegal');

    -- 3. SMP
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329853', 'SMP ALIRSYAD', 'SMP', 'SMP', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('60727455', 'MTSS MODEL IHSANIYAH', 'SMP', 'MTs', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329819', 'SMP PIUS', 'SMP', 'SMP', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal'),
    ('20329825', 'SMP NEGERI 13', 'SMP', 'SMP', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal'),
    ('20329832', 'SMP NEGERI 3 TEGAL', 'SMP', 'SMP', 'Tegalsari', 'Tegal Barat', 'Kelurahan Tegalsari, Kec. Tegal Barat, Kota Tegal'),
    ('20329829', 'SMP NEGERI 6 TEGAL', 'SMP', 'SMP', 'Tegalsari', 'Tegal Barat', 'Kelurahan Tegalsari, Kec. Tegal Barat, Kota Tegal');

    -- 4. SMA/SMK
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329846', 'SMA NEGERI 2 TEGAL', 'SMA_SMK', 'SMA', 'Tegalsari', 'Tegal Barat', 'Kelurahan Tegalsari, Kec. Tegal Barat, Kota Tegal'),
    ('20329772', 'SMAS AL IRSYAD TEGAL', 'SMA_SMK', 'SMA', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329784', 'SMAS IHSANIYAH TEGAL', 'SMA_SMK', 'SMA', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329848', 'SMAS PIUS TEGAL', 'SMA_SMK', 'SMA', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal'),
    ('20329856', 'SMK NEGERI 1 TEGAL', 'SMA_SMK', 'SMK', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20329858', 'SMK NEGERI 3 TEGAL', 'SMA_SMK', 'SMK', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('20341454', 'SMK ASTRINDO KOTA TEGAL', 'SMA_SMK', 'SMK', 'Pesurungan Kidul', 'Tegal Barat', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal');

    -- 5. KESETARAAN
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('P9959947', 'PKBM BINA HARAPAN', 'KESETARAAN', 'PKBM', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('P9908267', 'PKBM BUDI LUHUR', 'KESETARAAN', 'PKBM', 'Pekauman', 'Tegal Barat', 'Kelurahan Pekauman, Kec. Tegal Barat, Kota Tegal'),
    ('P9908268', 'PKBM MAJU BERSAMA', 'KESETARAAN', 'PKBM', 'Tegalsari', 'Tegal Barat', 'Kelurahan Tegalsari, Kec. Tegal Barat, Kota Tegal'),
    ('P9959977', 'UPTD SPNF SKB KOTA TEGAL', 'KESETARAAN', 'SKB', 'Kraton', 'Tegal Barat', 'Kelurahan Kraton, Kec. Tegal Barat, Kota Tegal');

    -- ==========================================================================
    -- B. KECAMATAN TEGAL TIMUR
    -- (Kelurahan: Kejambon, Slerok, Panggung, Mangkukusuman, Mintaragen)
    -- ==========================================================================

    -- 1. PAUD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20359984', 'TK AISYIYAH BUSTANUL ATHFAL I', 'PAUD', 'TK', 'Mangkukusuman', 'Tegal Timur', 'Kelurahan Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
    ('20351677', 'TK NEGERI PEMBINA TEGAL TIMUR', 'PAUD', 'TK', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('69884926', 'RA SAKILA KERTI', 'PAUD', 'RA', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal'),
    ('69977271', 'RA USAMAH 2', 'PAUD', 'RA', 'Mintaragen', 'Tegal Timur', 'Kelurahan Mintaragen, Kec. Tegal Timur, Kota Tegal'),
    ('69818059', 'KB AISYIYAH KEJAMBON', 'PAUD', 'KB', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal');

    -- 2. SD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329958', 'SD NEGERI KEJAMBON 1', 'SD', 'SD', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal'),
    ('20329912', 'SD IHSANIYAH 1 TEGAL', 'SD', 'SD', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal'),
    ('20329962', 'SD NEGERI MANGKUKUSUMAN 1', 'SD', 'SD', 'Mangkukusuman', 'Tegal Timur', 'Kelurahan Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
    ('20329796', 'SD NEGERI PANGGUNG 2', 'SD', 'SD', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('20329909', 'SD IT USAMAH', 'SD', 'SD', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('20329934', 'SD NEGERI MINTARAGEN 1', 'SD', 'SD', 'Mintaragen', 'Tegal Timur', 'Kelurahan Mintaragen, Kec. Tegal Timur, Kota Tegal'),
    ('20329767', 'SD NEGERI SLEROK 1', 'SD', 'SD', 'Slerok', 'Tegal Timur', 'Kelurahan Slerok, Kec. Tegal Timur, Kota Tegal');

    -- 3. SMP
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329817', 'SMP NEGERI 1', 'SMP', 'SMP', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('20329833', 'SMP NEGERI 2', 'SMP', 'SMP', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal'),
    ('20329831', 'SMP NEGERI 4', 'SMP', 'SMP', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('20329816', 'SMP NEGERI 10', 'SMP', 'SMP', 'Mangkukusuman', 'Tegal Timur', 'Kelurahan Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
    ('20329824', 'SMP IHSANIYAH', 'SMP', 'SMP', 'Slerok', 'Tegal Timur', 'Kelurahan Slerok, Kec. Tegal Timur, Kota Tegal');

    -- 4. SMA/SMK
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329847', 'SMA NEGERI 1 TEGAL', 'SMA_SMK', 'SMA', 'Slerok', 'Tegal Timur', 'Kelurahan Slerok, Kec. Tegal Timur, Kota Tegal'),
    ('20329845', 'SMA NEGERI 3 TEGAL', 'SMA_SMK', 'SMA', 'Slerok', 'Tegal Timur', 'Kelurahan Slerok, Kec. Tegal Timur, Kota Tegal'),
    ('20329844', 'SMA NEGERI 4 TEGAL', 'SMA_SMK', 'SMA', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('20329812', 'SMAS MUHAMMADIYAH', 'SMA_SMK', 'SMA', 'Mangkukusuman', 'Tegal Timur', 'Kelurahan Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
    ('20329841', 'SMK NEGERI 2 TEGAL', 'SMA_SMK', 'SMK', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal'),
    ('20362559', 'SMK IHSANIYAH TEGAL', 'SMA_SMK', 'SMK', 'Slerok', 'Tegal Timur', 'Kelurahan Slerok, Kec. Tegal Timur, Kota Tegal');

    -- 5. SLB
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329773', 'SLB NEGERI KOTA TEGAL', 'SLB', 'SLB', 'Kejambon', 'Tegal Timur', 'Kelurahan Kejambon, Kec. Tegal Timur, Kota Tegal');

    -- 6. KESETARAAN
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('P9959971', 'PKBM CITRA MANDIRI', 'KESETARAAN', 'PKBM', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('P9970024', 'PKBM SAKILA KERTI', 'KESETARAAN', 'PKBM', 'Panggung', 'Tegal Timur', 'Kelurahan Panggung, Kec. Tegal Timur, Kota Tegal'),
    ('P2970158', 'PKBM SARANA MAJU', 'KESETARAAN', 'PKBM', 'Slerok', 'Tegal Timur', 'Kelurahan Slerok, Kec. Tegal Timur, Kota Tegal'),
    ('P9962931', 'PKBM STAR OF TOMORROW', 'KESETARAAN', 'PKBM', 'Mangkukusuman', 'Tegal Timur', 'Kelurahan Mangkukusuman, Kec. Tegal Timur, Kota Tegal');

    -- ==========================================================================
    -- C. KECAMATAN TEGAL SELATAN
    -- (Kelurahan: Kalinyamat Wetan, Bandung, Debong Kidul, Tunon, Keturen, Debong Kulon, Debong Tengah, Randugunting)
    -- ==========================================================================

    -- 1. PAUD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('69966113', 'TK NEGERI PEMBINA TEGAL SELATAN', 'PAUD', 'TK', 'Keturen', 'Tegal Selatan', 'Kelurahan Keturen, Kec. Tegal Selatan, Kota Tegal'),
    ('69958134', 'RA HIDAYATUL MUBTADIIEN', 'PAUD', 'RA', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal'),
    ('20350569', 'TK AISYIYAH BUSTANUL ATHFAL II', 'PAUD', 'TK', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal'),
    ('69818068', 'KB BIAS ASSALAM', 'PAUD', 'KB', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal');

    -- 2. SD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('60713973', 'MIS ASSALAFIYAH', 'SD', 'MI', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal'),
    ('60713974', 'MIS DARUNNAJAH', 'SD', 'MI', 'Debong Kulon', 'Tegal Selatan', 'Kelurahan Debong Kulon, Kec. Tegal Selatan, Kota Tegal'),
    ('60713975', 'MIS IHSANIYAH 01', 'SD', 'MI', 'Debong Tengah', 'Tegal Selatan', 'Kelurahan Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
    ('60713979', 'MIS NURUL HUDA 01', 'SD', 'MI', 'Keturen', 'Tegal Selatan', 'Kelurahan Keturen, Kec. Tegal Selatan, Kota Tegal'),
    ('60713977', 'MIS MAMBAUL ULUM', 'SD', 'MI', 'Bandung', 'Tegal Selatan', 'Kelurahan Bandung, Kec. Tegal Selatan, Kota Tegal'),
    ('20329867', 'SD NEGERI RANDUGUNTING', 'SD', 'SD', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal');

    -- 3. SMP
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20364867', 'MTSS ASSALAFIYAH', 'SMP', 'MTs', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal'),
    ('20364868', 'MTSS MAMBAUL ULUM', 'SMP', 'MTs', 'Tunon', 'Tegal Selatan', 'Kelurahan Tunon, Kec. Tegal Selatan, Kota Tegal');

    -- 4. SMA/SMK
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('70054237', 'SMA NEGERI 6 TEGAL', 'SMA_SMK', 'SMA', 'Kalinyamat Wetan', 'Tegal Selatan', 'Kelurahan Kalinyamat Wetan, Kec. Tegal Selatan, Kota Tegal'),
    ('20360818', 'SMK AL-IRSYAD TEGAL', 'SMA_SMK', 'SMK', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal'),
    ('20354541', 'SMK ASSALAFIYAH KOTA TEGAL', 'SMA_SMK', 'SMK', 'Keturen', 'Tegal Selatan', 'Kelurahan Keturen, Kec. Tegal Selatan, Kota Tegal'),
    ('20329861', 'SMK DINAMIKA KOTA TEGAL', 'SMA_SMK', 'SMK', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal'),
    ('20341469', 'SMK AL IKHLASH KOTA TEGAL', 'SMA_SMK', 'SMK', 'Randugunting', 'Tegal Selatan', 'Kelurahan Randugunting, Kec. Tegal Selatan, Kota Tegal');

    -- 5. SLB
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('69946325', 'SLB SPK MUHAMMADIYAH', 'SLB', 'SLB', 'Debong Tengah', 'Tegal Selatan', 'Kelurahan Debong Tengah, Kec. Tegal Selatan, Kota Tegal');

    -- 6. KESETARAAN
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('P9962828', 'PKBM ARUM INDAH', 'KESETARAAN', 'PKBM', 'Debong Kidul', 'Tegal Selatan', 'Kelurahan Debong Kidul, Kec. Tegal Selatan, Kota Tegal');

    -- ==========================================================================
    -- D. KECAMATAN MARGADANA
    -- (Kelurahan: Kaligangsa, Krandon, Cabawan, Kalinyamat Kulon, Margadana, Sumurpanggang, Pesurungan Lor)
    -- ==========================================================================

    -- 1. PAUD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20351684', 'TK NEGERI PEMBINA KECAMATAN MARGADANA', 'PAUD', 'TK', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kec. Margadana, Kota Tegal'),
    ('69977270', 'RA AL FURQON', 'PAUD', 'RA', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kec. Margadana, Kota Tegal'),
    ('69743496', 'RA AL-IZZAH', 'PAUD', 'RA', 'Kaligangsa', 'Margadana', 'Kelurahan Kaligangsa, Kec. Margadana, Kota Tegal'),
    ('69818077', 'KB INSAN CERDAS', 'PAUD', 'KB', 'Sumurpanggang', 'Margadana', 'Kelurahan Sumurpanggang, Kec. Margadana, Kota Tegal');

    -- 2. SD
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20329866', 'SD NEGERI CABAWAN 2 TEGAL', 'SD', 'SD', 'Cabawan', 'Margadana', 'Kelurahan Cabawan, Kec. Margadana, Kota Tegal'),
    ('20329883', 'SD NEGERI KALIGANGSA 04', 'SD', 'SD', 'Kaligangsa', 'Margadana', 'Kelurahan Kaligangsa, Kec. Margadana, Kota Tegal'),
    ('69752199', 'MI AR-RIDHO', 'SD', 'MI', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kec. Margadana, Kota Tegal'),
    ('60713970', 'MIS AR - RAHMAN', 'SD', 'MI', 'Sumurpanggang', 'Margadana', 'Kelurahan Sumurpanggang, Kec. Margadana, Kota Tegal'),
    ('60713968', 'MIS NURUL HIKMAH', 'SD', 'MI', 'Krandon', 'Margadana', 'Kelurahan Krandon, Kec. Margadana, Kota Tegal');

    -- 3. SMP
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20364865', 'MTSN KOTA TEGAL', 'SMP', 'MTs', 'Pesurungan Lor', 'Margadana', 'Kelurahan Pesurungan Lor, Kec. Margadana, Kota Tegal'),
    ('20364866', 'MTSS RAUDHATUL ULUM', 'SMP', 'MTs', 'Kaligangsa', 'Margadana', 'Kelurahan Kaligangsa, Kec. Margadana, Kota Tegal');

    -- 4. SMA/SMK
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('20363066', 'MAN TEGAL', 'SMA_SMK', 'MA', 'Pesurungan Lor', 'Margadana', 'Kelurahan Pesurungan Lor, Kec. Margadana, Kota Tegal'),
    ('20329843', 'SMA NEGERI 5 TEGAL', 'SMA_SMK', 'SMA', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kec. Margadana, Kota Tegal'),
    ('20360538', 'SMK HARKAT NEGERI KOTA TEGAL', 'SMA_SMK', 'SMK', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kec. Margadana, Kota Tegal'),
    ('20329860', 'SMK ISTEK KALIGANGSA', 'SMA_SMK', 'SMK', 'Kaligangsa', 'Margadana', 'Kelurahan Kaligangsa, Kec. Margadana, Kota Tegal'),
    ('20329842', 'SMK MUHAMMADIYAH 2 TEGAL', 'SMA_SMK', 'SMK', 'Kaligangsa', 'Margadana', 'Kelurahan Kaligangsa, Kec. Margadana, Kota Tegal');

    -- 5. KESETARAAN
    INSERT INTO tmp_sekolah_master (npsn, nama, jenjang, tingkat, nama_kelurahan, nama_kecamatan, alamat_keterangan) VALUES
    ('P9959949', 'PKBM KI HAJAR DEWANTARA', 'KESETARAAN', 'PKBM', 'Sumurpanggang', 'Margadana', 'Kelurahan Sumurpanggang, Kec. Margadana, Kota Tegal');

    -- ==========================================================================
    -- E. EKSEKUSI INSERT DINAMIS KE TABEL public.kanal_sekolah
    -- ==========================================================================
    FOR v_item IN SELECT * FROM tmp_sekolah_master LOOP
        -- Cari ID Kelurahan & ID Kecamatan secara dinamis dari tabel public.wilayah
        SELECT w_kel.id, COALESCE(w_kel.parent_id, w_kec.id)
        INTO v_kel_id, v_kec_id
        FROM public.wilayah w_kel
        LEFT JOIN public.wilayah w_kec ON (
            (w_kel.parent_id = w_kec.id AND w_kec.tipe = 'KECAMATAN')
            OR (LOWER(TRIM(w_kec.nama)) = LOWER(TRIM(v_item.nama_kecamatan)) AND w_kec.tipe = 'KECAMATAN')
        )
        WHERE (
            LOWER(TRIM(w_kel.nama)) = LOWER(TRIM(v_item.nama_kelurahan))
            OR REPLACE(LOWER(TRIM(w_kel.nama)), ' ', '') = REPLACE(LOWER(TRIM(v_item.nama_kelurahan)), ' ', '')
            OR LOWER(TRIM(w_kel.nama)) LIKE '%' || LOWER(TRIM(v_item.nama_kelurahan)) || '%'
        )
        AND w_kel.tipe = 'KELURAHAN'
        LIMIT 1;

        -- Jika kelurahan ditemukan di tabel wilayah, masukkan/update data sekolah
        IF v_kel_id IS NOT NULL THEN
            INSERT INTO public.kanal_sekolah (
                npsn,
                nama,
                jenjang,
                tingkat,
                kelurahan_id,
                kecamatan_id,
                alamat
            ) VALUES (
                v_item.npsn,
                v_item.nama,
                v_item.jenjang,
                v_item.tingkat,
                v_kel_id,
                v_kec_id,
                v_item.alamat_keterangan
            )
            ON CONFLICT (npsn) DO UPDATE SET
                nama = EXCLUDED.nama,
                jenjang = EXCLUDED.jenjang,
                tingkat = EXCLUDED.tingkat,
                kelurahan_id = EXCLUDED.kelurahan_id,
                kecamatan_id = EXCLUDED.kecamatan_id,
                alamat = EXCLUDED.alamat,
                updated_at = now();
            
            v_total_inserted := v_total_inserted + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'Seeding Selesai: % Data Sekolah berhasil diproses.', v_total_inserted;

    -- Bersihkan temporary table
    DROP TABLE IF EXISTS tmp_sekolah_master;
END $$;

-- 5. Verifikasi Jumlah Data Satuan Pendidikan Terdaftar
SELECT 
    COALESCE(w_kec.nama, 'Kota Tegal') AS kecamatan,
    ks.jenjang,
    COUNT(ks.id) AS total_sekolah
FROM public.kanal_sekolah ks
JOIN public.wilayah w_kel ON ks.kelurahan_id = w_kel.id AND w_kel.tipe = 'KELURAHAN'
LEFT JOIN public.wilayah w_kec ON (ks.kecamatan_id = w_kec.id OR w_kel.parent_id = w_kec.id) AND w_kec.tipe = 'KECAMATAN'
GROUP BY COALESCE(w_kec.nama, 'Kota Tegal'), ks.jenjang
ORDER BY kecamatan, ks.jenjang;
