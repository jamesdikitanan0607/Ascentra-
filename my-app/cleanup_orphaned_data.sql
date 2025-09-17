-- =====================================================
-- CLEANUP ORPHANED DATA
-- =====================================================
-- This script removes orphaned data from votes and comments tables
-- that reference non-existent hiking spots

-- Clean up orphaned hiking spot votes
DELETE FROM hiking_spot_votes 
WHERE hiking_spot_id NOT IN (SELECT id FROM hiking_spots);

-- Clean up orphaned hiking spot comments
DELETE FROM hiking_spot_comments 
WHERE hiking_spot_id NOT IN (SELECT id FROM hiking_spots);

-- Clean up orphaned favorites (if any)
DELETE FROM favorites 
WHERE hiking_spot_id NOT IN (SELECT id FROM hiking_spots);

-- Clean up any other related tables that might have orphaned data
-- Add more cleanup queries here if needed for other tables

COMMIT;

-- Display cleanup results
SELECT 'Cleanup completed successfully' as status;
SELECT COUNT(*) as remaining_votes FROM hiking_spot_votes;
SELECT COUNT(*) as remaining_comments FROM hiking_spot_comments;
SELECT COUNT(*) as remaining_favorites FROM favorites;
SELECT COUNT(*) as total_hiking_spots FROM hiking_spots;