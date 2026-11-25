// Exports your story from the browser for Blender.  node export.mjs <outdir> [first] [last]  ->  outdir/frames.json, outdir/cards/*.webp, outdir/tex/*.png
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir, a = '0', b = ''] = process.argv;
fs.mkdirSync(path.join(outdir, 'cards'), { recursive: true }); fs.mkdirSync(path.join(outdir, 'tex'), { recursive: true });
const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
let br;
for (const opt of [{ channel: 'msedge' }, { executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe' }, {}]) { try { br = await chromium.launch(opt); break; } catch (e) {} }
const pg = await br.newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/export.html`); await pg.waitForFunction(() => window.ready, null, { timeout: 120000 });
for (const n of await pg.evaluate(() => window.textureNames)) { const d = await pg.evaluate((n) => window.texture(n), n); fs.writeFileSync(path.join(outdir, 'tex', n + '.png'), Buffer.from(d.split(',')[1], 'base64')); }
const total = await pg.evaluate(() => window.TOTAL), f0 = +a, f1 = b === '' ? total - 1 : +b, frames = [];
for (let f = f0; f <= f1; f++) {
  const r = await pg.evaluate((f) => window.exportFrame(f), f);
  for (const [id, d] of r.newCards) fs.writeFileSync(path.join(outdir, 'cards', `c${id}.webp`), Buffer.from(d.split(',')[1], 'base64'));
  delete r.newCards; frames.push(r); if (f % 50 === 0) console.log('export', f);
}
fs.writeFileSync(path.join(outdir, 'frames.json'), JSON.stringify(frames));
console.log('exported', frames.length, 'frames,', fs.readdirSync(path.join(outdir, 'cards')).length, 'cards');
await br.close(); srv.close();
