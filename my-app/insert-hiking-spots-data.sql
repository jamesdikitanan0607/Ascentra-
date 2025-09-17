-- Insert hiking spots data
INSERT INTO hiking_spots (name, coordinates, description, cover_image_url, average_rating, number_of_reviews) VALUES
(
    'Mount Babag',
    POINT(123.8856, 10.3702),
    'A popular hiking destination in Cebu City offering panoramic views of the metro and surrounding islands. Known for its accessible trails and stunning sunrise/sunset vistas.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    4.5,
    127
),
(
    'Mount Kan-irag / Sirao Peak',
    POINT(123.8854, 10.4117),
    'Famous for its flower gardens and cool climate, this peak offers breathtaking views of Cebu City and the surrounding mountains. A favorite among nature lovers.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    4.7,
    89
),
(
    'Mount Naupa',
    POINT(123.7564, 10.2558),
    'Located in Naga City, this mountain provides challenging trails and rewarding views. Known for its diverse flora and fauna along the hiking paths.',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    4.3,
    56
),
(
    'Mount Manunggal',
    POINT(123.7839, 10.4695),
    'A historic mountain in Balamban with significant cultural importance. Features memorial sites and offers excellent views of the western coast of Cebu.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    4.6,
    73
),
(
    'Mount Mago',
    POINT(123.9320, 10.5539),
    'Situated on the Carmen/Danao boundary, this mountain offers challenging terrain and spectacular views. Popular among experienced hikers seeking adventure.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    4.4,
    42
),
(
    'Mount Kapayas',
    POINT(123.9516, 10.7105),
    'Located in Catmon, this peak provides a mix of moderate to challenging trails. Known for its lush vegetation and panoramic coastal views.',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    4.2,
    38
),
(
    'Mount Lantoy',
    POINT(123.5494, 9.8971),
    'A beautiful mountain in Argao offering diverse ecosystems and stunning views of the southern Cebu coastline. Perfect for nature photography.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    4.5,
    61
),
(
    'Mount Kalbasaan',
    POINT(123.7846, 10.2491),
    'Located in Minglanilla, this mountain features accessible trails with beautiful forest scenery. Great for beginners and families.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    4.1,
    45
),
(
    'Mount Mauyog',
    POINT(123.7819, 10.4823),
    'Near Mount Manunggal in Balamban, this peak offers similar historical significance with additional challenging routes for experienced hikers.',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    4.3,
    29
),
(
    'Mount Lanaya',
    POINT(123.3252, 9.6566),
    'A scenic mountain in Alegria known for its pristine natural environment and diverse wildlife. Offers excellent bird watching opportunities.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    4.4,
    34
),
(
    'Mount Hambubuyog',
    POINT(123.3102, 9.5583),
    'Located in Ginatilan, this mountain provides challenging trails with rewarding summit views. Known for its unique rock formations.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    4.2,
    27
),
(
    'Mount Kalawisan (Kanlaas Ridge)',
    POINT(123.9639, 10.2964),
    'Situated in Lapu-Lapu City, this ridge offers coastal mountain hiking with views of Mactan Island and surrounding waters.',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    4.0,
    31
),
(
    'Osmeña Peak',
    POINT(123.4827, 9.8204),
    'The highest peak in Cebu located in Dalaguete. Famous for its rolling hills resembling chocolate hills and 360-degree views.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    4.8,
    156
),
(
    'Casino Peak',
    POINT(123.4806, 9.8167),
    'Near Osmeña Peak in Dalaguete, this peak offers similar stunning views with less crowded trails. Perfect for those seeking solitude.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    4.6,
    78
),
(
    'Budlaan Falls',
    POINT(123.8899, 10.3823),
    'A trekking trail in Cebu City leading to Mount Kan-irag, featuring beautiful waterfalls and lush forest scenery along the way.',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    4.3,
    92
);

-- Update the sequence to continue from the last inserted ID
SELECT setval('hiking_spots_hiking_spot_id_seq', (SELECT MAX(hiking_spot_id) FROM hiking_spots));