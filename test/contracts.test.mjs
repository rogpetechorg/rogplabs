import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { intake, event, crmPayload } from '../server/domain.mjs';
import { Store } from '../server/store.mjs';
import { createApp } from '../server/server.mjs';
import { deliverLead, deliverEvent } from '../server/delivery.mjs';
const valid = { name: 'Teste', email: 'test@example.com', company: 'Validação', interest: 'experiment', context: 'Verificação controlada do laboratório.', consent: true };
test('public input cannot change company, brand or pipeline', () => {
  const record = intake({ ...valid, tenant: 'other', brand: 'rogpe.tech', pipeline: 'support', system: 'other' }, randomUUID());
  assert.equal(record.tenant, 'rogpe'); assert.equal(record.brand, 'rogpLabs'); assert.equal(record.system, 'rogplabs.rogpe.tech'); assert.equal(record.pipeline, 'sales');
  assert.equal(crmPayload(record).brandKey, 'rogpLabs');
  assert.equal(intake({ ...valid, consent: false }, randomUUID()), null);
  assert.equal(intake({ ...valid, website: 'spam' }, randomUUID()), null);
  assert.equal(intake(null, randomUUID()), null);
});
test('events require consent version and allow only categorical dimensions', () => {
  const payload = { id: randomUUID(), sessionId: randomUUID(), name: 'form_field', consentVersion: '2026-09-26', path: '/secret@example.com?email=secret', properties: { field: 'email', email: 'secret@example.com', source: 'secret', target: 'secret', activeSeconds: 99999, value: NaN, context: 'secret' } };
  const record = event(payload, new Set(['/']));
  assert.deepEqual(record.properties, { field: 'email', activeSeconds: 3600 }); assert.equal(record.path, '/404.html'); assert.equal(JSON.stringify(record).includes('secret'), false);
  assert.equal(event({ ...payload, consentVersion: '' }, new Set()), null);
  assert.equal(event({ ...payload, name: 'crm_delivered' }, new Set()), null);
});
test('atomic duplicate intake retains the first complete record', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'labs-store-'));
  try { const store = new Store(dir); await store.init(); const record = intake(valid, randomUUID()); const results = await Promise.all(Array.from({ length: 8 }, () => store.create('leads', record))); assert.equal(results.filter(Boolean).length, 1); assert.equal((await store.get('leads', record.id)).email, valid.email); await assert.rejects(store.get('leads', '../../etc/passwd')); assert.equal(await store.purge(Date.now() + 365 * 86400000), 0); } finally { await rm(dir, { recursive: true, force: true }); }
});
test('CRM retries reconcile the same record ID without posting a duplicate', async () => {
  const record = intake(valid, randomUUID()); let posts = 0, exists = false;
  const request = async (url, init) => { if (init.method === 'POST') { posts++; exists = true; assert.equal(JSON.parse(init.body).id, record.id); return new Response('{}', { status: 201 }); } return exists ? Response.json({ data: { intakeRequest: { externalId: record.id, brandKey: 'rogpLabs', systemKey: 'rogplabs.rogpe.tech' } } }) : new Response('{}', { status: 404 }); };
  const config = { CRM_BASE_URL: 'https://crm.test', CRM_API_KEY: 'test' };
  assert.equal(await deliverLead(record, config, request), true); assert.equal(await deliverLead(record, config, request), true); assert.equal(posts, 1);
});
test('gateway signature and dimensions belong to Labs', async () => {
  const record = event({ id: randomUUID(), sessionId: randomUUID(), name: 'page_view', path: '/', consentVersion: '2026-09-26' }, new Set(['/']));
  await deliverEvent(record, { EVENT_GATEWAY_URL: 'https://gateway.test', EVENT_GATEWAY_SOURCE: 'urn:rogpe:rogplabs:production', EVENT_GATEWAY_KEY: 'x'.repeat(32) }, async (url, init) => { const payload = JSON.parse(init.body); assert.equal(payload.data.brand, 'rogpLabs'); assert.match(init.headers['x-rogpe-signature'], /^v1=[0-9a-f]{64}$/); return new Response('{}', { status: 202 }); });
});
test('HTTP intake, duplicate, consent, newsletter isolation, routing and static errors', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'labs-http-')); let server;
  try {
    await writeFile(join(dir, 'sitemap.xml'), '<urlset><url><loc>https://rogplabs.rogpe.tech/</loc></url></urlset>'); await writeFile(join(dir, 'index.html'), '<h1>Labs</h1>'); await writeFile(join(dir, '404.html'), '<h1>404</h1>');
    const app = await createApp({ root: dir, dataDir: join(dir, 'data'), config: {}, request: async (url, init) => { assert.deepEqual(JSON.parse(init.body).list_uuids, ['00329d73-0df1-435b-ab44-ee105ec9b6a7']); return Response.json({}); } });
    server = app.server; await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); const base = `http://127.0.0.1:${server.address().port}`;
    const id = randomUUID(), init = { method: 'POST', headers: { 'content-type': 'application/json', 'x-idempotency-key': id }, body: JSON.stringify(valid) };
    const first = await fetch(base + '/api/leads', init); assert.equal(first.status, 201); const result = await first.json(); assert.match(result.reference, /^LABS-/); assert.equal(JSON.stringify(result).includes(valid.email), false);
    const repeat = await fetch(base + '/api/leads', init); assert.equal(repeat.status, 200); assert.equal((await repeat.json()).reference, result.reference);
    assert.equal((await app.storage.get('leads', id)).brand, 'rogpLabs');
    assert.equal((await fetch(base + '/api/leads', { ...init, headers: { ...init.headers, origin: 'https://evil.test' } })).status, 403);
    assert.equal((await fetch(base + '/api/events', { ...init, body: '{}' })).status, 422);
    assert.equal((await fetch(base + '/api/newsletter/subscribe', { ...init, body: JSON.stringify({ email: valid.email, list_uuids: ['other'] }) })).status, 202);
    assert.equal((await fetch(base + '/missing')).status, 404); assert.equal((await fetch(base + '/', { method: 'HEAD' })).status, 200);
  } finally { if (server) await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive: true, force: true }); }
});
