-- =====================================================
-- INSERT SAMPLE ROUTES DATA FOR 15 HIKING SPOTS
-- =====================================================
-- This script inserts 1-5 trail routes for each of the 15 official hiking spots
-- Run this after creating the hiking_spot_routes table

-- Add waypoints and coordinates columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hiking_spot_routes' AND column_name = 'waypoints') THEN
        ALTER TABLE hiking_spot_routes ADD COLUMN waypoints JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hiking_spot_routes' AND column_name = 'coordinates') THEN
        ALTER TABLE hiking_spot_routes ADD COLUMN coordinates JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hiking_spot_routes' AND column_name = 'route_color') THEN
        ALTER TABLE hiking_spot_routes ADD COLUMN route_color VARCHAR(7) DEFAULT '#FF6B6B';
    END IF;
END $$;

-- Temporarily disable RLS for routes table
ALTER TABLE hiking_spot_routes DISABLE ROW LEVEL SECURITY;

-- Insert routes for Mount Babag
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route,
    waypoints,
    coordinates,
    route_color
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Babag'),
    'Main Summit Trail',
    'The primary route to Mount Babag summit with well-marked trails and scenic viewpoints.',
    'Moderate',
    8.5,
    180,
    650,
    'out_and_back',
    'Well-maintained trail with some rocky sections',
    'Bring plenty of water and start early to avoid afternoon heat',
    ARRAY['Early morning', 'Late afternoon'],
    ARRAY['Summit viewpoint', 'City views', 'Sunrise spot'],
    true,
    '[{"lat": 10.3451, "lng": 123.8863}, {"lat": 10.3458, "lng": 123.8870}, {"lat": 10.3465, "lng": 123.8878}, {"lat": 10.3470, "lng": 123.8885}, {"lat": 10.3475, "lng": 123.8892}, {"lat": 10.3480, "lng": 123.8898}, {"lat": 10.3485, "lng": 123.8905}, {"lat": 10.3490, "lng": 123.8912}]',
    '[[123.8863, 10.3451], [123.8870, 10.3458], [123.8878, 10.3465], [123.8885, 10.3470], [123.8892, 10.3475], [123.8898, 10.3480], [123.8905, 10.3485], [123.8912, 10.3490]]',
    '#4CAF50'
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Babag'),
    'Scenic Loop Trail',
    'A longer loop trail that offers multiple viewpoints and a more challenging experience.',
    'Hard',
    12.3,
    240,
    750,
    'loop',
    'Some steep sections and loose rocks',
    'Experienced hikers only, inform someone of your plans',
    ARRAY['Early morning'],
    ARRAY['Multiple viewpoints', 'Forest trail', 'Wildlife spotting'],
    false,
    '[{"lat": 10.3451, "lng": 123.8863}, {"lat": 10.3455, "lng": 123.8868}, {"lat": 10.3460, "lng": 123.8872}, {"lat": 10.3468, "lng": 123.8880}, {"lat": 10.3475, "lng": 123.8887}, {"lat": 10.3482, "lng": 123.8894}, {"lat": 10.3490, "lng": 123.8902}, {"lat": 10.3495, "lng": 123.8908}, {"lat": 10.3490, "lng": 123.8915}, {"lat": 10.3485, "lng": 123.8920}, {"lat": 10.3478, "lng": 123.8918}, {"lat": 10.3470, "lng": 123.8910}, {"lat": 10.3462, "lng": 123.8902}, {"lat": 10.3455, "lng": 123.8890}, {"lat": 10.3451, "lng": 123.8863}]',
    '[[123.8863, 10.3451], [123.8868, 10.3455], [123.8872, 10.3460], [123.8880, 10.3468], [123.8887, 10.3475], [123.8894, 10.3482], [123.8902, 10.3490], [123.8908, 10.3495], [123.8915, 10.3490], [123.8920, 10.3485], [123.8918, 10.3478], [123.8910, 10.3470], [123.8902, 10.3462], [123.8890, 10.3455], [123.8863, 10.3451]]',
    '#FF6B6B'
);

-- Insert routes for Mount Kan-irag / Sirao Peak
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak'),
    'Flower Garden Trail',
    'Easy access trail through the famous Sirao flower gardens to the peak.',
    'Easy',
    6.2,
    120,
    400,
    'out_and_back',
    'Paved and dirt paths, well-maintained',
    'Can get crowded during flower season',
    ARRAY['Morning', 'Afternoon'],
    ARRAY['Flower gardens', 'Cool climate', 'Photography spots'],
    true
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak'),
    'Back Trail Route',
    'Alternative route avoiding the main flower garden area for a more natural experience.',
    'Moderate',
    7.8,
    150,
    500,
    'out_and_back',
    'Natural trail with some steep sections',
    'Less crowded but requires basic navigation skills',
    ARRAY['Early morning', 'Late afternoon'],
    ARRAY['Natural forest', 'Quiet trail', 'Bird watching'],
    false
);

-- Insert routes for Mount Naupa
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Naupa'),
    'Summit Challenge Trail',
    'The main challenging route to Mount Naupa summit with rocky terrain.',
    'Hard',
    12.3,
    300,
    880,
    'out_and_back',
    'Rocky terrain with steep ascents',
    'Experienced hikers only, bring proper gear',
    ARRAY['Early morning'],
    ARRAY['Rocky summit', 'Panoramic views', 'Challenging terrain'],
    true
);

-- Insert routes for Mount Manunggal
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal'),
    'Historical Trail',
    'Main trail to the historical crash site and monument of President Magsaysay.',
    'Moderate',
    15.7,
    240,
    780,
    'out_and_back',
    'Well-marked trail with historical markers',
    'Respect the historical site and monuments',
    ARRAY['Morning', 'Afternoon'],
    ARRAY['Historical monument', 'Memorial site', 'Mountain views'],
    true
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal'),
    'Extended Ridge Walk',
    'Longer route that includes ridge walking and additional viewpoints.',
    'Hard',
    20.5,
    360,
    950,
    'loop',
    'Exposed ridge sections, can be windy',
    'Check weather conditions, avoid during storms',
    ARRAY['Early morning'],
    ARRAY['Ridge walking', 'Extended views', 'Challenging terrain'],
    false
);

-- Insert routes for Mount Mago
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Mago'),
    'Wilderness Trail',
    'Remote trail through pristine wilderness to the summit of Mount Mago.',
    'Hard',
    18.4,
    360,
    1050,
    'out_and_back',
    'Primitive trail, requires navigation skills',
    'Inform others of plans, bring emergency supplies',
    ARRAY['Early morning'],
    ARRAY['Pristine wilderness', 'Solitude', 'Wildlife'],
    true
);

-- Insert routes for Mount Kapayas
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kapayas'),
    'Nature Trail',
    'Scenic trail through lush vegetation perfect for nature observation.',
    'Moderate',
    10.8,
    180,
    690,
    'loop',
    'Well-maintained with some muddy sections during rain',
    'Bring insect repellent and rain gear',
    ARRAY['Morning', 'Late afternoon'],
    ARRAY['Bird watching', 'Lush vegetation', 'Cool climate'],
    true
);

-- Insert routes for Mount Lantoy
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Lantoy'),
    'Coastal View Trail',
    'Challenging trail offering spectacular views of the southern coastline.',
    'Hard',
    14.2,
    300,
    950,
    'out_and_back',
    'Steep sections with loose rocks',
    'Start early, bring plenty of water',
    ARRAY['Early morning'],
    ARRAY['Coastal views', 'Challenging climb', 'Photography'],
    true
);

-- Insert routes for Mount Kalbasaan
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan'),
    'Family Trail',
    'Easy, family-friendly trail suitable for beginners and children.',
    'Easy',
    5.6,
    120,
    450,
    'out_and_back',
    'Well-maintained, gentle slopes',
    'Perfect for families with children',
    ARRAY['Morning', 'Afternoon'],
    ARRAY['Family-friendly', 'Metro views', 'Beginner trail'],
    true
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan'),
    'Extended Loop',
    'Longer loop for those wanting more exercise while staying on easy terrain.',
    'Easy',
    8.2,
    180,
    550,
    'loop',
    'Gentle terrain with some shaded sections',
    'Good for fitness training',
    ARRAY['Morning', 'Late afternoon'],
    ARRAY['Extended views', 'Fitness trail', 'Shaded sections'],
    false
);

-- Insert routes for Mount Mauyog
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Mauyog'),
    'Historical Ridge Trail',
    'Trail connecting to Mount Manunggal with historical significance.',
    'Moderate',
    13.5,
    210,
    720,
    'point_to_point',
    'Ridge trail with some exposed sections',
    'Can be combined with Mount Manunggal hike',
    ARRAY['Morning'],
    ARRAY['Historical connection', 'Ridge views', 'Mountain vistas'],
    true
);

-- Insert routes for Mount Lanaya
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Lanaya'),
    'Waterfall Trail',
    'Trail combining mountain hiking with waterfall exploration.',
    'Hard',
    16.8,
    330,
    880,
    'loop',
    'Trail includes river crossings and waterfall access',
    'Be careful near waterfalls, rocks can be slippery',
    ARRAY['Morning'],
    ARRAY['Waterfall', 'Swimming', 'Diverse ecosystem'],
    true
);

-- Insert routes for Mount Hambubuyog
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Hambubuyog'),
    'Sea View Summit Trail',
    'Challenging trail to the highest accessible point with sea views.',
    'Hard',
    19.2,
    390,
    1120,
    'out_and_back',
    'Very challenging, steep and rocky',
    'Expert hikers only, bring emergency gear',
    ARRAY['Early morning'],
    ARRAY['Sea views', 'Highest peak', 'Island views'],
    true
);

-- Insert routes for Osmeña Peak
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak'),
    'Highest Peak Trail',
    'Easy access to the highest peak in Cebu with 360-degree views.',
    'Easy',
    4.2,
    90,
    213,
    'out_and_back',
    'Well-maintained trail, can be crowded',
    'Very popular, expect crowds on weekends',
    ARRAY['Early morning', 'Late afternoon'],
    ARRAY['Highest peak', '360 views', 'Rolling hills'],
    true
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak'),
    'Extended Hills Walk',
    'Longer route exploring the surrounding rolling hills.',
    'Easy',
    7.5,
    150,
    350,
    'loop',
    'Gentle rolling terrain',
    'Bring sun protection, limited shade',
    ARRAY['Early morning', 'Late afternoon'],
    ARRAY['Rolling hills', 'Extended views', 'Photography'],
    false
);

-- Insert routes for Casino Peak
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Casino Peak'),
    'Photography Trail',
    'Less crowded alternative to Osmeña Peak with similar views.',
    'Easy',
    5.8,
    120,
    280,
    'out_and_back',
    'Good trail conditions, less crowded',
    'Great for photography, less crowded than Osmeña',
    ARRAY['Early morning', 'Late afternoon', 'Sunset'],
    ARRAY['Photography', 'Less crowded', 'Similar views to Osmeña'],
    true
);

-- Insert routes for Budlaan Falls
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls'),
    'Waterfall Trail',
    'Trail to the beautiful Budlaan Falls with swimming opportunities.',
    'Moderate',
    9.5,
    180,
    550,
    'out_and_back',
    'Trail includes river crossings',
    'Be careful on wet rocks near the falls',
    ARRAY['Morning', 'Afternoon'],
    ARRAY['Waterfall', 'Swimming', 'River crossing'],
    true
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls'),
    'Kan-irag Connection Trail',
    'Extended trail connecting to Mount Kan-irag for a full day adventure.',
    'Hard',
    15.2,
    300,
    800,
    'point_to_point',
    'Long trail requiring good fitness',
    'Full day hike, bring plenty of supplies',
    ARRAY['Early morning'],
    ARRAY['Waterfall', 'Mountain connection', 'Full day adventure'],
    false
);

-- Insert routes for Mount Kalawisan (Kanlaas Ridge)
INSERT INTO hiking_spot_routes (
    hiking_spot_id,
    route_name,
    route_description,
    difficulty,
    distance,
    estimated_duration,
    elevation_gain,
    route_type,
    trail_conditions,
    safety_notes,
    best_time_to_hike,
    route_features,
    is_main_route
) VALUES
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kalawisan (Kanlaas Ridge)'),
    'Ridge Walk Trail',
    'Scenic ridge walk with panoramic views of northern Cebu.',
    'Moderate',
    11.2,
    210,
    580,
    'out_and_back',
    'Ridge trail with grassland sections',
    'Can be windy on the ridge, bring layers',
    ARRAY['Morning', 'Late afternoon'],
    ARRAY['Ridge walking', 'Grasslands', 'Northern views'],
    true
),
(
    (SELECT id FROM hiking_spots WHERE name = 'Mount Kalawisan (Kanlaas Ridge)'),
    'Extended Grassland Loop',
    'Longer loop through the grasslands and multiple viewpoints.',
    'Moderate',
    16.8,
    280,
    720,
    'loop',
    'Open grassland with some steep sections',
    'Limited shade, bring sun protection',
    ARRAY['Early morning'],
    ARRAY['Extended grasslands', 'Multiple viewpoints', 'Open terrain'],
    false
);

-- Re-enable RLS for routes table
ALTER TABLE hiking_spot_routes ENABLE ROW LEVEL SECURITY;

-- Verify the insertion
SELECT 
    hs.name as hiking_spot,
    COUNT(hsr.id) as total_routes,
    COUNT(CASE WHEN hsr.is_main_route = true THEN 1 END) as main_routes
FROM hiking_spots hs
LEFT JOIN hiking_spot_routes hsr ON hs.id = hsr.hiking_spot_id
GROUP BY hs.name
ORDER BY hs.name;

SELECT 'Hiking spot routes inserted successfully!' as status;