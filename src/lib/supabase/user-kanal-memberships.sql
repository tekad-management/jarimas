-- ==============================================================================
-- SKEMA TABEL KEANGGOTAAN KANAL PENGGUNA (user_kanal_memberships)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_kanal_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    kanal_id VARCHAR(100) NOT NULL,
    kanal_nama VARCHAR(200) NOT NULL,
    tipe_kanal VARCHAR(50) NOT NULL CHECK (tipe_kanal IN ('POSYANDU', 'SEKOLAH', 'OPD', 'WILAYAH')),
    peran VARCHAR(100) DEFAULT 'Anggota',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, kanal_id)
);

-- Enable RLS
ALTER TABLE public.user_kanal_memberships ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_kanal_memberships' AND policyname = 'Public select user_kanal_memberships') THEN
        CREATE POLICY "Public select user_kanal_memberships" ON public.user_kanal_memberships FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_kanal_memberships' AND policyname = 'Public insert user_kanal_memberships') THEN
        CREATE POLICY "Public insert user_kanal_memberships" ON public.user_kanal_memberships FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_kanal_memberships' AND policyname = 'Public update user_kanal_memberships') THEN
        CREATE POLICY "Public update user_kanal_memberships" ON public.user_kanal_memberships FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_kanal_memberships' AND policyname = 'Public delete user_kanal_memberships') THEN
        CREATE POLICY "Public delete user_kanal_memberships" ON public.user_kanal_memberships FOR DELETE USING (true);
    END IF;
END $$;
