// Minimal static file server for 420360
// Usage: node server.js [port]
// Serves files from the current directory.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2], 10) || 3000;
const root = process.cwd();
const BOARD_API_TARGET = 'https://script.google.com/macros/s/AKfycby39Tl8KgZplSh9d50YCe_Lw4qQc4SLRO-ulPzc9Dwov8u6UxuF959Wm5YXJdqg6jEetA/exec';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, data, headers={}){
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  if (data) res.end(data); else res.end();
}

function serveFile(res, filePath){
  fs.stat(filePath, (err, stat) => {
    if (err) {
      return send(res, 404, 'Not found');
    }
    if (stat.isDirectory()) {
      // try index.html
      const idx = path.join(filePath, 'index.html');
      fs.stat(idx, (e2, st2) => {
        if (e2 || !st2.isFile()) return send(res, 403, 'Forbidden');
        serveFile(res, idx);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      stream.pipe(res);
    });
    stream.on('error', () => send(res, 500, 'Server error'));
  });
}

const server = http.createServer((req, res) => {
  try{
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Preflight for API
    if (urlPath === '/api/board' && req.method === 'OPTIONS') {
      return send(res, 204, '', {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
    }

    // Proxy to external board API with redirect handling
    if (urlPath === '/api/board' && (req.method === 'GET' || req.method === 'POST')) {
      let body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', () => {
        const payload = Buffer.concat(body);
        const doRequest = (targetUrl, method, data, redirectsLeft = 3) => {
          const u = new URL(targetUrl);
          const opts = {
            method,
            hostname: u.hostname,
            path: u.pathname + (u.search || ''),
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': data ? Buffer.byteLength(data) : 0,
            }
          };
          const proxyReq = https.request(opts, (proxyRes) => {
            if ([301,302,303,307,308].includes(proxyRes.statusCode) && proxyRes.headers.location && redirectsLeft > 0) {
              const loc = proxyRes.headers.location.startsWith('http')
                ? proxyRes.headers.location
                : `${u.origin}${proxyRes.headers.location}`;
              proxyRes.resume();
              return doRequest(loc, method, data, redirectsLeft - 1);
            }
            const chunks = [];
            proxyRes.on('data', c => chunks.push(c));
            proxyRes.on('end', () => {
              const buf = Buffer.concat(chunks);
              send(res, proxyRes.statusCode || 200, buf, {
                'Content-Type': proxyRes.headers['content-type'] || 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
              });
            });
          });
          proxyReq.on('error', () => send(res, 502, 'Bad gateway', {
            'Access-Control-Allow-Origin': '*',
          }));
          if (data && data.length) proxyReq.write(data);
          proxyReq.end();
        };
        doRequest(BOARD_API_TARGET, req.method, payload);
      });
      return;
    }

    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(root, urlPath.replace(/^\/+/, ''));
    // prevent path traversal
    if (!filePath.startsWith(root)) return send(res, 400, 'Bad request');
    serveFile(res, filePath);
  }catch(e){
    send(res, 500, 'Server error');
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
