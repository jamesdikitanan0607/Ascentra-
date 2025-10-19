const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateHikingSpotRoutes() {
  try {
    console.log('🔄 Reading SQL file...');
    const sqlContent = fs.readFileSync('insert-trail-routes-data.sql', 'utf8');
    
    // Parse the SQL to extract route data
    console.log('🔄 Parsing route data from SQL...');
    
    // First, let's clear existing data to avoid duplicates
    console.log('🧹 Clearing existing hiking_spot_routes...');
    const { error: deleteError } = await supabase
      .from('hiking_spot_routes')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.log('Note: Could not clear existing data:', deleteError.message);
    }
    
    // Extract INSERT statements and convert to JavaScript objects
    const insertMatches = sqlContent.match(/INSERT INTO hiking_spot_routes[^;]+;/g);
    
    if (!insertMatches) {
      console.error('❌ No INSERT statements found in SQL file');
      return;
    }
    
    console.log(`📊 Found ${insertMatches.length} INSERT statements`);
    
    let totalInserted = 0;
    
    for (const insertStatement of insertMatches) {
      // Extract VALUES part
      const valuesMatch = insertStatement.match(/VALUES\s*(.+);/s);
      if (!valuesMatch) continue;
      
      const valuesString = valuesMatch[1];
      
      // Split by '),(' to get individual value sets
      const valuesSets = valuesString.split(/\),\s*\(/);
      
      for (let i = 0; i < valuesSets.length; i++) {
        let valueSet = valuesSets[i];
        
        // Clean up the value set
        valueSet = valueSet.replace(/^\(/, '').replace(/\)$/, '');
        
        try {
          // Parse the values - this is a simplified parser
          // The format is: (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom)
          
          const parts = [];
          let current = '';
          let inQuotes = false;
          let quoteChar = '';
          let depth = 0;
          
          for (let j = 0; j < valueSet.length; j++) {
            const char = valueSet[j];
            
            if ((char === "'" || char === '"') && !inQuotes) {
              inQuotes = true;
              quoteChar = char;
              current += char;
            } else if (char === quoteChar && inQuotes) {
              inQuotes = false;
              current += char;
            } else if (char === '[' || char === '(') {
              depth++;
              current += char;
            } else if (char === ']' || char === ')') {
              depth--;
              current += char;
            } else if (char === ',' && !inQuotes && depth === 0) {
              parts.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          if (current.trim()) {
            parts.push(current.trim());
          }
          
          if (parts.length >= 12) {
            // Extract hiking spot ID from the SELECT statement
            const hikingSpotMatch = parts[0].match(/SELECT id FROM hiking_spots WHERE name = '([^']+)'/);
            if (!hikingSpotMatch) continue;
            
            const spotName = hikingSpotMatch[1];
            
            // Get the hiking spot ID by name
            const { data: spots, error: spotError } = await supabase
              .from('hiking_spots')
              .select('id')
              .eq('name', spotName)
              .limit(1);
            
            if (spotError || !spots || spots.length === 0) {
              console.log(`⚠️ Hiking spot not found: ${spotName}`);
              continue;
            }
            
            const hikingSpotId = spots[0].id;
            
            // Parse other fields
            const routeName = parts[1].replace(/^'/, '').replace(/'$/, '');
            const difficulty = parts[2].replace(/^'/, '').replace(/'$/, '');
            const distance = parseFloat(parts[3]);
            const elevationGain = parseInt(parts[4]);
            const estimatedDuration = parseInt(parts[5]);
            const routeFeatures = parts[6].replace(/^'/, '').replace(/'$/, '');
            const routeDescription = parts[7].replace(/^'/, '').replace(/'$/, '');
            const startLatitude = parseFloat(parts[8]);
            const startLongitude = parseFloat(parts[9]);
            const endLatitude = parseFloat(parts[10]);
            const endLongitude = parseFloat(parts[11]);
            
            // Parse waypoints JSON
            let waypoints = null;
            if (parts[12] && parts[12] !== 'NULL') {
              try {
                waypoints = JSON.parse(parts[12].replace(/^'/, '').replace(/'$/, ''));
              } catch (e) {
                console.log('Could not parse waypoints for:', routeName);
              }
            }
            
            // Create the route object
            const routeData = {
              hiking_spot_id: hikingSpotId,
              route_name: routeName,
              difficulty: difficulty,
              distance: distance,
              elevation_gain: elevationGain,
              estimated_duration_minutes: estimatedDuration,
              route_features: routeFeatures,
              route_description: routeDescription,
              start_latitude: startLatitude,
              start_longitude: startLongitude,
              end_latitude: endLatitude,
              end_longitude: endLongitude,
              waypoints: waypoints
            };
            
            console.log(`📍 Inserting route: ${routeName} for ${spotName}`);
            console.log(`   Coordinates: ${startLatitude}, ${startLongitude} -> ${endLatitude}, ${endLongitude}`);
            
            // Insert the route
            const { error: insertError } = await supabase
              .from('hiking_spot_routes')
              .insert([routeData]);
            
            if (insertError) {
              console.error(`❌ Error inserting ${routeName}:`, insertError.message);
            } else {
              totalInserted++;
              console.log(`✅ Successfully inserted ${routeName}`);
            }
          }
        } catch (error) {
          console.error('Error parsing value set:', error.message);
        }
      }
    }
    
    console.log(`🎉 Population complete! Inserted ${totalInserted} routes`);
    
    // Verify the data
    const { data: allRoutes, error: fetchError } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .order('hiking_spot_id', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching routes for verification:', fetchError);
    } else {
      console.log(`📊 Total routes in hiking_spot_routes table: ${allRoutes.length}`);
      
      // Show sample coordinates to verify they're correct
      if (allRoutes.length > 0) {
        console.log('\n📍 Sample coordinates:');
        allRoutes.slice(0, 3).forEach(route => {
          console.log(`   ${route.route_name}: ${route.start_latitude}, ${route.start_longitude}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

populateHikingSpotRoutes();
