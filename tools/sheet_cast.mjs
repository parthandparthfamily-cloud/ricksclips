import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve(process.argv[2]), page = process.argv[3], out = process.argv[4];
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 2400, height: 1300 } });
pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => console.log('PAGE', m.text()));
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction(() => window.ready, null, { timeout: 30000 });
await (await pg.$('canvas')).screenshot({ path: out, type: 'jpeg', quality: 90 }); await b.close(); srv.close();
