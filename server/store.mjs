import { mkdir, readFile, readdir, writeFile, rename, unlink, link } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { UUID } from '../public/measurement-contract.js';
export class Store {
  constructor(root) { this.root = root; }
  async init() { for (const kind of ['leads', 'events']) await mkdir(join(this.root, kind), { recursive: true, mode: 0o700 }); }
  path(kind, id) { if (!['leads', 'events'].includes(kind) || !UUID.test(id)) throw new Error('invalid_key'); return join(this.root, kind, `${id}.json`); }
  async get(kind, id) { try { return JSON.parse(await readFile(this.path(kind, id), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } }
  async create(kind, record) {
    const path = this.path(kind, record.id), tmp = `${path}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(record), { mode: 0o600 });
    try { await link(tmp, path); return true; } catch (error) { if (error.code === 'EEXIST') return false; throw error; } finally { await unlink(tmp); }
  }
  async save(kind, record) { const path = this.path(kind, record.id), tmp = `${path}.${randomUUID()}.tmp`; await writeFile(tmp, JSON.stringify(record), { mode: 0o600 }); await rename(tmp, path); }
  async *records(kind) { for (const file of await readdir(join(this.root, kind))) if (file.endsWith('.json')) { const record = await this.get(kind, file.slice(0, -5)); if (record) yield record; } }
  async purge(now = Date.now()) { let removed = 0; for (const kind of ['leads', 'events']) for await (const record of this.records(kind)) if (record.state === 'delivered' && now - Date.parse(record.createdAt) > (kind === 'leads' ? 30 : 90) * 86400000) { await unlink(this.path(kind, record.id)); removed++; } return removed; }
}
