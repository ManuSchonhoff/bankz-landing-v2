// Geometria del mundo v2 (metros). Todo es linea: frentes de caja, cerraduras, arcos, puerta.
import * as THREE from 'three';

export const W = {
  tramo: 1.2, // distancia entre arcos
  rings: 12, // doce anillos del sonar = doce arcos del tunel
  ringR: 1.35,
  ringY: 0.05,
  wallX: 0.9, // paredes en x = +-0.9
  frontsY0: -0.72, // base de los modulos
  doorZ: -15.5,
  doorR: 0.5,
  phrase1Z: -5.0,
  phrase2Z: -10.4,
} as const;

export const ringZ = (k: number) => -W.tramo * k;

// Circulo como segmentos de linea (pares de puntos) en el plano XY.
export const circleSegments = (r: number, n: number, cx = 0, cy = 0, cz = 0, out: number[] = []) => {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    out.push(cx + r * Math.cos(a0), cy + r * Math.sin(a0), cz, cx + r * Math.cos(a1), cy + r * Math.sin(a1), cz);
  }
  return out;
};

// ---------- 999 frentes en 16 modulos ----------
// Medidas publicas (cm): alto x ancho. Modulos 1-13: 30 BKZ1, 15 BKZ2, 12 BKZ3, 6 BKZ4.
// Modulos 14-16: 30 BKZ1, 15 BKZ2, 12 BKZ3, 3 BKZ5. Total: 480 / 240 / 192 / 78 / 9 = 999.
export const SIZES = {1: [9, 7], 2: [9, 22], 3: [12, 22], 4: [25, 22], 5: [51, 27]} as const;
type Front = {x: number; y: number; w: number; h: number; model: 1 | 2 | 3 | 4 | 5}; // cm, origen abajo a la izquierda

const GAP = 0.6; // cm entre frentes

const rowsOf = (model: 1 | 2 | 3 | 4 | 5, count: number, perRow: number) => {
  const [h, w] = SIZES[model];
  const rows: Front[][] = [];
  for (let i = 0; i < count; i += perRow) {
    const n = Math.min(perRow, count - i);
    rows.push(new Array(n).fill(0).map((_, j) => ({x: j * (w + GAP), y: 0, w, h, model})));
  }
  return rows;
};

export const moduleFronts = (withBkz5: boolean): {fronts: Front[]; width: number; height: number} => {
  // Modulo apaisado (~1,1 m x 1,4 m) para que la pared del corredor sea continua.
  const rows = [
    ...(withBkz5 ? rowsOf(5, 3, 3) : rowsOf(4, 6, 3)),
    ...rowsOf(3, 12, 4),
    ...rowsOf(2, 15, 5),
    ...rowsOf(1, 30, 15),
  ];
  const width = Math.max(...rows.map((r) => r[r.length - 1].x + r[r.length - 1].w));
  const fronts: Front[] = [];
  let y = 0;
  for (const r of rows) {
    const rw = r[r.length - 1].x + r[r.length - 1].w;
    const off = (width - rw) / 2;
    for (const fr of r) fronts.push({...fr, x: fr.x + off, y});
    y += r[0].h + GAP;
  }
  return {fronts, width, height: y - GAP};
};

// Contorno + dos cerraduras (circulos al 30 % y 70 % del ancho, al 55 % del alto).
const frontSegments = (fr: Front, place: (u: number, v: number) => [number, number, number], out: number[]) => {
  const c = (u: number, v: number) => place(u / 100, v / 100);
  const quad = [c(fr.x, fr.y), c(fr.x + fr.w, fr.y), c(fr.x + fr.w, fr.y + fr.h), c(fr.x, fr.y + fr.h)];
  for (let i = 0; i < 4; i++) out.push(...quad[i], ...quad[(i + 1) % 4]);
  const r = 0.4;
  const ly = fr.y + fr.h * 0.55;
  for (const lx of [fr.x + fr.w * 0.3, fr.x + fr.w * 0.7]) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      out.push(...c(lx + r * Math.cos(a0), ly + r * Math.sin(a0)), ...c(lx + r * Math.cos(a1), ly + r * Math.sin(a1)));
    }
  }
};

// Segmentos de un modulo sobre la pared. side -1 = izquierda (x = -wallX), 1 = derecha.
export const moduleOnWall = (index: number, side: -1 | 1, zCenter: number) => {
  const m = moduleFronts(index >= 13);
  const out: number[] = [];
  const x = side * W.wallX;
  const halfW = m.width / 200;
  // u (m) a lo largo de la pared: en la izquierda crece hacia -z, en la derecha tambien (se ve espejado).
  const place = (u: number, v: number): [number, number, number] => [x, W.frontsY0 + v, zCenter + halfW - u];
  for (const fr of m.fronts) frontSegments(fr, place, out);
  return {positions: out, count: m.fronts.length};
};

// Los 16 modulos: tramos 1..8, izquierda modulos 1-8, derecha 9-16 (14-16 con BKZ 5).
export const allModules = () => {
  const mods: {positions: number[]; tramo: number; count: number}[] = [];
  for (let i = 0; i < 16; i++) {
    const side: -1 | 1 = i < 8 ? -1 : 1;
    const tramo = (i % 8) + 1;
    const zc = -W.tramo * tramo - W.tramo / 2;
    const m = moduleOnWall(i, side, zc);
    mods.push({positions: m.positions, tramo, count: m.count});
  }
  return mods;
};

export const totalFronts = () => allModules().reduce((a, m) => a + m.count, 0);

// Texto como malla plana a partir de la fuente typeface (Alexandria 400 / 500).
export const textGeometry = (font: {generateShapes: (t: string, s: number) => THREE.Shape[]}, lines: string[], em: number, lineGap = 1.12) => {
  const geos: THREE.BufferGeometry[] = [];
  lines.forEach((line, i) => {
    const g = new THREE.ShapeGeometry(font.generateShapes(line, em), 6);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    g.translate(-(bb.max.x + bb.min.x) / 2, -i * em * lineGap, 0);
    geos.push(g);
  });
  const merged = mergeGeos(geos);
  merged.computeBoundingBox();
  const bb = merged.boundingBox!;
  // Centro vertical en la altura de mayuscula del bloque.
  const top = 0.7 * em;
  const bottom = -(lines.length - 1) * em * lineGap;
  merged.translate(0, -(top + bottom) / 2, 0);
  return {geometry: merged, width: bb.max.x - bb.min.x};
};

const mergeGeos = (geos: THREE.BufferGeometry[]) => {
  let total = 0;
  for (const g of geos) total += g.getAttribute('position').count;
  const pos = new Float32Array(total * 3);
  const idx: number[] = [];
  let off = 0;
  for (const g of geos) {
    const p = g.getAttribute('position');
    pos.set(p.array as Float32Array, off * 3);
    const gi = g.getIndex();
    if (gi) for (let i = 0; i < gi.count; i++) idx.push(gi.getX(i) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setIndex(idx);
  return out;
};

// ---------- El frente protagonista (Actos 4-5) ----------
// Es el BKZ 5 del medio del modulo 14 (pared derecha, tramo 6). Crece desde BKZ 1 anclado abajo al centro.
const HERO_MODULE_INDEX = 13;
const heroModule = moduleFronts(true);
const heroFront = heroModule.fronts.filter((fr) => fr.model === 5)[1];
const heroZc = -W.tramo * ((HERO_MODULE_INDEX % 8) + 1) - W.tramo / 2;
const heroZ = heroZc + heroModule.width / 200 - (heroFront.x + heroFront.w / 2) / 100;

// Cambios de tamano: cada uno con overshoot, en los beats B26, B27, B28 y B29.
export const HERO_STEPS = [600, 624, 648, 672];
const sizeAt = (f: number): [number, number] => {
  const order = [1, 2, 3, 4, 5] as const;
  let i = 0;
  HERO_STEPS.forEach((s, k) => {
    if (f >= s) i = k + 1;
  });
  const cur = SIZES[order[i]];
  if (i === 0) return [cur[0] / 100, cur[1] / 100];
  const prev = SIZES[order[i - 1]];
  const t = Math.min(1, Math.max(0, (f - HERO_STEPS[i - 1]) / 12));
  const c1 = 1.4;
  const e = 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  return [(prev[0] + (cur[0] - prev[0]) * e) / 100, (prev[1] + (cur[1] - prev[1]) * e) / 100];
};

export const HERO = {
  moduleIndex: HERO_MODULE_INDEX,
  z: heroZ,
  lockY: W.frontsY0 + 0.55 * (SIZES[1][0] / 100),
  lockZ: heroZ + 0.2 * (SIZES[1][1] / 100),
  moduleCenterY: W.frontsY0 + heroModule.height / 200,
  moduleTopY: W.frontsY0 + heroModule.height / 100,
  heightAt: (f: number) => sizeAt(f)[0],
  widthAt: (f: number) => sizeAt(f)[1],
  modelAt: (f: number) => 1 + HERO_STEPS.filter((s) => f >= s).length,
};

// Segmentos del frente protagonista (contorno + dos cerraduras) en coordenadas locales:
// x a lo ancho (hacia +z del mundo), y hacia arriba, origen abajo al centro.
export const heroSegments = (w: number, h: number) => {
  const out: number[] = [];
  const q = [
    [-w / 2, 0],
    [w / 2, 0],
    [w / 2, h],
    [-w / 2, h],
  ];
  for (let i = 0; i < 4; i++) out.push(q[i][0], q[i][1], 0, q[(i + 1) % 4][0], q[(i + 1) % 4][1], 0);
  for (const lx of [-0.2 * w, 0.2 * w]) circleSegments(0.004, 24, lx, 0.55 * h, 0, out);
  return out;
};
