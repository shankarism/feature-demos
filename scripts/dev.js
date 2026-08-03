#!/usr/bin/env node
/**
 * Local review server. Runs setup (marked), then serves the site.
 * Internal tab appears only when _local/*.md + vendor/marked.min.js exist.
 */
const { spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 5173;

const setup = spawnSync(process.execPath, [path.join(__dirname, 'setup.js')], {
  cwd: ROOT,
  stdio: 'inherit',
});
if (setup.status !== 0) {
  console.warn('Setup failed (marked may be missing). Internal tab will stay hidden.');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || '/').split('?')[0]);
  const cleaned = decoded.replace(/^\/+/, '');
  const full = path.normalize(path.join(root, cleaned || 'index.html'));
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  let filePath = safeJoin(ROOT, req.url === '/' ? '/index.html' : req.url);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type': type,
        'Content-Length': stat.size,
      });
      res.end();
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': type,
        'Content-Length': data.length,
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  const url = `http://127.0.0.1:${PORT}/`;
  console.log(`\nActivity Tracker demo → ${url}`);
  console.log('Press Ctrl+C to stop.\n');
});
