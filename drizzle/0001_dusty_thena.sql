DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CANCELLED' AND enumtypid = 'public.listing_status'::regtype) THEN
        ALTER TYPE "public"."listing_status" ADD VALUE 'CANCELLED';
    END IF;
END$$;