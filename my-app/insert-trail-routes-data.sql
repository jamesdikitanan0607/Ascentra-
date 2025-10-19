BEGIN;

-- Get or create the hiking spot and return its ID
WITH inserted_spot AS (
  INSERT INTO hiking_spots (
    name, 
    description,
    latitude,
    longitude,
    coordinates,
    elevation, 
    difficulty,
    trail_length, 
    estimated_duration,
    rating, 
    review_count, 
    image_url,
    created_at,
    updated_at
  )
  VALUES (
    'Mount Tagaytay (Toledo City)',
    'Mount Tagaytay in Toledo City is a scenic ridge overlooking Malubog Lake, known for its panoramic views, cool mountain breeze, and peaceful atmosphere. The trail offers a mix of forest paths, open ridges, and lakeside scenery, making it an ideal destination for both casual hikers and seasoned trekkers seeking a quick nature escape from the city.',
    10.3650, -- latitude
    123.7300, -- longitude
    POINT(123.7300, 10.3650), -- coordinates (longitude, latitude)
    700, -- elevation in meters
    'Moderate',
    3.5, -- trail length in km
    150, -- estimated duration in minutes (2.5 hours)
    4.2,     -- rating
    0,       -- review_count
    '',      -- image_url (handled by frontend)
    NOW(),   -- created_at
    NOW()    -- updated_at
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coordinates = EXCLUDED.coordinates,
    elevation = EXCLUDED.elevation,
    difficulty = EXCLUDED.difficulty,
    trail_length = EXCLUDED.trail_length,
    estimated_duration = EXCLUDED.estimated_duration,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    image_url = EXCLUDED.image_url,
    updated_at = NOW()
  RETURNING hiking_spot_id, name
)
SELECT hiking_spot_id, name FROM inserted_spot;

-- Add a comment with the frontend ID for reference
-- Frontend ID: 84

-- Mount Tagaytay (Toledo City) Routes
WITH spot_id AS (
  SELECT hiking_spot_id 
  FROM hiking_spots 
  WHERE name = 'Mount Tagaytay (Toledo City)'
  LIMIT 1
)
INSERT INTO hiking_spot_routes (
  hiking_spot_id, 
  route_name, 
  difficulty, 
  distance, 
  elevation_gain, 
  estimated_duration, 
  route_features, 
  route_description,
  route_geom,
  start_latitude,
  start_longitude,
  end_latitude,
  end_longitude
)
SELECT 
  (SELECT hiking_spot_id FROM spot_id),
  route_data.*
FROM (
  SELECT 
    'Mount Tagaytay — Easy Trail' AS route_name,
    'Easy' AS difficulty,
    2.5 AS distance,
    160 AS elevation_gain,
    90 AS estimated_duration,
    'Gradual slopes, lake view, beginner-friendly' AS route_features,
    'Beginner-friendly route with gradual slopes and lake view at Malubog.' AS route_description,
    ST_GeomFromText('LINESTRING(123.7285 10.3635,123.7295 10.3645,123.7305 10.3655,123.7310 10.3660,123.7315 10.3665)', 4326) AS route_geom,
    10.3635 AS start_latitude,
    123.7285 AS start_longitude,
    10.3665 AS end_latitude,
    123.7315 AS end_longitude
  
  UNION ALL
  
  SELECT 
    'Mount Tagaytay — Medium Trail',
    'Moderate',
    4.2,
    320,
    150,
    'Ridge sections, scenic overlooks, moderate gain',
    'Ridge-to-summit route with moderate elevation gain and scenic overlooks.',
    ST_GeomFromText('LINESTRING(123.7275 10.3625,123.7288 10.3640,123.7302 10.3655,123.7315 10.3665,123.7325 10.3675)', 4326),
    10.3625 AS start_latitude,
    123.7275 AS start_longitude,
    10.3675 AS end_latitude,
    123.7325 AS end_longitude
    
  UNION ALL
  
  SELECT 
    'Mount Tagaytay — Hard Trail',
    'Hard',
    6.8,
    520,
    240,
    'Circuit route, steep ascents, highest point',
    'Full circuit trail around Malubog Lake leading to Tagaytay''s highest point with steep ascents.',
    ST_GeomFromText('LINESTRING(123.7265 10.3615,123.7285 10.3635,123.7305 10.3655,123.7320 10.3670,123.7335 10.3685)', 4326),
    10.3615 AS start_latitude,
    123.7265 AS start_longitude,
    10.3685 AS end_latitude,
    123.7335 AS end_longitude
) AS route_data
WHERE EXISTS (SELECT 1 FROM spot_id);

-- Mount Babag (Cebu City) Routes
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, route_geom) VALUES
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Ridge Easy Trail', 'Easy', 2.4, 160, 80, 'Gentle slopes, pine trees, family-friendly', 'A short, well-marked trail ideal for beginners with multiple rest points.', 10.3140, 123.9620, 10.3170, 123.9660, ST_GeomFromText('LINESTRING(123.9620 10.3140, 123.9630 10.3145, 123.9635 10.3150, 123.9645 10.3155, 123.9655 10.3165, 123.9660 10.3170)', 4326)),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Summit Classic', 'Moderate', 4.6, 620, 200, 'Steeper ascent, rocky sections, great summit views', 'Standard route to the summit with panoramic views of the city and coast.', 10.3130, 123.9610, 10.3180, 123.9680, ST_GeomFromText('LINESTRING(123.9610 10.3130, 123.9625 10.3140, 123.9640 10.3150, 123.9655 10.3160, 123.9670 10.3170, 123.9680 10.3180)', 4326)),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Sunrise Route', 'Moderate', 3.5, 480, 150, 'Sunrise viewpoint, photography spots', 'Popular early-morning hike for sunrise photography.', 10.3135, 123.9615, 10.3175, 123.9665, ST_GeomFromText('LINESTRING(123.9615 10.3135, 123.9630 10.3145, 123.9645 10.3155, 123.9655 10.3165, 123.9665 10.3175)', 4326));
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Summit Classic', 'Moderate', 4.6, 620, 200, 'Steeper ascent, rocky sections, great summit views', 'Standard route to the summit with panoramic views of the city and coast.', 10.3130, 123.9610, 10.3180, 123.9680, '[{"lat":10.3140,"lng":123.9625},{"lat":10.3150,"lng":123.9640},{"lat":10.3160,"lng":123.9655},{"lat":10.3170,"lng":123.9670}]', ST_GeomFromText('LINESTRING(123.9610 10.3130, 123.9625 10.3140, 123.9640 10.3150, 123.9655 10.3160, 123.9670 10.3170, 123.9680 10.3180)', 4326)),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Babag' LIMIT 1), 'Babag Sunrise Route', 'Moderate', 3.5, 480, 150, 'Sunrise viewpoint, photography spots', 'Popular early-morning hike for sunrise photography.', 10.3135, 123.9615, 10.3175, 123.9665, '[{"lat":10.3145,"lng":123.9630},{"lat":10.3155,"lng":123.9645},{"lat":10.3165,"lng":123.9655}]', ST_GeomFromText('LINESTRING(123.9615 10.3135, 123.9630 10.3145, 123.9645 10.3155, 123.9655 10.3165, 123.9665 10.3175)', 4326));

-- Mount Kan-irag / Sirao Peak Routes
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Sirao Flower Garden Walk', 'Easy', 2.1, 110, 60, 'Flower beds, family-friendly stroll', 'A gentle walk through the flower gardens near Sirao.', 10.3320, 123.9150, 10.3340, 123.9180, '[{"lat":10.3325,"lng":123.9160},{"lat":10.3330,"lng":123.9165},{"lat":10.3335,"lng":123.9175}]', ST_GeomFromText('LINESTRING(123.9150 10.3320, 123.9160 10.3325, 123.9165 10.3330, 123.9175 10.3335, 123.9180 10.3340)', 4326)),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Sirao Ridge Route', 'Moderate', 3.8, 320, 130, 'Pine forest, overlooks, moderate ascent', 'Ridge trail with views over the valley and temple landmarks.', 10.3310, 123.9140, 10.3350, 123.9190, '[{"lat":10.3320,"lng":123.9155},{"lat":10.3330,"lng":123.9170},{"lat":10.3340,"lng":123.9180}]', ST_GeomFromText('LINESTRING(123.9140 10.3310, 123.9155 10.3320, 123.9170 10.3330, 123.9180 10.3340, 123.9190 10.3350)', 4326)),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Kan-irag Summit Trail', 'Moderate', 4.4, 400, 160, 'Direct summit approach, mixed terrain', 'Main route to the highest viewpoint with varied terrain.', 10.3300, 123.9130, 10.3360, 123.9200, '[{"lat":10.3315,"lng":123.9145},{"lat":10.3330,"lng":123.9165},{"lat":10.3345,"lng":123.9185}]', ST_GeomFromText('LINESTRING(123.9130 10.3300, 123.9145 10.3315, 123.9165 10.3330, 123.9185 10.3345, 123.9200 10.3360)', 4326)),
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Kan-irag / Sirao Peak' LIMIT 1), 'Sirao Photographer''s Loop', 'Easy', 2.7, 150, 80, 'Photo spots, easy footing', 'Loop tailored for photographers with multiple vantage points.', 10.3325, 123.9155, 10.3325, 123.9155, '[{"lat":10.3330,"lng":123.9165},{"lat":10.3335,"lng":123.9170},{"lat":10.3330,"lng":123.9160}]', ST_GeomFromText('LINESTRING(123.9155 10.3325, 123.9165 10.3330, 123.9170 10.3335, 123.9160 10.3330, 123.9155 10.3325)', 4326));

-- Mount Naupa Routes
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT hiking_spot_id FROM hiking_spots WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Village Trail', 'Easy', 2.6, 190, 90, 'Agricultural scenery, community access', 'Accessible trail passing through farms and local settlements.', 10.2070, 123.7480, 10.2095, 123.7520, '[{"lat":10.207000,"lng":123.748000},{"lat":10.207571,"lng":123.748737},{"lat":10.208142,"lng":123.749474},{"lat":10.208713,"lng":123.750211},{"lat":10.209285,"lng":123.750948},{"lat":10.209500,"lng":123.752000}]', ST_GeomFromText('LINESTRING(123.748000 10.207000, 123.748737 10.207571, 123.749474 10.208142, 123.750211 10.208713, 123.750948 10.209285, 123.752000 10.209500)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Forest Path', 'Moderate', 4.5, 330, 150, 'Secondary forest, shaded canopy', 'Forest approach with natural springs and birdlife.', 10.2060, 123.7470, 10.2105, 123.7530, '[{"lat":10.206000,"lng":123.747000},{"lat":10.206786,"lng":123.747857},{"lat":10.207571,"lng":123.748714},{"lat":10.208357,"lng":123.749571},{"lat":10.209142,"lng":123.750429},{"lat":10.209928,"lng":123.751286},{"lat":10.210500,"lng":123.752500},{"lat":10.210500,"lng":123.753000}]', ST_GeomFromText('LINESTRING(123.747000 10.206000, 123.747857 10.206786, 123.748714 10.207571, 123.749571 10.208357, 123.750429 10.209142, 123.751286 10.209928, 123.752500 10.210500, 123.753000 10.210500)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Summit Route', 'Moderate', 5.3, 380, 180, 'River crossings, open summit views', 'Traditional route to the summit with scenic overlooks.', 10.2050, 123.7460, 10.2115, 123.7540, '[{"lat":10.205000,"lng":123.746000},{"lat":10.205928,"lng":123.746857},{"lat":10.206857,"lng":123.747714},{"lat":10.207785,"lng":123.748571},{"lat":10.208714,"lng":123.749429},{"lat":10.209642,"lng":123.750286},{"lat":10.210571,"lng":123.751143},{"lat":10.211500,"lng":123.754000}]', ST_GeomFromText('LINESTRING(123.746000 10.205000, 123.746857 10.205928, 123.747714 10.206857, 123.748571 10.207785, 123.749429 10.208714, 123.750286 10.209642, 123.751143 10.210571, 123.754000 10.211500)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Naupa' LIMIT 1), 'Naupa Wilderness Trek', 'Hard', 7.0, 490, 260, 'Dense forest, rugged terrain', 'Longer wilderness route for seasoned trekkers.', 10.2040, 123.7450, 10.2125, 123.7550, '[{"lat":10.204000,"lng":123.745000},{"lat":10.205071,"lng":123.745857},{"lat":10.206143,"lng":123.746714},{"lat":10.207214,"lng":123.747571},{"lat":10.208286,"lng":123.748429},{"lat":10.209357,"lng":123.749286},{"lat":10.210429,"lng":123.750143},{"lat":10.212500,"lng":123.755000}]', ST_GeomFromText('LINESTRING(123.745000 10.204000, 123.745857 10.205071, 123.746714 10.206143, 123.747571 10.207214, 123.748429 10.208286, 123.749286 10.209357, 123.750143 10.210429, 123.755000 10.212500)', 4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Memorial Walk', 'Easy', 3.0, 220, 100, 'Historical markers, memorial site', 'A historically significant trail leading to the crash site memorial.', 10.4820, 123.7150, 10.4845, 123.7185, '[{"lat":10.4825,"lng":123.7160},{"lat":10.4835,"lng":123.7170},{"lat":10.4840,"lng":123.7180}]', ST_GeomFromText('LINESTRING(123.7150 10.4820, 123.7160 10.4825, 123.7170 10.4835, 123.7180 10.4840, 123.7185 10.4845)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Classic Route', 'Moderate', 5.0, 380, 160, 'Coastal views, monument stops', 'Popular weekend route combining history and vistas.', 10.4810, 123.7140, 10.4855, 123.7195, '[{"lat":10.4820,"lng":123.7155},{"lat":10.4835,"lng":123.7175},{"lat":10.4845,"lng":123.7185}]', ST_GeomFromText('LINESTRING(123.7140 10.4810, 123.7155 10.4820, 123.7175 10.4835, 123.7185 10.4845, 123.7195 10.4855)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Ridge Trail', 'Hard', 7.2, 540, 240, 'Ridge traverse, steep ascents', 'Challenging ridge walk with several viewpoints.', 10.4800, 123.7130, 10.4865, 123.7205, '[{"lat":10.4815,"lng":123.7145},{"lat":10.4835,"lng":123.7170},{"lat":10.4850,"lng":123.7190},{"lat":10.4860,"lng":123.7200}]', ST_GeomFromText('LINESTRING(123.7130 10.4800, 123.7145 10.4815, 123.7170 10.4835, 123.7190 10.4850, 123.7200 10.4860, 123.7205 10.4865)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Manunggal' LIMIT 1), 'Manunggal Heritage Loop', 'Moderate', 4.6, 350, 140, 'Well-maintained trail, interpretive markers', 'Loop that visits several historical and scenic points.', 10.4825, 123.7155, 10.4825, 123.7155, '[{"lat":10.4835,"lng":123.7170},{"lat":10.4840,"lng":123.7180},{"lat":10.4830,"lng":123.7165}]', ST_GeomFromText('LINESTRING(123.7155 10.4825, 123.7170 10.4835, 123.7180 10.4840, 123.7165 10.4830, 123.7155 10.4825)', 4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Mago' LIMIT 1), 'Mago Foothills Trail', 'Easy', 2.5, 180, 90, 'Farmland, community trails', 'Short route through agricultural landscapes and orchards.', 10.5985, 123.9980, 10.6010, 124.0020, '[{"lat":10.598500,"lng":123.998000},{"lat":10.598928,"lng":123.998571},{"lat":10.599357,"lng":123.999143},{"lat":10.599785,"lng":123.999714},{"lat":10.600214,"lng":124.000286},{"lat":10.600642,"lng":124.000857},{"lat":10.601000,"lng":124.002000}]', ST_GeomFromText('LINESTRING(123.998000 10.598500, 123.998571 10.598928, 123.999143 10.599357, 123.999714 10.599785, 124.000286 10.600214, 124.000857 10.600642, 124.002000 10.601000)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Mago' LIMIT 1), 'Mago Forest Route', 'Moderate', 4.0, 320, 150, 'Dense tropical vegetation', 'Main forest approach with water sources and birdlife.', 10.5975, 123.9970, 10.6020, 124.0030, '[{"lat":10.597500,"lng":123.997000},{"lat":10.598214,"lng":123.997714},{"lat":10.598928,"lng":123.998429},{"lat":10.599642,"lng":123.999143},{"lat":10.600357,"lng":123.999857},{"lat":10.601071,"lng":124.000571},{"lat":10.601785,"lng":124.001286},{"lat":10.602000,"lng":124.003000}]', ST_GeomFromText('LINESTRING(123.997000 10.597500, 123.997714 10.598214, 123.998429 10.598928, 123.999143 10.599642, 123.999857 10.600357, 124.000571 10.601071, 124.001286 10.601785, 124.003000 10.602000)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Mago' LIMIT 1), 'Mago Summit Trail', 'Moderate', 5.1, 410, 180, 'Rock outcrops, summit views', 'Direct approach to the summit with panoramic views.', 10.5965, 123.9960, 10.6030, 124.0040, '[{"lat":10.596500,"lng":123.996000},{"lat":10.597428,"lng":123.996857},{"lat":10.598357,"lng":123.997714},{"lat":10.599285,"lng":123.998571},{"lat":10.600214,"lng":123.999429},{"lat":10.601142,"lng":124.000286},{"lat":10.602071,"lng":124.001143},{"lat":10.603000,"lng":124.004000}]', ST_GeomFromText('LINESTRING(123.996000 10.596500, 123.996857 10.597428, 123.997714 10.598357, 123.998571 10.599285, 123.999429 10.600214, 124.000286 10.601142, 124.001143 10.602071, 124.004000 10.603000)', 4326)),
((SELECT id FROM hiking_spot_routes WHERE name = 'Mount Mago' LIMIT 1), 'Mago Technical Route', 'Hard', 6.7, 520, 240, 'Steep rock faces, scramble', 'Technical sections requiring careful route-finding.', 10.5955, 123.9950, 10.6040, 124.0050, '[{"lat":10.595500,"lng":123.995000},{"lat":10.596357,"lng":123.995857},{"lat":10.597214,"lng":123.996714},{"lat":10.598071,"lng":123.997571},{"lat":10.598928,"lng":123.998429},{"lat":10.599785,"lng":123.999286},{"lat":10.600642,"lng":124.000143},{"lat":10.604000,"lng":124.005000}]', ST_GeomFromText('LINESTRING(123.995000 10.595500, 123.995857 10.596357, 123.996714 10.597214, 123.997571 10.598071, 123.998429 10.598928, 123.999286 10.599785, 124.000143 10.600642, 124.005000 10.604000)', 4326));

-- Do not run COMMIT; until you have pasted Parts 2 & 3
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Kapayas' LIMIT 1),'Kapayas Coastal Walk','Easy',2.8,160,90,'Sea views, coconut groves','Gentle coastal mountain trail with ocean vistas.',10.7150,124.0150,10.7180,124.0185,'[{"lat":10.7160,"lng":124.0160},{"lat":10.7165,"lng":124.0170},{"lat":10.7175,"lng":124.0180}]',ST_GeomFromText('LINESTRING(124.0150 10.7150,124.0160 10.7160,124.0170 10.7170,124.0180 10.7175,124.0185 10.7180)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kapayas' LIMIT 1),'Kapayas Nature Trail','Moderate',4.3,290,130,'Forest sections, springs','Moderate climb with diverse vegetation and springs.',10.7140,124.0140,10.7190,124.0195,'[{"lat":10.7155,"lng":124.0155},{"lat":10.7170,"lng":124.0175},{"lat":10.7180,"lng":124.0185}]',ST_GeomFromText('LINESTRING(124.0140 10.7140,124.0155 10.7155,124.0175 10.7170,124.0185 10.7180,124.0195 10.7190)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kapayas' LIMIT 1),'Kapayas Summit Route','Moderate',5.2,360,160,'Panoramic northern coast views','Standard summit route offering island views.',10.7130,124.0130,10.7200,124.0205,'[{"lat":10.7150,"lng":124.0150},{"lat":10.7170,"lng":124.0175},{"lat":10.7185,"lng":124.0190}]',ST_GeomFromText('LINESTRING(124.0130 10.7130,124.0150 10.7150,124.0175 10.7170,124.0190 10.7185,124.0205 10.7200)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kapayas' LIMIT 1),'Kapayas Ridge Challenge','Hard',6.9,470,220,'Steep ridges, remote sections','Challenging ridge route with technical scrambling.',10.7120,124.0120,10.7210,124.0215,'[{"lat":10.7145,"lng":124.0145},{"lat":10.7170,"lng":124.0175},{"lat":10.7190,"lng":124.0195},{"lat":10.7200,"lng":124.0205}]',ST_GeomFromText('LINESTRING(124.0120 10.7120,124.0145 10.7145,124.0175 10.7170,124.0195 10.7190,124.0205 10.7200,124.0215 10.7210)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Lantoy' LIMIT 1),'Lantoy Beach Approach','Easy',2.2,140,70,'Coastal access, family-friendly','Short coastal trail suitable for families and beginners.',9.8820,123.3485,9.8845,123.3515,'[{"lat":9.8825,"lng":123.3490},{"lat":9.8830,"lng":123.3500},{"lat":9.8840,"lng":123.3510}]',ST_GeomFromText('LINESTRING(123.3485 9.8820,123.3490 9.8825,123.3500 9.8830,123.3510 9.8840,123.3515 9.8845)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Lantoy' LIMIT 1),'Lantoy Forest Path','Moderate',4.6,330,150,'Coastal forest, marine views','Moderate climb through coastal woodland to higher vantage points.',9.8810,123.3475,9.8855,123.3525,'[{"lat":9.8825,"lng":123.3490},{"lat":9.8840,"lng":123.3510},{"lat":9.8850,"lng":123.3520}]',ST_GeomFromText('LINESTRING(123.3475 9.8810,123.3490 9.8825,123.3510 9.8840,123.3520 9.8850,123.3525 9.8855)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Lantoy' LIMIT 1),'Lantoy Summit Classic','Moderate',5.9,430,180,'Panoramic sea and island views','Traditional summit route with sweeping ocean panoramas.',9.8800,123.3465,9.8865,123.3535,'[{"lat":9.8820,"lng":123.3485},{"lat":9.8840,"lng":123.3510},{"lat":9.8855,"lng":123.3525}]',ST_GeomFromText('LINESTRING(123.3465 9.8800,123.3485 9.8820,123.3510 9.8840,123.3525 9.8855,123.3535 9.8865)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Lantoy' LIMIT 1),'Lantoy Ridge Adventure','Hard',7.6,560,260,'Coastal cliffs, technical segments','A challenging ridge route with steep coastal cliffs.',9.8790,123.3455,9.8875,123.3545,'[{"lat":9.8815,"lng":123.3480},{"lat":9.8840,"lng":123.3510},{"lat":9.8860,"lng":123.3530},{"lat":9.8870,"lng":123.3540}]',ST_GeomFromText('LINESTRING(123.3455 9.8790,123.3480 9.8815,123.3510 9.8840,123.3530 9.8860,123.3540 9.8870,123.3545 9.8875)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Kalbasaan' LIMIT 1),'Kalbasaan Family Trail','Easy',1.9,120,60,'Picnic spots, gentle slopes','Short family-friendly trail with picnic areas.',10.2490,123.7985,10.2510,123.8015,'[{"lat":10.2495,"lng":123.7990},{"lat":10.2500,"lng":123.8000},{"lat":10.2505,"lng":123.8010}]',ST_GeomFromText('LINESTRING(123.7985 10.2490,123.7990 10.2495,123.8000 10.2500,123.8010 10.2505,123.8015 10.2510)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kalbasaan' LIMIT 1),'Kalbasaan Forest Route','Moderate',3.5,240,110,'Shaded woodland path','Trail through mixed forest leading to open hilltops.',10.2480,123.7975,10.2520,123.8025,'[{"lat":10.2485,"lng":123.7985},{"lat":10.2495,"lng":123.7995},{"lat":10.2510,"lng":123.8010}]',ST_GeomFromText('LINESTRING(123.7975 10.2480,123.7985 10.2485,123.7995 10.2495,123.8010 10.2510,123.8025 10.2520)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kalbasaan' LIMIT 1),'Kalbasaan Ridge Trek','Hard',5.8,400,180,'Ridge sections, moderate exposure','Extended ridge trail with open grasslands.',10.2470,123.7965,10.2530,123.8035,'[{"lat":10.2485,"lng":123.7980},{"lat":10.2500,"lng":123.8000},{"lat":10.2520,"lng":123.8020}]',ST_GeomFromText('LINESTRING(123.7965 10.2470,123.7980 10.2485,123.8000 10.2500,123.8020 10.2520,123.8035 10.2530)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Mauyog' LIMIT 1),'Mauyog Scenic Trail','Easy',2.5,170,80,'Grassland, mild incline','Gentle scenic walk with summit views.',10.4810,123.7190,10.4835,123.7225,'[{"lat":10.4815,"lng":123.7200},{"lat":10.4825,"lng":123.7215},{"lat":10.4830,"lng":123.7220}]',ST_GeomFromText('LINESTRING(123.7190 10.4810,123.7200 10.4815,123.7215 10.4825,123.7220 10.4830,123.7225 10.4835)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Mauyog' LIMIT 1),'Mauyog Summit Route','Moderate',3.9,280,130,'Rocky summit, exposed ridges','Direct approach to the peak from the Balamban side.',10.4800,123.7180,10.4845,123.7235,'[{"lat":10.4810,"lng":123.7195},{"lat":10.4825,"lng":123.7210},{"lat":10.4835,"lng":123.7225}]',ST_GeomFromText('LINESTRING(123.7180 10.4800,123.7195 10.4810,123.7210 10.4825,123.7225 10.4835,123.7235 10.4845)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Mauyog' LIMIT 1),'Mauyog Ridge Trek','Hard',6.0,460,200,'Sharp ridges, grassland', 'Challenging ridge traverse connected to Manunggal route.',10.4790,123.7170,10.4855,123.7245,'[{"lat":10.4805,"lng":123.7185},{"lat":10.4820,"lng":123.7205},{"lat":10.4840,"lng":123.7230}]',ST_GeomFromText('LINESTRING(123.7170 10.4790,123.7185 10.4805,123.7205 10.4820,123.7230 10.4840,123.7245 10.4855)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Lanaya' LIMIT 1),'Lanaya Foothill Trail','Easy',2.3,180,80,'Sea views, limestone terrain','Coastal foothill path near Alegria.',9.6685,123.3345,9.6710,123.3375,'[{"lat":9.6690,"lng":123.3350},{"lat":9.6700,"lng":123.3360},{"lat":9.6705,"lng":123.3370}]',ST_GeomFromText('LINESTRING(123.3345 9.6685,123.3350 9.6690,123.3360 9.6700,123.3370 9.6705,123.3375 9.6710)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Lanaya' LIMIT 1),'Lanaya Summit Trail','Moderate',4.8,380,150,'Rocky sections, summit cross','Main route to Kalo-Kalo peak.',9.6675,123.3335,9.6725,123.3385,'[{"lat":9.6685,"lng":123.3345},{"lat":9.6700,"lng":123.3360},{"lat":9.6715,"lng":123.3375}]',ST_GeomFromText('LINESTRING(123.3335 9.6675,123.3345 9.6685,123.3360 9.6700,123.3375 9.6715,123.3385 9.6725)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Lanaya' LIMIT 1),'Lanaya Ridge Traverse','Hard',6.4,480,220,'Steep limestone, technical terrain','Steep ridge ascent for experienced hikers.',9.6665,123.3325,9.6735,123.3395,'[{"lat":9.6680,"lng":123.3340},{"lat":9.6700,"lng":123.3360},{"lat":9.6720,"lng":123.3380}]',ST_GeomFromText('LINESTRING(123.3325 9.6665,123.3340 9.6680,123.3360 9.6700,123.3380 9.6720,123.3395 9.6735)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Hambubuyog' LIMIT 1),'Hambubuyog Foothill Walk','Easy',2.4,200,90,'Farmland, gentle slopes','Short scenic walk through local fields toward foothills.',9.5680,123.3005,9.5710,123.3035,'[{"lat":9.5685,"lng":123.3010},{"lat":9.5695,"lng":123.3020},{"lat":9.5700,"lng":123.3030}]',ST_GeomFromText('LINESTRING(123.3005 9.5680,123.3010 9.5685,123.3020 9.5695,123.3030 9.5700,123.3035 9.5710)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Hambubuyog' LIMIT 1),'Hambubuyog Summit Path','Moderate',4.7,370,160,'Mixed forest, summit cross','Main route to summit with cross and sea views.',9.5670,123.2995,9.5720,123.3045,'[{"lat":9.5680,"lng":123.3005},{"lat":9.5695,"lng":123.3020},{"lat":9.5710,"lng":123.3035}]',ST_GeomFromText('LINESTRING(123.2995 9.5670,123.3005 9.5680,123.3020 9.5695,123.3035 9.5710,123.3045 9.5720)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Hambubuyog' LIMIT 1),'Hambubuyog Ridge Trek','Hard',6.9,500,230,'Ridge traverse, grassland','Steep but rewarding ridge hike with panoramic southern Cebu views.',9.5660,123.2985,9.5730,123.3055,'[{"lat":9.5675,"lng":123.3000},{"lat":9.5695,"lng":123.3020},{"lat":9.5715,"lng":123.3040}]',ST_GeomFromText('LINESTRING(123.2985 9.5660,123.3000 9.5675,123.3020 9.5695,123.3040 9.5715,123.3055 9.5730)',4326));

-- Continue with Part 3 for Mount
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Mount Kalawisan' LIMIT 1),'Kalawisan Ridge Trail','Easy',2.1,140,70,'Grass slopes, coastal breeze','Short ridge trail overlooking Lapu-Lapu City coast.',10.2905,123.9790,10.2930,123.9820,'[{"lat":10.2910,"lng":123.9795},{"lat":10.2920,"lng":123.9805},{"lat":10.2925,"lng":123.9815}]',ST_GeomFromText('LINESTRING(123.9790 10.2905,123.9795 10.2910,123.9805 10.2920,123.9815 10.2925,123.9820 10.2930)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kalawisan' LIMIT 1),'Kalawisan Summit Path','Moderate',3.8,260,120,'Urban overlook, grassy terrain','Moderate climb with clear view of Mactan Channel.',10.2895,123.9780,10.2940,123.9830,'[{"lat":10.2910,"lng":123.9795},{"lat":10.2925,"lng":123.9810},{"lat":10.2935,"lng":123.9825}]',ST_GeomFromText('LINESTRING(123.9780 10.2895,123.9795 10.2910,123.9810 10.2925,123.9825 10.2935,123.9830 10.2940)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kalawisan' LIMIT 1),'Kalawisan Ridge Loop','Moderate',4.5,310,140,'Mixed grassland, exposed sections','Loop trail connecting ridge viewpoints.',10.2890,123.9775,10.2890,123.9775,'[{"lat":10.2900,"lng":123.9790},{"lat":10.2910,"lng":123.9805},{"lat":10.2900,"lng":123.9790}]',ST_GeomFromText('LINESTRING(123.9775 10.2890,123.9790 10.2900,123.9805 10.2910,123.9790 10.2900,123.9775 10.2890)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Mount Kalawisan' LIMIT 1),'Kalawisan Ridge Traverse','Hard',5.7,400,190,'Windy ridge, steep descent','Longer route covering entire Kanlaas ridge section.',10.2885,123.9770,10.2945,123.9835,'[{"lat":10.2905,"lng":123.9790},{"lat":10.2920,"lng":123.9805},{"lat":10.2935,"lng":123.9825}]',ST_GeomFromText('LINESTRING(123.9770 10.2885,123.9790 10.2905,123.9805 10.2920,123.9825 10.2935,123.9835 10.2945)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Osmeña Peak' LIMIT 1),'Osmeña Peak Main Trail','Easy',2.1,180,80,'Jagged hills, ocean views','Shortest and most popular route to the peak.',9.9505,123.4805,9.9525,123.4840,'[{"lat":9.9510,"lng":123.4815},{"lat":9.9515,"lng":123.4825},{"lat":9.9520,"lng":123.4835}]',ST_GeomFromText('LINESTRING(123.4805 9.9505,123.4815 9.9510,123.4825 9.9515,123.4835 9.9520,123.4840 9.9525)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Osmeña Peak' LIMIT 1),'Osmeña to Kawasan Traverse','Hard',10.1,620,330,'Ridges, waterfalls, multi-hour trek','Classic traverse route to Badian via Kawasan Falls.',9.9495,123.4795,9.9380,123.4235,'[{"lat":9.9500,"lng":123.4805},{"lat":9.9470,"lng":123.4705},{"lat":9.9420,"lng":123.4455},{"lat":9.9380,"lng":123.4235}]',ST_GeomFromText('LINESTRING(123.4795 9.9495,123.4805 9.9500,123.4705 9.9470,123.4455 9.9420,123.4235 9.9380)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Osmeña Peak' LIMIT 1),'Osmeña Sunset Trail','Moderate',3.5,240,120,'Sunset viewpoints, moderate incline','Ideal for late-afternoon ascents with panoramic sunsets.',9.9500,123.4800,9.9520,123.4830,'[{"lat":9.9505,"lng":123.4810},{"lat":9.9510,"lng":123.4820},{"lat":9.9515,"lng":123.4825}]',ST_GeomFromText('LINESTRING(123.4800 9.9500,123.4810 9.9505,123.4820 9.9510,123.4825 9.9515,123.4830 9.9520)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Osmeña Peak' LIMIT 1),'Osmeña Ridge Adventure','Hard',5.8,480,200,'Rugged ridges, technical sections','A demanding route connecting nearby peaks.',9.9490,123.4790,9.9530,123.4850,'[{"lat":9.9505,"lng":123.4810},{"lat":9.9515,"lng":123.4825},{"lat":9.9525,"lng":123.4840}]',ST_GeomFromText('LINESTRING(123.4790 9.9490,123.4810 9.9505,123.4825 9.9515,123.4840 9.9525,123.4850 9.9530)',4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name='Casino Peak' LIMIT 1),'Casino Peak Main Trail','Easy',1.8,140,60,'Karst formations, sea views','Short climb to Casino Peak''s iconic view.',9.9520,123.4775,9.9540,123.4800,'[{"lat":9.9525,"lng":123.4785},{"lat":9.9530,"lng":123.4790},{"lat":9.9535,"lng":123.4795}]',ST_GeomFromText('LINESTRING(123.4775 9.9520,123.4785 9.9525,123.4790 9.9530,123.4795 9.9535,123.4800 9.9540)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Casino Peak' LIMIT 1),'Casino Peak Ridge Loop','Moderate',3.4,260,100,'Karst ridges, viewpoints','Loop combining Casino Peak and nearby limestone ridges.',9.9515,123.4770,9.9515,123.4770,'[{"lat":9.9525,"lng":123.4785},{"lat":9.9530,"lng":123.4790},{"lat":9.9520,"lng":123.4780}]',ST_GeomFromText('LINESTRING(123.4770 9.9515,123.4785 9.9525,123.4790 9.9530,123.4780 9.9520,123.4770 9.9515)',4326)),
((SELECT id FROM hiking_spot_routes WHERE name='Casino Peak' LIMIT 1),'Casino to Osmeña Connector','Moderate',2.8,210,100,'Short connector, twin-peak view','Trail linking Casino Peak to Osmeña Peak ridge.',9.9525,123.4780,9.9510,123.4815,'[{"lat":9.9528,"lng":123.4785},{"lat":9.9519,"lng":123.4800}]',ST_GeomFromText('LINESTRING(123.4780 9.9525,123.4785 9.9528,123.4800 9.9519,123.4815 9.9510)',4326));

-- Mount Tagaytay Placeholder Routes
-- Easy Trail: Beginner-friendly route with gradual slopes and lake view at Malubog.
-- Medium Trail: Ridge-to-summit route with moderate elevation gain and scenic overlooks.
-- Hard Trail: Full circuit trail around Malubog Lake leading to Tagaytay’s highest point with steep ascents.
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Tagaytay' LIMIT 1), 'Mount Tagaytay — Easy Trail', 'Easy', 2.5, 160, 90, 'Gradual slopes, lake view, beginner-friendly', 'Beginner-friendly route with gradual slopes and lake view at Malubog.', 10.3635, 123.7285, 10.3665, 123.7315, '[{"lat":10.3645,"lng":123.7295},{"lat":10.3655,"lng":123.7305},{"lat":10.3660,"lng":123.7310}]', ST_GeomFromText('LINESTRING(123.7285 10.3635,123.7295 10.3645,123.7305 10.3655,123.7310 10.3660,123.7315 10.3665)', 4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Tagaytay' LIMIT 1), 'Mount Tagaytay — Medium Trail', 'Moderate', 4.2, 320, 150, 'Ridge sections, scenic overlooks, moderate gain', 'Ridge-to-summit route with moderate elevation gain and scenic overlooks.', 10.3625, 123.7275, 10.3675, 123.7325, '[{"lat":10.3640,"lng":123.7288},{"lat":10.3655,"lng":123.7302},{"lat":10.3665,"lng":123.7315}]', ST_GeomFromText('LINESTRING(123.7275 10.3625,123.7288 10.3640,123.7302 10.3655,123.7315 10.3665,123.7325 10.3675)', 4326));

INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES
((SELECT id FROM hiking_spots WHERE name = 'Mount Tagaytay' LIMIT 1), 'Mount Tagaytay — Hard Trail', 'Hard', 6.8, 520, 240, 'Circuit route, steep ascents, highest point', 'Full circuit trail around Malubog Lake leading to Tagaytay’s highest point with steep ascents.', 10.3615, 123.7265, 10.3685, 123.7335, '[{"lat":10.3635,"lng":123.7285},{"lat":10.3655,"lng":123.7305},{"lat":10.3670,"lng":123.7320}]', ST_GeomFromText('LINESTRING(123.7265 10.3615,123.7285 10.3635,123.7305 10.3655,123.7320 10.3670,123.7335 10.3685)', 4326));

COMMIT;
