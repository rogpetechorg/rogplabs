import { createHmac } from 'node:crypto';
import { crmPayload } from './domain.mjs';
export async function deliverLead(record, config, request = fetch) {
  if (!config.CRM_BASE_URL || !config.CRM_API_KEY) return false;
  const url = config.CRM_BASE_URL.replace(/\/$/, '') + '/rest/intakeRequests';
  const headers = { authorization: `Bearer ${config.CRM_API_KEY}`, 'content-type': 'application/json' };
  // A stable CRM record ID makes a retry after a lost response reconcilable.
  const existing = await request(`${url}/${record.id}`, { headers, signal: AbortSignal.timeout(8000) });
  if (existing.ok) {
    const data = await existing.json(); const item = data.data?.intakeRequest ?? data.intakeRequest ?? data;
    return item.externalId === record.id && item.brandKey === 'rogpLabs' && item.systemKey === 'rogplabs.rogpe.tech';
  }
  if (existing.status !== 404) return false;
  const response = await request(url, { method: 'POST', headers, body: JSON.stringify(crmPayload(record)), signal: AbortSignal.timeout(8000) });
  return response.ok;
}
export async function deliverEvent(record, config, request = fetch) {
  if (!config.EVENT_GATEWAY_URL || !config.EVENT_GATEWAY_KEY || !config.EVENT_GATEWAY_SOURCE) return false;
  const data = { name: record.name, properties: record.properties, path: record.path, sessionId: record.sessionId, tenant: record.tenant, brand: record.brand, system: record.system, schemaVersion: record.schemaVersion };
  const payload = JSON.stringify({ specversion: '1.0', id: record.id, source: config.EVENT_GATEWAY_SOURCE, type: `com.rogpe.rogplabs.${record.name}`, subject: `rogplabs:${record.path}`, time: record.createdAt, datacontenttype: 'application/json', data });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', config.EVENT_GATEWAY_KEY).update(`${timestamp}.`).update(payload).digest('hex');
  const response = await request(config.EVENT_GATEWAY_URL, { method: 'POST', headers: { 'content-type': 'application/cloudevents+json', 'x-rogpe-source': config.EVENT_GATEWAY_SOURCE, 'x-rogpe-timestamp': timestamp, 'x-rogpe-signature': `v1=${signature}` }, body: payload, signal: AbortSignal.timeout(5000) });
  return response.ok;
}
