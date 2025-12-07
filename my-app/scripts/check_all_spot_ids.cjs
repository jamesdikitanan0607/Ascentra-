const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env
const envPath = path.resolve(__dirname, '../.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Could not read .env file:', e.message);
    process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
    }
});

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Local data from hikingSpots.js
const localSpots = [
    { id: '71', name: "Mount Babag", screenFile: "MountBabagScreen.tsx" },
    { id: '72', name: "Mount Kan-Irag", screenFile: "MountKaniragScreen.tsx" },
    { id: '73', name: "Mount Naupa", screenFile: "MountNaupaScreen.tsx" },
    { id: '74', name: "Mount Manunggal", screenFile: "MountManunggalScreen.tsx" },
    { id: '75', name: "Mount Mago", screenFile: "MountMagoScreen.tsx" },
    { id: '76', name: "Mount Kapayas", screenFile: "MountKapayasScreen.tsx" },
    { id: '77', name: "Mount Lantoy", screenFile: "MountLantoyScreen.tsx" },
    { id: '78', name: "Mount Kalbasaan", screenFile: "MountKalbasaanScreen.tsx" },
    { id: '79', name: "Mount Mauyog", screenFile: "MountMauyogScreen.tsx" },
    { id: '80', name: "Mount Lanaya", screenFile: "MountLanayaScreen.tsx" },
    { id: '82', name: "Osmeña Peak", screenFile: "OsmenaPeakScreen.tsx" },
    { id: '83', name: "Casino Peak", screenFile: "CasinoPeakScreen.tsx" },
    { id: '84', name: "Mount Tagaytay", screenFile: "MountTagaytayScreen.tsx" },
    { id: '85', name: "Spartan Trail", screenFile: "SpartanTrailScreen.tsx" }
];

async function checkAllSpots() {
    const results = [];

    for (const localSpot of localSpots) {
        const { data, error } = await supabase
            .from('hiking_spots')
            .select('hiking_spot_id, name')
            .ilike('name', `%${localSpot.name.replace(/Mount |Peak /g, '')}%`)
            .limit(1);

        if (error) {
            results.push(`ERROR ${localSpot.name}: ${error.message}`);
            continue;
        }

        if (data && data.length > 0) {
            const dbSpot = data[0];
            const match = localSpot.id === String(dbSpot.hiking_spot_id);
            results.push({
                screenFile: localSpot.screenFile,
                localName: localSpot.name,
                localId: localSpot.id,
                dbName: dbSpot.name,
                dbId: dbSpot.hiking_spot_id,
                match: match
            });
        } else {
            results.push({
                screenFile: localSpot.screenFile,
                localName: localSpot.name,
                localId: localSpot.id,
                dbName: 'NOT FOUND',
                dbId: null,
                match: false
            });
        }
    }

    // Write to file
    const outputPath = path.resolve(__dirname, '../scripts/id_check_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log('Results written to scripts/id_check_results.json');
    console.log('\nSummary:');
    results.forEach(r => {
        if (typeof r === 'string') {
            console.log(r);
        } else {
            const status = r.match ? '✓' : '✗';
            console.log(`${status} ${r.screenFile}: Local ID ${r.localId} -> DB ID ${r.dbId}`);
        }
    });
}

checkAllSpots();
