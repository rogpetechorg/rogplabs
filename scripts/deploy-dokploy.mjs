import { execFileSync } from 'node:child_process';

const applicationId = process.env.DOKPLOY_PRODUCTION_APPLICATION_ID ?? 'Lc02EiOoY_ubDxNN453OO';
const baseUrl = (process.env.DOKPLOY_URL ?? 'https://dokploy.rogpe.tech').replace(/\/$/, '');

function getToken() {
  if (process.env.DOKPLOY_TOKEN) return process.env.DOKPLOY_TOKEN;
  if (process.platform === 'darwin') {
    try {
      return execFileSync('security', ['find-generic-password', '-s', 'dokploy.rogpe.tech', '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      // The error below describes the supported setup.
    }
  }
  throw new Error('DOKPLOY_TOKEN não foi encontrado. Defina a variável ou configure a credencial dokploy.rogpe.tech no Chaves do macOS.');
}

const token = getToken();
const response = await fetch(`${baseUrl}/api/application.deploy`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'x-api-key': token, 'Content-Type': 'application/json' },
  body: JSON.stringify({ applicationId }),
});

if (!response.ok) throw new Error(`Dokploy recusou o deploy: HTTP ${response.status}.`);
console.log('Deploy solicitado. Valide: https://rogplabs.rogpe.tech/healthz');
