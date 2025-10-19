#!/usr/bin/env node
/*
  GPX -> SQL generator for hiking_spot_routes
  - Reads gpx/sources.json
  - Parses each GPX (no external deps) to extract trkpts (lat, lon, ele)
  - Computes distance (km) via Haversine and elevation gain (m)
  - Validates coordinates within Cebu bounds
  - Produces:
    - generated/insert-trail-routes-data.sql (with -- Source comments)
    - TRAILS-SUMMARY.md (append/update per run)
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const GPX_DIR = path.join(ROOT, 'gpx');
const SOURCES_JSON = path.join(GPX_DIR, 'sources.json');
const OUT_DIR = path.join(ROOT, 'generated');
const OUT_SQL = path.join(OUT_DIR, 'insert-trail-routes-data.sql');
const SUMMARY_MD = path.join(ROOT, 'TRAILS-SUMMARY.md');

// Cebu Province bounds
const MIN_LAT = 9.5, MAX_LAT = 11.5;
const MIN_LNG = 123.2, MAX_LNG = 124.2;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
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
  return gain;
}

function parseGpxTrkpts(xml) {
  // Regex parse <trkpt lat=".." lon=".."> ... <ele>...</ele> ... </trkpt>
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

function withinCebuBounds(lat, lon) {
  return lat >= MIN_LAT && lat <= MAX_LAT && lon >= MIN_LNG && lon <= MAX_LNG;
}

function sampleWaypoints(points, target = 12) {
  if (points.length <= target) return points;
  const step = Math.ceil(points.length / target);
  const sampled = [];
  for (let i = 0; i < points.length; i += step) sampled.push(points[i]);
  if (sampled[sampled.length-1] !== points[points.length-1]) sampled.push(points[points.length-1]);
  return sampled;
}

function toLineString(points) {
  return points.map(p => `${toFixed6(p.lon)} ${toFixed6(p.lat)}`).join(',');
}

function toWaypointsJson(points) {
  // Schema expects JSON-like string with lat/lng keys
  const arr = points.map(p => ({ lat: Number(toFixed6(p.lat)), lng: Number(toFixed6(p.lon)) }));
  return JSON.stringify(arr);
}

function formatRouteName(mountain, trail) {
  return `${mountain} — ${trail}`;
}

function writeSqlHeader() {
  return 'BEGIN;\n\n';
}

function writeSqlFooter() {
  return '\nCOMMIT;\n';
}

function buildInsert(route, metrics, geometry) {
  const {
    hiking_spot_name,
    mountain,
    trail_name,
    route_name_format,
    difficulty,
    estimated_duration_minutes,
    sources,
    notes
  } = route;

  const route_name = route_name_format || formatRouteName(mountain, trail_name);
  const distanceKm = metrics.distance_km.toFixed(1);
  const elevGainM = Math.round(metrics.elevation_gain_m || 0);

  const commentLines = [];
  commentLines.push(`-- Source(s):`);
  (sources || []).forEach(s => commentLines.push(`-- ${s.name}: ${s.url}`));
  if (route.gpx_file) commentLines.push(`-- GPX: gpx/${route.gpx_file}`);
  if (notes) commentLines.push(`-- Notes: ${notes}`);
  if (geometry.anyOutOfBounds) commentLines.push(`-- WARNING: Some coordinates outside Cebu bounds (${MIN_LAT}-${MAX_LAT}N, ${MIN_LNG}-${MAX_LNG}E)`);
  const comments = commentLines.join('\n');

  const features = 'Auto-generated from GPX; see sources';
  const description = 'Route derived from GPX and simplified waypoints';

  return `${comments}\nINSERT INTO hiking_spot_routes (hiking_spot_id, route_name, difficulty, distance, elevation_gain, estimated_duration_minutes, route_features, route_description, start_latitude, start_longitude, end_latitude, end_longitude, waypoints, route_geom) VALUES\n((SELECT id FROM hiking_spots WHERE name = '${hiking_spot_name}' LIMIT 1), '${route_name}', '${difficulty}', ${distanceKm}, ${elevGainM}, ${estimated_duration_minutes}, '${features}', '${description}', ${toFixed6(geometry.start.lat)}, ${toFixed6(geometry.start.lon)}, ${toFixed6(geometry.end.lat)}, ${toFixed6(geometry.end.lon)}, '${geometry.waypointsJson.replace(/'/g, "''")}', ST_GeomFromText('LINESTRING(${geometry.linestring})', 4326));\n`;
}

function upsertSummaryHeader() {
  if (!fs.existsSync(SUMMARY_MD)) {
    fs.writeFileSync(SUMMARY_MD, '# Trails Summary\n\nThis file lists verified routes, metrics and sources per route.\n\n');
  }
}

function appendSummary(route, metrics, geometry) {
  const { hiking_spot_name, mountain, trail_name, route_name_format, difficulty, estimated_duration_minutes, sources, gpx_file, notes } = route;
  const route_name = route_name_format || formatRouteName(mountain, trail_name);
  const lines = [];
  lines.push(`## ${route_name}`);
  lines.push('');
  lines.push(`- **mountain**: ${mountain}`);
  lines.push(`- **trailhead**: ${toFixed6(geometry.start.lat)}, ${toFixed6(geometry.start.lon)}`);
  lines.push(`- **summit/end**: ${toFixed6(geometry.end.lat)}, ${toFixed6(geometry.end.lon)}`);
  lines.push(`- **distance_km**: ${metrics.distance_km.toFixed(2)}`);
  lines.push(`- **elevation_gain_m**: ${Math.round(metrics.elevation_gain_m || 0)}`);
  lines.push(`- **difficulty**: ${difficulty}`);
  lines.push(`- **estimated_duration_minutes**: ${estimated_duration_minutes}`);
  if (gpx_file) lines.push(`- **gpx_file**: gpx/${gpx_file}`);
  if (sources && sources.length) {
    lines.push(`- **sources**:`);
    sources.forEach(s => lines.push(`  - ${s.name}: ${s.url}`));
  }
  if (geometry.anyOutOfBounds) lines.push(`- **warning**: Some coordinates outside Cebu bounds (${MIN_LAT}-${MAX_LAT}N, ${MIN_LNG}-${MAX_LNG}E)`);
  if (notes) lines.push(`- **notes**: ${notes}`);
  lines.push('');
  fs.appendFileSync(SUMMARY_MD, lines.join('\n') + '\n');
}

function main() {
  ensureDir(OUT_DIR);
  upsertSummaryHeader();

  if (!fs.existsSync(SOURCES_JSON)) {
    console.error(`[ERROR] Missing ${SOURCES_JSON}. Please add route entries first.`);
    process.exit(1);
  }

  const cfg = readJSON(SOURCES_JSON);
  const routes = cfg.routes || [];
  if (!routes.length) {
    console.error('[ERROR] No routes in sources.json');
    process.exit(1);
  }

  let sql = writeSqlHeader();

  for (const route of routes) {
    const gpxPath = path.join(GPX_DIR, route.gpx_file || '');
    const gpxXml = route.gpx_file ? readFileSafe(gpxPath) : null;
    if (!gpxXml) {
      console.warn(`[WARN] GPX not found for ${route.hiking_spot_name} — ${route.trail_name}: ${gpxPath}`);
      // Skip SQL generation but still log in summary with note
      appendSummary(route, { distance_km: 0, elevation_gain_m: 0 }, {
        start: { lat: 0, lon: 0 }, end: { lat: 0, lon: 0 }, waypointsJson: '[]', linestring: '', anyOutOfBounds: false
      });
      continue;
    }

    const points = parseGpxTrkpts(gpxXml);
    if (!points.length) {
      console.warn(`[WARN] No <trkpt> found in ${route.gpx_file}, skipping`);
      appendSummary(route, { distance_km: 0, elevation_gain_m: 0 }, {
        start: { lat: 0, lon: 0 }, end: { lat: 0, lon: 0 }, waypointsJson: '[]', linestring: '', anyOutOfBounds: false
      });
      continue;
    }

    // Metrics
    const distance_km = computeDistanceKm(points);
    const elevation_gain_m = computeElevationGainM(points);

    // Geometry
    const start = points[0];
    const end = points[points.length - 1];
    const sampled = sampleWaypoints(points, 12);
    const waypointsJson = toWaypointsJson(sampled);
    const linestring = toLineString(points);

    // Bounds check
    let anyOutOfBounds = false;
    for (const p of sampled) {
      if (!withinCebuBounds(p.lat, p.lon)) { anyOutOfBounds = true; break; }
    }

    const metrics = { distance_km, elevation_gain_m };
    const geometry = { start, end, waypointsJson, linestring, anyOutOfBounds };

    // Build SQL chunk and summary
    const chunk = buildInsert(route, metrics, geometry);
    sql += chunk + '\n';
    appendSummary(route, metrics, geometry);
  }

  sql += writeSqlFooter();
  fs.writeFileSync(OUT_SQL, sql, 'utf8');
  console.log(`[OK] Wrote SQL: ${OUT_SQL}`);
  console.log(`[OK] Updated summary: ${SUMMARY_MD}`);
}

if (require.main === module) {
  main();
}
