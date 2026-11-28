// usage: node tools/render.mjs <outdir> <frames: "a-b" or "1,2,3"> [step] [scale] [quality]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir, spec, step = '1', scale = '1', qual = '0.93'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
const root = path.resolve('web');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.ttf': 'font/ttf' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0].split('#')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const W = Math.round(1080 * scale), H = Math.round(1920 * scale);
const pg = await b.newPage({ viewport: { width: W, height: H } });
pg.on('console', m => { const t = m.text(); if (!t.includes('GPU stall')) console.log('PAGE', t); }); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html#s=${scale}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 300000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const out = path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`);
  if (process.env.RESUME && fs.existsSync(out)) continue;
  const d = await pg.evaluate(([f, q]) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', q); }, [f, +qual]);
  fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); n++;
  if (n % 50 === 0) console.log(`${outdir}: ${n}/${frames.length}  ${((Date.now() - t0) / n / 1000).toFixed(2)} s/frame`);
}
console.log(`done ${n} frames, ${((Date.now() - t0) / Math.max(n,1) / 1000).toFixed(2)} s/frame`);
await b.close(); srv.close();
