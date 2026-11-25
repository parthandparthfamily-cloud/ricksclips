// GPU render on Windows: node render_pc.mjs frames 0-2994
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir = 'frames', spec = '0-2994'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
const [a, b] = spec.split('-').map(Number); const frames = []; for (let f = a; f <= b; f++) frames.push(f);
const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const ARGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
const BRAVE = [process.env['ProgramFiles'] + '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe', process.env['LOCALAPPDATA'] + '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'];
let br = null;
try { br = await chromium.launch({ channel: 'msedge', args: ARGS }); console.log('Using Microsoft Edge'); } catch (e) { console.log('Edge not available, trying Brave...'); }
for (const p of BRAVE) { if (br) break; if (fs.existsSync(p)) { try { br = await chromium.launch({ executablePath: p, args: ARGS }); console.log('Using Brave'); } catch (e) {} } }
if (!br) br = await chromium.launch({ args: ARGS });
const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html`);
await pg.waitForFunction(() => window.ready, null, { timeout: 180000 });
console.log('GPU:', await pg.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; }));
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const out = path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`);
  if (process.env.RESUME && fs.existsSync(out)) continue;
  const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, f);
  fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); n++;
  if (n % 100 === 0) console.log(`frame ${f}/${b}  ${((Date.now() - t0) / n / 1000).toFixed(2)} s/frame`);
}
console.log(`done ${n} frames`); await br.close(); srv.close();
