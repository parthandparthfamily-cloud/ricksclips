// node shot.mjs <page.html> <out.png>   (screenshots the #c canvas of a static page in web/)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, page, out] = process.argv; const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.ttf') ? 'font/ttf' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage(); pg.on('console', m => console.log('PAGE', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction(() => window.ready, null, { timeout: 60000 });
const d = await pg.evaluate(() => document.getElementById('c').toDataURL('image/png')); fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64'));
await b.close(); srv.close();
