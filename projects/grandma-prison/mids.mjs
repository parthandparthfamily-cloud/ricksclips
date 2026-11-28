import { SHOTS } from './web/story.js';
const k = +(process.argv[2] || 0.5); console.log(SHOTS.map(s => Math.round(s.a + (s.b - s.a) * k)).join(','));
