import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { request, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../scripts/serve.ts';

// The fixture site sits next to golden.json, so a traversal bug would expose it.
const SITE = new URL('./fixtures/site/', import.meta.url);

let server: Server;
let port = 0;

before(async () => {
  server = createStaticServer(fileURLToPath(SITE));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = (server.address() as AddressInfo).port;
});

after(() => new Promise<void>((resolve) => server.close(() => resolve())));

// Raw requests, so the client never normalizes ".." or escapes before the server sees them.
const send = (method: string, path: string) =>
  new Promise<{ status: number; headers: IncomingHttpHeaders; body: string }>((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, method, path }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });

const fixture = (path: string): string => readFileSync(new URL(path, SITE), 'utf8');

test('serves files with their content type and no caching', async () => {
  const cases: [string, RegExp][] = [
    ['/index.html', /^text\/html/],
    ['/app.js', /^text\/javascript/],
    ['/style.css', /^text\/css/],
    ['/data.json', /^application\/json/],
    ['/icon.svg', /^image\/svg\+xml/],
  ];
  for (const [path, type] of cases) {
    const res = await send('GET', path);
    assert.equal(res.status, 200, path);
    assert.match(res.headers['content-type'] ?? '', type, path);
    assert.equal(res.headers['cache-control'], 'no-store', path);
    assert.equal(res.body, fixture(`.${path}`), path);
  }
});

test('a directory serves its index.html', async () => {
  assert.equal((await send('GET', '/')).body, fixture('./index.html'));
  assert.equal((await send('GET', '/nested/')).body, fixture('./nested/index.html'));
});

test('a directory without a trailing slash redirects to one', async () => {
  const res = await send('GET', '/nested');
  assert.equal(res.status, 301);
  assert.equal(res.headers.location, '/nested/');
});

test('paths outside the root are never served', async () => {
  for (const path of ['/../golden.json', '/..%2fgolden.json', '/%2e%2e/golden.json', '/..%2f..%2fpackage.json']) {
    const res = await send('GET', path);
    assert.ok(res.status === 403 || res.status === 404, `${path} answered ${res.status}`);
    assert.ok(!res.body.includes('sha256') && !res.body.includes('devDependencies'), `${path} leaked a file`);
  }
});

test('missing files are 404', async () => {
  assert.equal((await send('GET', '/missing.txt')).status, 404);
});

test('only GET and HEAD are allowed', async () => {
  const post = await send('POST', '/index.html');
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
  const head = await send('HEAD', '/index.html');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.equal(head.headers['content-length'], String(Buffer.byteLength(fixture('./index.html'))));
});

test('malformed escapes are 400', async () => {
  assert.equal((await send('GET', '/%E0%A4%A')).status, 400);
});
