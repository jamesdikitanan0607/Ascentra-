-- Direct SQL insertion for hiking spots (run in Supabase SQL Editor)
-- This bypasses RLS policies

-- Clear existing data
DELETE FROM hiking_spots;

-- Insert the 15 official Cebu hiking spots
INSERT INTO hiking_spots (
  name, description, difficulty, elevation, trail_length, estimated_duration,
  image_url, images, amenities, best_season, created_by, is_verified,
  rating, review_count, latitude, longitude
) VALUES
('Mount Babag', 'A popular hiking destination with stunning views of Cebu City and surrounding areas.', 'Moderate', 800, 3.5, 150, 'https://example.com/mount-babag.jpg', '[]'::jsonb, ARRAY['Parking', 'Restrooms', 'Trail markers'], ARRAY['Dry season', 'November to April'], NULL, true, 4.5, 120, 10.3157, 123.8854),

('Mount Kan-irag / Sirao Peak', 'A scenic mountain peak offering panoramic views of Cebu City and surrounding areas.', 'Moderate', 900, 4.0, 210, 'https://example.com/mount-kan-irag.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Scenic viewpoints'], ARRAY['Dry season', 'November to April'], NULL, true, 4.6, 95, 10.3440, 123.8695),

('Mount Naupa', 'A beautiful mountain with lush vegetation and scenic hiking trails.', 'Moderate', 750, 3.0, 150, 'https://example.com/mount-naupa.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Natural springs'], ARRAY['Dry season', 'November to April'], NULL, true, 4.3, 78, 10.2167, 123.7667),

('Mount Manunggal', 'Historic mountain with memorial significance and rewarding summit views.', 'Moderate', 1003, 4.5, 210, 'https://example.com/mount-manunggal.jpg', '[]'::jsonb, ARRAY['Memorial site', 'Trail markers', 'Historical significance'], ARRAY['Dry season', 'November to April'], NULL, true, 4.4, 65, 10.4833, 123.7167),

('Mount Mago', 'A challenging mountain hike with rewarding views at the Carmen/Danao boundary.', 'Hard', 1200, 5.0, 270, 'https://example.com/mount-mago.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Challenging terrain'], ARRAY['Dry season', 'November to April'], NULL, true, 4.6, 42, 10.5833, 124.0167),

('Mount Kapayas', 'A scenic mountain trail offering beautiful views and diverse flora.', 'Moderate', 850, 3.8, 210, 'https://example.com/mount-kapayas.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Diverse flora', 'Scenic views'], ARRAY['Dry season', 'November to April'], NULL, true, 4.3, 38, 10.7167, 124.0167),

('Mount Lantoy', 'A scenic mountain trail with beautiful coastal views and diverse flora.', 'Moderate', 700, 3.2, 150, 'https://example.com/mount-lantoy.jpg', '[]'::jsonb, ARRAY['Coastal views', 'Trail markers', 'Diverse flora'], ARRAY['Dry season', 'November to April'], NULL, true, 4.2, 29, 9.8833, 123.6167),

('Mount Kalbasaan', 'A beautiful mountain offering panoramic views and challenging trails.', 'Moderate', 650, 2.8, 150, 'https://example.com/mount-kalbasaan.jpg', '[]'::jsonb, ARRAY['Panoramic views', 'Trail markers'], ARRAY['Dry season', 'November to April'], NULL, true, 4.1, 25, 10.2333, 123.7833),

('Mount Mauyog', 'A scenic mountain trail with diverse flora near Mt. Manunggal.', 'Moderate', 950, 4.2, 210, 'https://example.com/mount-mauyog.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Diverse flora', 'Near Mt. Manunggal'], ARRAY['Dry season', 'November to April'], NULL, true, 4.3, 31, 10.4667, 123.7333),

('Mount Lanaya', 'A beautiful mountain offering stunning views and peaceful hiking experience.', 'Moderate', 800, 3.6, 210, 'https://example.com/mount-lanaya.jpg', '[]'::jsonb, ARRAY['Peaceful trails', 'Stunning views', 'Trail markers'], ARRAY['Dry season', 'November to April'], NULL, true, 4.2, 27, 9.7667, 123.4167),

('Mount Hambubuyog', 'A scenic mountain offering beautiful views and challenging hiking trails.', 'Moderate', 750, 3.4, 210, 'https://example.com/mount-hambubuyog.jpg', '[]'::jsonb, ARRAY['Beautiful views', 'Challenging trails', 'Trail markers'], ARRAY['Dry season', 'November to April'], NULL, true, 4.1, 52, 9.6167, 123.3333),

('Osmeña Peak', 'The highest peak in Cebu offering breathtaking panoramic views.', 'Easy', 1013, 1.5, 90, 'https://example.com/osmena-peak.jpg', '[]'::jsonb, ARRAY['Highest peak', 'Panoramic views', 'Easy access'], ARRAY['Year-round', 'Best in dry season'], NULL, true, 4.8, 156, 9.7167, 123.5167),

('Casino Peak', 'A scenic peak near Osmeña Peak offering stunning mountain views.', 'Easy', 980, 1.8, 90, 'https://example.com/casino-peak.jpg', '[]'::jsonb, ARRAY['Near Osmeña Peak', 'Mountain views', 'Easy access'], ARRAY['Year-round', 'Best in dry season'], NULL, true, 4.5, 89, 9.7100, 123.5200),

('Budlaan Falls', 'A beautiful waterfall with trekking trail to Mt. Kan-irag, perfect for nature lovers.', 'Moderate', 600, 2.5, 150, 'https://example.com/budlaan-falls.jpg', '[]'::jsonb, ARRAY['Waterfall', 'Nature trail', 'Swimming area'], ARRAY['Rainy season for falls', 'Year-round'], NULL, true, 4.4, 34, 10.3300, 123.8600),

('Spartan Trail', 'Challenging urban trail through the city offering great workout and views.', 'Hard', 400, 2.0, 90, 'https://example.com/spartan-trail.jpg', '[]'::jsonb, ARRAY['Urban trail', 'Fitness challenge', 'City views'], ARRAY['Early morning', 'Late afternoon'], NULL, true, 4.4, 67, 10.3167, 123.8833);

-- Verify insertion
SELECT COUNT(*) as total_spots FROM hiking_spots;
SELECT name, difficulty, rating FROM hiking_spots ORDER BY name;