import { VERSION, UUID, safeProperties } from '/measurement-contract.js';
const key = 'rogplabs_measurement';
let wasVisible = !document.hidden;
let consent = false, session = '', active = 0, last = performance.now(), lastSection = 's1', depth = 0, started = false;
const viewed = new Set(), depths = new Set(), forms = new Map();
const read = (store, name) => { try { return window[store].getItem(name); } catch { return null; } };
const write = (store, name, value) => { try { window[store].setItem(name, value); } catch { /* Consent still works in memory. */ } };
const clear = (store, name) => { try { window[store].removeItem(name); } catch { /* Storage may be unavailable. */ } };
const params = new URLSearchParams(location.search);
const sourceNames = ['google', 'bing', 'instagram', 'facebook', 'youtube', 'linkedin', 'newsletter'];
let source = sourceNames.includes(params.get('utm_source')) ? params.get('utm_source') : params.has('utm_source') ? 'other' : 'direct';
if (source === 'direct' && document.referrer) { try { const host = new URL(document.referrer).hostname; if (host !== location.hostname) source = sourceNames.find(name => host === `${name}.com` || host.endsWith(`.${name}.com`)) || 'referral'; } catch { /* Ignore invalid referrers. */ } }
const medium = ['organic', 'social', 'email', 'cpc', 'paid_social', 'referral'].includes(params.get('utm_medium')) ? params.get('utm_medium') : params.has('utm_medium') ? 'other' : source === 'direct' ? 'none' : 'referral';
const device = innerWidth < 768 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop';
function track(name, properties = {}) {
  if (!consent) return;
  const payload = { id: crypto.randomUUID(), name, consentVersion: VERSION, sessionId: session, path: location.pathname, properties: safeProperties({ source, medium, device, ...properties }) };
  fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
}
function accrue() { const now = performance.now(); if (wasVisible && consent) active += Math.max(0, now - last) / 1000; last = now; wasVisible = !document.hidden; }
function start() {
  session = read('sessionStorage', 'rogplabs_session');
  if (!UUID.test(session || '')) { session = crypto.randomUUID(); write('sessionStorage', 'rogplabs_session', session); }
  last = performance.now(); active = 0; started = true; viewed.clear(); depths.clear();
  track('page_view');
  requestAnimationFrame(() => document.querySelectorAll('[data-metric-section]').forEach(element => { const box = element.getBoundingClientRect(); if (box.top < innerHeight * .8 && box.bottom > 0) { const section = element.dataset.metricSection; viewed.add(section); lastSection = section; track('section_view', { section }); } }));
}
const dialog = document.createElement('aside'); dialog.className = 'measurement-notice'; dialog.setAttribute('aria-label', 'Preferências de medição');
dialog.innerHTML = '<p><strong>Podemos medir sua visita?</strong> Com sua autorização, registramos navegação, cliques e etapas dos formulários, sem os valores digitados. <a href="/privacidade/">Saiba mais</a>.</p><div><button type="button" data-measure-accept>Aceitar medição</button><button type="button" data-measure-refuse>Recusar</button></div>';
document.body.append(dialog);
const preferences = document.createElement('button'); preferences.type = 'button'; preferences.className = 'measurement-preferences'; preferences.textContent = 'Preferências de medição'; document.querySelector('footer')?.append(preferences);
preferences.onclick = () => { dialog.hidden = false; dialog.querySelector('button').focus(); };
function choose(allowed) {
  consent = allowed; write('localStorage', key, `${VERSION}:${allowed ? 'yes' : 'no'}`); dialog.hidden = true;
  if (allowed) start(); else { session = ''; active = 0; forms.clear(); clear('sessionStorage', 'rogplabs_session'); }
}
dialog.querySelector('[data-measure-accept]').onclick = () => choose(true);
dialog.querySelector('[data-measure-refuse]').onclick = () => choose(false);
const saved = read('localStorage', key); if (saved === `${VERSION}:yes`) { consent = true; dialog.hidden = true; start(); } else if (saved === `${VERSION}:no`) dialog.hidden = true;
addEventListener('storage', event => { if (event.key === key) { consent = event.newValue === `${VERSION}:yes`; if (consent) start(); else { session = ''; forms.clear(); clear('sessionStorage', 'rogplabs_session'); } } });
const sections = [...document.querySelectorAll('main > section, main > article, main > header')];
sections.forEach((element, index) => element.dataset.metricSection = `s${index + 1}`);
const observer = new IntersectionObserver(entries => {
  if (!consent) return;
  for (const entry of entries) if (entry.isIntersecting) { const section = entry.target.dataset.metricSection; lastSection = section; if (!viewed.has(section)) { viewed.add(section); track('section_view', { section }); } }
}, { rootMargin: '0px 0px -20% 0px', threshold: 0 });
sections.forEach(element => observer.observe(element));
document.querySelectorAll('header a, main a, main button, main summary, footer a').forEach((element, index) => {
  element.dataset.metricTarget = `c${index + 1}`;
  element.addEventListener('click', () => {
    let destination = 'internal';
    if (element instanceof HTMLAnchorElement) {
      if (element.protocol === 'mailto:') destination = 'email';
      else if (element.hostname !== location.hostname) destination = element.hostname === 'github.com' ? 'github' : ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(element.hostname) ? 'youtube' : 'external';
    }
    track('click', { target: element.dataset.metricTarget, destination, section: element.closest('[data-metric-section]')?.dataset.metricSection });
    if (element.dataset.filter) track('radar_filter', { filter: element.dataset.filter });
  });
});
function formName(form) { return form.hasAttribute('data-contact-form') ? 'contact' : form.hasAttribute('data-newsletter-form') ? 'newsletter' : 'request'; }
document.querySelectorAll('[data-contact-form], [data-newsletter-form], [data-request-form]').forEach(form => {
  form.addEventListener('focusin', event => {
    if (!consent || !(event.target instanceof HTMLElement)) return;
    const kind = formName(form), field = event.target.getAttribute('name'); let state = forms.get(form);
    if (!state) { state = { kind, field, completed: false, sent: new Set(), abandoned: false }; forms.set(form, state); track('form_start', { form: kind }); }
    if (field) state.field = field; state.abandoned = false;
    if (field && !state.sent.has(field)) { state.sent.add(field); track('form_field', { form: kind, field }); }
  });
  form.addEventListener('invalid', () => track('form_error', { form: formName(form), reason: 'validation' }), true);
});
document.addEventListener('rogplabs:form', event => {
  const { form, phase, reason } = event.detail || {}; if (!['submit', 'success', 'error'].includes(phase)) return;
  for (const state of forms.values()) if (state.kind === form && phase === 'success') state.completed = true;
  track(`form_${phase}`, { form, reason });
});
let scrollPending = false;
addEventListener('scroll', () => {
  if (scrollPending || !consent) return; scrollPending = true;
  requestAnimationFrame(() => { scrollPending = false; depth = Math.min(100, Math.round(100 * (scrollY + innerHeight) / document.documentElement.scrollHeight)); for (const milestone of [25, 50, 75, 100]) if (depth >= milestone && !depths.has(milestone)) { depths.add(milestone); track('scroll_depth', { depth: milestone }); } });
}, { passive: true });
setInterval(() => { accrue(); if (consent && !document.hidden && active >= 10) { track('engagement', { activeSeconds: Math.round(active), section: lastSection }); active = 0; } }, 15000);
function flush(reason) { if (!consent || !started) return; accrue(); track('page_exit', { reason, section: lastSection, depth, activeSeconds: Math.round(active) }); active = 0; for (const state of forms.values()) if (!state.completed && !state.abandoned) { track('form_abandon', { form: state.kind, field: state.field, reason }); state.abandoned = true; } }
document.addEventListener('visibilitychange', () => { if (document.hidden) flush('hidden'); else { last = performance.now(); wasVisible = true; for (const state of forms.values()) state.abandoned = false; } });
addEventListener('pagehide', () => { if (!document.hidden) flush('pagehide'); });
addEventListener('pageshow', event => { if (event.persisted) last = performance.now(); });
// Performance is sampled only after opt-in; no URLs or element text are collected.
let lcp = 0, cls = 0, inp = 0;
if ('PerformanceObserver' in window) {
  for (const [type, receive] of [['largest-contentful-paint', entry => { lcp = entry.startTime; }], ['layout-shift', entry => { if (!entry.hadRecentInput) cls += entry.value; }], ['event', entry => { if (entry.interactionId) inp = Math.max(inp, entry.duration); }]]) {
    try { new PerformanceObserver(list => { if (consent) list.getEntries().forEach(receive); }).observe({ type, buffered: false, ...(type === 'event' ? { durationThreshold: 40 } : {}) }); } catch { /* Unsupported browser metric. */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) for (const [metric, value] of [['lcp_observed', lcp], ['layout_shift_sum', cls], ['interaction_max', inp]]) if (value > 0) track('web_vital', { metric, value }); });
}
