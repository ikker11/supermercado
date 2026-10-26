import * as THREE from 'three';

/* =========================================================
   Súper Barrio — simulador de supermercado en primera persona
   ========================================================= */

const $ = id => document.getElementById(id);
const EF = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const eur = x => EF.format(x);
const r2 = x => Math.round(x * 100) / 100;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');

/* ---------------- datos del juego ---------------- */
const GROUPS = [
  { id: 'basicos',  n: 'Básicos',          lvl: 1, cost: 0 },
  { id: 'desayuno', n: 'Desayunos',        lvl: 2, cost: 250 },
  { id: 'despensa', n: 'Despensa',         lvl: 3, cost: 600 },
  { id: 'frescos',  n: 'Frescos',          lvl: 5, cost: 1500 },
  { id: 'limpieza', n: 'Limpieza',         lvl: 7, cost: 3000 },
  { id: 'snacks',   n: 'Snacks y bebidas', lvl: 9, cost: 5000 },
];
// s: forma · sz: [ancho, alto, fondo] en metros · u: unidades por caja · bc: coste de la caja · m: precio de mercado
const PRODUCTS = [
  { id: 'agua',      n: 'Agua 1,5 L',       g: 'basicos',  s: 'bottle', sz: [.09, .32, .09], c: '#6ec6ff', u: 12, bc: 4.8,  m: .75 },
  { id: 'pan',       n: 'Pan de molde',     g: 'basicos',  s: 'box',    sz: [.13, .13, .26], c: '#e9b872', u: 10, bc: 9,    m: 1.6 },
  { id: 'leche',     n: 'Leche',            g: 'basicos',  s: 'box',    sz: [.09, .22, .07], c: '#f5f7fa', u: 12, bc: 9.6,  m: 1.15 },
  { id: 'arroz',     n: 'Arroz 1 kg',       g: 'basicos',  s: 'box',    sz: [.14, .2, .06],  c: '#efe3bf', u: 12, bc: 10.8, m: 1.4 },
  { id: 'cereales',  n: 'Cereales',         g: 'desayuno', s: 'box',    sz: [.2, .28, .07],  c: '#e85d3a', u: 8,  bc: 14,   m: 2.9 },
  { id: 'galletas',  n: 'Galletas',         g: 'desayuno', s: 'box',    sz: [.18, .07, .1],  c: '#b5651d', u: 12, bc: 12,   m: 1.7 },
  { id: 'cafe',      n: 'Café molido',      g: 'desayuno', s: 'can',    sz: [.1, .14, .1],   c: '#5b3a29', u: 10, bc: 22,   m: 3.6 },
  { id: 'zumo',      n: 'Zumo de naranja',  g: 'desayuno', s: 'box',    sz: [.09, .24, .07], c: '#ffa726', u: 12, bc: 12,   m: 1.7 },
  { id: 'pasta',     n: 'Macarrones',       g: 'despensa', s: 'box',    sz: [.12, .22, .05], c: '#f2c230', u: 16, bc: 11,   m: 1.1 },
  { id: 'tomate',    n: 'Tomate frito',     g: 'despensa', s: 'can',    sz: [.08, .11, .08], c: '#d32f2f', u: 24, bc: 12,   m: .8 },
  { id: 'aceite',    n: 'Aceite de oliva',  g: 'despensa', s: 'bottle', sz: [.08, .3, .08],  c: '#c0ca33', u: 12, bc: 54,   m: 7.5 },
  { id: 'atun',      n: 'Atún en lata',     g: 'despensa', s: 'can',    sz: [.1, .04, .1],   c: '#1e88e5', u: 24, bc: 28,   m: 1.9 },
  { id: 'manzanas',  n: 'Manzanas',         g: 'frescos',  s: 'round',  sz: [.08, .08, .08], c: '#e53935', u: 30, bc: 9,    m: .5 },
  { id: 'platanos',  n: 'Plátanos',         g: 'frescos',  s: 'box',    sz: [.2, .07, .12],  c: '#fdd835', u: 12, bc: 10,   m: 1.4 },
  { id: 'huevos',    n: 'Huevos (12)',      g: 'frescos',  s: 'box',    sz: [.26, .07, .11], c: '#d7ccc8', u: 12, bc: 16,   m: 2.2 },
  { id: 'queso',     n: 'Queso curado',     g: 'frescos',  s: 'can',    sz: [.15, .07, .15], c: '#ffd54f', u: 8,  bc: 28,   m: 5.9 },
  { id: 'detergente',n: 'Detergente',       g: 'limpieza', s: 'bottle', sz: [.14, .3, .14],  c: '#1565c0', u: 6,  bc: 33,   m: 8.5 },
  { id: 'lavavajillas', n: 'Lavavajillas',  g: 'limpieza', s: 'bottle', sz: [.07, .24, .07], c: '#66bb6a', u: 12, bc: 18,   m: 2.4 },
  { id: 'papel',     n: 'Papel higiénico',  g: 'limpieza', s: 'box',    sz: [.24, .22, .2],  c: '#fafafa', u: 6,  bc: 15,   m: 3.9 },
  { id: 'esponjas',  n: 'Esponjas',         g: 'limpieza', s: 'box',    sz: [.12, .06, .09], c: '#fbc02d', u: 20, bc: 12,   m: 1.0 },
  { id: 'patatas',   n: 'Patatas fritas',   g: 'snacks',   s: 'box',    sz: [.16, .24, .06], c: '#ffca28', u: 12, bc: 12,   m: 1.6 },
  { id: 'chocolate', n: 'Chocolate',        g: 'snacks',   s: 'box',    sz: [.16, .03, .08], c: '#6d4c41', u: 20, bc: 16,   m: 1.3 },
  { id: 'refresco',  n: 'Refresco cola',    g: 'snacks',   s: 'can',    sz: [.07, .12, .07], c: '#c62828', u: 24, bc: 12,   m: .8 },
  { id: 'golosinas', n: 'Golosinas',        g: 'snacks',   s: 'box',    sz: [.12, .16, .05], c: '#ec407a', u: 16, bc: 13,   m: 1.3 },
];
const PB = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

const LEVELS = [
  { W: 10, D: 8,  cost: 0,     lvl: 1,  rent: 25 },
  { W: 10, D: 11, cost: 1500,  lvl: 3,  rent: 45 },
  { W: 14, D: 11, cost: 4000,  lvl: 5,  rent: 70 },
  { W: 14, D: 14, cost: 9000,  lvl: 8,  rent: 110 },
  { W: 18, D: 14, cost: 18000, lvl: 11, rent: 160 },
];
const XMAX = 5, DOOR_X = [2.2, 3.8], RX = 4.25, WALL_H = 3.2;
const OPEN_MIN = 8 * 60, CLOSE_MIN = 22 * 60;
const TIERS = [0.12, 0.55, 0.98, 1.41];
const SHELF_COST = 150, DELIVERY_SEC = 20;
const WAGE = { caj: 70, rep: 55 };
const REP_LVL = [3, 6, 9];
const CAJ_LVL = 4;
const PLAYER_R = 0.28, EYE = 1.6;
const SAVE_KEY = 'super-barrio-v1';

/* ---------------- estado ---------------- */
let S;      // estado guardado
const R = { // estado en ejecución
  paused: true, boxes: [], shelves: {}, customers: [], queue: [], staff: [], peds: [], cars: [],
  inter: [], col: [], held: null, target: null, cart: {}, spawnAcc: 0,
  co: { stage: 'idle', cust: null, items: [], total: 0, method: null, given: 0, autoT: 0 },
  dayOver: false, uid: 1, saveT: 0,
};

function freshState() {
  const price = {}, market = {};
  PRODUCTS.forEach(p => { market[p.id] = p.m; price[p.id] = p.m; });
  return {
    v: 1, name: 'Súper Barrio', money: 300, xp: 0, level: 1, day: 1, time: OPEN_MIN,
    open: false, started: false, storeLvl: 0, rep: 50,
    lic: { basicos: true }, price, market,
    shelves: { '0:0': { p: null, n: 0 }, '0:1': { p: null, n: 0 } },
    boxes: [], orders: [], staff: { caj: 0, rep: 0 },
    stats: { served: 0, total: 0 },
    dayStats: { sales: 0, served: 0, lost: 0, purchases: 0, other: 0 },
    cheats: { instant: false, free: false, speed: 1, fast: false },
    player: { x: 3, z: -1.6, yaw: 0 }, everOrdered: false,
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.v === 1) return Object.assign(freshState(), d); }
  } catch (e) { /* sin guardado */ }
  return null;
}
function snapshotBoxes() {
  return R.boxes.map(b => {
    const w = new THREE.Vector3(); b.mesh.getWorldPosition(w);
    return { p: b.p, n: b.n, x: r2(w.x), z: r2(w.z) };
  });
}
function save() {
  if (!S) return;
  S.boxes = snapshotBoxes();
  S.player = { x: r2(P.x), z: r2(P.z), yaw: r2(P.yaw) };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* almacenamiento lleno o bloqueado */ }
}

/* ---------------- three.js ---------------- */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9fd3f5');
scene.fog = new THREE.Fog('#9fd3f5', 30, 90);
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 150);
camera.rotation.order = 'YXZ';
scene.add(camera);
const hemi = new THREE.HemisphereLight(0xffffff, 0x8a9a92, 1.15);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.7);
sun.position.set(5, 10, 6);
scene.add(sun);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* ---------------- texturas de canvas ---------------- */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { c, ctx, t };
}
function lightOrDark(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
const LABEL_TEX = {}, BOX_TEX = {}, ITEM_GEO = {}, ITEM_MAT = {};
function labelTex(p) {
  if (LABEL_TEX[p.id]) return LABEL_TEX[p.id];
  const { t } = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = p.c; x.fillRect(0, 0, w, h);
    x.fillStyle = lightOrDark(p.c) ? '#1b2420' : '#ffffff';
    x.fillRect(0, h * .38, w, h * .26);
    x.fillStyle = lightOrDark(p.c) ? '#ffffff' : p.c;
    x.font = 'bold 20px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(p.n.split(' ')[0].toUpperCase(), w / 2, h / 2 + 1);
  });
  return (LABEL_TEX[p.id] = t);
}
function itemGeo(p) {
  if (ITEM_GEO[p.id]) return ITEM_GEO[p.id];
  const [w, h, d] = p.sz; let g;
  if (p.s === 'bottle') g = new THREE.CylinderGeometry(w * .3, w * .5, h, 10);
  else if (p.s === 'can') g = new THREE.CylinderGeometry(w / 2, w / 2, h, 14);
  else if (p.s === 'round') g = new THREE.SphereGeometry(w / 2, 10, 8);
  else g = new THREE.BoxGeometry(w, h, d);
  return (ITEM_GEO[p.id] = g);
}
function itemMat(p) {
  if (ITEM_MAT[p.id]) return ITEM_MAT[p.id];
  const m = p.s === 'round' ? new THREE.MeshLambertMaterial({ color: p.c })
    : new THREE.MeshLambertMaterial({ map: labelTex(p) });
  return (ITEM_MAT[p.id] = m);
}
/* dibujo 2D de cada producto (ordenador, cajas de cartón) */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => clamp(v + amt, 0, 255);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function rr(x, X, Y, W, H, r) {
  x.beginPath(); x.moveTo(X + r, Y); x.lineTo(X + W - r, Y); x.quadraticCurveTo(X + W, Y, X + W, Y + r);
  x.lineTo(X + W, Y + H - r); x.quadraticCurveTo(X + W, Y + H, X + W - r, Y + H); x.lineTo(X + r, Y + H);
  x.quadraticCurveTo(X, Y + H, X, Y + H - r); x.lineTo(X, Y + r); x.quadraticCurveTo(X, Y, X + r, Y); x.closePath();
}
function labelText(x, p, cx, cy, maxW, size) {
  x.fillStyle = lightOrDark(p.c) ? '#1b2420' : '#ffffff';
  x.font = `900 ${size}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(p.n.split(' ')[0].toUpperCase(), cx, cy, maxW);
}
function drawProduct(x, p, ox, oy, s) {
  x.save(); x.translate(ox, oy);
  const c = p.c, dk = shade(c, -45), lt = shade(c, 45);
  x.lineJoin = 'round';
  // sombra
  x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.ellipse(s * .5, s * .92, s * .32, s * .05, 0, 0, Math.PI * 2); x.fill();
  if (p.id === 'manzanas') {
    [[.32, .58], [.62, .6], [.47, .38]].forEach(([u, v]) => {
      x.fillStyle = c; x.beginPath(); x.arc(s * u, s * v, s * .17, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.arc(s * (u - .06), s * (v - .06), s * .045, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#5a3a1a'; x.lineWidth = s * .025; x.beginPath(); x.moveTo(s * u, s * (v - .15)); x.lineTo(s * (u + .02), s * (v - .22)); x.stroke();
      x.fillStyle = '#43a047'; x.beginPath(); x.ellipse(s * (u + .06), s * (v - .2), s * .05, s * .022, -.5, 0, Math.PI * 2); x.fill();
    });
  } else if (p.id === 'platanos') {
    x.lineCap = 'round';
    [0, 1, 2].forEach(i => {
      x.strokeStyle = shade(c, -20 + i * 15); x.lineWidth = s * .13;
      x.beginPath(); x.arc(s * .5, s * (.2 + i * .06), s * .4, Math.PI * .22, Math.PI * .78); x.stroke();
    });
    x.strokeStyle = '#5d4037'; x.lineWidth = s * .05; x.beginPath(); x.moveTo(s * .2, s * .52); x.lineTo(s * .14, s * .46); x.stroke();
  } else if (p.id === 'huevos') {
    x.fillStyle = '#bcaaa4'; rr(x, s * .08, s * .45, s * .84, s * .38, s * .06); x.fill();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      x.fillStyle = j ? '#f5ebe0' : '#fff6e9'; x.beginPath(); x.ellipse(s * (.2 + i * .2), s * (.42 + j * .08), s * .075, s * .095, 0, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = '#8d6e63'; x.fillRect(s * .08, s * .68, s * .84, s * .1);
  } else if (p.id === 'queso') {
    x.fillStyle = c; x.beginPath(); x.moveTo(s * .1, s * .78); x.lineTo(s * .82, s * .3); x.lineTo(s * .9, s * .78); x.closePath(); x.fill();
    x.fillStyle = dk; x.beginPath(); x.moveTo(s * .1, s * .78); x.lineTo(s * .9, s * .78); x.lineTo(s * .9, s * .86); x.lineTo(s * .1, s * .86); x.fill();
    x.fillStyle = shade(c, -30); [[.6, .62, .05], [.75, .52, .035], [.42, .7, .03]].forEach(([u, v, r]) => { x.beginPath(); x.arc(s * u, s * v, s * r, 0, Math.PI * 2); x.fill(); });
  } else if (p.id === 'pan') {
    x.fillStyle = 'rgba(255,255,255,.55)'; rr(x, s * .1, s * .3, s * .8, s * .55, s * .12); x.fill();
    x.fillStyle = c; rr(x, s * .14, s * .36, s * .72, s * .46, s * .14); x.fill();
    x.fillStyle = dk; rr(x, s * .14, s * .36, s * .72, s * .12, s * .1); x.fill();
    x.fillStyle = '#e2483d'; x.fillRect(s * .1, s * .58, s * .8, s * .1);
  } else if (p.id === 'papel') {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const X = s * (.17 + i * .25), Y = s * (.32 + j * .26);
      x.fillStyle = '#ffffff'; x.strokeStyle = '#cfd8dc'; x.lineWidth = 2; x.beginPath(); x.arc(X + s * .12, Y + s * .12, s * .12, 0, Math.PI * 2); x.fill(); x.stroke();
      x.fillStyle = '#d7ccc8'; x.beginPath(); x.arc(X + s * .12, Y + s * .12, s * .035, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = 'rgba(100,181,246,.25)'; rr(x, s * .12, s * .28, s * .76, s * .56, s * .06); x.fill();
  } else if (p.id === 'leche' || p.id === 'zumo') {
    const W = s * .42, X = s * .29, Y = s * .3, H = s * .55;
    x.fillStyle = shade(c, -15); x.beginPath(); x.moveTo(X, Y); x.lineTo(X + W / 2, Y - s * .14); x.lineTo(X + W, Y); x.fill();
    x.fillStyle = c; x.fillRect(X, Y, W, H);
    x.fillStyle = p.id === 'leche' ? '#1e88e5' : '#ef6c00'; x.fillRect(X, Y + H * .35, W, H * .32);
    x.fillStyle = '#fff'; x.font = `900 ${s * .1}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(p.id === 'leche' ? 'LECHE' : 'ZUMO', X + W / 2, Y + H * .51, W * .9);
    x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 2; x.strokeRect(X, Y, W, H);
  } else if (p.s === 'bottle') {
    const wide = p.sz[0] > .1, W = s * (wide ? .46 : .32), X = (s - W) / 2, top = s * .16, nk = s * (wide ? .14 : .1);
    x.fillStyle = p.id === 'agua' ? 'rgba(110,198,255,.55)' : c;
    x.beginPath(); x.moveTo(X, s * .88); x.lineTo(X, s * .4); x.quadraticCurveTo(X, s * .28, (s - nk) / 2, s * .24); x.lineTo((s - nk) / 2, top);
    x.lineTo((s + nk) / 2, top); x.lineTo((s + nk) / 2, s * .24); x.quadraticCurveTo(X + W, s * .28, X + W, s * .4); x.lineTo(X + W, s * .88); x.closePath(); x.fill();
    x.fillStyle = p.id === 'agua' ? '#1565c0' : dk; x.fillRect((s - nk) / 2 - 1, top - s * .06, nk + 2, s * .07);
    x.fillStyle = p.id === 'agua' ? '#ffffff' : lt; x.fillRect(X, s * .5, W, s * .22);
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(X + W * .12, s * .3, W * .1, s * .5);
    x.fillStyle = p.id === 'agua' ? '#1565c0' : (lightOrDark(lt) ? '#1b2420' : '#fff');
    x.font = `900 ${s * .085}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(p.n.split(' ')[0].toUpperCase(), s / 2, s * .61, W * .92);
  } else if (p.s === 'can') {
    const flat = p.sz[1] < p.sz[0], W = s * (flat ? .66 : .42), H = s * (flat ? .26 : .54), X = (s - W) / 2, Y = s * .86 - H, e = W * .16;
    x.fillStyle = dk; x.beginPath(); x.ellipse(s / 2, Y + H, W / 2, e, 0, 0, Math.PI); x.fill();
    x.fillStyle = c; x.fillRect(X, Y, W, H);
    x.fillStyle = lt; x.fillRect(X, Y + H * .3, W, H * .4);
    labelText(x, p, s / 2, Y + H * .5, W * .9, s * (flat ? .08 : .09));
    x.fillStyle = '#cfd8dc'; x.beginPath(); x.ellipse(s / 2, Y, W / 2, e, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#90a4ae'; x.lineWidth = 2; x.beginPath(); x.ellipse(s / 2, Y, W / 2 * .8, e * .8, 0, 0, Math.PI * 2); x.stroke();
  } else {
    // caja o bolsa con perspectiva
    const [w, hh] = p.sz, k = Math.min(.62 / w, .62 / hh), W = s * w * k, H = s * hh * k, X = (s - W) / 2 - s * .04, Y = s * .86 - H, d = s * .08;
    x.fillStyle = lt; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + d, Y - d); x.lineTo(X + W + d, Y - d); x.lineTo(X + W, Y); x.fill();
    x.fillStyle = dk; x.beginPath(); x.moveTo(X + W, Y); x.lineTo(X + W + d, Y - d); x.lineTo(X + W + d, Y + H - d); x.lineTo(X + W, Y + H); x.fill();
    x.fillStyle = c; x.fillRect(X, Y, W, H);
    x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(X + W * .08, Y + H * .3, W * .84, Math.max(s * .12, H * .3));
    x.fillStyle = '#1b2420'; x.font = `900 ${Math.min(s * .1, H * .2)}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(p.n.split(' ')[0].toUpperCase(), X + W / 2, Y + H * .3 + Math.max(s * .12, H * .3) / 2, W * .8);
  }
  x.restore();
}
const IMG_CACHE = {};
function productImg(p) {
  if (IMG_CACHE[p.id]) return IMG_CACHE[p.id];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); drawProduct(x, p, 0, 0, 128);
  let url = ''; try { url = c.toDataURL('image/png'); } catch (e) { url = ''; }
  return (IMG_CACHE[p.id] = url);
}
function boxMats(p) {
  if (BOX_TEX[p.id]) return BOX_TEX[p.id];
  const { t } = canvasTex(256, 160, (x, w, h) => {
    x.fillStyle = '#c99a62'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#b8874f'; x.fillRect(0, h * .46, w, 10);
    x.fillStyle = '#f3e3c8'; x.fillRect(10, 14, 92, 92);
    drawProduct(x, p, 12, 14, 88);
    x.fillStyle = '#3b2a17'; x.font = 'bold 24px sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'left';
    x.fillText(p.n, 112, 46, 136);
    x.font = 'bold 22px sans-serif'; x.fillText(p.u + ' uds', 112, 86);
    x.fillStyle = '#e2483d'; x.font = '900 18px sans-serif'; x.fillText('▲ ESTE LADO ARRIBA', 12, 138);
  });
  const side = new THREE.MeshLambertMaterial({ map: t });
  const top = new THREE.MeshLambertMaterial({ color: '#c99a62' });
  return (BOX_TEX[p.id] = [side, side, top, top, side, side]);
}

/* ---------------- materiales y geometrías compartidas ---------------- */
const MAT = {
  wallIn: new THREE.MeshLambertMaterial({ color: '#eef2ef' }),
  wallOut: new THREE.MeshLambertMaterial({ color: '#d9cdb8' }),
  base: new THREE.MeshLambertMaterial({ color: '#1f6f5c' }),
  ceil: new THREE.MeshLambertMaterial({ color: '#f7f8f7', side: THREE.DoubleSide }),
  lamp: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  metal: new THREE.MeshLambertMaterial({ color: '#c9cfcc' }),
  board: new THREE.MeshLambertMaterial({ color: '#e3e7e5' }),
  kick: new THREE.MeshLambertMaterial({ color: '#1f6f5c' }),
  counter: new THREE.MeshLambertMaterial({ color: '#f2f2ee' }),
  belt: new THREE.MeshLambertMaterial({ color: '#2b2f2d' }),
  dark: new THREE.MeshLambertMaterial({ color: '#2b2f2d' }),
  wood: new THREE.MeshLambertMaterial({ color: '#a77b52' }),
  screen: new THREE.MeshBasicMaterial({ color: '#7fd0ff' }),
  ground: new THREE.MeshLambertMaterial({ color: '#8fa87f' }),
  side: new THREE.MeshLambertMaterial({ color: '#c8c8c2' }),
  road: new THREE.MeshLambertMaterial({ color: '#4a4f4d' }),
  glass: new THREE.MeshLambertMaterial({ color: '#a8d8ea', transparent: true, opacity: .35 }),
  yellow: new THREE.MeshBasicMaterial({ color: '#ffd23f' }),
  hit: new THREE.MeshBasicMaterial({ visible: false }),
  skin: new THREE.MeshLambertMaterial({ color: '#e8b896' }),
  pants: new THREE.MeshLambertMaterial({ color: '#34495e' }),
  staff: new THREE.MeshLambertMaterial({ color: '#2f9e5b' }),
  basket: new THREE.MeshLambertMaterial({ color: '#e2483d' }),
};
const BOX_GEO = new THREE.BoxGeometry(.46, .3, .34);

/* ---------------- mundo: exterior fijo ---------------- */
const world = new THREE.Group(); scene.add(world);
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), MAT.ground);
  g.rotation.x = -Math.PI / 2; g.position.y = -0.02; world.add(g);
  const rd = new THREE.Mesh(new THREE.PlaneGeometry(200, 7), MAT.road);
  rd.rotation.x = -Math.PI / 2; rd.position.set(0, -0.015, 8); world.add(rd);
}

/* ---------------- la calle: fachadas, mobiliario y tráfico ---------------- */
function facadeTex(o) {
  // o: { w, h, base, sign, signBg, signFg, shop, icon }
  const W = 512, H = Math.min(1024, Math.round(512 * o.h / o.w));
  return canvasTex(W, H, (x) => {
    const fl = 3 / o.h * H; // altura de una planta en píxeles
    x.fillStyle = o.base; x.fillRect(0, 0, W, H);
    // plantas superiores
    const floors = Math.floor((o.h - 3.4) / 3);
    const cols = Math.max(2, Math.round(o.w / 2.4)), cw = W / cols;
    for (let f = 0; f < floors; f++) {
      const y = H - fl * (f + 2) + fl * .18;
      for (let i = 0; i < cols; i++) {
        const wx = i * cw + cw * .22, ww = cw * .56, wh = fl * .56;
        x.fillStyle = shade(o.base, -35); x.fillRect(wx - 4, y - 4, ww + 8, wh + 8);
        x.fillStyle = Math.random() < .2 ? '#f6e7b0' : '#5c7d96'; x.fillRect(wx, y, ww, wh);
        x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(wx + 3, y + 3, ww * .35, wh - 6);
        x.strokeStyle = shade(o.base, -50); x.lineWidth = 3; x.beginPath(); x.moveTo(wx + ww / 2, y); x.lineTo(wx + ww / 2, y + wh); x.stroke();
        if (f % 2 === 0) { x.fillStyle = '#3d3d3d'; x.fillRect(wx - 10, y + wh + 2, ww + 20, 5); for (let b = 0; b < 6; b++) x.fillRect(wx - 8 + b * (ww + 16) / 5, y + wh * .6, 3, wh * .42); }
      }
    }
    // planta baja
    const gy = H - fl * 1.15;
    x.fillStyle = shade(o.base, -20); x.fillRect(0, gy, W, H - gy);
    if (o.shop) {
      x.fillStyle = '#2c4a5c'; x.fillRect(W * .06, gy + fl * .35, W * .56, fl * .75);
      x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(W * .08, gy + fl * .38, W * .14, fl * .68);
      x.fillStyle = '#3e2f22'; x.fillRect(W * .7, gy + fl * .3, W * .2, fl * .85);
      x.fillStyle = '#c9a24a'; x.fillRect(W * .86, gy + fl * .7, 6, 18);
      x.fillStyle = o.signBg; x.fillRect(W * .04, gy + fl * .04, W * .92, fl * .24);
      x.fillStyle = o.signFg; x.font = `900 ${Math.round(fl * .17)}px "Arial Black", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(o.sign, W / 2, gy + fl * .165, W * .85);
      if (o.icon === 'cross') { x.fillStyle = '#2ecc71'; x.fillRect(W * .32, gy + fl * .5, W * .08, fl * .3); x.fillRect(W * .27, gy + fl * .6, W * .18, fl * .1); }
    } else {
      x.fillStyle = '#3e2f22'; x.fillRect(W * .42, gy + fl * .25, W * .16, fl * .9);
      for (const px of [.1, .7]) { x.fillStyle = '#5c7d96'; x.fillRect(W * px, gy + fl * .35, W * .2, fl * .45); }
    }
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, H - 8, W, 8);
  }).t;
}
function stripeTex(a, b) {
  return canvasTex(128, 32, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 16, 0, 16, h); } x.fillStyle = 'rgba(0,0,0,.15)'; x.fillRect(0, h - 6, w, 6); }).t;
}
const LAMP_MAT = new THREE.MeshBasicMaterial({ color: '#d9d9cf' });
const STREET_COL = [];
function building(x1, x2, h, zFront, faceDir, o) {
  const w = x2 - x1, d = 12, side = mat(shade(o.base, -15));
  const front = new THREE.MeshLambertMaterial({ map: facadeTex({ ...o, w, h }) });
  const mats = [side, side, mat('#7d7d7d'), side, side, side];
  mats[faceDir > 0 ? 4 : 5] = front;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
  m.position.set(x1 + w / 2, h / 2, zFront - faceDir * d / 2); world.add(m);
  STREET_COL.push({ kind: 'street', x1, x2, z1: Math.min(zFront, zFront - faceDir * d), z2: Math.max(zFront, zFront - faceDir * d) });
  if (o.awning) {
    const aw = new THREE.Mesh(new THREE.BoxGeometry(w * .9, .06, 1.3), new THREE.MeshLambertMaterial({ map: stripeTex(o.awning, '#ffffff') }));
    aw.position.set(x1 + w / 2, 2.55, zFront + faceDir * .6); aw.rotation.x = faceDir * .22; world.add(aw);
  }
  return m;
}
function tree(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
  const pit = new THREE.Mesh(new THREE.BoxGeometry(1, .04, 1), mat('#5b4636')); pit.position.y = .02; g.add(pit);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.1, .15, 2.2, 8), mat('#6d4c33')); tr.position.y = 1.1; g.add(tr);
  const greens = ['#4f8a3c', '#5e9c46', '#3f7a33'];
  [[0, 2.7, 0, 1.0], [.45, 2.4, .2, .7], [-.4, 2.5, -.15, .75], [0, 3.25, 0, .7]].forEach(([a, b, c, r]) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat(pick(greens))); f.position.set(a, b, c); g.add(f);
  });
  STREET_COL.push({ kind: 'street', x1: x - .18, x2: x + .18, z1: z - .18, z2: z + .18 });
}
function streetLamp(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, 4.6, 8), mat('#3a3f3d')); pole.position.y = 2.3; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 1.3), mat('#3a3f3d')); arm.position.set(0, 4.55, .6); g.add(arm);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.4, .12, .6), mat('#3a3f3d')); head.position.set(0, 4.5, 1.2); g.add(head);
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(.32, .04, .5), LAMP_MAT); bulb.position.set(0, 4.43, 1.2); g.add(bulb);
  STREET_COL.push({ kind: 'street', x1: x - .1, x2: x + .1, z1: z - .1, z2: z + .1 });
}
function bench(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
  const wood = mat('#a0703f'), iron = mat('#2f3432');
  [[0, .45, 0, 1.6, .06, .45], [0, .78, -.22, 1.6, .3, .05]].forEach(([a, b, c, w, hh, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), wood); m.position.set(a, b, c); g.add(m); });
  [-.7, .7].forEach(a => { const m = new THREE.Mesh(new THREE.BoxGeometry(.06, .45, .45), iron); m.position.set(a, .22, 0); g.add(m); });
  STREET_COL.push({ kind: 'street', x1: x - .8, x2: x + .8, z1: z - .3, z2: z + .3 });
}
function planter(x, z) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(.7, .5, .7), mat('#6f7a74')); b.position.set(x, .25, z); world.add(b);
  const p = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 8), mat('#4f8a3c')); p.position.set(x, .72, z); p.scale.y = .8; world.add(p);
  const fl = new THREE.Mesh(new THREE.SphereGeometry(.1, 6, 5), mat('#ec407a')); fl.position.set(x + .15, .98, z + .1); world.add(fl);
  STREET_COL.push({ kind: 'street', x1: x - .35, x2: x + .35, z1: z - .35, z2: z + .35 });
}
function streetBin(x, z) {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(.24, .2, .85, 12), mat('#2f6b4f')); b.position.set(x, .43, z); world.add(b);
  STREET_COL.push({ kind: 'street', x1: x - .25, x2: x + .25, z1: z - .25, z2: z + .25 });
}
function cafeTable(x, z) {
  const t = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .04, 14), mat('#f2f2ee')); t.position.set(x, .74, z); world.add(t);
  const l = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .72, 6), mat('#2f3432')); l.position.set(x, .36, z); world.add(l);
  [-1, 1].forEach(s => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(.4, .05, .4), mat('#c0392b')); c.position.set(x + s * .55, .45, z); world.add(c);
    const bk = new THREE.Mesh(new THREE.BoxGeometry(.05, .45, .4), mat('#c0392b')); bk.position.set(x + s * .75, .68, z); world.add(bk);
  });
  const um = new THREE.Mesh(new THREE.ConeGeometry(1.1, .4, 8), mat('#f5f0e6')); um.position.set(x, 2.3, z); world.add(um);
  const up = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.2, 6), mat('#2f3432')); up.position.set(x, 1.2, z); world.add(up);
  STREET_COL.push({ kind: 'street', x1: x - .8, x2: x + .8, z1: z - .4, z2: z + .4 });
}
function busStop(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
  const metal = mat('#455a64');
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, .1, 1.4), metal); roof.position.set(0, 2.5, 0); g.add(roof);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.9, .04), MAT.glass); back.position.set(0, 1.3, -.65); g.add(back);
  [-1.5, 1.5].forEach(a => { const p = new THREE.Mesh(new THREE.BoxGeometry(.08, 2.5, .08), metal); p.position.set(a, 1.25, -.62); g.add(p); });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2, .06, .35), metal); seat.position.set(0, .5, -.45); g.add(seat);
  const ad = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), new THREE.MeshBasicMaterial({ map: canvasTex(128, 192, (c, w, h) => {
    c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f6f5c'; c.font = '900 22px sans-serif'; c.textAlign = 'center';
    c.fillText('OFERTAS', w / 2, 40); c.fillText('CADA', w / 2, 80); c.fillText('SEMANA', w / 2, 112); c.fillStyle = '#e2483d'; c.fillRect(20, 140, w - 40, 30);
  }).t })); ad.position.set(1.0, 1.3, -.62); g.add(ad);
  const sign = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.8, 6), metal); sign.position.set(2, 1.4, .4); g.add(sign);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .04, 16), mat('#1e88e5')); plate.rotation.x = Math.PI / 2; plate.position.set(2, 2.6, .4); g.add(plate);
  STREET_COL.push({ kind: 'street', x1: x - 1.6, x2: x + 1.6, z1: z - .7, z2: z - .55 });
}
const CAR_COLS = ['#c62828', '#1565c0', '#eeeeee', '#212121', '#9e9e9e', '#2e7d32', '#f9a825', '#6a1b9a', '#455a64', '#d84315'];
const WHEEL_GEO = new THREE.CylinderGeometry(.32, .32, .22, 12);
function makeCar(van) {
  const g = new THREE.Group(), paint = mat(pick(CAR_COLS)), glass = mat('#2b3a44'), tire = mat('#1b1b1b');
  const add = (w, hh, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), m); o.position.set(x, y, z); g.add(o); return o; };
  if (van) { add(4.6, 1.5, 1.85, paint, 0, 1.1, 0); add(.05, .6, 1.6, glass, 2.31, 1.45, 0); add(1.2, .5, .02, glass, 1.3, 1.45, .93); add(1.2, .5, .02, glass, 1.3, 1.45, -.93); }
  else {
    add(4, .62, 1.75, paint, 0, .58, 0); add(2.1, .55, 1.55, paint, -.2, 1.15, 0);
    add(2.12, .42, 1.57, glass, -.2, 1.17, 0);
  }
  const L = van ? 2.3 : 2.0;
  add(.05, .14, .32, mat('#fffbe6'), L + .01, .65, .55); add(.05, .14, .32, mat('#fffbe6'), L + .01, .65, -.55);
  add(.05, .14, .3, mat('#d32f2f'), -L - .01, .7, .58); add(.05, .14, .3, mat('#d32f2f'), -L - .01, .7, -.58);
  [[1.3, .82], [1.3, -.82], [-1.3, .82], [-1.3, -.82]].forEach(([a, b]) => { const w = new THREE.Mesh(WHEEL_GEO, tire); w.rotation.x = Math.PI / 2; w.position.set(a * (van ? 1.15 : 1), .32, b); g.add(w); });
  world.add(g);
  return g;
}
const CAR_LANES = [{ z: 7.6, dir: 1, t: 0 }, { z: 10.2, dir: -1, t: 2 }];
function updateCars(dt) {
  for (const L of CAR_LANES) {
    L.t -= dt;
    const busy = rushFactor(S.time);
    if (L.t <= 0) {
      L.t = rand(2.5, 7) / busy;
      const van = Math.random() < .18, m = makeCar(van);
      const c = { mesh: m, x: -L.dir * 70, z: L.z, dir: L.dir, v: rand(7, 11) };
      m.position.set(c.x, 0, c.z); m.rotation.y = L.dir > 0 ? 0 : Math.PI;
      R.cars.push(c);
    }
  }
  for (const c of R.cars) {
    // frenan si tienen un coche delante
    const ahead = R.cars.filter(o => o !== c && o.dir === c.dir && (o.x - c.x) * c.dir > 0 && (o.x - c.x) * c.dir < 8);
    const v = ahead.length ? Math.min(c.v, ...ahead.map(o => o.v)) * .9 : c.v;
    c.x += c.dir * v * dt; c.mesh.position.x = c.x;
    if (Math.abs(c.x) > 72) { world.remove(c.mesh); c.dead = true; }
  }
  R.cars = R.cars.filter(c => !c.dead);
}
function buildStreet() {
  // aceras, bordillos y calzada
  const swF = new THREE.Mesh(new THREE.PlaneGeometry(130, 4.5), MAT.side); swF.rotation.x = -Math.PI / 2; swF.position.set(0, -0.01, 2.25); world.add(swF);
  const tiles = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#c8c8c2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#b5b5ae'; x.lineWidth = 2; x.strokeRect(0, 0, w, h); }).t;
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(130, 4.5);
  swF.material = new THREE.MeshLambertMaterial({ map: tiles });
  const swB = new THREE.Mesh(new THREE.PlaneGeometry(130, 3), swF.material); swB.rotation.x = -Math.PI / 2; swB.position.set(0, -0.01, 13); world.add(swB);
  [4.5, 11.5].forEach(z => { const k = new THREE.Mesh(new THREE.BoxGeometry(130, .12, .2), mat('#9e9e98')); k.position.set(0, .04, z); world.add(k); });
  // marcas viales
  for (let i = -26; i < 26; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(2, .14), MAT.lamp); l.rotation.x = -Math.PI / 2; l.position.set(i * 5, -0.005, 8.9); world.add(l); }
  for (let z = 5; z < 11.2; z += .9) { const s = new THREE.Mesh(new THREE.PlaneGeometry(3, .45), MAT.lamp); s.rotation.x = -Math.PI / 2; s.position.set(3, -0.004, z); world.add(s); }
  for (let x = -24; x < 28; x += 5.5) { if (Math.abs(x - 3) < 4) continue; const p = new THREE.Mesh(new THREE.PlaneGeometry(.1, 2), MAT.lamp); p.rotation.x = -Math.PI / 2; p.position.set(x, -0.004, 5.5); world.add(p); }
  // edificios de nuestra acera (la tienda está entre x -13 y 5)
  building(5.2, 13, 6.5, 0, 1, { base: '#d9b99b', shop: true, sign: 'CAFÉ LA ESQUINA', signBg: '#5d4037', signFg: '#ffe0b2', awning: '#c0392b' });
  building(13.2, 21, 9, 0, 1, { base: '#e8e4dc', shop: true, sign: 'FARMACIA', signBg: '#2e7d32', signFg: '#ffffff', icon: 'cross' });
  building(21.2, 33, 12.5, 0, 1, { base: '#c9a98c', shop: true, sign: 'LIBRERÍA', signBg: '#283593', signFg: '#ffffff', awning: '#283593' });
  building(33.2, 48, 10, 0, 1, { base: '#b7c4b0' });
  building(-24, -13.4, 7.5, 0, 1, { base: '#c7b3d1', shop: true, sign: 'PELUQUERÍA', signBg: '#6a1b9a', signFg: '#ffffff', awning: '#8e24aa' });
  building(-36, -24.2, 12, 0, 1, { base: '#e3cf9a' });
  building(-48, -36.2, 9, 0, 1, { base: '#a9c4d8', shop: true, sign: 'FRUTERÍA', signBg: '#ef6c00', signFg: '#ffffff', awning: '#2e7d32' });
  // valla entre la tienda y la peluquería
  const fence = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.4, .08), mat('#8d8d86')); fence.position.set(-9.2, .7, .1); world.add(fence);
  STREET_COL.push({ kind: 'street', x1: -13.4, x2: -5, z1: .05, z2: .15 });
  // acera de enfrente
  const opp = [['#d8a48f', 9], ['#c9d6a3', 12], ['#a9c4d8', 8], ['#e3cf9a', 14], ['#c7a7c9', 10], ['#e8e4dc', 11], ['#b7c4b0', 9], ['#d9b99b', 13]];
  let ox = -48;
  opp.forEach(([c, hh], i) => {
    const w = 11.5;
    building(ox, ox + w, hh, 14.5, -1, i % 2 ? { base: c, shop: true, sign: ['BAR', 'ZAPATERÍA', 'PANADERÍA', 'FERRETERÍA'][i % 4 === 1 ? 0 : (i % 4)], signBg: '#37474f', signFg: '#ffd23f', awning: i % 4 === 1 ? '#c62828' : null } : { base: c });
    ox += w + .2;
  });
  // árboles, farolas y mobiliario
  for (let x = -44; x <= 44; x += 8) { if (Math.abs(x - 3) < 4 || Math.abs(x + 17) < 3) continue; tree(x, 4.0); }
  for (let x = -40; x <= 44; x += 16) streetLamp(x + 4, 4.2);
  for (let x = -40; x <= 44; x += 12) tree(x + 2, 12.4);
  bench(-2.2, .65); bench(-9.5, .65); bench(16, 3.8, Math.PI);
  planter(1.4, .6); planter(4.6, .6);
  streetBin(5.8, 3.9); streetBin(-6.5, 3.9);
  cafeTable(7.4, .85); cafeTable(10.4, .85);
  busStop(-17, 4.1);
  const hyd = new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .6, 10), mat('#d32f2f')); hyd.position.set(-3.5, .3, 3.9); world.add(hyd);
  // coches aparcados
  [-25, -10, 13, 21].forEach(x => {
    const m = makeCar(Math.random() < .25); m.position.set(x, 0, 5.4); m.rotation.y = Math.random() < .5 ? 0 : Math.PI;
    STREET_COL.push({ kind: 'street', x1: x - 2.3, x2: x + 2.3, z1: 4.5, z2: 6.3 });
  });
}

/* ---------------- tienda (se reconstruye al ampliar) ---------------- */
let shell = null;
let signObj = null, facadeSign = null;
function dims() { const L = LEVELS[S.storeLvl]; return { xMin: XMAX - L.W, xMax: XMAX, zMin: -L.D, W: L.W, D: L.D }; }
function rowsCount() { return Math.floor((LEVELS[S.storeLvl].D - 3.7) / 3) + 1; }
function slotList() {
  const { xMin } = dims(), out = [];
  for (let r = 0; r < rowsCount(); r++) for (let k = 0; ; k++) {
    const x = 2.9 - 1.3 * k; if (x < xMin + 1.4) break;
    out.push({ id: r + ':' + k, r, k, x, z: -3.2 - 3 * r - 0.25 });
  }
  return out;
}
const slotById = id => { const [r, k] = id.split(':').map(Number); return { id, r, k, x: 2.9 - 1.3 * k, z: -3.2 - 3 * r - 0.25 }; };
const standPoint = slot => ({ x: slot.x, z: -2.75 - 3 * slot.r });

function addBox(parent, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m;
}
function buildShell() {
  if (shell) { world.remove(shell); shell.traverse(o => { if (o.geometry && o.geometry !== BOX_GEO) o.geometry.dispose(); }); }
  shell = new THREE.Group(); world.add(shell);
  R.col = R.col.filter(c => c.kind !== 'wall');
  const { xMin, xMax, zMin, W, D } = dims();
  // suelo de baldosas
  const tile = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#f1f3f0'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e4e8e5'; x.fillRect(0, 0, w / 2, h / 2); x.fillRect(w / 2, h / 2, w / 2, h / 2);
    x.strokeStyle = '#cfd6d2'; x.lineWidth = 2; x.strokeRect(0, 0, w, h);
  }).t;
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(W / 1.2, D / 1.2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: tile }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(xMin + W / 2, 0.001, zMin + D / 2); shell.add(fl);
  // techo y luces
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, D), MAT.ceil);
  ce.rotation.x = Math.PI / 2; ce.position.set(xMin + W / 2, WALL_H, zMin + D / 2); shell.add(ce);
  for (let x = xMin + 1.5; x < xMax - .5; x += 3) for (let z = -1.5; z > zMin + .5; z -= 3)
    addBox(shell, 1.2, .04, .3, MAT.lamp, x, WALL_H - .03, z);
  // paredes
  const T = .2;
  const wall = (x1, x2, z1, z2) => {
    const w = x2 - x1, d = z2 - z1;
    addBox(shell, w, WALL_H, d, MAT.wallIn, x1 + w / 2, WALL_H / 2, z1 + d / 2);
    R.col.push({ kind: 'wall', x1, x2, z1, z2 });
  };
  wall(xMin - T, xMax + T, zMin - T, zMin);        // fondo
  wall(xMin - T, xMin, zMin, 0);                    // izquierda
  wall(xMax, xMax + T, zMin, 0);                    // derecha
  // fachada con puerta
  const frontMat = MAT.wallOut;
  const f1 = addBox(shell, DOOR_X[0] - (xMin - T), WALL_H, T, frontMat, (xMin - T + DOOR_X[0]) / 2, WALL_H / 2, T / 2);
  const f2 = addBox(shell, xMax + T - DOOR_X[1], WALL_H, T, frontMat, (DOOR_X[1] + xMax + T) / 2, WALL_H / 2, T / 2);
  addBox(shell, DOOR_X[1] - DOOR_X[0], WALL_H - 2.3, T, frontMat, (DOOR_X[0] + DOOR_X[1]) / 2, 2.3 + (WALL_H - 2.3) / 2, T / 2);
  R.col.push({ kind: 'wall', x1: xMin - T, x2: DOOR_X[0], z1: 0, z2: T }, { kind: 'wall', x1: DOOR_X[1], x2: xMax + T, z1: 0, z2: T });
  // cara interior de la fachada
  addBox(shell, DOOR_X[0] - xMin, WALL_H, .01, MAT.wallIn, (xMin + DOOR_X[0]) / 2, WALL_H / 2, -0.005);
  addBox(shell, xMax - DOOR_X[1], WALL_H, .01, MAT.wallIn, (DOOR_X[1] + xMax) / 2, WALL_H / 2, -0.005);
  // escaparate
  addBox(shell, Math.max(.5, DOOR_X[0] - xMin - 4.5), 1.4, .05, MAT.glass, xMin + (DOOR_X[0] - xMin) / 2 + 1, 1.5, T + .01);
  // zócalo verde
  addBox(shell, W, .25, .02, MAT.base, xMin + W / 2, .125, zMin + .01);
  addBox(shell, .02, .25, D, MAT.base, xMin + .01, .125, zMin + D / 2);
  addBox(shell, .02, .25, D, MAT.base, xMax - .01, .125, zMin + D / 2);
  // letrero de fachada
  facadeSign = canvasTex(1024, 160, () => {});
  drawFacade();
  const fs = new THREE.Mesh(new THREE.PlaneGeometry(6, .95), new THREE.MeshBasicMaterial({ map: facadeSign.t }));
  fs.position.set(1.5, 2.75, T + .02); shell.add(fs);
  // marquesina sobre la puerta
  addBox(shell, 2.6, .08, 1.2, MAT.base, 3, 2.35, .8);
  // zona de descarga
  const dz = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: .35 }));
  dz.rotation.x = -Math.PI / 2; dz.position.set(-3.95, .004, -1.9); shell.add(dz);
}
function drawFacade() {
  const { ctx: x, c, t } = facadeSign;
  x.fillStyle = '#1f6f5c'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#ffd23f'; x.fillRect(0, c.height - 18, c.width, 18);
  x.fillStyle = '#fff'; x.font = '900 92px "Bowlby One", "Arial Black", sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(S.name.toUpperCase(), c.width / 2, c.height / 2 - 6, c.width - 40);
  t.needsUpdate = true;
}

/* ---------------- muebles fijos ---------------- */
const furniture = new THREE.Group(); world.add(furniture);
const COUNTER = { x1: -0.6, x2: 1.4, z1: -1.6, z2: -1.0 };
const CUST_SPOT = { x: 0.4, z: -2.15 }, CASHIER_SPOT = { x: 0.4, z: -0.55 };
const TRASH_POS = { x: -2.7, z: -0.5 }, TRASH_STAND = { x: -2.7, z: -1.15 };
const DELIVERY = [[-4.25, -1.45], [-3.7, -1.45], [-4.25, -1.9], [-3.7, -1.9], [-4.25, -2.35], [-3.7, -2.35]];
function inter(mesh, data) { mesh.userData = data; R.inter.push(mesh); return mesh; }
function buildFurniture() {
  // mostrador y caja
  const cw = COUNTER.x2 - COUNTER.x1, cd = COUNTER.z2 - COUNTER.z1;
  addBox(furniture, cw, .86, cd, MAT.counter, COUNTER.x1 + cw / 2, .43, COUNTER.z1 + cd / 2);
  R.col.push({ kind: 'f', ...COUNTER });
  // cinta transportadora
  const beltTex = canvasTex(64, 32, (x, w, h) => { x.fillStyle = '#2b2f2d'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3f3c'; for (let i = 0; i < 4; i++) x.fillRect(i * 16, 0, 6, h); }).t;
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(8, 1);
  R.beltTex = beltTex;
  addBox(furniture, 1.25, .02, .46, new THREE.MeshLambertMaterial({ map: beltTex }), .76, .87, -1.3);
  addBox(furniture, 1.25, .05, .03, MAT.metal, .76, .89, -1.06); addBox(furniture, 1.25, .05, .03, MAT.metal, .76, .89, -1.54);
  // escáner
  addBox(furniture, .2, .01, .22, mat('#1c2a33'), -0.02, .866, -1.3);
  addBox(furniture, .16, .004, .01, new THREE.MeshBasicMaterial({ color: '#ff2d2d' }), -0.02, .872, -1.3);
  // zona de embolsado y bolsa
  addBox(furniture, .36, .03, .44, MAT.metal, -0.4, .875, -1.3);
  R.counterBag = addBox(furniture, .22, .26, .14, BAG_MAT, -0.4, 1.02, -1.3); R.counterBag.visible = false;
  // caja registradora (lado del cajero) y pantalla
  const reg = addBox(furniture, .36, .16, .3, MAT.dark, -0.32, .94, -1.12);
  R.drawer = addBox(furniture, .32, .07, .26, mat('#455a64'), -0.32, .83, -1.12);
  addBox(furniture, .04, .3, .04, MAT.dark, .12, 1.0, -1.08);
  R.regScreen = canvasTex(320, 240, () => {});
  const regScr = new THREE.Mesh(new THREE.PlaneGeometry(.42, .31), new THREE.MeshBasicMaterial({ map: R.regScreen.t }));
  regScr.position.set(.12, 1.3, -1.07); regScr.rotation.x = -.15; furniture.add(regScr);
  addBox(furniture, .45, .34, .02, MAT.dark, .12, 1.3, -1.09).rotation.x = -.15;
  inter(reg, { type: 'register' }); inter(regScr, { type: 'register' });
  // datáfono para el cliente
  const posTex = canvasTex(64, 96, (x, w, h) => {
    x.fillStyle = '#263238'; x.fillRect(0, 0, w, h); x.fillStyle = '#8bc34a'; x.fillRect(6, 6, w - 12, 28);
    x.fillStyle = '#cfd8dc'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) x.fillRect(8 + j * 17, 42 + i * 13, 13, 9);
  }).t;
  const pos = addBox(furniture, .1, .04, .16, mat('#263238'), .3, .9, -1.5);
  const posTop = new THREE.Mesh(new THREE.PlaneGeometry(.1, .16), new THREE.MeshBasicMaterial({ map: posTex }));
  posTop.rotation.x = -Math.PI / 2; posTop.position.set(.3, .922, -1.5); furniture.add(posTop);
  inter(pos, { type: 'pos' }); inter(posTop, { type: 'pos' });
  drawRegScreen();
  // ordenador
  addBox(furniture, 1.2, .74, .6, MAT.wood, -4.0, .37, -0.45);
  R.col.push({ kind: 'f', x1: -4.6, x2: -3.4, z1: -0.75, z2: -0.15 });
  addBox(furniture, .55, .34, .04, MAT.dark, -4.0, 1.0, -0.4);
  const scr = addBox(furniture, .5, .29, .01, MAT.screen, -4.0, 1.0, -0.425);
  addBox(furniture, .06, .2, .06, MAT.dark, -4.0, .8, -0.4);
  addBox(furniture, .4, .02, .14, MAT.dark, -4.0, .75, -0.62);
  const pcHit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, .7), MAT.hit);
  pcHit.position.set(-4.0, .65, -0.45); furniture.add(pcHit); inter(pcHit, { type: 'pc' });
  scr.userData = {};
  // papelera
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.22, .18, .62, 14), MAT.base);
  tr.position.set(TRASH_POS.x, .31, TRASH_POS.z); furniture.add(tr); inter(tr, { type: 'trash' });
  R.col.push({ kind: 'f', x1: TRASH_POS.x - .22, x2: TRASH_POS.x + .22, z1: TRASH_POS.z - .22, z2: TRASH_POS.z + .22 });
  // cartel abierto/cerrado
  signObj = canvasTex(256, 128, () => {});
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(.6, .3), new THREE.MeshBasicMaterial({ map: signObj.t }));
  sg.position.set(1.75, 1.45, -0.03); sg.rotation.y = Math.PI; furniture.add(sg);
  const sgHit = new THREE.Mesh(new THREE.BoxGeometry(.7, .45, .15), MAT.hit);
  sgHit.position.set(1.75, 1.45, -0.08); furniture.add(sgHit); inter(sgHit, { type: 'sign' });
  drawSign();
}
function drawSign() {
  const { ctx: x, c, t } = signObj;
  x.fillStyle = S.open ? '#2f9e5b' : '#e2483d'; x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = '#fff'; x.lineWidth = 8; x.strokeRect(8, 8, c.width - 16, c.height - 16);
  x.fillStyle = '#fff'; x.font = '900 52px "Arial Black", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(S.open ? 'ABIERTO' : 'CERRADO', c.width / 2, c.height / 2 + 2);
  t.needsUpdate = true;
}

/* ---------------- estanterías ---------------- */
function layout(p) {
  const [w, h, d] = p.sz;
  const cols = clamp(Math.floor(1.12 / (w + .025)), 1, 8);
  const rows = clamp(Math.floor(.44 / (d + .025)), 1, 2);
  let stack = h < .09 ? 2 : 1;
  if (4 * cols * rows * stack > 64) stack = 1;
  return { cols, rows, stack, cap: 4 * cols * rows * stack };
}
const capOf = sh => sh.p ? layout(PB[sh.p]).cap : 0;
function itemMatrix(p, L, i, m) {
  const per = L.cols * L.rows * L.stack, tier = Math.floor(i / per);
  let j = i % per; const layer = Math.floor(j / (L.cols * L.rows)); j %= L.cols * L.rows;
  const row = Math.floor(j / L.cols), col = j % L.cols, [, h] = p.sz;
  const x = -.56 + (1.12 / L.cols) * (col + .5), z = -.22 + (.44 / L.rows) * (row + .5);
  m.makeTranslation(x, TIERS[tier] + h / 2 + layer * h + .005, z);
}
const SHELF_PARTS = (() => {
  const g = [];
  g.push([new THREE.BoxGeometry(1.24, 1.9, .03), MAT.metal, 0, .95, -.245]);
  g.push([new THREE.BoxGeometry(.03, 1.9, .5), MAT.metal, -.61, .95, 0]);
  g.push([new THREE.BoxGeometry(.03, 1.9, .5), MAT.metal, .61, .95, 0]);
  g.push([new THREE.BoxGeometry(1.22, .12, .48), MAT.kick, 0, .06, 0]);
  const b = new THREE.BoxGeometry(1.22, .03, .5);
  TIERS.slice(1).forEach(y => g.push([b, MAT.board, 0, y - .015, 0]));
  g.push([b, MAT.board, 0, 1.88, 0]);
  return g;
})();
function createShelf(id) {
  const slot = slotById(id), grp = new THREE.Group();
  SHELF_PARTS.forEach(([geo, mat, x, y, z]) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); grp.add(m); });
  grp.position.set(slot.x, 0, slot.z); world.add(grp);
  const tag = canvasTex(256, 96, () => {});
  const tm = new THREE.Mesh(new THREE.PlaneGeometry(.34, .11), new THREE.MeshBasicMaterial({ map: tag.t }));
  tm.position.set(0, .07, .246); grp.add(tm);
  const hit = new THREE.Mesh(new THREE.BoxGeometry(1.24, 1.9, .54), MAT.hit);
  hit.position.set(0, .95, 0); grp.add(hit); inter(hit, { type: 'shelf', id });
  const col = { kind: 'shelf', id, x1: slot.x - .63, x2: slot.x + .63, z1: slot.z - .27, z2: slot.z + .27 };
  R.col.push(col);
  R.shelves[id] = { grp, tag, inst: null, instP: null, slot };
  refreshShelf(id);
}
function refreshShelf(id) {
  const sh = S.shelves[id], o = R.shelves[id];
  if (!sh.p && o.inst) { o.grp.remove(o.inst); o.inst.dispose(); o.inst = null; o.instP = null; }
  if (sh.p && o.instP !== sh.p) {
    if (o.inst) { o.grp.remove(o.inst); o.inst.dispose(); }
    const p = PB[sh.p], L = layout(p);
    const inst = new THREE.InstancedMesh(itemGeo(p), itemMat(p), L.cap);
    const m = new THREE.Matrix4();
    for (let i = 0; i < L.cap; i++) { itemMatrix(p, L, i, m); inst.setMatrixAt(i, m); }
    inst.instanceMatrix.needsUpdate = true; inst.frustumCulled = false;
    o.grp.add(inst); o.inst = inst; o.instP = sh.p;
  }
  if (o.inst) o.inst.count = sh.n;
  drawTag(id);
}
function drawTag(id) {
  const sh = S.shelves[id], { ctx: x, c, t } = R.shelves[id].tag;
  x.fillStyle = sh.p ? '#ffd23f' : '#ffffff'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#1b2420'; x.textBaseline = 'middle';
  if (sh.p) {
    x.font = 'bold 22px sans-serif'; x.textAlign = 'left'; x.fillText(PB[sh.p].n, 12, 24, 232);
    x.font = '900 46px "Barlow Condensed", "Arial Narrow", sans-serif'; x.textAlign = 'right';
    x.fillText(eur(S.price[sh.p]), c.width - 12, 64);
  } else {
    x.font = 'bold 24px sans-serif'; x.textAlign = 'center'; x.fillText('VACÍA', c.width / 2, c.height / 2);
  }
  t.needsUpdate = true;
}
const refreshAllTags = () => Object.keys(R.shelves).forEach(drawTag);

/* ---------------- cajas de producto ---------------- */
function spawnBox(p, n, x, z) {
  const mesh = new THREE.Mesh(BOX_GEO, boxMats(PB[p]));
  world.add(mesh);
  const b = { id: R.uid++, p, n, mesh, claimed: null, carrier: null };
  inter(mesh, { type: 'box', b });
  R.boxes.push(b);
  setBoxOnFloor(b, x, z);
  return b;
}
function setBoxOnFloor(b, x, z) {
  if (b.mesh.parent !== world) { world.attach(b.mesh); }
  let stack = 0;
  for (const o of R.boxes) {
    if (o === b || o.carrier || o === R.held) continue;
    if (Math.abs(o.mesh.position.x - x) < .3 && Math.abs(o.mesh.position.z - z) < .25) stack++;
  }
  b.mesh.position.set(x, .15 + stack * .3, z);
  b.mesh.rotation.set(0, 0, 0);
}
function restack() {
  const groups = [];
  for (const o of R.boxes) {
    if (o.carrier || o === R.held) continue;
    const p = o.mesh.position;
    let g = groups.find(g => Math.abs(g.x - p.x) < .3 && Math.abs(g.z - p.z) < .25);
    if (!g) { g = { x: p.x, z: p.z, list: [] }; groups.push(g); }
    g.list.push(o);
  }
  for (const g of groups) { g.list.sort((a, b) => a.mesh.position.y - b.mesh.position.y); g.list.forEach((o, i) => { o.mesh.position.y = .15 + i * .3; }); }
}
function deliverySpot() {
  let best = DELIVERY[0], bc = 1e9;
  for (const [x, z] of DELIVERY) {
    const n = R.boxes.filter(o => !o.carrier && o !== R.held && Math.abs(o.mesh.position.x - x) < .3 && Math.abs(o.mesh.position.z - z) < .25).length;
    if (n < bc) { bc = n; best = [x, z]; }
  }
  return best;
}
function removeBox(b) {
  b.mesh.parent && b.mesh.parent.remove(b.mesh);
  R.boxes = R.boxes.filter(o => o !== b);
  R.inter = R.inter.filter(m => m !== b.mesh);
  if (R.held === b) R.held = null;
  restack();
}

/* ---------------- personas ---------------- */
const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#d9a07a', '#a86b45', '#f5d0b0'];
const HAIRS = ['#2b1d14', '#4a3426', '#8b5a2b', '#d6b370', '#1a1a1a', '#9e9e9e', '#b5562b', '#e8e2d6'];
const SHIRT_C = ['#e57373', '#64b5f6', '#ffb74d', '#ba68c8', '#4db6ac', '#f06292', '#9575cd', '#aed581', '#90a4ae', '#ffd54f', '#fafafa', '#37474f', '#8d6e63', '#26a69a', '#c62828', '#283593'];
const PANTS_C = ['#34495e', '#2c3e50', '#1f2a44', '#4e5d6c', '#c8b58a', '#222222', '#5d4037', '#3e6aa1', '#6d7b8d'];
const SHOE_C = ['#222222', '#f5f5f5', '#5d4037', '#37474f', '#b71c1c'];
const MCACHE = {};
const mat = c => MCACHE[c] || (MCACHE[c] = new THREE.MeshLambertMaterial({ color: c }));
const PG = {
  leg: new THREE.CapsuleGeometry(.07, .6, 4, 8),
  shoe: new THREE.BoxGeometry(.11, .08, .22),
  hips: new THREE.BoxGeometry(.31, .2, .2),
  torso: new THREE.CapsuleGeometry(.165, .34, 4, 12),
  arm: new THREE.CapsuleGeometry(.052, .46, 4, 8),
  hand: new THREE.SphereGeometry(.052, 8, 6),
  neck: new THREE.CylinderGeometry(.05, .055, .1, 8),
  head: new THREE.SphereGeometry(.115, 16, 12),
  hairTop: new THREE.SphereGeometry(.123, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55),
  hairLong: new THREE.BoxGeometry(.23, .3, .08),
  bun: new THREE.SphereGeometry(.06, 8, 6),
  eye: new THREE.SphereGeometry(.015, 6, 5),
  nose: new THREE.SphereGeometry(.02, 6, 5),
  cap: new THREE.CylinderGeometry(.126, .126, .07, 14),
  visor: new THREE.BoxGeometry(.2, .015, .11),
  basket: new THREE.BoxGeometry(.3, .16, .2),
  handle: new THREE.BoxGeometry(.02, .16, .02),
  bag: new THREE.BoxGeometry(.22, .3, .12),
  card: new THREE.BoxGeometry(.09, .006, .057),
  bill: new THREE.BoxGeometry(.13, .004, .065),
  apron: new THREE.BoxGeometry(.3, .5, .02),
};
const EYE_MAT = mat('#1b1b1b'), BAG_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: .92 });
const CARD_MAT = mat('#1e88e5'), BILL_MAT = mat('#7cb342');
function makePerson(isStaff) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const female = Math.random() < .5, s = isStaff ? 1 : rand(.9, 1.08) * (female ? .96 : 1);
  body.scale.setScalar(s);
  const skin = mat(pick(SKINS)), shirt = isStaff ? mat('#2f9e5b') : mat(pick(SHIRT_C));
  const pants = isStaff ? mat('#2c3e50') : mat(pick(PANTS_C)), shoe = mat(pick(SHOE_C)), hair = mat(pick(HAIRS));
  const add = (geo, m, x, y, z, parent = body) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };
  // piernas con articulación en la cadera
  const legs = [-1, 1].map(side => {
    const piv = new THREE.Group(); piv.position.set(side * .085, .84, 0); body.add(piv);
    add(PG.leg, pants, 0, -.39, 0, piv);
    add(PG.shoe, shoe, 0, -.8, .04, piv);
    return piv;
  });
  add(PG.hips, pants, 0, .88, 0);
  const torso = add(PG.torso, shirt, 0, 1.18, 0); torso.scale.set(1, 1, .68);
  if (isStaff) add(PG.apron, mat('#1f6f5c'), 0, 1.02, .12);
  // brazos con articulación en el hombro
  const arms = [-1, 1].map(side => {
    const piv = new THREE.Group(); piv.position.set(side * .215, 1.42, 0); body.add(piv);
    add(PG.arm, shirt, 0, -.27, 0, piv);
    add(PG.hand, skin, 0, -.56, 0, piv);
    piv.rotation.z = side * .06;
    return piv;
  });
  add(PG.neck, skin, 0, 1.53, 0);
  const head = add(PG.head, skin, 0, 1.67, 0); head.scale.set(.95, 1.08, 1);
  add(PG.eye, EYE_MAT, -.042, 1.69, .105); add(PG.eye, EYE_MAT, .042, 1.69, .105);
  add(PG.nose, skin, 0, 1.655, .115);
  if (isStaff) {
    add(PG.cap, mat('#1f6f5c'), 0, 1.76, 0); add(PG.visor, mat('#1f6f5c'), 0, 1.735, .1);
  } else {
    const style = Math.random();
    if (style > .08) add(PG.hairTop, hair, 0, 1.68, -.006);
    if (female && style > .3) add(PG.hairLong, hair, 0, 1.58, -.08);
    else if (female) add(PG.bun, hair, 0, 1.73, -.11);
  }
  // cosas que lleva en la mano derecha
  const hand = arms[1];
  const basket = new THREE.Group(); basket.position.set(.02, -.68, .02); hand.add(basket);
  add(PG.basket, MAT.basket, 0, -.02, 0, basket); add(PG.handle, MAT.basket, 0, .1, 0, basket);
  basket.visible = false;
  const bag = add(PG.bag, BAG_MAT, .02, -.74, 0, hand); bag.visible = false;
  const card = add(PG.card, CARD_MAT, 0, -.6, .06, hand); card.visible = false;
  const bill = add(PG.bill, BILL_MAT, 0, -.6, .06, hand); bill.visible = false;
  g.userData = { body, lL: legs[0], lR: legs[1], aL: arms[0], aR: arms[1], basket, bag, card, bill, phase: rand(0, 6), k: 0 };
  world.add(g);
  return g;
}
function animPerson(a, dt) {
  const u = a.mesh.userData, moving = !!a.moved;
  u.k = clamp(u.k + (moving ? 1 : -1) * dt * 5, 0, 1);
  if (moving) u.phase += dt * (a.speed || 1.3) * 5.2;
  const sw = Math.sin(u.phase) * .55 * u.k;
  u.lL.rotation.x = sw; u.lR.rotation.x = -sw;
  const carrying = a.box || a.holdPose;
  u.aL.rotation.x = carrying ? -1.15 : -sw * .75;
  u.aR.rotation.x = carrying ? -1.15 : (u.card.visible || u.bill.visible) ? -1.0 : sw * .75 * (u.basket.visible ? .4 : 1);
  u.body.position.y = Math.abs(Math.cos(u.phase)) * .035 * u.k;
  a.moved = false;
}
function walk(a, dt, speed) {
  if (!a.path.length) return true;
  const t = a.path[0], dx = t.x - a.x, dz = t.z - a.z, d = Math.hypot(dx, dz), s = speed * dt;
  a.speed = speed; a.moved = true;
  if (d > .001) {
    const want = Math.atan2(dx, dz); let cur = a.mesh.rotation.y, diff = want - cur;
    while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
    a.mesh.rotation.y = cur + diff * Math.min(1, dt * 10);
  }
  if (d <= s) { a.x = t.x; a.z = t.z; a.path.shift(); }
  else { a.x += dx / d * s; a.z += dz / d * s; }
  a.mesh.position.set(a.x, 0, a.z);
  return !a.path.length;
}
/* bocadillos de diálogo */
function say(a, text, sec = 2.6) {
  const u = a.mesh.userData;
  if (u.bubble) { a.mesh.remove(u.bubble); u.bubble.material.map.dispose(); u.bubble.material.dispose(); }
  const { t } = canvasTex(256, 96, (x, w, h) => {
    x.fillStyle = '#ffffff'; rr(x, 4, 4, w - 8, h - 26, 18); x.fill();
    x.beginPath(); x.moveTo(w / 2 - 12, h - 23); x.lineTo(w / 2, h - 4); x.lineTo(w / 2 + 12, h - 23); x.fill();
    x.fillStyle = '#1b2420'; x.font = 'bold 26px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, w / 2, (h - 22) / 2 + 4, w - 24);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t }));
  sp.scale.set(.9, .34, 1); sp.position.set(0, 2.15, 0); sp.renderOrder = 10;
  a.mesh.add(sp); u.bubble = sp; u.bubbleT = sec;
}
function updateBubble(a, dt) {
  const u = a.mesh.userData;
  if (u.bubble) { u.bubbleT -= dt; if (u.bubbleT <= 0) { a.mesh.remove(u.bubble); u.bubble.material.map.dispose(); u.bubble.material.dispose(); u.bubble = null; } }
}
function aisleZs() { const a = [-2.4]; for (let r = 1; r < rowsCount(); r++) a.push(-1.95 - 3 * r); return a; }
function nearestAisle(z) { let best = -2.4, bd = 1e9; for (const a of aisleZs()) { const d = Math.abs(a - z); if (d < bd) { bd = d; best = a; } } return best; }
function route(p, q) {
  const za = nearestAisle(p.z), zb = nearestAisle(q.z), pts = [];
  if (Math.abs(za - zb) < .01) pts.push({ x: p.x, z: za }, { x: q.x, z: za });
  else pts.push({ x: p.x, z: za }, { x: RX, z: za }, { x: RX, z: zb }, { x: q.x, z: zb });
  pts.push({ x: q.x, z: q.z });
  return pts;
}
function faceShelf(a) { a.mesh.rotation.y = Math.PI; }

/* ---------------- clientes ---------------- */
const STREET_END = 48, LANE_Z = [1.75, 3.15];
const laneFor = dir => LANE_Z[dir > 0 ? 0 : 1] + rand(-.2, .2);
function licensedProducts() { return PRODUCTS.filter(p => S.lic[p.g]); }
function maxCustomers() { return 3 + 2 * S.storeLvl + Math.floor(S.level / 3); }
function spawnCustomer() {
  const lp = licensedProducts(); if (!lp.length) return;
  // prefieren productos que se ven en las estanterías, pero a veces buscan otros
  const onShelf = [...new Set(Object.values(S.shelves).filter(s => s.p).map(s => s.p))];
  const k = 1 + Math.floor(Math.random() * Math.min(4, lp.length));
  const want = [];
  for (let i = 0; i < k; i++) {
    const p = (onShelf.length && Math.random() < .8) ? pick(onShelf) : pick(lp).id;
    if (!want.find(w => w.p === p)) want.push({ p, q: 1 + (Math.random() < .35 ? 1 : 0) + (Math.random() < .1 ? 1 : 0) });
  }
  // si pasa alguien por la acera hacia la puerta, es él quien entra; si no, llega uno nuevo andando
  const cand = R.peds.filter(p => !p.stop && Math.sign(3 - p.x) === p.dir && Math.abs(3 - p.x) > 2 && Math.abs(3 - p.x) < 16);
  let c;
  if (cand.length) {
    const p = pick(cand); R.peds = R.peds.filter(o => o !== p);
    c = { mesh: p.mesh, x: p.x, z: p.z };
  } else {
    const dir = Math.random() < .5 ? 1 : -1, x = 3 - dir * rand(10, 18), z = laneFor(dir);
    c = { mesh: makePerson(false), x, z };
    c.mesh.position.set(x, 0, z);
  }
  Object.assign(c, {
    path: [{ x: 3, z: c.z }, { x: 3, z: 1.0 }, { x: 3, z: -2.0 }],
    state: 'enter', want, wi: 0, basket: [], missing: 0, pricey: 0, timer: 0, wait: 0,
  });
  R.customers.push(c);
}
function entered(c) {
  beep(880, .08, 'sine', .05); setTimeout(() => beep(660, .1, 'sine', .05), 90);
  if (Math.random() < .35) say(c, pick(['¡Buenos días!', 'Hola', '¡Qué bien, está abierto!', 'A ver qué hay']));
}
function planNext(c) {
  while (c.wi < c.want.length) {
    const w = c.want[c.wi];
    const opts = Object.keys(S.shelves).filter(id => S.shelves[id].p === w.p && S.shelves[id].n > 0);
    if (opts.length) {
      c.target = pick(opts);
      c.path = route(c, standPoint(slotById(c.target)));
      c.state = 'walk';
      return;
    }
    c.missing++; c.wi++;
    if (c.inDoor && Math.random() < .6) say(c, `No hay ${PB[w.p].n.toLowerCase()}…`);
  }
  if (c.basket.length) joinQueue(c); else leave(c, false);
}
function joinQueue(c) {
  c.mesh.userData.basket.visible = true;
  R.queue.push(c); c.state = 'queue'; c.wait = 0;
  c.path = route(c, queueSpot(R.queue.length - 1));
}
function queueSpot(i) {
  const { xMin } = dims();
  const perRow = Math.max(1, Math.floor((CUST_SPOT.x - (xMin + .8)) / .8) + 1);
  return i < perRow ? { x: CUST_SPOT.x - .8 * i, z: CUST_SPOT.z } : { x: CUST_SPOT.x - .8 * (i - perRow), z: -2.9 };
}
function leave(c, happy) {
  if (c.state === 'leave') return;
  const qi = R.queue.indexOf(c); if (qi >= 0) R.queue.splice(qi, 1);
  c.state = 'leave';
  const dir = Math.random() < .5 ? 1 : -1, lz = laneFor(dir);
  c.path = [...route(c, { x: 3, z: -2.0 }), { x: 3, z: 1.0 }, { x: 3, z: lz }, { x: dir * STREET_END, z: lz }];
  const u = c.mesh.userData; u.basket.visible = false; u.card.visible = false; u.bill.visible = false;
  if (happy && !c.missing && !c.pricey) S.rep = clamp(S.rep + 1, 0, 100);
  if (c.missing) {
    S.rep = clamp(S.rep - 2 * c.missing, 0, 100);
    note(`Un cliente no encontró ${c.missing === 1 ? 'un producto' : c.missing + ' productos'}`);
  }
  if (!happy) {
    S.dayStats.lost++; S.rep = clamp(S.rep - 1, 0, 100);
    if (!u.bubble) say(c, c.basket.length ? '¡Me voy, qué cola!' : 'No hay lo que busco…');
  }
}
function updateCustomer(c, dt) {
  if (c.state === 'enter') {
    const done = walk(c, dt, 1.35);
    if (!c.inDoor && c.z < 0) { c.inDoor = true; entered(c); }
    if (done) planNext(c);
  } else if (c.state === 'walk') {
    if (walk(c, dt, 1.35)) { c.state = 'pick'; c.timer = 0; faceShelf(c); }
  } else if (c.state === 'pick') {
    c.timer += dt;
    if (c.timer < .8) return;
    c.timer = 0;
    const w = c.want[c.wi], sh = S.shelves[c.target];
    if (!sh || sh.p !== w.p || sh.n <= 0) { if (w.got) c.wi++; planNext(c); return; }
    if (!w.decided) {
      w.decided = true;
      const ratio = S.price[w.p] / S.market[w.p];
      if (ratio > 1.05 && (ratio > 1.6 || Math.random() < (ratio - 1.05) / .55)) {
        c.pricey++; note(`Un cliente dice que ${PB[w.p].n} está muy caro`); S.rep = clamp(S.rep - 1, 0, 100);
        say(c, pick(['¡Qué caro!', '¿A este precio?', 'Esto está carísimo']));
        c.wi++; planNext(c); return;
      }
    }
    sh.n--; refreshShelf(c.target);
    c.basket.push({ p: w.p, price: S.price[w.p] });
    w.got = (w.got || 0) + 1;
    c.mesh.userData.basket.visible = true;
    if (w.got >= w.q) { c.wi++; planNext(c); }
  } else if (c.state === 'queue') {
    const i = R.queue.indexOf(c), spot = queueSpot(i);
    if (!c.path.length && (Math.abs(c.x - spot.x) > .05 || Math.abs(c.z - spot.z) > .05)) c.path = [spot];
    if (walk(c, dt, 1.2)) c.mesh.rotation.y = i === 0 ? 0 : Math.PI / 2;
    if (R.co.cust !== c) {
      c.wait += dt;
      if (c.wait > 80 && !c.complained) { c.complained = true; say(c, pick(['¡Qué lento va esto!', '¿Hay alguien en la caja?', 'Llevo un rato esperando…'])); }
      if (c.wait > 120) { note('Un cliente se cansó de esperar y se fue'); S.rep = clamp(S.rep - 3, 0, 100); leave(c, false); }
    }
  } else if (c.state === 'leave') {
    if (walk(c, dt, 1.4)) { world.remove(c.mesh); c.dead = true; }
  }
}

/* ---------------- peatones ---------------- */
function spawnPed(x) {
  const dir = x === undefined ? (Math.random() < .5 ? 1 : -1) : (Math.random() < .5 ? 1 : -1);
  const sx = x === undefined ? -dir * STREET_END : x, z = laneFor(dir);
  const p = { mesh: makePerson(false), x: sx, z, dir, speed: rand(1.0, 1.55), path: [{ x: dir * STREET_END, z }], stop: false, looked: false };
  p.mesh.position.set(sx, 0, z); p.mesh.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
  R.peds.push(p);
}
function pedTarget() {
  const base = 12 + 3 * S.storeLvl + Math.min(10, S.level);
  const f = S.time >= 21 * 60 ? .45 : rushFactor(S.time);
  return Math.round(base * f);
}
function updatePeds(dt) {
  if (R.peds.length < pedTarget() && Math.random() < dt * .8) spawnPed();
  for (const p of R.peds) {
    if (p.stop) {
      p.stopT -= dt;
      if (p.stopT <= 0) { p.stop = false; p.path = [{ x: p.dir * STREET_END, z: p.z }]; }
      continue;
    }
    // a veces se paran a mirar el escaparate
    if (!p.looked && p.x > -1.5 && p.x < 1.2 && Math.random() < .02) {
      p.looked = true;
      if (Math.random() < .35) {
        p.stop = true; p.stopT = rand(2, 4); p.mesh.rotation.y = Math.PI; p.path = [];
        if (Math.random() < .5) say(p, S.open ? pick(['Tiene buena pinta', 'Luego entro', 'Mira, un súper']) : pick(['¿A qué hora abren?', 'Está cerrado']));
        continue;
      }
    }
    if (walk(p, dt, p.speed)) { world.remove(p.mesh); p.dead = true; }
  }
  R.peds = R.peds.filter(p => !p.dead);
}

/* ---------------- caja registradora ---------------- */
const BELT_X0 = .24, BELT_STEP = .155, BELT_PER_ROW = 7;
function beltSlot(i) { return { x: BELT_X0 + (i % BELT_PER_ROW) * BELT_STEP, z: i < BELT_PER_ROW ? -1.25 : -1.42 }; }
function resetCheckout() {
  const co = R.co;
  co.items.forEach(o => { world.remove(o.mesh); }); R.inter = R.inter.filter(m => !co.items.some(o => o.mesh === m));
  Object.assign(co, { stage: 'idle', cust: null, pending: [], items: [], flying: [], scanned: [], total: 0, method: null, given: 0, givenParts: [], autoT: 0, unloadT: 0 });
  if (R.counterBag) { R.counterBag.visible = false; R.counterBag.scale.set(1, 1, 1); }
  if (R.drawer) R.drawer.position.z = -1.12;
  drawRegScreen();
}
function updateCheckout(dt) {
  const co = R.co;
  if (!co.flying) resetCheckout();
  const first = R.queue[0];
  if (co.stage === 'idle' && first && !first.path.length && Math.abs(first.x - CUST_SPOT.x) < .1) {
    co.cust = first; co.stage = 'scan'; co.total = 0; co.autoT = 0; co.unloadT = 0;
    co.pending = [...first.basket]; co.items = []; co.scanned = [];
    first.mesh.rotation.y = 0;
    if (Math.random() < .4) say(first, pick(['Hola, buenas', '¡Buenas tardes!', 'Esto es todo']));
    drawRegScreen();
  }
  if (co.stage === 'scan') {
    // el cliente va dejando los productos en la cinta
    co.unloadT += dt;
    if (co.pending.length && co.unloadT > .45 && co.items.length < BELT_PER_ROW * 2) {
      co.unloadT = 0;
      const it = co.pending.shift(), p = PB[it.p], m = new THREE.Mesh(itemGeo(p), itemMat(p));
      m.position.set(1.3, .88 + p.sz[1] / 2, -1.3);
      if (p.s === 'box') m.rotation.y = rand(-.25, .25);
      world.add(m);
      const o = { mesh: m, it };
      inter(m, { type: 'item', o });
      co.items.push(o);
      if (!co.pending.length) co.cust.mesh.userData.basket.visible = false;
    }
    // la cinta acerca los productos al escáner
    let moving = false;
    co.items.forEach((o, i) => {
      const t = beltSlot(i), m = o.mesh;
      const dx = t.x - m.position.x, dz = t.z - m.position.z, d = Math.hypot(dx, dz), sp = .7 * dt;
      if (d > .002) { moving = true; if (d <= sp) { m.position.x = t.x; m.position.z = t.z; } else { m.position.x += dx / d * sp; m.position.z += dz / d * sp; } }
    });
    if (moving && R.beltTex) R.beltTex.offset.x += dt * 1.2;
    if (S.staff.caj && co.items.length) {
      co.autoT += dt;
      if (co.autoT > .7) { co.autoT = 0; scanItem(co.items[0].mesh); }
    }
    if (!co.pending.length && !co.items.length && co.scanned.length) startPayment();
  }
  // productos escaneados volando a la bolsa
  for (const f of co.flying) {
    f.t += dt * 4; const m = f.mesh;
    m.position.x += (-0.4 - m.position.x) * Math.min(1, f.t); m.position.z += (-1.3 - m.position.z) * Math.min(1, f.t);
    m.position.y = 1.0 + Math.sin(Math.min(1, f.t) * Math.PI) * .15;
    if (f.t >= 1) { world.remove(m); f.done = true; }
  }
  co.flying = co.flying.filter(f => !f.done);
  if (co.stage === 'pay' && S.staff.caj) {
    co.autoT += dt;
    if (co.autoT > 1.6) finishSale();
  }
}
function scanItem(mesh) {
  const co = R.co; if (co.stage !== 'scan') return;
  const o = co.items.find(x => x.mesh === mesh); if (!o) return;
  co.items = co.items.filter(x => x !== o);
  R.inter = R.inter.filter(m => m !== mesh);
  co.flying.push({ mesh, t: 0 });
  co.scanned.push(o.it);
  co.total = r2(co.total + o.it.price);
  R.counterBag.visible = true; R.counterBag.scale.y = Math.min(1.4, .6 + co.scanned.length * .08);
  beep(1250, .06, 'square', .05);
  drawRegScreen();
}
function splitMoney(v) {
  const out = []; let rest = Math.round(v * 100);
  for (const d of DENOMS) { const c = Math.round(d * 100); while (rest >= c) { out.push(d); rest -= c; } }
  return out;
}
function startPayment() {
  const co = R.co, c = co.cust;
  co.stage = 'pay'; co.autoT = 0;
  co.method = Math.random() < .55 ? 'card' : 'cash';
  const u = c.mesh.userData;
  if (co.method === 'cash') {
    const bills = [5, 10, 20, 50].filter(b => b >= co.total);
    let given = bills.length ? bills[0] : Math.ceil(co.total / 50) * 50;
    const roll = Math.random();
    if (roll < .25 && bills[1]) given = bills[1];
    else if (roll < .45) given = Math.ceil(co.total);
    else if (roll < .55) given = Math.ceil(co.total * 2) / 2;
    if (given < co.total) given = Math.ceil(co.total);
    co.given = r2(given); co.givenParts = splitMoney(co.given);
    u.bill.visible = true;
    say(c, pick(['En efectivo', 'Te pago con esto', 'Cóbrate de aquí']));
  } else {
    u.card.visible = true;
    say(c, pick(['Con tarjeta, por favor', 'Pago con tarjeta', '¿Aceptas tarjeta?']));
  }
  drawRegScreen();
}
function drawRegScreen() {
  if (!R.regScreen) return;
  const { ctx: x, c, t } = R.regScreen, co = R.co, W = c.width, H = c.height;
  x.fillStyle = '#0e2a3a'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#1f6f5c'; x.fillRect(0, 0, W, 30);
  x.fillStyle = '#fff'; x.font = 'bold 18px sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillText(S ? S.name.toUpperCase() : 'CAJA', 10, 15, W - 20);
  x.font = '16px monospace';
  const list = (co.scanned || []).slice(-6);
  list.forEach((it, i) => {
    x.fillStyle = '#cfe8f5'; x.textAlign = 'left'; x.fillText(PB[it.p].n.slice(0, 18), 10, 48 + i * 22);
    x.textAlign = 'right'; x.fillText(eur(it.price), W - 10, 48 + i * 22);
  });
  if (!list.length) { x.fillStyle = '#7fa6bb'; x.textAlign = 'center'; x.fillText(co.stage === 'idle' ? 'CAJA LIBRE' : 'ESCANEANDO…', W / 2, 100); }
  x.fillStyle = '#ffd23f'; x.fillRect(0, H - 62, W, 2);
  x.textAlign = 'left'; x.font = 'bold 20px sans-serif'; x.fillText('TOTAL', 10, H - 40);
  x.textAlign = 'right'; x.font = '900 30px sans-serif'; x.fillText(eur(co.total || 0), W - 10, H - 40);
  x.font = 'bold 15px sans-serif'; x.textAlign = 'center';
  x.fillStyle = co.stage === 'pay' ? '#8bc34a' : '#7fa6bb';
  x.fillText(co.stage === 'pay' ? (co.method === 'card' ? 'PAGO CON TARJETA → DATÁFONO' : `EFECTIVO · ENTREGA ${eur(co.given)}`) : (co.items && co.items.length ? `${co.items.length} producto(s) en la cinta` : ''), W / 2, H - 12, W - 10);
  t.needsUpdate = true;
}
function finishSale() {
  const co = R.co, c = co.cust; if (!c) return;
  S.money = r2(S.money + co.total);
  S.dayStats.sales = r2(S.dayStats.sales + co.total); S.dayStats.served++;
  S.stats.served++; S.stats.total = r2(S.stats.total + co.total);
  addXP(co.total);
  beep(1568, .07, 'triangle', .08); setTimeout(() => beep(2093, .12, 'triangle', .08), 80);
  const u = c.mesh.userData; u.card.visible = false; u.bill.visible = false;
  leave(c, true);
  u.bag.visible = true;
  say(c, pick(['¡Gracias!', '¡Hasta luego!', 'Muchas gracias', '¡Que vaya bien!']));
  resetCheckout();
}
function xpNeed(l) { return Math.round(120 * Math.pow(l, 1.6)); }
function addXP(v) {
  S.xp += v;
  while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; toast(`¡Nivel ${S.level}! Mira si hay licencias o mejoras nuevas en el ordenador.`); }
}

/* ---------------- personal ---------------- */
function syncStaff() {
  const want = { caj: S.staff.caj, rep: S.staff.rep };
  // quitar sobrantes
  for (const t of ['caj', 'rep']) {
    let list = R.staff.filter(s => s.type === t);
    while (list.length > want[t]) {
      const s = list.pop(); dropStaffBox(s); world.remove(s.mesh); R.staff = R.staff.filter(o => o !== s);
    }
    while (list.length < want[t]) {
      const s = { type: t, mesh: makePerson(true), x: t === 'caj' ? CASHIER_SPOT.x : -3.5, z: t === 'caj' ? CASHIER_SPOT.z : -2.6, path: [], state: 'idle', timer: rand(0, 1) };
      s.mesh.position.set(s.x, 0, s.z);
      if (t === 'caj') s.mesh.rotation.y = Math.PI;
      R.staff.push(s); list.push(s);
    }
  }
}
function dropStaffBox(s) {
  if (s.box) { const b = s.box; b.carrier = null; b.claimed = null; setBoxOnFloor(b, s.x, s.z); s.box = null; }
  if (s.claim) { s.claim.claimed = null; s.claim = null; }
}
function findJob() {
  for (const b of R.boxes) {
    if (b.claimed || b.carrier || b === R.held || b.n <= 0) continue;
    let best = null, bd = 1e9;
    for (const id in S.shelves) {
      const sh = S.shelves[id];
      if (sh.p === b.p && sh.n < capOf(sh)) { const sl = slotById(id), d = Math.hypot(sl.x - b.mesh.position.x, sl.z - b.mesh.position.z); if (d < bd) { bd = d; best = id; } }
    }
    if (!best && !Object.values(S.shelves).some(sh => sh.p === b.p)) best = Object.keys(S.shelves).find(id => !S.shelves[id].p && !R.staff.some(s => s.slot === id));
    if (best) return { b, slot: best };
  }
  return null;
}
function updateStaff(s, dt) {
  if (s.type === 'caj') {
    const tgt = CASHIER_SPOT;
    if (Math.hypot(s.x - tgt.x, s.z - tgt.z) > .05) { s.path = [tgt]; walk(s, dt, 1.4); } else s.mesh.rotation.y = Math.PI;
    return;
  }
  // reponedor
  if (s.state === 'idle') {
    s.timer += dt; if (s.timer < .8) return; s.timer = 0;
    const job = findJob(); if (!job) return;
    s.claim = job.b; job.b.claimed = s; s.slot = job.slot;
    s.path = route(s, { x: job.b.mesh.position.x, z: job.b.mesh.position.z + (job.b.mesh.position.z > -2.4 ? -.4 : .4) });
    s.state = 'toBox';
  } else if (s.state === 'toBox') {
    if (!s.claim || s.claim.claimed !== s || s.claim === R.held || !R.boxes.includes(s.claim)) { s.claim = null; s.state = 'idle'; return; }
    if (walk(s, dt, 1.5)) {
      const b = s.claim; s.claim = null; b.carrier = s; s.box = b;
      s.mesh.attach(b.mesh); b.mesh.position.set(0, 1.0, .35); b.mesh.rotation.set(0, 0, 0); restack();
      s.path = route(s, standPoint(slotById(s.slot))); s.state = 'toShelf';
    }
  } else if (s.state === 'toShelf') {
    if (walk(s, dt, 1.5)) { s.state = 'fill'; s.timer = 0; faceShelf(s); }
  } else if (s.state === 'fill') {
    s.timer += dt; if (s.timer < .45) return; s.timer = 0;
    const sh = S.shelves[s.slot], b = s.box;
    if (b && b.n > 0 && sh && (!sh.p || sh.p === b.p) && (!sh.p || sh.n < capOf(sh))) {
      if (!sh.p) { sh.p = b.p; sh.n = 0; }
      sh.n++; b.n--; refreshShelf(s.slot);
    } else {
      s.slot = null;
      if (b && b.n === 0) { s.path = route(s, TRASH_STAND); s.state = 'toTrash'; }
      else { const [x, z] = deliverySpot(); s.dest = { x, z }; s.path = route(s, { x, z: z - .45 }); s.state = 'return'; }
    }
  } else if (s.state === 'toTrash') {
    if (walk(s, dt, 1.5)) { if (s.box) removeBox(s.box); s.box = null; s.state = 'idle'; }
  } else if (s.state === 'return') {
    if (walk(s, dt, 1.5)) { const b = s.box; s.box = null; if (b) { b.carrier = null; b.claimed = null; setBoxOnFloor(b, s.dest.x, s.dest.z); } s.state = 'idle'; }
  }
}

/* ---------------- jugador ---------------- */
const P = { x: 3, z: -1.6, yaw: 0, pitch: -.1 };
const input = { mx: 0, mz: 0, keys: {} };
function collides(x, z) {
  for (const c of R.col) {
    const cx = clamp(x, c.x1, c.x2), cz = clamp(z, c.z1, c.z2);
    if ((x - cx) ** 2 + (z - cz) ** 2 < PLAYER_R * PLAYER_R) return true;
  }
  return false;
}
function updatePlayer(dt) {
  let mx = input.mx, mz = input.mz;
  const k = input.keys;
  if (k.KeyW || k.ArrowUp) mz += 1; if (k.KeyS || k.ArrowDown) mz -= 1;
  if (k.KeyA || k.ArrowLeft) mx -= 1; if (k.KeyD || k.ArrowRight) mx += 1;
  const len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
  const sp = (S.cheats.fast ? 5.5 : 2.8) * (k.ShiftLeft ? 1.5 : 1);
  const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
  const dx = (fx * mz + rx * mx) * sp * dt, dz = (fz * mz + rz * mx) * sp * dt;
  const was = collides(P.x, P.z);
  if (!collides(P.x + dx, P.z) || was) P.x += dx;
  if (!collides(P.x, P.z + dz) || was) P.z += dz;
  P.x = clamp(P.x, -30, 20); P.z = clamp(P.z, -25, 14);
  camera.position.set(P.x, EYE + (len > .1 ? Math.sin(performance.now() / 120) * .025 : 0), P.z);
  camera.rotation.y = P.yaw; camera.rotation.x = P.pitch;
}

/* ---------------- interacción ---------------- */
const ray = new THREE.Raycaster(); ray.far = 2.9;
const CENTER = new THREE.Vector2(0, 0);
function getTarget() {
  ray.setFromCamera(CENTER, camera);
  const list = R.inter.filter(m => !(R.held && m === R.held.mesh) && !(m.userData.b && m.userData.b.carrier));
  const hits = ray.intersectObjects(list, false);
  return hits.length ? hits[0].object : null;
}
function hintFor(t) {
  const H = R.held;
  if (!t) return H ? '' : '';
  const d = t.userData;
  if (d.type === 'box') return H ? 'Ya llevas una caja' : `Coger caja: ${PB[d.b.p].n} (${d.b.n} uds)`;
  if (d.type === 'shelf') {
    const sh = S.shelves[d.id], cap = capOf(sh);
    if (H) {
      if (H.n === 0) return 'Caja vacía: tírala a la papelera';
      if (sh.p && sh.p !== H.p) return `Esta estantería es de ${PB[sh.p].n}`;
      if (sh.p && sh.n >= cap) return 'Estantería llena';
      return `Colocar ${PB[H.p].n}  ${sh.n}/${layout(PB[H.p]).cap}`;
    }
    return sh.p ? `${PB[sh.p].n}: ${sh.n}/${cap} · ${eur(S.price[sh.p])}` : 'Estantería vacía';
  }
  if (d.type === 'pc') return 'Usar el ordenador';
  if (d.type === 'sign') return R.dayOver || S.time >= CLOSE_MIN ? 'Hoy ya se ha cerrado' : S.open ? 'Cerrar la tienda' : 'Abrir la tienda';
  if (d.type === 'item') return `Escanear ${PB[d.o.it.p].n} · ${eur(d.o.it.price)}`;
  if (d.type === 'register' || d.type === 'pos') {
    const co = R.co;
    if (co.stage === 'pay') return co.method === 'card' ? `Cobrar con tarjeta ${eur(co.total)} en el datáfono` : `Abrir el cajón: cobrar ${eur(co.total)} en efectivo`;
    if (co.stage === 'scan') return `Escanea los productos de la cinta (${co.items.length + co.pending.length})`;
    return d.type === 'pos' ? 'Datáfono' : 'Caja registradora';
  }
  if (d.type === 'trash') return H ? (H.n ? 'La caja aún tiene productos' : 'Tirar caja vacía') : 'Papelera';
  return '';
}
function doAction() {
  const t = R.target; if (!t) return null;
  const d = t.userData, H = R.held;
  if (d.type === 'box' && !H) {
    const b = d.b; if (b.carrier) return null;
    if (b.claimed) { const s = b.claimed; b.claimed = null; if (s.claim === b) { s.claim = null; s.state = 'idle'; s.path = []; } }
    R.held = b; camera.attach(b.mesh);
    b.mesh.position.set(0, -.42, -.72); b.mesh.rotation.set(0, 0, 0);
    restack(); // las cajas que estaban encima bajan
    return 'pick';
  }
  if (d.type === 'shelf' && H) {
    const sh = S.shelves[d.id];
    if (H.n <= 0) { toast('La caja está vacía'); return null; }
    if (sh.p && sh.p !== H.p) { toast(`Esta estantería es de ${PB[sh.p].n}`); return null; }
    if (!sh.p) { sh.p = H.p; sh.n = 0; }
    if (sh.n >= capOf(sh)) { toast('La estantería está llena'); return null; }
    sh.n++; H.n--; refreshShelf(d.id); beep(420 + Math.random() * 60, .04, 'sine', .04);
    return 'place';
  }
  if (d.type === 'trash' && H) {
    if (H.n > 0) { toast('Primero coloca todo lo que queda en la caja'); return null; }
    const b = H; R.held = null; removeBox(b); beep(200, .12, 'sawtooth', .04); return 'trash';
  }
  if (d.type === 'pc') { openPC('pedidos'); return 'pc'; }
  if (d.type === 'sign') { toggleOpen(); return 'sign'; }
  if (d.type === 'item') { scanItem(t); return 'scan'; }
  if (d.type === 'register' || d.type === 'pos') {
    const co = R.co;
    if (co.stage === 'pay') { if (co.method === 'card') openPOS(); else openCash(); return 'pay'; }
    return null;
  }
  return null;
}
function dropHeld() {
  const b = R.held; if (!b) return;
  R.held = null;
  let x = P.x - Math.sin(P.yaw) * .8, z = P.z - Math.cos(P.yaw) * .8;
  if (collides(x, z)) { x = P.x; z = P.z; }
  setBoxOnFloor(b, x, z);
}
function turnAwayOutside() {
  for (const c of R.customers) if (c.state === 'enter' && !c.inDoor) {
    c.state = 'leave'; const dir = Math.random() < .5 ? 1 : -1, lz = laneFor(dir);
    c.path = [{ x: c.x, z: lz }, { x: dir * STREET_END, z: lz }];
    if (Math.random() < .5) say(c, 'Vaya, ha cerrado');
  }
}
function toggleOpen() {
  if (R.dayOver || S.time >= CLOSE_MIN) { toast('La tienda ya ha cerrado por hoy'); return; }
  S.open = !S.open; if (S.open) S.started = true; else turnAwayOutside();
  drawSign(); beep(S.open ? 700 : 400, .12, 'triangle', .06);
  toast(S.open ? '¡Tienda abierta! Empieza a correr el reloj.' : 'Tienda cerrada: no entrarán más clientes.');
}

/* ---------------- tiempo y día ---------------- */
function rushFactor(m) {
  const h = m / 60;
  if (h < 10) return .6; if (h < 12) return .9; if (h < 15) return 1.25;
  if (h < 18) return .8; if (h < 21) return 1.3; return .45;
}
function updateTime(dt) {
  if (!S.started || R.dayOver) return;
  if (S.time < CLOSE_MIN) {
    S.time = Math.min(CLOSE_MIN, S.time + dt); // 1 s real = 1 min de juego (antes de la velocidad)
    if (S.time >= CLOSE_MIN && S.open) { S.open = false; drawSign(); turnAwayOutside(); toast('Son las 22:00: la tienda cierra. Atiende a los últimos clientes.'); }
  }
  if (S.open) {
    const stocked = new Set(Object.values(S.shelves).filter(s => s.p && s.n > 0).map(s => s.p)).size;
    if (stocked > 0) {
      const rate = (.03 + .007 * stocked + .004 * S.level) * (.5 + S.rep / 100) * rushFactor(S.time);
      R.spawnAcc += rate * dt;
      if (R.spawnAcc >= 1) { R.spawnAcc -= 1; if (R.customers.filter(c => c.state !== 'leave').length < maxCustomers()) spawnCustomer(); }
    }
  }
  if (S.time >= CLOSE_MIN && !S.open && !R.customers.some(c => c.state !== 'leave' || c.z < .3) && R.co.stage === 'idle') { R.dayOver = true; openSummary(); }
}
const SKY = [[480, '#9fd3f5'], [1080, '#a9d6f0'], [1170, '#f5b27a'], [1230, '#5a5f8f'], [1300, '#16203f']];
const tmpA = new THREE.Color(), tmpB = new THREE.Color();
function updateSky() {
  const m = S.time; let a = SKY[0], b = SKY[SKY.length - 1];
  for (let i = 0; i < SKY.length - 1; i++) if (m >= SKY[i][0] && m <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; }
  const f = b[0] === a[0] ? 0 : clamp((m - a[0]) / (b[0] - a[0]), 0, 1);
  tmpA.set(a[1]); tmpB.set(b[1]); tmpA.lerp(tmpB, f);
  scene.background.copy(tmpA); scene.fog.color.copy(tmpA);
  const night = clamp((m - 1170) / 130, 0, 1);
  sun.intensity = .7 * (1 - night * .85);
  hemi.intensity = 1.15 - night * .3;
  LAMP_MAT.color.set(night > .25 ? '#fff3c4' : '#d9d9cf');
}
function nextDay() {
  const L = LEVELS[S.storeLvl];
  const wages = S.staff.caj * WAGE.caj + S.staff.rep * WAGE.rep;
  S.money = r2(S.money - wages - L.rent);
  S.day++; S.time = OPEN_MIN; S.open = false; S.started = false; R.dayOver = false; R.spawnAcc = 0;
  S.dayStats = { sales: 0, served: 0, lost: 0, purchases: 0, other: 0 };
  PRODUCTS.forEach(p => { S.market[p.id] = r2(clamp(S.market[p.id] * (1 + rand(-.04, .04)), p.m * .85, p.m * 1.2)); });
  drawSign(); refreshAllTags(); save();
}

/* ---------------- pedidos ---------------- */
function updateOrders(dt) {
  for (const o of S.orders) o.t -= dt;
  const done = S.orders.filter(o => o.t <= 0);
  if (done.length) {
    S.orders = S.orders.filter(o => o.t > 0);
    for (const o of done) for (const [p, q] of Object.entries(o.items)) for (let i = 0; i < q; i++) { const [x, z] = deliverySpot(); spawnBox(p, PB[p].u, x, z); }
    toast('¡Ha llegado tu pedido! Las cajas están en la zona amarilla, junto al ordenador.');
    beep(523, .1, 'triangle', .06); setTimeout(() => beep(659, .1, 'triangle', .06), 110); setTimeout(() => beep(784, .14, 'triangle', .06), 220);
  }
}

/* ---------------- sonido ---------------- */
let actx = null;
function beep(freq, dur, type = 'sine', vol = .05) {
  if (!actx) return;
  try {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur + .02);
  } catch (e) { /* audio no disponible */ }
}

/* ---------------- interfaz: HUD ---------------- */
let toastT = null;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
}
const notes = [];
function note(msg) { notes.push({ msg, t: 5 }); if (notes.length > 3) notes.shift(); }
function tutorial() {
  const anyBox = R.boxes.length > 0, anyStock = Object.values(S.shelves).some(s => s.n > 0);
  if (!S.everOrdered && !anyBox) return 'Ve al ordenador (mesa a la izquierda de la entrada) y pide productos.';
  if (S.orders.length && !anyBox && !anyStock) return 'El pedido viene de camino.';
  if (anyBox && !anyStock && !R.held) return 'Coge una caja con «Usar» y llévala a una estantería.';
  if (R.held && !anyStock) return 'Mira la estantería y pulsa «Usar» para colocar cada producto (mantén pulsado para ir más rápido).';
  if (!S.started && anyStock && S.day === 1) return 'Abre la tienda: toca el cartel rojo junto a la puerta.';
  if (R.co.stage !== 'idle' && !S.staff.caj && S.stats.served < 3) return R.co.stage === 'pay' ? (R.co.method === 'card' ? 'Paga con tarjeta: toca el datáfono o la caja y teclea el total.' : 'Paga en efectivo: toca la caja registradora y devuelve el cambio exacto.') : 'Hay un cliente en la caja: ponte detrás del mostrador y toca cada producto de la cinta para escanearlo.';
  return '';
}
function updateHUD(dt) {
  $('money').textContent = eur(S.money);
  $('day').textContent = 'Día ' + S.day;
  $('time').textContent = hhmm(S.time);
  const st = $('status'); st.textContent = S.open ? 'ABIERTO' : 'CERRADO'; st.className = S.open ? 'open' : 'closed';
  $('lvlTxt').textContent = 'Nivel ' + S.level;
  $('xpBar').style.width = (S.xp / xpNeed(S.level) * 100) + '%';
  const t = R.target; $('cross').classList.toggle('on', !!t);
  $('hint').textContent = hintFor(t);
  const c = $('carry');
  if (R.held) { c.hidden = false; c.textContent = `Caja: ${PB[R.held.p].n} · ${R.held.n} uds`; } else c.hidden = true;
  for (const n of notes) n.t -= dt;
  while (notes.length && notes[0].t <= 0) notes.shift();
  const lines = [];
  const tut = tutorial(); if (tut) lines.push(tut);
  if (S.orders.length) lines.push('Pedido llega en ' + Math.ceil(Math.min(...S.orders.map(o => o.t))) + ' s');
  if (R.queue.length) lines.push('En la cola: ' + R.queue.length);
  if (S.cheats.speed > 1) lines.push('Tiempo x' + S.cheats.speed);
  notes.forEach(n => lines.push(n.msg));
  const html = lines.map(l => `<div>${l}</div>`).join('');
  if ($('notes').innerHTML !== html) $('notes').innerHTML = html;
}

/* ---------------- interfaz: paneles ---------------- */
function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === false || v == null) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
let PANEL = null;
function openPanel(title, tabs, tab, render, opts = {}) {
  PANEL = { title, tabs, tab, render, opts };
  $('panel').hidden = false; R.paused = true;
  if (document.pointerLockElement) document.exitPointerLock();
  releaseInputs();
  drawPanel(true);
}
function drawPanel(reset) {
  if (!PANEL) return;
  const body = $('panelBody'), keep = reset ? 0 : body.scrollTop;
  $('panelTitle').textContent = PANEL.title;
  $('panelClose').hidden = !!PANEL.opts.noClose;
  const tabs = $('tabs'); tabs.innerHTML = '';
  PANEL.tabs.forEach(([id, label]) => tabs.append(h('button', { class: PANEL.tab === id ? 'on' : '', onclick: () => { PANEL.tab = id; drawPanel(true); } }, label)));
  body.innerHTML = ''; $('panelFoot').innerHTML = '';
  PANEL.render(PANEL.tab, body, $('panelFoot'));
  body.scrollTop = keep;
}
function closePanel() {
  if (!PANEL) return;
  const cb = PANEL.opts.onClose; PANEL = null;
  $('panel').hidden = true; R.paused = false; save();
  cb && cb();
}
$('panelClose').addEventListener('click', closePanel);

/* ---- ordenador ---- */
function openPC(tab) {
  openPanel('Ordenador de la tienda', [['pedidos', 'Pedidos'], ['precios', 'Precios'], ['licencias', 'Licencias'], ['local', 'Local y muebles'], ['personal', 'Personal'], ['resumen', 'Resumen']], tab, renderPC);
}
function money(v) { return S.cheats.free ? 0 : v; }
function canPay(v) { return S.cheats.free || S.money >= v; }
function pay(v, kind = 'other') { if (S.cheats.free) return; S.money = r2(S.money - v); S.dayStats[kind] = r2((S.dayStats[kind] || 0) + v); }
function swatch(p) { const u = productImg(p); return u ? h('img', { class: 'pimg', src: u, alt: '' }) : h('div', { class: 'sw', style: `background:${p.c}` }); }
function renderPC(tab, body, foot) {
  if (tab === 'pedidos') {
    const lp = licensedProducts();
    body.append(h('p', { class: 'p' }, `Las cajas llegan a la zona amarilla en ${S.cheats.instant ? 'un instante' : DELIVERY_SEC + ' segundos'}.`));
    for (const g of GROUPS.filter(g => S.lic[g.id])) {
      body.append(h('div', { class: 'sec-t' }, g.n));
      lp.filter(p => p.g === g.id).forEach(p => {
        const q = R.cart[p.id] || 0;
        const inStock = Object.values(S.shelves).filter(s => s.p === p.id).reduce((a, s) => a + s.n, 0) + R.boxes.filter(b => b.p === p.id).reduce((a, b) => a + b.n, 0);
        body.append(h('div', { class: 'row' }, swatch(p),
          h('div', {}, h('b', {}, p.n), h('span', { class: 's' }, `Caja de ${p.u} · ${eur(money(p.bc))} · tienes ${inStock}`)),
          h('div', { class: 'ctl' },
            h('button', { class: 'btn ghost sq', onclick: () => { R.cart[p.id] = Math.max(0, q - 1); drawPanel(); } }, '−'),
            h('b', {}, String(q)),
            h('button', { class: 'btn sq', onclick: () => { R.cart[p.id] = q + 1; drawPanel(); } }, '+'))));
      });
    }
    const total = Object.entries(R.cart).reduce((a, [p, q]) => a + PB[p].bc * q, 0);
    const n = Object.values(R.cart).reduce((a, q) => a + q, 0);
    foot.append(h('div', {}, h('span', { class: 'p' }, n + ' cajas'), h('div', { class: 'total' }, eur(money(total)))),
      h('button', { class: 'btn red', disabled: !n || !canPay(total), onclick: () => {
        pay(total, 'purchases');
        const items = {}; for (const [p, q] of Object.entries(R.cart)) if (q) items[p] = q;
        S.orders.push({ items, t: S.cheats.instant ? 0.01 : DELIVERY_SEC });
        S.everOrdered = true; R.cart = {}; toast('Pedido hecho. Llegará a la zona amarilla.'); drawPanel();
      } }, 'Comprar'));
  }
  if (tab === 'precios') {
    body.append(h('p', { class: 'p' }, 'Si pones un precio más alto que el de mercado, algunos clientes no lo comprarán. Por encima de un 60 % más caro no lo compra nadie.'));
    licensedProducts().forEach(p => {
      const pr = S.price[p.id], cost = p.bc / p.u, margin = Math.round((pr - cost) / pr * 100), ratio = pr / S.market[p.id];
      const set = v => { S.price[p.id] = r2(Math.max(.05, v)); refreshAllTags(); drawPanel(); };
      body.append(h('div', { class: 'row' }, swatch(p),
        h('div', {}, h('b', {}, p.n), h('span', { class: 's' }, `Mercado ${eur(S.market[p.id])} · coste ${eur(cost)} · margen ${margin}%${ratio > 1.3 ? ' · muy caro' : ''}`)),
        h('div', { class: 'ctl' },
          h('button', { class: 'btn ghost sq', onclick: () => set(pr - .05) }, '−'),
          h('b', {}, eur(pr).replace(' €', '')),
          h('button', { class: 'btn sq', onclick: () => set(pr + .05) }, '+'))));
    });
    foot.append(h('button', { class: 'btn ghost', onclick: () => { licensedProducts().forEach(p => S.price[p.id] = S.market[p.id]); refreshAllTags(); drawPanel(); } }, 'Todo a precio de mercado'),
      h('button', { class: 'btn', onclick: () => { licensedProducts().forEach(p => S.price[p.id] = r2(S.market[p.id] * 1.1)); refreshAllTags(); drawPanel(); } }, 'Mercado +10 %'));
  }
  if (tab === 'licencias') {
    body.append(h('p', { class: 'p' }, 'Cada licencia te deja vender un grupo de productos nuevo. Se desbloquean al subir de nivel.'));
    GROUPS.forEach(g => {
      const have = S.lic[g.id], lvlOk = S.level >= g.lvl;
      body.append(h('div', { class: 'row' }, swatch(PRODUCTS.find(p => p.g === g.id)),
        h('div', {}, h('b', {}, g.n), h('span', { class: 's' }, PRODUCTS.filter(p => p.g === g.id).map(p => p.n).join(', '))),
        have ? h('span', { class: 's' }, 'Comprada') :
          h('button', { class: 'btn alt', disabled: !lvlOk || !canPay(g.cost), onclick: () => { pay(g.cost); S.lic[g.id] = true; toast('Licencia de ' + g.n + ' comprada'); drawPanel(); } },
            lvlOk ? 'Comprar' : 'Nivel ' + g.lvl, h('small', {}, eur(money(g.cost))))));
    });
  }
  if (tab === 'local') {
    const all = slotList(), free = all.filter(s => !S.shelves[s.id]);
    body.append(h('div', { class: 'sec-t' }, 'Estanterías'));
    body.append(h('div', { class: 'row' }, h('div', { class: 'sw', style: 'background:#c9cfcc' }),
      h('div', {}, h('b', {}, 'Estantería de 4 baldas'), h('span', { class: 's' }, `Tienes ${Object.keys(S.shelves).length} · huecos libres ${free.length}`)),
      h('button', { class: 'btn', disabled: !free.length || !canPay(SHELF_COST), onclick: () => {
        pay(SHELF_COST); const id = free[0].id; S.shelves[id] = { p: null, n: 0 }; createShelf(id); toast('Estantería nueva colocada'); drawPanel();
      } }, free.length ? 'Comprar' : 'Sin sitio', h('small', {}, eur(money(SHELF_COST))))));
    body.append(h('div', { class: 'sec-t' }, 'Ampliar el local'));
    const next = LEVELS[S.storeLvl + 1], cur = LEVELS[S.storeLvl];
    body.append(h('p', { class: 'p' }, `Ahora: ${cur.W} × ${cur.D} m · alquiler ${eur(cur.rent)} al día.`));
    if (next) {
      const ok = S.level >= next.lvl;
      body.append(h('div', { class: 'row' }, h('div', { class: 'sw', style: 'background:#1f6f5c' }),
        h('div', {}, h('b', {}, `${next.W} × ${next.D} m`), h('span', { class: 's' }, `Más huecos para estanterías · alquiler ${eur(next.rent)} al día`)),
        h('button', { class: 'btn alt', disabled: !ok || !canPay(next.cost), onclick: () => { pay(next.cost); S.storeLvl++; buildShell(); toast('¡Local ampliado!'); drawPanel(); } },
          ok ? 'Ampliar' : 'Nivel ' + next.lvl, h('small', {}, eur(money(next.cost))))));
    } else body.append(h('p', { class: 'p' }, 'Tu local ya es del tamaño máximo.'));
  }
  if (tab === 'personal') {
    body.append(h('p', { class: 'p' }, 'El sueldo se paga al cerrar cada día.'));
    const cajOk = S.level >= CAJ_LVL;
    body.append(h('div', { class: 'row' }, h('div', { class: 'sw', style: 'background:#2f9e5b' }),
      h('div', {}, h('b', {}, 'Cajero'), h('span', { class: 's' }, `Escanea y cobra solo · ${eur(WAGE.caj)}/día`)),
      S.staff.caj ? h('button', { class: 'btn ghost', onclick: () => { S.staff.caj = 0; syncStaff(); drawPanel(); } }, 'Despedir')
        : h('button', { class: 'btn', disabled: !cajOk, onclick: () => { S.staff.caj = 1; syncStaff(); toast('Cajero contratado'); drawPanel(); } }, cajOk ? 'Contratar' : 'Nivel ' + CAJ_LVL)));
    const nextLvl = REP_LVL[S.staff.rep];
    body.append(h('div', { class: 'row' }, h('div', { class: 'sw', style: 'background:#2f9e5b' }),
      h('div', {}, h('b', {}, `Reponedores (${S.staff.rep}/${REP_LVL.length})`), h('span', { class: 's' }, `Llevan cajas a las estanterías y tiran las vacías · ${eur(WAGE.rep)}/día cada uno`)),
      h('div', { class: 'ctl' },
        S.staff.rep ? h('button', { class: 'btn ghost', onclick: () => { S.staff.rep--; syncStaff(); drawPanel(); } }, 'Despedir') : null,
        nextLvl ? h('button', { class: 'btn', disabled: S.level < nextLvl, onclick: () => { S.staff.rep++; syncStaff(); toast('Reponedor contratado'); drawPanel(); } }, S.level >= nextLvl ? 'Contratar' : 'Nivel ' + nextLvl) : null)));
  }
  if (tab === 'resumen') {
    const L = LEVELS[S.storeLvl], wages = S.staff.caj * WAGE.caj + S.staff.rep * WAGE.rep;
    const stars = Math.round(S.rep / 20);
    body.append(h('div', { class: 'sum' },
      h('div', {}, h('span', {}, 'Reputación'), h('b', {}, '★'.repeat(stars) + '☆'.repeat(5 - stars))),
      h('div', {}, h('span', {}, 'Ventas de hoy'), h('b', { class: 'pos' }, eur(S.dayStats.sales))),
      h('div', {}, h('span', {}, 'Clientes atendidos hoy'), h('b', {}, String(S.dayStats.served))),
      h('div', {}, h('span', {}, 'Compras de hoy'), h('b', { class: 'neg' }, eur(S.dayStats.purchases))),
      h('div', {}, h('span', {}, 'Gastos fijos al cerrar'), h('b', { class: 'neg' }, eur(L.rent + wages))),
      h('div', {}, h('span', {}, 'Total facturado'), h('b', {}, eur(S.stats.total)))));
    body.append(h('p', { class: 'p' }, 'La reputación sube cuando los clientes encuentran todo a buen precio y baja si falta género, si algo está caro o si esperan mucho en la cola.'));
  }
}

/* ---- cobro en efectivo y con tarjeta ---- */
const DENOMS = [50, 20, 10, 5, 2, 1, .5, .2, .1, .05, .02, .01];
const MONEY_STYLE = { 50: 'm50', 20: 'm20', 10: 'm10', 5: 'm5', 2: 'c2', 1: 'c1', .5: 'cg', .2: 'cg', .1: 'cg', .05: 'cc', .02: 'cc', .01: 'cc' };
const moneyLabel = v => v >= 1 ? v + ' €' : Math.round(v * 100) + ' c';
function moneyPiece(v, onclick, small) {
  return h('button', { class: `money ${v >= 5 ? 'bill' : 'coin'} ${MONEY_STYLE[v]}${small ? ' small' : ''}`, onclick }, h('span', {}, moneyLabel(v)));
}
function openCash() {
  let back = [];
  const co = R.co;
  if (R.drawer) R.drawer.position.z = -0.92;
  beep(300, .08, 'square', .04);
  openPanel('Cobro en efectivo', [], null, (tab, body, foot) => {
    const change = r2(co.given - co.total), given = r2(back.reduce((a, v) => a + v, 0)), diff = r2(change - given);
    body.append(h('div', { class: 'cashinfo' },
      h('div', {}, h('span', {}, 'Total'), h('b', {}, eur(co.total))),
      h('div', {}, h('span', {}, 'Te entrega'), h('b', {}, eur(co.given))),
      h('div', { class: 'hl' }, h('span', {}, 'Cambio'), h('b', {}, eur(change)))));
    body.append(h('div', { class: 'tray-t' }, 'El cliente te da'), h('div', { class: 'tray given' }, co.givenParts.map(v => moneyPiece(v, null, true))));
    body.append(h('div', { class: 'tray-t' }, 'Cajón · toca para devolver'));
    body.append(h('div', { class: 'drawer' },
      h('div', { class: 'bills' }, DENOMS.filter(v => v >= 5).map(v => moneyPiece(v, () => { back.push(v); beep(1800, .03, 'square', .03); drawPanel(); }))),
      h('div', { class: 'coins' }, DENOMS.filter(v => v < 5).map(v => moneyPiece(v, () => { back.push(v); beep(2400, .03, 'square', .03); drawPanel(); })))));
    body.append(h('div', { class: 'tray-t' }, 'Devuelves · toca para quitar'),
      h('div', { class: 'tray back' }, back.length ? back.map((v, i) => moneyPiece(v, () => { back.splice(i, 1); drawPanel(); }, true)) : h('span', { class: 'p' }, 'Nada todavía')));
    const st = Math.abs(diff) < .001 ? ['ok', 'Cambio exacto'] : diff > 0 ? ['warn', 'Faltan ' + eur(diff)] : ['bad', 'Te has pasado ' + eur(-diff)];
    body.append(h('div', { class: 'cashstate ' + st[0] }, st[1]));
    foot.append(h('button', { class: 'btn ghost', onclick: () => { back = []; drawPanel(); } }, 'Vaciar'),
      h('button', { class: 'btn red', disabled: Math.abs(diff) > .001, onclick: () => { closePanel(); finishSale(); } }, change > 0 ? 'Dar cambio' : 'Cobrar'));
  }, { onClose: () => { if (R.drawer) R.drawer.position.z = -1.12; } });
}
function openPOS() {
  let digits = '';
  const co = R.co;
  openPanel('Datáfono', [], null, (tab, body, foot) => {
    const val = (parseInt(digits || '0', 10) / 100);
    body.append(h('p', { class: 'p' }, 'Teclea el importe que marca la pantalla de la caja y pulsa Cobrar. El cliente acerca la tarjeta.'));
    body.append(h('div', { class: 'posref' }, h('span', {}, 'Pantalla de la caja'), h('b', {}, eur(co.total))));
    body.append(h('div', { class: 'posscreen' }, eur(val)));
    const key = k => h('button', { class: 'key' + (k === 'C' ? ' kc' : k === '⌫' ? ' kb' : ''), onclick: () => {
      if (k === 'C') digits = ''; else if (k === '⌫') digits = digits.slice(0, -1); else if (digits.length < 7) digits = (digits + k).replace(/^0+/, '');
      beep(1500, .025, 'square', .025); drawPanel();
    } }, k);
    body.append(h('div', { class: 'keypad' }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(key)));
    foot.append(h('span', { class: 'p' }, 'Se teclea en céntimos: 7, 4, 5 = 7,45 €'),
      h('button', { class: 'btn red', disabled: !digits, onclick: () => {
        if (Math.abs(val - co.total) > .001) { toast('El importe no coincide con el total de la caja'); beep(180, .2, 'sawtooth', .05); digits = ''; drawPanel(); return; }
        beep(990, .15, 'sine', .06); closePanel(); finishSale();
      } }, 'Cobrar'));
  });
}

/* ---- resumen del día ---- */
function openSummary() {
  const L = LEVELS[S.storeLvl], wages = S.staff.caj * WAGE.caj + S.staff.rep * WAGE.rep, ds = S.dayStats;
  const net = r2(ds.sales - ds.purchases - (ds.other || 0) - wages - L.rent);
  openPanel(`Fin del día ${S.day}`, [], null, (tab, body, foot) => {
    body.append(h('div', { class: 'sum' },
      h('div', {}, h('span', {}, 'Ventas'), h('b', { class: 'pos' }, eur(ds.sales))),
      h('div', {}, h('span', {}, 'Clientes atendidos'), h('b', {}, String(ds.served))),
      h('div', {}, h('span', {}, 'Clientes perdidos'), h('b', {}, String(ds.lost))),
      h('div', {}, h('span', {}, 'Compras a proveedores'), h('b', { class: 'neg' }, '−' + eur(ds.purchases))),
      ds.other ? h('div', {}, h('span', {}, 'Mejoras y licencias'), h('b', { class: 'neg' }, '−' + eur(ds.other))) : null,
      h('div', {}, h('span', {}, 'Sueldos'), h('b', { class: 'neg' }, '−' + eur(wages))),
      h('div', {}, h('span', {}, 'Alquiler'), h('b', { class: 'neg' }, '−' + eur(L.rent))),
      h('div', { class: 'tot' }, h('span', {}, 'Resultado del día'), h('b', { class: net >= 0 ? 'pos' : 'neg' }, eur(net)))));
    body.append(h('p', { class: 'p' }, 'Al empezar el nuevo día se pagan los sueldos y el alquiler. Los precios de mercado cambian un poco cada día.'));
    foot.append(h('span', {}), h('button', { class: 'btn red', onclick: () => { closePanel(); nextDay(); } }, `Empezar día ${S.day + 1}`));
  }, { noClose: true });
}

/* ---- menú, trucos y copia de seguridad ---- */
function openMenu() {
  openPanel('Menú', [['juego', 'Juego'], ['trucos', 'Trucos'], ['copia', 'Copia de seguridad']], 'juego', renderMenu);
}
function renderMenu(tab, body, foot) {
  if (tab === 'juego') {
    body.append(h('div', { class: 'sec-t' }, 'Nombre del súper'));
    const inp = h('input', { type: 'text', id: 'storeName', maxlength: 22, value: S.name });
    body.append(inp, h('button', { class: 'btn', onclick: () => { const v = inp.value.trim(); if (v) { S.name = v; drawFacade(); toast('Nombre guardado'); save(); } } }, 'Guardar nombre'));
    body.append(h('div', { class: 'sec-t' }, 'Cómo se juega'));
    body.append(h('p', { class: 'p', html:
      '1. Pide cajas en el <b>ordenador</b>. Llegan a la zona amarilla.<br>2. Coge una caja y <b>colócala</b> en una estantería producto a producto.<br>3. <b>Abre la tienda</b> con el cartel de la puerta. Abre a las 8:00 y cierra a las 22:00.<br>4. En la <b>caja</b>, escanea cada producto y cobra: con tarjeta o dando el cambio.<br>5. Sube de nivel para comprar licencias, ampliar el local y contratar personal.' }));
    body.append(h('p', { class: 'p' }, 'Móvil: joystick a la izquierda, arrastra a la derecha para mirar. Ordenador: WASD, ratón, clic o E para usar, Q para soltar, Mayús para correr.'));
    body.append(h('div', { class: 'sec-t' }, 'Empezar de cero'));
    let confirm = false;
    const del = h('button', { class: 'btn ghost', onclick: () => {
      if (!confirm) { confirm = true; del.textContent = 'Pulsa otra vez para borrarlo todo'; del.className = 'btn red'; return; }
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* nada */ }
      location.reload();
    } }, 'Borrar partida');
    body.append(del);
    foot.append(h('span', {}), h('button', { class: 'btn red', onclick: closePanel }, 'Volver al juego'));
  }
  if (tab === 'trucos') {
    const C = S.cheats;
    const btn = (label, fn, cls = 'btn') => h('button', { class: cls, onclick: () => { fn(); drawPanel(); } }, label);
    const tog = (label, key) => h('button', { class: 'btn toggle ' + (C[key] ? 'on' : 'ghost'), onclick: () => { C[key] = !C[key]; drawPanel(); } }, label + (C[key] ? ': sí' : ': no'));
    body.append(h('p', { class: 'p' }, 'Úsalos cuando quieras avanzar más rápido.'));
    body.append(h('div', { class: 'sec-t' }, 'Dinero'));
    body.append(h('div', { class: 'grid3' },
      btn('+500 €', () => { S.money = r2(S.money + 500); }), btn('+5.000 €', () => { S.money = r2(S.money + 5000); }), btn('+50.000 €', () => { S.money = r2(S.money + 50000); })));
    body.append(h('div', { class: 'sec-t' }, 'Nivel'));
    body.append(h('div', { class: 'grid3' },
      btn('+1 nivel', () => { S.level++; S.xp = 0; }), btn('Nivel 12', () => { S.level = Math.max(S.level, 12); S.xp = 0; }),
      btn('Todas las licencias', () => { GROUPS.forEach(g => S.lic[g.id] = true); })));
    body.append(h('div', { class: 'sec-t' }, 'Velocidad del tiempo'));
    body.append(h('div', { class: 'grid3' }, [1, 2, 4, 8, 16].map(v => h('button', { class: 'btn ' + (C.speed === v ? 'alt' : 'ghost'), onclick: () => { C.speed = v; drawPanel(); } }, 'x' + v)),
      btn('Ir a las 21:55', () => { if (S.started && S.time < 21 * 60 + 55) S.time = 21 * 60 + 55; else toast('Abre la tienda primero'); }, 'btn ghost')));
    body.append(h('div', { class: 'sec-t' }, 'Tienda'));
    body.append(h('div', { class: 'grid2' },
      btn('Llenar estanterías', () => {
        const lp = licensedProducts().map(p => p.id); let i = 0;
        for (const id in S.shelves) { const sh = S.shelves[id]; if (!sh.p) { sh.p = lp[i++ % lp.length]; } sh.n = capOf(sh); refreshShelf(id); }
      }),
      btn('Traer 5 clientes', () => { if (!S.open) toast('Abre la tienda para que entren'); else for (let i = 0; i < 5; i++) setTimeout(spawnCustomer, i * 700); }),
      btn('Cobrar a toda la cola', () => {
        for (const c of [...R.queue]) {
          const tot = r2(c.basket.reduce((a, it) => a + it.price, 0));
          if (R.co.cust === c) { R.co.total = tot; finishSale(); continue; }
          S.money = r2(S.money + tot); S.dayStats.sales = r2(S.dayStats.sales + tot); S.dayStats.served++; S.stats.served++; S.stats.total = r2(S.stats.total + tot); addXP(tot); leave(c, true);
        }
      }),
      btn('Reputación al máximo', () => { S.rep = 100; }),
      tog('Entrega instantánea', 'instant'), tog('Compras gratis', 'free'), tog('Andar rápido', 'fast')));
    foot.append(h('span', {}), h('button', { class: 'btn red', onclick: closePanel }, 'Volver al juego'));
  }
  if (tab === 'copia') {
    save();
    let code = '';
    try { code = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { code = ''; }
    body.append(h('p', { class: 'p' }, 'La partida se guarda sola en este dispositivo. Copia este código y guárdalo (en Notas, por ejemplo) para no perderla o para pasarla a otro móvil.'));
    const ta = h('textarea', { id: 'saveCode', readonly: true }); ta.value = code;
    body.append(ta, h('button', { class: 'btn', onclick: () => {
      const ok = () => toast('Código copiado');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, () => { ta.select(); toast('Selecciónalo y cópialo a mano'); });
      else { ta.select(); document.execCommand && document.execCommand('copy'); ok(); }
    } }, 'Copiar código'));
    body.append(h('div', { class: 'sec-t' }, 'Cargar una partida'));
    const ti = h('textarea', { id: 'loadCode', placeholder: 'Pega aquí tu código' });
    body.append(ti, h('button', { class: 'btn alt', onclick: () => {
      try {
        const d = JSON.parse(decodeURIComponent(escape(atob(ti.value.trim()))));
        if (!d || d.v !== 1) throw new Error('formato');
        localStorage.setItem(SAVE_KEY, JSON.stringify(d)); location.reload();
      } catch (e) { toast('Ese código no es válido. Cópialo entero y vuelve a probar.'); }
    } }, 'Cargar partida'));
    foot.append(h('span', {}), h('button', { class: 'btn red', onclick: closePanel }, 'Volver al juego'));
  }
}
$('menuBtn').addEventListener('click', openMenu);

/* ---------------- controles ---------------- */
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isTouch) document.body.classList.add('desktop');
const touches = {};
let stickId = null;
const stickEl = $('stick'), knob = $('knob');
function stickCenter() { const r = stickEl.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, rad: r.width / 2 }; }
function releaseInputs() { input.mx = input.mz = 0; stickId = null; knob.style.transform = ''; for (const k in input.keys) input.keys[k] = false; stopRepeat(); }
canvas.addEventListener('touchstart', e => {
  if (R.paused) return; e.preventDefault();
  for (const t of e.changedTouches) {
    const c = stickCenter();
    if (stickId === null && t.clientX < window.innerWidth * .45 && t.clientY > window.innerHeight * .4) { stickId = t.identifier; moveStick(t, c); }
    else touches[t.identifier] = { x: t.clientX, y: t.clientY };
  }
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault(); if (R.paused) return;
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) moveStick(t, stickCenter());
    else if (touches[t.identifier]) {
      const o = touches[t.identifier];
      P.yaw -= (t.clientX - o.x) * .006; P.pitch = clamp(P.pitch - (t.clientY - o.y) * .006, -1.3, 1.3);
      o.x = t.clientX; o.y = t.clientY;
    }
  }
}, { passive: false });
const endTouch = e => {
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) { stickId = null; input.mx = input.mz = 0; knob.style.transform = ''; }
    delete touches[t.identifier];
  }
};
canvas.addEventListener('touchend', endTouch); canvas.addEventListener('touchcancel', endTouch);
function moveStick(t, c) {
  let dx = t.clientX - c.x, dy = t.clientY - c.y; const d = Math.hypot(dx, dy), max = c.rad * .8;
  if (d > max) { dx *= max / d; dy *= max / d; }
  knob.style.transform = `translate(${dx}px,${dy}px)`;
  input.mx = dx / max; input.mz = -dy / max;
}
// botón Usar: mantener pulsado repite colocar/escanear
let repeatT = null;
function stopRepeat() { clearInterval(repeatT); repeatT = null; $('btnUse').classList.remove('down'); }
function pressUse() {
  if (R.paused) return;
  R.target = getTarget();
  const kind = doAction();
  if (kind === 'place' || kind === 'scan') {
    stopRepeat();
    repeatT = setInterval(() => { if (R.paused) return stopRepeat(); R.target = getTarget(); const k = doAction(); if (k !== 'place' && k !== 'scan') stopRepeat(); }, 170);
  }
}
const useBtn = $('btnUse');
useBtn.addEventListener('touchstart', e => { e.preventDefault(); useBtn.classList.add('down'); pressUse(); }, { passive: false });
useBtn.addEventListener('touchend', e => { e.preventDefault(); stopRepeat(); });
useBtn.addEventListener('touchcancel', stopRepeat);
useBtn.addEventListener('mousedown', pressUse); useBtn.addEventListener('mouseup', stopRepeat);
$('btnDrop').addEventListener('touchstart', e => { e.preventDefault(); dropHeld(); }, { passive: false });
$('btnDrop').addEventListener('click', dropHeld);
// ratón y teclado
canvas.addEventListener('mousedown', e => {
  if (isTouch || R.paused) return;
  if (document.pointerLockElement !== canvas) { canvas.requestPointerLock && canvas.requestPointerLock(); return; }
  if (e.button === 0) pressUse(); else if (e.button === 2) dropHeld();
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mouseup', () => { if (!isTouch) stopRepeat(); });
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement !== canvas || R.paused) return;
  P.yaw -= e.movementX * .0025; P.pitch = clamp(P.pitch - e.movementY * .0025, -1.3, 1.3);
});
window.addEventListener('keydown', e => {
  if (R.paused || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  input.keys[e.code] = true;
  if (e.code === 'KeyE' && !e.repeat) pressUse();
  if (e.code === 'KeyQ') dropHeld();
  if (e.code === 'Tab') { e.preventDefault(); openMenu(); }
});
window.addEventListener('keyup', e => { input.keys[e.code] = false; if (e.code === 'KeyE') stopRepeat(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); releaseInputs(); } });
window.addEventListener('pagehide', save);
document.addEventListener('gesturestart', e => e.preventDefault());

/* ---------------- arranque ---------------- */
function boot(state) {
  S = state;
  buildStreet(); R.col.push(...STREET_COL);
  buildShell(); buildFurniture();
  Object.keys(S.shelves).forEach(createShelf);
  (S.boxes || []).forEach(b => spawnBox(b.p, b.n, b.x, b.z));
  P.x = S.player.x; P.z = S.player.z; P.yaw = S.player.yaw;
  if (collides(P.x, P.z) || P.z > 0) { P.x = 3; P.z = -1.6; }
  syncStaff();
  if (S.time >= CLOSE_MIN) { S.open = false; }
  drawSign(); updateSky();
  for (let i = 0; i < pedTarget(); i++) spawnPed(rand(-STREET_END + 2, STREET_END - 2));
  for (let i = 0; i < 4; i++) { updateCars(2.5); }
}
const saved = loadState();
boot(saved || freshState());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawFacade(); refreshAllTags(); });
if (saved) $('playBtn').textContent = 'Continuar · Día ' + S.day;
$('playBtn').addEventListener('click', () => {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume && actx.resume(); } catch (e) { actx = null; }
  $('start').hidden = true; $('hud').hidden = false; R.paused = false;
  if (!isTouch && canvas.requestPointerLock) canvas.requestPointerLock();
  if (!saved && S.day === 1) toast('Bienvenido a tu local. Empieza pidiendo productos en el ordenador.');
});

let last = performance.now(), hintT = 0;
function simulate(rdt) {
  const dt = rdt * S.cheats.speed;
  updatePlayer(rdt);
  updateTime(dt);
  updateOrders(dt);
  for (const c of R.customers) updateCustomer(c, dt);
  R.customers = R.customers.filter(c => !c.dead);
  updateCheckout(dt);
  for (const s of R.staff) updateStaff(s, dt);
  ambient(dt);
  hintT += rdt; if (hintT > .1) { hintT = 0; R.target = getTarget(); updateHUD(.1); updateSky(); }
}
function ambient(dt) {
  updatePeds(dt); updateCars(dt);
  for (const list of [R.customers, R.staff, R.peds]) for (const a of list) { animPerson(a, dt); updateBubble(a, dt); }
}
function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(.1, (now - last) / 1000); last = now;
  if (!R.paused) {
    simulate(rdt);
    R.saveT += rdt; if (R.saveT > 10) { R.saveT = 0; save(); }
  } else {
    if (!PANEL) ambient(rdt);
    camera.position.set(P.x, EYE, P.z); camera.rotation.y = P.yaw; camera.rotation.x = P.pitch;
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
