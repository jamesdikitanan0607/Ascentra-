#!/usr/bin/env node
/*
  Import GPX routes into Supabase hiking_spot_routes
  - Recursively reads my-app/gpx/**\/*.gpx
  - Parses trkpt lat/lon/ele
  - Computes distance (km) and elevation gain (m)
  - Derives start/end, sampled waypoints (12)
  - Matches GPX parent folder to hiking_spots.name (with normalization + aliases)
  - Backs up current hiking_spot_routes to generated/backups/hiking_spot_routes-<timestamp>.json
  - Replaces routes per hiking spot: deletes existing routes for the spot, inserts new GPX-derived routes
  - Logs and skips corrupted/missing GPX files without stopping the whole process

  Usage:
    node tools/import-gpx-to-supabase.cjs

  Requires environment variables:
    EXPO_PUBLIC_SUPABASE_URL
    EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY (preferred) or EXPO_PUBLIC_SUPABASE_ANON_KEY
*/

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const ROOT = process.cwd().includes(path.sep + 'my-app')
  ? process.cwd()
  : path.join(process.cwd(), 'my-app');

const GPX_ROOT = path.join(ROOT, 'gpx');
const OUT_DIR = path.join(ROOT, 'generated');
const BACKUP_DIR = path.join(OUT_DIR, 'backups');
const SOURCES_JSON = path.join(GPX_ROOT, 'sources.json');

// Debug environment variables
console.log('🔍 Checking Supabase configuration...');
console.log('- Current directory:', process.cwd());
console.log('- Environment file:', path.join(process.cwd(), '.env'));

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('- Supabase URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('- Supabase Key:', supabaseKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env (.env.local)');
  console.error('Please ensure these environment variables are set:');
  console.error('  EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (or EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

let supabase;
try {
  console.log('🔌 Initializing Supabase client...');
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  console.log('✅ Supabase client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error.message);
  process.exit(1);
}

// Ensure Node.js supports fetch
const NODE_MAJOR = parseInt(process.versions.node.split('.')[0], 10);
if (Number.isFinite(NODE_MAJOR) && NODE_MAJOR < 18) {
  console.error(`❌ Node ${process.versions.node} is too old. Please use Node >= 18 for global fetch.`);
  process.exit(1);
}

async function assertSupabaseConnection() {
  // Prefer a lightweight HEAD request via supabase-js (respects client config)
  const maxRetries = 3;
  const delayMs = 2000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🧪 Testing Supabase connectivity (attempt ${attempt}/${maxRetries})...`);
      const { error } = await supabase
        .from('hiking_spots')
        .select('hiking_spot_id', { head: true, count: 'exact' })
        .limit(1);
      if (!error) {
        console.log('✅ Supabase connection successful');
        return true;
      }
      console.warn('⚠️ Supabase head-select returned error:', error.message);
    } catch (e) {
      console.warn('⚠️ Supabase head-select failed:', e.message || e);
    }

    // Fallback: direct fetch with timeout to REST root
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: { apikey: supabaseKey },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok || res.status === 404) { // some gateways return 404 at root; consider it reachable
        console.log('✅ Supabase REST reachable');
        return true;
      }
      console.warn('⚠️ Supabase REST non-OK status:', res.status);
    } catch (err) {
      console.warn('⚠️ Supabase fetch error:', (err && err.name === 'AbortError') ? 'timeout' : (err.message || err));
    }

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  console.error('❌ Supabase connectivity checks failed after retries');
  return false;
}

// Cebu Province bounds (guard rails)
const MIN_LAT = 9.0, MAX_LAT = 12.5;
const MIN_LNG = 123.0, MAX_LNG = 124.8;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toFixed6(n) { return Number(n).toFixed(6); }

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function computeDistanceKm(points) {
  let d = 0;
  for (let i=1;i<points.length;i++) {
    d += haversineKm(points[i-1].lat, points[i-1].lon, points[i].lat, points[i].lon);
  }
  return d;
}

function computeElevationGainM(points) {
  let gain = 0;
  for (let i=1;i<points.length;i++) {
    const prev = points[i-1].ele;
    const curr = points[i].ele;
    if (prev != null && curr != null) {
      const diff = curr - prev;
      if (diff > 0) gain += diff;
    }
  }
  return Math.round(gain);
}

function parseGpxTrkpts(xml) {
  // Regex parse <trkpt lat=".." lon=".."><ele>..</ele> ...</trkpt>
  const trkptRegex = /<trkpt[^>]*lat="([\-0-9\.]+)"[^>]*lon="([\-0-9\.]+)"[^>]*>([\s\S]*?)<\/trkpt>/g;
  const eleRegex = /<ele>([\-0-9\.]+)<\/ele>/;
  const pts = [];
  let m;
  while ((m = trkptRegex.exec(xml)) !== null) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    const inner = m[3] || '';
    const eleMatch = inner.match(eleRegex);
    const ele = eleMatch ? parseFloat(eleMatch[1]) : null;
    pts.push({ lat, lon, ele });
  }
  return pts;
}

function sampleWaypoints(points, target = 64) {
  if (points.length <= target) return points;
  const step = Math.ceil(points.length / target);
  const sampled = [];
  for (let i = 0; i < points.length; i += step) sampled.push(points[i]);
  if (sampled[sampled.length-1] !== points[points.length-1]) sampled.push(points[points.length-1]);
  return sampled;
}

function normalizeName(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1) {
    const next = process.argv[idx + 1];
    if (next && !next.startsWith('--')) return next;
  }
  const withEq = process.argv.find(a => a.startsWith(flag + '='));
  return withEq ? withEq.substring(flag.length + 1) : null;
}

// Aliases from folder names to hiking_spots.name in DB
const SPOT_ALIASES = new Map([
  ['mount kan irag', 'Mount Kan-irag / Sirao Peak'],
  ['osmena peak', 'Osmeña Peak'],
  ['casino peak', 'Casino Peak'],
  ['mount babag', 'Mount Babag'],
  ['mount naupa', 'Mount Naupa'],
  ['mount manunggal', 'Mount Manunggal'],
  ['mount mauyog', 'Mount Mauyog'],
  ['mount mago', 'Mount Mago'],
  ['mount kalbasaan', 'Mount Kalbasaan'],
  ['mount kapayas', 'Mount Kapayas'],
  ['mount lanaya', 'Mount Lanaya'],
  ['mount lantoy', 'Mount Lantoy'],
  ['spartan trail', 'Spartan Trail'],
  ['budlaan falls', 'Mount Tagaytay'],
  ['mount tagaytay', 'Mount Tagaytay']
]);

async function fetchHikingSpotsIndex() {
  const { data, error } = await supabase.from('hiking_spots').select('hiking_spot_id,name');
  if (error) throw error;
  const byNorm = new Map();
  const all = [];
  (data || []).forEach(r => {
    const name = r.name || '';
    const id = r.hiking_spot_id;
    if (!id) return;
    const norm = normalizeName(name);
    byNorm.set(norm, { id, name });
    all.push({ id, name, norm });
  });
  return { byNorm, all };
}

function matchSpot(folderName, spotsIdx) {
  const norm = normalizeName(folderName);
  const alias = SPOT_ALIASES.get(norm);
  if (alias) {
    const normAlias = normalizeName(alias);
    const direct = spotsIdx.byNorm.get(normAlias);
    if (direct) return direct;
  }
  const direct = spotsIdx.byNorm.get(norm);
  if (direct) return direct;
  // fallback fuzzy: startsWith/contains
  const candidates = spotsIdx.all.filter(s => s.norm.includes(norm) || norm.includes(s.norm));
  return candidates[0] || null;
}

async function backupRoutes() {
  try {
    ensureDir(BACKUP_DIR);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const outPath = path.join(BACKUP_DIR, `hiking_spot_routes-${ts}.json`);
    
    console.log(`🔍 Fetching existing routes from Supabase...`);
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .order('hiking_spot_id')
      .limit(1000); // Add a reasonable limit
      
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log(`📊 Found ${data?.length || 0} existing routes`);
    
    if (data && data.length > 0) {
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`📦 Backup saved: ${outPath}`);
      return data.length;
    }
    
    console.log('ℹ️ No routes found to back up');
    return 0;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

function estimateDurationMin(distanceKm) {
  // Simple Naismith: 12 min per km + 10 min per 100m gain, fallback if no elev data
  return Math.round(distanceKm * 12);
}

function listGpxFiles(rootDir) {
  const results = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const sub = path.join(rootDir, e.name);
      const files = fs.readdirSync(sub, { withFileTypes: true });
      for (const f of files) {
        if (f.isFile() && f.name.toLowerCase().endsWith('.gpx')) {
          results.push({ folder: e.name, file: f.name, fullPath: path.join(sub, f.name) });
        }
      }
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.gpx')) {
      results.push({ folder: path.basename(rootDir), file: e.name, fullPath: path.join(rootDir, e.name) });
    }
  }
  return results;
}

function sanitizeRouteName(name) {
  return name.replace(/\.[Gg][Pp][Xx]$/, '');
}

function withinBounds(points) {
  return points.every(p => p.lat >= MIN_LAT && p.lat <= MAX_LAT && p.lon >= MIN_LNG && p.lon <= MAX_LNG);
}

// Run-wide summary collector
const RUN_SUMMARY = [];

async function importForSpot(spot, gpxFiles, options = { clearExisting: false }) {
  if (!gpxFiles.length) return { inserted: 0, updated: 0 };

  console.log(`\n⛰️  Importing ${gpxFiles.length} route(s) for '${spot.name}' (id=${spot.id})`);

  // Optional destructive replace mode
  if (options.clearExisting) {
    const { error: delErr } = await supabase.from('hiking_spot_routes').delete().eq('hiking_spot_id', spot.id);
    if (delErr) {
      console.warn(`⚠️ Could not clear existing routes for ${spot.name}: ${delErr.message}`);
    } else {
      console.log(`🧹 Cleared existing routes for spot ${spot.name}`);
    }
  }

  // Load existing routes for this spot to enable update-or-insert semantics when not clearing
  const { data: existingRoutes, error: listErr } = await supabase
    .from('hiking_spot_routes')
    .select('id, route_name')
    .eq('hiking_spot_id', spot.id);
  if (listErr) {
    console.warn(`⚠️ Could not list existing routes for ${spot.name}: ${listErr.message}`);
  }

  const existingIndex = new Map();
  (existingRoutes || []).forEach(r => {
    existingIndex.set(r.route_name?.toLowerCase() || '', r);
  });

  let inserted = 0;
  let updated = 0;
  for (const entry of gpxFiles) {
    try {
      const xml = fs.readFileSync(entry.fullPath, 'utf8');
      const points = parseGpxTrkpts(xml);
      if (!points.length) {
        console.warn(`⚠️ No <trkpt> in ${entry.fullPath}, skipping`);
        RUN_SUMMARY.push({
          hiking_spot_id: spot.id,
          hiking_spot_name: spot.name,
          route_name: sanitizeRouteName(entry.file),
          file: entry.fullPath,
          status: 'skipped_no_trkpt'
        });
        continue;
      }

      const dist = computeDistanceKm(points);
      const gain = computeElevationGainM(points);
      const start = points[0];
      const end = points[points.length - 1];
      const sampled = sampleWaypoints(points, 128);

      const anyOutOfBounds = !withinBounds(sampled);
      if (anyOutOfBounds) {
        console.warn(`⚠️ Some points outside bounds in ${entry.file} (still importing)`);
      }

      const waypoints = sampled.map(p => ({ lat: Number(toFixed6(p.lat)), lng: Number(toFixed6(p.lon)) }));
      const route_name = sanitizeRouteName(entry.file);

      // Respect optional per-file metadata from sources.json
      const meta = entry._meta || {};
      const metaDifficulty = typeof meta.difficulty === 'string' ? meta.difficulty : null;
      const metaEstMin = Number.isFinite(meta.estimated_duration_minutes) ? Number(meta.estimated_duration_minutes) : null;
      const difficulty = metaDifficulty || 'Moderate';
      const estimated_duration_minutes = metaEstMin ?? estimateDurationMin(dist);

      // Prepare mutable fields to upsert (do not override metadata like highlights/description)
      const mutable = {
        hiking_spot_id: spot.id,
        distance: Number(dist.toFixed(2)),
        elevation_gain: gain,
        estimated_duration_minutes,
        start_latitude: Number(toFixed6(start.lat)),
        start_longitude: Number(toFixed6(start.lon)),
        end_latitude: Number(toFixed6(end.lat)),
        end_longitude: Number(toFixed6(end.lon)),
        is_active: true,
        waypoints
      };

      const existing = existingIndex.get(route_name.toLowerCase());
      if (existing) {
        const { error: updErr } = await supabase
          .from('hiking_spot_routes')
          .update(mutable)
          .eq('id', existing.id);
        if (updErr) {
          console.error(`❌ Update failed for ${route_name}: ${updErr.message}`);
          continue;
        }
        updated++;
        console.log(`♻️  Updated '${route_name}' (${waypoints.length} pts, ${mutable.distance} km, +${gain} m, ~${estimated_duration_minutes} min)`);
        RUN_SUMMARY.push({
          hiking_spot_id: spot.id,
          hiking_spot_name: spot.name,
          route_name,
          difficulty,
          distance_km: mutable.distance,
          elevation_gain_m: gain,
          estimated_duration_minutes,
          waypoints_count: waypoints.length,
          start: { lat: mutable.start_latitude, lon: mutable.start_longitude },
          end: { lat: mutable.end_latitude, lon: mutable.end_longitude },
          file: entry.fullPath,
          status: 'updated'
        });
      } else {
        const toInsert = {
          hiking_spot_id: spot.id,
          route_name,
          difficulty,
          distance: mutable.distance,
          elevation_gain: mutable.elevation_gain,
          estimated_duration_minutes,
          route_features: 'Auto-generated from GPX import',
          route_description: `Route derived from GPX (${entry.file}), imported on ${new Date().toISOString()}`,
          start_latitude: mutable.start_latitude,
          start_longitude: mutable.start_longitude,
          end_latitude: mutable.end_latitude,
          end_longitude: mutable.end_longitude,
          is_active: true,
          waypoints: mutable.waypoints
        };
        const { error: insErr } = await supabase.from('hiking_spot_routes').insert([toInsert]);
        if (insErr) {
          console.error(`❌ Insert failed for ${route_name}: ${insErr.message}`);
          continue;
        }
        inserted++;
        console.log(`✅ Inserted '${route_name}' (${waypoints.length} pts, ${mutable.distance} km, +${gain} m, ~${estimated_duration_minutes} min)`);
        RUN_SUMMARY.push({
          hiking_spot_id: spot.id,
          hiking_spot_name: spot.name,
          route_name,
          difficulty,
          distance_km: mutable.distance,
          elevation_gain_m: gain,
          estimated_duration_minutes,
          waypoints_count: waypoints.length,
          start: { lat: mutable.start_latitude, lon: mutable.start_longitude },
          end: { lat: mutable.end_latitude, lon: mutable.end_longitude },
          file: entry.fullPath,
          status: 'inserted'
        });
      }
    } catch (e) {
      console.error(`❌ Error processing ${entry.fullPath}:`, e.message);
      RUN_SUMMARY.push({
        hiking_spot_id: spot.id,
        hiking_spot_name: spot.name,
        route_name: sanitizeRouteName(path.basename(entry.fullPath)),
        file: entry.fullPath,
        status: 'error',
        error: e.message
      });
      continue;
    }
  }

  return { inserted, updated };
}

async function main() {
  try {
    ensureDir(OUT_DIR);
    ensureDir(BACKUP_DIR);

    // Verify GPX root
    if (!fs.existsSync(GPX_ROOT)) {
      console.error(`❌ GPX folder not found: ${GPX_ROOT}`);
      process.exit(1);
    }

    // Backup
    console.log('📦 Backing up existing hiking_spot_routes...');
    await backupRoutes();

    // Build spots index
    console.log('📋 Fetching hiking_spots index...');
    const spotsIdx = await fetchHikingSpotsIndex();

    // Optional sources.json overrides
    let sourcesMap = new Map();
    if (fs.existsSync(SOURCES_JSON)) {
      try {
        const sources = JSON.parse(fs.readFileSync(SOURCES_JSON, 'utf8'));
        const routes = Array.isArray(sources?.routes) ? sources.routes : [];
        sourcesMap = new Map(routes.map(r => [String(r.gpx_file || '').toLowerCase(), r]));
        console.log(`📝 Loaded sources.json with ${routes.length} entries`);
      } catch (e) {
        console.warn('⚠️ Failed to read sources.json:', e.message);
      }
    }

    // Enumerate GPX files grouped by folder
    console.log('📂 Scanning GPX files...');
    const fileFilterRaw = getArg('--file');
    let allGpx = [];
    if (fileFilterRaw) {
      const candidate = path.isAbsolute(fileFilterRaw)
        ? fileFilterRaw
        : path.join(ROOT, fileFilterRaw.replace(/^\.\/?/, ''));
      if (!fs.existsSync(candidate)) {
        console.error(`❌ GPX file not found: ${candidate}`);
        process.exit(1);
      }
      const folder = path.basename(path.dirname(candidate));
      const file = path.basename(candidate);
      allGpx = [{ folder, file, fullPath: candidate }];
    } else {
      allGpx = listGpxFiles(GPX_ROOT);
    }
    if (!allGpx.length) {
      console.error('❌ No GPX files found');
      process.exit(1);
    }

    const byFolder = new Map();
    for (const g of allGpx) {
      const key = g.folder;
      if (!byFolder.has(key)) byFolder.set(key, []);
      byFolder.get(key).push(g);
    }

    console.log(`🔎 Found ${allGpx.length} GPX across ${byFolder.size} folder(s)`);

    // CLI flags
    const CLEAR_MODE = process.argv.includes('--replace') || process.argv.includes('--clear');
    const spotFilterRaw = getArg('--spot');
    const spotFilterNorm = spotFilterRaw ? normalizeName(spotFilterRaw) : null;

    let totalInserted = 0;
    for (const [folder, files] of byFolder.entries()) {
      // If sources.json provides explicit hiking_spot_name for any file, prefer that spot; otherwise fall back to folder-based matching
      const preferredSpotName = (() => {
        for (const f of files) {
          const meta = sourcesMap.get(f.file.toLowerCase());
          if (meta?.hiking_spot_name) return meta.hiking_spot_name;
        }
        return null;
      })();

      let matched = null;
      if (preferredSpotName) {
        const direct = spotsIdx.byNorm.get(normalizeName(preferredSpotName));
        if (direct) matched = direct;
      }
      if (!matched) {
        matched = matchSpot(folder, spotsIdx);
      }
      if (!matched) {
        console.warn(`⚠️ No hiking_spots match for folder '${folder}', skipping ${files.length} file(s)`);
        continue;
      }

      if (spotFilterNorm && normalizeName(matched.name) !== spotFilterNorm) {
        continue;
      }

      // Apply per-file overrides downstream by decorating file entries
      const decorated = files.map(f => ({ ...f, _meta: sourcesMap.get(f.file.toLowerCase()) || null }));

      const { inserted } = await importForSpot(matched, decorated, { clearExisting: CLEAR_MODE });
      totalInserted += inserted;
    }

    // Write final summary JSON for verification
    try {
      ensureDir(OUT_DIR);
      const summaryPath = path.join(OUT_DIR, 'routes-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(RUN_SUMMARY, null, 2), 'utf8');
      console.log(`📝 Wrote routes summary: ${summaryPath}`);
    } catch (e) {
      console.warn('⚠️ Failed to write routes summary:', e.message);
    }

    console.log(`\n🎉 GPX import complete. Inserted ${totalInserted} route(s) in total.`);
  } catch (err) {
    console.error('❌ Import failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  (async () => {
    const ok = await assertSupabaseConnection();
    if (!ok) process.exit(1);
    await main();
  })();
}
