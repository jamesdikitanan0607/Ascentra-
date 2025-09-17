-- =====================================================
-- POPULATE 75 TRAIL ROUTES (5 per hiking spot)
-- =====================================================
-- This script creates 5 trail routes for each hiking spot
-- Run this in Supabase SQL Editor

-- First, let's check if we have hiking spots
DO $$
DECLARE
    spot_record RECORD;
    route_count INTEGER;
    total_spots INTEGER;
BEGIN
    -- Count total hiking spots
    SELECT COUNT(*) INTO total_spots FROM hiking_spots;
    RAISE NOTICE 'Found % hiking spots', total_spots;
    
    -- Check existing trail routes
    SELECT COUNT(*) INTO route_count FROM trail_routes;
    RAISE NOTICE 'Found % existing trail routes', route_count;
    
    -- If we already have routes, exit
    IF route_count >= (total_spots * 5) THEN
        RAISE NOTICE 'Trail routes already populated!';
        RETURN;
    END IF;
    
    -- Create 5 routes for each hiking spot
    FOR spot_record IN 
        SELECT id, name, coordinates 
        FROM hiking_spots 
        ORDER BY name
    LOOP
        -- Check if routes already exist for this spot
        SELECT COUNT(*) INTO route_count 
        FROM trail_routes 
        WHERE hiking_spot_id = spot_record.id;
        
        IF route_count > 0 THEN
            RAISE NOTICE 'Skipping % - routes already exist', spot_record.name;
            CONTINUE;
        END IF;
        
        RAISE NOTICE 'Creating routes for %', spot_record.name;
        
        -- Route 1: Easy Nature Walk
        INSERT INTO trail_routes (
            hiking_spot_id, route_name, difficulty, start_coordinates,
            distance_km, elevation_gain_m, estimated_duration_hr, highlights,
            geojson_path, route_color
        ) VALUES (
            spot_record.id,
            'Nature Walk',
            'Easy',
            'POINT(123.8890 10.3700)',
            2.1,
            120,
            1.5,
            'Gentle trail perfect for families with scenic forest views and wildlife spotting opportunities',
            '{
                "type": "LineString",
                "coordinates": [
                    [123.8890, 10.3700],
                    [123.8895, 10.3705],
                    [123.8900, 10.3710],
                    [123.8905, 10.3715]
                ]
            }',
            '#4CAF50'
        );
        
        -- Route 2: Easy Scenic Loop
        INSERT INTO trail_routes (
            hiking_spot_id, route_name, difficulty, start_coordinates,
            distance_km, elevation_gain_m, estimated_duration_hr, highlights,
            geojson_path, route_color
        ) VALUES (
            spot_record.id,
            'Scenic Loop',
            'Easy',
            'POINT(123.8890 10.3700)',
            2.8,
            180,
            2.0,
            'Circular route with beautiful viewpoints and photo opportunities along well-maintained paths',
            '{
                "type": "LineString",
                "coordinates": [
                    [123.8890, 10.3700],
                    [123.8892, 10.3708],
                    [123.8888, 10.3712],
                    [123.8885, 10.3705],
                    [123.8890, 10.3700]
                ]
            }',
            '#81C784'
        );
        
        -- Route 3: Moderate Main Trail
        INSERT INTO trail_routes (
            hiking_spot_id, route_name, difficulty, start_coordinates,
            distance_km, elevation_gain_m, estimated_duration_hr, highlights,
            geojson_path, route_color
        ) VALUES (
            spot_record.id,
            'Main Trail',
            'Moderate',
            'POINT(123.8890 10.3700)',
            4.5,
            350,
            3.0,
            'Primary hiking route with moderate elevation gain, forest canopy, and mountain stream crossings',
            '{
                "type": "LineString",
                "coordinates": [
                    [123.8890, 10.3700],
                    [123.8898, 10.3708],
                    [123.8905, 10.3718],
                    [123.8912, 10.3725],
                    [123.8920, 10.3730]
                ]
            }',
            '#FF9800'
        );
        
        -- Route 4: Hard Summit Trail
        INSERT INTO trail_routes (
            hiking_spot_id, route_name, difficulty, start_coordinates,
            distance_km, elevation_gain_m, estimated_duration_hr, highlights,
            geojson_path, route_color
        ) VALUES (
            spot_record.id,
            'Summit Trail',
            'Hard',
            'POINT(123.8890 10.3700)',
            7.2,
            650,
            4.5,
            'Challenging ascent to the peak with steep sections, rocky terrain, and panoramic summit views',
            '{
                "type": "LineString",
                "coordinates": [
                    [123.8890, 10.3700],
                    [123.8900, 10.3715],
                    [123.8915, 10.3730],
                    [123.8925, 10.3745],
                    [123.8935, 10.3760],
                    [123.8940, 10.3770]
                ]
            }',
            '#F44336'
        );
        
        -- Route 5: Advanced Technical Route
        INSERT INTO trail_routes (
            hiking_spot_id, route_name, difficulty, start_coordinates,
            distance_km, elevation_gain_m, estimated_duration_hr, highlights,
            geojson_path, route_color
        ) VALUES (
            spot_record.id,
            'Technical Route',
            'Advanced',
            'POINT(123.8890 10.3700)',
            9.8,
            950,
            6.0,
            'Expert-level trail with technical climbing sections, exposed ridges, and spectacular alpine views',
            '{
                "type": "LineString",
                "coordinates": [
                    [123.8890, 10.3700],
                    [123.8905, 10.3720],
                    [123.8925, 10.3740],
                    [123.8945, 10.3765],
                    [123.8960, 10.3785],
                    [123.8975, 10.3800],
                    [123.8985, 10.3815]
                ]
            }',
            '#9C27B0'
        );
        
    END LOOP;
    
    -- Final count
    SELECT COUNT(*) INTO route_count FROM trail_routes;
    RAISE NOTICE 'Total trail routes created: %', route_count;
    
END $$;

-- Verify the results
SELECT 
    hs.name as hiking_spot_name,
    COUNT(tr.route_id) as route_count,
    STRING_AGG(tr.route_name || ' (' || tr.difficulty || ')', ', ' ORDER BY tr.difficulty) as routes
FROM hiking_spots hs
LEFT JOIN trail_routes tr ON hs.id = tr.hiking_spot_id
GROUP BY hs.id, hs.name
ORDER BY hs.name;

-- Summary statistics
SELECT 
    'Total Hiking Spots' as metric,
    COUNT(*) as count
FROM hiking_spots
UNION ALL
SELECT 
    'Total Trail Routes' as metric,
    COUNT(*) as count
FROM trail_routes
UNION ALL
SELECT 
    'Average Routes per Spot' as metric,
    ROUND(COUNT(tr.route_id)::DECIMAL / COUNT(DISTINCT hs.id), 1) as count
FROM hiking_spots hs
LEFT JOIN trail_routes tr ON hs.id = tr.hiking_spot_id;