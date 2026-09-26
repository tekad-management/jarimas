-- ==============================================================================
-- SCRIPT SEEDING DATA RESMI LENGKAP KANAL POSYANDU SE-KOTA TEGAL (27 KELURAHAN)
-- File: src/lib/supabase/seed-posyandu-lengkap.sql
-- ==============================================================================

-- 1. Pastikan kolom pendukung tersedia di tabel public.kanal_posyandu
ALTER TABLE IF EXISTS public.kanal_posyandu 
    ADD COLUMN IF NOT EXISTS kecamatan_id UUID REFERENCES public.wilayah(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.kanal_posyandu 
    ADD COLUMN IF NOT EXISTS nama_posyandu VARCHAR(150);

-- 2. Pastikan ada unique constraint untuk mencegah duplikasi (ON CONFLICT DO NOTHING)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_kanal_posyandu_kelurahan_nama'
    ) THEN
        ALTER TABLE public.kanal_posyandu 
            ADD CONSTRAINT uq_kanal_posyandu_kelurahan_nama UNIQUE (kelurahan_id, nama);
    END IF;
END $$;

-- 3. BLOK DO PL/PGSQL SEEDING DINAMIS
DO $$
DECLARE
    v_item RECORD;
    v_kel_id UUID;
    v_kec_id UUID;
    v_total_inserted INT := 0;
BEGIN
    -- Tabel penampung sementara (Temporary Table)
    CREATE TEMP TABLE IF NOT EXISTS tmp_posyandu_master (
        nama_kelurahan VARCHAR(100) NOT NULL,
        nama_posyandu VARCHAR(150) NOT NULL,
        alamat_keterangan TEXT
    ) ON COMMIT DROP;

    TRUNCATE TABLE tmp_posyandu_master;

    -- ==========================================================================
    -- A. KECAMATAN TEGAL TIMUR (5 Kelurahan)
    -- ==========================================================================
    
    -- 1. Kejambon
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Kejambon', 'Posyandu Kamboja 1', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Kamboja 2', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Kemuning 1', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Kemuning 2', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Teratai Merah', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Tanjungsari', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Mawar Melati', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Seruni', 'Kelurahan Kejambon, Kec. Tegal Timur'),
    ('Kejambon', 'Posyandu Arimbi', 'Kelurahan Kejambon, Kec. Tegal Timur');

    -- 2. Slerok
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Slerok', 'Posyandu Srikandi', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Arjuna 1', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Arjuna 2', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Werkudoro 1', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Werkudoro 2', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Nakula 1', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Nakula 2', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Abimanyu', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Subali', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Sukosrono', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Bima 1', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Bima 2', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Sumbodro 1', 'Kelurahan Slerok, Kec. Tegal Timur'),
    ('Slerok', 'Posyandu Sumbodro 2', 'Kelurahan Slerok, Kec. Tegal Timur');

    -- 3. Panggung
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Panggung', 'Posyandu Dahlia', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Anyelir', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Jaya Abadi', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Harapan', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Mekarsari', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Anggrek 1', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Anggrek 2', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Bahtera Serayu', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Nusa Indah 1', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Nusa Indah 2', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Kuntum Melati', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Dewi Shinta', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Seruni', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Bahtera A', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Bahtera B', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Melati', 'Kelurahan Panggung, Kec. Tegal Timur'),
    ('Panggung', 'Posyandu Tulip', 'Kelurahan Panggung, Kec. Tegal Timur');

    -- 4. Mintaragen
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Mintaragen', 'Posyandu Anyelir', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Teratai', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Melati', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Kenanga', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Bougenville', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Flamboyan', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Anggrek', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Sedap Malam', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Seruni', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Nusa Indah 1', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Nusa Indah 2', 'Kelurahan Mintaragen, Kec. Tegal Timur'),
    ('Mintaragen', 'Posyandu Mawar', 'Kelurahan Mintaragen, Kec. Tegal Timur');

    -- 5. Mangkukusuman
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Mangkukusuman', 'Posyandu Fatmawati', 'Kelurahan Mangkukusuman, Kec. Tegal Timur'),
    ('Mangkukusuman', 'Posyandu Kartini', 'Kelurahan Mangkukusuman, Kec. Tegal Timur'),
    ('Mangkukusuman', 'Posyandu Cempaka', 'Kelurahan Mangkukusuman, Kec. Tegal Timur'),
    ('Mangkukusuman', 'Posyandu Kenanga', 'Kelurahan Mangkukusuman, Kec. Tegal Timur'),
    ('Mangkukusuman', 'Posyandu Melati', 'Kelurahan Mangkukusuman, Kec. Tegal Timur');

    -- ==========================================================================
    -- B. KECAMATAN TEGAL BARAT (7 Kelurahan)
    -- ==========================================================================
    
    -- 1. Pekauman
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Pekauman', 'Posyandu Tunas', 'Kelurahan Pekauman, Kec. Tegal Barat'),
    ('Pekauman', 'Posyandu Duku', 'Kelurahan Pekauman, Kec. Tegal Barat'),
    ('Pekauman', 'Posyandu Garuda', 'Kelurahan Pekauman, Kec. Tegal Barat'),
    ('Pekauman', 'Posyandu Belimbing', 'Kelurahan Pekauman, Kec. Tegal Barat'),
    ('Pekauman', 'Posyandu Jalak', 'Kelurahan Pekauman, Kec. Tegal Barat'),
    ('Pekauman', 'Posyandu Nanas', 'Kelurahan Pekauman, Kec. Tegal Barat'),
    ('Pekauman', 'Posyandu Delima', 'Kelurahan Pekauman, Kec. Tegal Barat');

    -- 2. Pesurungan Kidul
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Pesurungan Kidul', 'Posyandu Melati 1', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat'),
    ('Pesurungan Kidul', 'Posyandu Melati 2', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat'),
    ('Pesurungan Kidul', 'Posyandu Melati 3', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat'),
    ('Pesurungan Kidul', 'Posyandu Melati 4', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat'),
    ('Pesurungan Kidul', 'Posyandu Melati 5', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat'),
    ('Pesurungan Kidul', 'Posyandu Melati 6', 'Kelurahan Pesurungan Kidul, Kec. Tegal Barat');

    -- 3. Kemandungan
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Kemandungan', 'Posyandu Cempaka', 'Kelurahan Kemandungan, Kec. Tegal Barat'),
    ('Kemandungan', 'Posyandu Melati', 'Kelurahan Kemandungan, Kec. Tegal Barat'),
    ('Kemandungan', 'Posyandu Seruni', 'Kelurahan Kemandungan, Kec. Tegal Barat');

    -- 4. Kraton
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Kraton', 'Posyandu Mawar A', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Mawar B', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Astika B', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Astika C', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Sekar Indah A', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Sekar Indah B', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Mayangsari', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Dewi Sartika', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Seruni', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Kartini A', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Kartini B', 'Kelurahan Kraton, Kec. Tegal Barat'),
    ('Kraton', 'Posyandu Nusa Indah', 'Kelurahan Kraton, Kec. Tegal Barat');

    -- 5. Muarareja
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Muarareja', 'Posyandu Mawar A', 'Kelurahan Muarareja, Kec. Tegal Barat'),
    ('Muarareja', 'Posyandu Dahlia', 'Kelurahan Muarareja, Kec. Tegal Barat'),
    ('Muarareja', 'Posyandu Cempaka', 'Kelurahan Muarareja, Kec. Tegal Barat'),
    ('Muarareja', 'Posyandu Kemuning', 'Kelurahan Muarareja, Kec. Tegal Barat'),
    ('Muarareja', 'Posyandu Nusa Indah', 'Kelurahan Muarareja, Kec. Tegal Barat'),
    ('Muarareja', 'Posyandu Anggrek', 'Kelurahan Muarareja, Kec. Tegal Barat'),
    ('Muarareja', 'Posyandu Melati', 'Kelurahan Muarareja, Kec. Tegal Barat');

    -- 6. Debong Lor
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Debong Lor', 'Posyandu Seruni 1', 'Kelurahan Debong Lor, Kec. Tegal Barat'),
    ('Debong Lor', 'Posyandu Seruni 2', 'Kelurahan Debong Lor, Kec. Tegal Barat'),
    ('Debong Lor', 'Posyandu Sartika', 'Kelurahan Debong Lor, Kec. Tegal Barat'),
    ('Debong Lor', 'Posyandu Mawar', 'Kelurahan Debong Lor, Kec. Tegal Barat');

    -- 7. Tegalsari
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Tegalsari', 'Posyandu Tunas Bahari', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Mina Bahari', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Minasari', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Melatisari A', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Melatisari B', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Sejahtera 1', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Sejahtera 2', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Mawar Merah', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Bougenville', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Kamboja', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Layangsari A', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Layangsari B', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Anggrek Ungu', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Kenanga A', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Kuncup Mekar', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Wijaya Kusuma A', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Wijaya Kusuma B', 'Kelurahan Tegalsari, Kec. Tegal Barat'),
    ('Tegalsari', 'Posyandu Mekarsari', 'Kelurahan Tegalsari, Kec. Tegal Barat');

    -- ==========================================================================
    -- C. KECAMATAN TEGAL SELATAN (8 Kelurahan)
    -- ==========================================================================
    
    -- 1. Bandung
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Bandung', 'Posyandu Melati I', 'Kelurahan Bandung, Kec. Tegal Selatan'),
    ('Bandung', 'Posyandu Melati II', 'Kelurahan Bandung, Kec. Tegal Selatan'),
    ('Bandung', 'Posyandu Melati III', 'Kelurahan Bandung, Kec. Tegal Selatan'),
    ('Bandung', 'Posyandu Melati IV', 'Kelurahan Bandung, Kec. Tegal Selatan'),
    ('Bandung', 'Posyandu Melati V', 'Kelurahan Bandung, Kec. Tegal Selatan');

    -- 2. Tunon
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Tunon', 'Posyandu Mawar I', 'Kelurahan Tunon, Kec. Tegal Selatan'),
    ('Tunon', 'Posyandu Mawar II', 'Kelurahan Tunon, Kec. Tegal Selatan'),
    ('Tunon', 'Posyandu Mawar III', 'Kelurahan Tunon, Kec. Tegal Selatan'),
    ('Tunon', 'Posyandu Mawar IV', 'Kelurahan Tunon, Kec. Tegal Selatan');

    -- 3. Keturen
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Keturen', 'Posyandu Kemuning I', 'Kelurahan Keturen, Kec. Tegal Selatan'),
    ('Keturen', 'Posyandu Kemuning II', 'Kelurahan Keturen, Kec. Tegal Selatan'),
    ('Keturen', 'Posyandu Kemuning III Utara', 'Kelurahan Keturen, Kec. Tegal Selatan'),
    ('Keturen', 'Posyandu Kemuning III Selatan', 'Kelurahan Keturen, Kec. Tegal Selatan');

    -- 4. Kalinyamat Wetan
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Kalinyamat Wetan', 'Posyandu Dahlia I', 'Kelurahan Kalinyamat Wetan, Kec. Tegal Selatan'),
    ('Kalinyamat Wetan', 'Posyandu Dahlia II', 'Kelurahan Kalinyamat Wetan, Kec. Tegal Selatan'),
    ('Kalinyamat Wetan', 'Posyandu Dahlia III', 'Kelurahan Kalinyamat Wetan, Kec. Tegal Selatan'),
    ('Kalinyamat Wetan', 'Posyandu Dahlia IV', 'Kelurahan Kalinyamat Wetan, Kec. Tegal Selatan');

    -- 5. Randugunting
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Randugunting', 'Posyandu Ketilang', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Nuri', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Rajawali', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Garuda', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Meliwis', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Merpati', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Garuda B', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Puter', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Ababil', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Kasuari', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Cendrawasih', 'Kelurahan Randugunting, Kec. Tegal Selatan'),
    ('Randugunting', 'Posyandu Merak', 'Kelurahan Randugunting, Kec. Tegal Selatan');

    -- 6. Debong Tengah
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Debong Tengah', 'Posyandu Anggrek 1', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Anggrek 2', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Anyelir A', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Anyelir B', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Tulip', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Lengkeng', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Teratai', 'Kelurahan Debong Tengah, Kec. Tegal Selatan'),
    ('Debong Tengah', 'Posyandu Bougenville', 'Kelurahan Debong Tengah, Kec. Tegal Selatan');

    -- 7. Debong Kulon
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Debong Kulon', 'Posyandu Mawar', 'Kelurahan Debong Kulon, Kec. Tegal Selatan'),
    ('Debong Kulon', 'Posyandu Kenanga', 'Kelurahan Debong Kulon, Kec. Tegal Selatan'),
    ('Debong Kulon', 'Posyandu Cempaka', 'Kelurahan Debong Kulon, Kec. Tegal Selatan'),
    ('Debong Kulon', 'Posyandu Nusa Indah', 'Kelurahan Debong Kulon, Kec. Tegal Selatan'),
    ('Debong Kulon', 'Posyandu Melati', 'Kelurahan Debong Kulon, Kec. Tegal Selatan');

    -- 8. Debong Kidul (Melengkapi Kecamatan Tegal Selatan)
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Debong Kidul', 'Posyandu Mekar Wangi', 'Kelurahan Debong Kidul, Kec. Tegal Selatan'),
    ('Debong Kidul', 'Posyandu Melati', 'Kelurahan Debong Kidul, Kec. Tegal Selatan');

    -- ==========================================================================
    -- D. KECAMATAN MARGADANA (7 Kelurahan)
    -- ==========================================================================
    
    -- 1. Cabawan
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Cabawan', 'Posyandu Anggrek RW 1', 'Kelurahan Cabawan, Kec. Margadana'),
    ('Cabawan', 'Posyandu Bougenville RW 2', 'Kelurahan Cabawan, Kec. Margadana'),
    ('Cabawan', 'Posyandu Cempaka RW 3', 'Kelurahan Cabawan, Kec. Margadana'),
    ('Cabawan', 'Posyandu Dahlia RW 4', 'Kelurahan Cabawan, Kec. Margadana');

    -- 2. Kaligangsa
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Kaligangsa', 'Posyandu Dahlia', 'Kelurahan Kaligangsa, Kec. Margadana'),
    ('Kaligangsa', 'Posyandu Rosella', 'Kelurahan Kaligangsa, Kec. Margadana'),
    ('Kaligangsa', 'Posyandu Cempaka', 'Kelurahan Kaligangsa, Kec. Margadana'),
    ('Kaligangsa', 'Posyandu Bougenville', 'Kelurahan Kaligangsa, Kec. Margadana'),
    ('Kaligangsa', 'Posyandu Anggrek', 'Kelurahan Kaligangsa, Kec. Margadana'),
    ('Kaligangsa', 'Posyandu Melati', 'Kelurahan Kaligangsa, Kec. Margadana'),
    ('Kaligangsa', 'Posyandu Flamboyan', 'Kelurahan Kaligangsa, Kec. Margadana');

    -- 3. Krandon
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Krandon', 'Posyandu Intan', 'Kelurahan Krandon, Kec. Margadana'),
    ('Krandon', 'Posyandu Mutiara', 'Kelurahan Krandon, Kec. Margadana'),
    ('Krandon', 'Posyandu Permata', 'Kelurahan Krandon, Kec. Margadana'),
    ('Krandon', 'Posyandu Berlian', 'Kelurahan Krandon, Kec. Margadana');

    -- 4. Margadana
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Margadana', 'Posyandu Suflir', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Anyelir', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Cempaka 1', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Cempaka 2', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Kesambisari', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Jagadipa', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Bougenville', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Dahlia', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Wijaya Kusuma', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Kenanga', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Anggrek Bulan', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Sedap Malam', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Lavender', 'Kelurahan Margadana, Kec. Margadana'),
    ('Margadana', 'Posyandu Edelveis', 'Kelurahan Margadana, Kec. Margadana');

    -- 5. Sumurpanggang
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Sumurpanggang', 'Posyandu Melati', 'Kelurahan Sumurpanggang, Kec. Margadana'),
    ('Sumurpanggang', 'Posyandu Nur Hikmah', 'Kelurahan Sumurpanggang, Kec. Margadana'),
    ('Sumurpanggang', 'Posyandu Ragasela', 'Kelurahan Sumurpanggang, Kec. Margadana'),
    ('Sumurpanggang', 'Posyandu Cempaka', 'Kelurahan Sumurpanggang, Kec. Margadana'),
    ('Sumurpanggang', 'Posyandu Mawar', 'Kelurahan Sumurpanggang, Kec. Margadana'),
    ('Sumurpanggang', 'Posyandu Manggis', 'Kelurahan Sumurpanggang, Kec. Margadana');

    -- 6. Pesurungan Lor
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Pesurungan Lor', 'Posyandu Mawar', 'Kelurahan Pesurungan Lor, Kec. Margadana'),
    ('Pesurungan Lor', 'Posyandu Anggrek', 'Kelurahan Pesurungan Lor, Kec. Margadana'),
    ('Pesurungan Lor', 'Posyandu Melati', 'Kelurahan Pesurungan Lor, Kec. Margadana'),
    ('Pesurungan Lor', 'Posyandu Jaya Samudera', 'Kelurahan Pesurungan Lor, Kec. Margadana');

    -- 7. Kalinyamat Kulon
    INSERT INTO tmp_posyandu_master (nama_kelurahan, nama_posyandu, alamat_keterangan) VALUES
    ('Kalinyamat Kulon', 'Posyandu Melati 1', 'Kelurahan Kalinyamat Kulon, Kec. Margadana'),
    ('Kalinyamat Kulon', 'Posyandu Melati 2', 'Kelurahan Kalinyamat Kulon, Kec. Margadana'),
    ('Kalinyamat Kulon', 'Posyandu Melati 3', 'Kelurahan Kalinyamat Kulon, Kec. Margadana'),
    ('Kalinyamat Kulon', 'Posyandu Melati 4', 'Kelurahan Kalinyamat Kulon, Kec. Margadana');

    -- ==========================================================================
    -- E. EKSEKUSI INSERT DINAMIS KE TABEL public.kanal_posyandu
    -- ==========================================================================
    FOR v_item IN SELECT * FROM tmp_posyandu_master LOOP
        -- Cari ID Kelurahan & ID Kecamatan secara dinamis dari tabel public.wilayah
        SELECT w_kel.id, COALESCE(w_kel.parent_id, w_kec.id)
        INTO v_kel_id, v_kec_id
        FROM public.wilayah w_kel
        LEFT JOIN public.wilayah w_kec ON (
            (w_kel.parent_id = w_kec.id AND w_kec.tipe = 'KECAMATAN')
            OR (LOWER(TRIM(w_kec.nama)) = LOWER(TRIM(v_item.nama_kelurahan)) AND w_kec.tipe = 'KECAMATAN')
        )
        WHERE (
            LOWER(TRIM(w_kel.nama)) = LOWER(TRIM(v_item.nama_kelurahan))
            OR REPLACE(LOWER(TRIM(w_kel.nama)), ' ', '') = REPLACE(LOWER(TRIM(v_item.nama_kelurahan)), ' ', '')
            OR LOWER(TRIM(w_kel.nama)) LIKE '%' || LOWER(TRIM(v_item.nama_kelurahan)) || '%'
        )
        AND w_kel.tipe = 'KELURAHAN'
        LIMIT 1;

        -- Jika kelurahan ditemukan di tabel wilayah, masukkan data posyandu
        IF v_kel_id IS NOT NULL THEN
            INSERT INTO public.kanal_posyandu (
                nama,
                nama_posyandu,
                kelurahan_id,
                kecamatan_id,
                alamat
            ) VALUES (
                v_item.nama_posyandu,
                v_item.nama_posyandu,
                v_kel_id,
                v_kec_id,
                v_item.alamat_keterangan
            )
            ON CONFLICT (kelurahan_id, nama) DO UPDATE SET
                nama_posyandu = EXCLUDED.nama_posyandu,
                kecamatan_id = EXCLUDED.kecamatan_id,
                alamat = EXCLUDED.alamat;
            
            v_total_inserted := v_total_inserted + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'Seeding Selesai: % Data Posyandu berhasil diproses.', v_total_inserted;

    -- Bersihkan temporary table
    DROP TABLE IF EXISTS tmp_posyandu_master;
END $$;

-- 4. Verifikasi Jumlah Data
SELECT 
    COALESCE(w_kec.nama, 'Kota Tegal') AS kecamatan,
    w_kel.nama AS kelurahan,
    COUNT(kp.id) AS total_posyandu
FROM public.kanal_posyandu kp
JOIN public.wilayah w_kel ON kp.kelurahan_id = w_kel.id AND w_kel.tipe = 'KELURAHAN'
LEFT JOIN public.wilayah w_kec ON (kp.kecamatan_id = w_kec.id OR w_kel.parent_id = w_kec.id) AND w_kec.tipe = 'KECAMATAN'
GROUP BY COALESCE(w_kec.nama, 'Kota Tegal'), w_kel.nama
ORDER BY kecamatan, w_kel.nama;
