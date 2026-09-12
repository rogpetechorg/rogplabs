import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const index = resolve('dist/index.html');
const nginx = resolve('docker/nginx.conf');
if (!existsSync(index)) throw new Error('Build não gerou dist/index.html.');
const html = readFileSync(index, 'utf8');
for (const expected of ['rogpLabs', 'radar do laboratório', 'Pedir um vídeo', 'Cursos em desenvolvimento', 'video-request.yml', '/api/newsletter/subscribe', 'Confira seu e-mail para confirmar a inscrição.']) {
  if (!html.includes(expected)) throw new Error(`Conteúdo essencial ausente: ${expected}`);
}
if (!existsSync(nginx) || !readFileSync(nginx, 'utf8').includes('proxy_pass https://listmonk.rogpe.tech/api/public/subscription;')) {
  throw new Error('Proxy de inscrição da newsletter não configurado.');
}
console.log('Verificação da página inicial concluída.');
