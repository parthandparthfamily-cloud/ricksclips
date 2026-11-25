// node tools/stills.mjs <webdir> <outdir> <frames "a-b" | "1,2,3"> [query e.g. "s=0.5&story=story_tour"]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, web, outdir, spec, query = ''] = process.argv; fs.mkdirSync(outdir, { recursive: true });
const frames = []; for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b, st = 1] = part.split(/[-:]/).map(Number); for (let f = a; f <= b; f += st) frames.push(f); } else frames.push(+part); }
const root = path.resolve(web);
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.ttf') ? 'font/ttf' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => { if (!m.text().includes('GPU stall')) console.log('PAGE', m.text()); });
await pg.goto(`http://localhost:${srv.address().port}/index.html?${query}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 300000 });
if (await pg.evaluate(() => window.err)) { console.log('page error', await pg.evaluate(() => window.err)); process.exit(1); }
const t0 = Date.now();
for (const f of frames) { const out = path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`); if (process.env.RESUME && fs.existsSync(out)) continue;
  const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.9); }, f); fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); }
console.log(`done ${frames.length} frames, ${((Date.now() - t0) / frames.length / 1000).toFixed(2)} s/frame`); await b.close(); srv.close();
