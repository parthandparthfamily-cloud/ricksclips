export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
const SH_SKIN = [
    0.96,
    0.86,
    0.84
];
const SH_CLOTH = [
    0.64,
    0.66,
    0.74
];
const SH_FELT = [
    0.62,
    0.62,
    0.7
];
const rad = (d)=>d * Math.PI / 180;
const clamp = (x, a, b)=>Math.max(a, Math.min(b, x));
export const mul = (c, m)=>{
    const n = parseInt(c.slice(1), 16);
    const ch = (v, k)=>Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
    return `#${ch(n >> 16 & 255, m[0])}${ch(n >> 8 & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c, k)=>mul(c, [
        k,
        k,
        k
    ]);
export const mix = (a, b, t)=>{
    const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    const ch = (s)=>Math.round((A >> s & 255) * (1 - t) + (B >> s & 255) * t).toString(16).padStart(2, "0");
    return `#${ch(16)}${ch(8)}${ch(0)}`;
};
const rnd = (seed, k)=>{
    const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
};
const rotPts = (pts, a, cx, cy)=>pts.map(([x, y])=>[
            cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
            cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)
        ]);
const rotAbout = (q, a, c)=>rotPts([
        q
    ], a, c[0], c[1])[0];
const lerp2 = (a, b, t)=>[
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t
    ];
const curve = (a, k, b, n = 10)=>{
    const c = [
        2 * k[0] - (a[0] + b[0]) / 2,
        2 * k[1] - (a[1] + b[1]) / 2
    ], out = [];
    for(let i = 0; i <= n; i++){
        const t = i / n, s = 1 - t;
        out.push([
            s * s * a[0] + 2 * s * t * c[0] + t * t * b[0],
            s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]
        ]);
    }
    return out;
};
export const RIFLEMAN = {
    jacket: "#357650",
    pants: "#3d4440",
    boots: INK,
    hat: "shako",
    belt: "#f1efe6",
    buttons: "#d9dde0",
    rifle: true
};
export const OFFICER = {
    ...RIFLEMAN,
    hat: "shako_tall",
    buttons: "#e8c45a",
    sash: "#c0353a",
    sword: true,
    moustache: "#4a3020",
    rifle: false,
    belt: null,
    build: "stout"
};
export const KID = {
    jacket: "#f08a2c",
    pants: "#3b5b9a",
    boots: "#f4f1ea",
    hat: "cap",
    cap: "#e2453c",
    build: "kid"
};
export const PARENT = {
    jacket: "#7b5ac9",
    pants: "#3b3f52",
    boots: "#5a3b2a",
    hat: "hair",
    hair: "#5a3b2a"
};
export const SKINS = [
    SKIN,
    "#f5c9a0",
    "#ecd0b6",
    "#c99067"
];
export const soldier = (v = 0, extra = {})=>{
    const o = {
        ...RIFLEMAN,
        skin: SKINS[v % 4]
    };
    if (v % 4 === 1) o.moustache = "#4a3426";
    if (v % 4 === 3) o.moustache = "#2a201a";
    return {
        ...o,
        ...extra
    };
};
export const townsfolk = (v = 0)=>{
    const coats = [
        "#3f6fb5",
        "#8c3b4a",
        "#5d7a3a",
        "#b5653f",
        "#2f5f6a",
        "#7b5ac9"
    ];
    const o = {
        jacket: coats[v % 6],
        pants: "#3b3f52",
        boots: "#4a3426",
        skin: SKINS[v % 4]
    };
    return v % 2 ? {
        ...o,
        hat: "bonnet",
        dress: [
            "#d9a441",
            "#c25a7a",
            "#5a8fc2"
        ][v % 3]
    } : {
        ...o,
        hat: "tophat"
    };
};
export class Pen {
    g;
    ol = 12;
    rot = null;
    constructor(g){
        this.g = g;
    }
    P(x, y) {
        if (!this.rot) return [
            x,
            y
        ];
        const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
        return [
            cx + (x - cx) * c - (y - cy) * s + dx,
            cy + (x - cx) * s + (y - cy) * c + dy
        ];
    }
    path(pts, close) {
        const g = this.g;
        g.beginPath();
        pts.forEach((p, i)=>{
            const [x, y] = this.P(p[0], p[1]);
            if (i) g.lineTo(x, y);
            else g.moveTo(x, y);
        });
        if (close) g.closePath();
    }
    poly(pts, fill, ol) {
        const g = this.g, w = ol ?? this.ol;
        this.path(pts, true);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (w) {
            g.lineWidth = w;
            g.strokeStyle = INK;
            g.lineJoin = "round";
            g.stroke();
        }
    }
    ell(cx, cy, rx, ry, fill, ol, a0 = 0, a1 = 360, rot = 0) {
        this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
    }
    line(pts, fill, w, ink = true) {
        const g = this.g;
        g.lineCap = "round";
        g.lineJoin = "round";
        if (ink) {
            this.path(pts, false);
            g.strokeStyle = INK;
            g.lineWidth = w + 2 * this.ol * 0.9;
            g.stroke();
        }
        this.path(pts, false);
        g.strokeStyle = fill;
        g.lineWidth = w;
        g.stroke();
    }
    stroke(pts, w, fill = INK) {
        const g = this.g;
        g.lineCap = "round";
        g.lineJoin = "round";
        this.path(pts, false);
        g.strokeStyle = fill;
        g.lineWidth = w;
        g.stroke();
    }
    arc(cx, cy, rx, ry, a0, a1, w, fill = INK) {
        const pts = [];
        for(let i = 0; i <= 24; i++)pts.push([
            cx + rx * Math.cos(rad(a0 + (a1 - a0) * i / 24)),
            cy + ry * Math.sin(rad(a0 + (a1 - a0) * i / 24))
        ]);
        this.stroke(pts, w, fill);
    }
    dot(cx, cy, r, fill = INK) {
        const [x, y] = this.P(cx, cy);
        this.g.beginPath();
        this.g.arc(x, y, r, 0, Math.PI * 2);
        this.g.fillStyle = fill;
        this.g.fill();
    }
    clip(pts, fn) {
        const g = this.g;
        g.save();
        this.path(pts, true);
        g.clip();
        fn();
        g.restore();
    }
    shadedFill(pts, base, shadow, light, R, shift = 0.45, r0 = 1.05, r1 = 1.25) {
        const g = this.g, n = pts.length;
        let cx = 0, cy = 0;
        for (const [x, y] of pts){
            cx += x / n;
            cy += y / n;
        }
        const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
        const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
        gr.addColorStop(0, base);
        gr.addColorStop(r0 / r1, base);
        gr.addColorStop(1, shadow);
        this.path(pts, true);
        g.fillStyle = gr;
        g.fill();
    }
    gradFill(pts, base, shadow, light, flat = 0.22) {
        const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
        let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
        for (const [x, y] of pts){
            cx += x / n;
            cy += y / n;
            const d = x * dx + y * dy;
            lo = Math.min(lo, d);
            hi = Math.max(hi, d);
        }
        const dc = cx * dx + cy * dy;
        const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
        const gr = g.createLinearGradient(ax, ay, bx, by);
        gr.addColorStop(0, base);
        gr.addColorStop(flat, base);
        gr.addColorStop(1, shadow);
        this.path(pts, true);
        g.fillStyle = gr;
        g.fill();
    }
    inkRing(pts, w0, thick, k = 0.45, col = INK) {
        const n = pts.length;
        let cx = 0, cy = 0;
        for (const [x, y] of pts){
            cx += x / n;
            cy += y / n;
        }
        const out = [], inn = [];
        pts.forEach((q, i)=>{
            const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
            let nx = b[1] - a[1], ny = a[0] - b[0];
            const l = Math.hypot(nx, ny) || 1;
            nx /= l;
            ny /= l;
            const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
            out.push([
                q[0] + nx * h,
                q[1] + ny * h
            ]);
            inn.push([
                q[0] - nx * h,
                q[1] - ny * h
            ]);
        });
        const g = this.g;
        const trace = (r)=>{
            r.forEach(([x0, y0], i)=>{
                const [x, y] = this.P(x0, y0);
                if (i) g.lineTo(x, y);
                else g.moveTo(x, y);
            });
            g.closePath();
        };
        g.beginPath();
        trace(out);
        trace(inn.reverse());
        g.fillStyle = col;
        g.fill("evenodd");
    }
    band(pts, fill, w, rim, cap = "butt") {
        const g = this.g;
        g.lineCap = cap;
        g.lineJoin = "round";
        this.path(pts, false);
        g.strokeStyle = INK;
        g.lineWidth = w + 2 * rim;
        g.stroke();
        this.path(pts, false);
        g.strokeStyle = fill;
        g.lineWidth = w;
        g.stroke();
        g.lineCap = "round";
    }
}
const ellPts = (cx, cy, rx, ry, a0 = 0, a1 = 360, rot = 0, n = 48)=>{
    const r = rad(rot), pts = [];
    for(let i = 0; i <= n; i++){
        const a = rad(a0 + (a1 - a0) * i / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
        pts.push([
            cx + x * Math.cos(r) - y * Math.sin(r),
            cy + x * Math.sin(r) + y * Math.cos(r)
        ]);
    }
    return pts;
};
const rrect = (x0, y0, x1, y1, r, n = 8)=>{
    const pts = [];
    for (const [cx, cy, a] of [
        [
            x1 - r,
            y0 + r,
            -90
        ],
        [
            x1 - r,
            y1 - r,
            0
        ],
        [
            x0 + r,
            y1 - r,
            90
        ],
        [
            x0 + r,
            y0 + r,
            180
        ]
    ])for(let i = 0; i <= n; i++)pts.push([
        cx + r * Math.cos(rad(a + 90 * i / n)),
        cy + r * Math.sin(rad(a + 90 * i / n))
    ]);
    return pts;
};
const taper = (p, a, b, wa, wb, col = INK)=>{
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    p.poly([
        [
            a[0] + nx * wa / 2,
            a[1] + ny * wa / 2
        ],
        [
            b[0] + nx * wb / 2,
            b[1] + ny * wb / 2
        ],
        [
            b[0] - nx * wb / 2,
            b[1] - ny * wb / 2
        ],
        [
            a[0] - nx * wa / 2,
            a[1] - ny * wa / 2
        ]
    ], col, 0);
    p.dot(a[0], a[1], wa / 2, col);
    p.dot(b[0], b[1], wb / 2, col);
};
export const blobPts = (cx, cy, B, n = 72)=>{
    const ph = [
        rnd(B.seed, 11),
        rnd(B.seed, 12),
        rnd(B.seed, 13)
    ].map((v)=>v * Math.PI * 2);
    const pts = [];
    for(let i = 0; i < n; i++){
        const t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
        let X = Math.sign(c) * Math.abs(c) ** e;
        const Y = Math.sign(s) * Math.abs(s) ** e;
        X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
        const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
        const x = B.a * X * r, y = B.b * Y * r;
        pts.push([
            cx + x * Math.cos(B.rot) - y * Math.sin(B.rot),
            cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)
        ]);
    }
    return pts;
};
export const headBlob = (seed, a = 118, facing = 0)=>({
        a,
        b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
        nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5),
        nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
        egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
        asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
        rot: rad(8 * (rnd(seed, 7) - 0.5)),
        noise: 0.008,
        seed
    });
export const thickAngle = (light)=>Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);
const FACE = {
    neutral: {
        eye: [
            "lid",
            "lid"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "dash"
    },
    stern: {
        eye: [
            "lid",
            "lid"
        ],
        brow: [
            3,
            -2
        ],
        mouth: "frown"
    },
    grin: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            -3,
            -3
        ],
        mouth: "grin"
    },
    laugh: {
        eye: [
            "squeeze",
            "squeeze"
        ],
        brow: [
            -4,
            -4
        ],
        mouth: "laugh"
    },
    whistle: {
        eye: [
            "dash",
            "dash"
        ],
        brow: [
            -2,
            -4
        ],
        mouth: "o"
    },
    nervous: {
        eye: [
            "small",
            "small"
        ],
        brow: [
            -3,
            2
        ],
        mouth: "wave"
    },
    shock: {
        eye: [
            "shock",
            "shock"
        ],
        brow: [
            -7,
            -6
        ],
        mouth: "O"
    },
    relief: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            -2,
            1
        ],
        mouth: "smileWide"
    },
    relief_open: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            -2,
            1
        ],
        mouth: "grin"
    },
    dazed: {
        eye: [
            "spiral",
            "spiral"
        ],
        brow: [
            -3,
            2
        ],
        mouth: "wave"
    },
    pained: {
        eye: [
            "squeeze",
            "lid"
        ],
        brow: [
            -3,
            2
        ],
        mouth: "teeth"
    },
    smile: {
        eye: [
            "dot",
            "dot"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "smirk"
    },
    smile_closed: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "smile"
    },
    lick: {
        eye: [
            "dot",
            "dot"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "lick"
    }
};
const halfLid = (k)=>k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k;
const eyeKind = (k, lid)=>lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b)=>b === true ? 1 : Number(b) || 0;
const eye = (p, kind, x, ey, u, side, look, skin)=>{
    const lx = x + look * 3 * u, lw = 3.8 * u;
    switch(kind){
        case "dot":
            p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0);
            break;
        case "small":
            p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0);
            break;
        case "lid":
            p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180);
            p.stroke([
                [
                    x - 9 * u,
                    ey - u
                ],
                [
                    x + 9 * u,
                    ey - u
                ]
            ], lw);
            break;
        case "slit":
            p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180);
            p.stroke([
                [
                    x - 9 * u,
                    ey
                ],
                [
                    x + 9 * u,
                    ey
                ]
            ], lw);
            break;
        case "happy":
            p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw);
            break;
        case "dash":
            p.stroke([
                [
                    x - 8.5 * u,
                    ey
                ],
                [
                    x + 8.5 * u,
                    ey
                ]
            ], lw);
            break;
        case "squeeze":
            p.stroke([
                [
                    x + 6 * u * side,
                    ey - 5 * u
                ],
                [
                    x - 6 * u * side,
                    ey
                ],
                [
                    x + 6 * u * side,
                    ey + 5 * u
                ]
            ], lw);
            break;
        case "shock":
        case "shockHalf":
            p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u);
            p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
            if (kind === "shockHalf") {
                p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360);
                p.stroke([
                    [
                        x - 11 * u,
                        ey
                    ],
                    [
                        x + 11 * u,
                        ey
                    ]
                ], 2.6 * u);
            }
            break;
        default:
            {
                const s = [];
                for(let t = 1; t < 15; t++)s.push([
                    x + Math.cos(t * 0.9) * t * 0.55 * u,
                    ey + Math.sin(t * 0.9) * t * 0.55 * u
                ]);
                p.stroke(s, 2.4 * u);
            }
    }
};
const dmouth = (p, mx, y, rx, ry, u, tongue = false)=>{
    p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
    p.clip([
        [
            mx - rx,
            y
        ],
        [
            mx + rx,
            y
        ],
        [
            mx + rx,
            y + 3 * u
        ],
        [
            mx - rx,
            y + 3 * u
        ]
    ], ()=>p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
    if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
    p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};
const mouth = (p, kind, mx, my, u, k = 1)=>{
    const mw = 4 * u;
    switch(kind){
        case "dash":
            p.stroke([
                [
                    mx - 5.5 * u * k,
                    my
                ],
                [
                    mx + 5.5 * u * k,
                    my - 0.8 * u
                ]
            ], mw);
            break;
        case "frown":
            p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw);
            break;
        case "smirk":
            p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw);
            break;
        case "smile":
            p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw);
            break;
        case "smileWide":
            p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw);
            break;
        case "grin":
            dmouth(p, mx, my - u, 12 * u * k, 8 * u, u);
            break;
        case "laugh":
            dmouth(p, mx, my, 16 * u * k, 11 * u, u, true);
            break;
        case "o":
            p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u);
            break;
        case "O":
            p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u);
            break;
        case "wave":
            {
                const s = [];
                for(let i = 0; i <= 12; i++)s.push([
                    mx - 9 * u * k + i * 1.5 * u * k,
                    my + 1.5 * u * Math.sin(i * 1.3)
                ]);
                p.stroke(s, 3 * u);
                break;
            }
        case "teeth":
            p.poly([
                [
                    mx - 12 * u * k,
                    my - 4 * u
                ],
                [
                    mx + 12 * u * k,
                    my - 4 * u
                ],
                [
                    mx + 11 * u * k,
                    my + 4 * u
                ],
                [
                    mx - 11 * u * k,
                    my + 4 * u
                ]
            ], WHITE, 3 * u);
            for (const j of [
                -1,
                0,
                1
            ])p.stroke([
                [
                    mx + j * 6 * u * k,
                    my - 4 * u
                ],
                [
                    mx + j * 6 * u * k,
                    my + 4 * u
                ]
            ], 1.5 * u);
            break;
        case "lick":
            p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw);
            p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u);
            break;
    }
};
const faceFront = (p, cx, cy, W, expr, facing, look, lid, brim, skin, moustache, stout = false)=>{
    const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
    const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
    for (const side of [
        -1,
        1
    ]){
        const x = fx + side * ex;
        const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
        eye(p, kind, x, ey, u, side, look, skin);
        const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
        if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
        else taper(p, [
            x - side * 8.5 * u,
            by + dI * u
        ], [
            x + side * 8.5 * u,
            by + dO * u
        ], 5 * u, 2.5 * u);
    }
    const mx = cx + 8 * u * facing, my = cy + 20 * u;
    mouth(p, F.mouth, mx, my, u);
    if (moustache) for (const s of [
        -1,
        1
    ])taper(p, [
        mx + s * 1.5 * u,
        cy + 12.5 * u
    ], [
        mx + s * (stout ? 19 : 15) * u,
        cy + (stout ? 10.5 : 15) * u
    ], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
    if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};
const faceSide = (p, hx, hy, W, expr, lid, brim, skin, moustache, stout = false)=>{
    const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
    const kind = eyeKind(F.eye[1], lid);
    eye(p, kind, ex, ey, u, 1, 0.6, skin);
    const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
    if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [
        ex + 8 * u,
        by + dI * u
    ], [
        ex - 7 * u,
        by - u + dO * u
    ], 5 * u, 2.5 * u);
    p.stroke([
        [
            hx + 44 * u,
            hy + 4 * u
        ],
        [
            hx + 47.5 * u,
            hy + 9 * u
        ],
        [
            hx + 43 * u,
            hy + 10 * u
        ]
    ], 3 * u);
    mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
    if (moustache) taper(p, [
        hx + 41 * u,
        hy + 13.5 * u
    ], [
        hx + 25 * u,
        hy + (stout ? 11.5 : 16) * u
    ], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
    if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
const hatBehind = (p, o, H, cx, hc, light, thick, ow, side)=>{
    if (o.hat !== "bonnet") return;
    const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, {
        ...H,
        a: H.a * 1.17,
        b: H.b * 1.13,
        asym: 0,
        egg: 0.04,
        seed: H.seed + 3
    });
    p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
    p.inkRing(bb, ow * 0.85, thick);
};
const hatOn = (p, o, hp, H, cx, hc, light, seed, facing, side)=>{
    const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
    const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5));
    const R = (pts)=>rotPts(pts, a, cx, hc);
    const sag = (yb, wb)=>{
        const base = [];
        for(let i = 0; i <= 12; i++){
            const t = i / 12;
            base.push([
                cx + wb * (2 * t - 1),
                yb + 3 * u * (1 - (2 * t - 1) ** 2)
            ]);
        }
        return base;
    };
    if (o.hat === "shako" || o.hat === "shako_tall") {
        const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
        const body = R([
            ...sag(yb, wb).reverse(),
            [
                cx - wt,
                yb - ht
            ],
            [
                cx + wt,
                yb - ht
            ]
        ]);
        p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
        if (tall) p.clip(body, ()=>p.band(R([
                [
                    cx - wt - 5 * u,
                    yb - ht + 0.07 * HH
                ],
                [
                    cx + wt + 5 * u,
                    yb - ht + 0.07 * HH
                ]
            ]), "#e8c45a", 0.06 * HH, 1.5 * u));
        p.poly(body, null, ow);
        const deg = a * 180 / Math.PI;
        if (side) {
            p.poly(R([
                [
                    cx + 36 * u,
                    yb - 1 * u
                ],
                [
                    cx + 60 * u,
                    yb + 8 * u
                ],
                [
                    cx + 34 * u,
                    yb + 6 * u
                ]
            ]), "#16171b", 2.5 * u);
            const [tx, ty] = R([
                [
                    cx + 24 * u,
                    yb - ht - 6 * u
                ]
            ])[0];
            p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
        } else {
            const [px, py] = R([
                [
                    cx + 3 * u * facing,
                    yb + 3 * u
                ]
            ])[0];
            p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg);
            const [bx, by] = R([
                [
                    cx,
                    yb - 0.45 * ht
                ]
            ])[0];
            p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg);
            p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
            const [tx, ty] = R([
                [
                    cx,
                    yb - ht - 6 * u
                ]
            ])[0];
            p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
        }
    } else if (o.hat === "cap" || o.hat === "hair") {
        const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
        const keep = (x, y)=>y < cut || side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b;
        const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i)=>keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
        const arc = [
            ...hp.slice(startIdx),
            ...hp.slice(0, startIdx)
        ].filter(([x, y])=>keep(x, y)).map(([x, y])=>[
                cx + (x - cx) * 1.03,
                hc + (y - hc) * 1.03
            ]);
        if (arc.length < 3) return;
        if (o.hat === "hair") {
            const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
            for(let i = 1; i < 6; i++)arc.push([
                x0 + (x1 - x0) * i / 6,
                y0 + (y1 - y0) * i / 6 + (i % 2 ? 4 * u : 0)
            ]);
        }
        const col = o.hat === "cap" ? o.cap : o.hair;
        p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
        p.poly(arc, null, ow);
        if (o.hat === "hair") {
            const s = side ? -1 : facing || 1;
            p.stroke([
                [
                    cx + s * 10 * u,
                    cut - 30 * u
                ],
                [
                    cx + s * 2 * u,
                    cut - 12 * u
                ]
            ], 1.2 * u);
        }
        if (o.hat === "cap") {
            const deg = a * 180 / Math.PI;
            if (side) p.poly(R([
                [
                    cx + 40 * u,
                    cut - 2 * u
                ],
                [
                    cx + 74 * u,
                    cut + 4 * u
                ],
                [
                    cx + 40 * u,
                    cut + 6 * u
                ]
            ]), shade(col, 0.8), ow);
            else {
                const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([
                    [
                        cx + s * 4 * u,
                        cut + 1.5 * u
                    ]
                ])[0];
                p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
            }
        }
    } else if (o.hat === "tophat") {
        const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
        const body = R([
            ...sag(yb, wb).reverse(),
            [
                cx - wt,
                yb - ht
            ],
            [
                cx + wt,
                yb - ht
            ]
        ]);
        p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
        p.clip(body, ()=>p.band(R([
                [
                    cx - wt - 4 * u,
                    yb - 0.13 * HH
                ],
                [
                    cx + wt + 4 * u,
                    yb - 0.13 * HH
                ]
            ]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
        p.poly(body, null, ow);
        const [bx, by] = R([
            [
                cx,
                yb + 1 * u
            ]
        ])[0];
        p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, a * 180 / Math.PI);
    } else if (o.hat === "bonnet") {
        const [bx, by] = R([
            [
                cx + (side ? 6 * u : 0),
                crown + 0.16 * HH
            ]
        ])[0];
        p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
        p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
        const cy = hc + H.b * 0.98;
        p.stroke([
            [
                cx - 14 * u,
                cy - 4 * u
            ],
            [
                cx,
                cy + 2 * u
            ],
            [
                cx + 14 * u,
                cy - 4 * u
            ]
        ], 2 * u, BONNET_BRIM);
    }
};
const BUILD = {
    adult: {
        a: 118,
        torso: 1.1,
        legs: 1.4,
        tw: 0.8
    },
    stout: {
        a: 118,
        torso: 1.15,
        legs: 1.32,
        tw: 0.92
    },
    kid: {
        a: 112,
        torso: 0.85,
        legs: 1.0,
        tw: 0.72
    }
};
const footStroke = (p, a, b, w, col)=>{
    if (col !== INK) p.stroke([
        a,
        b
    ], w + 3, INK);
    p.stroke([
        a,
        b
    ], w, col);
};
export const bodyFront = (p, o, opts)=>{
    const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave, light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
    const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
    const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
    const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
    const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
    const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
    const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
    const thick = thickAngle(light), ow = 5 * u;
    const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
    const legW = 5.8 * u, footW = 7.5 * u;
    p.rot = null;
    if (mode === "sit") {
        for (const side of [
            -1,
            1
        ]){
            const h = [
                300 + side * 15 * u,
                hipY
            ], k = [
                300 + side * 36 * u,
                hipY + 0.2 * HH
            ], f = [
                300 + side * 44 * u,
                sole - 8 * u
            ];
            p.stroke(curve(h, k, f), legW, legCol);
            footStroke(p, [
                f[0] - side * 2 * u,
                f[1]
            ], [
                f[0] + side * 12 * u,
                f[1] - 5 * u
            ], footW, footCol);
        }
    } else if (mode === "fall") {
        const legs = [
            [
                [
                    300 - 15 * u,
                    hipY
                ],
                [
                    300 - 46 * u,
                    hipY + 0.5 * HH
                ],
                [
                    300 - 70 * u,
                    hipY + 0.72 * HH
                ]
            ],
            [
                [
                    300 + 15 * u,
                    hipY
                ],
                [
                    300 + 50 * u,
                    hipY + 0.45 * HH
                ],
                [
                    300 + 76 * u,
                    hipY + 0.22 * HH
                ]
            ]
        ];
        legs.forEach(([h, k, f], i)=>{
            p.stroke(curve(h, k, f), legW, legCol);
            footStroke(p, f, [
                f[0] + (i ? 14 : -14) * u,
                f[1] + (i ? -6 : 4) * u
            ], footW, footCol);
        });
    } else if (o.dress) {
        for (const side of [
            -1,
            1
        ]){
            const fx = 300 + side * 12 * u, fy = sole - 4 * u;
            p.stroke([
                [
                    fx,
                    sole - 0.4 * HH
                ],
                [
                    fx + side * u,
                    fy
                ]
            ], legW, legCol);
            footStroke(p, [
                fx - side * 3 * u,
                fy
            ], [
                fx + side * 12 * u,
                fy + u
            ], footW, footCol);
        }
    } else {
        const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
        for (const [side, ph] of [
            [
                -1,
                0
            ],
            [
                1,
                0.5
            ]
        ]){
            const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
            const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
            const k = [
                (hx + fx) / 2 + side * (1.5 * u + up * 0.16),
                (hipY + fy) / 2 - up * 0.08
            ];
            p.stroke(curve([
                hx,
                hipY
            ], k, [
                fx,
                fy
            ]), legW, legCol);
            footStroke(p, [
                fx - side * 3 * u,
                fy
            ], [
                fx + side * 13 * u,
                fy + 0.5 * u
            ], footW, footCol);
        }
    }
    const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
    const A = tilt + sway;
    p.rot = A ? [
        rad(A),
        300,
        hipY
    ] : null;
    const dress = !!o.dress && mode !== "sit" && mode !== "fall";
    const T = {
        a: Bd.tw / 2 * W / 1.06,
        b: 0.5 * (torsoBot - (chin - 0.25 * HH)),
        nTop: 2.2,
        nBot: 2.6,
        egg: o.build === "stout" ? 0.17 : 0.12,
        asym: 0.04 * facing,
        rot: 0,
        noise: 0.006,
        seed: seed + 7
    };
    const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
    const sh = (side)=>[
            tcx + side * 0.85 * T.a,
            chin + 0.12 * HH
        ];
    const hang = (side, fwd)=>{
        const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
        const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
        return [
            S,
            [
                ex,
                S[1] + 0.48 * HH
            ],
            [
                hx,
                chin + 1.04 * HH - Math.abs(fwd) * 9 * u
            ]
        ];
    };
    const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
    const R0 = [
        300 + 47 * u,
        torsoBot + 0.12 * HH
    ], R1 = [
        300 + 64 * u,
        crown - 0.32 * HH
    ];
    const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
    const arms = [];
    if (mode === "sit") for (const side of [
        -1,
        1
    ])arms.push({
        pts: [
            sh(side),
            [
                tcx + side * (1.1 * T.a + 6 * u),
                sh(side)[1] + 0.4 * HH
            ],
            [
                tcx + side * (1.2 * T.a + 10 * u),
                torsoBot + 0.04 * HH
            ]
        ],
        front: false
    });
    else if (mode === "fall") for (const side of [
        -1,
        1
    ])arms.push({
        pts: [
            sh(side),
            [
                tcx + side * (1.15 * T.a + 12 * u),
                sh(side)[1] - 0.25 * HH
            ],
            [
                tcx + side * (1.3 * T.a + 24 * u),
                sh(side)[1] - 0.68 * HH
            ]
        ],
        front: false
    });
    else {
        arms.push({
            pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw),
            front: false
        });
        if (rifle) {
            const G = lerp2(R0, R1, 0.1);
            arms.push({
                pts: [
                    sh(1),
                    [
                        tcx + 1.12 * T.a + 5 * u,
                        sh(1)[1] + 0.45 * HH
                    ],
                    G
                ],
                front: false
            });
        } else if (wave !== undefined) {
            const S = sh(1);
            arms.push({
                pts: [
                    S,
                    [
                        tcx + 1.1 * T.a + 10 * u + 3 * u * wave,
                        S[1] - 0.22 * HH
                    ],
                    [
                        tcx + 1.18 * T.a + 16 * u + 12 * u * wave,
                        S[1] - 0.6 * HH
                    ]
                ],
                front: false
            });
        } else if (prop === "icecream") {
            const S = sh(1);
            arms.push({
                pts: [
                    S,
                    [
                        tcx + 1.05 * T.a + 4 * u,
                        S[1] + 0.45 * HH
                    ],
                    [
                        tcx + 0.5 * T.a,
                        S[1] + 0.4 * HH
                    ]
                ],
                front: true
            });
        } else if (Array.isArray(prop)) {
            const S = sh(1), k = clamp(prop[1], 0, 1);
            const E = lerp2([
                tcx + 1.1 * T.a + 10 * u,
                S[1] - 0.15 * HH
            ], [
                tcx + 1.2 * T.a + 10 * u,
                S[1] + 0.3 * HH
            ], k);
            const Hd = lerp2([
                tcx + 1.15 * T.a + 14 * u,
                S[1] - 0.55 * HH
            ], [
                tcx + 1.45 * T.a + 22 * u,
                S[1] + 0.35 * HH
            ], k);
            arms.push({
                pts: [
                    S,
                    E,
                    Hd
                ],
                front: true
            });
        } else arms.push({
            pts: hang(1, sw),
            front: false
        });
    }
    const drawArm = (a)=>{
        p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
        p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u);
    };
    if (rifle) {
        p.band([
            R0,
            R1
        ], "#7a4b2a", 5 * u, 1.5 * u, "round");
        p.band([
            lerp2(R0, R1, 0.6),
            R1
        ], "#8d949c", 2.4 * u, 1.2 * u, "round");
    }
    if (o.sword && mode !== "sit") {
        const s0 = [
            tcx - 0.75 * T.a,
            torsoBot - 0.2 * HH
        ];
        p.band([
            s0,
            [
                s0[0] - Math.sin(rad(25)) * 0.8 * HH,
                s0[1] + Math.cos(rad(25)) * 0.8 * HH
            ]
        ], "#c9ccd2", 3 * u, 1.2 * u, "round");
    }
    for (const a of arms)if (!a.front) drawArm(a);
    if (dress) {
        const D = {
            a: 0.5 * W * 0.98,
            b: 0.5 * (sole - 0.35 * HH - (chin - 0.2 * HH)),
            nTop: 2.0,
            nBot: 3.0,
            egg: 0.35,
            asym: 0.03 * facing,
            rot: 0,
            noise: 0.006,
            seed: seed + 9
        };
        const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
        p.gradFill(dp, o.dress, mul(o.dress, SH_CLOTH), light);
        p.inkRing(dp, ow, thick);
        const Sw = {
            a: 0.37 * W,
            b: 0.3 * HH,
            nTop: 2.2,
            nBot: 2.4,
            egg: 0.1,
            asym: 0,
            rot: 0,
            noise: 0.006,
            seed: seed + 8
        };
        const sp = blobPts(300, chin + 0.12 * HH, Sw);
        p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
        p.inkRing(sp, ow * 0.9, thick);
    } else {
        p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
        p.clip(tp, ()=>{
            if (o.belt) {
                for (const s of [
                    -1,
                    1
                ])p.band([
                    [
                        tcx - s * 0.75 * T.a,
                        chin - 0.05 * HH
                    ],
                    [
                        tcx + s * 0.8 * T.a,
                        torsoBot - 0.1 * HH
                    ]
                ], o.belt, 5.5 * u, 1.8 * u);
                const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
                p.poly([
                    [
                        xc - 3.5 * u,
                        yc - 3.5 * u
                    ],
                    [
                        xc + 3.5 * u,
                        yc - 3.5 * u
                    ],
                    [
                        xc + 3.5 * u,
                        yc + 3.5 * u
                    ],
                    [
                        xc - 3.5 * u,
                        yc + 3.5 * u
                    ]
                ], "#d9dde0", 1.5 * u);
            }
            if (o.sash) p.band([
                [
                    tcx - 1.3 * T.a,
                    torsoBot - 0.32 * HH
                ],
                [
                    tcx + 1.3 * T.a,
                    torsoBot - 0.32 * HH
                ]
            ], o.sash, 0.13 * HH, 1.8 * u);
            for(let i = 0; i < 4; i++){
                const y = chin + 0.12 * HH + i * 0.2 * HH;
                if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
                p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK);
                p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
            }
        });
        if (o.sash) {
            const s = facing || 1;
            p.poly([
                [
                    tcx + s * 0.55 * T.a,
                    torsoBot - 0.3 * HH
                ],
                [
                    tcx + s * 0.75 * T.a,
                    torsoBot + 0.05 * HH
                ],
                [
                    tcx + s * 0.45 * T.a,
                    torsoBot + 0.02 * HH
                ]
            ], o.sash, 1.6 * u);
        }
        p.inkRing(tp, ow, thick);
    }
    for (const a of arms)if (a.front) {
        drawArm(a);
        const [hx, hy] = a.pts[2];
        if (prop === "icecream") {
            p.poly([
                [
                    hx - 8 * u,
                    hy - 12 * u
                ],
                [
                    hx + 8 * u,
                    hy - 12 * u
                ],
                [
                    hx,
                    hy + 7 * u
                ]
            ], "#e0a35a", 1.8 * u);
            p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
            p.dot(hx, hy, 5.5 * u);
        } else if (Array.isArray(prop)) {
            const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
            const Rh = (pts)=>rotPts(pts, ang, hx, hy);
            p.band(Rh([
                [
                    hx,
                    hy + 12 * u
                ],
                [
                    hx,
                    hy - 44 * u
                ]
            ]), "#8a5a34", 5 * u, 1.5 * u, "round");
            p.poly(Rh([
                [
                    hx - 12 * u,
                    hy - 58 * u
                ],
                [
                    hx + 20 * u,
                    hy - 58 * u
                ],
                [
                    hx + 20 * u,
                    hy - 42 * u
                ],
                [
                    hx - 12 * u,
                    hy - 42 * u
                ]
            ]), "#7d848c", 2.2 * u);
            p.dot(hx, hy, 5.5 * u);
        }
    }
    if (prop === "shako") {
        const [hx, hy] = arms[0].pts[2];
        p.poly([
            [
                hx - 14 * u,
                hy + 3 * u
            ],
            [
                hx + 14 * u,
                hy + 3 * u
            ],
            [
                hx + 16 * u,
                hy + 30 * u
            ],
            [
                hx - 16 * u,
                hy + 30 * u
            ]
        ], "#3a3d47", 2.2 * u);
        p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
        p.dot(hx, hy, 5.5 * u);
    }
    const Ah = A + headTilt, [cpx, cpy] = rotAbout([
        300,
        chin
    ], rad(A), [
        300,
        hipY
    ]);
    p.rot = Ah ? [
        rad(Ah),
        300,
        chin,
        cpx - 300,
        cpy - chin
    ] : null;
    hatBehind(p, o, H, 300, hc, light, thick, ow, false);
    const hp = blobPts(300, hc, H);
    p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
    p.inkRing(hp, ow, thick);
    hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
    const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
    faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
    p.rot = null;
};
const ik = (hip, ank, l1, l2)=>{
    const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
    const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
    return [
        hip[0] + l1 * Math.cos(k),
        hip[1] + l1 * Math.sin(k)
    ];
};
const SWING_HIP = 733;
export const bodySide = (p, o, opts)=>{
    const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
    const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
    const H = {
        ...headBlob(seed, Bd.a, 1),
        asym: 0.12,
        rot: rad(3 + 3 * (rnd(seed, 7) - 0.5))
    };
    const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
    const thick = thickAngle(light), ow = 5 * u;
    const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
    const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
    const legs = [];
    let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
    if (mode === "march") {
        const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
        const st = (ph)=>{
            const c = ((phase + ph) % 1 + 1) % 1;
            if (c < 0.5) {
                const s = c / 0.5;
                return {
                    x: S / 2 - S * s,
                    h: 0,
                    stance: true,
                    s
                };
            }
            const s = (c - 0.5) / 0.5;
            return {
                x: -S / 2 + S * s - S / Math.PI * Math.sin(2 * Math.PI * s),
                h: liftH * Math.sin(Math.PI * s),
                stance: false,
                s
            };
        };
        const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
        const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
        hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
        for (const [L, near] of [
            [
                fL,
                false
            ],
            [
                nL,
                true
            ]
        ])legs.push({
            ank: [
                300 + L.x,
                ankY - L.h
            ],
            pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)),
            near
        });
        lean = 4 + 3 * Math.cos(2 * two * phase);
        nearFwd = nL.x / (S / 2);
    } else if (mode === "push") {
        hipY = ankY - 0.87 * legLen;
        legs.push({
            ank: [
                300 - 0.5 * legLen,
                ankY
            ],
            pitch: rad(-8),
            near: false
        }, {
            ank: [
                300 + 0.32 * legLen,
                ankY
            ],
            pitch: 0,
            near: true
        });
        lean = 14 * pose;
    } else if (mode === "swing") {
        hipY = SWING_HIP;
        const a = rad(60 * pose);
        for (const [dx, near] of [
            [
                -6,
                false
            ],
            [
                0,
                true
            ]
        ]){
            const knee = [
                300 + l1 * 0.98 + dx * u,
                hipY + 6 * u
            ];
            legs.push({
                ank: [
                    knee[0] + l2 * Math.sin(a),
                    knee[1] + l2 * Math.cos(a)
                ],
                pitch: -a * 0.5,
                near
            });
        }
    } else {
        legs.push({
            ank: [
                300 - 4 * u,
                ankY
            ],
            pitch: 0,
            near: false
        }, {
            ank: [
                300 + 4 * u,
                ankY
            ],
            pitch: 0,
            near: true
        });
    }
    const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip = [
        300,
        hipY
    ];
    p.rot = null;
    for (const L of legs){
        const knee = mode === "swing" ? [
            300 + l1 * 0.98 + (L.near ? 0 : -6 * u),
            hipY + 6 * u
        ] : ik(hip, L.ank, l1, l2);
        const hp0 = [
            300 + (L.near ? 0 : -5 * u),
            hipY
        ];
        p.stroke([
            hp0,
            knee,
            L.ank
        ], 5.8 * u, L.near ? nearCol : farCol);
        const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
        footStroke(p, [
            L.ank[0] - 3 * u * c,
            L.ank[1] - 3 * u * s
        ], [
            L.ank[0] + 13 * u * c,
            L.ank[1] + 13 * u * s + 0.5 * u
        ], 7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
    }
    p.rot = lean ? [
        rad(lean),
        300,
        hipY
    ] : null;
    const T = {
        a: (o.build === "stout" ? 0.36 : 0.31) * W,
        b: 0.5 * (torsoBot - (chin - 0.25 * HH)),
        nTop: 2.2,
        nBot: 2.5,
        egg: 0.1,
        asym: 0.06,
        rot: 0,
        noise: 0.006,
        seed: seed + 7
    };
    const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
    const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
    const S = [
        tcx + 0.05 * T.a,
        chin + 0.14 * HH
    ], aLen = 0.95 * HH;
    const swingArm = (ang)=>{
        const e = [
            S[0] + Math.sin(ang) * aLen * 0.5,
            S[1] + Math.cos(ang) * aLen * 0.5
        ], a2 = ang + rad(16) * Math.sign(ang || 1);
        return [
            S,
            e,
            [
                e[0] + Math.sin(a2) * aLen * 0.5,
                e[1] + Math.cos(a2) * aLen * 0.5
            ]
        ];
    };
    const rifle = !!o.rifle && (mode === "march" || mode === "stand");
    const B0 = [
        tcx + 0.72 * T.a,
        chin + 0.58 * HH
    ], B1 = [
        tcx - 0.95 * T.a - 22 * u,
        crown - 0.4 * HH
    ];
    let near, far;
    if (mode === "swing") {
        near = [
            S,
            [
                S[0] + 12 * u,
                S[1] - 0.16 * HH
            ],
            [
                300 + 6 * u,
                chin - 0.3 * HH
            ]
        ];
        far = [
            S,
            [
                S[0] + 8 * u,
                S[1] - 0.18 * HH
            ],
            [
                300 + 2 * u,
                chin - 0.36 * HH
            ]
        ];
    } else if (mode === "push") {
        const reach = 0.55 * HH + 0.45 * HH * pose;
        let hN = [
            S[0] + reach,
            S[1] + 0.06 * HH
        ];
        if (opts.hand) {
            const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
            const tg = [
                300 + dx * Math.cos(th) - dy * Math.sin(th),
                hipY + dx * Math.sin(th) + dy * Math.cos(th)
            ];
            hN = [
                hN[0] + (tg[0] - hN[0]) * pose,
                hN[1] + (tg[1] - hN[1]) * pose
            ];
        }
        near = [
            S,
            [
                (S[0] + hN[0]) / 2,
                (S[1] + hN[1]) / 2 + 0.06 * HH
            ],
            hN
        ];
        far = [
            S,
            [
                (S[0] + hN[0]) / 2 - 4 * u,
                (S[1] + hN[1]) / 2 - 0.02 * HH
            ],
            [
                hN[0] - 6 * u,
                hN[1] - 0.08 * HH
            ]
        ];
    } else if (rifle) {
        near = [
            S,
            [
                S[0] - 4 * u,
                S[1] + 0.42 * HH
            ],
            B0
        ];
        far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0);
    } else {
        near = swingArm(rad(-30) * nearFwd);
        far = mode === "march" ? swingArm(rad(30) * nearFwd) : null;
    }
    if (far) {
        p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm);
        p.dot(far[2][0], far[2][1], 5.5 * u);
    }
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, ()=>{
        if (o.belt) p.band([
            [
                tcx - 0.65 * T.a,
                chin - 0.05 * HH
            ],
            [
                tcx + 0.75 * T.a,
                torsoBot - 0.1 * HH
            ]
        ], o.belt, 5.5 * u, 1.8 * u);
        if (o.sash) p.band([
            [
                tcx - 1.3 * T.a,
                torsoBot - 0.32 * HH
            ],
            [
                tcx + 1.3 * T.a,
                torsoBot - 0.32 * HH
            ]
        ], o.sash, 0.13 * HH, 1.8 * u);
        if (!o.dress) for(let i = 0; i < 3; i++){
            const y = chin + 0.16 * HH + i * 0.24 * HH;
            p.dot(tcx + 0.8 * T.a, y, 3 * u, INK);
            p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
        }
    });
    p.inkRing(tp, ow, thick);
    if (rifle) {
        p.band([
            B0,
            B1
        ], "#7a4b2a", 5 * u, 1.5 * u, "round");
        p.band([
            lerp2(B0, B1, 0.6),
            B1
        ], "#8d949c", 2.4 * u, 1.2 * u, "round");
    }
    p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol);
    p.dot(near[2][0], near[2][1], 5.5 * u);
    const hx = 300 + 4 * u;
    hatBehind(p, o, H, hx, hc, light, thick, ow, true);
    const hp = blobPts(hx, hc, H);
    p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
    p.inkRing(hp, ow, thick);
    hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
    const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
    faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
    p.rot = null;
};
export const swingKid = (p, o, kick, expr, light = DEF_LIGHT, blink = 0)=>{
    const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
    const seat = rope + 18, x0 = 150, x1 = 550;
    p.line([
        [
            350,
            20
        ],
        [
            x0 + 16,
            seat + 4
        ]
    ], "#a07a4c", 10);
    p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
    const g = p.g;
    g.save();
    g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
    g.scale(k, k);
    bodySide(new Pen(g), o, {
        expr,
        mode: "swing",
        pose: kick,
        light,
        seed: 5,
        blink
    });
    g.restore();
    p.line([
        [
            350,
            20
        ],
        [
            x1 - 16,
            seat + 4
        ]
    ], "#a07a4c", 10);
};
export const fxNote = (p, kind, col = "#1f2a44")=>{
    p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
    p.stroke([
        [
            110,
            190
        ],
        [
            110,
            40
        ]
    ], 14);
    if (kind === 0) p.poly([
        [
            110,
            40
        ],
        [
            170,
            70
        ],
        [
            170,
            110
        ],
        [
            110,
            82
        ]
    ], col, 8);
    else {
        p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
        p.stroke([
            [
                186,
                160
            ],
            [
                186,
                20
            ]
        ], 14);
        p.poly([
            [
                110,
                40
            ],
            [
                186,
                20
            ],
            [
                186,
                50
            ],
            [
                110,
                70
            ]
        ], col, 8);
    }
};
export const fxBurst = (p, t, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230)=>{
    const c = 250, e = 1 - (1 - t) ** 3;
    for(let i = 0; i < rays; i++){
        const a = rad(i * 360 / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
        p.poly([
            [
                c + r0 * 0.5 * Math.cos(a + 0.18),
                c + r0 * 0.5 * Math.sin(a + 0.18)
            ],
            [
                c + ra * Math.cos(a),
                c + ra * Math.sin(a)
            ],
            [
                c + r0 * 0.5 * Math.cos(a - 0.18),
                c + r0 * 0.5 * Math.sin(a - 0.18)
            ]
        ], col, Math.max(3, 8 * (1 - t)));
    }
    if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};
export const fxSplash = (p, t)=>{
    const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
    const blue = "#bfe8ff", deep = "#6cc0f0";
    if (rise > 0.02) {
        const pts = [];
        for(let i = 0; i < 19; i++){
            const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
            pts.push([
                c - 330 + 660 * i / 18,
                size - 120 - h
            ]);
        }
        p.poly([
            ...pts,
            [
                c + 330,
                size - 90
            ],
            [
                c - 330,
                size - 90
            ]
        ], blue, 10);
        p.ell(c, size - 100, 360, 46, deep, 10);
    }
    for(let i = 0; i < 8; i++){
        const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
        if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
    }
};
export const fxPuff = (p, t)=>{
    for(let i = 0; i < 5; i++){
        const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
        p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
    }
};
export const fxStars = (p, t)=>{
    for(let i = 0; i < 4; i++){
        const a = t * Math.PI * 2 + i * Math.PI / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts = [];
        for(let k = 0; k < 10; k++){
            const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90);
            pts.push([
                x + r * Math.cos(b),
                y + r * Math.sin(b)
            ]);
        }
        p.poly(pts, "#ffd84a", 6);
    }
};
export const fxCreak = (p, t)=>{
    const j = 6 * Math.sin(t * 40);
    for (const a of [
        -30,
        0,
        30
    ]){
        const b = rad(a - 90);
        p.stroke([
            [
                150 + 70 * Math.cos(b) + j,
                230 + 70 * Math.sin(b)
            ],
            [
                150 + 100 * Math.cos(b) + 10 + j,
                230 + 100 * Math.sin(b)
            ],
            [
                150 + 130 * Math.cos(b) + j,
                230 + 130 * Math.sin(b)
            ]
        ], 10);
    }
};
export const fxRing = (p, t)=>{
    const g = p.g;
    for(let k = 0; k < 3; k++){
        const u = t - k * 0.22;
        if (u <= 0 || u >= 1) continue;
        g.beginPath();
        g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
        g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa";
        g.lineWidth = 9 * (1 - u) + 3;
        g.stroke();
    }
};
export const fxSign = (p)=>{
    const g = p.g, RED = "#d42f2f";
    p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
    p.poly(rrect(14, 14, 686, 506, 40), null, 14);
    p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
    g.beginPath();
    g.moveTo(112, 470);
    g.quadraticCurveTo(350, 300, 588, 470);
    g.strokeStyle = INK;
    g.lineWidth = 16;
    g.lineCap = "round";
    g.stroke();
    for (const x of [
        88,
        612
    ])p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
    for (const x of [
        150,
        278,
        406,
        534
    ]){
        p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);
        p.stroke([
            [
                x - 8,
                210
            ],
            [
                x + 34,
                262
            ],
            [
                x + 46,
                338
            ]
        ], 15, INK);
        p.stroke([
            [
                x + 6,
                210
            ],
            [
                x - 12,
                274
            ],
            [
                x - 36,
                336
            ]
        ], 15, INK);
        p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);
        p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
    }
    for (const [a, b] of [
        [
            [
                96,
                70
            ],
            [
                604,
                452
            ]
        ],
        [
            [
                604,
                70
            ],
            [
                96,
                452
            ]
        ]
    ]){
        p.stroke([
            a,
            b
        ], 58, "#ffffff");
        p.stroke([
            a,
            b
        ], 42, RED);
    }
};
export const fxCloud = (p, seed)=>{
    const blobs = [
        [
            150,
            190,
            80
        ],
        [
            250,
            150,
            105
        ],
        [
            360,
            160,
            95
        ],
        [
            450,
            195,
            70
        ],
        [
            300,
            210,
            90
        ]
    ];
    for (const [x, y, r] of blobs)p.ell(x + seed * 37 % 20 - 10, y, r, r * 0.8, "#ffffff", 0);
    p.ell(300, 235, 230, 40, "#ffffff", 0);
};
export const fxShadow = (p, col)=>{
    const g = p.g;
    g.fillStyle = WHITE;
    g.fillRect(0, 0, 128, 256);
    g.save();
    g.filter = "blur(9px)";
    const lg = g.createLinearGradient(0, 205, 0, 22);
    lg.addColorStop(0, mix(col, WHITE, 0.08));
    lg.addColorStop(0.55, mix(col, WHITE, 0.3));
    lg.addColorStop(1, mix(col, WHITE, 0.85));
    g.fillStyle = lg;
    g.beginPath();
    g.moveTo(40, 205);
    g.bezierCurveTo(36, 120, 46, 50, 64, 30);
    g.bezierCurveTo(82, 50, 92, 120, 88, 205);
    g.closePath();
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
};
export const fxContact = (p, col)=>{
    const g = p.g;
    g.fillStyle = WHITE;
    g.fillRect(0, 0, 128, 128);
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [r, k] of [
        [
            0,
            0
        ],
        [
            0.32,
            0.02
        ],
        [
            0.5,
            0.22
        ],
        [
            0.66,
            0.58
        ],
        [
            0.82,
            0.88
        ],
        [
            1,
            1
        ]
    ])gr.addColorStop(r, mix(col, WHITE, k));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
};
export const fxPlank = (p)=>{
    p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
    p.line([
        [
            40,
            46
        ],
        [
            150,
            44
        ],
        [
            270,
            50
        ]
    ], "#7d5234", 4);
    p.line([
        [
            60,
            62
        ],
        [
            200,
            64
        ],
        [
            284,
            60
        ]
    ], "#7d5234", 4);
    p.dot(36, 54, 5, INK);
    p.dot(284, 54, 5, INK);
};
export const fxDrum = (p)=>{
    p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
    p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
    p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
    p.line([
        [
            52,
            88
        ],
        [
            82,
            172
        ],
        [
            112,
            88
        ],
        [
            142,
            172
        ],
        [
            172,
            88
        ],
        [
            202,
            172
        ]
    ], INK, 6);
    p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};
export const fxBlob = (p, col)=>{
    const g = p.g;
    g.fillStyle = WHITE;
    g.fillRect(0, 0, 128, 128);
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [r, k] of [
        [
            0,
            0
        ],
        [
            0.5,
            0.04
        ],
        [
            0.64,
            0.18
        ],
        [
            0.76,
            0.42
        ],
        [
            0.87,
            0.72
        ],
        [
            0.95,
            0.92
        ],
        [
            1,
            1
        ]
    ])gr.addColorStop(r, mix(col, WHITE, k));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
};

// ---------------- Ricks Clips style character renderer — LOCKED STYLE (matched to Ricks Clips frames) ----------------
// White round head (slightly wider than tall), THICK near-black brown brush outline heavier at the bottom (~6% of head width),
// pear-shaped pill body with clothes painted on, chunky brown limbs with small dark hands, small dark shoe ovals,
// big expressive face: dark oval / dash / ring / half-lid / >< eyes, thick arched brows high on the forehead,
// wide dark D-grin with a white tooth row, heavy frowns. Hats sit on the crown so the brows always show.
// Units: head radius = 100. Origin = between the feet on the ground (0, 0); pose "sit" origin = the seat. Up is negative y.
// Usage: rick(ctx2d, outfitObject, { pose, expr, look, L, R, propL, propR, headTilt }) after ctx.translate(x, y) + ctx.scale(s, s).

const LINE = "#2e211d", HEAD = "#f8f6f2", HEAD_SH = "#d8d1c8", LW = 6;
const D2R = Math.PI / 180;
const mulc = (hex, k) => { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) => Math.max(0, Math.min(255, Math.round(v * (Array.isArray(k) ? k[i] : k))))); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };

// path helpers
const P = (g, pts, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); };
const fillLine = (g, fill, lw = LW, col = LINE) => { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); } };
const ell = (g, x, y, rx, ry, fill, lw = LW, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); fillLine(g, fill, lw); };
const line = (g, pts, lw = LW, col = LINE) => { P(g, pts, false); g.lineWidth = lw; g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };
const qc = (a, c, b, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; o.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); } return o; };
const sup = (cx, cy, rx, ry, nT = 2.6, nB = 2.6, n = 64) => { const o = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? nT : nB); o.push([cx + rx * Math.sign(c) * Math.abs(c) ** e, cy + ry * Math.sign(s) * Math.abs(s) ** e]); } return o; };
const clip = (g, pts, fn) => { g.save(); P(g, pts); g.clip(); fn(); g.restore(); };
const softShade = (g, pts, cx, cy, r, base, sh) => { const gr = g.createRadialGradient(cx - 0.35 * r, cy - 0.4 * r, 0.1 * r, cx, cy, 1.25 * r); gr.addColorStop(0, base); gr.addColorStop(0.62, base); gr.addColorStop(1, sh); P(g, pts); g.fillStyle = gr; g.fill(); };


const inkRing = (g, pts, w0 = 7, k = 0.6, ang = Math.PI * 0.32, col = LINE) => {
  const n = pts.length; let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x / n; cy += y / n; }
  const out = [], inn = [];
  pts.forEach((q, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n]; let nx = b[1] - a[1], ny = a[0] - b[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - ang)) * (1 + 0.08 * Math.sin(i * 1.7));
    out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]); });
  g.beginPath(); out.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); inn.reverse().forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = col; g.fill("evenodd");
};
// tapered brush stroke for limbs
const limbStroke = (g, pts, w0, w1, col = LINE) => { const n = pts.length; for (let i = 0; i < n - 1; i++) { const t = i / (n - 1); line(g, [pts[i], pts[i + 1]], w0 + (w1 - w0) * t, col); } };

// ---------- faces (measured from his close-ups; units: head radius 100) ----------
const FC = "#2b1f1c";
const EYES = {
  dot: (g, x, y) => ell(g, x, y, 8, 12.5, FC, 0),
  dash: (g, x, y) => line(g, [[x - 15, y], [x + 15, y]], 8, FC),
  ring: (g, x, y) => { ell(g, x, y, 18, 18, "#fff", 6); ell(g, x, y, 5, 5, FC, 0); },
  half: (g, x, y, s) => { g.save(); g.beginPath(); g.rect(x - 20, y - 2, 40, 30); g.clip(); ell(g, x, y - 1, 10, 11, FC, 0); g.restore(); line(g, [[x - 13, y - 2], [x + 13, y - 2]], 6, FC); },
  smug: (g, x, y, s) => { g.save(); g.beginPath(); g.rect(x - 20, y, 40, 30); g.clip(); ell(g, x + 2, y + 1, 10, 9, FC, 0); g.restore(); line(g, qc([x - 14, y + 2], [x, y - 3], [x + 14, y + 1]), 6, FC); },
  happy: (g, x, y) => line(g, qc([x - 15, y + 5], [x, y - 11], [x + 15, y + 5]), 7.5, FC),
  wink: (g, x, y) => line(g, qc([x - 14, y - 2], [x, y + 8], [x + 14, y - 2]), 7.5, FC),
  chev: (g, x, y, s) => line(g, [[x + 13 * s, y - 10], [x - 11 * s, y], [x + 13 * s, y + 10]], 7.5, FC),
};
// brow: [innerDy, outerDy, arch] ; arched thick strokes well above the eyes
const FACES = {
  neutral:   { eyes: ["dot", "dot"],   brows: [[0, 0, 6], [0, 0, 6]],       mouth: "small" },
  grin:      { eyes: ["dot", "dot"],   brows: [[-4, -2, 9], [-4, -2, 9]],   mouth: "grin" },
  beam:      { eyes: ["dash", "dash"], brows: [[-6, -4, 9], [-6, -4, 9]],   mouth: "grin" },
  smile:     { eyes: ["dot", "dot"],   brows: [[-3, -1, 7], [-3, -1, 7]],   mouth: "smile" },
  smugsmile: { eyes: ["happy", "happy"], brows: [[-4, -2, 7], [-4, -2, 7]], mouth: "smile" },
  smirk:     { eyes: ["smug", "smug"], brows: [[3, -1, 4], [-6, -10, 8]],   mouth: "smirk" },
  sly:       { eyes: ["smug", "dot"],  brows: [[6, 0, 3], [-8, -12, 9]],    mouth: "smirk" },
  bored:     { eyes: ["dash", "dash"], brows: [[-2, 0, 7], [-2, 0, 7]],     mouth: "flat" },
  sleepy:    { eyes: ["dash", "dash"], brows: [[2, 4, 3], [2, 4, 3]],       mouth: "tiny" },
  stern:     { eyes: ["half", "half"], brows: [[8, -3, 2], [8, -3, 2]],     mouth: "frown" },
  angry:     { eyes: ["half", "half"], brows: [[12, -6, 0], [12, -6, 0]],   mouth: "tinyfrown" },
  shock:     { eyes: ["ring", "ring"], brows: [[-10, -8, 8], [-10, -8, 8]], mouth: "o" },
  nervous:   { eyes: ["ring", "ring"], brows: [[-12, 2, 4], [-12, 2, 4]],   mouth: "squiggle", sweat: true },
  think:     { eyes: ["dot", "dot"],   brows: [[-8, 0, 6], [4, -6, 6]],     mouth: "tinyfrown" },
  laugh:     { eyes: ["chev", "chev"], brows: [[-6, -4, 8], [-6, -4, 8]],   mouth: "open" },
  wink:      { eyes: ["wink", "dot"],  brows: [[0, -2, 7], [-6, -8, 9]],    mouth: "grin" },
};
const RMOUTH = {
  small: (g, x, y) => line(g, [[x - 9, y + 2], [x + 9, y + 2]], 6.5, FC),
  tiny: (g, x, y) => line(g, [[x - 5, y + 4], [x + 6, y + 2]], 6, FC),
  flat: (g, x, y) => line(g, [[x - 14, y + 4], [x + 14, y + 3]], 6.5, FC),
  smile: (g, x, y) => line(g, qc([x - 30, y - 6], [x, y + 18], [x + 30, y - 6]), 7, FC),
  smirk: (g, x, y) => line(g, qc([x - 22, y + 6], [x + 4, y + 12], [x + 26, y - 6]), 7, FC),
  frown: (g, x, y) => line(g, qc([x - 30, y + 18], [x, y - 12], [x + 30, y + 18]), 7.5, FC),
  tinyfrown: (g, x, y) => { P(g, [...qc([x - 12, y + 8], [x, y - 2], [x + 12, y + 8]), ...qc([x + 12, y + 8], [x, y + 4], [x - 12, y + 8])]); fillLine(g, FC, 5, FC); },
  o: (g, x, y) => ell(g, x, y + 8, 11, 13, FC, 0),
  squiggle: (g, x, y) => { const p = []; for (let i = 0; i <= 10; i++) p.push([x - 10 + i * 2, y + 6 + 2.6 * Math.sin(i * 1.6)]); line(g, p, 4.5, FC); },
  grin: (g, x, y) => { const top = qc([x - 50, y - 8], [x, y + 4], [x + 50, y - 8], 18), bot = qc([x + 50, y - 8], [x, y + 60], [x - 50, y - 8], 18);
    P(g, [...top, ...bot]); fillLine(g, FC, 0);
    g.save(); P(g, [...top, ...bot]); g.clip(); g.fillStyle = "#ffffff"; for (let i = -3; i <= 3; i++) { const tx = x + i * 13; g.fillRect(tx - 5, y - 10, 10, 14); } g.restore();
    P(g, [...top, ...bot]); fillLine(g, null, 6, FC); },
  open: (g, x, y) => { const top = qc([x - 42, y - 6], [x, y + 2], [x + 42, y - 6], 18), bot = qc([x + 42, y - 6], [x, y + 80], [x - 42, y - 6], 18);
    P(g, [...top, ...bot]); fillLine(g, FC, 0); g.save(); P(g, [...top, ...bot]); g.clip(); g.fillStyle = "#fff"; for (let i = -2; i <= 2; i++) g.fillRect(x + i * 12 - 5, y - 10, 10, 13); ell(g, x + 4, y + 34, 18, 10, "#d8566a", 0); g.restore(); P(g, [...top, ...bot]); fillLine(g, null, 6, FC); },
};
const face = (g, cx, cy, expr, look = 0, o = {}) => {
  const F = FACES[expr] ?? FACES.neutral, ey = cy - 10, ex = 27, lx = look * 8;
  [-1, 1].forEach((s, i) => {
    const ek = o.blink && !['dash', 'happy', 'chev', 'wink'].includes(F.eyes[i]) ? 'dash' : F.eyes[i];
    EYES[ek](g, cx + s * ex + lx, ey, s);
    if (!o.noBrows) { const [di, dout, arch] = F.brows[i], by = ey - 38, a = [cx + s * 12 + lx, by + di], b = [cx + s * 46 + lx, by + dout];
      line(g, qc(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - arch], b), 7.5, o.browCol ?? FC); }
  });
  if (F.sweat) { P(g, [[cx + 62, cy - 52], [cx + 54, cy - 36], [cx + 62, cy - 28], [cx + 70, cy - 36]]); fillLine(g, "#8fd0f5", 3.5, FC); }
  const mx = cx + lx * 0.6, my = cy + 28;
  if (o.moustache) { for (const s of [-1, 1]) { P(g, [...qc([mx + s * 2, my - 12], [mx + s * 22, my - 18], [mx + s * 34, my - 2]), ...qc([mx + s * 34, my - 2], [mx + s * 38, my - 14], [mx + s * 30, my - 16]), [mx + s * 36, my - 12], ...qc([mx + s * 30, my - 6], [mx + s * 16, my - 4], [mx + s * 2, my - 4])]); fillLine(g, o.moustache, 3, FC); } }
  RMOUTH[o.talk ? (o.talk > 0.5 ? 'o' : 'small') : F.mouth](g, mx, my + (o.moustache ? 4 : 0));
  if (o.goatee) { P(g, [[mx - 9, my + 18], [mx + 9, my + 18], [mx + 5, my + 38], [mx, my + 44], [mx - 5, my + 38]]); fillLine(g, o.goatee, 3, FC); }
};

// ---------- hats & hair ----------
const HATS = {
  cap: (g, cx, cy, o) => { const c = o.hatCol ?? "#d9433a"; g.save(); g.translate(cx, cy); g.rotate(-7 * D2R);
    const dome = [[-80, -60], ...qc([-80, -60], [-88, -132], [0, -132]), ...qc([0, -132], [88, -132], [80, -60]), ...qc([80, -60], [0, -78], [-80, -60])];
    softShade(g, dome, 0, -100, 90, c, mulc(c, 0.7)); clip(g, dome, () => { for (const dx of [-38, 0, 38]) { g.setLineDash([6, 5]); line(g, qc([dx * 0.15, -128], [dx * 1.05, -112], [dx * 1.5, -66]), 2.6, mulc(c, 1.35)); g.setLineDash([]); line(g, qc([dx * 0.15, -128], [dx * 1.05, -112], [dx * 1.5, -66]), 2, mulc(c, 0.62)); } });
    inkRing(g, dome, 9, 0.3, Math.PI * 0.5, FC); ell(g, 0, -131, 9, 6, mulc(c, 0.85), 4);
    const vis = [...qc([-70, -70], [0, -82], [78, -70]), ...qc([78, -70], [10, -40], [-70, -70])];
    softShade(g, vis, 0, -64, 70, mulc(c, 0.9), mulc(c, 0.65)); g.setLineDash([6, 5]); line(g, qc([-56, -66], [8, -52], [64, -66]), 2.4, mulc(c, 1.35)); g.setLineDash([]); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); },
  hair: (g, cx, cy, o) => { const c = o.hair ?? "#3a2a22"; const pts = [...qc([cx - 99, cy - 10], [cx - 112, cy - 120], [cx - 10, cy - 116]), ...qc([cx - 10, cy - 116], [cx + 108, cy - 118], [cx + 99, cy - 20]), ...qc([cx + 99, cy - 20], [cx + 70, cy - 64], [cx + 20, cy - 66]), ...qc([cx + 20, cy - 66], [cx - 40, cy - 48], [cx - 58, cy - 74]), ...qc([cx - 58, cy - 74], [cx - 80, cy - 40], [cx - 99, cy - 10])]; softShade(g, pts, cx, cy - 70, 100, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); line(g, qc([cx - 30, cy - 100], [cx + 20, cy - 108], [cx + 60, cy - 90]), 4, mulc(c, 1.5)); },
  fedora: (g, cx, cy, o) => { const c = o.hatCol ?? "#3e3943", b = o.band ?? "#7c2630"; g.save(); g.translate(cx, cy - 18); g.rotate(-6 * D2R); const cr = [[-92, -48], ...qc([-92, -48], [-96, -150], [-60, -150]), ...qc([-60, -150], [0, -134], [60, -150]), ...qc([60, -150], [96, -150], [92, -48])]; softShade(g, cr, 0, -100, 100, c, mulc(c, 0.7)); clip(g, cr, () => { g.fillStyle = b; g.fillRect(-120, -82, 240, 30); line(g, [[-120, -82], [120, -82]], 2.5); }); P(g, cr); fillLine(g, null); line(g, qc([-40, -136], [0, -124], [40, -136]), 3, mulc(c, 0.6)); const br = [...qc([-150, -44], [0, -70], [150, -50]), ...qc([150, -50], [0, -14], [-150, -44])]; softShade(g, br, 0, -40, 150, mulc(c, 1.05), mulc(c, 0.72)); P(g, br); fillLine(g, null); g.restore(); },
  hardhat: (g, cx, cy, o) => { const c = o.hatCol ?? "#f5c02e"; const d = [[cx - 102, cy - 30], ...qc([cx - 102, cy - 30], [cx - 104, cy - 140], [cx, cy - 138]), ...qc([cx, cy - 138], [cx + 104, cy - 140], [cx + 102, cy - 30])]; softShade(g, d, cx, cy - 90, 100, c, mulc(c, [0.8, 0.7, 0.55])); clip(g, d, () => { g.fillStyle = mulc(c, [1.04, 1.02, 0.86]); g.fillRect(cx - 14, cy - 150, 28, 130); }); P(g, d); fillLine(g, null); P(g, [[cx - 122, cy - 32], [cx + 122, cy - 32], [cx + 116, cy - 16], [cx - 116, cy - 16]]); fillLine(g, mulc(c, 0.9)); },
  straw: (g, cx, cy, o) => { const c = "#e9c86f"; const br = sup(cx, cy - 40, 172, 30, 2, 2); softShade(g, br, cx, cy - 40, 170, c, mulc(c, [0.8, 0.72, 0.6])); clip(g, br, () => { for (let i = -10; i <= 10; i++) line(g, [[cx + i * 18, cy - 70], [cx + i * 22, cy - 10]], 1.6, "#c99b42"); }); P(g, br); fillLine(g, null); const cr = [[cx - 82, cy - 46], ...qc([cx - 82, cy - 46], [cx - 84, cy - 132], [cx, cy - 130]), ...qc([cx, cy - 130], [cx + 84, cy - 132], [cx + 82, cy - 46])]; softShade(g, cr, cx, cy - 90, 90, c, mulc(c, [0.8, 0.72, 0.6])); clip(g, cr, () => { g.fillStyle = "#c0392b"; g.fillRect(cx - 100, cy - 78, 200, 22); }); P(g, cr); fillLine(g, null); },
  pilot: (g, cx, cy, o) => { const c = "#28324f"; const top = [[cx - 92, cy - 40], [cx - 118, cy - 112], ...qc([cx - 118, cy - 112], [cx, cy - 140], [cx + 118, cy - 112]), [cx + 92, cy - 40]]; softShade(g, top, cx, cy - 90, 110, c, mulc(c, 0.7)); P(g, top); fillLine(g, null); P(g, [[cx - 94, cy - 64], [cx + 94, cy - 64], [cx + 92, cy - 40], [cx - 92, cy - 40]]); fillLine(g, "#1a2238"); line(g, [[cx - 90, cy - 58], [cx + 90, cy - 58]], 3.5, "#e5c158"); P(g, [...qc([cx - 80, cy - 42], [cx, cy - 52], [cx + 80, cy - 42]), ...qc([cx + 80, cy - 42], [cx, cy - 14], [cx - 80, cy - 42])]); fillLine(g, "#14182a"); ell(g, cx, cy - 92, 10, 10, "#e5c158", 3); for (const s of [-1, 1]) { P(g, [[cx + s * 8, cy - 96], [cx + s * 40, cy - 104], [cx + s * 34, cy - 88], [cx + s * 8, cy - 86]]); fillLine(g, "#e5c158", 2.5); } },
  beanie: (g, cx, cy, o) => { const c = o.hatCol ?? "#c0392b"; const d = [[cx - 101, cy - 34], ...qc([cx - 101, cy - 34], [cx - 104, cy - 150], [cx, cy - 146]), ...qc([cx, cy - 146], [cx + 104, cy - 150], [cx + 101, cy - 34])]; softShade(g, d, cx, cy - 90, 100, c, mulc(c, 0.7)); clip(g, d, () => { for (let i = -6; i <= 6; i++) line(g, [[cx + i * 16, cy - 40], [cx + i * 13, cy - 150]], 2, mulc(c, 0.8)); }); P(g, d); fillLine(g, null); P(g, sup(cx, cy - 40, 106, 20, 2.2, 2.2)); fillLine(g, mulc(c, 0.88)); ell(g, cx, cy - 152, 18, 16, mulc(c, 1.15)); },
  tophat: (g, cx, cy, o) => { const c = "#24222a"; P(g, [[cx - 68, cy - 70], [cx - 74, cy - 230], [cx + 74, cy - 230], [cx + 68, cy - 70]]); fillLine(g, c); g.fillStyle = "#7c2630"; g.fillRect(cx - 69, cy - 104, 138, 26); line(g, [[cx - 69, cy - 104], [cx + 69, cy - 104]], 2.5); line(g, [[cx - 69, cy - 78], [cx + 69, cy - 78]], 2.5); P(g, sup(cx, cy - 70, 112, 16, 2, 2)); fillLine(g, c); line(g, [[cx - 50, cy - 210], [cx - 46, cy - 120]], 5, "#4a4752"); },
  laurel: (g, cx, cy) => { for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const a = (205 + i * 20) * D2R, x = cx + s * -Math.cos(a) * 98, y = cy - 20 + Math.sin(a) * 92; ell(g, x, y, 15, 7, i % 2 ? "#79a53e" : "#5f8a30", 2.6, s * (0.7 + i * 0.3)); } },
  bald: (g, cx, cy, o) => { for (const s of [-1, 1]) ell(g, cx + s * 94, cy - 6, 20, 30, o.hair ?? "#f2f0ea", 3.5); },
  bun: (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); },
  long: (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); },
  pigtails: (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); },
  curly: (g, cx, cy, o) => { const c = o.hair ?? "#1e1714"; for (let i = 0; i < 9; i++) { const a = (195 + i * 19) * D2R; ell(g, cx + Math.cos(a) * 92, cy - 30 + Math.sin(a) * 86, 30, 28, i % 2 ? c : mulc(c, 1.2), 3.5); } },
  spiky: (g, cx, cy, o) => { const c = o.hair ?? "#f2f0ea", pts = []; for (let i = 0; i <= 12; i++) { const a = (188 + i * 164 / 12) * D2R, r = i % 2 ? 100 : 140; pts.push([cx + Math.cos(a) * r, cy - 22 + Math.sin(a) * r * 0.95]); } softShade(g, pts, cx, cy - 80, 120, c, mulc(c, 0.8)); P(g, pts); fillLine(g, null); },
};
const HAIR_BEHIND = {
  bun: (g, cx, cy, o) => ell(g, cx + 10, cy - 116, 40, 34, o.hair ?? "#2b211c"),
  long: (g, cx, cy, o) => { const c = o.hair ?? "#6b4226", pts = sup(cx, cy + 40, 110, 128, 2.2, 3); softShade(g, pts, cx, cy, 130, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); },
  pigtails: (g, cx, cy, o) => { for (const s of [-1, 1]) { ell(g, cx + s * 118, cy + 6, 30, 46, o.hair ?? "#5a3b2a", LW, s * -0.4); ell(g, cx + s * 96, cy - 30, 9, 9, "#e2453c", 3); } },
  curly: (g, cx, cy, o) => { const c = o.hair ?? "#1e1714"; for (let i = 0; i < 12; i++) { const a = (150 + i * 22) * D2R; ell(g, cx + Math.cos(a) * 108, cy - 10 + Math.sin(a) * 100, 36, 34, c, 3.5); } },
};

// ---------- clothes painted on the pill body ----------
const OUTFIT = {
  overalls: (g, b, o) => { const sl = o.top ?? "#f2b733"; for (const sd of [-1, 1]) { P(g, sup(b.cx + sd * (b.w / 2 - 6), b.y0 + 44, 26, 40, 2, 2)); fillLine(g, mulc(sl, 0.92), 3); }
    OUTFIT._overalls(g, b, o);
    g.setLineDash([7, 6]); line(g, [[b.cx - 30, b.y0 + 72], [b.cx + 30, b.y0 + 72], [b.cx + 30, b.y0 + 116], [b.cx - 30, b.y0 + 116], [b.cx - 30, b.y0 + 72]], 2.2, "#f2c14e"); line(g, [[b.x0 - 10, b.y0 + 124], [b.x1 + 10, b.y0 + 128]], 2.2, "#f2c14e"); g.setLineDash([]);
    for (let i = 0; i < 3; i++) line(g, qc([b.cx - 40 + i * 30, b.y1 - 70], [b.cx - 36 + i * 30, b.y1 - 40], [b.cx - 42 + i * 30, b.y1 - 12]), 2.2, mulc(o.pants ?? "#5d86b8", 0.75)); },
  _overalls: (g, b, o) => { g.fillStyle = o.top ?? "#f2b733"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); const den = o.pants ?? "#5d86b8"; P(g, [[b.cx - 46, b.y0 + 62], [b.cx + 46, b.y0 + 62], [b.cx + 50, b.y0 + 116], [b.x1 + 20, b.y0 + 120], [b.x1 + 20, b.y1 + 20], [b.x0 - 20, b.y1 + 20], [b.x0 - 20, b.y0 + 120], [b.cx - 50, b.y0 + 116]]); fillLine(g, den, 3); for (const s of [-1, 1]) { line(g, [[b.cx + s * 40, b.y0 + 64], [b.cx + s * 52, b.y0 - 5]], 14, LINE); line(g, [[b.cx + s * 40, b.y0 + 64], [b.cx + s * 52, b.y0 - 5]], 9, den); ell(g, b.cx + s * 38, b.y0 + 70, 6, 6, "#e5c158", 2.5); } P(g, [[b.cx - 26, b.y0 + 80], [b.cx + 26, b.y0 + 80], [b.cx + 26, b.y0 + 112], [b.cx - 26, b.y0 + 112]]); fillLine(g, mulc(den, 0.92), 2.5); g.setLineDash([5, 5]); line(g, [[b.cx - 22, b.y0 + 84], [b.cx + 22, b.y0 + 84]], 1.6, "#e5c158"); g.setLineDash([]); if (o.patch) { P(g, [[b.cx - 12, b.y0 + 88], [b.cx + 12, b.y0 + 88], [b.cx + 12, b.y0 + 108], [b.cx - 12, b.y0 + 108]]); fillLine(g, o.patch, 2); } },
  suit: (g, b, o) => { const c = o.top ?? "#2b2f3d"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); P(g, [[b.cx - 30, b.y0 - 10], [b.cx + 30, b.y0 - 10], [b.cx, b.y0 + 96]]); fillLine(g, o.shirt ?? "#f6f3ee", 3); if (o.tie) { P(g, [[b.cx - 7, b.y0 + 8], [b.cx + 7, b.y0 + 8], [b.cx + 12, b.y0 + 74], [b.cx, b.y0 + 90], [b.cx - 12, b.y0 + 74]]); fillLine(g, o.tie, 3); } for (const s of [-1, 1]) { P(g, [[b.cx + s * 30, b.y0 - 10], [b.cx + s * 60, b.y0 + 4], [b.cx + s * 38, b.y0 + 44], [b.cx + s * 6, b.y0 + 110]]); fillLine(g, mulc(c, 1.15), 3); } if (o.trim) for (const s of [-1, 1]) line(g, [[b.cx + s * 31, b.y0 - 6], [b.cx + s * 5, b.y0 + 108]], 3, o.trim); ell(g, b.cx, b.y0 + 132, 4.5, 4.5, LINE, 0); ell(g, b.cx, b.y0 + 168, 4.5, 4.5, LINE, 0); },
  trench: (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: o.top ?? "#c09257" }); g.fillStyle = mulc(o.top ?? "#c09257", 0.75); g.fillRect(b.x0 - 20, b.y0 + 150, b.w + 40, 16); line(g, [[b.x0 - 20, b.y0 + 150], [b.x1 + 20, b.y0 + 150]], 2.5); line(g, [[b.x0 - 20, b.y0 + 166], [b.x1 + 20, b.y0 + 166]], 2.5); for (const s of [-1, 1]) for (const k of [118, 186]) ell(g, b.cx + s * 26, b.y0 + k, 5, 5, "#4a3222", 2); },
  lab: (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: "#f4f6f8", shirt: o.shirt ?? "#8dbbe4" }); P(g, [[b.cx + 22, b.y0 + 96], [b.cx + 52, b.y0 + 96], [b.cx + 52, b.y0 + 120], [b.cx + 22, b.y0 + 120]]); fillLine(g, "#e9edf1", 2.5); line(g, [[b.cx + 30, b.y0 + 86], [b.cx + 30, b.y0 + 104]], 4, "#3d6fb5"); line(g, [[b.cx + 41, b.y0 + 84], [b.cx + 41, b.y0 + 104]], 4, "#c0392b"); },
  toga: (g, b, o) => { g.fillStyle = "#f3eee2"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); P(g, [[b.x0 - 20, b.y0 + 4], [b.x0 + 10, b.y0 - 20], [b.x1 + 20, b.y1 - 40], [b.x1 + 20, b.y1 + 10]]); fillLine(g, o.sash ?? "#6b3c8f", 3); for (let i = 0; i < 3; i++) line(g, qc([b.x0, b.y0 + 70 + i * 40], [b.cx - 10, b.y0 + 84 + i * 40], [b.cx + 30, b.y0 + 110 + i * 40]), 2.2, "#cfc6b2"); },
  hoodie: (g, b, o) => { const c = o.top ?? "#3f8f6f"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); P(g, sup(b.cx, b.y0 + 4, 52, 20, 2, 2)); fillLine(g, mulc(c, 0.86), 3); for (const s of [-1, 1]) line(g, [[b.cx + s * 12, b.y0 + 18], [b.cx + s * 14, b.y0 + 62]], 3, "#f4f1ea"); P(g, [[b.cx - 44, b.y0 + 140], [b.cx + 44, b.y0 + 140], [b.cx + 52, b.y0 + 186], [b.cx - 52, b.y0 + 186]]); fillLine(g, mulc(c, 0.92), 3); if (o.print) ell(g, b.cx, b.y0 + 96, 20, 20, o.print, 3); },
  vest: (g, b, o) => { g.fillStyle = o.top ?? "#5c6b7a"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); for (const s of [-1, 1]) { P(g, [[b.cx + s * 12, b.y0 - 20], [b.cx + s * 90, b.y0 - 20], [b.cx + s * 90, b.y1 + 20], [b.cx + s * 10, b.y1 + 20]]); fillLine(g, "#ff8a1f", 3); } for (const y of [b.y0 + 100, b.y0 + 140]) { g.fillStyle = "#eef3f5"; g.fillRect(b.x0 - 20, y, b.w + 40, 12); line(g, [[b.x0 - 20, y], [b.x1 + 20, y]], 2); line(g, [[b.x0 - 20, y + 12], [b.x1 + 20, y + 12]], 2); } },
  pilot: (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: "#28324f", tie: "#1a2238", trim: "#e5c158" }); for (const s of [-1, 1]) { P(g, [[b.cx + s * 40, b.y0 - 2], [b.cx + s * 74, b.y0 + 4], [b.cx + s * 72, b.y0 + 16], [b.cx + s * 40, b.y0 + 12]]); fillLine(g, "#e5c158", 2.5); } },
  school: (g, b, o) => { g.fillStyle = o.top ?? "#ffffff"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 34, b.y0 - 6], [b.cx + s * 24, b.y0 + 22]]); fillLine(g, "#ffffff", 2.5); } if (o.tie) { P(g, [[b.cx - 7, b.y0 + 8], [b.cx + 7, b.y0 + 8], [b.cx + 11, b.y0 + 70], [b.cx, b.y0 + 84], [b.cx - 11, b.y0 + 70]]); fillLine(g, o.tie, 3); } g.fillStyle = o.pants ?? "#3b5b9a"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3); if (o.backpack) for (const s of [-1, 1]) line(g, [[b.cx + s * 50, b.y0 - 10], [b.cx + s * 56, b.y1 - 50]], 12, o.backpack); },
  tee: (g, b, o) => { g.fillStyle = o.top ?? "#4f7fb8"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); line(g, qc([b.cx - 26, b.y0 - 4], [b.cx, b.y0 + 20], [b.cx + 26, b.y0 - 4]), 3); g.fillStyle = o.pants ?? "#3b3f52"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3); },
};

// ---------- props (thin outline style) ----------
const PROPS = {
  pipe: (g, x, y) => { line(g, qc([x, y], [x + 22, y + 14], [x + 40, y + 14]), 9); line(g, qc([x, y], [x + 22, y + 14], [x + 40, y + 14]), 5, "#3a271c"); P(g, [[x + 34, y - 10], [x + 60, y - 10], [x + 57, y + 20], [x + 46, y + 26], [x + 37, y + 20]]); fillLine(g, "#6a3f22", 3.5); ell(g, x + 47, y - 10, 13, 4, "#ff8a3d", 3); },
  clipboard: (g, x, y) => { P(g, [[x - 28, y - 40], [x + 28, y - 40], [x + 28, y + 34], [x - 28, y + 34]]); fillLine(g, "#b07a45", 3.5); P(g, [[x - 21, y - 30], [x + 21, y - 30], [x + 21, y + 27], [x - 21, y + 27]]); fillLine(g, "#fff", 2); for (let i = 0; i < 4; i++) line(g, [[x - 14, y - 18 + i * 11], [x + 14, y - 18 + i * 11]], 2, "#8a8a9a"); },
  flask: (g, x, y) => { const f = [[x - 7, y - 40], [x + 7, y - 40], [x + 7, y - 18], [x + 26, y + 18], [x - 26, y + 18], [x - 7, y - 18]]; P(g, f); fillLine(g, "#e9f6ff", 0); clip(g, f, () => { g.fillStyle = "#55e08a"; g.fillRect(x - 30, y - 2, 60, 24); }); P(g, f); fillLine(g, null, 3.5); ell(g, x + 6, y - 54, 6, 6, "#9cf0b8", 2.5); ell(g, x - 4, y - 70, 4, 4, "#9cf0b8", 2.5); },
  pitchfork: (g, x, y) => { line(g, [[x, y + 150], [x, y - 140]], 9); line(g, [[x, y + 150], [x, y - 140]], 5, "#a8743f"); line(g, [[x - 22, y - 140], [x + 22, y - 140]], 6); for (const dx of [-22, 0, 22]) line(g, [[x + dx, y - 140], [x + dx, y - 186]], 4.5); },
  wrench: (g, x, y) => { line(g, [[x, y], [x + 10, y - 60]], 13); line(g, [[x, y], [x + 10, y - 60]], 8, "#b6bec7"); ell(g, x + 12, y - 70, 17, 17, "#b6bec7", 3.5); ell(g, x + 12, y - 82, 7, 9, "#7a4a12", 0); },
  briefcase: (g, x, y) => { P(g, [[x - 36, y + 8], [x + 36, y + 8], [x + 36, y + 56], [x - 36, y + 56]]); fillLine(g, "#5a3524", 3.5); line(g, qc([x - 12, y + 8], [x, y - 10], [x + 12, y + 8]), 4); P(g, [[x - 5, y + 20], [x + 5, y + 20], [x + 5, y + 30], [x - 5, y + 30]]); fillLine(g, "#e5c158", 2); },
  scroll: (g, x, y) => { P(g, sup(x, y, 11, 36, 4, 4)); fillLine(g, "#f2e2b8", 3); for (const s of [-1, 1]) ell(g, x, y + s * 36, 15, 6, "#d9c08a", 3); },
  phone: (g, x, y) => { P(g, sup(x, y, 12, 22, 4, 4)); fillLine(g, "#22232b", 3); P(g, sup(x, y - 1, 9, 17, 4, 4)); fillLine(g, "#7cc4ff", 0); },
  book: (g, x, y) => { P(g, [[x - 32, y - 22], [x, y - 16], [x + 32, y - 22], [x + 32, y + 22], [x, y + 28], [x - 32, y + 22]]); fillLine(g, "#fff", 3); line(g, [[x, y - 16], [x, y + 28]], 2.5); },
  magnifier: (g, x, y) => { line(g, [[x, y], [x + 20, y - 24]], 10); line(g, [[x, y], [x + 20, y - 24]], 6, "#5a3524"); ell(g, x + 34, y - 44, 22, 22, "rgba(200,235,255,0.6)", 4.5); },
  coffee: (g, x, y) => { P(g, [[x - 14, y - 20], [x + 14, y - 20], [x + 11, y + 20], [x - 11, y + 20]]); fillLine(g, "#fff", 3); g.fillStyle = "#b0784a"; g.fillRect(x - 12, y - 6, 24, 10); P(g, [[x - 17, y - 27], [x + 17, y - 27], [x + 17, y - 19], [x - 17, y - 19]]); fillLine(g, "#5a3524", 2.5); },
  coin: (g, x, y) => { ell(g, x, y, 22, 22, "#f2c14e", 3.5); ell(g, x, y, 15, 15, null, 2); },
};

// ---------- the character ----------
// o: { kid, top, pants, shoes, outfit, tie, shirt, trim, hat, hatCol, band, hair, hairStyle, glasses, beard, moustache, goatee, backpack, sash, print, patch, laurel }
// opts: { pose: "stand"|"sit", expr, look, L, R, propL, propR, lean, headTilt, flip }
const rickBody = (g, o, opts = {}) => {
  const { pose = "stand", expr = "neutral", look = 0, L = "hang", R = "hang", propL = null, propR = null, headTilt = 0, weight = 1 } = opts;
  const kid = !!o.kid, BW = kid ? 62 : 66, BH = kid ? 170 : 225, LL = kid ? 175 : 255;
  const bodyBot = pose === "sit" ? 0 : -LL, bodyTop = bodyBot - BH;
  const hcy = bodyTop - 92 + 30, hcx = 0;
  const legCol = FC, limb = 11.5 * weight;
  const b = { cx: 0, x0: -BW, x1: BW, y0: bodyTop, y1: bodyBot, w: 2 * BW, h: BH };
  // legs
  if (pose === "sit") {
    for (const s of [-1, 1]) { const hx = s * 22, kx = s * 30, ky = bodyBot + 8, fy = bodyBot + LL * 0.66; limbStroke(g, qc([hx, bodyBot - 10], [kx + s * 2, ky - 4], [kx, ky + 6], 6), limb, limb, legCol); limbStroke(g, qc([kx, ky + 6], [kx + s * 4, (ky + fy) / 2], [kx + s * 2, fy], 10), limb, limb * 0.92, legCol); ell(g, kx + s * 12, fy + 2, 19 * weight, 9.5 * weight, o.shoes ?? FC, 0); }
  } else {
    for (const s of [-1, 1]) { const ph = opts.walk == null ? 0 : Math.sin(2 * Math.PI * (opts.walk + (s > 0 ? 0.5 : 0))), up = Math.max(0, ph) * 34, sw = ph * 10;
      const hx = s * 24, fx = hx + s * 2 + sw, fy = -6 - up; limbStroke(g, qc([hx, bodyBot - 10], [hx + s * 4 + sw * 0.5 + up * 0.4 * s, bodyBot + LL * 0.5 - up * 0.3], [fx, fy], 12), limb, limb * 0.92, legCol); ell(g, fx + s * 12, fy + 1, 19 * weight, 9.5 * weight, o.shoes ?? FC, 0); }
  }
  // backpack / long hair behind
  if (o.backpack) { P(g, sup(0, bodyTop + BH * 0.42, BW + 20, BH * 0.4, 3, 3)); fillLine(g, o.backpack, LW); }
  // arms (behind-the-body ones first)
  const sh = (s) => [s * (BW - 8), bodyTop + 52];
  const ARM = {
    hang: (s) => [sh(s), [s * (BW + 16), bodyTop + 120], [s * (BW + 12), bodyTop + 190]],
    hip: (s) => [sh(s), [s * (BW + 50), bodyTop + 110], [s * (BW - 2), bodyTop + 150]],
    wave: (s) => [sh(s), [s * (BW + 52), bodyTop + 20], [s * (BW + 62), bodyTop - 70]],
    up: (s) => [sh(s), [s * (BW + 40), bodyTop - 20], [s * (BW + 34), bodyTop - 110]],
    point: (s) => [sh(s), [s * (BW + 60), bodyTop + 50], [s * (BW + 120), bodyTop + 34]],
    hold: (s) => [sh(s), [s * (BW + 26), bodyTop + 130], [s * (BW - 30), bodyTop + 118]],
    holdUp: (s) => [sh(s), [s * (BW + 40), bodyTop + 120], [s * (BW + 34), bodyTop + 50]],
    staff: (s) => [sh(s), [s * (BW + 30), bodyTop + 120], [s * (BW + 34), bodyTop + 96]],
    chin: (s) => [sh(s), [s * (BW + 20), bodyTop + 110], [s * 20, hcy + 92]],
    mouth: (s) => [sh(s), [s * (BW + 34), bodyTop + 90], [s * 44, hcy + 56]],
    cross: (s) => [sh(s), [s * (BW + 10), bodyTop + 110], [-s * 26, bodyTop + 96]],
    thumb: (s) => [sh(s), [s * (BW + 44), bodyTop + 80], [s * (BW + 70), bodyTop + 34]],
  };
  const front = new Set(["hold", "chin", "mouth", "cross"]);
  const armPts = (s, pose) => { if (pose && typeof pose === 'object') { const A = (ARM[pose.a] ?? ARM.hang)(s), B = (ARM[pose.b] ?? ARM.hang)(s), t = pose.t; return A.map((p, i) => [p[0] + (B[i][0] - p[0]) * t, p[1] + (B[i][1] - p[1]) * t]); } return (ARM[pose] ?? ARM.hang)(s); };
  const pname = (p) => (p && typeof p === 'object' ? (p.t < 0.5 ? p.a : p.b) : p);
  const drawArm = (s, pose0, prop) => {
    const [a, k, h] = armPts(s, pose0), pose = pname(pose0);
    limbStroke(g, qc(a, k, h, 10), limb, limb * 0.9);
    if (prop && PROPS[prop] && prop !== "pipe") PROPS[prop](g, h[0], h[1]);
    ell(g, h[0], h[1], 10.5 * weight, 10.5 * weight, FC, 0);
    if (pose === "point") line(g, [[h[0], h[1]], [h[0] + s * 22, h[1] - 3]], 7, FC);
    if (pose === "thumb") line(g, [[h[0], h[1]], [h[0] + s * 4, h[1] - 22]], 7, FC);
  };
  [[-1, L, propL], [1, R, propR]].forEach(([s, p, pr]) => { if (!front.has(pname(p))) drawArm(s, p, pr); });
  // body pill
  const bcy = (bodyTop + bodyBot) / 2, pill = sup(0, bcy, BW, BH / 2, 2.2, 2.5).map(([x, y]) => [x * (1 + 0.13 * (y - bcy) / (BH / 2)), y]);
  g.save(); P(g, pill); g.clip(); (OUTFIT[o.outfit ?? "tee"])(g, b, o);
  const shg = g.createLinearGradient(-BW, 0, BW, 0); shg.addColorStop(0, "rgba(255,255,255,0.10)"); shg.addColorStop(0.55, "rgba(0,0,0,0)"); shg.addColorStop(1, "rgba(30,15,40,0.22)"); g.fillStyle = shg; g.fillRect(-BW - 10, bodyTop - 10, 2 * BW + 20, BH + 20);
  g.restore();
  inkRing(g, pill, 11 * weight, 0.35, Math.PI * 0.5, FC);
  [[-1, L, propL], [1, R, propR]].forEach(([s, p, pr]) => { if (front.has(pname(p))) drawArm(s, p, pr); });
  // head
  g.save(); if (headTilt) { g.translate(hcx, hcy + 90); g.rotate(headTilt * D2R); g.translate(-hcx, -(hcy + 90)); }
  if (HAIR_BEHIND[o.hairStyle] && !["hardhat", "pilot"].includes(o.hat)) HAIR_BEHIND[o.hairStyle](g, hcx, hcy, o);
  const hp = sup(hcx, hcy, 102, 95, 2.05, 2.25, 80);
  softShade(g, hp, hcx, hcy, 100, HEAD, HEAD_SH); inkRing(g, hp, 12 * weight, 0.35, Math.PI * 0.5, FC);
  if (o.beard) { const bc = o.beard, top = hcy + 62;
    const bp = [[hcx - 72, top - 18], ...qc([hcx - 72, top - 18], [hcx - 92, top + 70], [hcx - 40, top + 104]), ...qc([hcx - 40, top + 104], [hcx - 20, top + 92], [hcx, top + 118]), ...qc([hcx, top + 118], [hcx + 20, top + 92], [hcx + 40, top + 104]), ...qc([hcx + 40, top + 104], [hcx + 92, top + 70], [hcx + 72, top - 18]), ...qc([hcx + 72, top - 18], [hcx, top + 20], [hcx - 72, top - 18])];
    softShade(g, bp, hcx, top + 40, 90, bc, mulc(bc, 0.82)); inkRing(g, bp, 9 * weight, 0.3, Math.PI * 0.5, FC);
    for (const dx of [-36, -12, 12, 36]) line(g, qc([hcx + dx, top + 34], [hcx + dx * 1.15, top + 62], [hcx + dx * 0.9, top + 88]), 3, mulc(bc, 0.78)); }
  g.save(); g.translate(hcx, hcy - 8); g.scale(1.2, 1.2); g.translate(-hcx, -(hcy - 8));
  face(g, hcx, hcy, expr, look, { blink: opts.blink, talk: opts.talk, moustache: o.moustache, goatee: o.goatee, browCol: o.beard && o.hairStyle === "bald" ? "#9a958c" : LINE });
  g.restore();
  
  if (o.glasses === "goggles") { line(g, [[hcx - 100, hcy + 6], [hcx + 100, hcy + 6]], 9, "#3b3f52"); for (const s of [-1, 1]) ell(g, hcx + s * 30, hcy + 10, 22, 20, "rgba(190,232,255,0.55)", 5); }
  else if (o.glasses === "aviator") { for (const s of [-1, 1]) { P(g, [[hcx + s * 6, hcy - 4], [hcx + s * 54, hcy - 6], [hcx + s * 50, hcy + 20], [hcx + s * 30, hcy + 28], [hcx + s * 10, hcy + 16]]); fillLine(g, "#2a2f3a", 3.5); } line(g, [[hcx - 6, hcy - 2], [hcx + 6, hcy - 2]], 3.5); }
  else if (o.glasses === "round") { for (const s of [-1, 1]) ell(g, hcx + s * 30, hcy + 10, 20, 18, "rgba(255,255,255,0.25)", 4); line(g, [[hcx - 10, hcy + 8], [hcx + 10, hcy + 8]], 4); }
  const hk = o.hat ?? o.hairStyle ?? (o.hair ? "hair" : null);
  const FIT = { cap: [14, 1], fedora: [30, 0.9], hardhat: [28, 0.84], straw: [30, 0.95], pilot: [16, 0.86], beanie: [26, 0.84], tophat: [24, 0.95], hair: [10, 1], bun: [10, 1], long: [10, 1], pigtails: [10, 1], spiky: [6, 1], curly: [10, 1] };
  if (hk && HATS[hk]) { const [dy, sx] = FIT[hk] ?? [0, 1]; g.save(); g.translate(hcx, hcy - dy); g.scale(sx, 1); HATS[hk](g, 0, 0, o); g.restore(); }
  if (o.laurel) HATS.laurel(g, hcx, hcy, o);
  if (propL === "pipe" || propR === "pipe") PROPS.pipe(g, hcx + 30, hcy + 30);
  g.restore();
};
export const SIT_LIFT = (kid) => 0; // in pose "sit" the origin is the seat (bottom of the body)

// squash & stretch around the feet; everything else lives in rickBody
export const rick = (g, o, opts = {}) => { const q = opts.squash || 0; if (!q) return rickBody(g, o, opts); g.save(); g.scale(1 + q, 1 - q); rickBody(g, o, opts); g.restore(); };


// ---------- story additions, same locked look (thick FC ink, soft shade, painted detail) ----------
OUTFIT.dress = (g, b, o) => {
  const c = o.top ?? "#8a4f7d"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // white collar, buttons, belt, skirt pleats
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 6], [b.cx + s * 40, b.y0 - 6], [b.cx + s * 30, b.y0 + 26]]); fillLine(g, "#f6f1e6", 3); }
  for (const k of [50, 80]) ell(g, b.cx, b.y0 + k, 5, 5, "#f6f1e6", 2.5);
  g.fillStyle = mulc(c, 0.7); g.fillRect(b.x0 - 20, b.y0 + 108, b.w + 40, 14); line(g, [[b.x0 - 20, b.y0 + 108], [b.x1 + 20, b.y0 + 108]], 2.5); line(g, [[b.x0 - 20, b.y0 + 122], [b.x1 + 20, b.y0 + 122]], 2.5);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 22, b.y0 + 130], [b.cx + i * 30, b.y1 + 10]], 2.2, mulc(c, 0.72));
};
HATS.flatcap = (g, cx, cy, o) => { const c = o.hatCol ?? "#6b5a48"; g.save(); g.translate(cx, cy - 12); g.rotate(-5 * D2R);
  const top = [[-84, -62], ...qc([-84, -62], [-92, -128], [10, -126]), ...qc([10, -126], [104, -120], [96, -62]), ...qc([96, -62], [10, -74], [-84, -62])];
  softShade(g, top, 0, -100, 95, c, mulc(c, 0.7)); clip(g, top, () => { for (let i = -5; i <= 5; i++) line(g, [[i * 18, -130], [i * 20, -60]], 1.6, mulc(c, 0.8)); });
  inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC); ell(g, 6, -124, 8, 5, mulc(c, 0.85), 3.5);
  const vis = [...qc([-66, -66], [10, -78], [86, -66]), ...qc([86, -66], [20, -46], [-66, -66])]; softShade(g, vis, 0, -60, 70, mulc(c, 0.9), mulc(c, 0.62)); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.bowler = (g, cx, cy, o) => { const c = o.hatCol ?? "#2a2428"; g.save(); g.translate(cx, cy - 14); g.rotate(-4 * D2R);
  const dome = [[-74, -70], ...qc([-74, -70], [-80, -170], [0, -168]), ...qc([0, -168], [80, -170], [74, -70])];
  softShade(g, dome, 0, -120, 85, c, mulc(c, 0.6)); clip(g, dome, () => { g.fillStyle = "#4a2a2e"; g.fillRect(-90, -96, 180, 22); line(g, [[-30, -150], [-20, -110]], 6, mulc(c, 1.8)); }); inkRing(g, dome, 9, 0.3, Math.PI * 0.5, FC);
  const br = sup(0, -70, 112, 15, 2, 2); softShade(g, br, 0, -70, 110, mulc(c, 1.1), mulc(c, 0.7)); inkRing(g, br, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.gendarme = (g, cx, cy, o) => { const c = "#26304d"; g.save(); g.translate(cx, cy - 10);
  const top = [[-82, -62], [-90, -146], ...qc([-90, -146], [0, -158], [90, -146]), [82, -62]]; softShade(g, top, 0, -110, 95, c, mulc(c, 0.65));
  clip(g, top, () => { g.fillStyle = "#b52a32"; g.fillRect(-100, -150, 200, 16); g.fillStyle = "#e5c158"; g.fillRect(-100, -86, 200, 8); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  ell(g, 0, -114, 11, 13, "#e5c158", 4);
  const vis = [...qc([-70, -64], [0, -72], [70, -64]), ...qc([70, -64], [0, -40], [-70, -64])]; softShade(g, vis, 0, -58, 70, "#141826", "#0b0d16"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
OUTFIT.uniform = (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: "#26304d", tie: "#141826", trim: "#e5c158" }); for (const k of [120, 150, 180]) ell(g, b.cx, b.y0 + k, 5, 5, "#e5c158", 2.5); P(g, [[b.cx + 30, b.y0 + 40], [b.cx + 52, b.y0 + 40], [b.cx + 52, b.y0 + 62], [b.cx + 41, b.y0 + 70], [b.cx + 30, b.y0 + 62]]); fillLine(g, "#e5c158", 2.5); };
OUTFIT.apron = (g, b, o) => { OUTFIT.tee(g, b, o); P(g, [[b.cx - 46, b.y0 + 40], [b.cx + 46, b.y0 + 40], [b.cx + 56, b.y1 + 20], [b.cx - 56, b.y1 + 20]]); fillLine(g, "#f1ece0", 3); line(g, [[b.cx - 46, b.y0 + 40], [b.cx - 40, b.y0 - 10]], 3); line(g, [[b.cx + 46, b.y0 + 40], [b.cx + 40, b.y0 - 10]], 3); P(g, [[b.cx - 22, b.y0 + 110], [b.cx + 22, b.y0 + 110], [b.cx + 22, b.y0 + 140], [b.cx - 22, b.y0 + 140]]); fillLine(g, "#e6dfd0", 2.5); };
PROPS.envelope = (g, x, y) => { P(g, [[x - 34, y - 22], [x + 34, y - 22], [x + 34, y + 22], [x - 34, y + 22]]); fillLine(g, "#efe3c4", 4, FC); line(g, [[x - 34, y - 22], [x, y + 4], [x + 34, y - 22]], 3.5, FC); ell(g, x, y + 4, 7, 7, "#b52a32", 2.5); P(g, [[x - 20, y - 30], [x + 18, y - 30], [x + 18, y - 22], [x - 20, y - 22]]); fillLine(g, "#7fae5a", 2.5, FC); };
PROPS.bill = (g, x, y) => { P(g, [[x - 26, y - 30], [x + 26, y - 30], [x + 30, y + 190], [x - 22, y + 196]]); fillLine(g, "#fbf6e8", 4, FC); for (let i = 0; i < 12; i++) line(g, [[x - 16, y - 14 + i * 16], [x + 16 + (i % 3) * 3, y - 14 + i * 16]], 3, "#8a8a9a"); g.fillStyle = "#c0392b"; g.font = "bold 30px sans-serif"; g.fillText("$$$", x - 22, y + 184); ell(g, x, y - 32, 30, 8, "#e8dfc8", 3.5); };
PROPS.cash = (g, x, y) => { for (let i = 0; i < 3; i++) { P(g, [[x - 34, y - 14 + i * 7], [x + 34, y - 18 + i * 7], [x + 36, y + 10 + i * 7], [x - 32, y + 14 + i * 7]]); fillLine(g, "#8fbf6a", 3.5, FC); } ell(g, x, y + 4, 9, 9, "#5f8a3c", 2.5); };
PROPS.cigar = (g, x, y) => { line(g, [[x, y], [x + 34, y + 6]], 11, FC); line(g, [[x, y], [x + 34, y + 6]], 6.5, "#7a4a2a"); ell(g, x + 36, y + 6, 5, 5, "#ff8a3d", 0); };

// ---------- "The Village With No Doors" cast: new outfits & hats in the locked rick.js look ----------
// Same ink (FC), same soft shade, same thick inkRing. Faces untouched (pure white, drawn by rick.js).

OUTFIT.kurta = (g, b, o) => {
  const c = o.top ?? "#f2b733"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // mandarin collar + button placket
  P(g, [[b.cx - 26, b.y0 - 6], [b.cx + 26, b.y0 - 6], [b.cx + 24, b.y0 + 12], [b.cx - 24, b.y0 + 12]]); fillLine(g, mulc(c, 0.85), 3);
  P(g, [[b.cx - 9, b.y0 + 10], [b.cx + 9, b.y0 + 10], [b.cx + 9, b.y0 + 96], [b.cx - 9, b.y0 + 96]]); fillLine(g, o.trim ?? mulc(c, 0.8), 2.5);
  for (const k of [28, 52, 76]) ell(g, b.cx, b.y0 + k, 4.5, 4.5, "#f6efe0", 2);
  // embroidered hem + side slits
  const hy = b.y1 - 34; g.fillStyle = o.trim ?? mulc(c, 0.75); g.fillRect(b.x0 - 20, hy, b.w + 40, 12); line(g, [[b.x0 - 20, hy], [b.x1 + 20, hy]], 2.5); line(g, [[b.x0 - 20, hy + 12], [b.x1 + 20, hy + 12]], 2.5);
  for (let i = -4; i <= 4; i++) ell(g, b.cx + i * 18, hy + 6, 3, 3, "#fff4c8", 0);
  for (const s of [-1, 1]) line(g, [[b.cx + s * 58, hy - 40], [b.cx + s * 60, b.y1 + 10]], 3);
  // pyjama legs peeking under the hem
  g.fillStyle = o.pants ?? "#f3eee2"; g.fillRect(b.x0 - 20, b.y1 - 20, b.w + 40, 40); line(g, [[b.x0 - 20, b.y1 - 20], [b.x1 + 20, b.y1 - 20]], 3);
  if (o.pocket) { P(g, [[b.cx + 22, b.y0 + 34], [b.cx + 48, b.y0 + 34], [b.cx + 48, b.y0 + 58], [b.cx + 22, b.y0 + 58]]); fillLine(g, mulc(c, 0.9), 2.5); }
};
OUTFIT.nehru = (g, b, o) => {
  OUTFIT.kurta(g, b, { ...o, top: o.shirt ?? "#f6f2e8", trim: "#d9cfba" });
  const v = o.top ?? "#e0782a";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 14, b.y0 - 8], [b.cx + s * 90, b.y0 - 20], [b.cx + s * 90, b.y1 - 52], [b.cx + s * 6, b.y1 - 46], [b.cx + s * 6, b.y0 + 20]]); fillLine(g, v, 3);
    g.setLineDash([5, 5]); line(g, [[b.cx + s * 12, b.y0 + 20], [b.cx + s * 12, b.y1 - 52]], 2, mulc(v, 1.35)); g.setLineDash([]); }
  P(g, [[b.cx - 56, b.y0 + 70], [b.cx - 28, b.y0 + 70], [b.cx - 28, b.y0 + 76], [b.cx - 56, b.y0 + 76]]); fillLine(g, mulc(v, 0.7), 2);
  for (const k of [40, 80, 120]) ell(g, b.cx - 14, b.y0 + k, 5, 5, "#e5c158", 2.2);
};
OUTFIT.saree = (g, b, o) => {
  const bl = o.blouse ?? "#2c8a7a", c = o.top ?? "#d1386b", gold = "#f2c14e";
  g.fillStyle = bl; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // skirt part with pleats
  P(g, [[b.x0 - 20, b.y0 + 104], [b.x1 + 20, b.y0 + 96], [b.x1 + 20, b.y1 + 20], [b.x0 - 20, b.y1 + 20]]); fillLine(g, c, 3);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 16, b.y0 + 120], [b.cx + i * 22, b.y1 + 10]], 2.4, mulc(c, 0.72));
  g.fillStyle = gold; g.fillRect(b.x0 - 20, b.y1 - 24, b.w + 40, 10); line(g, [[b.x0 - 20, b.y1 - 24], [b.x1 + 20, b.y1 - 24]], 2); line(g, [[b.x0 - 20, b.y1 - 14], [b.x1 + 20, b.y1 - 14]], 2);
  // pallu: diagonal drape over the left shoulder
  const pl = [[b.cx - 70, b.y0 - 20], [b.cx - 20, b.y0 - 20], [b.cx + 90, b.y0 + 110], [b.cx + 90, b.y0 + 160], [b.cx + 40, b.y0 + 128]];
  P(g, pl); fillLine(g, c, 3); line(g, [[b.cx - 22, b.y0 - 16], [b.cx + 88, b.y0 + 112]], 6, gold); line(g, [[b.cx - 22, b.y0 - 16], [b.cx + 88, b.y0 + 112]], 2, FC);
  for (let i = 0; i < 4; i++) ell(g, b.cx - 30 + i * 26, b.y0 + 20 + i * 30, 4, 4, gold, 0);
};
OUTFIT.khaki = (g, b, o) => {
  const c = "#c8a86a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 36, b.y0 - 8], [b.cx + s * 26, b.y0 + 24]]); fillLine(g, mulc(c, 0.88), 2.5);
    P(g, [[b.cx + s * 18, b.y0 + 44], [b.cx + s * 52, b.y0 + 44], [b.cx + s * 52, b.y0 + 76], [b.cx + s * 18, b.y0 + 76]]); fillLine(g, mulc(c, 0.92), 2.5); line(g, [[b.cx + s * 18, b.y0 + 52], [b.cx + s * 52, b.y0 + 52]], 2.2);
    P(g, [[b.cx + s * 44, b.y0 - 10], [b.cx + s * 76, b.y0 - 4], [b.cx + s * 74, b.y0 + 8], [b.cx + s * 44, b.y0 + 4]]); fillLine(g, "#b52a32", 2.2); }
  line(g, [[b.cx, b.y0 + 4], [b.cx, b.y0 + 140]], 2.5); for (const k of [30, 70, 110]) ell(g, b.cx, b.y0 + k, 4, 4, "#e5c158", 2);
  g.fillStyle = "#5a3524"; g.fillRect(b.x0 - 20, b.y0 + 146, b.w + 40, 16); line(g, [[b.x0 - 20, b.y0 + 146], [b.x1 + 20, b.y0 + 146]], 2.5); line(g, [[b.x0 - 20, b.y0 + 162], [b.x1 + 20, b.y0 + 162]], 2.5);
  P(g, [[b.cx - 12, b.y0 + 144], [b.cx + 12, b.y0 + 144], [b.cx + 12, b.y0 + 164], [b.cx - 12, b.y0 + 164]]); fillLine(g, "#e5c158", 2.5);
  g.fillStyle = mulc(c, 0.85); g.fillRect(b.x0 - 20, b.y0 + 162, b.w + 40, 80);
  P(g, [[b.cx + 22, b.y0 + 84], [b.cx + 52, b.y0 + 84], [b.cx + 52, b.y0 + 94], [b.cx + 22, b.y0 + 94]]); fillLine(g, "#1e2433", 2);
};
OUTFIT.stripe = (g, b, o) => { OUTFIT.tee(g, b, { ...o, top: o.top ?? "#3b3f52" }); for (let i = 0; i < 6; i++) { g.fillStyle = o.stripe ?? "#e9e4d6"; g.fillRect(b.x0 - 20, b.y0 + 18 + i * 30, b.w + 40, 11); } line(g, qc([b.cx - 26, b.y0 - 4], [b.cx, b.y0 + 20], [b.cx + 26, b.y0 - 4]), 3); };
OUTFIT.shawl = (g, b, o) => { OUTFIT.kurta(g, b, { ...o, top: o.shirt ?? "#f6f2e8", trim: "#d9cfba" }); const c = o.top ?? "#ff8c1a";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 10, b.y0 - 20], [b.cx + s * 92, b.y0 - 20], [b.cx + s * 92, b.y0 + 120], [b.cx + s * 30, b.y0 + 150]]); fillLine(g, c, 3); line(g, [[b.cx + s * 30, b.y0 + 150], [b.cx + s * 92, b.y0 + 120]], 5, "#b52a32"); }
  for (let i = 0; i < 3; i++) ell(g, b.cx + 50, b.y0 + 30 + i * 28, 5, 5, "#f2c14e", 2); };
OUTFIT.sweater = (g, b, o) => { OUTFIT.school(g, b, { ...o, top: o.shirt ?? "#eaf1f7", tie: o.tie ?? "#7c2630" }); const c = o.top ?? "#5c7aa8";
  P(g, [[b.x0 - 20, b.y0 - 20], [b.cx - 34, b.y0 - 20], [b.cx, b.y0 + 64], [b.cx + 34, b.y0 - 20], [b.x1 + 20, b.y0 - 20], [b.x1 + 20, b.y1 - 46], [b.x0 - 20, b.y1 - 46]]); fillLine(g, c, 3);
  for (let i = -3; i <= 3; i++) line(g, [[b.cx + i * 20, b.y0 + 90], [b.cx + i * 20, b.y1 - 50]], 1.8, mulc(c, 0.8)); };

HATS.topi = (g, cx, cy, o) => { const c = o.hatCol ?? "#f7f4ec"; g.save(); g.translate(cx, cy - 10); g.rotate(-4 * D2R);
  const cap = [[-88, -60], ...qc([-88, -60], [-60, -130], [0, -124]), ...qc([0, -124], [64, -132], [90, -62]), ...qc([90, -62], [0, -74], [-88, -60])];
  softShade(g, cap, 0, -96, 90, c, mulc(c, 0.8)); clip(g, cap, () => { line(g, qc([-70, -78], [0, -118], [70, -80]), 2.4, mulc(c, 0.75)); g.fillStyle = mulc(c, 0.9); g.fillRect(-100, -82, 200, 16); });
  inkRing(g, cap, 9, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.police = (g, cx, cy, o) => { const c = "#b89858"; g.save(); g.translate(cx, cy - 12); g.rotate(-5 * D2R);
  const top = [[-84, -60], [-96, -138], ...qc([-96, -138], [0, -156], [96, -138]), [84, -60]]; softShade(g, top, 0, -110, 95, c, mulc(c, 0.7));
  clip(g, top, () => { g.fillStyle = "#b52a32"; g.fillRect(-110, -86, 220, 24); line(g, [[-110, -86], [110, -86]], 2.5); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  ell(g, 0, -112, 12, 14, "#e5c158", 4);
  const vis = [...qc([-72, -62], [0, -70], [72, -62]), ...qc([72, -62], [0, -36], [-72, -62])]; softShade(g, vis, 0, -54, 70, "#2a1f18", "#140d09"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.pagdi = (g, cx, cy, o) => { const c = o.hatCol ?? "#e8572a"; g.save(); g.translate(cx, cy - 14);
  const d = [[-98, -40], ...qc([-98, -40], [-112, -150], [0, -150]), ...qc([0, -150], [112, -150], [98, -40]), ...qc([98, -40], [0, -62], [-98, -40])];
  softShade(g, d, 0, -100, 100, c, mulc(c, 0.72)); clip(g, d, () => { for (let i = 0; i < 5; i++) line(g, qc([-110, -50 - i * 22], [0, -96 - i * 18], [110, -70 - i * 18]), 3, mulc(c, 0.7)); });
  inkRing(g, d, 9, 0.3, Math.PI * 0.5, FC); ell(g, 18, -112, 13, 13, "#f2c14e", 3.5); g.restore(); };
HATS.capkid = (g, cx, cy, o) => HATS.cap(g, cx, cy, o);

PROPS.bat = (g, x, y) => { line(g, [[x, y], [x + 10, y - 40]], 9); line(g, [[x, y], [x + 10, y - 40]], 5, "#c99b5a"); P(g, [[x + 4, y - 40], [x + 20, y - 40], [x + 34, y - 170], [x + 16, y - 172]]); fillLine(g, "#e8c98a", 4); };
PROPS.camera = (g, x, y) => { P(g, [[x - 26, y - 18], [x + 26, y - 18], [x + 26, y + 18], [x - 26, y + 18]]); fillLine(g, "#2a2f3a", 3.5); ell(g, x, y, 11, 11, "#7cc4ff", 3); P(g, [[x - 16, y - 26], [x - 2, y - 26], [x - 2, y - 18], [x - 16, y - 18]]); fillLine(g, "#2a2f3a", 2.5); };
PROPS.baton = (g, x, y) => { line(g, [[x, y + 20], [x + 30, y - 70]], 11); line(g, [[x, y + 20], [x + 30, y - 70]], 6, "#6a3f22"); };
PROPS.sack = (g, x, y) => { P(g, sup(x, y + 30, 34, 38, 2.2, 2.6)); fillLine(g, "#c9a86a", 4); line(g, [[x - 12, y - 4], [x + 12, y - 4]], 4); };
PROPS.chai = (g, x, y) => { P(g, [[x - 11, y - 14], [x + 11, y - 14], [x + 8, y + 14], [x - 8, y + 14]]); fillLine(g, "#e9f2f6", 3); g.fillStyle = "#c08a52"; g.fillRect(x - 10, y - 10, 20, 8); };
PROPS.pot = (g, x, y) => { P(g, sup(x, y - 30, 30, 28, 2, 2)); fillLine(g, "#c8742f", 4); P(g, [[x - 12, y - 64], [x + 12, y - 64], [x + 10, y - 54], [x - 10, y - 54]]); fillLine(g, "#b0612a", 3); };
PROPS.suitcase = (g, x, y) => { P(g, [[x - 40, y + 10], [x + 40, y + 10], [x + 40, y + 96], [x - 40, y + 96]]); fillLine(g, "#2f6fb0", 4); line(g, qc([x - 14, y + 10], [x, y - 8], [x + 14, y + 10]), 4); for (const s of [-1, 1]) line(g, [[x + s * 24, y + 14], [x + s * 24, y + 92]], 3, "#1f4e80"); };

