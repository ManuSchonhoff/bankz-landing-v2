import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useFrame as useR3FFrame, useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {LineSegments2} from 'three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import {eOut, prog} from '../anim';
import {NEGRO, NIEVE} from '../theme';
import {Aspect, blurSamplesP, camP, EVP, heroLock, heroOutline, SIZE_P, themeP, wallGroups} from './model';

const lines = (positions: number[], px: number) => {
  const g = new LineSegmentsGeometry();
  g.setPositions(positions);
  const m = new LineMaterial({color: NIEVE, linewidth: px, transparent: true, depthWrite: false});
  m.fog = true;
  const o = new LineSegments2(g, m);
  o.frustumCulled = false;
  return o;
};
const set = (o: LineSegments2, ink: THREE.Color, op: number) => {
  const m = o.material as LineMaterial;
  m.color.copy(ink);
  m.opacity = op;
  o.visible = op > 0.002;
};

const useWall = () =>
  useMemo(() => {
    const group = new THREE.Group();
    const lockR = lines(heroLock(false), 2);
    const lockL = lines(heroLock(true), 2);
    const hero = lines(heroOutline(), 2);
    const rest = wallGroups().map((g) => ({obj: lines(g.positions, 1.2), ring: g.ring}));
    group.add(lockR, lockL, hero, ...rest.map((r) => r.obj));
    return {group, lockR, lockL, hero, rest};
  }, []);

type Wall = ReturnType<typeof useWall>;

// B2: la cerradura (el punto) se completa en la caja protagonista; despues la pared se dibuja en ondas.
// La caja protagonista al 100 %, las demas al 30 %. En B7 (inversion) el 3D se apaga.
const applyWall = (w: Wall, f: number) => {
  const ink = new THREE.Color(themeP(f).ink);
  const on = f < EVP.drop;
  // El punto HTML de B1 cede la cerradura al 3D en B2 (mismos pixeles).
  set(w.lockR, ink, on && f >= 24 ? prog(f, 24, 4) : 0);
  set(w.lockL, ink, on ? eOut(prog(f, 28, 6)) : 0);
  set(w.hero, ink, on ? eOut(prog(f, 32, 8)) : 0);
  w.rest.forEach(({obj, ring}) => set(obj, ink, on ? 0.3 * eOut(prog(f, 40 + ring * 5, 10)) : 0));
};

const Accumulator: React.FC<{aspect: Aspect; wall: Wall}> = ({aspect, wall}) => {
  const f = useCurrentFrame();
  const {gl, scene} = useThree();
  const [W, H] = SIZE_P[aspect];
  const res = useMemo(() => {
    const sample = new THREE.WebGLRenderTarget(W, H, {samples: 4, type: THREE.HalfFloatType});
    const accum = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType});
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const addMat = new THREE.MeshBasicMaterial({transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false});
    const copyMat = new THREE.MeshBasicMaterial({depthTest: false, depthWrite: false, toneMapped: false});
    const addScene = new THREE.Scene();
    addScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), addMat));
    const copyScene = new THREE.Scene();
    copyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat));
    return {sample, accum, quadCam, addMat, copyMat, addScene, copyScene, cam: new THREE.PerspectiveCamera(50, W / H, 0.002, 100)};
  }, [W, H]);

  useR3FFrame(() => {
    const bg = new THREE.Color(themeP(f).bg);
    applyWall(wall, f);
    // Niebla del color del fondo: la pared se apaga por distancia (opacidad), no es un degrade.
    scene.fog = new THREE.Fog(bg, 2.5, 7);
    const n = blurSamplesP(f);
    gl.autoClear = false;
    gl.setRenderTarget(res.accum);
    gl.setClearColor(NEGRO, 0);
    gl.clear();
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? f : f + 0.5 * (i / (n - 1) - 0.5);
      const c = camP(t, aspect);
      res.cam.fov = c.fov;
      res.cam.aspect = W / H;
      res.cam.position.copy(c.pos);
      res.cam.lookAt(c.look);
      res.cam.updateProjectionMatrix();
      gl.setRenderTarget(res.sample);
      gl.setClearColor(bg, 1);
      gl.clear();
      gl.render(scene, res.cam);
      gl.setRenderTarget(res.accum);
      res.addMat.map = res.sample.texture;
      res.addMat.opacity = 1 / n;
      gl.render(res.addScene, res.quadCam);
    }
    gl.setRenderTarget(null);
    res.copyMat.map = res.accum.texture;
    gl.setClearColor(bg, 1);
    gl.clear();
    gl.render(res.copyScene, res.quadCam);
  }, 1);
  return null;
};

const WallView: React.FC<{aspect: Aspect}> = ({aspect}) => {
  const wall = useWall();
  return (
    <>
      <primitive object={wall.group} />
      <Accumulator aspect={aspect} wall={wall} />
    </>
  );
};

export const Wall3D: React.FC<{aspect: Aspect}> = ({aspect}) => {
  const [W, H] = SIZE_P[aspect];
  return (
    <ThreeCanvas width={W} height={H} flat gl={{antialias: false, alpha: false}} camera={{near: 0.002, far: 100}}>
      <WallView aspect={aspect} />
    </ThreeCanvas>
  );
};
