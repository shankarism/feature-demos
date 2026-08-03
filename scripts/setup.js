#!/usr/bin/env node
/**
 * Ensures local-only vendor/marked is present for the Internal tab.
 * Marked stays gitignored — public Pages never needs it.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const VENDOR = path.join(ROOT, 'vendor');
const MARKED = path.join(VENDOR, 'marked.min.js');
const MARKED_URL =
  'https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        try {
          fs.unlinkSync(dest);
        } catch (_) {}
        reject(err);
      });
  });
}

async function main() {
  fs.mkdirSync(VENDOR, { recursive: true });
  if (fs.existsSync(MARKED) && fs.statSync(MARKED).size > 0) {
    console.log('vendor/marked.min.js already present');
    return;
  }
  console.log('Downloading marked.min.js → vendor/');
  await download(MARKED_URL, MARKED);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
