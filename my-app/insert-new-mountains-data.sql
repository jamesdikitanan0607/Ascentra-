-- =====================================================
-- INSERT NEW MOUNTAINS AND TRAIL ROUTES DATA
-- =====================================================
-- This script adds 5 new mountains with their trail routes to the database

BEGIN;

-- =====================================================
-- INSERT NEW HIKING SPOTS (MOUNTAINS)
-- =====================================================

-- Insert Mount Babag (updated coordinates)
INSERT INTO hiking_spots (
    name, description, coordinates, difficulty, elevation_m, 
    trail_length_km, estimated_duration_min, latitude, longitude,
    location_text, cover_image_url, average_rating, number_of_reviews,
    is_verified, created_at, updated_at
) VALUES (
    'Mount Babag',
    'A popular hiking destination in Cebu City offering stunning panoramic views and diverse trail options ranging from easy forest walks to challenging ridge traverses.',
    ST_GeomFromText('POINT(123.8860 10.3613)', 4326),
    'Easy-Hard',
    520,
    7.8,
    270,
    10.3613,
    123.8860,
    'Cebu City, Cebu',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    4.5,
    120,
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO UPDATE SET
    coordinates = EXCLUDED.coordinates,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert Mount Kan-irag / Sirao Peak (updated coordinates)
INSERT INTO hiking_spots (
    name, description, coordinates, difficulty, elevation_m, 
    trail_length_km, estimated_duration_min, latitude, longitude,
    location_text, cover_image_url, average_rating, number_of_reviews,
    is_verified, created_at, updated_at
) VALUES (
    'Mount Kan-irag / Sirao Peak',
    'A scenic mountain peak in Cebu City famous for its flower gardens, rolling grasslands, and breathtaking summit views. Features trails from easy garden walks to extreme ridge exposures.',
    ST_GeomFromText('POINT(123.8585 10.3970)', 4326),
    'Easy-Very Hard',
    720,
    8.0,
    270,
    10.3970,
    123.8585,
    'Cebu City, Cebu',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    4.6,
    95,
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO UPDATE SET
    coordinates = EXCLUDED.coordinates,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert Mount Naupa
INSERT INTO hiking_spots (
    name, description, coordinates, difficulty, elevation_m, 
    trail_length_km, estimated_duration_min, latitude, longitude,
    location_text, cover_image_url, average_rating, number_of_reviews,
    is_verified, created_at, updated_at
) VALUES (
    'Mount Naupa',
    'A beautiful grassland mountain in Naga, Cebu offering rolling hills, eco trails, and spectacular ridge walks. Perfect for both beginners and experienced hikers seeking scenic views.',
    ST_GeomFromText('POINT(123.7698 10.2558)', 4326),
    'Easy-Very Hard',
    610,
    7.5,
    270,
    10.2558,
    123.7698,
    'Naga, Cebu',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
    4.3,
    87,
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO UPDATE SET
    coordinates = EXCLUDED.coordinates,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert Mount Manunggal
INSERT INTO hiking_spots (
    name, description, coordinates, difficulty, elevation_m, 
    trail_length_km, estimated_duration_min, latitude, longitude,
    location_text, cover_image_url, average_rating, number_of_reviews,
    is_verified, created_at, updated_at
) VALUES (
    'Mount Manunggal',
    'A historic mountain in Balamban, Cebu featuring heritage trails, grass ridges, and forest climbs. Known for its historical significance and diverse terrain from meadows to narrow ridges.',
    ST_GeomFromText('POINT(123.7831 10.4939)', 4326),
    'Easy-Very Hard',
    720,
    8.1,
    288,
    10.4939,
    123.7831,
    'Balamban, Cebu',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    4.4,
    76,
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO UPDATE SET
    coordinates = EXCLUDED.coordinates,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert Mount Mago
INSERT INTO hiking_spots (
    name, description, coordinates, difficulty, elevation_m, 
    trail_length_km, estimated_duration_min, latitude, longitude,
    location_text, cover_image_url, average_rating, number_of_reviews,
    is_verified, created_at, updated_at
) VALUES (
    'Mount Mago',
    'A scenic mountain in Carmen, Cebu featuring meadow trails, farm ridges, and hill loops. Offers beautiful summit views and diverse terrain from rolling farms to continuous climbs.',
    ST_GeomFromText('POINT(123.9000 10.7100)', 4326),
    'Easy-Very Hard',
    680,
    7.8,
    270,
    10.7100,
    123.9000,
    'Carmen, Cebu',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    4.2,
    64,
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO UPDATE SET
    coordinates = EXCLUDED.coordinates,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- INSERT TRAIL ROUTES FOR EACH MOUNTAIN
-- =====================================================

-- Get the hiking spot IDs for the new mountains
DO $$
DECLARE
    babag_id INTEGER;
    kanirag_id INTEGER;
    naupa_id INTEGER;
    manunggal_id INTEGER;
    mago_id INTEGER;
BEGIN
    -- Get hiking spot IDs
    SELECT id INTO babag_id FROM hiking_spots WHERE name = 'Mount Babag';
    SELECT id INTO kanirag_id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak';
    SELECT id INTO naupa_id FROM hiking_spots WHERE name = 'Mount Naupa';
    SELECT id INTO manunggal_id FROM hiking_spots WHERE name = 'Mount Manunggal';
    SELECT id INTO mago_id FROM hiking_spots WHERE name = 'Mount Mago';

    -- =====================================================
    -- MOUNT BABAG TRAIL ROUTES
    -- =====================================================
    
    -- Babag Eco Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        babag_id, 'Babag Eco Trail', 'Easy',
        ST_GeomFromText('POINT(123.8830 10.3600)', 4326),
        ST_GeomFromText('POINT(123.8860 10.3613)', 4326),
        2.5, 150, 1.5, 'Forest path, shaded',
        '{"type": "LineString", "coordinates": [[123.8830, 10.3600], [123.8845, 10.3607], [123.8860, 10.3613]]}',
        '#4CAF50'
    );
    
    -- Babag Ridge Walk
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        babag_id, 'Babag Ridge Walk', 'Moderate',
        ST_GeomFromText('POINT(123.8805 10.3582)', 4326),
        ST_GeomFromText('POINT(123.8860 10.3613)', 4326),
        3.2, 210, 2.0, 'Scenic ridge',
        '{"type": "LineString", "coordinates": [[123.8805, 10.3582], [123.8833, 10.3598], [123.8860, 10.3613]]}',
        '#FF9800'
    );
    
    -- Babag Spur Loop
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        babag_id, 'Babag Spur Loop', 'Moderate',
        ST_GeomFromText('POINT(123.8842 10.3628)', 4326),
        ST_GeomFromText('POINT(123.8887 10.3665)', 4326),
        4.5, 350, 2.5, 'Mixed terrain',
        '{"type": "LineString", "coordinates": [[123.8842, 10.3628], [123.8865, 10.3647], [123.8887, 10.3665]]}',
        '#2196F3'
    );
    
    -- Babag Peak Traverse
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        babag_id, 'Babag Peak Traverse', 'Hard',
        ST_GeomFromText('POINT(123.8790 10.3559)', 4326),
        ST_GeomFromText('POINT(123.8890 10.3689)', 4326),
        6.0, 520, 3.5, 'Steep sections',
        '{"type": "LineString", "coordinates": [[123.8790, 10.3559], [123.8825, 10.3600], [123.8860, 10.3640], [123.8890, 10.3689]]}',
        '#F44336'
    );
    
    -- Babag Extreme Ridge
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        babag_id, 'Babag Extreme Ridge', 'Advanced',
        ST_GeomFromText('POINT(123.8782 10.3530)', 4326),
        ST_GeomFromText('POINT(123.8910 10.3721)', 4326),
        7.8, 670, 4.5, 'Knife-edge ridge',
        '{"type": "LineString", "coordinates": [[123.8782, 10.3530], [123.8820, 10.3580], [123.8860, 10.3650], [123.8910, 10.3721]]}',
        '#9C27B0'
    );

    -- =====================================================
    -- MOUNT KAN-IRAG / SIRAO PEAK TRAIL ROUTES
    -- =====================================================
    
    -- Sirao Garden Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        kanirag_id, 'Sirao Garden Trail', 'Easy',
        ST_GeomFromText('POINT(123.8573 10.3941)', 4326),
        ST_GeomFromText('POINT(123.8585 10.3970)', 4326),
        2.2, 180, 1.2, 'Flower farm views',
        '{"type": "LineString", "coordinates": [[123.8573, 10.3941], [123.8579, 10.3956], [123.8585, 10.3970]]}',
        '#4CAF50'
    );
    
    -- Kan-irag Grassland
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        kanirag_id, 'Kan-irag Grassland', 'Moderate',
        ST_GeomFromText('POINT(123.8540 10.3919)', 4326),
        ST_GeomFromText('POINT(123.8585 10.3970)', 4326),
        3.1, 250, 2.0, 'Rolling hills',
        '{"type": "LineString", "coordinates": [[123.8540, 10.3919], [123.8563, 10.3945], [123.8585, 10.3970]]}',
        '#FF9800'
    );
    
    -- Sirao Loop Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        kanirag_id, 'Sirao Loop Trail', 'Moderate',
        ST_GeomFromText('POINT(123.8520 10.3890)', 4326),
        ST_GeomFromText('POINT(123.8612 10.3992)', 4326),
        4.8, 410, 2.5, 'Peak views',
        '{"type": "LineString", "coordinates": [[123.8520, 10.3890], [123.8553, 10.3930], [123.8585, 10.3970], [123.8612, 10.3992]]}',
        '#2196F3'
    );
    
    -- Kan-irag Traverse
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        kanirag_id, 'Kan-irag Traverse', 'Hard',
        ST_GeomFromText('POINT(123.8502 10.3872)', 4326),
        ST_GeomFromText('POINT(123.8625 10.4031)', 4326),
        6.5, 580, 3.5, 'Steep scramble',
        '{"type": "LineString", "coordinates": [[123.8502, 10.3872], [123.8544, 10.3920], [123.8585, 10.3970], [123.8625, 10.4031]]}',
        '#F44336'
    );
    
    -- Sirao Peak Summit Ridge
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        kanirag_id, 'Sirao Peak Summit Ridge', 'Advanced',
        ST_GeomFromText('POINT(123.8482 10.3850)', 4326),
        ST_GeomFromText('POINT(123.8635 10.4060)', 4326),
        8.0, 720, 4.5, 'Full ridge exposure',
        '{"type": "LineString", "coordinates": [[123.8482, 10.3850], [123.8534, 10.3910], [123.8585, 10.3970], [123.8635, 10.4060]]}',
        '#9C27B0'
    );

    -- =====================================================
    -- MOUNT NAUPA TRAIL ROUTES
    -- =====================================================
    
    -- Naupa Eco Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        naupa_id, 'Naupa Eco Trail', 'Easy',
        ST_GeomFromText('POINT(123.7660 10.2560)', 4326),
        ST_GeomFromText('POINT(123.7698 10.2558)', 4326),
        1.8, 120, 1.0, 'Grassland',
        '{"type": "LineString", "coordinates": [[123.7660, 10.2560], [123.7679, 10.2559], [123.7698, 10.2558]]}',
        '#4CAF50'
    );
    
    -- Naupa Ridge Walk
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        naupa_id, 'Naupa Ridge Walk', 'Moderate',
        ST_GeomFromText('POINT(123.7645 10.2539)', 4326),
        ST_GeomFromText('POINT(123.7698 10.2558)', 4326),
        2.7, 190, 1.5, 'Rolling hills',
        '{"type": "LineString", "coordinates": [[123.7645, 10.2539], [123.7672, 10.2549], [123.7698, 10.2558]]}',
        '#FF9800'
    );
    
    -- Naupa Loop Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        naupa_id, 'Naupa Loop Trail', 'Moderate',
        ST_GeomFromText('POINT(123.7620 10.2520)', 4326),
        ST_GeomFromText('POINT(123.7722 10.2575)', 4326),
        4.0, 320, 2.2, 'Summit views',
        '{"type": "LineString", "coordinates": [[123.7620, 10.2520], [123.7659, 10.2540], [123.7698, 10.2558], [123.7722, 10.2575]]}',
        '#2196F3'
    );
    
    -- Naupa-Kabalas Ridge
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        naupa_id, 'Naupa-Kabalas Ridge', 'Hard',
        ST_GeomFromText('POINT(123.7601 10.2502)', 4326),
        ST_GeomFromText('POINT(123.7740 10.2595)', 4326),
        5.8, 460, 3.2, 'Steep ascent',
        '{"type": "LineString", "coordinates": [[123.7601, 10.2502], [123.7650, 10.2530], [123.7698, 10.2558], [123.7740, 10.2595]]}',
        '#F44336'
    );
    
    -- Naupa Extreme Traverse
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        naupa_id, 'Naupa Extreme Traverse', 'Advanced',
        ST_GeomFromText('POINT(123.7580 10.2481)', 4326),
        ST_GeomFromText('POINT(123.7758 10.2610)', 4326),
        7.5, 610, 4.5, 'Ridge scramble',
        '{"type": "LineString", "coordinates": [[123.7580, 10.2481], [123.7640, 10.2520], [123.7698, 10.2558], [123.7758, 10.2610]]}',
        '#9C27B0'
    );

    -- =====================================================
    -- MOUNT MANUNGGAL TRAIL ROUTES
    -- =====================================================
    
    -- Manunggal Heritage Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        manunggal_id, 'Manunggal Heritage Trail', 'Easy',
        ST_GeomFromText('POINT(123.7800 10.4911)', 4326),
        ST_GeomFromText('POINT(123.7831 10.4939)', 4326),
        2.2, 160, 1.3, 'Historic site',
        '{"type": "LineString", "coordinates": [[123.7800, 10.4911], [123.7816, 10.4925], [123.7831, 10.4939]]}',
        '#4CAF50'
    );
    
    -- Manunggal Grass Ridge
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        manunggal_id, 'Manunggal Grass Ridge', 'Moderate',
        ST_GeomFromText('POINT(123.7775 10.4892)', 4326),
        ST_GeomFromText('POINT(123.7831 10.4939)', 4326),
        3.4, 250, 1.8, 'Rolling meadows',
        '{"type": "LineString", "coordinates": [[123.7775, 10.4892], [123.7803, 10.4916], [123.7831, 10.4939]]}',
        '#FF9800'
    );
    
    -- Manunggal Ridge Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        manunggal_id, 'Manunggal Ridge Trail', 'Moderate',
        ST_GeomFromText('POINT(123.7752 10.4870)', 4326),
        ST_GeomFromText('POINT(123.7860 10.4961)', 4326),
        4.9, 420, 2.6, 'Summit forest',
        '{"type": "LineString", "coordinates": [[123.7752, 10.4870], [123.7792, 10.4905], [123.7831, 10.4939], [123.7860, 10.4961]]}',
        '#2196F3'
    );
    
    -- Mt. Manunggal Traverse
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        manunggal_id, 'Mt. Manunggal Traverse', 'Hard',
        ST_GeomFromText('POINT(123.7720 10.4851)', 4326),
        ST_GeomFromText('POINT(123.7882 10.4980)', 4326),
        6.2, 560, 3.4, 'Forest climb',
        '{"type": "LineString", "coordinates": [[123.7720, 10.4851], [123.7776, 10.4895], [123.7831, 10.4939], [123.7882, 10.4980]]}',
        '#F44336'
    );
    
    -- Mt. Manunggal Extreme
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        manunggal_id, 'Mt. Manunggal Extreme', 'Advanced',
        ST_GeomFromText('POINT(123.7700 10.4832)', 4326),
        ST_GeomFromText('POINT(123.7905 10.5001)', 4326),
        8.1, 720, 4.8, 'Narrow ridge, long',
        '{"type": "LineString", "coordinates": [[123.7700, 10.4832], [123.7766, 10.4885], [123.7831, 10.4939], [123.7905, 10.5001]]}',
        '#9C27B0'
    );

    -- =====================================================
    -- MOUNT MAGO TRAIL ROUTES
    -- =====================================================
    
    -- Mago Meadow Trail
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        mago_id, 'Mago Meadow Trail', 'Easy',
        ST_GeomFromText('POINT(123.8972 10.7081)', 4326),
        ST_GeomFromText('POINT(123.9000 10.7100)', 4326),
        2.0, 140, 1.0, 'Meadows',
        '{"type": "LineString", "coordinates": [[123.8972, 10.7081], [123.8986, 10.7091], [123.9000, 10.7100]]}',
        '#4CAF50'
    );
    
    -- Mago Farm Ridge
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        mago_id, 'Mago Farm Ridge', 'Moderate',
        ST_GeomFromText('POINT(123.8950 10.7060)', 4326),
        ST_GeomFromText('POINT(123.9000 10.7100)', 4326),
        2.9, 200, 1.5, 'Rolling farms',
        '{"type": "LineString", "coordinates": [[123.8950, 10.7060], [123.8975, 10.7080], [123.9000, 10.7100]]}',
        '#FF9800'
    );
    
    -- Mago Hill Loop
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        mago_id, 'Mago Hill Loop', 'Moderate',
        ST_GeomFromText('POINT(123.8931 10.7040)', 4326),
        ST_GeomFromText('POINT(123.9022 10.7125)', 4326),
        4.6, 360, 2.4, 'Summit views',
        '{"type": "LineString", "coordinates": [[123.8931, 10.7040], [123.8966, 10.7070], [123.9000, 10.7100], [123.9022, 10.7125]]}',
        '#2196F3'
    );
    
    -- Mago Traverse Ridge
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        mago_id, 'Mago Traverse Ridge', 'Hard',
        ST_GeomFromText('POINT(123.8910 10.7015)', 4326),
        ST_GeomFromText('POINT(123.9050 10.7141)', 4326),
        6.1, 500, 3.3, 'Long ridge',
        '{"type": "LineString", "coordinates": [[123.8910, 10.7015], [123.8955, 10.7058], [123.9000, 10.7100], [123.9050, 10.7141]]}',
        '#F44336'
    );
    
    -- Mago Extreme Climb
    INSERT INTO trail_routes (
        hiking_spot_id, route_name, difficulty, start_coordinates, end_coordinates,
        distance_km, elevation_gain_m, estimated_duration_hr, highlights,
        geojson_path, route_color
    ) VALUES (
        mago_id, 'Mago Extreme Climb', 'Advanced',
        ST_GeomFromText('POINT(123.8889 10.6992)', 4326),
        ST_GeomFromText('POINT(123.9080 10.7162)', 4326),
        7.8, 680, 4.5, 'Continuous climb',
        '{"type": "LineString", "coordinates": [[123.8889, 10.6992], [123.8945, 10.7046], [123.9000, 10.7100], [123.9080, 10.7162]]}',
        '#9C27B0'
    );

END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all hiking spots were inserted
SELECT 'Hiking Spots Added' as status, COUNT(*) as count 
FROM hiking_spots 
WHERE name IN ('Mount Babag', 'Mount Kan-irag / Sirao Peak', 'Mount Naupa', 'Mount Manunggal', 'Mount Mago');

-- Check if all trail routes were inserted
SELECT 'Trail Routes Added' as status, COUNT(*) as count 
FROM trail_routes tr
JOIN hiking_spots hs ON tr.hiking_spot_id = hs.id
WHERE hs.name IN ('Mount Babag', 'Mount Kan-irag / Sirao Peak', 'Mount Naupa', 'Mount Manunggal', 'Mount Mago');

-- Show routes by mountain
SELECT 
    hs.name as mountain,
    COUNT(tr.route_id) as routes_count,
    STRING_AGG(tr.route_name, ', ' ORDER BY tr.difficulty, tr.distance_km) as route_names
FROM hiking_spots hs
LEFT JOIN trail_routes tr ON hs.id = tr.hiking_spot_id
WHERE hs.name IN ('Mount Babag', 'Mount Kan-irag / Sirao Peak', 'Mount Naupa', 'Mount Manunggal', 'Mount Mago')
GROUP BY hs.id, hs.name
ORDER BY hs.name;