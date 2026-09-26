import { ROUTING, VERSION, UUID, EVENTS, safeProperties } from '../public/measurement-contract.js';
const text = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export function intake(input, id) {
  if (!input || typeof input !== 'object' || !UUID.test(id)) return null;
  const name = text(input.name, 120), email = text(input.email, 180).toLowerCase(), context = text(input.context, 4000);
  if (text(input.website, 100) || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || context.length < 20 || input.consent !== true || !['partnership', 'experiment', 'training', 'other'].includes(input.interest)) return null;
  return { id, ...ROUTING, pipeline: 'sales', type: 'lead', name, email, company: text(input.company, 160), context, interest: input.interest, consentVersion: VERSION, createdAt: new Date().toISOString(), state: 'queued', reference: `LABS-${id.slice(0, 8).toUpperCase()}` };
}
export function event(input, paths) {
  if (!input || !EVENTS.has(input.name) || input.consentVersion !== VERSION || !UUID.test(input.id) || !UUID.test(input.sessionId)) return null;
  return { id: input.id, name: input.name, ...ROUTING, schemaVersion: VERSION, consentVersion: VERSION, path: paths.has(input.path) ? input.path : '/404.html', sessionId: input.sessionId, properties: safeProperties(input.properties), createdAt: new Date().toISOString(), state: 'queued' };
}
export function crmPayload(record) {
  return { id: record.id, name: record.reference, schemaVersion: VERSION, requestType: 'lead', tenantKey: ROUTING.tenant, systemKey: ROUTING.system, brandKey: ROUTING.brand, pipelineKey: 'sales', externalId: record.id, occurredAt: record.createdAt, contactName: record.name, contactEmail: record.email, companyName: record.company, interest: record.interest, context: record.context, privacyConsent: true, consentVersion: record.consentVersion, source: 'website', locale: 'pt', status: 'received' };
}
