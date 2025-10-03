-- Temporarily disable RLS for trail_routes data seeding
-- Run this in Supabase SQL Editor before running the data generation script

ALTER TABLE trail_routes DISABLE ROW LEVEL SECURITY;

-- After data seeding is complete, re-enable RLS with:
-- ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;