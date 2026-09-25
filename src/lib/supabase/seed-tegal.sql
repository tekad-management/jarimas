-- ==============================================================================
-- SKEMA & SEEDING DATA MASTER RESMI KOTA TEGAL (33.76)
-- Wilayah (1 Kota, 4 Kecamatan, 27 Kelurahan), Posyandu, Sekolah & Data Warga
-- ==============================================================================

-- 1. TABEL STRUKTUR
CREATE TABLE IF NOT EXISTS public.wilayah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    tingkat VARCHAR(20) NOT NULL CHECK (tingkat IN ('KOTA', 'KECAMATAN', 'KELURAHAN', 'RW', 'RT')),
    parent_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kanal_posyandu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    kelurahan_id UUID NOT NULL REFERENCES public.wilayah(id) ON DELETE CASCADE,
    alamat TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kanal_sekolah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    tingkat VARCHAR(20) NOT NULL, -- PAUD, TK, RA, SD, SMP, SMA, SMK
    kelurahan_id UUID NOT NULL REFERENCES public.wilayah(id) ON DELETE CASCADE,
    alamat TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_warga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_anak VARCHAR(150) NOT NULL,
    tempat_tanggal_lahir VARCHAR(150) NOT NULL,
    jenis_kelamin VARCHAR(5) NOT NULL DEFAULT 'L',
    nama_wali VARCHAR(150) NOT NULL,
    status_tinggal VARCHAR(50) NOT NULL DEFAULT 'Penduduk Tetap',
    rt_wilayah_id VARCHAR(50) NOT NULL,
    sekolah_id UUID REFERENCES public.kanal_sekolah(id) ON DELETE SET NULL,
    posyandu_id UUID REFERENCES public.kanal_posyandu(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.wilayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanal_posyandu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanal_sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_warga ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wilayah' AND policyname = 'Public read wilayah') THEN
        CREATE POLICY "Public read wilayah" ON public.wilayah FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kanal_posyandu' AND policyname = 'Public read kanal_posyandu') THEN
        CREATE POLICY "Public read kanal_posyandu" ON public.kanal_posyandu FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kanal_sekolah' AND policyname = 'Public read kanal_sekolah') THEN
        CREATE POLICY "Public read kanal_sekolah" ON public.kanal_sekolah FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_warga' AND policyname = 'Public read data_warga') THEN
        CREATE POLICY "Public read data_warga" ON public.data_warga FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_warga' AND policyname = 'Public insert data_warga') THEN
        CREATE POLICY "Public insert data_warga" ON public.data_warga FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 3. PUBLIKASI SUPABASE REALTIME
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'data_warga'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.data_warga;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 4. SEEDING DATA RESMI KOTA TEGAL (1 KOTA, 4 KECAMATAN, 27 KELURAHAN, POSYANDU, SEKOLAH)
-- ==============================================================================
DO $$
DECLARE
    v_kota_id UUID;
    v_kec_tb_id UUID; -- Tegal Barat
    v_kec_tt_id UUID; -- Tegal Timur
    v_kec_ts_id UUID; -- Tegal Selatan
    v_kec_mg_id UUID; -- Margadana

    -- Record helper
    r RECORD;
    v_kel_id UUID;
BEGIN
    -- -------------------------------------------------------------
    -- A. KOTA TEGAL (KODE KEMENDAGRI: 33.76)
    -- -------------------------------------------------------------
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id)
    VALUES ('33.76', 'Kota Tegal', 'KOTA', NULL)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat
    RETURNING id INTO v_kota_id;

    -- -------------------------------------------------------------
    -- B. 4 KECAMATAN DI KOTA TEGAL
    -- -------------------------------------------------------------
    -- 1. Tegal Barat (33.76.01)
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id)
    VALUES ('33.76.01', 'Tegal Barat', 'KECAMATAN', v_kota_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = v_kota_id
    RETURNING id INTO v_kec_tb_id;

    -- 2. Tegal Timur (33.76.02)
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id)
    VALUES ('33.76.02', 'Tegal Timur', 'KECAMATAN', v_kota_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = v_kota_id
    RETURNING id INTO v_kec_tt_id;

    -- 3. Tegal Selatan (33.76.03)
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id)
    VALUES ('33.76.03', 'Tegal Selatan', 'KECAMATAN', v_kota_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = v_kota_id
    RETURNING id INTO v_kec_ts_id;

    -- 4. Margadana (33.76.04)
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id)
    VALUES ('33.76.04', 'Margadana', 'KECAMATAN', v_kota_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = v_kota_id
    RETURNING id INTO v_kec_mg_id;

    -- -------------------------------------------------------------
    -- C. 27 KELURAHAN RESMI KOTA TEGAL
    -- -------------------------------------------------------------
    
    -- --- KECAMATAN TEGAL BARAT (7 Kelurahan) ---
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id) VALUES
    ('33.76.01.1001', 'Tegalsari', 'KELURAHAN', v_kec_tb_id),
    ('33.76.01.1002', 'Kraton', 'KELURAHAN', v_kec_tb_id),
    ('33.76.01.1003', 'Kemandungan', 'KELURAHAN', v_kec_tb_id),
    ('33.76.01.1004', 'Debong Lor', 'KELURAHAN', v_kec_tb_id),
    ('33.76.01.1005', 'Muarareja', 'KELURAHAN', v_kec_tb_id),
    ('33.76.01.1006', 'Pekauman', 'KELURAHAN', v_kec_tb_id),
    ('33.76.01.1007', 'Pesurungan Kidul', 'KELURAHAN', v_kec_tb_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = EXCLUDED.parent_id;

    -- --- KECAMATAN TEGAL TIMUR (5 Kelurahan) ---
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id) VALUES
    ('33.76.02.1001', 'Mintaragen', 'KELURAHAN', v_kec_tt_id),
    ('33.76.02.1002', 'Panggung', 'KELURAHAN', v_kec_tt_id),
    ('33.76.02.1003', 'Mangkukusuman', 'KELURAHAN', v_kec_tt_id),
    ('33.76.02.1004', 'Kejambon', 'KELURAHAN', v_kec_tt_id),
    ('33.76.02.1005', 'Slerok', 'KELURAHAN', v_kec_tt_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = EXCLUDED.parent_id;

    -- --- KECAMATAN TEGAL SELATAN (8 Kelurahan) ---
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id) VALUES
    ('33.76.03.1001', 'Randugunting', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1002', 'Debong Kulon', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1003', 'Debong Tengah', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1004', 'Debong Kidul', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1005', 'Tunon', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1006', 'Kalinyamat Wetan', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1007', 'Keturen', 'KELURAHAN', v_kec_ts_id),
    ('33.76.03.1008', 'Bandung', 'KELURAHAN', v_kec_ts_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = EXCLUDED.parent_id;

    -- --- KECAMATAN MARGADANA (7 Kelurahan) ---
    INSERT INTO public.wilayah (kode, nama, tingkat, parent_id) VALUES
    ('33.76.04.1001', 'Margadana', 'KELURAHAN', v_kec_mg_id),
    ('33.76.04.1002', 'Cabawan', 'KELURAHAN', v_kec_mg_id),
    ('33.76.04.1003', 'Kaligangsa', 'KELURAHAN', v_kec_mg_id),
    ('33.76.04.1004', 'Kalinyamat Kulon', 'KELURAHAN', v_kec_mg_id),
    ('33.76.04.1005', 'Krandon', 'KELURAHAN', v_kec_mg_id),
    ('33.76.04.1006', 'Pesurungan Lor', 'KELURAHAN', v_kec_mg_id),
    ('33.76.04.1007', 'Sumurpanggang', 'KELURAHAN', v_kec_mg_id)
    ON CONFLICT (kode) DO UPDATE 
    SET nama = EXCLUDED.nama, tingkat = EXCLUDED.tingkat, parent_id = EXCLUDED.parent_id;

    -- -------------------------------------------------------------
    -- D. DATA KANAL POSYANDU (Dihubungkan dengan Kelurahan_id secara Dinamis)
    -- -------------------------------------------------------------
    
    -- 1. Mintaragen
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1001';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Melati I (Mintaragen)', v_kel_id, 'Jl. Mataram RW 01, Mintaragen'),
    ('Posyandu Melati II (Mintaragen)', v_kel_id, 'Jl. Serayu RW 04, Mintaragen'),
    ('Posyandu Melati III (Mintaragen)', v_kel_id, 'Jl. Pemuda RW 07, Mintaragen');

    -- 2. Panggung
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1002';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Kenanga I (Panggung)', v_kel_id, 'Jl. Kolonel Sugiono RW 02, Panggung'),
    ('Posyandu Kenanga II (Panggung)', v_kel_id, 'Jl. KH. Mansyur RW 05, Panggung');

    -- 3. Mangkukusuman
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1003';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Bougenville (Mangkukusuman)', v_kel_id, 'Jl. Jenderal Sudirman RW 02, Mangkukusuman'),
    ('Posyandu Teratai (Mangkukusuman)', v_kel_id, 'Jl. Kartini RW 04, Mangkukusuman');

    -- 4. Kejambon
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1004';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Dahlia I (Kejambon)', v_kel_id, 'Jl. Sultan Agung RW 03, Kejambon'),
    ('Posyandu Dahlia II (Kejambon)', v_kel_id, 'Jl. AR Hakim RW 06, Kejambon');

    -- 5. Slerok
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1005';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Mawar I (Slerok)', v_kel_id, 'Jl. Werkudoro RW 02, Slerok'),
    ('Posyandu Mawar II (Slerok)', v_kel_id, 'Jl. Arjuna RW 05, Slerok');

    -- 6. Tegalsari
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1001';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Bahari I (Tegalsari)', v_kel_id, 'Jl. Hang Tuah RW 03, Tegalsari'),
    ('Posyandu Bahari II (Tegalsari)', v_kel_id, 'Jl. Samudera RW 06, Tegalsari');

    -- 7. Kraton
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1002';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Cempaka (Kraton)', v_kel_id, 'Jl. Sawo RW 02, Kraton'),
    ('Posyandu Flamboyan (Kraton)', v_kel_id, 'Jl. Rambutan RW 04, Kraton');

    -- 8. Kemandungan
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1003';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Asri I (Kemandungan)', v_kel_id, 'Jl. Kemandungan RW 01'),
    ('Posyandu Asri II (Kemandungan)', v_kel_id, 'Jl. Kemandungan RW 03');

    -- 9. Debong Lor
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1004';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Tunas Harapan (Debong Lor)', v_kel_id, 'Jl. Debong Lor RW 02');

    -- 10. Muarareja
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1005';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Muara Sejahtera (Muarareja)', v_kel_id, 'Jl. Muarareja RW 01');

    -- 11. Pekauman
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1006';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Anggrek Putih (Pekauman)', v_kel_id, 'Jl. Pekauman RW 03');

    -- 12. Pesurungan Kidul
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1007';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Kamboja (Pesurungan Kidul)', v_kel_id, 'Jl. Pesurungan Kidul RW 02');

    -- 13. Randugunting
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1001';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Nusa Indah I (Randugunting)', v_kel_id, 'Jl. KS Tubun RW 03, Randugunting'),
    ('Posyandu Nusa Indah II (Randugunting)', v_kel_id, 'Jl. Merpati RW 06, Randugunting');

    -- 14. Debong Kulon
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1002';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Sejahtera (Debong Kulon)', v_kel_id, 'Jl. Debong Kulon RW 02');

    -- 15. Debong Tengah
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1003';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Kasih Ibu (Debong Tengah)', v_kel_id, 'Jl. Debong Tengah RW 03');

    -- 16. Debong Kidul
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1004';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Mekar Wangi (Debong Kidul)', v_kel_id, 'Jl. Debong Kidul RW 02');

    -- 17. Tunon
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1005';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Harapan Bunda (Tunon)', v_kel_id, 'Jl. Ki Hajar Dewantara RW 01, Tunon');

    -- 18. Kalinyamat Wetan
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1006';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Lestari (Kalinyamat Wetan)', v_kel_id, 'Jl. Kalinyamat RW 02');

    -- 19. Keturen
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1007';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Srikandi (Keturen)', v_kel_id, 'Jl. Keturen RW 02');

    -- 20. Bandung
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1008';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Anggrek Mulia (Bandung)', v_kel_id, 'Jl. Bandung Raya RW 02');

    -- 21. Margadana
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1001';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Teratai Indah (Margadana)', v_kel_id, 'Jl. Raya Margadana RW 02'),
    ('Posyandu Ceria (Margadana)', v_kel_id, 'Jl. Belimbing RW 05');

    -- 22. Cabawan
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1002';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Tunas Mandiri (Cabawan)', v_kel_id, 'Jl. Cabawan RW 01');

    -- 23. Kaligangsa
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1003';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Muara Kasih (Kaligangsa)', v_kel_id, 'Jl. Raya Kaligangsa RW 02');

    -- 24. Kalinyamat Kulon
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1004';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Kartini (Kalinyamat Kulon)', v_kel_id, 'Jl. Kalinyamat Kulon RW 03');

    -- 25. Krandon
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1005';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Wijaya Kusuma (Krandon)', v_kel_id, 'Jl. Krandon RW 02');

    -- 26. Pesurungan Lor
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1006';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Melati Sehat (Pesurungan Lor)', v_kel_id, 'Jl. Pesurungan Lor RW 03');

    -- 27. Sumurpanggang
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1007';
    INSERT INTO public.kanal_posyandu (nama, kelurahan_id, alamat) VALUES
    ('Posyandu Sumur Sejahtera (Sumurpanggang)', v_kel_id, 'Jl. Ki Ageng Tirtayasa RW 02, Sumurpanggang'),
    ('Posyandu Melati Asri (Sumurpanggang)', v_kel_id, 'Jl. Cipto Mangunkusumo RW 04, Sumurpanggang');

    -- -------------------------------------------------------------
    -- E. DATA KANAL SEKOLAH (PAUD, TK, RA, SD, SMP, SMA) Dihubungkan secara Dinamis
    -- -------------------------------------------------------------
    
    -- Sekolah di Mintaragen (Tegal Timur)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1001';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('PAUD & TK Pertiwi Mintaragen', 'TK', v_kel_id, 'Jl. Mataram No. 12, Mintaragen'),
    ('SD Negeri Mintaragen 1', 'SD', v_kel_id, 'Jl. Mataram No. 14, Mintaragen'),
    ('SD Negeri Mintaragen 3', 'SD', v_kel_id, 'Jl. Serayu No. 8, Mintaragen'),
    ('SMP Negeri 1 Kota Tegal', 'SMP', v_kel_id, 'Jl. Tentara Pelajar No. 32, Mintaragen'),
    ('SMA Negeri 1 Kota Tegal', 'SMA', v_kel_id, 'Jl. Menteri Supeno No. 16, Mintaragen');

    -- Sekolah di Panggung (Tegal Timur)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1002';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Kemala Bhayangkari Tegal', 'TK', v_kel_id, 'Jl. Kolonel Sugiono No. 20, Panggung'),
    ('SD Negeri Panggung 3', 'SD', v_kel_id, 'Jl. KH. Mansyur No. 15, Panggung'),
    ('SD Negeri Panggung 5', 'SD', v_kel_id, 'Jl. Panggung Baru No. 10, Panggung'),
    ('SMP Negeri 6 Kota Tegal', 'SMP', v_kel_id, 'Jl. KH. Mansyur No. 25, Panggung');

    -- Sekolah di Mangkukusuman (Tegal Timur)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1003';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Aisyiyah Bustanul Athfal 1', 'TK', v_kel_id, 'Jl. Kartini No. 4, Mangkukusuman'),
    ('SD Negeri Mangkukusuman 1', 'SD', v_kel_id, 'Jl. Alun-Alun No. 2, Mangkukusuman'),
    ('SMP Negeri 3 Kota Tegal', 'SMP', v_kel_id, 'Jl. Jenderal Sudirman No. 18, Mangkukusuman');

    -- Sekolah di Kejambon (Tegal Timur)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1004';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('RA Al-Hidayah Kejambon', 'RA', v_kel_id, 'Jl. Sultan Agung No. 50, Kejambon'),
    ('SD Negeri Kejambon 1', 'SD', v_kel_id, 'Jl. AR Hakim No. 11, Kejambon'),
    ('SD Negeri Kejambon 2', 'SD', v_kel_id, 'Jl. Sultan Agung No. 22, Kejambon'),
    ('SMP Negeri 8 Kota Tegal', 'SMP', v_kel_id, 'Jl. Sultan Agung No. 30, Kejambon');

    -- Sekolah di Slerok (Tegal Timur)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.02.1005';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('PAUD Melati Slerok', 'PAUD', v_kel_id, 'Jl. Werkudoro No. 8, Slerok'),
    ('SD Negeri Slerok 2', 'SD', v_kel_id, 'Jl. Arjuna No. 14, Slerok'),
    ('SD Negeri Slerok 4', 'SD', v_kel_id, 'Jl. Werkudoro No. 45, Slerok'),
    ('SMP Negeri 10 Kota Tegal', 'SMP', v_kel_id, 'Jl. Werkudoro No. 70, Slerok');

    -- Sekolah di Tegalsari (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1001';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Bahari Mandiri', 'TK', v_kel_id, 'Jl. Hang Tuah No. 5, Tegalsari'),
    ('SD Negeri Tegalsari 1', 'SD', v_kel_id, 'Jl. Samudera No. 12, Tegalsari'),
    ('SMP Negeri 7 Kota Tegal', 'SMP', v_kel_id, 'Jl. Hang Tuah No. 30, Tegalsari');

    -- Sekolah di Kraton (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1002';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK ABA Kraton', 'TK', v_kel_id, 'Jl. Sawo No. 15, Kraton'),
    ('SD Negeri Kraton 1', 'SD', v_kel_id, 'Jl. Rambutan No. 10, Kraton'),
    ('SD Negeri Kraton 3', 'SD', v_kel_id, 'Jl. Sawo No. 28, Kraton'),
    ('SMP Negeri 2 Kota Tegal', 'SMP', v_kel_id, 'Jl. Sawo No. 40, Kraton');

    -- Sekolah di Kemandungan (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1003';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('PAUD Ceria Kemandungan', 'PAUD', v_kel_id, 'Jl. Kemandungan No. 7'),
    ('SD Negeri Kemandungan 1', 'SD', v_kel_id, 'Jl. Kemandungan No. 12');

    -- Sekolah di Debong Lor (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1004';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Debong Lor 1', 'SD', v_kel_id, 'Jl. Debong Lor No. 3');

    -- Sekolah di Muarareja (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1005';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Muarareja 1', 'SD', v_kel_id, 'Jl. Pantai Muarareja No. 18'),
    ('SMP Negeri 13 Kota Tegal', 'SMP', v_kel_id, 'Jl. Muarareja Raya No. 4');

    -- Sekolah di Pekauman (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1006';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Muslimat Pekauman', 'TK', v_kel_id, 'Jl. Pekauman No. 2'),
    ('SD Negeri Pekauman 1', 'SD', v_kel_id, 'Jl. Pekauman No. 8');

    -- Sekolah di Pesurungan Kidul (Tegal Barat)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.01.1007';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Pesurungan Kidul 1', 'SD', v_kel_id, 'Jl. Pesurungan Kidul No. 15'),
    ('SMK Negeri 1 Kota Tegal', 'SMK', v_kel_id, 'Jl. Pesurungan Kidul No. 30');

    -- Sekolah di Randugunting (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1001';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('PAUD Kasih Bunda Randugunting', 'PAUD', v_kel_id, 'Jl. KS Tubun No. 8, Randugunting'),
    ('SD Negeri Randugunting 1', 'SD', v_kel_id, 'Jl. Merpati No. 10, Randugunting'),
    ('SD Negeri Randugunting 6', 'SD', v_kel_id, 'Jl. KS Tubun No. 25, Randugunting'),
    ('SMP Negeri 5 Kota Tegal', 'SMP', v_kel_id, 'Jl. Merpati No. 35, Randugunting');

    -- Sekolah di Debong Kulon (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1002';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Debong Kulon 1', 'SD', v_kel_id, 'Jl. Debong Kulon No. 9');

    -- Sekolah di Debong Tengah (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1003';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Aisyiyah Debong Tengah', 'TK', v_kel_id, 'Jl. Debong Tengah No. 4'),
    ('SD Negeri Debong Tengah 1', 'SD', v_kel_id, 'Jl. Debong Tengah No. 14');

    -- Sekolah di Debong Kidul (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1004';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Debong Kidul 1', 'SD', v_kel_id, 'Jl. Debong Kidul No. 11');

    -- Sekolah di Tunon (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1005';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Pertiwi Tunon', 'TK', v_kel_id, 'Jl. Ki Hajar Dewantara No. 10, Tunon'),
    ('SD Negeri Tunon 1', 'SD', v_kel_id, 'Jl. Ki Hajar Dewantara No. 18, Tunon');

    -- Sekolah di Kalinyamat Wetan (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1006';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Kalinyamat Wetan 1', 'SD', v_kel_id, 'Jl. Kalinyamat No. 20'),
    ('SMP Negeri 14 Kota Tegal', 'SMP', v_kel_id, 'Jl. Kalinyamat Raya No. 45');

    -- Sekolah di Keturen (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1007';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Keturen 1', 'SD', v_kel_id, 'Jl. Keturen Raya No. 6');

    -- Sekolah di Bandung (Tegal Selatan)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.03.1008';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('PAUD Tunas Harapan Bandung', 'PAUD', v_kel_id, 'Jl. Bandung Raya No. 5'),
    ('SD Negeri Bandung 1', 'SD', v_kel_id, 'Jl. Bandung Raya No. 12');

    -- Sekolah di Margadana (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1001';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Pertiwi Margadana', 'TK', v_kel_id, 'Jl. Raya Margadana No. 20'),
    ('SD Negeri Margadana 1', 'SD', v_kel_id, 'Jl. Belimbing No. 4, Margadana'),
    ('SMP Negeri 12 Kota Tegal', 'SMP', v_kel_id, 'Jl. Raya Margadana No. 80');

    -- Sekolah di Cabawan (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1002';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Cabawan 1', 'SD', v_kel_id, 'Jl. Raya Cabawan No. 7');

    -- Sekolah di Kaligangsa (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1003';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Diponegoro Kaligangsa', 'TK', v_kel_id, 'Jl. Raya Kaligangsa No. 15'),
    ('SD Negeri Kaligangsa 1', 'SD', v_kel_id, 'Jl. Raya Kaligangsa No. 32');

    -- Sekolah di Kalinyamat Kulon (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1004';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Kalinyamat Kulon 1', 'SD', v_kel_id, 'Jl. Kalinyamat Kulon No. 14');

    -- Sekolah di Krandon (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1005';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Krandon 1', 'SD', v_kel_id, 'Jl. Krandon Raya No. 10');

    -- Sekolah di Pesurungan Lor (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1006';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('SD Negeri Pesurungan Lor 1', 'SD', v_kel_id, 'Jl. Pesurungan Lor No. 22');

    -- Sekolah di Sumurpanggang (Margadana)
    SELECT id INTO v_kel_id FROM public.wilayah WHERE kode = '33.76.04.1007';
    INSERT INTO public.kanal_sekolah (nama, tingkat, kelurahan_id, alamat) VALUES
    ('TK Kemala Sumurpanggang', 'TK', v_kel_id, 'Jl. Ki Ageng Tirtayasa No. 10'),
    ('SD Negeri Sumurpanggang 1', 'SD', v_kel_id, 'Jl. Ki Ageng Tirtayasa No. 25'),
    ('SD Negeri Sumurpanggang 3', 'SD', v_kel_id, 'Jl. Cipto Mangunkusumo No. 5'),
    ('SMA Negeri 4 Kota Tegal', 'SMA', v_kel_id, 'Jl. Cipto Mangunkusumo No. 18, Sumurpanggang');

    RAISE NOTICE 'Seeding Master Wilayah, Posyandu, dan Sekolah Kota Tegal BERHASIL!';
END $$;
