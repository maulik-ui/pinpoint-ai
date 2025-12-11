-- Add 'mediocre' to the feature_status enum if it doesn't exist
-- First, check if the enum type exists and add the value if needed

DO $$ 
BEGIN
    -- Check if 'mediocre' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'mediocre' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'feature_status'
        )
    ) THEN
        -- Add 'mediocre' to the feature_status enum
        ALTER TYPE feature_status ADD VALUE IF NOT EXISTS 'mediocre';
    END IF;
END $$;

