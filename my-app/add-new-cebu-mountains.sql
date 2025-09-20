-- Add 5 New Cebu Mountains and Their Trail Routes
-- This script adds Mount Lanaya, Mount Lantoy, Mount Kapayas, Mount Hambubuyog, and Mount Mauyog

-- First, insert the hiking spots
INSERT INTO hiking_spots (
    name, 
    description, 
    location, 
    latitude, 
    longitude, 
    difficulty_level, 
    estimated_duration, 
    elevation_gain, 
    trail_length, 
    best_time_to_visit, 
    entrance_fee, 
    contact_info, 
    facilities, 
    safety_tips, 
    image_url, 
    created_at, 
    updated_at
) VALUES 
-- Mount Lanaya (Alegria, Cebu)
(
    'Mount Lanaya',
    'A stunning coastal mountain in Alegria, Cebu offering breathtaking ocean views and diverse trail options from easy coastal walks to challenging ridge traverses. Known for its knife-edge cliffs and rocky outcrops.',
    'Alegria, Cebu',
    9.6972,
    123.3331,
    'Moderate',
    '2-5 hours',
    690,
    7.9,
    'November to April (dry season)',
    'Free',
    'Alegria Tourism Office: +63 32 XXX XXXX',
    'Basic restrooms, parking area, local guides available',
    'Bring plenty of water, wear proper hiking shoes, avoid during rainy season due to slippery cliff sections',
    'https://example.com/mount-lanaya.jpg',
    NOW(),
    NOW()
),
-- Mount Lantoy (Argao, Cebu)
(
    'Mount Lantoy',
    'A historic mountain in Argao, Cebu featuring heritage trails with historical caves, coastal ridges, and dense mountain forests. Perfect for both beginners and experienced hikers.',
    'Argao, Cebu',
    9.9108,
    123.6025,
    'Moderate',
    '1-5 hours',
    670,
    7.6,
    'November to April (dry season)',
    'Free',
    'Argao Tourism Office: +63 32 XXX XXXX',
    'Parking area, local guides, historical cave tours',
    'Explore caves with proper lighting, stay on marked trails, respect historical sites',
    'https://example.com/mount-lantoy.jpg',
    NOW(),
    NOW()
),
-- Mount Kapayas (Catmon, Cebu)
(
    'Mount Kapayas',
    'A forested mountain in Catmon, Cebu known for its dense forest trails, limestone cliffs, and coastal ridge views. Features challenging climbs with jagged summit formations.',
    'Catmon, Cebu',
    10.7161,
    124.0283,
    'Moderate',
    '1-5 hours',
    710,
    8.0,
    'November to April (dry season)',
    'Free',
    'Catmon Tourism Office: +63 32 XXX XXXX',
    'Basic facilities, parking, local guides available',
    'Watch for loose limestone rocks, bring headlamp for cave sections, stay hydrated',
    'https://example.com/mount-kapayas.jpg',
    NOW(),
    NOW()
),
-- Mount Hambubuyog (Ginatilan, Cebu)
(
    'Mount Hambubuyog',
    'A scenic mountain in Ginatilan, Cebu featuring rolling meadows, sea views, and forested slopes. Offers a long ridgeline traverse for experienced hikers.',
    'Ginatilan, Cebu',
    9.5680,
    123.3502,
    'Moderate',
    '1-5 hours',
    690,
    7.7,
    'November to April (dry season)',
    'Free',
    'Ginatilan Tourism Office: +63 32 XXX XXXX',
    'Basic restrooms, parking area, local guides',
    'Bring sun protection for meadow sections, watch for steep drops on ridgeline',
    'https://example.com/mount-hambubuyog.jpg',
    NOW(),
    NOW()
),
-- Mount Mauyog (Balamban, Cebu)
(
    'Mount Mauyog',
    'A dramatic mountain in Balamban, Cebu featuring unique rock towers, scenic ridges, and exposed rocky climbs. Known for its summit views and challenging scrambles.',
    'Balamban, Cebu',
    10.5052,
    123.7981,
    'Moderate',
    '1-5 hours',
    710,
    7.9,
    'November to April (dry season)',
    'Free',
    'Balamban Tourism Office: +63 32 XXX XXXX',
    'Parking area, basic facilities, local guides available',
    'Use proper climbing gear for rocky sections, avoid during windy conditions on exposed ridges',
    'https://example.com/mount-mauyog.jpg',
    NOW(),
    NOW()
);

-- Now insert all the trail routes
-- We'll use the hiking_spot_id values that will be auto-generated
-- Let's assume the new spots will get IDs starting from the next available ID

-- Mount Lanaya Trail Routes (hiking_spot_id will be determined after insertion)
INSERT INTO trail_routes (
    hiking_spot_id,
    name,
    description,
    length,
    estimated_time,
    difficulty,
    trail_type,
    elevation_gain,
    waypoints,
    is_active,
    created_at,
    updated_at
) VALUES 
-- Mount Lanaya routes (we'll need to get the actual hiking_spot_id after insertion)
-- For now, using placeholder values that will need to be updated
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lanaya'), 'Lanaya Coast Trail', 'Easy coastal forest trail with beautiful ocean views', 2.3, 72, 'Easy', 'out_and_back', 180, '[{"lat": 9.6950, "lng": 123.3298, "elevation": 0}, {"lat": 9.6972, "lng": 123.3331, "elevation": 180}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lanaya'), 'Lanaya Ridge Ascent', 'Easy-moderate trail with stunning ocean views from the ridge', 3.1, 108, 'Easy-Moderate', 'out_and_back', 260, '[{"lat": 9.6928, "lng": 123.3275, "elevation": 0}, {"lat": 9.6972, "lng": 123.3331, "elevation": 260}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lanaya'), 'Lanaya Loop Trail', 'Moderate loop trail featuring steep ridge sections', 4.7, 150, 'Moderate', 'loop', 410, '[{"lat": 9.6905, "lng": 123.3252, "elevation": 0}, {"lat": 9.6950, "lng": 123.3300, "elevation": 200}, {"lat": 9.6990, "lng": 123.3350, "elevation": 410}, {"lat": 9.6960, "lng": 123.3320, "elevation": 300}, {"lat": 9.6905, "lng": 123.3252, "elevation": 0}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lanaya'), 'Lanaya Peak Traverse', 'Hard traverse with rocky outcrops and challenging terrain', 6.3, 204, 'Hard', 'point_to_point', 540, '[{"lat": 9.6882, "lng": 123.3228, "elevation": 0}, {"lat": 9.6920, "lng": 123.3260, "elevation": 150}, {"lat": 9.6960, "lng": 123.3300, "elevation": 350}, {"lat": 9.7012, "lng": 123.3372, "elevation": 540}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lanaya'), 'Lanaya Extreme Ridge', 'Very hard knife-edge cliff traverse for experienced hikers only', 7.9, 282, 'Very Hard', 'point_to_point', 690, '[{"lat": 9.6859, "lng": 123.3205, "elevation": 0}, {"lat": 9.6890, "lng": 123.3240, "elevation": 120}, {"lat": 9.6930, "lng": 123.3280, "elevation": 280}, {"lat": 9.6980, "lng": 123.3330, "elevation": 480}, {"lat": 9.7033, "lng": 123.3391, "elevation": 690}]', true, NOW(), NOW()),

-- Mount Lantoy routes
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lantoy'), 'Lantoy Heritage Trail', 'Easy trail featuring historical caves and heritage sites', 2.1, 66, 'Easy', 'out_and_back', 150, '[{"lat": 9.9089, "lng": 123.5998, "elevation": 0}, {"lat": 9.9108, "lng": 123.6025, "elevation": 150}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lantoy'), 'Lantoy Ridge Path', 'Easy-moderate coastal ridge trail with scenic views', 3.0, 102, 'Easy-Moderate', 'out_and_back', 220, '[{"lat": 9.9062, "lng": 123.5972, "elevation": 0}, {"lat": 9.9108, "lng": 123.6025, "elevation": 220}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lantoy'), 'Lantoy Loop Trail', 'Moderate loop through mountain forest with varied terrain', 4.6, 144, 'Moderate', 'loop', 390, '[{"lat": 9.9041, "lng": 123.5949, "elevation": 0}, {"lat": 9.9080, "lng": 123.5990, "elevation": 180}, {"lat": 9.9130, "lng": 123.6051, "elevation": 390}, {"lat": 9.9100, "lng": 123.6020, "elevation": 250}, {"lat": 9.9041, "lng": 123.5949, "elevation": 0}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lantoy'), 'Lantoy Traverse', 'Hard traverse with steep and rooty terrain', 6.0, 198, 'Hard', 'point_to_point', 530, '[{"lat": 9.9019, "lng": 123.5920, "elevation": 0}, {"lat": 9.9060, "lng": 123.5960, "elevation": 150}, {"lat": 9.9110, "lng": 123.6020, "elevation": 350}, {"lat": 9.9152, "lng": 123.6075, "elevation": 530}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Lantoy'), 'Lantoy Extreme Ridge', 'Very hard narrow rocky ridge traverse', 7.6, 276, 'Very Hard', 'point_to_point', 670, '[{"lat": 9.8990, "lng": 123.5895, "elevation": 0}, {"lat": 9.9030, "lng": 123.5940, "elevation": 120}, {"lat": 9.9080, "lng": 123.5990, "elevation": 280}, {"lat": 9.9130, "lng": 123.6040, "elevation": 480}, {"lat": 9.9171, "lng": 123.6092, "elevation": 670}]', true, NOW(), NOW()),

-- Mount Kapayas routes
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kapayas'), 'Kapayas Forest Trail', 'Easy trail through dense forest with rich biodiversity', 2.4, 72, 'Easy', 'out_and_back', 170, '[{"lat": 10.7140, "lng": 124.0250, "elevation": 0}, {"lat": 10.7161, "lng": 124.0283, "elevation": 170}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kapayas'), 'Kapayas Ridge Walk', 'Easy-moderate coastal ridge walk with panoramic views', 3.3, 114, 'Easy-Moderate', 'out_and_back', 240, '[{"lat": 10.7119, "lng": 124.0225, "elevation": 0}, {"lat": 10.7161, "lng": 124.0283, "elevation": 240}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kapayas'), 'Kapayas Loop Trail', 'Moderate loop featuring limestone cliffs and forest sections', 4.8, 156, 'Moderate', 'loop', 410, '[{"lat": 10.7097, "lng": 124.0202, "elevation": 0}, {"lat": 10.7140, "lng": 124.0250, "elevation": 180}, {"lat": 10.7182, "lng": 124.0301, "elevation": 410}, {"lat": 10.7150, "lng": 124.0270, "elevation": 280}, {"lat": 10.7097, "lng": 124.0202, "elevation": 0}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kapayas'), 'Kapayas Traverse', 'Hard traverse with steep climbs and technical sections', 6.4, 210, 'Hard', 'point_to_point', 560, '[{"lat": 10.7075, "lng": 124.0179, "elevation": 0}, {"lat": 10.7120, "lng": 124.0220, "elevation": 150}, {"lat": 10.7170, "lng": 124.0280, "elevation": 380}, {"lat": 10.7203, "lng": 124.0325, "elevation": 560}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kapayas'), 'Kapayas Extreme Peak', 'Very hard climb to jagged summit with technical rock sections', 8.0, 282, 'Very Hard', 'point_to_point', 710, '[{"lat": 10.7050, "lng": 124.0152, "elevation": 0}, {"lat": 10.7100, "lng": 124.0200, "elevation": 140}, {"lat": 10.7150, "lng": 124.0250, "elevation": 320}, {"lat": 10.7190, "lng": 124.0300, "elevation": 520}, {"lat": 10.7220, "lng": 124.0348, "elevation": 710}]', true, NOW(), NOW()),

-- Mount Hambubuyog routes
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Hambubuyog'), 'Hambubuyog Meadow Trail', 'Easy trail through rolling meadows with gentle elevation', 2.0, 60, 'Easy', 'out_and_back', 130, '[{"lat": 9.5661, "lng": 123.3470, "elevation": 0}, {"lat": 9.5680, "lng": 123.3502, "elevation": 130}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Hambubuyog'), 'Hambubuyog Ridge Walk', 'Easy-moderate ridge walk with spectacular sea views', 2.9, 96, 'Easy-Moderate', 'out_and_back', 210, '[{"lat": 9.5639, "lng": 123.3445, "elevation": 0}, {"lat": 9.5680, "lng": 123.3502, "elevation": 210}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Hambubuyog'), 'Hambubuyog Hill Loop', 'Moderate loop trail on forested slopes', 4.4, 138, 'Moderate', 'loop', 380, '[{"lat": 9.5620, "lng": 123.3421, "elevation": 0}, {"lat": 9.5660, "lng": 123.3470, "elevation": 180}, {"lat": 9.5705, "lng": 123.3528, "elevation": 380}, {"lat": 9.5670, "lng": 123.3490, "elevation": 250}, {"lat": 9.5620, "lng": 123.3421, "elevation": 0}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Hambubuyog'), 'Hambubuyog Traverse', 'Hard traverse with steep ridge climbs', 6.2, 204, 'Hard', 'point_to_point', 520, '[{"lat": 9.5599, "lng": 123.3398, "elevation": 0}, {"lat": 9.5640, "lng": 123.3440, "elevation": 140}, {"lat": 9.5690, "lng": 123.3500, "elevation": 350}, {"lat": 9.5731, "lng": 123.3552, "elevation": 520}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Hambubuyog'), 'Hambubuyog Extreme', 'Very hard long ridgeline traverse for experienced hikers', 7.7, 276, 'Very Hard', 'point_to_point', 690, '[{"lat": 9.5572, "lng": 123.3370, "elevation": 0}, {"lat": 9.5610, "lng": 123.3420, "elevation": 120}, {"lat": 9.5660, "lng": 123.3480, "elevation": 280}, {"lat": 9.5710, "lng": 123.3530, "elevation": 480}, {"lat": 9.5752, "lng": 123.3579, "elevation": 690}]', true, NOW(), NOW()),

-- Mount Mauyog routes
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Mauyog'), 'Mauyog Short Trail', 'Easy trail to unique rock towers with minimal elevation gain', 1.9, 60, 'Easy', 'out_and_back', 150, '[{"lat": 10.5031, "lng": 123.7952, "elevation": 0}, {"lat": 10.5052, "lng": 123.7981, "elevation": 150}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Mauyog'), 'Mauyog Ridge Path', 'Easy-moderate scenic ridge trail with panoramic views', 2.8, 90, 'Easy-Moderate', 'out_and_back', 210, '[{"lat": 10.5010, "lng": 123.7925, "elevation": 0}, {"lat": 10.5052, "lng": 123.7981, "elevation": 210}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Mauyog'), 'Mauyog Loop Trail', 'Moderate loop with excellent summit views', 4.5, 144, 'Moderate', 'loop', 390, '[{"lat": 10.4989, "lng": 123.7901, "elevation": 0}, {"lat": 10.5030, "lng": 123.7950, "elevation": 180}, {"lat": 10.5072, "lng": 123.8005, "elevation": 390}, {"lat": 10.5040, "lng": 123.7970, "elevation": 250}, {"lat": 10.4989, "lng": 123.7901, "elevation": 0}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Mauyog'), 'Mauyog Traverse', 'Hard traverse with steep scrambles and technical sections', 6.0, 198, 'Hard', 'point_to_point', 550, '[{"lat": 10.4961, "lng": 123.7879, "elevation": 0}, {"lat": 10.5000, "lng": 123.7920, "elevation": 150}, {"lat": 10.5050, "lng": 123.7980, "elevation": 370}, {"lat": 10.5091, "lng": 123.8032, "elevation": 550}]', true, NOW(), NOW()),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Mauyog'), 'Mauyog Extreme Climb', 'Very hard exposed rocky ridge climb with technical challenges', 7.9, 276, 'Very Hard', 'point_to_point', 710, '[{"lat": 10.4932, "lng": 123.7852, "elevation": 0}, {"lat": 10.4970, "lng": 123.7900, "elevation": 130}, {"lat": 10.5020, "lng": 123.7960, "elevation": 320}, {"lat": 10.5070, "lng": 123.8020, "elevation": 540}, {"lat": 10.5112, "lng": 123.8060, "elevation": 710}]', true, NOW(), NOW());

-- Verify the insertions
SELECT 'Hiking Spots Added:' as info;
SELECT hiking_spot_id, name, location, latitude, longitude FROM hiking_spots 
WHERE name IN ('Mount Lanaya', 'Mount Lantoy', 'Mount Kapayas', 'Mount Hambubuyog', 'Mount Mauyog')
ORDER BY name;

SELECT 'Trail Routes Added:' as info;
SELECT tr.route_id, hs.name as mountain_name, tr.name as trail_name, tr.length, tr.difficulty, tr.trail_type
FROM trail_routes tr
JOIN hiking_spots hs ON tr.hiking_spot_id = hs.hiking_spot_id
WHERE hs.name IN ('Mount Lanaya', 'Mount Lantoy', 'Mount Kapayas', 'Mount Hambubuyog', 'Mount Mauyog')
ORDER BY hs.name, tr.difficulty, tr.length;