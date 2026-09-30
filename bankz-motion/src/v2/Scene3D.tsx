import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useFrame as useR3FFrame, useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {LineSegments2} from 'three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import {eInOut, eOut, lerp, prog, pulse, smooth} from '../anim';
import {cam2At, camAt, D, SIZE, viewOffset} from './camera';
import font400json from './fonts/alexandria-400.typeface.json';
import font500json from './fonts/alexandria-500.typeface.json';
import {NEGRO, NIEVE} from '../theme';
import {Aspect, blurSamplesAt, themeAt2} from './t2';
import {caretXFor} from './type2';
import {allModules, circleSegments, HERO, heroSegments, ringZ, textGeometry, W} from './world';

const loader = new FontLoader();
export const FONT500 = loader.parse(font500json as any);
export const FONT400 = loader.parse(font400json as any);

// ---------- Lineas con grosor real en px (Line2) ----------
const makeLines = (positions: number[], widthPx: number, fog = true) => {
  const g = new LineSegmentsGeometry();
  g.setPositions(positions);
  const m = new LineMaterial({color: NIEVE, linewidth: widthPx, transparent: true, depthWrite: false});
  m.fog = fog;
  const obj = new LineSegments2(g, m);
  obj.frustumCulled = false;
  return obj;
};
const textMesh = (font: any, lines: string[], em: number) => {
  const {geometry} = textGeometry(font, lines, em);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: NIEVE, transparent: true, depthWrite: false, side: THREE.DoubleSide}));
  mesh.frustumCulled = false;
  return mesh;
};
const setLine = (o: THREE.Object3D, ink: THREE.Color, opacity: number) => {
  const m = (o as LineSegments2).material as LineMaterial;
  m.color.copy(ink);
  m.opacity = opacity;
  o.visible = opacity > 0.002;
};
const setMesh = (o: THREE.Mesh, color: THREE.Color, opacity: number) => {
  const m = o.material as THREE.MeshBasicMaterial;
  m.color.copy(color);
  m.opacity = opacity;
  o.visible = opacity > 0.002;
};

// ---------- Radar y dial ----------
export const RR = 0.2; // radio del anillo del radar = radio del dial
const DIAL_INNER = 0.075;
export const WHEEL_WORDS = ['24 hs', 'semana', 'mes', 'semestre', 'año'];
const WORD_STEP = 72; // grados entre palabras
// Giro del dial: rapido desde B22, desacelera en B23 (Easing.out(cubic)) y clava "año" arriba en f552.
const PHI_END = 90 - (90 - 4 * WORD_STEP); // "año" (indice 4) en 90 grados
export const dialPhi = (f: number) => PHI_END - 1080 * (1 - eOut(prog(f, 504, 48)));
// Barrido del radar: 1,25 vueltas por beat, asi en cada beat (B18-B21) apunta a un cuadrante distinto.
export const sweepAngle = (f: number) => (2 * Math.PI * 1.25 * (f - 384)) / 24;

const radarQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const dialQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0));
const wallQ = dialQ.clone();

type Props = {aspect: Aspect; width: number; height: number};

const useWorld = (aspect: Aspect) =>
  useMemo(() => {
    const root = new THREE.Group();
    // --- Corredor ---
    const rings = new Array(W.rings).fill(0).map((_, k) => {
      const o = makeLines(circleSegments(W.ringR, 160), 1.6);
      o.position.set(0, W.ringY, ringZ(k));
      return o;
    });
    const modules = allModules().map((m, i) => ({obj: makeLines(m.positions, 1.1), tramo: m.tramo, index: i}));
    const p1 = aspect === '16x9' ? ['999 cajas de seguridad privadas.'] : ['999 cajas', 'de seguridad', 'privadas.'];
    const p2 = aspect === '16x9' ? ['San Martín 133, Bahía Blanca.'] : ['San Martín 133,', 'Bahía Blanca.'];
    const em1 = aspect === '16x9' ? 0.13 : 0.19;
    const phrases = [textMesh(FONT500, p1, em1), textMesh(FONT500, p2, em1)];
    // En 9:16 la camara vuela pegada a la pared derecha: las frases se paran en su eje de vuelo.
    const px = aspect === '16x9' ? 0 : 0.3;
    phrases[0].position.set(px, 0, W.phrase1Z);
    phrases[1].position.set(px, 0, W.phrase2Z);
    const doorDisc = new THREE.Mesh(new THREE.CircleGeometry(W.doorR, 128), new THREE.MeshBasicMaterial({color: NEGRO, fog: false}));
    doorDisc.position.set(0, W.ringY, W.doorZ);
    const doorRing = makeLines(circleSegments(W.doorR, 160), 2, false);
    doorRing.position.set(0, W.ringY, W.doorZ + 0.001);
    const doorDot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 32), new THREE.MeshBasicMaterial({color: NIEVE, fog: false, transparent: true}));
    doorDot.position.set(0, W.ringY, W.doorZ + 0.002);
    root.add(...rings, ...modules.map((m) => m.obj), ...phrases, doorDisc, doorRing, doorDot);

    // --- Radar -> dial (plano local XY, normal local +z) ---
    const rd = new THREE.Group();
    rd.position.copy(D);
    const refRing = makeLines(circleSegments(RR, 160), 1.6, false);
    const sonar = new Array(9).fill(0).map(() => makeLines(circleSegments(1, 128), 1.2, false));
    const sweep = makeLines([0, 0, 0, 1, 0, 0], 1.6, false);
    const spin = new THREE.Group(); // lo que gira con el dial
    const disc = new THREE.Mesh(new THREE.RingGeometry(DIAL_INNER, RR, 128), new THREE.MeshBasicMaterial({color: NEGRO, fog: false, transparent: true}));
    disc.position.z = -0.001;
    const innerRing = makeLines(circleSegments(DIAL_INNER, 128), 1.4, false);
    const tickPos: number[] = [];
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const r0 = i % 5 === 0 ? RR * 0.8 : RR * 0.89;
      tickPos.push(r0 * Math.cos(a), r0 * Math.sin(a), 0, RR * 0.97 * Math.cos(a), RR * 0.97 * Math.sin(a), 0);
    }
    const ticks = makeLines(tickPos, 1.4, false);
    const words = WHEEL_WORDS.map((w, i) => {
      const m = textMesh(FONT500, [w], 0.03);
      const a = ((90 - i * WORD_STEP) * Math.PI) / 180;
      const g = new THREE.Group();
      g.add(m);
      m.position.set(0, RR * 1.28, 0);
      g.rotation.z = a - Math.PI / 2;
      return {g, m};
    });
    const dots = WHEEL_WORDS.map((_, i) => {
      const m = textMesh(FONT500, ['·'], 0.03);
      const a = ((90 - (i + 0.5) * WORD_STEP) * Math.PI) / 180;
      const g = new THREE.Group();
      g.add(m);
      m.position.set(0, RR * 1.28, 0);
      g.rotation.z = a - Math.PI / 2;
      return {g, m};
    });
    spin.add(disc, innerRing, ticks, ...words.map((w) => w.g), ...dots.map((d) => d.g));
    const index = makeLines([0, RR * 1.03, 0.001, 0, RR * 1.13, 0.001], 2, false);
    const lockC = makeLines(circleSegments(0.012, 48), 1.6, false);
    const plan = textMesh(FONT500, ['Plan anual.'], 0.026);
    plan.position.z = 0.002;
    rd.add(refRing, ...sonar, sweep, spin, index, lockC, plan);
    root.add(rd);

    // --- Frente protagonista y "5 tamaños." ---
    const hero = makeLines(heroSegments(0.07, 0.09), 2, false);
    hero.position.set(W.wallX - 0.0005, W.frontsY0, HERO.z);
    hero.quaternion.copy(wallQ);
    const sizesTitle = textMesh(FONT500, aspect === '16x9' ? ['5 tamaños.'] : ['5 tamaños.'], aspect === '16x9' ? 0.13 : 0.12);
    sizesTitle.position.set(W.wallX - 0.01, HERO.moduleTopY + 0.17, HERO.z);
    sizesTitle.quaternion.copy(wallQ);
    root.add(hero, sizesTitle);
    return {root, rings, modules, phrases, doorDisc, doorRing, doorDot, rd, refRing, sonar, sweep, spin, disc, innerRing, ticks, words, dots, index, lockC, plan, hero, sizesTitle};
  }, [aspect]);

type World = ReturnType<typeof useWorld>;

const applyWorld = (w: World, f: number) => {
  const th = themeAt2(f);
  const ink = new THREE.Color(th.ink);
  const bg = new THREE.Color(th.bg);
  const act1 = f < 384;

  // ===== Acto 1-2: corredor y puerta =====
  w.rings.forEach((o, k) => {
    const te = 24 + 12 * k; // sonar: un anillo cada medio beat
    const s = Math.max(0.0001, eOut(prog(f, te, 12)));
    o.scale.set(s, s, 1);
    setLine(o, ink, act1 && f >= te ? prog(f, te, 6) : 0);
  });
  w.modules.forEach(({obj, tramo, index}) => {
    let op = act1 ? 0.85 * eOut(prog(f, 72 + tramo * 2.5, 10)) : 0;
    // B29: el modulo del frente protagonista aparece entero; B30 se aleja en la niebla.
    if (index === HERO.moduleIndex && f >= 696 && f < 790) op = 0.85 * eOut(prog(f, 696, 12)) * (1 - smooth(f, 718, 736));
    setLine(obj, ink, op);
  });
  setMesh(w.phrases[0], ink, act1 ? eOut(prog(f, 86, 10)) : 0);
  setMesh(w.phrases[1], ink, act1 ? eOut(prog(f, 134, 10)) : 0);
  setMesh(w.doorDisc, bg, act1 ? 1 : 0);
  // El anillo fino de la puerta queda bajo el gancho del "?" y se retira cuando el anillo grueso lo cubre (f306).
  setLine(w.doorRing, ink, f < 306 ? prog(f, 72, 12) : 0);
  setMesh(w.doorDot, ink, f >= 72 && f < 288 ? 1 : 0);

  // ===== Acto 3-4: radar -> dial =====
  const inRD = f >= 396 && f < 600;
  w.rd.visible = inRD;
  const tilt = smooth(f, 504, 528);
  w.rd.quaternion.copy(radarQ).slerp(dialQ, tilt);
  // Anillo de referencia del radar = borde del dial.
  setLine(w.refRing, ink, inRD ? eOut(prog(f, 398, 10)) : 0);
  // Sonar: del punto salen anillos cada medio beat; en B22 se aprietan hacia el borde del dial.
  w.sonar.forEach((o, k) => {
    const te = 398 + 12 * k;
    const t = prog(f, te, 36);
    let r = RR * 1.5 * eOut(t);
    let op = f >= te ? 1 - smooth(r, RR * 0.9, RR * 1.5) : 0;
    const sq = smooth(f, 504, 520);
    r = lerp(r, RR, sq);
    op *= 1 - sq;
    o.scale.set(Math.max(r, 0.0001), Math.max(r, 0.0001), 1);
    setLine(o, ink, inRD && f < 520 ? op * 0.8 : 0);
  });
  const sweepLen = RR * (1 - smooth(f, 504, 514));
  const ang = sweepAngle(f);
  w.sweep.scale.set(Math.max(sweepLen, 0.0001), 1, 1);
  w.sweep.rotation.z = ang;
  setLine(w.sweep, ink, inRD && f >= 398 && f < 514 ? prog(f, 398, 6) : 0);
  // Dial: se forma en B22 y gira; clava "año" en B24.
  const dialIn = smooth(f, 506, 522);
  w.spin.rotation.z = (dialPhi(f) * Math.PI) / 180;
  setMesh(w.disc, bg, inRD ? dialIn : 0);
  setLine(w.innerRing, ink, inRD ? dialIn : 0);
  w.ticks.scale.setScalar(lerp(0.6, 1, dialIn));
  setLine(w.ticks, ink, inRD ? dialIn : 0);
  w.words.forEach((wd, i) => setMesh(wd.m, ink, inRD ? smooth(f, 512 + i * 2, 522 + i * 2) : 0));
  w.dots.forEach((d) => setMesh(d.m, ink, inRD ? 0.6 * dialIn : 0));
  setLine(w.index, ink, inRD ? dialIn : 0);
  // El centro del dial se resuelve en "Plan anual." (el circulo cede su lugar al texto).
  setLine(w.lockC, ink, inRD ? dialIn * (1 - prog(f, 552, 6)) : 0);
  // B24: el centro del dial se resuelve en "Plan anual." (y late en el beat).
  setMesh(w.plan, ink, inRD ? eOut(prog(f, 552, 8)) : 0);
  const ps = pulse(f, 552, 0.06, 10);
  w.plan.scale.setScalar(ps);
  // B25: la camara atraviesa el dial; una vez del otro lado el dial ya no esta.
  if (f >= 586) w.rd.visible = false;

  // ===== Acto 5: el frente crece =====
  const hw = HERO.widthAt(f);
  const hh = HERO.heightAt(f);
  (w.hero.geometry as LineSegmentsGeometry).setPositions(heroSegments(hw, hh));
  setLine(w.hero, ink, f >= 576 && f < 708 ? 1 : 0);
  setMesh(w.sizesTitle, ink, f >= 700 && f < 790 ? eOut(prog(f, 700, 10)) * (1 - smooth(f, 718, 736)) : 0);
  (w.sizesTitle.material as THREE.MeshBasicMaterial).fog = true;
  w.hero.visible = w.hero.visible && f < 708;
};

// Niebla del color del fondo: atenuacion por distancia (opacidad), no un degrade decorativo.
const fogAt = (f: number) => {
  if (f < 384) {
    let near = lerp(8, 2.5, smooth(f, 40, 80));
    let far = lerp(24, 10, smooth(f, 40, 80));
    near = lerp(near, 0.3, smooth(f, 192, 204)); // B9: el corredor se apaga; queda la puerta
    far = lerp(far, 1.6, smooth(f, 192, 204));
    return {near, far};
  }
  // B30: la pared se aleja en la niebla.
  return {near: lerp(3, 0.5, smooth(f, 716, 750)), far: lerp(9, 2.2, smooth(f, 716, 750))};
};

// ---------- Render con motion blur por acumulacion de muestras de camara ----------
const Accumulator: React.FC<Props & {world: World}> = ({aspect, width, height, world}) => {
  const f = useCurrentFrame();
  const {gl, scene} = useThree();
  const res = useMemo(() => {
    const sample = new THREE.WebGLRenderTarget(width, height, {samples: 4, type: THREE.HalfFloatType});
    const accum = new THREE.WebGLRenderTarget(width, height, {type: THREE.HalfFloatType});
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const addMat = new THREE.MeshBasicMaterial({transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false});
    const copyMat = new THREE.MeshBasicMaterial({depthTest: false, depthWrite: false, toneMapped: false});
    const addScene = new THREE.Scene();
    addScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), addMat));
    const copyScene = new THREE.Scene();
    copyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat));
    const cam = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
    return {sample, accum, quadCam, addMat, copyMat, addScene, copyScene, cam, caretX: caretXFor(aspect)};
  }, [width, height, aspect]);

  useR3FFrame(() => {
    const th = themeAt2(f);
    applyWorld(world, f);
    const fog = fogAt(f);
    scene.fog = new THREE.Fog(new THREE.Color(th.bg), fog.near, fog.far);
    const n = blurSamplesAt(f);
    const shutter = 0.5; // 180 grados
    const [Wd, Hd] = SIZE[aspect];
    gl.autoClear = false;
    gl.setRenderTarget(res.accum);
    gl.setClearColor(NEGRO, 0); // acumulador: alfa 0, el color no se ve
    gl.clear();
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? f : f + shutter * (i / (n - 1) - 0.5);
      const c = camAt(t, aspect);
      const vo = viewOffset(cam2At(t, aspect, res.caretX), aspect);
      res.cam.fov = c.fov;
      res.cam.aspect = width / height;
      res.cam.near = 0.01;
      res.cam.position.copy(c.pos);
      res.cam.lookAt(c.look);
      res.cam.setViewOffset(Wd, Hd, vo.x, vo.y, vo.w, vo.h);
      res.cam.updateProjectionMatrix();
      gl.setRenderTarget(res.sample);
      gl.setClearColor(new THREE.Color(th.bg), 1);
      gl.clear();
      gl.render(scene, res.cam);
      gl.setRenderTarget(res.accum);
      res.addMat.map = res.sample.texture;
      res.addMat.opacity = 1 / n;
      gl.render(res.addScene, res.quadCam);
    }
    gl.setRenderTarget(null);
    res.copyMat.map = res.accum.texture;
    gl.setClearColor(new THREE.Color(th.bg), 1);
    gl.clear();
    gl.render(res.copyScene, res.quadCam);
  }, 1);
  return null;
};

const WorldView: React.FC<Props> = (p) => {
  const world = useWorld(p.aspect);
  return (
    <>
      <primitive object={world.root} />
      <Accumulator {...p} world={world} />
    </>
  );
};

export const Scene3D: React.FC<Props> = (p) => (
  <ThreeCanvas width={p.width} height={p.height} flat gl={{antialias: false, alpha: false}} camera={{near: 0.01, far: 100}}>
    <WorldView {...p} />
  </ThreeCanvas>
);

// Para anclar HTML a puntos del set radar/dial (coordenadas de mundo).
export const radarPoint = (f: number, angleRad: number, r: number) => {
  const q = radarQ.clone().slerp(dialQ, smooth(f, 504, 528));
  return new THREE.Vector3(r * Math.cos(angleRad), r * Math.sin(angleRad), 0).applyQuaternion(q).add(D);
};
export {eInOut};
