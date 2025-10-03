-- Insert trail routes data for all hiking spots
-- This script inserts trail routes into the hiking_spot_routes table with the new schema

-- Mount Babag
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(1, 'Babag Ridge Easy Trail', '{"lat": 10.3420, "lng": 123.8970}', '{"lat": 10.3580, "lng": 123.9120}', '[{"lat": 10.3420, "lng": 123.8970}, {"lat": 10.3450, "lng": 123.9000}, {"lat": 10.3480, "lng": 123.9030}, {"lat": 10.3510, "lng": 123.9060}, {"lat": 10.3540, "lng": 123.9090}, {"lat": 10.3580, "lng": 123.9120}]', 'Easy'),
(1, 'Babag Summit Trail', '{"lat": 10.3420, "lng": 123.8970}', '{"lat": 10.3650, "lng": 123.9180}', '[{"lat": 10.3420, "lng": 123.8970}, {"lat": 10.3460, "lng": 123.9010}, {"lat": 10.3500, "lng": 123.9050}, {"lat": 10.3550, "lng": 123.9100}, {"lat": 10.3600, "lng": 123.9150}, {"lat": 10.3650, "lng": 123.9180}]', 'Moderate'),
(1, 'Babag Nature Trail', '{"lat": 10.3400, "lng": 123.8950}', '{"lat": 10.3520, "lng": 123.9070}', '[{"lat": 10.3400, "lng": 123.8950}, {"lat": 10.3430, "lng": 123.8980}, {"lat": 10.3460, "lng": 123.9010}, {"lat": 10.3490, "lng": 123.9040}, {"lat": 10.3520, "lng": 123.9070}]', 'Easy'),
(1, 'Babag Sunrise Trail', '{"lat": 10.3410, "lng": 123.8960}', '{"lat": 10.3620, "lng": 123.9160}', '[{"lat": 10.3410, "lng": 123.8960}, {"lat": 10.3450, "lng": 123.9000}, {"lat": 10.3490, "lng": 123.9040}, {"lat": 10.3540, "lng": 123.9090}, {"lat": 10.3580, "lng": 123.9130}, {"lat": 10.3620, "lng": 123.9160}]', 'Moderate'),
(1, 'Babag Adventure Trail', '{"lat": 10.3390, "lng": 123.8940}', '{"lat": 10.3680, "lng": 123.9200}', '[{"lat": 10.3390, "lng": 123.8940}, {"lat": 10.3440, "lng": 123.8990}, {"lat": 10.3490, "lng": 123.9040}, {"lat": 10.3550, "lng": 123.9100}, {"lat": 10.3610, "lng": 123.9160}, {"lat": 10.3680, "lng": 123.9200}]', 'Hard');

-- Mount Kan-irag / Sirao Peak
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(2, 'Sirao Flower Garden Trail', '{"lat": 10.3890, "lng": 123.8760}', '{"lat": 10.3950, "lng": 123.8820}', '[{"lat": 10.3890, "lng": 123.8760}, {"lat": 10.3910, "lng": 123.8780}, {"lat": 10.3930, "lng": 123.8800}, {"lat": 10.3950, "lng": 123.8820}]', 'Easy'),
(2, 'Kan-irag Nature Walk', '{"lat": 10.3870, "lng": 123.8740}', '{"lat": 10.3980, "lng": 123.8850}', '[{"lat": 10.3870, "lng": 123.8740}, {"lat": 10.3900, "lng": 123.8770}, {"lat": 10.3930, "lng": 123.8800}, {"lat": 10.3960, "lng": 123.8830}, {"lat": 10.3980, "lng": 123.8850}]', 'Moderate'),
(2, 'Sirao Peak Summit', '{"lat": 10.3860, "lng": 123.8730}', '{"lat": 10.4000, "lng": 123.8870}', '[{"lat": 10.3860, "lng": 123.8730}, {"lat": 10.3900, "lng": 123.8770}, {"lat": 10.3940, "lng": 123.8810}, {"lat": 10.3970, "lng": 123.8840}, {"lat": 10.4000, "lng": 123.8870}]', 'Moderate'),
(2, 'Kan-irag Ridge Challenge', '{"lat": 10.3850, "lng": 123.8720}', '{"lat": 10.4020, "lng": 123.8890}', '[{"lat": 10.3850, "lng": 123.8720}, {"lat": 10.3890, "lng": 123.8760}, {"lat": 10.3930, "lng": 123.8800}, {"lat": 10.3970, "lng": 123.8840}, {"lat": 10.4000, "lng": 123.8870}, {"lat": 10.4020, "lng": 123.8890}]', 'Hard'),
(2, 'Sirao Extreme Loop', '{"lat": 10.3840, "lng": 123.8710}', '{"lat": 10.4050, "lng": 123.8920}', '[{"lat": 10.3840, "lng": 123.8710}, {"lat": 10.3880, "lng": 123.8750}, {"lat": 10.3920, "lng": 123.8790}, {"lat": 10.3960, "lng": 123.8830}, {"lat": 10.4000, "lng": 123.8870}, {"lat": 10.4030, "lng": 123.8900}, {"lat": 10.4050, "lng": 123.8920}]', 'Expert');

-- Mount Naupa
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(3, 'Naupa Base Trail', '{"lat": 10.4120, "lng": 123.8520}', '{"lat": 10.4200, "lng": 123.8600}', '[{"lat": 10.4120, "lng": 123.8520}, {"lat": 10.4150, "lng": 123.8550}, {"lat": 10.4180, "lng": 123.8580}, {"lat": 10.4200, "lng": 123.8600}]', 'Easy'),
(3, 'Naupa Forest Path', '{"lat": 10.4100, "lng": 123.8500}', '{"lat": 10.4230, "lng": 123.8630}', '[{"lat": 10.4100, "lng": 123.8500}, {"lat": 10.4140, "lng": 123.8540}, {"lat": 10.4180, "lng": 123.8580}, {"lat": 10.4210, "lng": 123.8610}, {"lat": 10.4230, "lng": 123.8630}]', 'Moderate'),
(3, 'Naupa Summit Route', '{"lat": 10.4090, "lng": 123.8490}', '{"lat": 10.4250, "lng": 123.8650}', '[{"lat": 10.4090, "lng": 123.8490}, {"lat": 10.4130, "lng": 123.8530}, {"lat": 10.4170, "lng": 123.8570}, {"lat": 10.4210, "lng": 123.8610}, {"lat": 10.4250, "lng": 123.8650}]', 'Moderate'),
(3, 'Naupa Ridge Trail', '{"lat": 10.4080, "lng": 123.8480}', '{"lat": 10.4270, "lng": 123.8670}', '[{"lat": 10.4080, "lng": 123.8480}, {"lat": 10.4120, "lng": 123.8520}, {"lat": 10.4160, "lng": 123.8560}, {"lat": 10.4200, "lng": 123.8600}, {"lat": 10.4240, "lng": 123.8640}, {"lat": 10.4270, "lng": 123.8670}]', 'Hard'),
(3, 'Naupa Extreme Loop', '{"lat": 10.4070, "lng": 123.8470}', '{"lat": 10.4290, "lng": 123.8690}', '[{"lat": 10.4070, "lng": 123.8470}, {"lat": 10.4110, "lng": 123.8510}, {"lat": 10.4150, "lng": 123.8550}, {"lat": 10.4190, "lng": 123.8590}, {"lat": 10.4230, "lng": 123.8630}, {"lat": 10.4270, "lng": 123.8670}, {"lat": 10.4290, "lng": 123.8690}]', 'Expert');

-- Mount Kalbasaan
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(4, 'Kalbasaan Base Trail', '{"lat": 10.4350, "lng": 123.8280}', '{"lat": 10.4420, "lng": 123.8350}', '[{"lat": 10.4350, "lng": 123.8280}, {"lat": 10.4380, "lng": 123.8310}, {"lat": 10.4410, "lng": 123.8340}, {"lat": 10.4420, "lng": 123.8350}]', 'Easy'),
(4, 'Kalbasaan Forest Walk', '{"lat": 10.4330, "lng": 123.8260}', '{"lat": 10.4450, "lng": 123.8380}', '[{"lat": 10.4330, "lng": 123.8260}, {"lat": 10.4370, "lng": 123.8300}, {"lat": 10.4410, "lng": 123.8340}, {"lat": 10.4450, "lng": 123.8380}]', 'Moderate'),
(4, 'Kalbasaan Summit Easy', '{"lat": 10.4320, "lng": 123.8250}', '{"lat": 10.4470, "lng": 123.8400}', '[{"lat": 10.4320, "lng": 123.8250}, {"lat": 10.4360, "lng": 123.8290}, {"lat": 10.4400, "lng": 123.8330}, {"lat": 10.4440, "lng": 123.8370}, {"lat": 10.4470, "lng": 123.8400}]', 'Moderate'),
(4, 'Kalbasaan Extended Loop', '{"lat": 10.4310, "lng": 123.8240}', '{"lat": 10.4490, "lng": 123.8420}', '[{"lat": 10.4310, "lng": 123.8240}, {"lat": 10.4350, "lng": 123.8280}, {"lat": 10.4390, "lng": 123.8320}, {"lat": 10.4430, "lng": 123.8360}, {"lat": 10.4470, "lng": 123.8400}, {"lat": 10.4490, "lng": 123.8420}]', 'Moderate'),
(4, 'Kalbasaan Challenge Route', '{"lat": 10.4300, "lng": 123.8230}', '{"lat": 10.4510, "lng": 123.8440}', '[{"lat": 10.4300, "lng": 123.8230}, {"lat": 10.4340, "lng": 123.8270}, {"lat": 10.4380, "lng": 123.8310}, {"lat": 10.4420, "lng": 123.8350}, {"lat": 10.4460, "lng": 123.8390}, {"lat": 10.4500, "lng": 123.8430}, {"lat": 10.4510, "lng": 123.8440}]', 'Hard');

-- Mount Mauyog
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(5, 'Mauyog Base Trail', '{"lat": 10.4580, "lng": 123.8040}', '{"lat": 10.4650, "lng": 123.8110}', '[{"lat": 10.4580, "lng": 123.8040}, {"lat": 10.4610, "lng": 123.8070}, {"lat": 10.4640, "lng": 123.8100}, {"lat": 10.4650, "lng": 123.8110}]', 'Easy'),
(5, 'Mauyog Forest Path', '{"lat": 10.4560, "lng": 123.8020}', '{"lat": 10.4680, "lng": 123.8140}', '[{"lat": 10.4560, "lng": 123.8020}, {"lat": 10.4600, "lng": 123.8060}, {"lat": 10.4640, "lng": 123.8100}, {"lat": 10.4680, "lng": 123.8140}]', 'Moderate'),
(5, 'Mauyog Summit Route', '{"lat": 10.4550, "lng": 123.8010}', '{"lat": 10.4700, "lng": 123.8160}', '[{"lat": 10.4550, "lng": 123.8010}, {"lat": 10.4590, "lng": 123.8050}, {"lat": 10.4630, "lng": 123.8090}, {"lat": 10.4670, "lng": 123.8130}, {"lat": 10.4700, "lng": 123.8160}]', 'Moderate'),
(5, 'Mauyog Ridge Trail', '{"lat": 10.4540, "lng": 123.8000}', '{"lat": 10.4720, "lng": 123.8180}', '[{"lat": 10.4540, "lng": 123.8000}, {"lat": 10.4580, "lng": 123.8040}, {"lat": 10.4620, "lng": 123.8080}, {"lat": 10.4660, "lng": 123.8120}, {"lat": 10.4700, "lng": 123.8160}, {"lat": 10.4720, "lng": 123.8180}]', 'Hard'),
(5, 'Mauyog Extreme Loop', '{"lat": 10.4530, "lng": 123.7990}', '{"lat": 10.4740, "lng": 123.8200}', '[{"lat": 10.4530, "lng": 123.7990}, {"lat": 10.4570, "lng": 123.8030}, {"lat": 10.4610, "lng": 123.8070}, {"lat": 10.4650, "lng": 123.8110}, {"lat": 10.4690, "lng": 123.8150}, {"lat": 10.4730, "lng": 123.8190}, {"lat": 10.4740, "lng": 123.8200}]', 'Expert');

-- Mount Manunggal
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(6, 'Manunggal Base Trail', '{"lat": 10.4810, "lng": 123.7800}', '{"lat": 10.4880, "lng": 123.7870}', '[{"lat": 10.4810, "lng": 123.7800}, {"lat": 10.4840, "lng": 123.7830}, {"lat": 10.4870, "lng": 123.7860}, {"lat": 10.4880, "lng": 123.7870}]', 'Easy'),
(6, 'Manunggal Forest Walk', '{"lat": 10.4790, "lng": 123.7780}', '{"lat": 10.4910, "lng": 123.7900}', '[{"lat": 10.4790, "lng": 123.7780}, {"lat": 10.4830, "lng": 123.7820}, {"lat": 10.4870, "lng": 123.7860}, {"lat": 10.4910, "lng": 123.7900}]', 'Moderate'),
(6, 'Manunggal Summit Route', '{"lat": 10.4780, "lng": 123.7770}', '{"lat": 10.4930, "lng": 123.7920}', '[{"lat": 10.4780, "lng": 123.7770}, {"lat": 10.4820, "lng": 123.7810}, {"lat": 10.4860, "lng": 123.7850}, {"lat": 10.4900, "lng": 123.7890}, {"lat": 10.4930, "lng": 123.7920}]', 'Moderate'),
(6, 'Manunggal Ridge Trail', '{"lat": 10.4770, "lng": 123.7760}', '{"lat": 10.4950, "lng": 123.7940}', '[{"lat": 10.4770, "lng": 123.7760}, {"lat": 10.4810, "lng": 123.7800}, {"lat": 10.4850, "lng": 123.7840}, {"lat": 10.4890, "lng": 123.7880}, {"at": 10.4930, "lng": 123.7920}, {"lat": 10.4950, "lng": 123.7940}]', 'Hard'),
(6, 'Manunggal Extreme Loop', '{"lat": 10.4760, "lng": 123.7750}', '{"lat": 10.4970, "lng": 123.7960}', '[{"lat": 10.4760, "lng": 123.7750}, {"lat": 10.4800, "lng": 123.7790}, {"lat": 10.4840, "lng": 123.7830}, {"lat": 10.4880, "lng": 123.7870}, {"lat": 10.4920, "lng": 123.7910}, {"lat": 10.4960, "lng": 123.7950}, {"lat": 10.4970, "lng": 123.7960}]', 'Expert');

-- Mount Lanaya
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(7, 'Lanaya Base Trail', '{"lat": 10.5040, "lng": 123.7560}', '{"lat": 10.5110, "lng": 123.7630}', '[{"lat": 10.5040, "lng": 123.7560}, {"lat": 10.5070, "lng": 123.7590}, {"lat": 10.5100, "lng": 123.7620}, {"lat": 10.5110, "lng": 123.7630}]', 'Easy'),
(7, 'Lanaya Forest Walk', '{"lat": 10.5020, "lng": 123.7540}', '{"lat": 10.5140, "lng": 123.7660}', '[{"lat": 10.5020, "lng": 123.7540}, {"lat": 10.5060, "lng": 123.7580}, {"lat": 10.5100, "lng": 123.7620}, {"lat": 10.5140, "lng": 123.7660}]', 'Moderate'),
(7, 'Lanaya Summit Route', '{"lat": 10.5010, "lng": 123.7530}', '{"lat": 10.5160, "lng": 123.7680}', '[{"lat": 10.5010, "lng": 123.7530}, {"lat": 10.5050, "lng": 123.7570}, {"lat": 10.5090, "lng": 123.7610}, {"lat": 10.5130, "lng": 123.7650}, {"lat": 10.5160, "lng": 123.7680}]', 'Moderate'),
(7, 'Lanaya Ridge Trail', '{"lat": 10.5000, "lng": 123.7520}', '{"lat": 10.5180, "lng": 123.7700}', '[{"lat": 10.5000, "lng": 123.7520}, {"lat": 10.5040, "lng": 123.7560}, {"lat": 10.5080, "lng": 123.7600}, {"lat": 10.5120, "lng": 123.7640}, {"lat": 10.5160, "lng": 123.7680}, {"lat": 10.5180, "lng": 123.7700}]', 'Hard'),
(7, 'Lanaya Extreme Loop', '{"lat": 10.4990, "lng": 123.7510}', '{"lat": 10.5200, "lng": 123.7720}', '[{"lat": 10.4990, "lng": 123.7510}, {"lat": 10.5030, "lng": 123.7550}, {"lat": 10.5070, "lng": 123.7590}, {"lat": 10.5110, "lng": 123.7630}, {"lat": 10.5150, "lng": 123.7670}, {"lat": 10.5190, "lng": 123.7710}, {"lat": 10.5200, "lng": 123.7720}]', 'Expert');

-- Mount Lantoy
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(8, 'Lantoy Base Trail', '{"lat": 10.5270, "lng": 123.7320}', '{"lat": 10.5340, "lng": 123.7390}', '[{"lat": 10.5270, "lng": 123.7320}, {"lat": 10.5300, "lng": 123.7350}, {"lat": 10.5330, "lng": 123.7380}, {"lat": 10.5340, "lng": 123.7390}]', 'Easy'),
(8, 'Lantoy Forest Walk', '{"lat": 10.5250, "lng": 123.7300}', '{"lat": 10.5370, "lng": 123.7420}', '[{"lat": 10.5250, "lng": 123.7300}, {"lat": 10.5290, "lng": 123.7340}, {"lat": 10.5330, "lng": 123.7380}, {"lat": 10.5370, "lng": 123.7420}]', 'Moderate'),
(8, 'Lantoy Summit Route', '{"lat": 10.5240, "lng": 123.7290}', '{"lat": 10.5390, "lng": 123.7440}', '[{"lat": 10.5240, "lng": 123.7290}, {"lat": 10.5280, "lng": 123.7330}, {"lat": 10.5320, "lng": 123.7370}, {"lat": 10.5360, "lng": 123.7410}, {"lat": 10.5390, "lng": 123.7440}]', 'Moderate'),
(8, 'Lantoy Ridge Trail', '{"lat": 10.5230, "lng": 123.7280}', '{"lat": 10.5410, "lng": 123.7460}', '[{"lat": 10.5230, "lng": 123.7280}, {"lat": 10.5270, "lng": 123.7320}, {"lat": 10.5310, "lng": 123.7360}, {"lat": 10.5350, "lng": 123.7400}, {"lat": 10.5390, "lng": 123.7440}, {"lat": 10.5410, "lng": 123.7460}]', 'Hard'),
(8, 'Lantoy Extreme Loop', '{"lat": 10.5220, "lng": 123.7270}', '{"lat": 10.5430, "lng": 123.7480}', '[{"lat": 10.5220, "lng": 123.7270}, {"lat": 10.5260, "lng": 123.7310}, {"lat": 10.5300, "lng": 123.7350}, {"lat": 10.5340, "lng": 123.7390}, {"lat": 10.5380, "lng": 123.7430}, {"lat": 10.5420, "lng": 123.7470}, {"lat": 10.5430, "lng": 123.7480}]', 'Expert');

-- Mount Hambubuyog
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(9, 'Hambubuyog Base Trail', '{"lat": 10.5500, "lng": 123.7080}', '{"lat": 10.5570, "lng": 123.7150}', '[{"lat": 10.5500, "lng": 123.7080}, {"lat": 10.5530, "lng": 123.7110}, {"lat": 10.5560, "lng": 123.7140}, {"lat": 10.5570, "lng": 123.7150}]', 'Easy'),
(9, 'Hambubuyog Forest Walk', '{"lat": 10.5480, "lng": 123.7060}', '{"lat": 10.5600, "lng": 123.7180}', '[{"lat": 10.5480, "lng": 123.7060}, {"lat": 10.5520, "lng": 123.7100}, {"lat": 10.5560, "lng": 123.7140}, {"lat": 10.5600, "lng": 123.7180}]', 'Moderate'),
(9, 'Hambubuyog Summit Route', '{"lat": 10.5470, "lng": 123.7050}', '{"lat": 10.5620, "lng": 123.7200}', '[{"lat": 10.5470, "lng": 123.7050}, {"lat": 10.5510, "lng": 123.7090}, {"lat": 10.5550, "lng": 123.7130}, {"lat": 10.5590, "lng": 123.7170}, {"lat": 10.5620, "lng": 123.7200}]', 'Hard'),
(9, 'Hambubuyog Ridge Trail', '{"lat": 10.5460, "lng": 123.7040}', '{"lat": 10.5640, "lng": 123.7220}', '[{"lat": 10.5460, "lng": 123.7040}, {"lat": 10.5500, "lng": 123.7080}, {"lat": 10.5540, "lng": 123.7120}, {"lat": 10.5580, "lng": 123.7160}, {"lat": 10.5620, "lng": 123.7200}, {"lat": 10.5640, "lng": 123.7220}]', 'Hard'),
(9, 'Hambubuyog Extreme Challenge', '{"lat": 10.5450, "lng": 123.7030}', '{"lat": 10.5660, "lng": 123.7240}', '[{"lat": 10.5450, "lng": 123.7030}, {"lat": 10.5490, "lng": 123.7070}, {"lat": 10.5530, "lng": 123.7110}, {"lat": 10.5570, "lng": 123.7150}, {"lat": 10.5610, "lng": 123.7190}, {"lat": 10.5650, "lng": 123.7230}, {"lat": 10.5660, "lng": 123.7240}]', 'Expert');

-- Osmeña Peak
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(10, 'Osmeña Peak Base Trail', '{"lat": 9.7050, "lng": 123.6050}', '{"lat": 9.7120, "lng": 123.6120}', '[{"lat": 9.7050, "lng": 123.6050}, {"lat": 9.7080, "lng": 123.6080}, {"lat": 9.7110, "lng": 123.6110}, {"lat": 9.7120, "lng": 123.6120}]', 'Easy'),
(10, 'Osmeña Peak Forest Walk', '{"lat": 9.7030, "lng": 123.6030}', '{"lat": 9.7150, "lng": 123.6150}', '[{"lat": 9.7030, "lng": 123.6030}, {"lat": 9.7070, "lng": 123.6070}, {"lat": 9.7110, "lng": 123.6110}, {"lat": 9.7150, "lng": 123.6150}]', 'Moderate'),
(10, 'Osmeña Peak Summit Route', '{"lat": 9.7020, "lng": 123.6020}', '{"lat": 9.7170, "lng": 123.6170}', '[{"lat": 9.7020, "lng": 123.6020}, {"lat": 9.7060, "lng": 123.6060}, {"lat": 9.7100, "lng": 123.6100}, {"lat": 9.7140, "lng": 123.6140}, {"lat": 9.7170, "lng": 123.6170}]', 'Moderate'),
(10, 'Osmeña Peak Ridge Trail', '{"lat": 9.7010, "lng": 123.6010}', '{"lat": 9.7190, "lng": 123.6190}', '[{"lat": 9.7010, "lng": 123.6010}, {"lat": 9.7050, "lng": 123.6050}, {"lat": 9.7090, "lng": 123.6090}, {"lat": 9.7130, "lng": 123.6130}, {"lat": 9.7170, "lng": 123.6170}, {"lat": 9.7190, "lng": 123.6190}]', 'Hard'),
(10, 'Osmeña Peak Extreme Loop', '{"lat": 9.7000, "lng": 123.6000}', '{"lat": 9.7210, "lng": 123.6210}', '[{"lat": 9.7000, "lng": 123.6000}, {"lat": 9.7040, "lng": 123.6040}, {"lat": 9.7080, "lng": 123.6080}, {"lat": 9.7120, "lng": 123.6120}, {"lat": 9.7160, "lng": 123.6160}, {"lat": 9.7200, "lng": 123.6200}, {"lat": 9.7210, "lng": 123.6210}]', 'Expert');

-- Kawasan Falls
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(11, 'Kawasan Falls Base Trail', '{"lat": 9.7250, "lng": 123.5850}', '{"lat": 9.7320, "lng": 123.5920}', '[{"lat": 9.7250, "lng": 123.5850}, {"lat": 9.7280, "lng": 123.5880}, {"lat": 9.7310, "lng": 123.5910}, {"lat": 9.7320, "lng": 123.5920}]', 'Easy'),
(11, 'Kawasan Falls Forest Walk', '{"lat": 9.7230, "lng": 123.5830}', '{"lat": 9.7350, "lng": 123.5950}', '[{"lat": 9.7230, "lng": 123.5830}, {"lat": 9.7270, "lng": 123.5870}, {"lat": 9.7310, "lng": 123.5910}, {"lat": 9.7350, "lng": 123.5950}]', 'Moderate'),
(11, 'Kawasan Falls Canyoneering', '{"lat": 9.7220, "lng": 123.5820}', '{"lat": 9.7370, "lng": 123.5970}', '[{"lat": 9.7220, "lng": 123.5820}, {"lat": 9.7260, "lng": 123.5860}, {"lat": 9.7300, "lng": 123.5900}, {"lat": 9.7340, "lng": 123.5940}, {"lat": 9.7370, "lng": 123.5970}]', 'Hard'),
(11, 'Kawasan Falls Triple Falls', '{"lat": 9.7210, "lng": 123.5810}', '{"lat": 9.7390, "lng": 123.5990}', '[{"lat": 9.7210, "lng": 123.5810}, {"lat": 9.7250, "lng": 123.5850}, {"lat": 9.7290, "lng": 123.5890}, {"lat": 9.7330, "lng": 123.5930}, {"lat": 9.7370, "lng": 123.5970}, {"lat": 9.7390, "lng": 123.5990}]', 'Moderate'),
(11, 'Kawasan Falls Extreme Trek', '{"lat": 9.7200, "lng": 123.5800}', '{"lat": 9.7410, "lng": 123.6010}', '[{"lat": 9.7200, "lng": 123.5800}, {"lat": 9.7240, "lng": 123.5840}, {"lat": 9.7280, "lng": 123.5880}, {"lat": 9.7320, "lng": 123.5920}, {"lat": 9.7360, "lng": 123.5960}, {"lat": 9.7400, "lng": 123.6000}, {"lat": 9.7410, "lng": 123.6010}]', 'Expert');

-- Inambakan Falls
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(12, 'Inambakan Falls Base Trail', '{"lat": 9.7450, "lng": 123.5650}', '{"lat": 9.7520, "lng": 123.5720}', '[{"lat": 9.7450, "lng": 123.5650}, {"lat": 9.7480, "lng": 123.5680}, {"lat": 9.7510, "lng": 123.5710}, {"lat": 9.7520, "lng": 123.5720}]', 'Easy'),
(12, 'Inambakan Falls Forest Walk', '{"lat": 9.7430, "lng": 123.5630}', '{"lat": 9.7550, "lng": 123.5750}', '[{"lat": 9.7430, "lng": 123.5630}, {"lat": 9.7470, "lng": 123.5670}, {"lat": 9.7510, "lng": 123.5710}, {"lat": 9.7550, "lng": 123.5750}]', 'Moderate'),
(12, 'Inambakan Falls Canyon Route', '{"lat": 9.7420, "lng": 123.5620}', '{"lat": 9.7570, "lng": 123.5770}', '[{"lat": 9.7420, "lng": 123.5620}, {"lat": 9.7460, "lng": 123.5660}, {"lat": 9.7500, "lng": 123.5700}, {"lat": 9.7540, "lng": 123.5740}, {"lat": 9.7570, "lng": 123.5770}]', 'Hard'),
(12, 'Inambakan Falls Multi-Level', '{"lat": 9.7410, "lng": 123.5610}', '{"lat": 9.7590, "lng": 123.5790}', '[{"lat": 9.7410, "lng": 123.5610}, {"lat": 9.7450, "lng": 123.5650}, {"lat": 9.7490, "lng": 123.5690}, {"lat": 9.7530, "lng": 123.5730}, {"lat": 9.7570, "lng": 123.5770}, {"lat": 9.7590, "lng": 123.5790}]', 'Moderate'),
(12, 'Inambakan Falls Extreme Trek', '{"lat": 9.7400, "lng": 123.5600}', '{"lat": 9.7610, "lng": 123.5810}', '[{"lat": 9.7400, "lng": 123.5600}, {"lat": 9.7440, "lng": 123.5640}, {"lat": 9.7480, "lng": 123.5680}, {"lat": 9.7520, "lng": 123.5720}, {"lat": 9.7560, "lng": 123.5760}, {"lat": 9.7600, "lng": 123.5800}, {"lat": 9.7610, "lng": 123.5810}]', 'Expert');

-- Tumalog Falls
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(13, 'Tumalog Falls Base Trail', '{"lat": 9.7650, "lng": 123.5450}', '{"lat": 9.7720, "lng": 123.5520}', '[{"lat": 9.7650, "lng": 123.5450}, {"lat": 9.7680, "lng": 123.5480}, {"lat": 9.7710, "lng": 123.5510}, {"lat": 9.7720, "lng": 123.5520}]', 'Easy'),
(13, 'Tumalog Falls Forest Walk', '{"lat": 9.7630, "lng": 123.5430}', '{"lat": 9.7750, "lng": 123.5550}', '[{"lat": 9.7630, "lng": 123.5430}, {"lat": 9.7670, "lng": 123.5470}, {"lat": 9.7710, "lng": 123.5510}, {"lat": 9.7750, "lng": 123.5550}]', 'Moderate'),
(13, 'Tumalog Falls Canyon Route', '{"lat": 9.7620, "lng": 123.5420}', '{"lat": 9.7770, "lng": 123.5570}', '[{"lat": 9.7620, "lng": 123.5420}, {"lat": 9.7660, "lng": 123.5460}, {"lat": 9.7700, "lng": 123.5500}, {"lat": 9.7740, "lng": 123.5540}, {"lat": 9.7770, "lng": 123.5570}]', 'Hard'),
(13, 'Tumalog Falls Multi-Level', '{"lat": 9.7610, "lng": 123.5410}', '{"lat": 9.7790, "lng": 123.5590}', '[{"lat": 9.7610, "lng": 123.5410}, {"lat": 9.7650, "lng": 123.5450}, {"lat": 9.7690, "lng": 123.5490}, {"lat": 9.7730, "lng": 123.5530}, {"lat": 9.7770, "lng": 123.5570}, {"lat": 9.7790, "lng": 123.5590}]', 'Moderate'),
(13, 'Tumalog Falls Extreme Trek', '{"lat": 9.7600, "lng": 123.5400}', '{"lat": 9.7810, "lng": 123.5610}', '[{"lat": 9.7600, "lng": 123.5400}, {"lat": 9.7640, "lng": 123.5440}, {"lat": 9.7680, "lng": 123.5480}, {"lat": 9.7720, "lng": 123.5520}, {"lat": 9.7760, "lng": 123.5560}, {"lat": 9.7800, "lng": 123.5600}, {"lat": 9.7810, "lng": 123.5610}]', 'Expert');

-- Budlaan Falls
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(14, 'Budlaan Falls Base Trail', '{"lat": 9.7850, "lng": 123.5250}', '{"lat": 9.7920, "lng": 123.5320}', '[{"lat": 9.7850, "lng": 123.5250}, {"lat": 9.7880, "lng": 123.5280}, {"lat": 9.7910, "lng": 123.5310}, {"lat": 9.7920, "lng": 123.5320}]', 'Easy'),
(14, 'Budlaan Falls Forest Walk', '{"lat": 9.7830, "lng": 123.5230}', '{"lat": 9.7950, "lng": 123.5350}', '[{"lat": 9.7830, "lng": 123.5230}, {"lat": 9.7870, "lng": 123.5270}, {"lat": 9.7910, "lng": 123.5310}, {"lat": 9.7950, "lng": 123.5350}]', 'Moderate'),
(14, 'Budlaan Falls Nature Path', '{"lat": 9.7820, "lng": 123.5220}', '{"lat": 9.7970, "lng": 123.5370}', '[{"lat": 9.7820, "lng": 123.5220}, {"lat": 9.7860, "lng": 123.5260}, {"lat": 9.7900, "lng": 123.5300}, {"lat": 9.7940, "lng": 123.5340}, {"lat": 9.7970, "lng": 123.5370}]', 'Moderate'),
(14, 'Budlaan Falls Adventure Route', '{"lat": 9.7810, "lng": 123.5210}', '{"lat": 9.7990, "lng": 123.5390}', '[{"lat": 9.7810, "lng": 123.5210}, {"lat": 9.7850, "lng": 123.5250}, {"lat": 9.7890, "lng": 123.5290}, {"lat": 9.7930, "lng": 123.5330}, {"lat": 9.7970, "lng": 123.5370}, {"lat": 9.7990, "lng": 123.5390}]', 'Hard'),
(14, 'Budlaan Falls Extreme Trek', '{"lat": 9.7800, "lng": 123.5200}', '{"lat": 9.8010, "lng": 123.5410}', '[{"lat": 9.7800, "lng": 123.5200}, {"lat": 9.7840, "lng": 123.5240}, {"lat": 9.7880, "lng": 123.5280}, {"lat": 9.7920, "lng": 123.5320}, {"lat": 9.7960, "lng": 123.5360}, {"lat": 9.8000, "lng": 123.5400}, {"lat": 9.8010, "lng": 123.5410}]', 'Expert');

-- Mount Kalawisan (Kanlaas Ridge)
INSERT INTO hiking_spot_routes (hiking_spot_id, route_name, start_point, end_point, coordinates, difficulty) VALUES
(15, 'Kalawisan Base Trail', '{"lat": 9.8050, "lng": 123.5050}', '{"lat": 9.8120, "lng": 123.5120}', '[{"lat": 9.8050, "lng": 123.5050}, {"lat": 9.8080, "lng": 123.5080}, {"lat": 9.8110, "lng": 123.5110}, {"lat": 9.8120, "lng": 123.5120}]', 'Easy'),
(15, 'Kalawisan Forest Walk', '{"lat": 9.8030, "lng": 123.5030}', '{"lat": 9.8150, "lng": 123.5150}', '[{"lat": 9.8030, "lng": 123.5030}, {"lat": 9.8070, "lng": 123.5070}, {"lat": 9.8110, "lng": 123.5110}, {"lat": 9.8150, "lng": 123.5150}]', 'Moderate'),
(15, 'Kalawisan Summit Route', '{"lat": 9.8020, "lng": 123.5020}', '{"lat": 9.8170, "lng": 123.5170}', '[{"lat": 9.8020, "lng": 123.5020}, {"lat": 9.8060, "lng": 123.5060}, {"lat": 9.8100, "lng": 123.5100}, {"lat": 9.8140, "lng": 123.5140}, {"lat": 9.8170, "lng": 123.5170}]', 'Moderate'),
(15, 'Kalawisan Ridge Trail', '{"lat": 9.8010, "lng": 123.5010}', '{"lat": 9.8190, "lng": 123.5190}', '[{"lat": 9.8010, "lng": 123.5010}, {"lat": 9.8050, "lng": 123.5050}, {"lat": 9.8090, "lng": 123.5090}, {"lat": 9.8130, "lng": 123.5130}, {"lat": 9.8170, "lng": 123.5170}, {"lat": 9.8190, "lng": 123.5190}]', 'Hard'),
(15, 'Kalawisan Extreme Loop', '{"lat": 9.8000, "lng": 123.5000}', '{"lat": 9.8210, "lng": 123.5210}', '[{"lat": 9.8000, "lng": 123.5000}, {"lat": 9.8040, "lng": 123.5040}, {"lat": 9.8080, "lng": 123.5080}, {"lat": 9.8120, "lng": 123.5120}, {"lat": 9.8160, "lng": 123.5160}, {"lat": 9.8200, "lng": 123.5200}, {"lat": 9.8210, "lng": 123.5210}]', 'Expert');

SELECT 'Trail routes data inserted successfully!' as status;
