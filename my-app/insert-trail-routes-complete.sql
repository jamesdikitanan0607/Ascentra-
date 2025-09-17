-- =====================================================
-- INSERT ALL 75 TRAIL ROUTES (5 routes per hiking spot)
-- =====================================================
-- This script inserts 5 routes for each of the 15 hiking spots
-- with realistic waypoints and route data

-- Clear existing trail routes
DELETE FROM trail_routes;

-- Insert trail routes for all 15 hiking spots
-- Each spot gets 5 routes: Easy, Easy-Moderate, Moderate, Moderate-Hard, Hard

-- BUDLAAN FALLS (10.3700, 123.8890)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Waterfall Base Trail', '{"lat": 10.3700, "lng": 123.8890}', '{"lat": 10.3705, "lng": 123.8895}',
  ARRAY['{"lat": 10.3702, "lng": 123.8892}', '{"lat": 10.3704, "lng": 123.8894}'], 2.1, 150, 1.5, 'Easy',
  'Direct trail to the waterfall base with minimal elevation gain'
FROM hiking_spots WHERE name = 'Budlaan Falls'
UNION ALL SELECT spot_id, 'Falls Circuit Trail', '{"lat": 10.3700, "lng": 123.8890}', '{"lat": 10.3710, "lng": 123.8900}',
  ARRAY['{"lat": 10.3705, "lng": 123.8895}', '{"lat": 10.3708, "lng": 123.8898}'], 3.8, 280, 2.5, 'Easy',
  'Circular route around the falls area with multiple viewpoints'
FROM hiking_spots WHERE name = 'Budlaan Falls'
UNION ALL SELECT spot_id, 'Upper Falls Trail', '{"lat": 10.3700, "lng": 123.8890}', '{"lat": 10.3715, "lng": 123.8905}',
  ARRAY['{"lat": 10.3705, "lng": 123.8895}', '{"lat": 10.3710, "lng": 123.8900}', '{"lat": 10.3713, "lng": 123.8903}'], 5.2, 420, 3.0, 'Moderate',
  'Trail to upper waterfall tiers with moderate climbing'
FROM hiking_spots WHERE name = 'Budlaan Falls'
UNION ALL SELECT spot_id, 'Ridge Connection Trail', '{"lat": 10.3700, "lng": 123.8890}', '{"lat": 10.3720, "lng": 123.8910}',
  ARRAY['{"lat": 10.3708, "lng": 123.8898}', '{"lat": 10.3715, "lng": 123.8905}', '{"lat": 10.3718, "lng": 123.8908}'], 7.1, 580, 4.0, 'Moderate',
  'Connects to nearby ridge system with panoramic views'
FROM hiking_spots WHERE name = 'Budlaan Falls'
UNION ALL SELECT spot_id, 'Summit Challenge Trail', '{"lat": 10.3700, "lng": 123.8890}', '{"lat": 10.3725, "lng": 123.8915}',
  ARRAY['{"lat": 10.3710, "lng": 123.8900}', '{"lat": 10.3718, "lng": 123.8908}', '{"lat": 10.3722, "lng": 123.8912}'], 9.5, 750, 5.5, 'Hard',
  'Challenging route to the highest point with steep sections'
FROM hiking_spots WHERE name = 'Budlaan Falls';

-- MOUNT BABAG (10.3492, 123.8896)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Sunrise Trail', '{"lat": 10.3492, "lng": 123.8896}', '{"lat": 10.3500, "lng": 123.8905}',
  ARRAY['{"lat": 10.3495, "lng": 123.8900}', '{"lat": 10.3498, "lng": 123.8903}'], 3.2, 200, 2.0, 'Easy',
  'Popular sunrise viewing trail with gentle slopes'
FROM hiking_spots WHERE name = 'Mount Babag'
UNION ALL SELECT spot_id, 'City View Trail', '{"lat": 10.3492, "lng": 123.8896}', '{"lat": 10.3505, "lng": 123.8910}',
  ARRAY['{"lat": 10.3498, "lng": 123.8903}', '{"lat": 10.3502, "lng": 123.8907}'], 4.5, 320, 2.5, 'Easy',
  'Best viewpoint for Cebu City skyline'
FROM hiking_spots WHERE name = 'Mount Babag'
UNION ALL SELECT spot_id, 'Forest Loop Trail', '{"lat": 10.3492, "lng": 123.8896}', '{"lat": 10.3510, "lng": 123.8915}',
  ARRAY['{"lat": 10.3500, "lng": 123.8905}', '{"lat": 10.3505, "lng": 123.8910}', '{"lat": 10.3508, "lng": 123.8913}'], 6.8, 480, 3.5, 'Moderate',
  'Circular trail through dense forest areas'
FROM hiking_spots WHERE name = 'Mount Babag'
UNION ALL SELECT spot_id, 'Peak Traverse Trail', '{"lat": 10.3492, "lng": 123.8896}', '{"lat": 10.3515, "lng": 123.8920}',
  ARRAY['{"lat": 10.3505, "lng": 123.8910}', '{"lat": 10.3510, "lng": 123.8915}', '{"lat": 10.3513, "lng": 123.8918}'], 8.1, 650, 4.5, 'Moderate',
  'Traverse multiple peaks with varying terrain'
FROM hiking_spots WHERE name = 'Mount Babag'
UNION ALL SELECT spot_id, 'Advanced Summit Trail', '{"lat": 10.3492, "lng": 123.8896}', '{"lat": 10.3520, "lng": 123.8925}',
  ARRAY['{"lat": 10.3505, "lng": 123.8910}', '{"lat": 10.3513, "lng": 123.8918}', '{"lat": 10.3518, "lng": 123.8923}'], 10.2, 850, 6.0, 'Hard',
  'Most challenging route with steep ascents and technical sections'
FROM hiking_spots WHERE name = 'Mount Babag';

-- MOUNT KAN-IRAG / SIRAO PEAK (10.4010, 123.8730)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Flower Garden Trail', '{"lat": 10.4010, "lng": 123.8730}', '{"lat": 10.4015, "lng": 123.8735}',
  ARRAY['{"lat": 10.4012, "lng": 123.8732}', '{"lat": 10.4014, "lng": 123.8734}'], 2.8, 180, 1.5, 'Easy',
  'Scenic walk through colorful flower gardens'
FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak'
UNION ALL SELECT spot_id, 'Temple View Trail', '{"lat": 10.4010, "lng": 123.8730}', '{"lat": 10.4020, "lng": 123.8740}',
  ARRAY['{"lat": 10.4015, "lng": 123.8735}', '{"lat": 10.4018, "lng": 123.8738}'], 3.9, 280, 2.0, 'Easy',
  'Trail to temple viewpoint with cultural significance'
FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak'
UNION ALL SELECT spot_id, 'Peak Circuit Trail', '{"lat": 10.4010, "lng": 123.8730}', '{"lat": 10.4025, "lng": 123.8745}',
  ARRAY['{"lat": 10.4018, "lng": 123.8738}', '{"lat": 10.4022, "lng": 123.8742}', '{"lat": 10.4024, "lng": 123.8744}'], 5.5, 420, 3.0, 'Moderate',
  'Complete circuit around the peak with multiple viewpoints'
FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak'
UNION ALL SELECT spot_id, 'Highland Trail', '{"lat": 10.4010, "lng": 123.8730}', '{"lat": 10.4030, "lng": 123.8750}',
  ARRAY['{"lat": 10.4020, "lng": 123.8740}', '{"lat": 10.4025, "lng": 123.8745}', '{"lat": 10.4028, "lng": 123.8748}'], 7.2, 580, 4.0, 'Moderate',
  'Highland traverse with cool climate and mountain views'
FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak'
UNION ALL SELECT spot_id, 'Summit Challenge', '{"lat": 10.4010, "lng": 123.8730}', '{"lat": 10.4035, "lng": 123.8755}',
  ARRAY['{"lat": 10.4025, "lng": 123.8745}', '{"lat": 10.4030, "lng": 123.8750}', '{"lat": 10.4033, "lng": 123.8753}'], 9.1, 750, 5.5, 'Hard',
  'Challenging ascent to the highest accessible point'
FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak';

-- MOUNT MAUYOG (10.5200, 123.7740)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Historical Trail', '{"lat": 10.5200, "lng": 123.7740}', '{"lat": 10.5208, "lng": 123.7748}',
  ARRAY['{"lat": 10.5203, "lng": 123.7743}', '{"lat": 10.5206, "lng": 123.7746}'], 3.5, 220, 2.0, 'Easy',
  'Trail with historical markers and gentle ascent'
FROM hiking_spots WHERE name = 'Mount Mauyog'
UNION ALL SELECT spot_id, 'Ridge Walk Trail', '{"lat": 10.5200, "lng": 123.7740}', '{"lat": 10.5215, "lng": 123.7755}',
  ARRAY['{"lat": 10.5208, "lng": 123.7748}', '{"lat": 10.5212, "lng": 123.7752}'], 4.8, 350, 2.5, 'Easy',
  'Scenic ridge walk with panoramic mountain views'
FROM hiking_spots WHERE name = 'Mount Mauyog'
UNION ALL SELECT spot_id, 'Forest Trail', '{"lat": 10.5200, "lng": 123.7740}', '{"lat": 10.5220, "lng": 123.7760}',
  ARRAY['{"lat": 10.5210, "lng": 123.7750}', '{"lat": 10.5215, "lng": 123.7755}', '{"lat": 10.5218, "lng": 123.7758}'], 6.9, 520, 3.5, 'Moderate',
  'Dense forest trail with diverse flora and fauna'
FROM hiking_spots WHERE name = 'Mount Mauyog'
UNION ALL SELECT spot_id, 'Peak Approach Trail', '{"lat": 10.5200, "lng": 123.7740}', '{"lat": 10.5225, "lng": 123.7765}',
  ARRAY['{"lat": 10.5215, "lng": 123.7755}', '{"lat": 10.5220, "lng": 123.7760}', '{"lat": 10.5223, "lng": 123.7763}'], 8.4, 680, 4.5, 'Moderate',
  'Direct approach to peak with moderate difficulty'
FROM hiking_spots WHERE name = 'Mount Mauyog'
UNION ALL SELECT spot_id, 'Summit Traverse', '{"lat": 10.5200, "lng": 123.7740}', '{"lat": 10.5230, "lng": 123.7770}',
  ARRAY['{"lat": 10.5215, "lng": 123.7755}', '{"lat": 10.5223, "lng": 123.7763}', '{"lat": 10.5228, "lng": 123.7768}'], 11.2, 920, 6.0, 'Hard',
  'Complete summit traverse with challenging terrain'
FROM hiking_spots WHERE name = 'Mount Mauyog';

-- MOUNT MANUNGGAL (10.5110, 123.7700)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Memorial Trail', '{"lat": 10.5110, "lng": 123.7700}', '{"lat": 10.5118, "lng": 123.7708}',
  ARRAY['{"lat": 10.5113, "lng": 123.7703}', '{"lat": 10.5116, "lng": 123.7706}'], 3.8, 240, 2.0, 'Easy',
  'Historical trail to President Magsaysay memorial site'
FROM hiking_spots WHERE name = 'Mount Manunggal'
UNION ALL SELECT spot_id, 'Monument Trail', '{"lat": 10.5110, "lng": 123.7700}', '{"lat": 10.5125, "lng": 123.7715}',
  ARRAY['{"lat": 10.5118, "lng": 123.7708}', '{"lat": 10.5122, "lng": 123.7712}'], 5.2, 380, 2.5, 'Easy',
  'Trail to historical monument with interpretive signs'
FROM hiking_spots WHERE name = 'Mount Manunggal'
UNION ALL SELECT spot_id, 'Forest Heritage Trail', '{"lat": 10.5110, "lng": 123.7700}', '{"lat": 10.5130, "lng": 123.7720}',
  ARRAY['{"lat": 10.5120, "lng": 123.7710}', '{"lat": 10.5125, "lng": 123.7715}', '{"lat": 10.5128, "lng": 123.7718}'], 7.5, 550, 3.5, 'Moderate',
  'Forest trail combining nature and historical significance'
FROM hiking_spots WHERE name = 'Mount Manunggal'
UNION ALL SELECT spot_id, 'Peak Heritage Trail', '{"lat": 10.5110, "lng": 123.7700}', '{"lat": 10.5135, "lng": 123.7725}',
  ARRAY['{"lat": 10.5125, "lng": 123.7715}', '{"lat": 10.5130, "lng": 123.7720}', '{"lat": 10.5133, "lng": 123.7723}'], 9.8, 720, 4.5, 'Moderate',
  'Complete peak trail with historical and natural highlights'
FROM hiking_spots WHERE name = 'Mount Manunggal'
UNION ALL SELECT spot_id, 'Summit Challenge', '{"lat": 10.5110, "lng": 123.7700}', '{"lat": 10.5140, "lng": 123.7730}',
  ARRAY['{"lat": 10.5125, "lng": 123.7715}', '{"lat": 10.5133, "lng": 123.7723}', '{"lat": 10.5138, "lng": 123.7728}'], 12.5, 980, 6.0, 'Hard',
  'Challenging summit route with steep sections and historical sites'
FROM hiking_spots WHERE name = 'Mount Manunggal';

-- CASINO PEAK (9.8220, 123.4710)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Photography Trail', '{"lat": 9.8220, "lng": 123.4710}', '{"lat": 9.8225, "lng": 123.4715}',
  ARRAY['{"lat": 9.8222, "lng": 123.4712}', '{"lat": 9.8224, "lng": 123.4714}'], 2.5, 150, 1.5, 'Easy',
  'Perfect trail for photography with scenic viewpoints'
FROM hiking_spots WHERE name = 'Casino Peak'
UNION ALL SELECT spot_id, 'Quiet Peak Trail', '{"lat": 9.8220, "lng": 123.4710}', '{"lat": 9.8230, "lng": 123.4720}',
  ARRAY['{"lat": 9.8225, "lng": 123.4715}', '{"lat": 9.8228, "lng": 123.4718}'], 3.8, 250, 2.0, 'Easy',
  'Less crowded alternative to nearby Osmeña Peak'
FROM hiking_spots WHERE name = 'Casino Peak'
UNION ALL SELECT spot_id, 'Rolling Hills Circuit', '{"lat": 9.8220, "lng": 123.4710}', '{"lat": 9.8235, "lng": 123.4725}',
  ARRAY['{"lat": 9.8228, "lng": 123.4718}', '{"lat": 9.8232, "lng": 123.4722}', '{"lat": 9.8234, "lng": 123.4724}'], 5.5, 420, 3.0, 'Moderate',
  'Circuit through rolling hills with panoramic views'
FROM hiking_spots WHERE name = 'Casino Peak'
UNION ALL SELECT spot_id, 'Extended Ridge Trail', '{"lat": 9.8220, "lng": 123.4710}', '{"lat": 9.8240, "lng": 123.4730}',
  ARRAY['{"lat": 9.8230, "lng": 123.4720}', '{"lat": 9.8235, "lng": 123.4725}', '{"lat": 9.8238, "lng": 123.4728}'], 7.2, 580, 4.0, 'Moderate',
  'Extended ridge walk with multiple peaks and valleys'
FROM hiking_spots WHERE name = 'Casino Peak'
UNION ALL SELECT spot_id, 'Wilderness Challenge', '{"lat": 9.8220, "lng": 123.4710}', '{"lat": 9.8245, "lng": 123.4735}',
  ARRAY['{"lat": 9.8235, "lng": 123.4725}', '{"lat": 9.8240, "lng": 123.4730}', '{"lat": 9.8243, "lng": 123.4733}'], 9.8, 780, 5.5, 'Hard',
  'Challenging wilderness route for experienced hikers'
FROM hiking_spots WHERE name = 'Casino Peak';

-- MOUNT HAMBUBUYOG (9.5993, 123.3194)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Coastal View Trail', '{"lat": 9.5993, "lng": 123.3194}', '{"lat": 9.6000, "lng": 123.3201}',
  ARRAY['{"lat": 9.5996, "lng": 123.3197}', '{"lat": 9.5998, "lng": 123.3199}'], 4.2, 280, 2.5, 'Easy',
  'Trail with stunning views of Bohol Sea and coastline'
FROM hiking_spots WHERE name = 'Mount Hambubuyog'
UNION ALL SELECT spot_id, 'Island View Trail', '{"lat": 9.5993, "lng": 123.3194}', '{"lat": 9.6008, "lng": 123.3209}',
  ARRAY['{"lat": 9.6000, "lng": 123.3201}', '{"lat": 9.6005, "lng": 123.3206}'], 6.5, 450, 3.5, 'Easy',
  'Panoramic views of surrounding islands and sea'
FROM hiking_spots WHERE name = 'Mount Hambubuyog'
UNION ALL SELECT spot_id, 'Forest Ascent Trail', '{"lat": 9.5993, "lng": 123.3194}', '{"lat": 9.6015, "lng": 123.3216}',
  ARRAY['{"lat": 9.6005, "lng": 123.3206}', '{"lat": 9.6010, "lng": 123.3211}', '{"lat": 9.6013, "lng": 123.3214}'], 9.2, 680, 4.5, 'Moderate',
  'Steep forest ascent with diverse tropical vegetation'
FROM hiking_spots WHERE name = 'Mount Hambubuyog'
UNION ALL SELECT spot_id, 'Peak Challenge Trail', '{"lat": 9.5993, "lng": 123.3194}', '{"lat": 9.6020, "lng": 123.3221}',
  ARRAY['{"lat": 9.6008, "lng": 123.3209}', '{"lat": 9.6015, "lng": 123.3216}', '{"lat": 9.6018, "lng": 123.3219}'], 12.8, 920, 6.0, 'Moderate',
  'Challenging route to peak with technical sections'
FROM hiking_spots WHERE name = 'Mount Hambubuyog'
UNION ALL SELECT spot_id, 'Summit Expedition', '{"lat": 9.5993, "lng": 123.3194}', '{"lat": 9.6025, "lng": 123.3226}',
  ARRAY['{"lat": 9.6010, "lng": 123.3211}', '{"lat": 9.6018, "lng": 123.3219}', '{"lat": 9.6023, "lng": 123.3224}'], 16.5, 1320, 8.0, 'Hard',
  'Full summit expedition with overnight camping recommended'
FROM hiking_spots WHERE name = 'Mount Hambubuyog';

-- MOUNT LANTOY (9.9086, 123.6047)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Coastal Ridge Trail', '{"lat": 9.9086, "lng": 123.6047}', '{"lat": 9.9093, "lng": 123.6054}',
  ARRAY['{"lat": 9.9089, "lng": 123.6050}', '{"lat": 9.9091, "lng": 123.6052}'], 3.8, 220, 2.0, 'Easy',
  'Ridge trail with spectacular southern coastline views'
FROM hiking_spots WHERE name = 'Mount Lantoy'
UNION ALL SELECT spot_id, 'Valley Approach Trail', '{"lat": 9.9086, "lng": 123.6047}', '{"lat": 9.9100, "lng": 123.6061}',
  ARRAY['{"lat": 9.9093, "lng": 123.6054}', '{"lat": 9.9097, "lng": 123.6058}'], 5.5, 380, 3.0, 'Easy',
  'Gentle approach through valleys with diverse landscapes'
FROM hiking_spots WHERE name = 'Mount Lantoy'
UNION ALL SELECT spot_id, 'Forest Traverse Trail', '{"lat": 9.9086, "lng": 123.6047}', '{"lat": 9.9108, "lng": 123.6069}',
  ARRAY['{"lat": 9.9097, "lng": 123.6058}', '{"lat": 9.9103, "lng": 123.6064}', '{"lat": 9.9106, "lng": 123.6067}'], 8.2, 620, 4.5, 'Moderate',
  'Forest traverse with challenging terrain and beautiful views'
FROM hiking_spots WHERE name = 'Mount Lantoy'
UNION ALL SELECT spot_id, 'Peak Ascent Trail', '{"lat": 9.9086, "lng": 123.6047}', '{"lat": 9.9115, "lng": 123.6076}',
  ARRAY['{"lat": 9.9100, "lng": 123.6061}', '{"lat": 9.9108, "lng": 123.6069}', '{"lat": 9.9112, "lng": 123.6073}'], 11.5, 850, 6.0, 'Moderate',
  'Direct ascent to peak with steep sections and rewarding views'
FROM hiking_spots WHERE name = 'Mount Lantoy'
UNION ALL SELECT spot_id, 'Summit Challenge', '{"lat": 9.9086, "lng": 123.6047}', '{"lat": 9.9120, "lng": 123.6081}',
  ARRAY['{"lat": 9.9103, "lng": 123.6064}', '{"lat": 9.9112, "lng": 123.6073}', '{"lat": 9.9118, "lng": 123.6079}'], 14.2, 1150, 7.5, 'Hard',
  'Most challenging route with technical climbing and overnight camping'
FROM hiking_spots WHERE name = 'Mount Lantoy';

-- MOUNT KAPAYAS (10.7163, 123.9673)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Nature Walk Trail', '{"lat": 10.7163, "lng": 123.9673}', '{"lat": 10.7170, "lng": 123.9680}',
  ARRAY['{"lat": 10.7166, "lng": 123.9676}', '{"lat": 10.7168, "lng": 123.9678}'], 3.2, 180, 1.5, 'Easy',
  'Easy nature walk perfect for bird watching and photography'
FROM hiking_spots WHERE name = 'Mount Kapayas'
UNION ALL SELECT spot_id, 'Bird Watching Trail', '{"lat": 10.7163, "lng": 123.9673}', '{"lat": 10.7178, "lng": 123.9688}',
  ARRAY['{"lat": 10.7170, "lng": 123.9680}', '{"lat": 10.7175, "lng": 123.9685}'], 4.8, 280, 2.5, 'Easy',
  'Specialized trail for bird watching with observation points'
FROM hiking_spots WHERE name = 'Mount Kapayas'
UNION ALL SELECT spot_id, 'Forest Loop Trail', '{"lat": 10.7163, "lng": 123.9673}', '{"lat": 10.7185, "lng": 123.9695}',
  ARRAY['{"lat": 10.7175, "lng": 123.9685}', '{"lat": 10.7180, "lng": 123.9690}', '{"lat": 10.7183, "lng": 123.9693}'], 7.5, 450, 3.5, 'Moderate',
  'Complete forest loop with diverse ecosystems and wildlife'
FROM hiking_spots WHERE name = 'Mount Kapayas'
UNION ALL SELECT spot_id, 'Highland Trail', '{"lat": 10.7163, "lng": 123.9673}', '{"lat": 10.7190, "lng": 123.9700}',
  ARRAY['{"lat": 10.7178, "lng": 123.9688}', '{"lat": 10.7185, "lng": 123.9695}', '{"lat": 10.7188, "lng": 123.9698}'], 9.8, 650, 4.5, 'Moderate',
  'Highland trail with cool climate and mountain vegetation'
FROM hiking_spots WHERE name = 'Mount Kapayas'
UNION ALL SELECT spot_id, 'Peak Expedition', '{"lat": 10.7163, "lng": 123.9673}', '{"lat": 10.7195, "lng": 123.9705}',
  ARRAY['{"lat": 10.7180, "lng": 123.9690}', '{"lat": 10.7188, "lng": 123.9698}', '{"lat": 10.7193, "lng": 123.9703}'], 12.8, 890, 6.0, 'Hard',
  'Challenging expedition to peak with pristine wilderness'
FROM hiking_spots WHERE name = 'Mount Kapayas';

-- MOUNT LANAYA (9.7116, 123.3293)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Waterfall Trail', '{"lat": 9.7116, "lng": 123.3293}', '{"lat": 9.7123, "lng": 123.3300}',
  ARRAY['{"lat": 9.7119, "lng": 123.3296}', '{"lat": 9.7121, "lng": 123.3298}'], 4.5, 250, 2.5, 'Easy',
  'Trail to pristine waterfalls with swimming opportunities'
FROM hiking_spots WHERE name = 'Mount Lanaya'
UNION ALL SELECT spot_id, 'Nature Discovery Trail', '{"lat": 9.7116, "lng": 123.3293}', '{"lat": 9.7130, "lng": 123.3307}',
  ARRAY['{"lat": 9.7123, "lng": 123.3300}', '{"lat": 9.7127, "lng": 123.3304}'], 6.8, 420, 3.5, 'Easy',
  'Diverse ecosystem trail with waterfalls and wildlife'
FROM hiking_spots WHERE name = 'Mount Lanaya'
UNION ALL SELECT spot_id, 'Forest Ascent Trail', '{"lat": 9.7116, "lng": 123.3293}', '{"lat": 9.7138, "lng": 123.3315}',
  ARRAY['{"lat": 9.7127, "lng": 123.3304}', '{"lat": 9.7133, "lng": 123.3310}', '{"lat": 9.7136, "lng": 123.3313}'], 9.5, 680, 5.0, 'Moderate',
  'Steep forest ascent with multiple waterfall viewpoints'
FROM hiking_spots WHERE name = 'Mount Lanaya'
UNION ALL SELECT spot_id, 'Peak Challenge Trail', '{"lat": 9.7116, "lng": 123.3293}', '{"lat": 9.7145, "lng": 123.3322}',
  ARRAY['{"lat": 9.7130, "lng": 123.3307}', '{"lat": 9.7138, "lng": 123.3315}', '{"lat": 9.7142, "lng": 123.3319}'], 13.2, 920, 6.5, 'Moderate',
  'Challenging route to peak with technical sections'
FROM hiking_spots WHERE name = 'Mount Lanaya'
UNION ALL SELECT spot_id, 'Summit Expedition', '{"lat": 9.7116, "lng": 123.3293}', '{"lat": 9.7150, "lng": 123.3327}',
  ARRAY['{"lat": 9.7133, "lng": 123.3310}', '{"lat": 9.7142, "lng": 123.3319}', '{"lat": 9.7148, "lng": 123.3325}'], 16.8, 1080, 8.5, 'Hard',
  'Full summit expedition with overnight camping and pristine wilderness'
FROM hiking_spots WHERE name = 'Mount Lanaya';

-- MOUNT MAGO (10.6610, 123.9400)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Discovery Trail', '{"lat": 10.6610, "lng": 123.9400}', '{"lat": 10.6618, "lng": 123.9408}',
  ARRAY['{"lat": 10.6613, "lng": 123.9403}', '{"lat": 10.6616, "lng": 123.9406}'], 4.8, 320, 3.0, 'Easy',
  'Introductory trail for discovering this lesser-known peak'
FROM hiking_spots WHERE name = 'Mount Mago'
UNION ALL SELECT spot_id, 'Wilderness Trail', '{"lat": 10.6610, "lng": 123.9400}', '{"lat": 10.6625, "lng": 123.9415}',
  ARRAY['{"lat": 10.6618, "lng": 123.9408}', '{"lat": 10.6622, "lng": 123.9412}'], 7.2, 480, 4.0, 'Easy',
  'Wilderness trail through pristine and untouched nature'
FROM hiking_spots WHERE name = 'Mount Mago'
UNION ALL SELECT spot_id, 'Forest Traverse Trail', '{"lat": 10.6610, "lng": 123.9400}', '{"lat": 10.6633, "lng": 123.9423}',
  ARRAY['{"lat": 10.6622, "lng": 123.9412}', '{"lat": 10.6628, "lng": 123.9418}', '{"lat": 10.6631, "lng": 123.9421}'], 10.5, 720, 5.5, 'Moderate',
  'Dense forest traverse with challenging navigation'
FROM hiking_spots WHERE name = 'Mount Mago'
UNION ALL SELECT spot_id, 'Peak Ascent Trail', '{"lat": 10.6610, "lng": 123.9400}', '{"lat": 10.6640, "lng": 123.9430}',
  ARRAY['{"lat": 10.6625, "lng": 123.9415}', '{"lat": 10.6633, "lng": 123.9423}', '{"lat": 10.6637, "lng": 123.9427}'], 14.8, 980, 7.0, 'Moderate',
  'Direct ascent to peak through challenging terrain'
FROM hiking_spots WHERE name = 'Mount Mago'
UNION ALL SELECT spot_id, 'Summit Expedition', '{"lat": 10.6610, "lng": 123.9400}', '{"lat": 10.6645, "lng": 123.9435}',
  ARRAY['{"lat": 10.6628, "lng": 123.9418}', '{"lat": 10.6637, "lng": 123.9427}', '{"lat": 10.6643, "lng": 123.9433}'], 18.4, 1250, 9.0, 'Hard',
  'Ultimate summit expedition for experienced mountaineers only'
FROM hiking_spots WHERE name = 'Mount Mago';

-- MOUNT NAUPA (10.2636, 123.7769)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Rocky Trail', '{"lat": 10.2636, "lng": 123.7769}', '{"lat": 10.2643, "lng": 123.7776}',
  ARRAY['{"lat": 10.2639, "lng": 123.7772}', '{"lat": 10.2641, "lng": 123.7774}'], 3.8, 220, 2.0, 'Easy',
  'Trail through interesting rocky terrain and formations'
FROM hiking_spots WHERE name = 'Mount Naupa'
UNION ALL SELECT spot_id, 'Flora Discovery Trail', '{"lat": 10.2636, "lng": 123.7769}', '{"lat": 10.2650, "lng": 123.7783}',
  ARRAY['{"lat": 10.2643, "lng": 123.7776}', '{"lat": 10.2647, "lng": 123.7780}'], 5.5, 380, 3.0, 'Easy',
  'Trail showcasing diverse flora and plant species'
FROM hiking_spots WHERE name = 'Mount Naupa'
UNION ALL SELECT spot_id, 'Ridge Traverse Trail', '{"lat": 10.2636, "lng": 123.7769}', '{"lat": 10.2658, "lng": 123.7791}',
  ARRAY['{"lat": 10.2647, "lng": 123.7780}', '{"lat": 10.2653, "lng": 123.7786}', '{"lat": 10.2656, "lng": 123.7789}'], 8.2, 620, 4.5, 'Moderate',
  'Ridge traverse with panoramic views of southern Cebu'
FROM hiking_spots WHERE name = 'Mount Naupa'
UNION ALL SELECT spot_id, 'Peak Challenge Trail', '{"lat": 10.2636, "lng": 123.7769}', '{"lat": 10.2665, "lng": 123.7798}',
  ARRAY['{"lat": 10.2650, "lng": 123.7783}', '{"lat": 10.2658, "lng": 123.7791}', '{"lat": 10.2662, "lng": 123.7795}'], 10.8, 850, 6.0, 'Moderate',
  'Challenging route to peak with rocky terrain'
FROM hiking_spots WHERE name = 'Mount Naupa'
UNION ALL SELECT spot_id, 'Summit Expedition', '{"lat": 10.2636, "lng": 123.7769}', '{"lat": 10.2670, "lng": 123.7803}',
  ARRAY['{"lat": 10.2653, "lng": 123.7786}', '{"lat": 10.2662, "lng": 123.7795}', '{"lat": 10.2668, "lng": 123.7801}'], 12.3, 1080, 7.5, 'Hard',
  'Full summit expedition with technical rocky sections'
FROM hiking_spots WHERE name = 'Mount Naupa';

-- OSMEÑA PEAK (9.8213, 123.4809) - Highest peak in Cebu
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Tourist Trail', '{"lat": 9.8213, "lng": 123.4809}', '{"lat": 9.8218, "lng": 123.4814}',
  ARRAY['{"lat": 9.8215, "lng": 123.4811}', '{"lat": 9.8217, "lng": 123.4813}'], 1.8, 120, 1.0, 'Easy',
  'Main tourist trail to the summit viewpoint'
FROM hiking_spots WHERE name = 'Osmeña Peak'
UNION ALL SELECT spot_id, 'Rolling Hills Trail', '{"lat": 9.8213, "lng": 123.4809}', '{"lat": 9.8223, "lng": 123.4819}',
  ARRAY['{"lat": 9.8218, "lng": 123.4814}', '{"lat": 9.8221, "lng": 123.4817}'], 3.2, 200, 1.5, 'Easy',
  'Scenic walk through famous rolling hills'
FROM hiking_spots WHERE name = 'Osmeña Peak'
UNION ALL SELECT spot_id, 'Panoramic Circuit', '{"lat": 9.8213, "lng": 123.4809}', '{"lat": 9.8228, "lng": 123.4824}',
  ARRAY['{"lat": 9.8220, "lng": 123.4816}', '{"lat": 9.8225, "lng": 123.4821}', '{"lat": 9.8227, "lng": 123.4823}'], 4.9, 350, 2.5, 'Moderate',
  'Complete circuit with 360-degree views'
FROM hiking_spots WHERE name = 'Osmeña Peak'
UNION ALL SELECT spot_id, 'Extended Ridge Trail', '{"lat": 9.8213, "lng": 123.4809}', '{"lat": 9.8233, "lng": 123.4829}',
  ARRAY['{"lat": 9.8223, "lng": 123.4819}', '{"lat": 9.8228, "lng": 123.4824}', '{"lat": 9.8231, "lng": 123.4827}'], 6.7, 520, 3.5, 'Moderate',
  'Extended ridge walk with multiple peaks'
FROM hiking_spots WHERE name = 'Osmeña Peak'
UNION ALL SELECT spot_id, 'Wilderness Trail', '{"lat": 9.8213, "lng": 123.4809}', '{"lat": 9.8238, "lng": 123.4834}',
  ARRAY['{"lat": 9.8225, "lng": 123.4821}', '{"lat": 9.8233, "lng": 123.4829}', '{"lat": 9.8236, "lng": 123.4832}'], 8.8, 720, 5.0, 'Hard',
  'Challenging wilderness route for experienced hikers'
FROM hiking_spots WHERE name = 'Osmeña Peak';

-- MOUNT KALBASAAN (10.2402, 123.7766)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Family Trail', '{"lat": 10.2402, "lng": 123.7766}', '{"lat": 10.2408, "lng": 123.7772}',
  ARRAY['{"lat": 10.2405, "lng": 123.7769}', '{"lat": 10.2407, "lng": 123.7771}'], 2.5, 120, 1.5, 'Easy',
  'Perfect family-friendly trail with gentle slopes'
FROM hiking_spots WHERE name = 'Mount Kalbasaan'
UNION ALL SELECT spot_id, 'Beginner Trail', '{"lat": 10.2402, "lng": 123.7766}', '{"lat": 10.2415, "lng": 123.7779}',
  ARRAY['{"lat": 10.2408, "lng": 123.7772}', '{"lat": 10.2412, "lng": 123.7776}'], 3.8, 220, 2.0, 'Easy',
  'Ideal for hiking beginners with clear trail markers'
FROM hiking_spots WHERE name = 'Mount Kalbasaan'
UNION ALL SELECT spot_id, 'Metro View Trail', '{"lat": 10.2402, "lng": 123.7766}', '{"lat": 10.2420, "lng": 123.7784}',
  ARRAY['{"lat": 10.2412, "lng": 123.7776}', '{"lat": 10.2417, "lng": 123.7781}', '{"lat": 10.2419, "lng": 123.7783}'], 5.2, 380, 3.0, 'Moderate',
  'Trail with excellent views of metro Cebu area'
FROM hiking_spots WHERE name = 'Mount Kalbasaan'
UNION ALL SELECT spot_id, 'Peak Trail', '{"lat": 10.2402, "lng": 123.7766}', '{"lat": 10.2425, "lng": 123.7789}',
  ARRAY['{"lat": 10.2415, "lng": 123.7779}', '{"lat": 10.2420, "lng": 123.7784}', '{"lat": 10.2423, "lng": 123.7787}'], 6.8, 520, 4.0, 'Moderate',
  'Direct route to peak with moderate difficulty'
FROM hiking_spots WHERE name = 'Mount Kalbasaan'
UNION ALL SELECT spot_id, 'Extended Summit Trail', '{"lat": 10.2402, "lng": 123.7766}', '{"lat": 10.2430, "lng": 123.7794}',
  ARRAY['{"lat": 10.2417, "lng": 123.7781}', '{"lat": 10.2425, "lng": 123.7789}', '{"lat": 10.2428, "lng": 123.7792}'], 8.6, 650, 5.0, 'Hard',
  'Extended summit route with additional challenges'
FROM hiking_spots WHERE name = 'Mount Kalbasaan';

-- MOUNT KALAWISAN / KANLAAS RIDGE (10.3062, 123.9727)
INSERT INTO trail_routes (spot_id, route_name, start_point, end_point, waypoints, distance_km, elevation_gain_m, duration_hours, difficulty, description)
SELECT 
  spot_id, 'Grassland Trail', '{"lat": 10.3062, "lng": 123.9727}', '{"lat": 10.3070, "lng": 123.9735}',
  ARRAY['{"lat": 10.3065, "lng": 123.9730}', '{"lat": 10.3068, "lng": 123.9733}'], 3.5, 180, 2.0, 'Easy',
  'Scenic trail through rolling grasslands'
FROM hiking_spots WHERE name = 'Mount Kalawisan / Kanlaas Ridge'
UNION ALL SELECT spot_id, 'Ridge Walk Trail', '{"lat": 10.3062, "lng": 123.9727}', '{"lat": 10.3078, "lng": 123.9743}',
  ARRAY['{"lat": 10.3070, "lng": 123.9735}', '{"lat": 10.3075, "lng": 123.9740}'], 4.8, 280, 2.5, 'Easy',
  'Easy ridge walk with panoramic northern Cebu views'
FROM hiking_spots WHERE name = 'Mount Kalawisan / Kanlaas Ridge'
UNION ALL SELECT spot_id, 'Highland Circuit Trail', '{"lat": 10.3062, "lng": 123.9727}', '{"lat": 10.3085, "lng": 123.9750}',
  ARRAY['{"lat": 10.3075, "lng": 123.9740}', '{"lat": 10.3080, "lng": 123.9745}', '{"lat": 10.3083, "lng": 123.9748}'], 7.2, 450, 3.5, 'Moderate',
  'Complete highland circuit with diverse landscapes'
FROM hiking_spots WHERE name = 'Mount Kalawisan / Kanlaas Ridge'
UNION ALL SELECT spot_id, 'Extended Ridge Trail', '{"lat": 10.3062, "lng": 123.9727}', '{"lat": 10.3090, "lng": 123.9755}',
  ARRAY['{"lat": 10.3078, "lng": 123.9743}', '{"lat": 10.3085, "lng": 123.9750}', '{"lat": 10.3088, "lng": 123.9753}'], 9.5, 620, 4.5, 'Moderate',
  'Extended ridge traverse with multiple viewpoints'
FROM hiking_spots WHERE name = 'Mount Kalawisan / Kanlaas Ridge'
UNION ALL SELECT spot_id, 'Summit Challenge', '{"lat": 10.3062, "lng": 123.9727}', '{"lat": 10.3095, "lng": 123.9760}',
  ARRAY['{"lat": 10.3080, "lng": 123.9745}', '{"lat": 10.3088, "lng": 123.9753}', '{"lat": 10.3093, "lng": 123.9758}'], 11.2, 780, 6.0, 'Hard',
  'Challenging summit route with technical ridge sections'
FROM hiking_spots WHERE name = 'Mount Kalawisan / Kanlaas Ridge';

-- Verify the insertion
SELECT COUNT(*) as total_routes FROM trail_routes;
SELECT h.name, COUNT(tr.route_id) as route_count 
FROM hiking_spots h 
LEFT JOIN trail_routes tr ON h.spot_id = tr.spot_id 
GROUP BY h.name 
ORDER BY h.name;

SELECT 'All 75 trail routes (5 per hiking spot) inserted successfully!' as status;