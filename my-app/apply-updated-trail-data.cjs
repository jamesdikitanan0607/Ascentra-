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

async function applyUpdatedTrailData() {
  try {
    console.log('🔄 Reading updated SQL file...');
    const sqlContent = fs.readFileSync('insert-trail-routes-data.sql', 'utf8');
    
    console.log('🧹 Clearing existing hiking_spot_routes data...');
    
    // Clear existing data from hiking_spot_routes table
    const { error: deleteError } = await supabase
      .from('hiking_spot_routes')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.log('Note: Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Successfully cleared existing hiking_spot_routes data');
    }
    
    console.log('📊 Parsing new trail route data...');
    
    // Extract INSERT statements
    const insertMatches = sqlContent.match(/INSERT INTO hiking_spot_routes[^;]+;/g);
    
    if (!insertMatches) {
      console.error('❌ No INSERT statements found in SQL file');
      return;
    }
    
    console.log(`📊 Found ${insertMatches.length} INSERT statement blocks`);
    
    let totalInserted = 0;
    
    for (const insertStatement of insertMatches) {
      // Extract VALUES part
      const valuesMatch = insertStatement.match(/VALUES\s*(.+);/s);
      if (!valuesMatch) continue;
      
      const valuesString = valuesMatch[1];
      
      // Split by '),(' to get individual value sets, but be careful with nested parentheses
      const valuesSets = [];
      let current = '';
      let depth = 0;
      let inQuotes = false;
      let quoteChar = '';
      
      for (let i = 0; i < valuesString.length; i++) {
        const char = valuesString[i];
        const nextChar = valuesString[i + 1];
        
        if ((char === "'" || char === '"') && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar && inQuotes) {
          inQuotes = false;
        }
        
        if (!inQuotes) {
          if (char === '(') depth++;
          else if (char === ')') depth--;
        }
        
        current += char;
        
        // Check for end of value set
        if (!inQuotes && depth === 0 && char === ')' && (nextChar === ',' || i === valuesString.length - 1)) {
          valuesSets.push(current.trim());
          current = '';
          if (nextChar === ',') i++; // Skip the comma
        }
      }
      
      console.log(`📊 Processing ${valuesSets.length} route entries...`);
      
      for (const valueSet of valuesSets) {
        try {
          // Clean up the value set
          let cleanValueSet = valueSet.replace(/^\(/, '').replace(/\)$/, '');
          
          // Parse the route data more carefully
          const parts = [];
          let current = '';
          let depth = 0;
          let inQuotes = false;
          let quoteChar = '';
          
          for (let i = 0; i < cleanValueSet.length; i++) {
            const char = cleanValueSet[i];
            
            if ((char === "'" || char === '"') && !inQuotes) {
              inQuotes = true;
              quoteChar = char;
              current += char;
            } else if (char === quoteChar && inQuotes) {
              inQuotes = false;
              current += char;
            } else if (char === '(' && !inQuotes) {
              depth++;
              current += char;
            } else if (char === ')' && !inQuotes) {
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
            // Extract hiking spot ID
            const hikingSpotMatch = parts[0].match(/SELECT id FROM hiking_spots WHERE name\s*=\s*'([^']+)'/);
            if (!hikingSpotMatch) {
              console.log(`⚠️ Could not extract hiking spot name from: ${parts[0]}`);
              continue;
            }
            
            const spotName = hikingSpotMatch[1];
            
            // Get the hiking spot ID by name
            const { data: spots, error: spotError } = await supabase
              .from('hiking_spots')
              .select('hiking_spot_id, name')
              .eq('name', spotName)
              .limit(1);
            
            if (spotError || !spots || spots.length === 0) {
              console.log(`⚠️ Hiking spot not found: ${spotName}`);
              continue;
            }
            
            const hikingSpotId = spots[0].hiking_spot_id;
            
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
                const waypointsStr = parts[12].replace(/^'/, '').replace(/'$/, '');
                waypoints = JSON.parse(waypointsStr);
              } catch (e) {
                console.log(`Could not parse waypoints for ${routeName}:`, e.message);
              }
            }
            
            // Parse route geometry (ST_GeomFromText)
            let routeGeom = null;
            if (parts[13] && parts[13].includes('ST_GeomFromText')) {
              const geomMatch = parts[13].match(/ST_GeomFromText\('([^']+)'/);
              if (geomMatch) {
                routeGeom = geomMatch[1];
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
            console.log(`   Waypoints: ${waypoints ? waypoints.length : 0} points`);
            
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
    
    console.log(`\n🎉 Data update complete! Inserted ${totalInserted} routes`);
    
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
        console.log('\n📍 Sample updated coordinates:');
        allRoutes.slice(0, 5).forEach(route => {
          console.log(`   ${route.route_name}: ${route.start_latitude}, ${route.start_longitude}`);
          console.log(`     Waypoints: ${route.waypoints ? route.waypoints.length : 0} points`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applyUpdatedTrailData();
