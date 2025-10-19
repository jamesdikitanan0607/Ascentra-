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

async function applySimpleCoordinates() {
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
            
            // Parse fields according to existing table structure
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
            let waypoints = [];
            if (parts[12] && parts[12] !== 'NULL') {
              try {
                const waypointsStr = parts[12].replace(/^'/, '').replace(/'$/, '');
                waypoints = JSON.parse(waypointsStr);
              } catch (e) {
                console.log(`Could not parse waypoints for ${routeName}:`, e.message);
              }
            }
            
            // Build coordinates array: start -> waypoints -> end
            const coordinates = [];
            coordinates.push([startLongitude, startLatitude]);
            
            if (waypoints && Array.isArray(waypoints)) {
              waypoints.forEach(wp => {
                if (wp.lat && wp.lng) {
                  coordinates.push([wp.lng, wp.lat]);
                }
              });
            }
            
            coordinates.push([endLongitude, endLatitude]);
            
            // Store coordinates as simple JSON string (not PostGIS geometry)
            const coordinatesStr = JSON.stringify(coordinates);
            
            // Map to existing table structure
            const routeData = {
              hiking_spot_id: hikingSpotId,
              route_name: routeName,
              difficulty: difficulty,
              distance: distance,
              elevation_gain: elevationGain,
              estimated_duration: `${estimatedDuration} minutes`,
              route_features: routeFeatures,
              route_description: routeDescription,
              start_point: `${startLatitude}, ${startLongitude}`,
              end_point: `${endLatitude}, ${endLongitude}`,
              coordinates: coordinatesStr
            };
            
            console.log(`📍 Inserting route: ${routeName} for ${spotName}`);
            console.log(`   Start: ${startLatitude}, ${startLongitude}`);
            console.log(`   End: ${endLatitude}, ${endLongitude}`);
            console.log(`   Waypoints: ${waypoints.length} points`);
            console.log(`   Total coordinates: ${coordinates.length} points`);
            
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
        console.log('\n📍 Sample updated routes:');
        allRoutes.slice(0, 5).forEach(route => {
          console.log(`   ${route.route_name}:`);
          console.log(`     Start: ${route.start_point}`);
          console.log(`     End: ${route.end_point}`);
          const coords = JSON.parse(route.coordinates);
          console.log(`     Coordinates: ${coords.length} points`);
          console.log(`     First: [${coords[0]}], Last: [${coords[coords.length - 1]}]`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applySimpleCoordinates();
