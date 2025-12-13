-- Fix favorites table to use generic text ID and ensure hiking_spot_id column name
-- This supports both UUIDs and legacy integer IDs (e.g. "84")

-- 1. Create favorites table if it doesn't exist, or alter it
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
        CREATE TABLE public.favorites (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            hiking_spot_id TEXT NOT NULL, -- CAUTION: No FK constraint to allow local/legacy IDs
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, hiking_spot_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
        
        -- Create policy
        CREATE POLICY "Users can manage their own favorites" ON public.favorites
            FOR ALL USING (auth.uid() = user_id);
            
        -- Grant permissions
        GRANT ALL ON public.favorites TO authenticated;
        GRANT ALL ON public.favorites TO service_role;
        
    ELSE
        -- Table exists, check for column mismatch
        -- If spot_id exists but hiking_spot_id does not, rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'spot_id') AND
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'hiking_spot_id') THEN
            ALTER TABLE public.favorites RENAME COLUMN spot_id TO hiking_spot_id;
        END IF;
        
        -- Change hiking_spot_id to TEXT if it's not already (to support "84" and UUIDs)
        -- This might fail if casting is needed, but usually UUID->TEXT or INT->TEXT is fine
        ALTER TABLE public.favorites ALTER COLUMN hiking_spot_id TYPE TEXT;
        
        -- Drop FK constraint if it exists to allow local IDs
        BEGIN
            ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_spot_id_fkey;
            ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_hiking_spot_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if constraint doesn't exist
        END;
        
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
