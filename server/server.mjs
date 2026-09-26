import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { createHash } from 'node:crypto';
import { UUID } from '../public/measurement-contract.js';
import { event, intake } from './domain.mjs';
import { Store } from './store.mjs';
import { deliverLead, deliverEvent } from './delivery.mjs';

const headers = { 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'strict-origin-when-cross-origin', 'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()', 'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" };
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const json = (res, status, data) => { res.writeHead(status, { ...headers, 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
async function body(req) { let size = 0; const chunks = []; for await (const chunk of req) { size += chunk.length; if (size > 16384) throw new Error('too_large'); chunks.push(chunk); } return JSON.parse(Buffer.concat(chunks).toString() || '{}'); }

export async function createApp({ root = resolve('dist'), dataDir = process.env.DATA_DIR || resolve('data'), config = process.env, request = fetch } = {}) {
  const storage = new Store(dataDir); await storage.init();
  const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
  const paths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname));
  const limits = new Map(), working = new Set();
  const publicOrigin = config.PUBLIC_ORIGIN || 'https://rogplabs.rogpe.tech';
  const newsletterList = '00329d73-0df1-435b-ab44-ee105ec9b6a7';
  const newsletterBase = (config.NEWSLETTER_BASE_URL || 'https://listmonk.rogpe.tech').replace(/\/$/, '');
  let newsletterAvailable = false, newsletterCheckedAt = 0;
  async function newsletterReady() {
    if (Date.now() - newsletterCheckedAt < 60000) return newsletterAvailable;
    try {
      const response = await request(`${newsletterBase}/subscription/form`, { signal: AbortSignal.timeout(5000) });
      newsletterAvailable = response.ok && (await response.text()).includes(`value="${newsletterList}"`);
    } catch { newsletterAvailable = false; }
    newsletterCheckedAt = Date.now();
    return newsletterAvailable;
  }
  async function operational(record, name) {
    const bytes = createHash('sha256').update(`${record.id}:${name}`).digest().subarray(0, 16); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const h = bytes.toString('hex'), id = `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
    const metric = { id, name, tenant: 'rogpe', brand: 'rogpLabs', system: 'rogplabs.rogpe.tech', schemaVersion: '2026-09-26', properties: { form: 'contact', interest: record.interest }, path: '/contato/', sessionId: '', createdAt: name === 'crm_delivered' ? new Date().toISOString() : record.createdAt, state: 'queued' };
    if (await storage.create('events', metric)) void deliver('events', metric);
  }
  function limited(req, scope, max) {
    const address = config.TRUST_PROXY === 'true' ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',').pop().trim() : req.socket.remoteAddress;
    const key = `${scope}:${address}`, now = Date.now();
    for (const [key, value] of limits) if (value.until < now) limits.delete(key);
    if (!limits.has(key) && limits.size > 10000) return true;
    const bucket = limits.get(key) || { count: 0, until: now + 60000 }; bucket.count++; limits.set(key, bucket); return bucket.count > max;
  }
  async function deliver(kind, record) {
    const key = `${kind}:${record.id}`; if (working.has(key) || record.state === 'delivered') return;
    working.add(key);
    try { if (kind === 'leads') await operational(record, 'lead_received'); if (await (kind === 'leads' ? deliverLead : deliverEvent)(record, config, request)) { if (kind === 'leads') await operational(record, 'crm_delivered'); record.state = 'delivered'; await storage.save(kind, record); } } catch { /* The persisted record remains queued. */ } finally { working.delete(key); }
  }
  let retrying = false;
  async function retry() { if (retrying) return; retrying = true; try { for (const kind of ['leads', 'events']) { let count = 0; for await (const record of storage.records(kind)) if (record.state !== 'delivered') { await deliver(kind, record); if (++count >= 50) break; } } } finally { retrying = false; } }
  const timer = setInterval(() => retry().catch(() => {}), 60000); timer.unref();
  const retention = setInterval(() => storage.purge().catch(() => {}), 86400000); retention.unref();
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, publicOrigin);
      if (req.method === 'GET' && url.pathname === '/healthz') return json(res, 200, { status: 'ok', brand: 'rogpLabs', crm: Boolean(config.CRM_API_KEY), gateway: Boolean(config.EVENT_GATEWAY_KEY) });
      if (url.pathname.startsWith('/api/')) {
        if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
        if (req.headers.origin && req.headers.origin !== publicOrigin) return json(res, 403, { error: 'origin' });
        if (!String(req.headers['content-type']).includes('application/json')) return json(res, 415, { error: 'content_type' });
        const isEvent = url.pathname === '/api/events';
        if (limited(req, isEvent ? 'events' : 'forms', isEvent ? 120 : 10)) return json(res, 429, { error: 'rate_limited' });
        const input = await body(req);
        if (url.pathname === '/api/newsletter/subscribe') {
          if (!input || typeof input.email !== 'string' || input.email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return json(res, 422, { error: 'invalid_email' });
          if (!await newsletterReady()) return json(res, 503, { error: 'newsletter_unavailable' });
          const response = await request(`${newsletterBase}/api/public/subscription`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: input.email.trim(), list_uuids: [newsletterList] }), signal: AbortSignal.timeout(15000) });
          return json(res, response.ok ? 202 : 502, response.ok ? { status: 'confirmation_required' } : { error: 'newsletter_unavailable' });
        }
        const kind = isEvent ? 'events' : 'leads';
        if (!isEvent && url.pathname !== '/api/leads') return json(res, 404, { error: 'not_found' });
        const key = String(req.headers['x-idempotency-key'] || '');
        if (!isEvent && !UUID.test(key)) return json(res, 400, { error: 'idempotency_key' });
        const record = isEvent ? event(input, paths) : intake(input, key);
        if (!record) return json(res, 422, { error: 'invalid_input' });
        const created = await storage.create(kind, record);
        const saved = created ? record : await storage.get(kind, record.id);
        void deliver(kind, saved);
        return json(res, isEvent ? 202 : created ? 201 : 200, isEvent ? { accepted: true } : { reference: saved.reference, status: 'received' });
      }
      if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'method_not_allowed' });
      const decoded = decodeURIComponent(url.pathname);
      let target = resolve(root, `.${decoded}`);
      if (!target.startsWith(root + sep) && target !== root) return json(res, 403, { error: 'forbidden' });
      let status = 200;
      try {
        const info = await stat(target);
        if (info.isDirectory()) {
          if (!url.pathname.endsWith('/')) { res.writeHead(308, { ...headers, location: url.pathname + '/' + url.search }); return res.end(); }
          target = resolve(target, 'index.html'); await stat(target);
        }
      } catch { target = resolve(root, '404.html'); status = 404; }
      const contentType = mime[extname(target)] || 'application/octet-stream';
      const compress = /text|json|xml|svg/.test(contentType) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
      res.writeHead(status, { ...headers, 'content-type': contentType, 'cache-control': target.includes('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache', vary: 'Accept-Encoding', ...(compress ? { 'content-encoding': 'gzip' } : {}) });
      if (req.method === 'HEAD') return res.end();
      await (compress ? pipeline(createReadStream(target), createGzip(), res) : pipeline(createReadStream(target), res));
    } catch (error) { if (!res.headersSent) json(res, error.message === 'too_large' ? 413 : 400, { error: error.message === 'too_large' ? 'too_large' : 'bad_request' }); else res.destroy(); }
  });
  server.on('close', () => { clearInterval(timer); clearInterval(retention); });
  return { server, storage, retry };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp(); app.server.listen(Number(process.env.PORT || 8080), '0.0.0.0', () => { void app.retry().catch(() => {}); });
  process.on('SIGTERM', () => app.server.close(() => process.exit(0)));
}
