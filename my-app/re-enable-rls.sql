-- Re-enable RLS for trail_routes table after data seeding
-- Run this in Supabase SQL Editor to restore security

ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;