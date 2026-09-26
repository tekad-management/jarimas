-- ==============================================================================
-- SCRIPT SEEDING DATA LENGKAP SATUAN PAUD & PNF SE-KOTA TEGAL (188+ LEMBAGA)
-- Sumber Data Resmi:
-- 1. Nama SatpenPAUD-PNFkotategal.xlsx (TK, KB, Pos PAUD, PAUD TPQ, TPA, PKBM, SKB)
-- 2. RA Kota Tegal.pdf (Raudhatul Athfal se-Kota Tegal)
-- File: src/lib/supabase/seed-paud-pnf-full.sql
-- ==============================================================================


-- 0. Sinkronisasi kolom tipe dan tingkat pada public.wilayah (Aman terhadap ENUM)
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.wilayah ADD COLUMN IF NOT EXISTS tipe VARCHAR(50);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.wilayah ADD COLUMN IF NOT EXISTS tingkat VARCHAR(50);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        EXECUTE 'UPDATE public.wilayah SET tipe = tingkat::text::tipe_wilayah_enum WHERE tipe IS NULL AND tingkat IS NOT NULL;';
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            EXECUTE 'UPDATE public.wilayah SET tipe = tingkat WHERE tipe IS NULL AND tingkat IS NOT NULL;';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END;

    BEGIN
        EXECUTE 'UPDATE public.wilayah SET tingkat = tipe::text WHERE tingkat IS NULL AND tipe IS NOT NULL;';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- 1. Pastikan struktur tabel public.kanal_sekolah siap dan memiliki semua kolom yang diperlukan
CREATE TABLE IF NOT EXISTS public.kanal_sekolah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npsn VARCHAR(30),
    nama VARCHAR(255),
    nama_sekolah VARCHAR(255),
    jenjang VARCHAR(50),          -- PAUD, KESETARAAN, SD, SMP, SMA_SMK, SLB
    tingkat VARCHAR(50),          -- TK, RA, KB, Pos PAUD, PAUD TPQ, TPA, PKBM, SKB
    kelurahan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE,
    kecamatan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE,
    alamat TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pastikan seluruh kolom pendukung tersedia pada tabel lama/baru
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS npsn VARCHAR(30);
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS nama VARCHAR(255);
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS nama_sekolah VARCHAR(255);
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS jenjang VARCHAR(50);
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS tingkat VARCHAR(50);
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS kelurahan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS kecamatan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS alamat TEXT;
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS public.kanal_sekolah ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Lepaskan batasan NOT NULL pada kolom lama (jika ada) agar INSERT tidak tertahan
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

    -- Jika kolom nama_sekolah ada tetapi nama kosong, salin nilainya
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'kanal_sekolah' AND column_name = 'nama_sekolah'
    ) THEN
        UPDATE public.kanal_sekolah SET nama = nama_sekolah WHERE nama IS NULL AND nama_sekolah IS NOT NULL;
    END IF;
END $$;

-- 2. Pastikan UNIQUE constraint pada NPSN
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

-- 3. Kebijakan Keamanan RLS (Row Level Security) Terbuka untuk Publik
ALTER TABLE IF EXISTS public.kanal_sekolah ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Sekolah" ON public.kanal_sekolah;
CREATE POLICY "Public Read Sekolah" ON public.kanal_sekolah FOR SELECT USING (true);
GRANT SELECT ON public.kanal_sekolah TO anon, authenticated;

-- ==============================================================================
-- 4. INSERT DATA RAUDHATUL ATHFAL (RA) RESMI KOTA TEGAL (SUMBER: KEMENAG)
-- ==============================================================================

-- --- KECAMATAN TEGAL SELATAN ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69958134', 'RA HIDAYATUL MUBTADIIEN', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Merpati Gg. Kaswari Rt 07 /02, Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743499', 'RA BAITUSH SHOBIRIN', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tunon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Nyi Ageng Serang RT.01/02, Kel. Tunon, Kec. Tegal Selatan, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743500', 'RA BIAS ASSALAM', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Dadali No. 12, Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- KECAMATAN TEGAL TIMUR ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69977271', 'RA USAMAH 2', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mintaragen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Waringin Gang 9, Kel. Mintaragen, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69884926', 'RA SAKILA KERTI', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Kaligung Gang III No.32 Rt 04 Rw IV Panggung, Kel. Kejambon, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69884927', 'RA SYUHADA', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Adonara 2 RT 05 RW XI, Kel. Panggung, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743503', 'RA AL HASANIYAH', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Werkudoro No. 24, Kel. Slerok, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743504', 'RA ISTIQOMAH', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Gatotkaca No 12, Kel. Slerok, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743501', 'RA MIFTAHUSSALAM', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jalan Antasena No.16, Kel. Slerok, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743502', 'RA PERMATA HATI', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Nakula Gg. Widuri No.27, Kel. Kejambon, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743505', 'RA PERWANIDA', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Baladewa No.5, Kel. Kejambon, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743506', 'RA SYIARUL ISLAM', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. KH. Muklas No.7, Kel. Panggung, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743507', 'RA USAMAH', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Surabayan RT 01 RW 14, Kel. Panggung, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- KECAMATAN TEGAL BARAT ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743498', 'RA AT TAQWA', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Kelapa Sawit No 3, Kel. Pekauman, Kec. Tegal Barat, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- KECAMATAN MARGADANA ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69977270', 'RA AL FURQON', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Prof Buya Hamka No. 75 RT.5 RW.10, Kel. Margadana, Kec. Margadana, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743496', 'RA AL-IZZAH', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kaligangsa%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. M. Thoha No 1, Kel. Kaligangsa, Kec. Margadana, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743497', 'RA BAITUL IMAN', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Lor%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Banjarmasin RT 04 RW 01, Kel. Pesurungan Lor, Kec. Margadana, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat)
VALUES
('69743495', 'RA MIFTAHUN NAJAH', 'PAUD', 'RA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kaligangsa%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Jl. Bekasi No 80, Kel. Kaligangsa, Kec. Margadana, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();


-- ==============================================================================
-- 5. INSERT DATA KELOMPOK BERMAIN (KB), POS PAUD/SPS, TPA, PKBM & SKB
-- (SUMBER DATA RESMI DISDIKBUD KOTA TEGAL: Nama SatpenPAUD-PNFkotategal)
-- ==============================================================================

-- --- KELOMPOK BERMAIN (KB) ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat) VALUES
('69928754', 'KB AISYIYAH ANAK SHOLEH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69966352', 'KB AISYIYAH BAITUL KARIM', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('69818059', 'KB AISYIYAH KEJAMBON', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69818043', 'KB AL-IRSYAD', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69818073', 'KB AL-IZZAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kaligangsa%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kaligangsa, Kec. Margadana, Kota Tegal'),
('69935790', 'KB AMALIA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69973495', 'KB ANANDA MANDIRI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69818061', 'KB AT-TAQWA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69818065', 'KB AZZUROFAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69818068', 'KB BIAS ASSALAM', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69818088', 'KB BINA ANAK SHOLEH (BIAS)', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kemandungan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kemandungan, Kec. Tegal Barat, Kota Tegal'),
('69928753', 'KB BINA ANAK SHOLEH (BIAS)', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69935822', 'KB DARUL KIFAAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69918013', 'KB DEBONG KIDUL', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Kidul, Kec. Tegal Selatan, Kota Tegal'),
('69918017', 'KB ELFATH KIDS', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69818045', 'KB ELKANA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69960275', 'KB GLOBAL INBYRA SCHOOL', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kemandungan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kemandungan, Kec. Tegal Barat, Kota Tegal'),
('69917032', 'KB HIDAYATUL MUBTADI-IEN', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69818053', 'KB HOMESCHOOLING ABC D', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69818091', 'KB IHSANIYAH 3', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69818077', 'KB INSAN CERDAS', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('70051182', 'KB INSAN MANDIRI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('70054968', 'KB ISLAM AL AZHAR 66 KOTA TEGAL', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('69818040', 'KB ISTIQOMAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69917247', 'KB JAYA LESTARI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kalinyamat Wetan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kalinyamat Wetan, Kec. Tegal Selatan, Kota Tegal'),
('70061151', 'KB KALIMASADA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('69952478', 'KB KIDDY CARE', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69818056', 'KB LITTLE STAR', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('69975546', 'KB MEKAR', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('69818079', 'KB MINAT', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69964731', 'KB MUTIARA SHAHABAT', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kemandungan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kemandungan, Kec. Tegal Barat, Kota Tegal'),
('69916865', 'KB NURULLAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69818042', 'KB NURUNNISA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69818084', 'KB PELITA BANGSA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69952479', 'KB PELITA HARAPAN BANGSA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69818090', 'KB PELITA HATI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69818070', 'KB PERMATA HATI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69818092', 'KB PIUS', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69818044', 'KB PRIMA UNIVERSAL', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69818083', 'KB PRIMAGAMA ISLAMI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69818048', 'KB QURROTA A YUN', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('69818051', 'KB RAUDLOTUL JANNAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69918019', 'KB RIYAADUL JANNAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69914290', 'KB RUMAH BINTANG', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69818046', 'KB SAKILA KERTI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69818050', 'KB SEKAR KEMUNING', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Keturen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Keturen, Kec. Tegal Selatan, Kota Tegal'),
('69818087', 'KB SOFA MARWAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('69818052', 'KB SYI ARUL ISLAM', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69914221', 'KB SYUHADA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69915012', 'KB TELAGA ILMU', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Krandon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Krandon, Kec. Margadana, Kota Tegal'),
('70063185', 'KB TRANSISI ANILO', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69818047', 'KB TUNAS HARAPAN BANGSA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69932227', 'KB TUNAS HIDUP HARAPAN KITA', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('69818081', 'KB AISYIYAH TEGAL BARAT', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69818093', 'KB IHSANIYAH 1', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mintaragen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mintaragen, Kec. Tegal Timur, Kota Tegal'),
('69818049', 'KB SEKAR MELATI', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69818057', 'KB TARBIYATUL KHASANAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69818055', 'KBI USAMAH', 'PAUD', 'KB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- POS PAUD & PAUD TPQ (SATUAN PAUD SEJENIS / SPS) ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat) VALUES
('69818111', 'PAUD TPQ AL-HIKMAH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kalinyamat Kulon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kalinyamat Kulon, Kec. Margadana, Kota Tegal'),
('69818095', 'PAUD TPQ AL-IZZAH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kaligangsa%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kaligangsa, Kec. Margadana, Kota Tegal'),
('69818080', 'PAUD TPQ AL-MUKHLISHIN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('69818098', 'PAUD TPQ AL-MUNAWWAROH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69818096', 'PAUD TPQ AT TAQWA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Cabawan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Cabawan, Kec. Margadana, Kota Tegal'),
('69818109', 'PAUD TPQ ATH THOHIRIYAH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69904186', 'PAUD TPQ FAHMAL QURAN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('69818110', 'PAUD TPQ NURUL HUDA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69990458', 'PAUD TPQ PLUS INSAN KAMIL', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Muarareja%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Muarareja, Kec. Tegal Barat, Kota Tegal'),
('69914120', 'POS PAUD AL MAEMUNAH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69914319', 'POS PAUD ANGGREK', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kaligangsa%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kaligangsa, Kec. Margadana, Kota Tegal'),
('69914169', 'POS PAUD ANGGREK BULAN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69928757', 'POS PAUD ANYELIR', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69917226', 'POS PAUD BALITA JAYA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kalinyamat Wetan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kalinyamat Wetan, Kec. Tegal Selatan, Kota Tegal'),
('70034057', 'POS PAUD BIANGLALA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('69914267', 'POS PAUD BOUGENVILLE', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69818101', 'POS PAUD BOUGENVILLE', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('70034979', 'POS PAUD CERMAI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mangkukusuman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
('69818097', 'POS PAUD DELIMA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69963107', 'POS PAUD DEWI SARTIKA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69818041', 'POS PAUD DEWI SARTIKA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Kulon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Kulon, Kec. Tegal Selatan, Kota Tegal'),
('69935483', 'POS PAUD INSAN CENDIKIA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Lor%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Lor, Kec. Margadana, Kota Tegal'),
('69818094', 'POS PAUD KARTINI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69917972', 'POS PAUD KARTINI RW. VI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69916493', 'POS PAUD KENANGA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mintaragen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mintaragen, Kec. Tegal Timur, Kota Tegal'),
('69818099', 'POS PAUD KENANGA KEMANDUNGAN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kemandungan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kemandungan, Kec. Tegal Barat, Kota Tegal'),
('69916882', 'POS PAUD KENANGA KRATON', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69906837', 'POS PAUD KESAMBI SARI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('69968166', 'POS PAUD MAWAR', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Muarareja%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Muarareja, Kec. Tegal Barat, Kota Tegal'),
('69914231', 'POS PAUD MAWAR MERAH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('69818064', 'POS PAUD MEKAR SARI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Kidul, Kec. Tegal Selatan, Kota Tegal'),
('69914225', 'POS PAUD MELATI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kalinyamat Kulon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kalinyamat Kulon, Kec. Margadana, Kota Tegal'),
('69915297', 'POS PAUD MELATI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('69917977', 'POS PAUD MELATI SARI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('69818102', 'POS PAUD NUSA INDAH', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('70035705', 'POS PAUD SAKURA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kaligangsa%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kaligangsa, Kec. Margadana, Kota Tegal'),
('70034724', 'POS PAUD SEJAHTERA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Bandung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Bandung, Kec. Tegal Selatan, Kota Tegal'),
('69914193', 'POS PAUD SEKAR KAMBOJA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69818103', 'POS PAUD SEKAR MELATI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('69818105', 'POS PAUD SERUNI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('69917960', 'POS PAUD SERUNI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Lor%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Lor, Kec. Tegal Barat, Kota Tegal'),
('69908953', 'POS PAUD SERUNI', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('69914181', 'POS PAUD SUMBODRO', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('69914286', 'POS PAUD TUNAS BANGSA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Krandon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Krandon, Kec. Margadana, Kota Tegal'),
('69915007', 'POS PAUD TUNAS CERIA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Cabawan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Cabawan, Kec. Margadana, Kota Tegal'),
('69908672', 'POS PAUD TUNAS HARAPAN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Krandon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Krandon, Kec. Margadana, Kota Tegal'),
('69818071', 'POS PAUD TUNAS HARAPAN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69915008', 'POS PAUD TUNAS MUDA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Krandon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Krandon, Kec. Margadana, Kota Tegal'),
('69818054', 'POS PAUD TUNAS MUTIARA', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tunon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tunon, Kec. Tegal Selatan, Kota Tegal'),
('69818058', 'POS PAUD WERKUDORO', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('70038525', 'SPS PAUD TPQ TAHFIDZ CAHAYA QURAN', 'PAUD', 'Pos PAUD',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- PENDIDIKAN KESETARAAN (PKBM & SKB) ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat) VALUES
('P9962828', 'PKBM ARUM INDAH', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Kidul, Kec. Tegal Selatan, Kota Tegal'),
('P9959947', 'PKBM BINA HARAPAN', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('P9908267', 'PKBM BUDI LUHUR', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('P9959971', 'PKBM CITRA MANDIRI', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('P9959949', 'PKBM KI HAJAR DEWANTARA', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('P9908268', 'PKBM MAJU BERSAMA', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('P9970191', 'PKBM MEKAR', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('P9959948', 'PKBM MUTIARA SHAHABAT', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('P9970024', 'PKBM SAKILA KERTI', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('P2970158', 'PKBM SARANA MAJU', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('P9962931', 'PKBM STAR OF TOMORROW', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mangkukusuman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
('P2971356', 'PKBM TRANSISI ANILO', 'KESETARAAN', 'PKBM',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('P9959977', 'UPTD SPNF SANGGAR KEGIATAN BELAJAR KOTA TEGAL', 'KESETARAAN', 'SKB',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- TAMAN KANAK-KANAK (TK) ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat) VALUES
('20351620', 'TK AISYIYAH BA IX', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20359984', 'TK AISYIYAH BUSTANUL ATHFAL I', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mangkukusuman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
('20350569', 'TK AISYIYAH BUSTANUL ATHFAL II', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('20351615', 'TK AISYIYAH BUSTANUL ATHFAL III', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20351617', 'TK AISYIYAH BUSTANUL ATHFAL IV', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351616', 'TK AISYIYAH BUSTANUL ATHFAL V', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20351618', 'TK AISYIYAH BUSTANUL ATHFAL VI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351619', 'TK AISYIYAH BUSTANUL ATHFAL VII', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mintaragen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mintaragen, Kec. Tegal Timur, Kota Tegal'),
('20360241', 'TK AISYIYAH BUSTANUL ATHFAL VIII', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('20351676', 'TK AISYIYAH BUSTANUL ATHFAL X', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('20359988', 'TK AISYIYAH BUSTANUL ATHFAL XI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20351621', 'TK AISYIYAH BUSTANUL ATHFAL XII', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20350885', 'TK AISYIYAH BUSTANUL ATHFAL XIII', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Bandung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Bandung, Kec. Tegal Selatan, Kota Tegal'),
('20351635', 'TK AL HIDAYAH 1', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mintaragen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mintaragen, Kec. Tegal Timur, Kota Tegal'),
('20350982', 'TK AL HIDAYAH II', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('20351667', 'TK AL KHAIRIYYAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69969648', 'TK AL KHIDMAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('70027338', 'TK AL QURAN AL HAROMAIN', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kalinyamat Wetan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kalinyamat Wetan, Kec. Tegal Selatan, Kota Tegal'),
('20351661', 'TK AL-IRSYAD AL-ISLAMIYAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('20351669', 'TK ASSYIFA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('20351657', 'TK BAGYA WACANA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('20350986', 'TK BAITURROKHMAN', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('20351631', 'TK CENDRAWASIH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20350983', 'TK DARUNNAJAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Kulon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Kulon, Kec. Tegal Selatan, Kota Tegal'),
('20351658', 'TK ELKANA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69960276', 'TK GLOBAL INBYRA SCHOOL', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kemandungan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kemandungan, Kec. Tegal Barat, Kota Tegal'),
('20351660', 'TK HANG TUAH 16', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('20351656', 'TK IHSANIYAH 1', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mintaragen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mintaragen, Kec. Tegal Timur, Kota Tegal'),
('20351623', 'TK IHSANIYAH III', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('70052713', 'TK ISLAM AL AZHAR 66 KOTA TEGAL', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('20360028', 'TK ISLAM ASH SHOLIHIN', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20360021', 'TK ISLAM AZZUROFAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('20360029', 'TK KARTIKA 111-28', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20350984', 'TK KEMALA BHAYANGKARI 25', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('20362364', 'TK KIDDY CARE', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('20351674', 'TK LITTLE STAR', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('20350565', 'TK MASYITHOH 1', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('20351624', 'TK MASYITHOH II', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20351625', 'TK MASYITHOH III', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Mangkukusuman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Mangkukusuman, Kec. Tegal Timur, Kota Tegal'),
('20351626', 'TK MASYITHOH IV', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20350568', 'TK MASYITHOH V', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tunon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tunon, Kec. Tegal Selatan, Kota Tegal'),
('20351627', 'TK MASYITHOH VI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351682', 'TK MASYITHOH VII', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('20351072', 'TK MASYITHOH VIII', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('70052167', 'TK MUBAROKAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Lor%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Lor, Kec. Margadana, Kota Tegal'),
('20351684', 'TK NEGERI PEMBINA KECAMATAN MARGADANA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Margadana, Kec. Margadana, Kota Tegal'),
('20351671', 'TK NEGERI PEMBINA KOTA TEGAL', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('69966113', 'TK NEGERI PEMBINA TEGAL SELATAN', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Keturen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Keturen, Kec. Tegal Selatan, Kota Tegal'),
('20351677', 'TK NEGERI PEMBINA TEGAL TIMUR', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351670', 'TK NURUL HUDA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Muarareja%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Muarareja, Kec. Tegal Barat, Kota Tegal'),
('70029822', 'TK NURUNNISA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('70060478', 'TK NURUS SUNNAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('20350985', 'TK PELITA HATI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('20351636', 'TK PERMATA IBU', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20351668', 'TK PERSATUAN UMMAT ISLAM (PUI) CABANG TEGAL', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('20350563', 'TK PERTIWI 25.1 RANDUGUNTING', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('20360039', 'TK PERTIWI 25.10 DEBONG TENGAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Debong Tengah%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Debong Tengah, Kec. Tegal Selatan, Kota Tegal'),
('20351683', 'TK PERTIWI 25.12 KALINYAMAT KULON', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kalinyamat Kulon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kalinyamat Kulon, Kec. Margadana, Kota Tegal'),
('20351632', 'TK PERTIWI 25.13 KEJAMBON', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('20360041', 'TK PERTIWI 25.2 KEMANDUNGAN', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kemandungan%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kemandungan, Kec. Tegal Barat, Kota Tegal'),
('20351634', 'TK PERTIWI 25.3 SLEROK', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Slerok%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Slerok, Kec. Tegal Timur, Kota Tegal'),
('20351663', 'TK PERTIWI 25.4 TEGALSARI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('20351662', 'TK PERTIWI 25.5 KRATON', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('20351629', 'TK PERTIWI 25.6 PANGGUNG', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351664', 'TK PERTIWI 25.7 PEKAUMAN', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'),
('20351659', 'TK PERTIWI 25.8 PESURUNGAN KIDUL', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pesurungan Kidul%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Pesurungan Kidul, Kec. Tegal Barat, Kota Tegal'),
('20348592', 'TK PERTIWI 25.9 BANDUNG', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Bandung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Bandung, Kec. Tegal Selatan, Kota Tegal'),
('20351633', 'TK PGRI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351655', 'TK PIUS', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kraton%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kraton, Kec. Tegal Barat, Kota Tegal'),
('69969650', 'TK PRIMAGAMA ISLAMI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69818060', 'TK SHINING LITTLE STAR', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('70061973', 'TK SYIARUL ISLAM', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'),
('20351681', 'TK TARBIYATUL ISLAMIYAH', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Sumurpanggang%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Sumurpanggang, Kec. Margadana, Kota Tegal'),
('20351672', 'TK TUNAS HIDUP HARAPAN KITA', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal'),
('20351665', 'TK TUT WURI', 'PAUD', 'TK',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegalsari%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Tegalsari, Kec. Tegal Barat, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- --- TEMPAT PENITIPAN ANAK (TPA) ---
INSERT INTO public.kanal_sekolah (npsn, nama, jenjang, tingkat, kelurahan_id, kecamatan_id, alamat) VALUES
('69818075', 'TPA AISYIYAH KEJAMBON', 'PAUD', 'TPA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69973493', 'TPA ANANDA MANDIRI', 'PAUD', 'TPA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Kejambon%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Kejambon, Kec. Tegal Timur, Kota Tegal'),
('69965296', 'TPA BIAS ASSALAM', 'PAUD', 'TPA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Randugunting%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Randugunting, Kec. Tegal Selatan, Kota Tegal'),
('69966219', 'TPA USAMAH', 'PAUD', 'TPA',
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
    (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
    'Kel. Panggung, Kec. Tegal Timur, Kota Tegal')
ON CONFLICT (npsn) DO UPDATE SET
    nama = EXCLUDED.nama,
    nama_sekolah = EXCLUDED.nama,
    jenjang = EXCLUDED.jenjang,
    tingkat = EXCLUDED.tingkat,
    kelurahan_id = COALESCE(EXCLUDED.kelurahan_id, kanal_sekolah.kelurahan_id),
    kecamatan_id = COALESCE(EXCLUDED.kecamatan_id, kanal_sekolah.kecamatan_id),
    alamat = EXCLUDED.alamat,
    updated_at = now();

-- 5. Sinkronisasi nama dan pembaruan relasi wilayah bagi data yang sudah ada sebelumnya
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'kanal_sekolah' AND column_name = 'nama_sekolah'
    ) THEN
        UPDATE public.kanal_sekolah SET nama_sekolah = nama WHERE nama_sekolah IS NULL AND nama IS NOT NULL;
        UPDATE public.kanal_sekolah SET nama = nama_sekolah WHERE nama IS NULL AND nama_sekolah IS NOT NULL;
    END IF;

    -- Pastikan relasi wilayah dan alamat terisi lengkap untuk TK Pembina se-Kota Tegal
    UPDATE public.kanal_sekolah ks
    SET 
        kelurahan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Pekauman%' AND tipe::text = 'KELURAHAN' LIMIT 1),
        kecamatan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Barat%' AND tipe::text = 'KECAMATAN' LIMIT 1),
        alamat = 'Kel. Pekauman, Kec. Tegal Barat, Kota Tegal'
    WHERE ks.npsn = '20351671' OR ks.nama ILIKE '%PEMBINA KOTA TEGAL%';

    UPDATE public.kanal_sekolah ks
    SET 
        kelurahan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Panggung%' AND tipe::text = 'KELURAHAN' LIMIT 1),
        kecamatan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Timur%' AND tipe::text = 'KECAMATAN' LIMIT 1),
        alamat = 'Kel. Panggung, Kec. Tegal Timur, Kota Tegal'
    WHERE ks.npsn = '20351677' OR ks.nama ILIKE '%PEMBINA TEGAL TIMUR%';

    UPDATE public.kanal_sekolah ks
    SET 
        kelurahan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Keturen%' AND tipe::text = 'KELURAHAN' LIMIT 1),
        kecamatan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Tegal Selatan%' AND tipe::text = 'KECAMATAN' LIMIT 1),
        alamat = 'Kel. Keturen, Kec. Tegal Selatan, Kota Tegal'
    WHERE ks.npsn = '69966113' OR ks.nama ILIKE '%PEMBINA TEGAL SELATAN%';

    UPDATE public.kanal_sekolah ks
    SET 
        kelurahan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KELURAHAN' LIMIT 1),
        kecamatan_id = (SELECT id FROM public.wilayah WHERE nama ILIKE '%Margadana%' AND tipe::text = 'KECAMATAN' LIMIT 1),
        alamat = 'Kel. Margadana, Kec. Margadana, Kota Tegal'
    WHERE ks.npsn = '20351684' OR ks.nama ILIKE '%PEMBINA KECAMATAN MARGADANA%' OR ks.nama ILIKE '%PEMBINA MARGADANA%';
END $$;

-- ==============================================================================
-- 6. VERIFIKASI JUMLAH DATA TERDAFTAR PER JENIS SATUAN PAUD & PNF
-- ==============================================================================
SELECT 
    ks.jenjang,
    ks.tingkat,
    COUNT(ks.id) AS total_lembaga
FROM public.kanal_sekolah ks
WHERE ks.jenjang IN ('PAUD', 'KESETARAAN')
GROUP BY ks.jenjang, ks.tingkat
ORDER BY ks.jenjang, ks.tingkat;

