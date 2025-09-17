-- =====================================================
-- RESET HIKING SPOTS DATA
-- =====================================================
-- This script resets the hiking spots table with the 15 official Cebu spots

-- First, delete all existing hiking spots
DELETE FROM hiking_spots;

-- Insert the 15 official Cebu hiking spots
INSERT INTO hiking_spots (
  name,
  description,
  image_url,
  difficulty,
  elevation,
  trail_length,
  latitude,
  longitude,
  rating,
  review_count,
  created_at,
  updated_at
) VALUES
(
  'Mount Babag',
  'A popular hiking destination offering panoramic views of Cebu City and surrounding areas. Known for its accessible trails and beautiful sunrise views.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Moderate',
  850,
  8.5,
  10.3157,
  123.9621,
  4.5,
  128,
  NOW(),
  NOW()
),
(
  'Mount Kan-irag / Sirao Peak',
  'Famous for its flower gardens and cool climate. The peak offers stunning views and is known for its colorful celosia flowers.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'Easy',
  1200,
  6.2,
  10.3308,
  123.9456,
  4.3,
  95,
  NOW(),
  NOW()
),
(
  'Mount Naupa',
  'A challenging hike with rewarding views of the southern part of Cebu. Known for its rocky terrain and diverse flora.',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
  'Hard',
  1080,
  12.3,
  10.2097,
  123.7564,
  4.2,
  67,
  NOW(),
  NOW()
),
(
  'Mount Manunggal',
  'Historical significance as the crash site of President Ramon Magsaysay. Offers great views and historical monuments.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Moderate',
  980,
  15.7,
  10.4897,
  123.7234,
  4.1,
  89,
  NOW(),
  NOW()
),
(
  'Mount Mago',
  'A lesser-known peak offering solitude and pristine nature. Great for experienced hikers seeking adventure.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'Hard',
  1250,
  18.4,
  10.5234,
  124.0123,
  4.0,
  45,
  NOW(),
  NOW()
),
(
  'Mount Kapayas',
  'Known for its lush vegetation and cool climate. A perfect spot for nature lovers and bird watching.',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
  'Moderate',
  890,
  10.8,
  10.7234,
  124.0567,
  4.3,
  72,
  NOW(),
  NOW()
),
(
  'Mount Lantoy',
  'Offers spectacular views of the southern coastline of Cebu. Known for its challenging trails and beautiful landscapes.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Hard',
  1150,
  14.2,
  9.8734,
  123.6123,
  4.4,
  56,
  NOW(),
  NOW()
),
(
  'Mount Kalbasaan',
  'A relatively easy hike with great views of the metro area. Perfect for beginners and family hiking trips.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'Easy',
  650,
  5.6,
  10.2456,
  123.7890,
  4.2,
  84,
  NOW(),
  NOW()
),
(
  'Mount Mauyog',
  'A scenic peak near Mount Manunggal offering similar historical significance and beautiful mountain views.',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
  'Moderate',
  920,
  13.5,
  10.4756,
  123.7345,
  4.1,
  63,
  NOW(),
  NOW()
),
(
  'Mount Lanaya',
  'Known for its pristine waterfalls and diverse ecosystem. A great combination of hiking and nature exploration.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Hard',
  1080,
  16.8,
  9.7234,
  123.4567,
  4.3,
  41,
  NOW(),
  NOW()
),
(
  'Mount Hambubuyog',
  'A challenging peak in the southern part of Cebu offering panoramic views of the Bohol Sea and surrounding islands.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'Hard',
  1320,
  19.2,
  9.6123,
  123.3456,
  4.2,
  38,
  NOW(),
  NOW()
),
(
  'Spartan Trail',
  'A challenging urban trail in Cebu City perfect for fitness enthusiasts and adventure seekers. Known for its obstacle course-like terrain.',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
  'Moderate',
  420,
  7.3,
  10.3234,
  124.0234,
  4.0,
  92,
  NOW(),
  NOW()
),
(
  'Osmeña Peak',
  'The highest peak in Cebu offering breathtaking 360-degree views. Famous for its rolling hills and cool climate.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Easy',
  1013,
  4.2,
  9.7567,
  123.4234,
  4.6,
  156,
  NOW(),
  NOW()
),
(
  'Casino Peak',
  'Located near Osmeña Peak, this spot offers similar stunning views with fewer crowds. Great for photography.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'Easy',
  980,
  5.8,
  9.7456,
  123.4345,
  4.4,
  78,
  NOW(),
  NOW()
),
(
  'Budlaan Falls',
  'A beautiful waterfall with a trekking trail that connects to Mount Kan-irag. Perfect for waterfall lovers and hikers.',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
  'Moderate',
  750,
  9.5,
  10.3456,
  123.9234,
  4.4,
  103,
  NOW(),
  NOW()
);

-- Update the sequence to ensure proper ID generation
SELECT setval('hiking_spots_id_seq', (SELECT MAX(id) FROM hiking_spots));

COMMIT;