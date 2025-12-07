/**
 * Verify Favorites Synchronization
 * 
 * This script checks:
 * 1. Database hiking_spot_id values match local data (71-85)
 * 2. All hiking spots exist in database
 * 3. Favorites table structure is correct
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected local IDs from hikingSpots.js
const EXPECTED_IDS = [71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85];

const EXPECTED_NAMES = {
    71: 'Mount Babag',
    72: 'Mount Kan-Irag',
    73: 'Mount Naupa',
    74: 'Mount Manunggal',
    75: 'Mount Mago',
    76: 'Mount Kapayas',
    77: 'Mount Lantoy',
    78: 'Mount Kalbasaan',
    79: 'Mount Mauyog',
    80: 'Mount Lanaya',
    81: 'Lugsangan Peak',
    82: 'Osmeña Peak',
    83: 'Casino Peak',
    84: 'Mount Tagaytay',
    85: 'Spartan Trail'
};

async function verifyDatabaseIds() {
    console.log('🔍 Verifying Database Hiking Spot IDs...\n');

    try {
        // Fetch all hiking spots from database
        const { data: spots, error } = await supabase
            .from('hiking_spots')
            .select('hiking_spot_id, name')
            .order('hiking_spot_id');

        if (error) {
            console.error('❌ Error fetching hiking spots:', error.message);
            return false;
        }

        if (!spots || spots.length === 0) {
            console.error('❌ No hiking spots found in database');
            return false;
        }

        console.log(`✅ Found ${spots.length} hiking spots in database\n`);

        // Check each expected ID
        let allMatch = true;
        const dbIds = spots.map(s => s.hiking_spot_id);

        console.log('📋 Checking ID Mapping:\n');

        for (const expectedId of EXPECTED_IDS) {
            const dbSpot = spots.find(s => s.hiking_spot_id === expectedId);
            const expectedName = EXPECTED_NAMES[expectedId];

            if (!dbSpot) {
                console.log(`❌ ID ${expectedId} (${expectedName}) - NOT FOUND in database`);
                allMatch = false;
            } else {
                const nameMatch = dbSpot.name.toLowerCase().includes(expectedName.toLowerCase().split(' ')[1]) ||
                    expectedName.toLowerCase().includes(dbSpot.name.toLowerCase().split(' ')[1]);

                if (nameMatch) {
                    console.log(`✅ ID ${expectedId}: ${dbSpot.name}`);
                } else {
                    console.log(`⚠️  ID ${expectedId}: ${dbSpot.name} (expected: ${expectedName})`);
                }
            }
        }

        // Check for extra IDs in database
        console.log('\n📋 Extra IDs in Database:\n');
        const extraIds = dbIds.filter(id => !EXPECTED_IDS.includes(id));
        if (extraIds.length > 0) {
            extraIds.forEach(id => {
                const spot = spots.find(s => s.hiking_spot_id === id);
                console.log(`⚠️  ID ${id}: ${spot.name} (not in local data)`);
            });
        } else {
            console.log('✅ No extra IDs found');
        }

        return allMatch;

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

async function verifyFavoritesTable() {
    console.log('\n🔍 Verifying Favorites Table Structure...\n');

    try {
        // Try to fetch a sample favorite (if any exist)
        const { data, error } = await supabase
            .from('favorites')
            .select('id, user_id, hiking_spot_id, created_at')
            .limit(1);

        if (error) {
            console.error('❌ Error accessing favorites table:', error.message);
            return false;
        }

        console.log('✅ Favorites table structure is correct');
        console.log('   Columns: id, user_id, hiking_spot_id, created_at');

        if (data && data.length > 0) {
            console.log(`   Sample record: hiking_spot_id = ${data[0].hiking_spot_id}`);
        }

        return true;

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Favorites Synchronization Verification');
    console.log('═══════════════════════════════════════════════════════\n');

    const idsMatch = await verifyDatabaseIds();
    const tableOk = await verifyFavoritesTable();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('═══════════════════════════════════════════════════════\n');

    if (idsMatch && tableOk) {
        console.log('✅ All checks passed!');
        console.log('   Database IDs match local data (71-85)');
        console.log('   Favorites table structure is correct');
    } else {
        console.log('⚠️  Some issues found:');
        if (!idsMatch) {
            console.log('   - Database IDs do not fully match local data');
        }
        if (!tableOk) {
            console.log('   - Favorites table structure issue');
        }
    }

    console.log('\n');
    process.exit(0);
}

main();
