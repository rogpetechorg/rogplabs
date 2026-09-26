import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(process.env.TEST_TOOLS_PACKAGE || '/tmp/tools/package.json');
const { chromium } = require('@playwright/test'); const axe = require('axe-core');
const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:18473';
const output = process.env.ARTIFACT_DIR || '/work/artifacts'; await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
const errors = [], events = [], failed = [];
try {
  const context = await browser.newContext(); const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/missing-test')) failed.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => { if (request.url().endsWith('/api/events')) events.push(JSON.parse(request.postData())); });
  for (const [width, height] of [[320,568],[360,800],[375,812],[390,844],[412,915],[768,1024],[1024,768],[1280,800],[1440,900]]) {
    await page.setViewportSize({ width, height }); await page.goto(base + '/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').count(), 1);
    if (!(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))) { await page.screenshot({path: `${output}/overflow-${width}.png`, fullPage:true}); console.log(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,100),parent:e.parentElement.className,right:e.getBoundingClientRect().right})).slice(0,20))); throw new Error(`Overflow ${width}`); }
    if ([390,1440].includes(width)) await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: true });
  }
  assert.equal(events.length, 0, 'No analytics before consent');
  await page.getByRole('button', { name: 'Recusar', exact: true }).click(); await page.getByRole('link', { name: 'Projetos', exact: true }).first().click(); await page.waitForLoadState('networkidle'); assert.equal(events.length, 0);
  await page.getByRole('button', { name: 'Preferências de medição', exact: true }).click(); await page.getByRole('button', { name: 'Aceitar medição', exact: true }).click(); await page.waitForTimeout(400);
  assert(events.some(e => e.name === 'page_view')); assert(events.some(e => e.name === 'section_view'));
  await page.goto(base + '/contato/', {waitUntil:'domcontentloaded'}); await page.locator('[data-contact-form]').waitFor();
  await page.addScriptTag({ content: axe.source }); const accessibility = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } }));
  await writeFile(`${output}/accessibility.json`, JSON.stringify(accessibility.violations, null, 2));
  assert.deepEqual(accessibility.violations.map(v => `${v.id}: ${v.nodes.length}`), []);
  const form = page.locator('[data-contact-form]'); await form.locator('[name=name]').fill('Teste de navegador'); await form.locator('[name=email]').fill('private-canary@example.com'); await form.locator('[name=company]').fill('Canary Private'); await form.locator('[name=interest]').selectOption('experiment'); await form.locator('[name=context]').fill('Contexto confidencial canary que nunca deve entrar em eventos.'); await form.locator('[name=consent]').check();
  await form.locator('button').click(); await page.getByText(/Recebemos seu contexto. Protocolo: LABS-/).waitFor();
  await page.waitForTimeout(400); assert(events.some(e => e.name === 'form_success' && e.properties.form === 'contact')); assert.equal(JSON.stringify(events).includes('canary'), false);
  await page.screenshot({ path: `${output}/contact-success.png`, fullPage: true });
  await page.getByRole('button', { name: 'Preferências de medição', exact: true }).click(); await page.getByRole('button', { name: 'Recusar', exact: true }).click(); const count = events.length;
  await page.goto(base + '/radar/'); await page.waitForLoadState('networkidle'); await page.locator('[data-filter=testar]').click(); await page.waitForTimeout(200); assert.equal(events.length, count);
  const map = {};
  const sitemap = await (await page.request.get(base + '/sitemap.xml')).text();
  for (const path of [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname)) { await page.goto(base + path); map[path] = { sections: await page.locator('[data-metric-section]').evaluateAll(nodes => nodes.map(node => ({section:node.dataset.metricSection,heading:node.querySelector('h1,h2')?.textContent.trim()}))), targets: await page.locator('[data-metric-target]').evaluateAll(nodes => nodes.map(node => ({ target: node.dataset.metricTarget, label: node.textContent.trim().replace(/\s+/g,' ').slice(0,100), href: node.getAttribute('href')?.split('?')[0] }))) }; }
  await writeFile(`${output}/click-map.json`, JSON.stringify(map, null, 2));
  assert.equal((await page.request.get(base + '/missing-test')).status(), 404);
  assert.equal((await page.request.get(base + '/llms.txt')).status(), 200);
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  const denied = await browser.newContext(); await denied.addInitScript(() => { for (const name of ['localStorage','sessionStorage']) Object.defineProperty(window, name, { get() { throw new Error('blocked'); } }); }); const p = await denied.newPage(); const deniedErrors = []; p.on('pageerror', e => deniedErrors.push(e.message)); await p.goto(base); await p.getByRole('button', { name: 'Aceitar medição', exact: true }).click(); assert.deepEqual(deniedErrors, []); await denied.close();
  console.log(JSON.stringify({ viewports: 9, journeys: ['consent','refusal','revocation','form','privacy','filter','storage-denied','404','SEO'], analyticsEvents: events.length, consoleErrors: errors.length, accessibilityViolations: accessibility.violations.length }));
} finally { await browser.close(); }
