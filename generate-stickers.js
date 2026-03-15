#!/usr/bin/env node
// Generate 50 cottagecore stickers via fal.ai Flux Pro + background removal

const fs = require('fs');
const path = require('path');
const https = require('https');

const FAL_API_KEY = '0dde85d0-affb-4c7e-9142-afa4302b812e:faebde71a8a22cf105e1b29c72b68515';
const OUTPUT_DIR = path.join(__dirname, 'images', 'stickers');
const CONCURRENCY = 5; // parallel requests

const STYLE = 'cute watercolor sticker illustration, cottagecore aesthetic, soft pastel colors, hand-painted style, isolated on pure white background, no text, no shadow, clean simple design, single object centered, sticker art, delicate brushstrokes';

const STICKERS = [
  // ── Flowers & Botanicals (12) ──
  { id: 'flower-rose', cat: 'flowers', subject: 'a pink garden rose with soft petals' },
  { id: 'flower-lavender', cat: 'flowers', subject: 'a sprig of lavender' },
  { id: 'flower-daisy', cat: 'flowers', subject: 'a white daisy flower' },
  { id: 'flower-peony', cat: 'flowers', subject: 'a lush pink peony' },
  { id: 'flower-sunflower', cat: 'flowers', subject: 'a golden sunflower' },
  { id: 'flower-cherry-blossom', cat: 'flowers', subject: 'a cherry blossom branch with pink flowers' },
  { id: 'flower-eucalyptus', cat: 'flowers', subject: 'a eucalyptus branch with round leaves' },
  { id: 'flower-bouquet', cat: 'flowers', subject: 'a small wildflower bouquet tied with ribbon' },
  { id: 'flower-fern', cat: 'flowers', subject: 'a curled fern leaf' },
  { id: 'flower-olive', cat: 'flowers', subject: 'an olive branch with small green olives' },
  { id: 'flower-poppy', cat: 'flowers', subject: 'a red poppy flower' },
  { id: 'flower-lily-valley', cat: 'flowers', subject: 'lily of the valley with tiny white bells' },

  // ── Cozy Items (10) ──
  { id: 'cozy-teacup', cat: 'cozy', subject: 'a vintage porcelain teacup with saucer and steam' },
  { id: 'cozy-books', cat: 'cozy', subject: 'a stack of three old books with a bookmark' },
  { id: 'cozy-candle', cat: 'cozy', subject: 'a lit candle in a ceramic holder with soft glow' },
  { id: 'cozy-scarf', cat: 'cozy', subject: 'a knitted scarf in soft pink' },
  { id: 'cozy-envelope', cat: 'cozy', subject: 'a vintage envelope with a wax seal' },
  { id: 'cozy-pen', cat: 'cozy', subject: 'a vintage fountain pen with ink drop' },
  { id: 'cozy-glasses', cat: 'cozy', subject: 'round reading glasses' },
  { id: 'cozy-mason-jar', cat: 'cozy', subject: 'a mason jar with wildflowers' },
  { id: 'cozy-yarn', cat: 'cozy', subject: 'a ball of yarn with knitting needles' },
  { id: 'cozy-key', cat: 'cozy', subject: 'an ornate vintage key' },

  // ── Nature & Animals (8) ──
  { id: 'nature-butterfly', cat: 'nature', subject: 'a delicate pastel butterfly with spread wings' },
  { id: 'nature-bird', cat: 'nature', subject: 'a small robin bird on a twig' },
  { id: 'nature-rabbit', cat: 'nature', subject: 'a cute fluffy bunny rabbit sitting' },
  { id: 'nature-hedgehog', cat: 'nature', subject: 'a tiny hedgehog curled up' },
  { id: 'nature-cat', cat: 'nature', subject: 'a sleeping calico cat curled in a ball' },
  { id: 'nature-bee', cat: 'nature', subject: 'a friendly bumblebee' },
  { id: 'nature-ladybug', cat: 'nature', subject: 'a red ladybug' },
  { id: 'nature-fox', cat: 'nature', subject: 'a cute baby fox sitting' },

  // ── Decorative (8) ──
  { id: 'deco-ribbon', cat: 'deco', subject: 'a pink satin ribbon bow' },
  { id: 'deco-heart', cat: 'deco', subject: 'a soft pink watercolor heart' },
  { id: 'deco-stars', cat: 'deco', subject: 'a cluster of golden stars' },
  { id: 'deco-arrow', cat: 'deco', subject: 'a decorative arrow with feathers and flowers' },
  { id: 'deco-moon', cat: 'deco', subject: 'a crescent moon with tiny stars' },
  { id: 'deco-rainbow', cat: 'deco', subject: 'a pastel rainbow arc' },
  { id: 'deco-cloud', cat: 'deco', subject: 'a fluffy white cloud' },
  { id: 'deco-banner', cat: 'deco', subject: 'a small decorative ribbon banner scroll' },

  // ── Seasonal (6) ──
  { id: 'season-snowflake', cat: 'seasonal', subject: 'an intricate snowflake crystal' },
  { id: 'season-maple-leaf', cat: 'seasonal', subject: 'a golden autumn maple leaf' },
  { id: 'season-pumpkin', cat: 'seasonal', subject: 'a small orange pumpkin' },
  { id: 'season-umbrella', cat: 'seasonal', subject: 'a pastel pink umbrella with raindrops' },
  { id: 'season-seashell', cat: 'seasonal', subject: 'a pink seashell' },
  { id: 'season-mittens', cat: 'seasonal', subject: 'a pair of knitted mittens' },

  // ── Food & Drink (6) ──
  { id: 'food-croissant', cat: 'food', subject: 'a golden flaky croissant' },
  { id: 'food-macaron', cat: 'food', subject: 'a stack of three pastel macarons' },
  { id: 'food-strawberry', cat: 'food', subject: 'a ripe red strawberry' },
  { id: 'food-cherry', cat: 'food', subject: 'a pair of cherries on a stem' },
  { id: 'food-honey', cat: 'food', subject: 'a honey jar with a wooden dipper and dripping honey' },
  { id: 'food-cake', cat: 'food', subject: 'a slice of layered cake with berries on top' },
];

// ── HTTP helpers ──

function httpRequest(method, hostname, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname, port: 443, path: urlPath, method,
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`Parse error: ${data.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const handler = res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, handler).on('error', reject);
        return;
      }
      const stream = fs.createWriteStream(filePath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
    };
    https.get(url, handler).on('error', reject);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── fal.ai Queue API ──

async function submitGeneration(prompt) {
  const res = await httpRequest('POST', 'queue.fal.run', '/fal-ai/flux-pro/v1.1', {
    prompt,
    image_size: { width: 768, height: 768 },
    num_images: 1,
    safety_tolerance: '5'
  });
  if (!res.request_id) throw new Error(`No request_id: ${JSON.stringify(res)}`);
  return res.request_id;
}

async function pollResult(requestId, model = 'flux-pro') {
  const basePath = model === 'flux-pro'
    ? '/fal-ai/flux-pro/requests'
    : `/fal-ai/${model}/requests`;

  for (let i = 0; i < 120; i++) {
    const status = await httpRequest('GET', 'queue.fal.run', `${basePath}/${requestId}/status`);
    if (status.status === 'COMPLETED') {
      const result = await httpRequest('GET', 'queue.fal.run', `${basePath}/${requestId}`);
      return result;
    }
    if (status.status === 'FAILED') throw new Error(`Failed: ${JSON.stringify(status)}`);
    await sleep(2000);
  }
  throw new Error('Timeout');
}

async function removeBackground(imageUrl) {
  const res = await httpRequest('POST', 'queue.fal.run', '/fal-ai/birefnet', {
    image_url: imageUrl,
    model: 'General Use (Heavy)',
    operating_resolution: '1024x1024',
    output_format: 'png'
  });
  if (!res.request_id) {
    // Sync response — image returned directly
    if (res.image && res.image.url) return res.image.url;
    throw new Error(`No request_id for birefnet: ${JSON.stringify(res).substring(0, 200)}`);
  }
  const result = await pollResult(res.request_id, 'birefnet');
  if (result.image && result.image.url) return result.image.url;
  throw new Error(`No image in birefnet result: ${JSON.stringify(result).substring(0, 200)}`);
}

// ── Main pipeline ──

async function processSticker(sticker, index) {
  const prompt = `${STYLE}, ${sticker.subject}`;
  const tag = `[${index + 1}/${STICKERS.length}] ${sticker.id}`;

  try {
    // Step 1: Generate image
    console.log(`${tag} generating...`);
    const reqId = await submitGeneration(prompt);
    const genResult = await pollResult(reqId, 'flux-pro');
    const rawUrl = genResult.images[0].url;
    console.log(`${tag} generated, removing background...`);

    // Step 2: Remove background
    const transparentUrl = await removeBackground(rawUrl);
    console.log(`${tag} bg removed, downloading...`);

    // Step 3: Download
    const filePath = path.join(OUTPUT_DIR, `${sticker.id}.png`);
    await downloadFile(transparentUrl, filePath);
    console.log(`${tag} DONE`);
    return { id: sticker.id, success: true };
  } catch (err) {
    console.error(`${tag} ERROR: ${err.message}`);
    return { id: sticker.id, success: false, error: err.message };
  }
}

async function runBatch(items, startIndex) {
  return Promise.all(items.map((sticker, i) => processSticker(sticker, startIndex + i)));
}

async function main() {
  console.log(`\nGenerating ${STICKERS.length} stickers via fal.ai Flux Pro + BiRefNet\n`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Skip already generated
  const existing = new Set(
    fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''))
  );

  const remaining = STICKERS.filter(s => !existing.has(s.id));
  console.log(`Already done: ${existing.size}, remaining: ${remaining.length}\n`);

  if (remaining.length === 0) {
    console.log('All stickers already generated!');
    return;
  }

  const results = [];
  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    const batchResults = await runBatch(batch, STICKERS.indexOf(batch[0]));
    results.push(...batchResults);

    // Brief pause between batches
    if (i + CONCURRENCY < remaining.length) {
      await sleep(1000);
    }
  }

  const ok = results.filter(r => r.success).length;
  const fail = results.filter(r => !r.success);
  console.log(`\nDone! ${ok}/${results.length} succeeded.`);
  if (fail.length > 0) {
    console.log('Failed:');
    fail.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
    console.log('\nRe-run the script to retry failed ones (it skips existing files).');
  }

  // Generate stickers manifest
  const all = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png')).sort();
  const manifest = all.map(f => {
    const id = f.replace('.png', '');
    const sticker = STICKERS.find(s => s.id === id);
    return { id, file: f, category: sticker?.cat || 'unknown' };
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`\nManifest saved: ${all.length} stickers in manifest.json`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
