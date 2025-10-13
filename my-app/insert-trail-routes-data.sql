BEGIN;

-- Mount Babag
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Ridge Easy Trail', 'Easy', 2.4, 160, 80, 'Gentle slopes, pine trees, family-friendly', 'A short, well-marked trail ideal for beginners with multiple rest points.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Summit Classic', 'Moderate', 4.6, 620, 200, 'Steeper ascent, rocky sections, great summit views', 'Standard route to the summit with panoramic views of the city and coast.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Sunrise Route', 'Moderate', 3.5, 480, 150, 'Sunrise viewpoint, photography spots', 'Popular early-morning hike for sunrise photography.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Nature Loop', 'Easy', 2.0, 200, 70, 'Birdwatching, wildflowers, shaded sections', 'Short loop emphasizing nature observation and local flora.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Challenge Trail', 'Hard', 6.0, 820, 260, 'Steep climbs, technical scramble, exposed ridges', 'A technical variant for experienced hikers seeking a challenge.', NULL, NULL, NULL, NULL);

-- Mount Kan-irag / Sirao Peak
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Sirao Flower Garden Walk', 'Easy', 2.1, 110, 60, 'Flower beds, family-friendly stroll', 'A gentle walk through the flower gardens near Sirao.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Sirao Ridge Route', 'Moderate', 3.8, 320, 130, 'Pine forest, overlooks, moderate ascent', 'Ridge trail with views over the valley and temple landmarks.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Kan-irag Summit Trail', 'Moderate', 4.4, 400, 160, 'Direct summit approach, mixed terrain', 'Main route to the highest viewpoint with varied terrain.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Sirao Photographer\'s Loop', 'Easy', 2.7, 150, 80, 'Photo spots, easy footing', 'Loop tailored for photographers with multiple vantage points.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Kan-irag Ridge Challenge', 'Hard', 6.8, 520, 240, 'Steep ridges, technical sections', 'Long ridge traverse for experienced hikers.', NULL, NULL, NULL, NULL);

-- Mount Naupa
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Village Trail', 'Easy', 2.6, 190, 90, 'Agricultural scenery, community access', 'Accessible trail passing through farms and local settlements.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Forest Path', 'Moderate', 4.5, 330, 150, 'Secondary forest, shaded canopy', 'Forest approach with natural springs and birdlife.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Summit Route', 'Moderate', 5.3, 380, 180, 'River crossings, open summit views', 'Traditional route to the summit with scenic overlooks.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Wilderness Trek', 'Hard', 7.0, 490, 260, 'Dense forest, rugged terrain', 'Longer wilderness route for seasoned trekkers.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Technical Ascent', 'Expert', 8.2, 610, 320, 'Rope-assisted sections, steep climbs', 'An expert-level ascent requiring technical gear and skills.', NULL, NULL, NULL, NULL);

-- Mount Manunggal
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Memorial Walk', 'Easy', 3.0, 220, 100, 'Historical markers, memorial site', 'A historically significant trail leading to the crash site memorial.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Classic Route', 'Moderate', 5.0, 380, 160, 'Coastal views, monument stops', 'Popular weekend route combining history and vistas.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Ridge Trail', 'Hard', 7.2, 540, 240, 'Ridge traverse, steep ascents', 'Challenging ridge walk with several viewpoints.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Heritage Loop', 'Moderate', 4.6, 350, 140, 'Well-maintained trail, interpretive markers', 'Loop that visits several historical and scenic points.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Extreme Traverse', 'Expert', 9.0, 680, 320, 'Exposed ridges, rope sections', 'Extended traverse for expert mountaineers.', NULL, NULL, NULL, NULL);

-- Mount Mago
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Mago' LIMIT 1), 'Mago Foothills Trail', 'Easy', 2.5, 180, 90, 'Farmland, community trails', 'Short route through agricultural landscapes and orchards.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Mago' LIMIT 1), 'Mago Forest Route', 'Moderate', 4.0, 320, 150, 'Dense tropical vegetation', 'Main forest approach with water sources and birdlife.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Mago' LIMIT 1), 'Mago Summit Trail', 'Moderate', 5.1, 410, 180, 'Rock outcrops, summit views', 'Direct approach to the summit with panoramic views.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Mago' LIMIT 1), 'Mago Technical Route', 'Hard', 6.7, 520, 240, 'Steep rock faces, scramble', 'Technical sections requiring careful route-finding.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Mago' LIMIT 1), 'Mago Extreme Traverse', 'Expert', 8.5, 650, 300, 'Exposed ridges, long traverse', 'Challenging long-distance traverse for experienced teams.', NULL, NULL, NULL, NULL);

-- Mount Kapayas
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Kapayas' LIMIT 1), 'Kapayas Coastal Walk', 'Easy', 2.8, 160, 90, 'Sea views, coconut groves', 'Gentle coastal mountain trail with ocean vistas.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kapayas' LIMIT 1), 'Kapayas Nature Trail', 'Moderate', 4.3, 290, 130, 'Forest sections, springs', 'Moderate climb with diverse vegetation and springs.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kapayas' LIMIT 1), 'Kapayas Summit Route', 'Moderate', 5.2, 360, 160, 'Panoramic northern coast views', 'Standard summit route offering island views.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kapayas' LIMIT 1), 'Kapayas Ridge Challenge', 'Hard', 6.9, 470, 220, 'Steep ridges, remote sections', 'Challenging ridge route with technical scrambling.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kapayas' LIMIT 1), 'Kapayas Extreme Circuit', 'Expert', 8.1, 590, 300, 'Long circuit, exposed sections', 'Extended expert-level circuit for experienced groups.', NULL, NULL, NULL, NULL);

-- Mount Lantoy
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Lantoy' LIMIT 1), 'Lantoy Beach Approach', 'Easy', 2.2, 140, 70, 'Coastal access, family-friendly', 'Short coastal trail suitable for families and beginners.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lantoy Forest Path', 'Moderate', 4.6, 330, 150, 'Coastal forest, marine views', 'Moderate climb through coastal woodland to higher vantage points.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lantoy Summit Classic', 'Moderate', 5.9, 430, 180, 'Panoramic sea and island views', 'Traditional summit route with sweeping ocean panoramas.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lantoy Ridge Adventure', 'Hard', 7.6, 560, 260, 'Coastal cliffs, technical segments', 'A challenging ridge route with steep coastal cliffs.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lantoy Extreme Traverse', 'Expert', 9.3, 690, 320, 'Exposed traverses, long distance', 'Expert-level traverse along remote coastal ridges.', NULL, NULL, NULL, NULL);

-- Mount Kalbasaan
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan' LIMIT 1), 'Kalbasaan Family Trail', 'Easy', 1.9, 120, 60, 'Picnic spots, gentle slopes', 'Short family-friendly trail with picnic areas.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan' LIMIT 1), 'Kalbasaan Nature Walk', 'Easy', 3.3, 180, 90, 'Birdwatching, interpretive signage', 'Longer nature walk through varied habitats.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan' LIMIT 1), 'Kalbasaan Summit Easy', 'Moderate', 4.7, 290, 130, 'Gradual summit approach', 'Approachable summit route with good footing.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan' LIMIT 1), 'Kalbasaan Extended Loop', 'Moderate', 6.0, 380, 180, 'Loop trail, extra viewpoints', 'Extended loop for a longer hike and extra vistas.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Kalbasaan' LIMIT 1), 'Kalbasaan Challenge Route', 'Hard', 7.7, 470, 240, 'Rocky sections, steeper grades', 'A more demanding route for fit hikers.', NULL, NULL, NULL, NULL);

-- Mount Mauyog
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Mauyog' LIMIT 1), 'Mauyog Foothills Path', 'Easy', 2.5, 150, 90, 'Farmland approach, local access trails', 'Easy approach suitable for short outings.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Mauyog Forest Trail', 'Moderate', 4.9, 330, 150, 'Forest climb, water sources', 'Moderate forest ascent with scenic river sections.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Mauyog Summit Route', 'Moderate', 6.3, 430, 210, 'Wide summit views', 'Traditional summit approach with mixed terrain.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Mauyog Ridge Challenge', 'Hard', 8.1, 560, 270, 'Ridge traverse, technical parts', 'A tough ridge route with exposed sections.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Mauyog Extreme Traverse', 'Expert', 10.0, 680, 360, 'Long exposed traverse', 'Extended expert-level route across multiple ridges.', NULL, NULL, NULL, NULL);

-- Mount Lanaya
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Lanaya' LIMIT 1), 'Lanaya Foothills Trail', 'Easy', 2.0, 100, 60, 'Gentle approach, farming areas', 'Short easy trail that passes through communities and fields.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lanaya Forest Path', 'Moderate', 4.5, 300, 150, 'Secondary forest, springs', 'Moderate climb with varied flora and small springs.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lanaya Summit Trail', 'Moderate', 5.8, 420, 210, 'Scenic southern views', 'Traditional ascent to the summit with panoramic outlooks.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lanaya Ridge Adventure', 'Hard', 7.5, 550, 270, 'Steep ridges, rock scrambles', 'A challenging ridge route for experienced hikers.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Lanaya Extreme Circuit', 'Expert', 9.0, 680, 330, 'Long circuit, technical sections', 'Extended circuit for skilled mountaineers.', NULL, NULL, NULL, NULL);

-- Mount Hambubuyog
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Hambubuyog' LIMIT 1), 'Hambubuyog Coastal Path', 'Moderate', 5.2, 350, 180, 'Sea views, coastal flora', 'Coastal mountain trail with scenic ocean panoramas.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Hambubuyog' LIMIT 1), 'Hambubuyog Summit Route', 'Hard', 7.8, 520, 270, 'Steep approaches, cliffs', 'Direct but steep route to the summit with technical steps.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Hambubuyog' LIMIT 1), 'Hambubuyog Long Traverse', 'Expert', 10.5, 720, 360, 'Exposed cliffs, long distance', 'Extended coastal traverse for experienced groups.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Hambubuyog' LIMIT 1), 'Hambubuyog Nature Walk', 'Moderate', 3.6, 220, 120, 'Wildlife viewing, short loops', 'Shorter nature-focused loop with wildlife opportunities.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Mount Hambubuyog' LIMIT 1), 'Hambubuyog Ridge Challenge', 'Hard', 6.9, 480, 210, 'Ridge scramble, technical segments', 'Challenging ridge route with some scrambling sections.', NULL, NULL, NULL, NULL);

-- Mount Kalawisan (Kanlaas Ridge)
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Kalawisan (Kanlaas Ridge)' LIMIT 1), 'Kalawisan Easy Walk', 'Easy', 3.2, 180, 90, 'Grassland ridge, easy footing', 'Gentle ridge walk with wide northern Cebu views.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Kalawisan Nature Trail', 'Moderate', 5.4, 320, 150, 'Native grasslands, birdlife', 'Moderate trail showcasing diverse grassland ecosystems.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Kalawisan Summit Route', 'Moderate', 7.0, 420, 200, 'Panoramas of islands and coast', 'Classic summit trail with extensive views.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Kalawisan Ridge Challenge', 'Hard', 9.6, 580, 280, 'Long ridge, exposed sections', 'A strenuous ridge traverse requiring good endurance.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spot_routes WHERE hiking_spot_id IS NULL LIMIT 1), 'Kalawisan Extreme Loop', 'Expert', 12.0, 720, 360, 'Very long loop, technical', 'Expert-level loop across the full Kanlaas ridge.', NULL, NULL, NULL, NULL);

-- Osmeña Peak
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak' LIMIT 1), 'Osmeña Easy Trail', 'Easy', 1.5, 100, 45, 'Short, rolling hills, panoramic views', 'Short easy trail to Cebu\'s highest accessible viewpoint.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak' LIMIT 1), 'Osmeña Classic Route', 'Easy', 2.6, 150, 75, 'Rolling hills, iconic peaks', 'Well-known approach across the serrated hills.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak' LIMIT 1), 'Osmeña Extended Walk', 'Moderate', 4.3, 280, 120, 'Longer loop, more viewpoints', 'Extended loop for additional hilltop views.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak' LIMIT 1), 'Osmeña Ridge Challenge', 'Moderate', 6.6, 380, 180, 'Ridge walking, variable terrain', 'Loop incorporating several ridgelines around the peak.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Osmeña Peak' LIMIT 1), 'Osmeña Peak Traverse', 'Hard', 8.4, 480, 240, 'Long traverse, exposed sections', 'A full traverse of the ridge system for fit hikers.', NULL, NULL, NULL, NULL);

-- Casino Peak
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Casino Peak' LIMIT 1), 'Casino Peak Easy Access', 'Easy', 2.0, 120, 60, 'Less crowded alternative to Osmeña', 'Gentle trail offering similar views with fewer people.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Casino Peak' LIMIT 1), 'Casino Nature Trail', 'Moderate', 3.9, 260, 120, 'Flora and birdlife, peaceful', 'Nature-focused trail away from main tourist tracks.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Casino Peak' LIMIT 1), 'Casino Summit Route', 'Moderate', 4.7, 330, 150, 'Panoramic hill views', 'Direct route to the summit with scenic outlooks.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Casino Peak' LIMIT 1), 'Casino Extended Loop', 'Hard', 6.3, 420, 200, 'Longer loop, varied terrain', 'Extended loop visiting multiple vantage points.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Casino Peak' LIMIT 1), 'Casino Technical Challenge', 'Hard', 7.9, 520, 260, 'Steep technical sections', 'A tougher route with scrambling and route-finding.', NULL, NULL, NULL, NULL);

-- Budlaan Falls
INSERT INTO hiking_spot_routes (...) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls' LIMIT 1), 'Budlaan Easy Approach', 'Easy', 3.5, 220, 120, 'Waterfall access, swimming spots', 'Easy approach to the falls with natural pools for swimming.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls' LIMIT 1), 'Budlaan Nature Path', 'Moderate', 5.3, 320, 180, 'Canyon views, diverse plants', 'A nature trail leading through forested canyons to the falls.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls' LIMIT 1), 'Budlaan Adventure Route', 'Hard', 7.9, 450, 270, 'River crossings, technical sections', 'A challenging route with river navigation and scrambling.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls' LIMIT 1), 'Budlaan Explorer Loop', 'Moderate', 6.1, 340, 200, 'Side pools, hidden cascades', 'Loop that visits several cascades and natural pools.', NULL, NULL, NULL, NULL),
((SELECT id FROM hiking_spots WHERE name = 'Budlaan Falls' LIMIT 1), 'Budlaan Extreme Trek', 'Expert', 10.2, 590, 360, 'Technical climbs, remote areas', 'Expert-level trek combining waterfall and mountain terrain.', NULL, NULL, NULL, NULL);

-- End of inserts
COMMIT;