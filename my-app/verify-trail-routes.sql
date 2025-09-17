-- =====================================================
-- VERIFY TRAIL ROUTES SETUP
-- =====================================================
-- Run this query to check the current state of trail routes

-- 1. Check hiking spots count
SELECT 'Hiking Spots' as table_name, COUNT(*) as total_count
FROM hiking_spots
UNION ALL
-- 2. Check trail routes count
SELECT 'Trail Routes' as table_name, COUNT(*) as total_count
FROM trail_routes;

-- 3. Detailed breakdown by hiking spot
SELECT 
    hs.name as hiking_spot_name,
    COUNT(tr.route_id) as routes_count,
    CASE 
        WHEN COUNT(tr.route_id) = 5 THEN '✅ Complete'
        WHEN COUNT(tr.route_id) > 0 THEN '⚠️ Partial'
        ELSE '❌ Missing'
    END as status
FROM hiking_spots hs
LEFT JOIN trail_routes tr ON hs.id = tr.hiking_spot_id
GROUP BY hs.id, hs.name
ORDER BY routes_count DESC, hs.name;

-- 4. Routes by difficulty level
SELECT 
    difficulty,
    COUNT(*) as route_count
FROM trail_routes
GROUP BY difficulty
ORDER BY 
    CASE difficulty
        WHEN 'Easy' THEN 1
        WHEN 'Moderate' THEN 2
        WHEN 'Hard' THEN 3
        WHEN 'Advanced' THEN 4
        ELSE 5
    END;

-- 5. Sample of trail routes
SELECT 
    hs.name as hiking_spot,
    tr.route_name,
    tr.difficulty,
    tr.distance_km,
    tr.elevation_gain_m,
    tr.estimated_duration_hr
FROM trail_routes tr
JOIN hiking_spots hs ON tr.hiking_spot_id = hs.id
ORDER BY hs.name, 
    CASE tr.difficulty
        WHEN 'Easy' THEN 1
        WHEN 'Moderate' THEN 2
        WHEN 'Hard' THEN 3
        WHEN 'Advanced' THEN 4
        ELSE 5
    END
LIMIT 20;

-- 6. Summary statistics
WITH stats AS (
    SELECT 
        COUNT(DISTINCT hs.id) as total_spots,
        COUNT(tr.route_id) as total_routes,
        COUNT(DISTINCT hs.id) * 5 as expected_routes
    FROM hiking_spots hs
    LEFT JOIN trail_routes tr ON hs.id = tr.hiking_spot_id
)
SELECT 
    total_spots,
    total_routes,
    expected_routes,
    (expected_routes - total_routes) as missing_routes,
    ROUND((total_routes::DECIMAL / expected_routes * 100), 1) as completion_percentage
FROM stats;