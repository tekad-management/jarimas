-- ==============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) UNTUK TABEL KANAL_SEKOLAH
-- File: src/lib/supabase/rls-sekolah.sql
-- ==============================================================================

-- 1. Pastikan RLS diaktifkan pada tabel public.kanal_sekolah
ALTER TABLE IF EXISTS public.kanal_sekolah ENABLE ROW LEVEL SECURITY;

-- 2. Hapus kebijakan lama jika ada untuk menghindari duplikasi
DROP POLICY IF EXISTS "Public Read Sekolah" ON public.kanal_sekolah;
DROP POLICY IF EXISTS "Allow authenticated read sekolah" ON public.kanal_sekolah;
DROP POLICY IF EXISTS "Allow anon read sekolah" ON public.kanal_sekolah;

-- 3. Buat kebijakan akses publik (Anon & Authenticated) untuk membaca seluruh data sekolah
CREATE POLICY "Public Read Sekolah" 
ON public.kanal_sekolah 
FOR SELECT 
USING (true);

-- 4. Berikan hak akses SELECT ke role anon dan authenticated
GRANT SELECT ON public.kanal_sekolah TO anon, authenticated;

-- 5. Berikan hak akses pada sequence jika ada
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
