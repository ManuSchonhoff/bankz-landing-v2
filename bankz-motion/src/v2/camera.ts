// Rig de camara v2.
// - Camara 3D: una PerspectiveCamera animada por keyframes de beat (posicion, mirada, FOV).
// - Camara 2D: zoom / paneo / golpes que se aplican igual al 3D (setViewOffset, sin perder resolucion)
//   y a la capa HTML (CSS), para que texto y mundo se muevan como una sola toma.
// Todo es funcion pura del frame (acepta subframes para el motion blur por acumulacion).
import * as THREE from 'three';
import {eInOut, lerp, prog, punch, smooth, track} from '../anim';
import {Aspect, monotone} from './t2';
import {HERO, W} from './world';

export type Cam = {pos: THREE.Vector3; look: THREE.Vector3; fov: number};

export const SIZE = {'16x9': [1920, 1080], '9x16': [1080, 1920]} as const;
// En 9:16 el centro de la toma se sube a y = 880 (centro de la zona segura 260-1500).
export const BASE_SHIFT_Y = {'16x9': 0, '9x16': -80} as const;
export const CENTER: Record<'16x9' | '9x16', [number, number]> = {'16x9': [960, 540], '9x16': [540, 880]};

// Distancia de frenado: el anillo de la puerta queda en el radio del isotipo + 24 px.
export const DOOR_STOP = {'16x9': 2.0, '9x16': 2.93} as const;
export const BASE_FOV = {'16x9': 50, '9x16': 70} as const;

export const focalPx = (fov: number, H: number) => H / 2 / Math.tan((fov * Math.PI) / 360);
// Radio en pantalla del anillo de la puerta (espacio sin zoom 2D).
export const doorRingPx = (a: Aspect) => (W.doorR * focalPx(BASE_FOV[a], SIZE[a][1])) / DOOR_STOP[a];

const backOut = (t: number, c1 = 1.4) => 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

// ---------- Acto 1: vuelo por el corredor y frenada frente a la puerta ----------
const zCache: Partial<Record<Aspect, (x: number) => number>> = {};
const zFlight = (a: Aspect) => {
  const stop = W.doorZ + DOOR_STOP[a];
  return monotone([
    [0, 5.0],
    [24, 4.92],
    [48, 3.7],
    [72, 0.6],
    [96, -2.2],
    [120, -4.8],
    [144, -7.6],
    [168, -10.4],
    [186, stop - 0.95],
    [192, stop - 0.25],
  ]);
};

const act12 = (f: number, a: Aspect): Cam => {
  const zf = (zCache[a] ??= zFlight(a));
  const stop = W.doorZ + DOOR_STOP[a];
  let z = zf(Math.min(f, 192));
  if (f >= 192) z = stop - 0.25 + 0.25 * backOut(prog(f, 192, 8)); // frenada en seco, se resuelve en 8 f
  let x = 0;
  if (a === '9x16') x = 0.34 * smooth(f, 72, 108) * (1 - smooth(f, 158, 190));
  let fov = BASE_FOV[a];
  for (const t0 of [120, 144, 168]) fov += 4 * Math.sin(Math.PI * prog(f, t0, 10)); // golpes de velocidad
  // En B8 la camara se alinea con el centro de la puerta.
  const y = W.ringY * smooth(f, 150, 190);
  const env = smooth(f, 20, 60) * (1 - smooth(f, 170, 192));
  const dx = 0.02 * Math.sin((2 * Math.PI * f) / 170) * env;
  const dy = 0.015 * Math.sin((2 * Math.PI * f) / 230 + 0.7) * env;
  return {pos: new THREE.Vector3(x + dx, y + dy, z), look: new THREE.Vector3(x * 0.6 + dx * 0.5, y + dy * 0.5, z - 10), fov};
};

// ---------- Actos 3-5: radar, dial y la caja (set alrededor de la cerradura D) ----------
export const D = new THREE.Vector3(0, HERO.lockY, HERO.lockZ); // centro del radar y del dial (plano x = 0)

const orbit = (center: THREE.Vector3, r: number, el: number, az: number) =>
  new THREE.Vector3(center.x - r * Math.cos(el) * Math.cos(az), center.y + r * Math.sin(el), center.z + r * Math.cos(el) * Math.sin(az));

const deg = (d: number) => (d * Math.PI) / 180;

const act345 = (f: number, a: Aspect): Cam => {
  const fov = BASE_FOV[a];
  const kd = a === '16x9' ? 1 : 1.45; // en 9:16 el set se mira desde mas lejos para que el dial entre en la zona segura
  const drift = (s: number) => 0.004 * Math.sin((2 * Math.PI * f) / 200 + s);
  if (f < 576) {
    // B17-B21: radar en leve picado, la camara orbita despacio. B22-B24: se pone de frente al dial y se acerca.
    const t = smooth(f, 504, 528);
    // Leve picado sobre el dial y, antes del vuelo, baja al eje dial -> cerradura.
    const el = lerp(lerp(deg(34), deg(7), t), 0, smooth(f, 552, 576));
    const az = lerp(lerp(deg(-16), deg(14), prog(f, 390, 114)), 0, t);
    const r = (lerp(0.82, 0.7, t) - 0.08 * smooth(f, 528, 576)) * kd;
    const pos = orbit(D, r, el, az);
    pos.x += drift(0);
    pos.y += drift(1.3);
    return {pos, look: D.clone(), fov};
  }
  // B25: la camara atraviesa el dial por el centro y del otro lado esta el frente de la caja.
  const h = HERO.heightAt(f);
  const heroC = new THREE.Vector3(W.wallX, W.frontsY0 + h / 2, HERO.z);
  const dFit = Math.max(0.3, h * (a === '16x9' ? 1.9 : 2.2) + 0.12);
  const az = deg(30) * smooth(f, 590, 690);
  const after = orbit(heroC, dFit, deg(4), -az);
  if (f < 596) {
    // Vuelo recto por el eje dial -> cerradura; al final se une a la orbita.
    const t = eInOut(prog(f, 576, 20));
    const start = orbit(D, 0.62 * kd, 0, 0);
    const pos = start.clone().lerp(after, t);
    const look = D.clone().lerp(heroC, smooth(f, 576, 596));
    return {pos, look, fov};
  }
  if (f < 696) return {pos: after, look: heroC, fov};
  // B29: se retira rapido y la caja resulta ser parte del modulo. B30: la pared se aleja en la niebla.
  const modC = new THREE.Vector3(W.wallX, HERO.moduleCenterY + 0.12, HERO.z);
  const t = eInOut(prog(f, 696, 20));
  const far = orbit(modC, lerp(dFit, a === '16x9' ? 2.5 : 3.3, t) + 1.6 * smooth(f, 720, 760), deg(4), -lerp(deg(30), deg(12), t));
  return {pos: far, look: heroC.clone().lerp(modC, t), fov};
};

export const camAt = (f: number, a: Aspect): Cam => {
  if (f < 384) return act12(f, a);
  return act345(f, a);
};

// ---------- Camara 2D (compartida por 3D y HTML) ----------
export type Cam2D = {s: number; tx: number; ty: number};

const SCALE2: [number, number][] = [
  [0, 1],
  [24, 1.02],
  [48, 1],
  [204, 1],
  [288, 1.05], // empuja mientras escribe
  [300, 1.05],
  [311, 1.07],
  [312, 1], // drop
  [336, 1],
  [356, 0.94], // B15: se retira
  [384, 0.96], // B16: zoom lento
  [385, 1],
  [720, 1],
  [744, 1.02],
  [800, 1.03],
  [840, 1.03],
  [864, 1],
  [888, 1.03],
  [902, 1],
  [936, 1.015],
  [954, 1],
];

const PUNCHES2: [number, number, number][] = [
  [288, 1.06, 6],
  [312, 1.12, 8],
  [384, 1.06, 6],
  [552, 1.04, 6],
  [864, 1.06, 6],
  [888, 1.05, 8],
];

export const cam2At = (f: number, a: Aspect, caretX?: (t: number) => number | null): Cam2D => {
  let s = track(f, SCALE2);
  for (const [at, from, dur] of PUNCHES2) s *= punch(f, at, from, dur);
  const [Wd, Hd] = SIZE[a];
  // Deriva continua (nunca quieta), nula al principio y al final para el loop.
  const env = smooth(f, 24, 60) * (1 - smooth(f, 915, 950));
  let tx = Wd * 0.004 * Math.sin((2 * Math.PI * f) / 380) * env;
  let ty = Hd * 0.003 * Math.sin((2 * Math.PI * f) / 290 + 1.3) * env;
  // Sigue al caret con 4 f de retraso.
  if (caretX) {
    const cx = caretX(f - 4);
    if (cx !== null) {
      const w = smooth(f, 204, 214) * (1 - smooth(f, 288, 300)) + smooth(f, 731, 741) * (1 - smooth(f, 792, 812));
      tx -= (cx - CENTER[a][0]) * 0.25 * w;
    }
  }
  ty += BASE_SHIFT_Y[a];
  return {s, tx, ty};
};

// Aplicacion al 3D: el mismo mapeo pantalla = C' + s (p - C0) + t, via setViewOffset.
export const viewOffset = (c: Cam2D, a: Aspect) => {
  const [Wd, Hd] = SIZE[a];
  const C0 = [Wd / 2, Hd / 2];
  const Cp = [Wd / 2, Hd / 2 + BASE_SHIFT_Y[a]];
  const tx = c.tx;
  const ty = c.ty - BASE_SHIFT_Y[a];
  const ox = C0[0] - (Cp[0] + tx) / c.s;
  const oy = C0[1] - (Cp[1] + ty) / c.s;
  return {x: ox, y: oy, w: Wd / c.s, h: Hd / c.s};
};

// CSS para la capa HTML (coordenadas de "escena": centro C').
export const cam2Css = (c: Cam2D, a: Aspect): React.CSSProperties => {
  const [cx, cy] = CENTER[a];
  return {
    transform: `translate(${c.tx.toFixed(3)}px, ${(c.ty - BASE_SHIFT_Y[a]).toFixed(3)}px) scale(${c.s.toFixed(5)})`,
    transformOrigin: `${cx}px ${cy}px`,
  };
};

// Proyeccion de un punto 3D a coordenadas de escena (espacio de la capa HTML).
const _cam = new THREE.PerspectiveCamera();
export const project = (p: THREE.Vector3, f: number, a: Aspect) => {
  const c = camAt(f, a);
  const [Wd, Hd] = SIZE[a];
  _cam.fov = c.fov;
  _cam.aspect = Wd / Hd;
  _cam.near = 0.01;
  _cam.far = 100;
  _cam.position.copy(c.pos);
  _cam.lookAt(c.look);
  _cam.updateProjectionMatrix();
  _cam.updateMatrixWorld();
  const v = p.clone().project(_cam);
  const depth = p.clone().applyMatrix4(_cam.matrixWorldInverse).z;
  return {x: ((v.x + 1) / 2) * Wd, y: ((1 - v.y) / 2) * Hd + BASE_SHIFT_Y[a], depth: -depth, px: focalPx(c.fov, Hd)};
};
