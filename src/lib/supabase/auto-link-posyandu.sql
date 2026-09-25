-- ==============================================================================
-- OTOMASI RELASI DATA WARGA KE KANAL POSYANDU BERBASIS WILAYAH KELURAHAN
-- Trigger Function: public.auto_assign_posyandu_from_rt()
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.auto_assign_posyandu_from_rt()
RETURNS TRIGGER AS $$
DECLARE
    v_kelurahan_id UUID;
    v_posyandu_id UUID;
BEGIN
    -- Jika posyandu_id belum diisi secara manual dan rt_wilayah_id tersedia
    IF NEW.posyandu_id IS NULL AND NEW.rt_wilayah_id IS NOT NULL THEN
        -- 1. Coba cari kelurahan_id dari tabel wilayah:
        
        -- A. Cek jika rt_wilayah_id langsung merujuk ke id/kode Kelurahan
        SELECT id INTO v_kelurahan_id
        FROM public.wilayah
        WHERE (id::text = NEW.rt_wilayah_id OR kode = NEW.rt_wilayah_id)
          AND tingkat = 'KELURAHAN'
        LIMIT 1;

        -- B. Jika rt_wilayah_id berada di level RT (hierarki RT -> RW -> Kelurahan)
        IF v_kelurahan_id IS NULL THEN
            SELECT w_kel.id INTO v_kelurahan_id
            FROM public.wilayah w_rt
            JOIN public.wilayah w_rw ON w_rt.parent_id = w_rw.id
            JOIN public.wilayah w_kel ON w_rw.parent_id = w_kel.id
            WHERE (w_rt.id::text = NEW.rt_wilayah_id OR w_rt.kode = NEW.rt_wilayah_id)
            LIMIT 1;
        END IF;

        -- C. Jika rt_wilayah_id berada di level RW (hierarki RW -> Kelurahan)
        IF v_kelurahan_id IS NULL THEN
            SELECT w_kel.id INTO v_kelurahan_id
            FROM public.wilayah w_rw
            JOIN public.wilayah w_kel ON w_rw.parent_id = w_kel.id
            WHERE (w_rw.id::text = NEW.rt_wilayah_id OR w_rw.kode = NEW.rt_wilayah_id)
            LIMIT 1;
        END IF;

        -- D. Jika rt_wilayah_id merujuk ke parent_id langsung di wilayah
        IF v_kelurahan_id IS NULL THEN
            SELECT parent_id INTO v_kelurahan_id
            FROM public.wilayah
            WHERE (id::text = NEW.rt_wilayah_id OR kode = NEW.rt_wilayah_id)
            LIMIT 1;
        END IF;

        -- E. Fallback Cerdas: Ambil posyandu kelurahan default jika kode wilayah umum digunakan
        IF v_kelurahan_id IS NULL THEN
            SELECT kelurahan_id INTO v_kelurahan_id
            FROM public.kanal_posyandu
            LIMIT 1;
        END IF;

        -- 2. Cari Posyandu di Kelurahan yang sesuai
        IF v_kelurahan_id IS NOT NULL THEN
            SELECT id INTO v_posyandu_id
            FROM public.kanal_posyandu
            WHERE kelurahan_id = v_kelurahan_id
            ORDER BY nama ASC
            LIMIT 1;

            -- 3. Set posyandu_id otomatis sebelum baris disimpan
            IF v_posyandu_id IS NOT NULL THEN
                NEW.posyandu_id := v_posyandu_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger pada tabel data_warga (BEFORE INSERT OR UPDATE)
DROP TRIGGER IF EXISTS trg_auto_assign_posyandu ON public.data_warga;

CREATE TRIGGER trg_auto_assign_posyandu
BEFORE INSERT OR UPDATE ON public.data_warga
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_posyandu_from_rt();
