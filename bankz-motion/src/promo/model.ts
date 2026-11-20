// Promo "desde $54.000": 12 s, 150 BPM, 30 beats, 720 frames.
import * as THREE from 'three';
import {eInOut, lerp, prog, smooth} from '../anim';
import {NEGRO, NIEVE} from '../theme';
import {circleSegments, moduleFronts} from '../v2/world';

export type Aspect = '16x9' | '9x16';
export const DURATION_P = 720;
export const SIZE_P: Record<Aspect, [number, number]> = {'16x9': [1920, 1080], '9x16': [1080, 1920]};
export const CENTER_P: Record<Aspect, [number, number]> = {'16x9': [960, 540], '9x16': [540, 880]};

// Eventos: inversion a blanco en el precio (B7, f144) y vuelta al negro en el DNI (B13, f288).
export const EVP = {drop: 144, back: 288, placa: 456, fade: 696} as const;
export const themeP = (f: number) => (f >= EVP.drop && f < EVP.back ? {bg: NIEVE, ink: NEGRO, brand: 'negro' as const} : {bg: NEGRO, ink: NIEVE, brand: 'blanco' as const});

// ---------- La pared: un modulo de frentes en el plano z = 0, mirando a +z ----------
const mod = moduleFronts(false);
const toM = (xcm: number, ycm: number) => new THREE.Vector3((xcm - mod.width / 2) / 100, (ycm - mod.height / 2) / 100, 0);
const bkz1 = mod.fronts.filter((fr) => fr.model === 1);
export const HERO_P = bkz1[7]; // una BKZ 1 de la fila de arriba, al medio
export const LOCK_P = toM(HERO_P.x + 0.7 * HERO_P.w, HERO_P.y + 0.55 * HERO_P.h);
export const HERO_C = toM(HERO_P.x + HERO_P.w / 2, HERO_P.y + HERO_P.h / 2);
export const WALL_C = toM(mod.width / 2, mod.height / 2);

// Segmentos de un frente (contorno + dos cerraduras) en metros.
const frontSegs = (fr: (typeof mod.fronts)[number], out: number[]) => {
  const p = (x: number, y: number) => toM(x, y).toArray();
  const q = [p(fr.x, fr.y), p(fr.x + fr.w, fr.y), p(fr.x + fr.w, fr.y + fr.h), p(fr.x, fr.y + fr.h)];
  for (let i = 0; i < 4; i++) out.push(...q[i], ...q[(i + 1) % 4]);
  for (const lx of [0.3, 0.7]) {
    const c = toM(fr.x + lx * fr.w, fr.y + 0.55 * fr.h);
    circleSegments(0.004, 20, c.x, c.y, 0, out);
  }
  return out;
};

// Frentes agrupados por distancia a la caja protagonista: se dibujan en ondas desde ella.
export const wallGroups = () => {
  const groups: {positions: number[]; ring: number}[] = [];
  const byRing = new Map<number, number[]>();
  for (const fr of mod.fronts) {
    if (fr === HERO_P) continue;
    const c = toM(fr.x + fr.w / 2, fr.y + fr.h / 2);
    const ring = Math.min(9, Math.floor(c.distanceTo(HERO_C) / 0.12));
    if (!byRing.has(ring)) byRing.set(ring, []);
    frontSegs(fr, byRing.get(ring)!);
  }
  [...byRing.keys()].sort((a, b) => a - b).forEach((ring) => groups.push({positions: byRing.get(ring)!, ring}));
  return groups;
};
export const heroOutline = () => {
  const out: number[] = [];
  const p = (x: number, y: number) => toM(x, y).toArray();
  const fr = HERO_P;
  const q = [p(fr.x, fr.y), p(fr.x + fr.w, fr.y), p(fr.x + fr.w, fr.y + fr.h), p(fr.x, fr.y + fr.h)];
  for (let i = 0; i < 4; i++) out.push(...q[i], ...q[(i + 1) % 4]);
  return out;
};
export const heroLock = (left: boolean) => {
  const c = toM(HERO_P.x + (left ? 0.3 : 0.7) * HERO_P.w, HERO_P.y + 0.55 * HERO_P.h);
  return circleSegments(0.004, 32, c.x, c.y, 0);
};

// ---------- Camara 3D ----------
export const FOV_P: Record<Aspect, number> = {'16x9': 50, '9x16': 70};
const focal = (a: Aspect) => SIZE_P[a][1] / 2 / Math.tan((FOV_P[a] * Math.PI) / 360);
// Distancia a la que la cerradura (r = 0,4 cm) mide 4 px: el punto de B1.
export const D0 = (a: Aspect) => (0.004 * focal(a)) / 2;

export const camP = (f: number, a: Aspect) => {
  const d0 = D0(a);
  // B2-B6: la camara se aleja de la cerradura, gira y deja la pared a un costado (16:9) o arriba (9:16).
  const t = eInOut(prog(f, 24, 96));
  const yaw = lerp(0, a === '16x9' ? -0.32 : -0.22, t);
  const dist = lerp(d0, a === '16x9' ? 2.9 : 3.6, t);
  const lookFrom = LOCK_P.clone();
  const lookTo = a === '16x9' ? WALL_C.clone().add(new THREE.Vector3(-0.8, 0.02, 0)) : WALL_C.clone().add(new THREE.Vector3(0, -0.5, 0));
  const look = lookFrom.lerp(lookTo, t);
  const orbitC = LOCK_P.clone().lerp(WALL_C, t);
  let pos = new THREE.Vector3(orbitC.x + dist * Math.sin(yaw), orbitC.y + 0.06 * t, dist * Math.cos(yaw));
  // Deriva: nunca quieta.
  const env = smooth(f, 30, 60);
  pos.x += 0.012 * Math.sin((2 * Math.PI * f) / 160) * env;
  pos.y += 0.008 * Math.sin((2 * Math.PI * f) / 210 + 1) * env;
  // B6½: la camara se mete en la caja protagonista (motion blur) y en B7 el mundo se invierte.
  const push = Math.pow(prog(f, 128, 16), 2.2);
  if (push > 0) {
    const inside = HERO_C.clone().add(new THREE.Vector3(0, 0, 0.012));
    pos = pos.lerp(inside, push);
    look.lerp(HERO_C, push);
  }
  return {pos, look, fov: FOV_P[a]};
};

export const blurSamplesP = (f: number) => (f >= 128 && f < 144 ? 14 : 1);
export {smooth};
