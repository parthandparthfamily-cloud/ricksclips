// usage: node tools/castsheet.mjs projects/<slug>/web out.jpg   (renders web/sheet.html)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, web, out] = process.argv; const root = path.resolve(web);
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.ttf') ? 'font/ttf' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 3000, height: 1700 } });
pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => console.log('PAGE', m.text()));
await pg.goto(`http://localhost:${srv.address().port}/sheet.html`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 60000 });
const err = await pg.evaluate(() => window.err); if (err) { console.log('page error', err); process.exit(1); }
await (await pg.$('#c')).screenshot({ path: out, type: 'jpeg', quality: 90 }); console.log('wrote', out); await b.close(); srv.close();
