/**
 * Import one freely licensed photograph per destination from Wikimedia Commons.
 *   npm run images:fetch                 (only destinations that have no photos yet)
 *   npm run images:fetch -- --force      (replace existing photos)
 *   npm run images:fetch -- --dry-run    (show what would be saved, change nothing)
 *
 * How the photo is chosen (so it is relevant AND properly licensed):
 * 1. data/wikipedia_titles.json maps each destination to an English Wikipedia article.
 * 2. The article's main "page image" is requested with pilicense=free (free licences only).
 * 3. The file is looked up on Wikimedia Commons; it is kept only if it really is a Commons
 *    file with a free licence (CC0 / public domain / CC BY / CC BY-SA - no NC/ND), and is a
 *    JPEG/PNG/WebP photo.
 * 4. Author, licence, licence link and source page are saved with the image and shown
 *    next to it in the app (required by CC BY / BY-SA).
 *
 * Wikimedia API etiquette: few, batched requests (40 titles each), one at a time with a
 * pause, `maxlag`, and a User-Agent with contact details (WIKIMEDIA_CONTACT in backend/.env).
 * Images are shown from Wikimedia's servers using their standard thumbnail sizes.
 */
import { readFileSync } from 'fs';
import '../config/env.js';
import { config } from '../config/env.js';
import { migrate } from '../db/migrate.js';
import { pool, query, withTransaction } from '../db/pool.js';
import { updateImages } from '../services/destinationService.js';
import { clean } from '../models/Destination.js';

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH = 40;
const PAUSE_MS = 1000;
const THUMB_WIDTHS = [500, 960, 1280]; // Wikimedia standard thumbnail steps
const FREE_LICENSE = /^(cc0|cc[ -]by(-sa)?([ -]\d(\.\d)?)?(\s|$)|public domain|pd\b|pd-)/i;
const NOT_FREE = /\b(nc|nd)\b|non-?commercial|no ?deriv/i;

const titles = JSON.parse(readFileSync(new URL('../data/wikipedia_titles.json', import.meta.url), 'utf-8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!config.wikimediaContact) {
  console.error('Set WIKIMEDIA_CONTACT (your email or project page) in backend/.env - Wikimedia asks every API user to identify themselves.');
  process.exit(1);
}
const USER_AGENT = `TourFlowAI/1.0 (college project; ${config.wikimediaContact})`;

async function api(base, params) {
  const url = `${base}?${new URLSearchParams({ format: 'json', formatversion: '2', maxlag: '5', ...params })}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Api-User-Agent': USER_AGENT } });
    if (res.ok) {
      const data = await res.json();
      if (data.error?.code === 'maxlag') {
        await sleep(5000);
        continue;
      }
      if (data.error) throw new Error(`${data.error.code}: ${data.error.info}`);
      return data;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(Number(res.headers.get('retry-after')) * 1000 || 5000 * attempt);
      continue;
    }
    throw new Error(`HTTP ${res.status} from ${base}`);
  }
  throw new Error(`Gave up after 3 attempts: ${base}`);
}

const chunks = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const toHttps = (url) => (url ? String(url).replace(/^http:\/\//, 'https://').replace(/^\/\//, 'https://') : '');

// Article title -> page image file name (free licence only)
async function pageImages(articleTitles) {
  const result = new Map();
  for (const batch of chunks([...new Set(articleTitles)], BATCH)) {
    const data = await api('https://en.wikipedia.org/w/api.php', {
      action: 'query',
      prop: 'pageimages',
      piprop: 'name',
      pilicense: 'free',
      redirects: '1',
      titles: batch.join('|'),
    });
    // follow title normalisation and redirects back to the title we asked for
    const final = new Map(batch.map((t) => [t, t]));
    for (const n of data.query?.normalized || []) for (const [k, v] of final) if (v === n.from) final.set(k, n.to);
    for (const r of data.query?.redirects || []) for (const [k, v] of final) if (v === r.from) final.set(k, r.to);
    const pages = new Map((data.query?.pages || []).map((p) => [p.title, p]));
    for (const [asked, resolved] of final) {
      const page = pages.get(resolved);
      result.set(asked, page && !page.missing && page.pageimage ? { file: page.pageimage, articleTitle: page.title } : null);
    }
    await sleep(PAUSE_MS);
  }
  return result;
}

// File name -> Commons metadata (or null if not a freely licensed Commons photo)
async function commonsInfo(fileNames) {
  const result = new Map();
  for (const batch of chunks([...new Set(fileNames)], BATCH)) {
    const data = await api('https://commons.wikimedia.org/w/api.php', {
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: String(THUMB_WIDTHS[1]),
      iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
      titles: batch.map((f) => `File:${f.replace(/_/g, ' ')}`).join('|'),
    });
    const byTitle = new Map((data.query?.pages || []).map((p) => [p.title, p]));
    const normalized = new Map((data.query?.normalized || []).map((n) => [n.from, n.to]));
    for (const file of batch) {
      const asked = `File:${file.replace(/_/g, ' ')}`;
      const page = byTitle.get(normalized.get(asked) || asked);
      const info = page && !page.missing && page.imageinfo?.[0];
      if (!info) {
        result.set(file, { rejected: 'not a Wikimedia Commons file' });
        continue;
      }
      const meta = info.extmetadata || {};
      const license = stripHtml(meta.LicenseShortName?.value);
      if (!/^image\/(jpeg|png|webp)$/.test(info.mime)) result.set(file, { rejected: `not a photo (${info.mime})` });
      else if (!FREE_LICENSE.test(license) || NOT_FREE.test(license)) result.set(file, { rejected: `licence not allowed (${license || 'unknown'})` });
      else result.set(file, { info, license, credit: stripHtml(meta.Artist?.value).slice(0, 200) || 'Unknown author (see source page)', licenseUrl: toHttps(meta.LicenseUrl?.value) });
    }
    await sleep(PAUSE_MS);
  }
  return result;
}

// Responsive sizes from Wikimedia's thumbnail URL (only sizes smaller than the original)
function buildImage(found, meta, destinationName) {
  const { info } = meta;
  const thumb = toHttps(info.thumburl);
  const srcset = [];
  if (thumb.includes(`/${THUMB_WIDTHS[1]}px-`)) {
    for (const w of THUMB_WIDTHS) if (w < info.width) srcset.push({ url: thumb.replace(`/${THUMB_WIDTHS[1]}px-`, `/${w}px-`), width: w });
  }
  if (!srcset.length) srcset.push({ url: toHttps(info.url), width: info.width });
  const main = srcset.find((s) => s.width === THUMB_WIDTHS[1]) || srcset[srcset.length - 1];
  const sameName = destinationName.toLowerCase().includes(found.articleTitle.toLowerCase());
  return {
    url: main.url,
    srcset,
    width: info.width,
    height: info.height,
    alt: sameName ? `Photo of ${destinationName}` : `Photo of ${found.articleTitle}, ${destinationName}`,
    credit: meta.credit,
    license: meta.license,
    licenseUrl: meta.licenseUrl || undefined,
    sourceUrl: toHttps(info.descriptionurl),
  };
}

try {
  await migrate({ log: () => {} });
  const { rows } = await query(`SELECT id, dataset->>'destination_name' AS name, jsonb_array_length(images) AS count FROM destinations ORDER BY id::int`);
  const todo = rows.filter((r) => titles[r.id] && (FORCE || r.count === 0));
  console.log(`${todo.length} destination(s) to look up${FORCE ? ' (--force)' : ''}${DRY_RUN ? ' (--dry-run)' : ''}.`);

  const pages = await pageImages(todo.map((r) => titles[r.id]));
  const files = [...pages.values()].filter(Boolean).map((p) => p.file);
  const metas = await commonsInfo(files);

  const summary = { saved: 0, skipped: [] };
  await withTransaction(async (client) => {
    for (const r of todo) {
      const name = clean(r.name);
      const found = pages.get(titles[r.id]);
      if (!found) {
        summary.skipped.push(`${r.id} ${name}: no free page image on "${titles[r.id]}"`);
        continue;
      }
      const meta = metas.get(found.file);
      if (!meta || meta.rejected) {
        summary.skipped.push(`${r.id} ${name}: ${found.file} - ${meta?.rejected || 'no metadata'}`);
        continue;
      }
      const image = buildImage(found, meta, name);
      if (DRY_RUN) console.log(`${r.id} ${name}\n   ${image.url}\n   ${image.credit} | ${image.license}`);
      else await updateImages(r.id, [image], null, { action: 'destination.images_imported', client });
      summary.saved += 1;
    }
    if (DRY_RUN) throw Object.assign(new Error('dry run'), { dryRun: true });
  }).catch((err) => {
    if (!err.dryRun) throw err;
  });

  console.log(`\n${DRY_RUN ? 'Would save' : 'Saved'} photos for ${summary.saved} destination(s).`);
  if (summary.skipped.length) {
    console.log(`Skipped ${summary.skipped.length} (add these photos in Admin -> Destinations, or change data/wikipedia_titles.json):`);
    for (const line of summary.skipped) console.log('  - ' + line);
  }
} catch (err) {
  console.error('Image import failed, nothing was changed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
