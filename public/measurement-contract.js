export const VERSION = '2026-09-26';
export const ROUTING = Object.freeze({ tenant: 'rogpe', brand: 'rogpLabs', system: 'rogplabs.rogpe.tech' });
export const EVENTS = new Set(['page_view', 'click', 'section_view', 'scroll_depth', 'engagement', 'page_exit', 'form_start', 'form_field', 'form_submit', 'form_success', 'form_error', 'form_abandon', 'radar_filter', 'web_vital']);
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const enums = {
  form: ['contact', 'newsletter', 'request'], field: ['name', 'email', 'company', 'interest', 'context', 'consent', 'topic', 'format'],
  source: ['direct', 'google', 'bing', 'instagram', 'facebook', 'youtube', 'linkedin', 'newsletter', 'referral', 'other'],
  medium: ['organic', 'social', 'email', 'cpc', 'paid_social', 'referral', 'none', 'other'],
  destination: ['internal', 'github', 'youtube', 'email', 'external'],
  filter: ['todos', 'adotar', 'testar', 'acompanhar', 'evitar'],
  device: ['mobile', 'tablet', 'desktop'], reason: ['validation', 'network', 'server', 'hidden', 'pagehide'],
  metric: ['lcp_observed', 'layout_shift_sum', 'interaction_max'], interest: ['partnership', 'experiment', 'training', 'other'],
};
export function safeProperties(input) {
  const result = {};
  if (!input || typeof input !== 'object') return result;
  for (const [key, values] of Object.entries(enums)) if (values.includes(input[key])) result[key] = input[key];
  for (const [key, pattern] of Object.entries({ section: /^s(?:[1-9]|[1-4]\d|50)$/, target: /^c(?:[1-9]|[1-9]\d|[12]\d\d|300)$/ })) if (typeof input[key] === 'string' && pattern.test(input[key])) result[key] = input[key];
  for (const [key, limit] of Object.entries({ depth: 100, activeSeconds: 3600, value: 60000 })) if (typeof input[key] === 'number' && Number.isFinite(input[key]) && input[key] >= 0) result[key] = Math.round(Math.min(input[key], limit) * 1000) / 1000;
  return result;
}
