-- Insert trail routes data for all 15 hiking spots

-- Mount Babag (hiking_spot_id: 1)
INSERT INTO trail_routes (hiking_spot_id, route_name, difficulty, start_coordinates, distance_km, elevation_gain_m, estimated_duration_hr, highlights) VALUES
(1, 'Babag Ridge Easy Trail', 'Easy', POINT(123.8850, 10.3695), 2.5, 180, 1.5, 'Gentle slopes through pine forests, perfect for beginners, scenic viewpoints of Cebu City, well-marked trail with rest areas'),
(1, 'Babag Summit Classic', 'Moderate', POINT(123.8856, 10.3702), 4.2, 320, 2.5, 'Traditional route to the summit, mixed terrain with rocky sections, panoramic views of metro Cebu and Mactan Island'),
(1, 'Babag Sunrise Trail', 'Moderate', POINT(123.8862, 10.3708), 3.8, 290, 2.0, 'Early morning trail for sunrise viewing, steep initial climb, breathtaking dawn views over Cebu strait'),
(1, 'Babag Adventure Circuit', 'Hard', POINT(123.8845, 10.3690), 6.5, 450, 4.0, 'Challenging loop trail, technical rock scrambling, dense forest sections, multiple summit viewpoints'),
(1, 'Babag Extreme Traverse', 'Advanced', POINT(123.8840, 10.3685), 8.2, 580, 5.5, 'Expert-level ridge traverse, exposed cliff sections, rope-assisted climbs, spectacular 360-degree summit views'),

-- Mount Kan-irag / Sirao Peak (hiking_spot_id: 2)
(2, 'Sirao Flower Garden Trail', 'Easy', POINT(123.8848, 10.4110), 2.0, 120, 1.0, 'Gentle walk through colorful flower gardens, cool mountain air, perfect for families, celosia and other seasonal blooms'),
(2, 'Kan-irag Nature Walk', 'Moderate', POINT(123.8854, 10.4117), 3.5, 250, 2.0, 'Moderate climb through pine and eucalyptus forests, bird watching opportunities, scenic overlooks of Temple of Leah'),
(2, 'Sirao Peak Summit', 'Moderate', POINT(123.8860, 10.4125), 4.0, 310, 2.5, 'Direct route to the highest point, cool climate vegetation, stunning views of Cebu City and Bohol strait'),
(2, 'Kan-irag Ridge Challenge', 'Hard', POINT(123.8842, 10.4105), 5.8, 420, 3.5, 'Challenging ridge walk with steep ascents, diverse flora including native orchids, multiple scenic viewpoints'),
(2, 'Sirao Extreme Loop', 'Advanced', POINT(123.8835, 10.4100), 7.5, 520, 4.5, 'Technical loop trail with rock climbing sections, pristine forest areas, expert navigation required, remote wilderness experience'),

-- Mount Naupa (hiking_spot_id: 3)
(3, 'Naupa Base Trail', 'Easy', POINT(123.7558, 10.2550), 2.8, 200, 1.5, 'Accessible trail through agricultural areas, local community interaction, gentle slopes with fruit trees and vegetable gardens'),
(3, 'Naupa Forest Path', 'Moderate', POINT(123.7564, 10.2558), 4.5, 340, 2.5, 'Moderate climb through secondary forest, diverse bird species, natural springs along the trail, shaded canopy walk'),
(3, 'Naupa Summit Route', 'Moderate', POINT(123.7570, 10.2565), 5.2, 380, 3.0, 'Traditional summit approach, mixed terrain with river crossings, panoramic views of Naga City and surrounding valleys'),
(3, 'Naupa Wilderness Trek', 'Hard', POINT(123.7552, 10.2545), 6.8, 480, 4.0, 'Challenging wilderness route, dense forest sections, wildlife spotting opportunities, steep rocky ascents'),
(3, 'Naupa Technical Ascent', 'Advanced', POINT(123.7545, 10.2540), 8.0, 600, 5.0, 'Expert-level technical climbing, rope work required, pristine old-growth forest, spectacular summit views'),

-- Mount Manunggal (hiking_spot_id: 4)
(4, 'Manunggal Memorial Trail', 'Easy', POINT(123.7833, 10.4688), 3.0, 220, 1.5, 'Historical trail to crash site memorial, educational markers, gentle slopes through grasslands, cultural significance'),
(4, 'Manunggal Heritage Path', 'Moderate', POINT(123.7839, 10.4695), 4.8, 360, 2.5, 'Moderate climb with historical significance, monument visits, scenic views of western Cebu coast, well-maintained trail'),
(4, 'Manunggal Summit Classic', 'Moderate', POINT(123.7845, 10.4702), 5.5, 420, 3.0, 'Traditional route to the summit, mixed forest and grassland terrain, panoramic coastal views, memorial site visit'),
(4, 'Manunggal Ridge Adventure', 'Hard', POINT(123.7827, 10.4682), 7.2, 540, 4.0, 'Challenging ridge traverse, steep ascents through dense forest, multiple viewpoints, technical rock sections'),
(4, 'Manunggal Extreme Challenge', 'Advanced', POINT(123.7820, 10.4675), 9.0, 680, 5.5, 'Expert-level mountain traverse, exposed ridge walking, rope-assisted sections, breathtaking summit panorama'),

-- Mount Mago (hiking_spot_id: 5)
(5, 'Mago Foothills Trail', 'Easy', POINT(123.9314, 10.5532), 2.5, 180, 1.5, 'Gentle introduction to mountain hiking, agricultural landscapes, local community trails, fruit orchards and vegetable farms'),
(5, 'Mago Forest Route', 'Moderate', POINT(123.9320, 10.5539), 4.0, 320, 2.5, 'Moderate forest climb, diverse tropical vegetation, natural water sources, bird watching opportunities'),
(5, 'Mago Summit Trail', 'Moderate', POINT(123.9326, 10.5546), 5.0, 400, 3.0, 'Direct summit approach, mixed terrain with rocky outcrops, panoramic views of Carmen and Danao areas'),
(5, 'Mago Technical Route', 'Hard', POINT(123.9308, 10.5525), 6.5, 520, 4.0, 'Challenging technical climbing, steep rock faces, dense jungle sections, advanced navigation skills required'),
(5, 'Mago Extreme Traverse', 'Advanced', POINT(123.9300, 10.5518), 8.5, 650, 5.0, 'Expert-level mountain traverse, exposed cliff sections, pristine wilderness, spectacular 360-degree views'),

-- Mount Kapayas (hiking_spot_id: 6)
(6, 'Kapayas Coastal Trail', 'Easy', POINT(123.9510, 10.7098), 2.8, 160, 1.5, 'Easy coastal mountain trail, sea breeze cooling, views of Camotes Sea, gentle slopes through coconut groves'),
(6, 'Kapayas Nature Walk', 'Moderate', POINT(123.9516, 10.7105), 4.2, 280, 2.0, 'Moderate climb through tropical forest, diverse plant species, natural springs, coastal and mountain views'),
(6, 'Kapayas Summit Route', 'Moderate', POINT(123.9522, 10.7112), 5.0, 350, 2.5, 'Traditional summit trail, mixed forest and grassland, panoramic views of northern Cebu coast and islands'),
(6, 'Kapayas Ridge Challenge', 'Hard', POINT(123.9504, 10.7091), 6.8, 460, 3.5, 'Challenging ridge walk, steep ascents, dense forest sections, technical rock scrambling, remote wilderness'),
(6, 'Kapayas Extreme Circuit', 'Advanced', POINT(123.9495, 10.7085), 8.0, 580, 4.5, 'Expert-level circuit trail, exposed ridge sections, rope work required, pristine forest, spectacular summit views'),

-- Mount Lantoy (hiking_spot_id: 7)
(7, 'Lantoy Valley Trail', 'Easy', POINT(123.5488, 9.8964), 3.0, 200, 1.5, 'Gentle valley approach, agricultural terraces, local farming communities, fruit trees and vegetable gardens'),
(7, 'Lantoy Forest Path', 'Moderate', POINT(123.5494, 9.8971), 4.5, 320, 2.5, 'Moderate forest climb, diverse ecosystems, natural photography opportunities, bird watching, cool forest canopy'),
(7, 'Lantoy Summit Classic', 'Moderate', POINT(123.5500, 9.8978), 5.5, 400, 3.0, 'Traditional summit route, mixed terrain, panoramic views of southern Cebu coastline and Bohol Sea'),
(7, 'Lantoy Wilderness Trek', 'Hard', POINT(123.5482, 9.8957), 7.0, 520, 4.0, 'Challenging wilderness route, dense primary forest, wildlife spotting, steep rocky ascents, river crossings'),
(7, 'Lantoy Technical Ascent', 'Advanced', POINT(123.5475, 9.8950), 8.5, 640, 5.0, 'Expert-level technical climbing, rope-assisted sections, pristine old-growth forest, breathtaking summit panorama'),

-- Mount Kalbasaan (hiking_spot_id: 8)
(8, 'Kalbasaan Family Trail', 'Easy', POINT(123.7840, 10.2484), 2.2, 140, 1.0, 'Family-friendly trail, well-maintained paths, educational nature markers, perfect for children, shaded forest walk'),
(8, 'Kalbasaan Nature Loop', 'Moderate', POINT(123.7846, 10.2491), 3.8, 260, 2.0, 'Moderate loop trail, diverse flora and fauna, natural springs, bird watching opportunities, forest canopy views'),
(8, 'Kalbasaan Summit Trail', 'Moderate', POINT(123.7852, 10.2498), 4.5, 320, 2.5, 'Direct summit approach, mixed forest terrain, scenic overlooks of Minglanilla and surrounding areas'),
(8, 'Kalbasaan Adventure Route', 'Hard', POINT(123.7834, 10.2477), 6.0, 440, 3.5, 'Challenging adventure trail, steep forest climbs, technical rock sections, remote wilderness experience'),
(8, 'Kalbasaan Extreme Challenge', 'Advanced', POINT(123.7828, 10.2470), 7.5, 560, 4.5, 'Expert-level challenge route, exposed cliff sections, rope work required, pristine forest, spectacular views'),

-- Mount Mauyog (hiking_spot_id: 9)
(9, 'Mauyog Heritage Trail', 'Easy', POINT(123.7813, 10.4816), 2.8, 180, 1.5, 'Historical trail near Manunggal, cultural significance, gentle slopes, educational markers about local history'),
(9, 'Mauyog Forest Route', 'Moderate', POINT(123.7819, 10.4823), 4.0, 300, 2.0, 'Moderate forest climb, diverse vegetation, natural water sources, views of Balamban countryside'),
(9, 'Mauyog Summit Path', 'Moderate', POINT(123.7825, 10.4830), 5.0, 380, 2.5, 'Traditional summit trail, mixed terrain, panoramic views of western Cebu mountains and coast'),
(9, 'Mauyog Technical Route', 'Hard', POINT(123.7807, 10.4809), 6.5, 500, 3.5, 'Challenging technical climbing, steep rock faces, dense jungle sections, advanced hiking skills required'),
(9, 'Mauyog Extreme Traverse', 'Advanced', POINT(123.7800, 10.4802), 8.0, 620, 4.5, 'Expert-level traverse, exposed ridge walking, rope-assisted climbs, pristine wilderness, breathtaking views'),

-- Mount Lanaya (hiking_spot_id: 10)
(10, 'Lanaya Coastal Approach', 'Easy', POINT(123.3246, 9.6559), 3.2, 220, 1.5, 'Gentle coastal mountain approach, sea views, tropical vegetation, perfect for beginners, cool ocean breeze'),
(10, 'Lanaya Nature Trail', 'Moderate', POINT(123.3252, 9.6566), 4.5, 340, 2.5, 'Moderate nature trail, diverse ecosystems, bird watching paradise, natural springs, forest canopy walk'),
(10, 'Lanaya Summit Route', 'Moderate', POINT(123.3258, 9.6573), 5.5, 420, 3.0, 'Traditional summit climb, mixed forest terrain, panoramic views of Alegria coastline and surrounding mountains'),
(10, 'Lanaya Wilderness Trek', 'Hard', POINT(123.3240, 9.6552), 7.0, 540, 4.0, 'Challenging wilderness route, pristine forest, wildlife spotting opportunities, steep rocky ascents'),
(10, 'Lanaya Technical Ascent', 'Advanced', POINT(123.3233, 9.6545), 8.5, 660, 5.0, 'Expert-level technical climbing, rope work required, old-growth forest, spectacular summit panorama'),

-- Mount Hambubuyog (hiking_spot_id: 11)
(11, 'Hambubuyog Base Trail', 'Easy', POINT(123.3096, 9.5576), 2.5, 160, 1.5, 'Accessible base trail, local community interaction, agricultural landscapes, gentle introduction to mountain hiking'),
(11, 'Hambubuyog Rock Trail', 'Moderate', POINT(123.3102, 9.5583), 4.0, 280, 2.0, 'Moderate climb featuring unique rock formations, geological interest, natural sculpture gardens, scenic viewpoints'),
(11, 'Hambubuyog Summit Route', 'Moderate', POINT(123.3108, 9.5590), 5.0, 360, 2.5, 'Direct summit approach, mixed terrain with distinctive rock outcrops, views of Ginatilan and southern coast'),
(11, 'Hambubuyog Technical Route', 'Hard', POINT(123.3090, 9.5569), 6.5, 480, 3.5, 'Challenging technical route, rock climbing sections, steep ascents, advanced navigation required'),
(11, 'Hambubuyog Extreme Challenge', 'Advanced', POINT(123.3083, 9.5562), 8.0, 600, 4.5, 'Expert-level challenge, exposed cliff climbing, rope-assisted sections, pristine wilderness, spectacular views'),

-- Mount Kalawisan (Kanlaas Ridge) (hiking_spot_id: 12)
(12, 'Kalawisan Coastal Trail', 'Easy', POINT(123.9633, 10.2957), 2.0, 120, 1.0, 'Easy coastal ridge trail, island views, sea breeze, perfect for beginners, views of Mactan and nearby islands'),
(12, 'Kanlaas Ridge Walk', 'Moderate', POINT(123.9639, 10.2964), 3.5, 240, 2.0, 'Moderate ridge walk, coastal mountain scenery, marine views, tropical vegetation, accessible trail'),
(12, 'Kalawisan Summit Trail', 'Moderate', POINT(123.9645, 10.2971), 4.5, 320, 2.5, 'Summit trail with coastal views, mixed terrain, panoramic views of Lapu-Lapu City and surrounding waters'),
(12, 'Kalawisan Adventure Route', 'Hard', POINT(123.9627, 10.2950), 6.0, 440, 3.5, 'Challenging adventure trail, steep coastal climbs, technical sections, remote areas with pristine views'),
(12, 'Kalawisan Extreme Circuit', 'Advanced', POINT(123.9620, 10.2943), 7.5, 560, 4.0, 'Expert-level circuit, exposed coastal cliffs, rope work required, spectacular marine and island views'),

-- Osmeña Peak (hiking_spot_id: 13)
(13, 'Osmeña Easy Ascent', 'Easy', POINT(123.4821, 9.8197), 1.5, 100, 0.5, 'Gentle ascent to Cebu\'s highest peak, rolling hills landscape, perfect for families, iconic chocolate hills-like scenery'),
(13, 'Osmeña Classic Trail', 'Moderate', POINT(123.4827, 9.8204), 3.0, 200, 1.5, 'Traditional route to the summit, moderate climb through grasslands, 360-degree views, most popular trail'),
(13, 'Osmeña Sunrise Trail', 'Moderate', POINT(123.4833, 9.8211), 3.5, 250, 2.0, 'Early morning trail for sunrise viewing, spectacular dawn views, rolling hills silhouettes, photographer\'s paradise'),
(13, 'Osmeña Extended Loop', 'Hard', POINT(123.4815, 9.8190), 5.5, 380, 3.0, 'Extended loop trail, multiple peaks, challenging terrain, comprehensive mountain experience, diverse viewpoints'),
(13, 'Osmeña Extreme Traverse', 'Advanced', POINT(123.4808, 9.8183), 7.0, 480, 4.0, 'Expert-level traverse, technical ridge walking, remote wilderness areas, spectacular panoramic summit views'),

-- Casino Peak (hiking_spot_id: 14)
(14, 'Casino Gentle Approach', 'Easy', POINT(123.4800, 9.8160), 2.0, 140, 1.0, 'Gentle approach to Casino Peak, less crowded than Osmeña, rolling grassland terrain, peaceful mountain experience'),
(14, 'Casino Nature Trail', 'Moderate', POINT(123.4806, 9.8167), 3.5, 260, 2.0, 'Moderate nature trail, diverse mountain vegetation, scenic overlooks, bird watching opportunities'),
(14, 'Casino Summit Route', 'Moderate', POINT(123.4812, 9.8174), 4.0, 320, 2.5, 'Direct summit route, mixed grassland and forest, panoramic views similar to Osmeña but more secluded'),
(14, 'Casino Adventure Trail', 'Hard', POINT(123.4794, 9.8153), 5.5, 440, 3.5, 'Challenging adventure trail, steep ascents, technical sections, remote wilderness experience'),
(14, 'Casino Extreme Challenge', 'Advanced', POINT(123.4787, 9.8146), 7.0, 560, 4.5, 'Expert-level challenge, exposed ridge sections, rope-assisted climbs, pristine mountain wilderness'),

-- Budlaan Falls (hiking_spot_id: 15)
(15, 'Budlaan Falls Easy Trek', 'Easy', POINT(123.8893, 10.3816), 2.5, 120, 1.5, 'Easy trek to beautiful waterfalls, well-maintained trail, perfect for families, refreshing swimming spots'),
(15, 'Budlaan Nature Walk', 'Moderate', POINT(123.8899, 10.3823), 4.0, 240, 2.5, 'Moderate nature walk combining waterfalls and mountain views, diverse forest ecosystems, natural pools'),
(15, 'Budlaan to Kan-irag Trail', 'Moderate', POINT(123.8905, 10.3830), 5.5, 380, 3.5, 'Trail connecting Budlaan Falls to Mount Kan-irag, waterfall and mountain combination, diverse terrain'),
(15, 'Budlaan Adventure Route', 'Hard', POINT(123.8887, 10.3809), 6.5, 480, 4.0, 'Challenging adventure route, steep forest climbs, multiple waterfall levels, technical rock sections'),
(15, 'Budlaan Extreme Circuit', 'Advanced', POINT(123.8880, 10.3802), 8.0, 600, 5.0, 'Expert-level circuit trail, rope-assisted waterfall climbs, pristine forest, spectacular mountain and waterfall views');

-- Update the sequence to continue from the last inserted ID
SELECT setval('trail_routes_route_id_seq', (SELECT MAX(route_id) FROM trail_routes));