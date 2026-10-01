/**
 * A tiny dependency-free static server for the demo, because browsers refuse
 * to load ES modules from file:// URLs. Development only: it binds to
 * 127.0.0.1 and never serves anything outside its root.
 *
 * Run with: node scripts/serve.ts [root]   (default root: the repo, open /demo/)
 */

import { createReadStream, statSync, type Stats } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
};

const statOrNull = (path: string): Stats | null => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
};

export function createStaticServer(root: string): Server {
  const base = resolve(root);
  return createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname: string;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end('Bad request');
      return;
    }
    // Decoding can turn "%2f" into "/" and reintroduce "..", so check after resolving.
    let file = resolve(base, `.${pathname}`);
    if (file !== base && !file.startsWith(base + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let stats = statOrNull(file);
    if (stats?.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${pathname}/` }).end();
        return;
      }
      file = join(file, 'index.html');
      stats = statOrNull(file);
    }
    if (!stats?.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const custom = process.argv[2];
  const root = custom ? resolve(custom) : fileURLToPath(new URL('..', import.meta.url));
  const port = Number(process.env.PORT ?? 5173);
  createStaticServer(root).listen(port, '127.0.0.1', () => {
    console.log(`Serving ${root} at http://127.0.0.1:${port}/${custom ? '' : 'demo/'}`);
  });
}
