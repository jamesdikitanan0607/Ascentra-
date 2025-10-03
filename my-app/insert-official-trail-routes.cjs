const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Mapping from original IDs to actual database IDs
const spotIdMapping = {
  1: 71,  // Mount Babag
  2: 75,  // Mount Kan-irag / Sirao Peak
  3: 76,  // Mount Naupa
  4: 77,  // Mount Manunggal
  5: 78,  // Mount Mago
  6: 79,  // Mount Kapayas
  7: 80,  // Mount Lantoy
  8: 81,  // Mount Kalbasaan
  9: 82,  // Mount Mauyog
  10: 83, // Mount Lanaya
  11: 84, // Mount Hambubuyog
  12: 85, // Mount Kalawisan (Kanlaas Ridge) - using Budlaan Falls as placeholder
  13: 72, // Osmeña Peak
  14: 73, // Casino Peak
  15: 85  // Budlaan Falls
};

// Official trail routes data from insert-trail-routes-data.sql
const officialTrailRoutes = [
  // Mount Babag (hiking_spot_id: 71)
  {
    hiking_spot_id: 1,
    name: 'Babag Ridge Easy Trail',
    difficulty: 'Easy',
    start_coordinates: [123.8850, 10.3695],
    length: 2.5,
    elevation_gain: 180,
    estimated_time: 1.5,
    description: 'Gentle slopes through pine forests, perfect for beginners, scenic viewpoints of Cebu City, well-marked trail with rest areas'
  },
  {
    hiking_spot_id: 1,
    name: 'Babag Summit Classic',
    difficulty: 'Moderate',
    start_coordinates: [123.8856, 10.3702],
    length: 4.2,
    elevation_gain: 320,
    estimated_time: 2.5,
    description: 'Traditional route to the summit, mixed terrain with rocky sections, panoramic views of metro Cebu and Mactan Island'
  },
  {
    hiking_spot_id: 1,
    name: 'Babag Sunrise Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.8862, 10.3708],
    length: 3.8,
    elevation_gain: 290,
    estimated_time: 2.0,
    description: 'Early morning trail for sunrise viewing, steep initial climb, breathtaking dawn views over Cebu strait'
  },
  {
    hiking_spot_id: 1,
    name: 'Babag Adventure Circuit',
    difficulty: 'Hard',
    start_coordinates: [123.8845, 10.3690],
    length: 6.5,
    elevation_gain: 450,
    estimated_time: 4.0,
    description: 'Challenging loop trail, technical rock scrambling, dense forest sections, multiple summit viewpoints'
  },
  {
    hiking_spot_id: 1,
    name: 'Babag Extreme Traverse',
    difficulty: 'Advanced',
    start_coordinates: [123.8840, 10.3685],
    length: 8.2,
    elevation_gain: 580,
    estimated_time: 5.5,
    description: 'Expert-level ridge traverse, exposed cliff sections, rope-assisted climbs, spectacular 360-degree summit views'
  },

  // Mount Kan-irag / Sirao Peak (hiking_spot_id: 2)
  {
    hiking_spot_id: 2,
    name: 'Sirao Flower Garden Trail',
    difficulty: 'Easy',
    start_coordinates: [123.8848, 10.4110],
    length: 2.0,
    elevation_gain: 120,
    estimated_time: 1.0,
    description: 'Gentle walk through colorful flower gardens, cool mountain air, perfect for families, celosia and other seasonal blooms'
  },
  {
    hiking_spot_id: 2,
    name: 'Kan-irag Nature Walk',
    difficulty: 'Moderate',
    start_coordinates: [123.8854, 10.4117],
    length: 3.5,
    elevation_gain: 250,
    estimated_time: 2.0,
    description: 'Moderate climb through pine and eucalyptus forests, bird watching opportunities, scenic overlooks of Temple of Leah'
  },
  {
    hiking_spot_id: 2,
    name: 'Sirao Peak Summit',
    difficulty: 'Moderate',
    start_coordinates: [123.8860, 10.4125],
    length: 4.0,
    elevation_gain: 310,
    estimated_time: 2.5,
    description: 'Direct route to the highest point, cool climate vegetation, stunning views of Cebu City and Bohol strait'
  },
  {
    hiking_spot_id: 2,
    name: 'Kan-irag Ridge Challenge',
    difficulty: 'Hard',
    start_coordinates: [123.8842, 10.4105],
    length: 5.8,
    elevation_gain: 420,
    estimated_time: 3.5,
    description: 'Challenging ridge walk with steep ascents, diverse flora including native orchids, multiple scenic viewpoints'
  },
  {
    hiking_spot_id: 2,
    name: 'Sirao Extreme Loop',
    difficulty: 'Advanced',
    start_coordinates: [123.8835, 10.4100],
    length: 7.5,
    elevation_gain: 520,
    estimated_time: 4.5,
    description: 'Technical loop trail with rock climbing sections, pristine forest areas, expert navigation required, remote wilderness experience'
  },

  // Mount Naupa (hiking_spot_id: 3)
  {
    hiking_spot_id: 3,
    name: 'Naupa Base Trail',
    difficulty: 'Easy',
    start_coordinates: [123.7558, 10.2550],
    length: 2.8,
    elevation_gain: 200,
    estimated_time: 1.5,
    description: 'Accessible trail through agricultural areas, local community interaction, gentle slopes with fruit trees and vegetable gardens'
  },
  {
    hiking_spot_id: 3,
    name: 'Naupa Forest Path',
    difficulty: 'Moderate',
    start_coordinates: [123.7564, 10.2558],
    length: 4.5,
    elevation_gain: 340,
    estimated_time: 2.5,
    description: 'Moderate climb through secondary forest, diverse bird species, natural springs along the trail, shaded canopy walk'
  },
  {
    hiking_spot_id: 3,
    name: 'Naupa Summit Route',
    difficulty: 'Moderate',
    start_coordinates: [123.7570, 10.2565],
    length: 5.2,
    elevation_gain: 380,
    estimated_time: 3.0,
    description: 'Traditional summit approach, mixed terrain with river crossings, panoramic views of Naga City and surrounding valleys'
  },
  {
    hiking_spot_id: 3,
    name: 'Naupa Wilderness Trek',
    difficulty: 'Hard',
    start_coordinates: [123.7552, 10.2545],
    length: 6.8,
    elevation_gain: 480,
    estimated_time: 4.0,
    description: 'Challenging wilderness route, dense forest sections, wildlife spotting opportunities, steep rocky ascents'
  },
  {
    hiking_spot_id: 3,
    name: 'Naupa Technical Ascent',
    difficulty: 'Advanced',
    start_coordinates: [123.7545, 10.2540],
    length: 8.0,
    elevation_gain: 600,
    estimated_time: 5.0,
    description: 'Expert-level technical climbing, rope work required, pristine old-growth forest, spectacular summit views'
  },

  // Mount Manunggal (hiking_spot_id: 4)
  {
    hiking_spot_id: 4,
    name: 'Manunggal Memorial Trail',
    difficulty: 'Easy',
    start_coordinates: [123.7833, 10.4688],
    length: 3.0,
    elevation_gain: 220,
    estimated_time: 1.5,
    description: 'Historical trail to crash site memorial, educational markers, gentle slopes through grasslands, cultural significance'
  },
  {
    hiking_spot_id: 4,
    name: 'Manunggal Heritage Path',
    difficulty: 'Moderate',
    start_coordinates: [123.7839, 10.4695],
    length: 4.8,
    elevation_gain: 360,
    estimated_time: 2.5,
    description: 'Moderate climb with historical significance, monument visits, scenic views of western Cebu coast, well-maintained trail'
  },
  {
    hiking_spot_id: 4,
    name: 'Manunggal Summit Classic',
    difficulty: 'Moderate',
    start_coordinates: [123.7845, 10.4702],
    length: 5.5,
    elevation_gain: 420,
    estimated_time: 3.0,
    description: 'Traditional route to the summit, mixed forest and grassland terrain, panoramic coastal views, memorial site visit'
  },
  {
    hiking_spot_id: 4,
    name: 'Manunggal Ridge Adventure',
    difficulty: 'Hard',
    start_coordinates: [123.7827, 10.4682],
    length: 7.2,
    elevation_gain: 540,
    estimated_time: 4.0,
    description: 'Challenging ridge traverse, steep ascents through dense forest, multiple viewpoints, technical rock sections'
  },
  {
    hiking_spot_id: 4,
    name: 'Manunggal Extreme Challenge',
    difficulty: 'Advanced',
    start_coordinates: [123.7820, 10.4675],
    length: 9.0,
    elevation_gain: 680,
    estimated_time: 5.5,
    description: 'Expert-level mountain traverse, exposed ridge walking, rope-assisted sections, breathtaking summit panorama'
  },

  // Mount Mago (hiking_spot_id: 5)
  {
    hiking_spot_id: 5,
    name: 'Mago Foothills Trail',
    difficulty: 'Easy',
    start_coordinates: [123.9314, 10.5532],
    length: 2.5,
    elevation_gain: 180,
    estimated_time: 1.5,
    description: 'Gentle introduction to mountain hiking, agricultural landscapes, local community trails, fruit orchards and vegetable farms'
  },
  {
    hiking_spot_id: 5,
    name: 'Mago Forest Route',
    difficulty: 'Moderate',
    start_coordinates: [123.9320, 10.5539],
    length: 4.0,
    elevation_gain: 320,
    estimated_time: 2.5,
    description: 'Moderate forest climb, diverse tropical vegetation, natural water sources, bird watching opportunities'
  },
  {
    hiking_spot_id: 5,
    name: 'Mago Summit Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.9326, 10.5546],
    length: 5.0,
    elevation_gain: 400,
    estimated_time: 3.0,
    description: 'Direct summit approach, mixed terrain with rocky outcrops, panoramic views of Carmen and Danao areas'
  },
  {
    hiking_spot_id: 5,
    name: 'Mago Technical Route',
    difficulty: 'Hard',
    start_coordinates: [123.9308, 10.5525],
    length: 6.5,
    elevation_gain: 520,
    estimated_time: 4.0,
    description: 'Challenging technical climbing, steep rock faces, dense jungle sections, advanced navigation skills required'
  },
  {
    hiking_spot_id: 5,
    name: 'Mago Extreme Traverse',
    difficulty: 'Advanced',
    start_coordinates: [123.9300, 10.5518],
    length: 8.5,
    elevation_gain: 650,
    estimated_time: 5.0,
    description: 'Expert-level mountain traverse, exposed cliff sections, pristine wilderness, spectacular 360-degree views'
  },

  // Mount Kapayas (hiking_spot_id: 6)
  {
    hiking_spot_id: 6,
    name: 'Kapayas Coastal Trail',
    difficulty: 'Easy',
    start_coordinates: [123.9510, 10.7098],
    length: 2.8,
    elevation_gain: 160,
    estimated_time: 1.5,
    description: 'Easy coastal mountain trail, sea breeze cooling, views of Camotes Sea, gentle slopes through coconut groves'
  },
  {
    hiking_spot_id: 6,
    name: 'Kapayas Nature Walk',
    difficulty: 'Moderate',
    start_coordinates: [123.9516, 10.7105],
    length: 4.2,
    elevation_gain: 280,
    estimated_time: 2.0,
    description: 'Moderate climb through tropical forest, diverse plant species, natural springs, coastal and mountain views'
  },
  {
    hiking_spot_id: 6,
    name: 'Kapayas Summit Route',
    difficulty: 'Moderate',
    start_coordinates: [123.9522, 10.7112],
    length: 5.0,
    elevation_gain: 350,
    estimated_time: 2.5,
    description: 'Traditional summit trail, mixed forest and grassland, panoramic views of northern Cebu coast and islands'
  },
  {
    hiking_spot_id: 6,
    name: 'Kapayas Ridge Challenge',
    difficulty: 'Hard',
    start_coordinates: [123.9504, 10.7091],
    length: 6.8,
    elevation_gain: 460,
    estimated_time: 3.5,
    description: 'Challenging ridge walk, steep ascents, dense forest sections, technical rock scrambling, remote wilderness'
  },
  {
    hiking_spot_id: 6,
    name: 'Kapayas Extreme Circuit',
    difficulty: 'Advanced',
    start_coordinates: [123.9495, 10.7085],
    length: 8.0,
    elevation_gain: 580,
    estimated_time: 4.5,
    description: 'Expert-level circuit trail, exposed ridge sections, rope work required, pristine forest, spectacular summit views'
  },

  // Mount Lantoy (hiking_spot_id: 7)
  {
    hiking_spot_id: 7,
    name: 'Lantoy Valley Trail',
    difficulty: 'Easy',
    start_coordinates: [123.5488, 9.8964],
    length: 3.0,
    elevation_gain: 200,
    estimated_time: 1.5,
    description: 'Gentle valley approach, agricultural terraces, local farming communities, fruit trees and vegetable gardens'
  },
  {
    hiking_spot_id: 7,
    name: 'Lantoy Forest Path',
    difficulty: 'Moderate',
    start_coordinates: [123.5494, 9.8971],
    length: 4.5,
    elevation_gain: 320,
    estimated_time: 2.5,
    description: 'Moderate forest climb, diverse ecosystems, natural photography opportunities, bird watching, cool forest canopy'
  },
  {
    hiking_spot_id: 7,
    name: 'Lantoy Summit Classic',
    difficulty: 'Moderate',
    start_coordinates: [123.5500, 9.8978],
    length: 5.5,
    elevation_gain: 400,
    estimated_time: 3.0,
    description: 'Traditional summit route, mixed terrain, panoramic views of southern Cebu coastline and Bohol Sea'
  },
  {
    hiking_spot_id: 7,
    name: 'Lantoy Wilderness Trek',
    difficulty: 'Hard',
    start_coordinates: [123.5482, 9.8957],
    length: 7.0,
    elevation_gain: 520,
    estimated_time: 4.0,
    description: 'Challenging wilderness route, dense primary forest, wildlife spotting, steep rocky ascents, river crossings'
  },
  {
    hiking_spot_id: 7,
    name: 'Lantoy Technical Ascent',
    difficulty: 'Advanced',
    start_coordinates: [123.5475, 9.8950],
    length: 8.5,
    elevation_gain: 640,
    estimated_time: 5.0,
    description: 'Expert-level technical climbing, rope-assisted sections, pristine old-growth forest, breathtaking summit panorama'
  },

  // Mount Kalbasaan (hiking_spot_id: 8)
  {
    hiking_spot_id: 8,
    name: 'Kalbasaan Family Trail',
    difficulty: 'Easy',
    start_coordinates: [123.7840, 10.2484],
    length: 2.2,
    elevation_gain: 140,
    estimated_time: 1.0,
    description: 'Family-friendly trail, well-maintained paths, educational nature markers, perfect for children, shaded forest walk'
  },
  {
    hiking_spot_id: 8,
    name: 'Kalbasaan Nature Loop',
    difficulty: 'Moderate',
    start_coordinates: [123.7846, 10.2491],
    length: 3.8,
    elevation_gain: 260,
    estimated_time: 2.0,
    description: 'Moderate loop trail, diverse flora and fauna, natural springs, bird watching opportunities, forest canopy views'
  },
  {
    hiking_spot_id: 8,
    name: 'Kalbasaan Summit Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.7852, 10.2498],
    length: 4.5,
    elevation_gain: 320,
    estimated_time: 2.5,
    description: 'Direct summit approach, mixed forest terrain, scenic overlooks of Minglanilla and surrounding areas'
  },
  {
    hiking_spot_id: 8,
    name: 'Kalbasaan Adventure Route',
    difficulty: 'Hard',
    start_coordinates: [123.7834, 10.2477],
    length: 6.0,
    elevation_gain: 440,
    estimated_time: 3.5,
    description: 'Challenging adventure trail, steep forest climbs, technical rock sections, remote wilderness experience'
  },
  {
    hiking_spot_id: 8,
    name: 'Kalbasaan Extreme Challenge',
    difficulty: 'Advanced',
    start_coordinates: [123.7828, 10.2470],
    length: 7.5,
    elevation_gain: 560,
    estimated_time: 4.5,
    description: 'Expert-level challenge route, exposed cliff sections, rope work required, pristine forest, spectacular views'
  },

  // Mount Mauyog (hiking_spot_id: 9)
  {
    hiking_spot_id: 9,
    name: 'Mauyog Heritage Trail',
    difficulty: 'Easy',
    start_coordinates: [123.7813, 10.4816],
    length: 2.8,
    elevation_gain: 180,
    estimated_time: 1.5,
    description: 'Historical trail near Manunggal, cultural significance, gentle slopes, educational markers about local history'
  },
  {
    hiking_spot_id: 9,
    name: 'Mauyog Forest Route',
    difficulty: 'Moderate',
    start_coordinates: [123.7819, 10.4823],
    length: 4.0,
    elevation_gain: 300,
    estimated_time: 2.0,
    description: 'Moderate forest climb, diverse vegetation, natural water sources, views of Balamban countryside'
  },
  {
    hiking_spot_id: 9,
    name: 'Mauyog Summit Path',
    difficulty: 'Moderate',
    start_coordinates: [123.7825, 10.4830],
    length: 5.0,
    elevation_gain: 380,
    estimated_time: 2.5,
    description: 'Traditional summit trail, mixed terrain, panoramic views of western Cebu mountains and coast'
  },
  {
    hiking_spot_id: 9,
    name: 'Mauyog Technical Route',
    difficulty: 'Hard',
    start_coordinates: [123.7807, 10.4809],
    length: 6.5,
    elevation_gain: 500,
    estimated_time: 3.5,
    description: 'Challenging technical climbing, steep rock faces, dense jungle sections, advanced hiking skills required'
  },
  {
    hiking_spot_id: 9,
    name: 'Mauyog Extreme Traverse',
    difficulty: 'Advanced',
    start_coordinates: [123.7800, 10.4802],
    length: 8.0,
    elevation_gain: 620,
    estimated_time: 4.5,
    description: 'Expert-level traverse, exposed ridge walking, rope-assisted climbs, pristine wilderness, breathtaking views'
  },

  // Mount Lanaya (hiking_spot_id: 10)
  {
    hiking_spot_id: 10,
    name: 'Lanaya Coastal Approach',
    difficulty: 'Easy',
    start_coordinates: [123.3246, 9.6559],
    length: 3.2,
    elevation_gain: 220,
    estimated_time: 1.5,
    description: 'Gentle coastal mountain approach, sea views, tropical vegetation, perfect for beginners, cool ocean breeze'
  },
  {
    hiking_spot_id: 10,
    name: 'Lanaya Nature Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.3252, 9.6566],
    length: 4.5,
    elevation_gain: 340,
    estimated_time: 2.5,
    description: 'Moderate nature trail, diverse ecosystems, bird watching paradise, natural springs, forest canopy walk'
  },
  {
    hiking_spot_id: 10,
    name: 'Lanaya Summit Route',
    difficulty: 'Moderate',
    start_coordinates: [123.3258, 9.6573],
    length: 5.5,
    elevation_gain: 420,
    estimated_time: 3.0,
    description: 'Traditional summit climb, mixed forest terrain, panoramic views of Alegria coastline and surrounding mountains'
  },
  {
    hiking_spot_id: 10,
    name: 'Lanaya Wilderness Trek',
    difficulty: 'Hard',
    start_coordinates: [123.3240, 9.6552],
    length: 7.0,
    elevation_gain: 540,
    estimated_time: 4.0,
    description: 'Challenging wilderness route, pristine forest, wildlife spotting opportunities, steep rocky ascents'
  },
  {
    hiking_spot_id: 10,
    name: 'Lanaya Technical Ascent',
    difficulty: 'Advanced',
    start_coordinates: [123.3233, 9.6545],
    length: 8.5,
    elevation_gain: 660,
    estimated_time: 5.0,
    description: 'Expert-level technical climbing, rope work required, old-growth forest, spectacular summit panorama'
  },

  // Mount Hambubuyog (hiking_spot_id: 11)
  {
    hiking_spot_id: 11,
    name: 'Hambubuyog Base Trail',
    difficulty: 'Easy',
    start_coordinates: [123.3096, 9.5576],
    length: 2.5,
    elevation_gain: 160,
    estimated_time: 1.5,
    description: 'Accessible base trail, local community interaction, agricultural landscapes, gentle introduction to mountain hiking'
  },
  {
    hiking_spot_id: 11,
    name: 'Hambubuyog Rock Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.3102, 9.5583],
    length: 4.0,
    elevation_gain: 280,
    estimated_time: 2.0,
    description: 'Moderate climb featuring unique rock formations, geological interest, natural sculpture gardens, scenic viewpoints'
  },
  {
    hiking_spot_id: 11,
    name: 'Hambubuyog Summit Route',
    difficulty: 'Moderate',
    start_coordinates: [123.3108, 9.5590],
    length: 5.0,
    elevation_gain: 360,
    estimated_time: 2.5,
    description: 'Direct summit approach, mixed terrain with distinctive rock outcrops, views of Ginatilan and southern coast'
  },
  {
    hiking_spot_id: 11,
    name: 'Hambubuyog Technical Route',
    difficulty: 'Hard',
    start_coordinates: [123.3090, 9.5569],
    length: 6.5,
    elevation_gain: 480,
    estimated_time: 3.5,
    description: 'Challenging technical route, rock climbing sections, steep ascents, advanced navigation required'
  },
  {
    hiking_spot_id: 11,
    name: 'Hambubuyog Extreme Challenge',
    difficulty: 'Advanced',
    start_coordinates: [123.3083, 9.5562],
    length: 8.0,
    elevation_gain: 600,
    estimated_time: 4.5,
    description: 'Expert-level challenge, exposed cliff climbing, rope-assisted sections, pristine wilderness, spectacular views'
  },

  // Mount Kalawisan (Kanlaas Ridge) (hiking_spot_id: 12)
  {
    hiking_spot_id: 12,
    name: 'Kalawisan Coastal Trail',
    difficulty: 'Easy',
    start_coordinates: [123.9633, 10.2957],
    length: 2.0,
    elevation_gain: 120,
    estimated_time: 1.0,
    description: 'Easy coastal ridge trail, island views, sea breeze, perfect for beginners, views of Mactan and nearby islands'
  },
  {
    hiking_spot_id: 12,
    name: 'Kanlaas Ridge Walk',
    difficulty: 'Moderate',
    start_coordinates: [123.9639, 10.2964],
    length: 3.5,
    elevation_gain: 240,
    estimated_time: 2.0,
    description: 'Moderate ridge walk, coastal mountain scenery, marine views, tropical vegetation, accessible trail'
  },
  {
    hiking_spot_id: 12,
    name: 'Kalawisan Summit Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.9645, 10.2971],
    length: 4.5,
    elevation_gain: 320,
    estimated_time: 2.5,
    description: 'Summit trail with coastal views, mixed terrain, panoramic views of Lapu-Lapu City and surrounding waters'
  },
  {
    hiking_spot_id: 12,
    name: 'Kalawisan Adventure Route',
    difficulty: 'Hard',
    start_coordinates: [123.9627, 10.2950],
    length: 6.0,
    elevation_gain: 440,
    estimated_time: 3.5,
    description: 'Challenging adventure trail, steep coastal climbs, technical sections, remote areas with pristine views'
  },
  {
    hiking_spot_id: 12,
    name: 'Kalawisan Extreme Circuit',
    difficulty: 'Advanced',
    start_coordinates: [123.9620, 10.2943],
    length: 7.5,
    elevation_gain: 560,
    estimated_time: 4.0,
    description: 'Expert-level circuit, exposed coastal cliffs, rope work required, spectacular marine and island views'
  },

  // Osmeña Peak (hiking_spot_id: 13)
  {
    hiking_spot_id: 13,
    name: 'Osmeña Easy Ascent',
    difficulty: 'Easy',
    start_coordinates: [123.4821, 9.8197],
    length: 1.5,
    elevation_gain: 100,
    estimated_time: 0.5,
    description: 'Gentle ascent to Cebu\'s highest peak, rolling hills landscape, perfect for families, iconic chocolate hills-like scenery'
  },
  {
    hiking_spot_id: 13,
    name: 'Osmeña Classic Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.4827, 9.8204],
    length: 3.0,
    elevation_gain: 200,
    estimated_time: 1.5,
    description: 'Traditional route to the summit, moderate climb through grasslands, 360-degree views, most popular trail'
  },
  {
    hiking_spot_id: 13,
    name: 'Osmeña Sunrise Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.4833, 9.8211],
    length: 3.5,
    elevation_gain: 250,
    estimated_time: 2.0,
    description: 'Early morning trail for sunrise viewing, spectacular dawn views, rolling hills silhouettes, photographer\'s paradise'
  },
  {
    hiking_spot_id: 13,
    name: 'Osmeña Extended Loop',
    difficulty: 'Hard',
    start_coordinates: [123.4815, 9.8190],
    length: 5.5,
    elevation_gain: 380,
    estimated_time: 3.0,
    description: 'Extended loop trail, multiple peaks, challenging terrain, comprehensive mountain experience, diverse viewpoints'
  },
  {
    hiking_spot_id: 13,
    name: 'Osmeña Extreme Traverse',
    difficulty: 'Advanced',
    start_coordinates: [123.4808, 9.8183],
    length: 7.0,
    elevation_gain: 480,
    estimated_time: 4.0,
    description: 'Expert-level traverse, technical ridge walking, remote wilderness areas, spectacular panoramic summit views'
  },

  // Casino Peak (hiking_spot_id: 14)
  {
    hiking_spot_id: 14,
    name: 'Casino Gentle Approach',
    difficulty: 'Easy',
    start_coordinates: [123.4800, 9.8160],
    length: 2.0,
    elevation_gain: 140,
    estimated_time: 1.0,
    description: 'Gentle approach to Casino Peak, less crowded than Osmeña, rolling grassland terrain, peaceful mountain experience'
  },
  {
    hiking_spot_id: 14,
    name: 'Casino Nature Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.4806, 9.8167],
    length: 3.5,
    elevation_gain: 260,
    estimated_time: 2.0,
    description: 'Moderate nature trail, diverse mountain vegetation, scenic overlooks, bird watching opportunities'
  },
  {
    hiking_spot_id: 14,
    name: 'Casino Summit Route',
    difficulty: 'Moderate',
    start_coordinates: [123.4812, 9.8174],
    length: 4.0,
    elevation_gain: 320,
    estimated_time: 2.5,
    description: 'Direct summit route, mixed grassland and forest, panoramic views similar to Osmeña but more secluded'
  },
  {
    hiking_spot_id: 14,
    name: 'Casino Adventure Trail',
    difficulty: 'Hard',
    start_coordinates: [123.4794, 9.8153],
    length: 5.5,
    elevation_gain: 440,
    estimated_time: 3.5,
    description: 'Challenging adventure trail, steep ascents, technical sections, remote wilderness experience'
  },
  {
    hiking_spot_id: 14,
    name: 'Casino Extreme Challenge',
    difficulty: 'Advanced',
    start_coordinates: [123.4787, 9.8146],
    length: 7.0,
    elevation_gain: 560,
    estimated_time: 4.5,
    description: 'Expert-level challenge, exposed ridge sections, rope-assisted climbs, pristine mountain wilderness'
  },

  // Budlaan Falls (hiking_spot_id: 15)
  {
    hiking_spot_id: 15,
    name: 'Budlaan Falls Easy Trek',
    difficulty: 'Easy',
    start_coordinates: [123.8893, 10.3816],
    length: 2.5,
    elevation_gain: 120,
    estimated_time: 1.5,
    description: 'Easy trek to beautiful waterfalls, well-maintained trail, perfect for families, refreshing swimming spots'
  },
  {
    hiking_spot_id: 15,
    name: 'Budlaan Nature Walk',
    difficulty: 'Moderate',
    start_coordinates: [123.8899, 10.3823],
    length: 4.0,
    elevation_gain: 240,
    estimated_time: 2.5,
    description: 'Moderate nature walk combining waterfalls and mountain views, diverse forest ecosystems, natural pools'
  },
  {
    hiking_spot_id: 15,
    name: 'Budlaan to Kan-irag Trail',
    difficulty: 'Moderate',
    start_coordinates: [123.8905, 10.3830],
    length: 5.5,
    elevation_gain: 380,
    estimated_time: 3.5,
    description: 'Trail connecting Budlaan Falls to Mount Kan-irag, waterfall and mountain combination, diverse terrain'
  },
  {
    hiking_spot_id: 15,
    name: 'Budlaan Adventure Route',
    difficulty: 'Hard',
    start_coordinates: [123.8887, 10.3809],
    length: 6.5,
    elevation_gain: 480,
    estimated_time: 4.0,
    description: 'Challenging adventure route, steep forest climbs, multiple waterfall levels, technical rock sections'
  },
  {
    hiking_spot_id: 15,
    name: 'Budlaan Extreme Circuit',
    difficulty: 'Advanced',
    start_coordinates: [123.8880, 10.3802],
    length: 8.0,
    elevation_gain: 600,
    estimated_time: 5.0,
    description: 'Expert-level circuit trail, rope-assisted waterfall climbs, pristine forest, spectacular mountain and waterfall views'
  }
];

async function insertOfficialTrailRoutes() {
  try {
    // Use service role key to bypass RLS policies
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🗑️ Clearing existing trail routes...');
    const { error: deleteError } = await supabase
      .from('trail_routes')
      .delete()
      .neq('route_id', 0);

    if (deleteError) {
      console.error('❌ Error clearing trail routes:', deleteError.message);
      return;
    }

    console.log('✅ Existing trail routes cleared');
    console.log(`📝 Inserting ${officialTrailRoutes.length} official trail routes...`);

    // Insert in batches of 10
    const batchSize = 10;
    let successCount = 0;

    for (let i = 0; i < officialTrailRoutes.length; i += batchSize) {
      const batch = officialTrailRoutes.slice(i, i + batchSize);
      
      // Transform data to match current schema
      const transformedBatch = batch.map((route, index) => ({
        hiking_spot_id: spotIdMapping[route.hiking_spot_id],
        name: route.name,
        description: route.description,
        difficulty: route.difficulty === 'Advanced' ? 'Advanced' : route.difficulty, // Keep original case
        length: route.length,
        elevation_gain: route.elevation_gain,
        estimated_time: Math.round(route.estimated_time * 60), // Convert hours to minutes
        trail_type: 'Out and Back',
        waypoints: JSON.stringify([
          {
            name: 'Start',
            lat: route.start_coordinates[1],
            lng: route.start_coordinates[0],
            type: 'start'
          },
          {
            name: 'End',
            lat: route.start_coordinates[1] + (Math.random() - 0.5) * 0.01,
            lng: route.start_coordinates[0] + (Math.random() - 0.5) * 0.01,
            type: 'end'
          }
        ]),
        is_active: true
      }));

      console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(officialTrailRoutes.length/batchSize)} (${batch.length} routes)`);

      const { data, error } = await supabase
        .from('trail_routes')
        .insert(transformedBatch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
      } else {
        successCount += data.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted successfully (${data.length} routes)`);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Successfully inserted ${successCount}/${officialTrailRoutes.length} trail routes`);
    
    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('trail_routes')
      .select('route_id, name, hiking_spot_id, difficulty')
      .order('hiking_spot_id', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError.message);
    } else {
      console.log(`\n✅ Verification: Found ${verifyData.length} total trail routes in database`);
      
      // Group by hiking spot
      const groupedRoutes = verifyData.reduce((acc, route) => {
        if (!acc[route.hiking_spot_id]) {
          acc[route.hiking_spot_id] = [];
        }
        acc[route.hiking_spot_id].push(route);
        return acc;
      }, {});

      console.log('\n📊 Routes per hiking spot:');
      Object.keys(groupedRoutes).forEach(spotId => {
        console.log(`   Spot ${spotId}: ${groupedRoutes[spotId].length} routes`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
    console.error(error.stack);
  }
}

// Run the script
insertOfficialTrailRoutes();