import React from 'react';
import {useFrame} from '../frame';
import {eBack, eInOut, eOut, exit, lerp, prog} from '../anim';
import {QMark} from '../components/Aro';
import {Txt} from '../components/Txt';
import {Geom} from '../geom';
import {Layout} from '../layout';
import {BASE_K, GLYPH, measure} from '../text';
import {themeAt} from '../theme';

type Part = {text: string; left: number; y: number};
type Group = {parts: Part[]; origin: {x: number; y: number}; to: {x: number; y: number}; scale: number; hasDot: boolean};

// Geometria del cierre: "¿Estás seguro?" -> "Estás seguro." -> placa final.
export const closingGeom = (L: Layout, G: Geom) => {
  const {S, lines} = G.q;
  const w = (t: string, s = S) => measure(t, s, 500);
  const s2 = L.size.closing;
  const k = s2 / S;
  const finalY = L.aspect === '16x9' ? 780 : 1240;
  if (L.aspect === '16x9') {
    const l = lines[0];
    const left1 = L.cx - w('Estás seguro.') / 2;
    return {
      S,
      inv: {left: l.left, y: l.y},
      body0: [{text: 'Estás seguro', left: l.left + w('¿'), y: l.y}],
      body1: [{text: 'Estás seguro', left: left1, y: l.y}],
      q0: {left: l.left + w('¿Estás seguro'), y: l.y},
      dot1: {left: left1 + w('Estás seguro'), y: l.y},
      groups: [{origin: {x: L.cx, y: l.y}, to: {x: L.cx, y: finalY}, scale: k, parts: 1, hasDot: true}],
    };
  }
  const [l1, l2] = lines;
  const leftF = L.cx - w('Estás seguro.', s2) / 2;
  const g1to = {x: leftF + w('Estás', s2) / 2, y: finalY};
  const g2to = {x: leftF + w('Estás ', s2) + w('seguro.', s2) / 2, y: finalY};
  const l2left1 = L.cx - w('seguro.') / 2;
  return {
    S,
    inv: {left: l1.left, y: l1.y},
    body0: [
      {text: 'Estás', left: l1.left + w('¿'), y: l1.y},
      {text: 'seguro', left: l2.left, y: l2.y},
    ],
    body1: [
      {text: 'Estás', left: L.cx - w('Estás') / 2, y: l1.y},
      {text: 'seguro', left: l2left1, y: l2.y},
    ],
    q0: {left: l2.left + w('seguro'), y: l2.y},
    dot1: {left: l2left1 + w('seguro'), y: l2.y},
    groups: [
      {origin: {x: L.cx, y: l1.y}, to: g1to, scale: k, parts: 1, hasDot: false},
      {origin: {x: L.cx, y: l2.y}, to: g2to, scale: k, parts: 1, hasDot: true},
    ],
  };
};

// Tiempos del cierre. v1: B34-B40 (f792-959). v2 los desplaza (ver src/v2).
export type CierreTiming = {tIn: number; tInv: number; tHook: number; tRecenter: number; tGlyph: number; tPlaca: number; tFade: number; entry: 'lateral' | 'depth'};
export const CIERRE_V1: CierreTiming = {tIn: 792, tInv: 816, tHook: 820, tRecenter: 822, tGlyph: 840, tPlaca: 864, tFade: 936, entry: 'lateral'};

// Acto 5 (B34-B40, f792-959).
export const Cierre: React.FC<{L: Layout; G: Geom; T?: CierreTiming; frame?: number}> = ({L, G, T = CIERRE_V1, frame}) => {
  const hookFrame = useFrame();
  const f = frame ?? hookFrame;
  if (f < T.tIn) return null;
  const {ink} = themeAt(f);
  const C = closingGeom(L, G);
  const S = C.S;

  // B34: vuelve al centro, de blur a nitido, opacidad 30 -> 100 %.
  const pIn = prog(f, T.tIn, 12);
  const lateral = T.entry === 'lateral';
  const inDx = lateral && L.aspect === '16x9' ? 0.35 * L.W * (1 - eOut(pIn)) : 0;
  const inDy = lateral && L.aspect === '9x16' ? 0.3 * L.H * (1 - eOut(pIn)) : 0;
  // v2: llega desde el fondo por el eje del vuelo y frena en el centro.
  const inScale = lateral ? 1 : lerp(0.25, 1, eBack(pIn));
  const inBlur = 14 * (1 - eOut(prog(f, T.tIn, 10)));
  const inOp = lerp(0.3, 1, eOut(prog(f, T.tIn, 10)));

  // B35: se re-centra al quitar el "¿".
  const m = eInOut(prog(f, T.tRecenter, 14));
  // B37: baja y se achica a la placa final.
  const m2 = eInOut(prog(f, T.tPlaca, 14));
  // B40: todo se funde salvo el punto final.
  const fadeAll = 1 - eInOut(prog(f, T.tFade, 12));

  const qDot0 = {x: C.q0.left + (GLYPH.qDot.x / 1000) * S, y: C.q0.y + BASE_K * S - (GLYPH.qDot.y / 1000) * S};
  const pDot1 = {x: C.dot1.left + (GLYPH.periodDot.x / 1000) * S, y: C.dot1.y + BASE_K * S - (GLYPH.periodDot.y / 1000) * S};
  const dot = {x: lerp(qDot0.x, pDot1.x, m), y: lerp(qDot0.y, pDot1.y, m)};

  const groupTransform = (g: (typeof C.groups)[number]) => {
    const sc = lerp(1, g.scale, m2);
    const tx = (g.to.x - g.origin.x) * m2;
    const ty = (g.to.y - g.origin.y) * m2;
    return {sc, tx, ty, style: {transform: `translate(${tx}px, ${ty}px) scale(${sc})`, transformOrigin: `${g.origin.x}px ${g.origin.y}px`}};
  };

  const groups = C.groups.map((g, gi) => {
    const part = C.body0[gi];
    const part1 = C.body1[gi];
    const children: React.ReactNode[] = [
      <Txt key="b" x={lerp(part.left, part1.left, m)} y={part.y} size={S} color={ink} align="left" opacity={fadeAll}>
        {part.text}
      </Txt>,
    ];
    if (g.hasDot && f < T.tFade) {
      if (f < T.tInv + 2) {
        // Glifo "?" y su paso a trazo en 4 f de blur.
        const b = 8 * Math.sin(Math.PI * prog(f, T.tInv, 4));
        children.push(
          <Txt key="q" x={C.q0.left} y={C.q0.y} size={S} color={ink} align="left" blur={b}>
            ?
          </Txt>,
        );
      } else if (f < T.tGlyph + 2) {
        // El gancho se retrae hacia el punto (12 f) mientras el punto viaja a su lugar de "."
        const b = f < T.tInv + 4 ? 8 * Math.sin(Math.PI * prog(f, T.tInv, 4)) : 6 * Math.sin(Math.PI * prog(f, T.tGlyph, 4));
        children.push(<QMark key="q" W={L.W} H={L.H} dotX={dot.x} dotY={dot.y} size={S} color={ink} mode="toDot" p={eInOut(prog(f, T.tHook, 12))} blur={b} />);
      } else {
        // B36: el punto vuelve a ser glifo de fuente.
        const b = 6 * Math.sin(Math.PI * prog(f, T.tGlyph, 4));
        children.push(
          <Txt key="p" x={dot.x - (GLYPH.periodDot.x / 1000) * S} y={dot.y + (GLYPH.periodDot.y / 1000) * S - BASE_K * S} size={S} color={ink} align="left" blur={b}>
            .
          </Txt>,
        );
      }
    }
    const t = groupTransform(g);
    return (
      <div key={`g${gi}`} style={{position: 'absolute', inset: 0, ...t.style}}>
        {children}
      </div>
    );
  });

  // "¿" se disuelve hacia arriba (B35).
  const invX = exit(f, T.tInv, 6, 12);
  const inv =
    f < T.tInv + 6 ? (
      <Txt key="inv" x={C.inv.left} y={C.inv.y} size={S} color={ink} align="left" opacity={invX.opacity} blur={invX.blur} dy={-0.25 * S * invX.e}>
        ¿
      </Txt>
    ) : null;

  // B40: el punto final se centra y se reduce al punto de 4 px de B1 (loop).
  let finalDot: React.ReactNode = null;
  if (f >= T.tFade) {
    const g = C.groups[C.groups.length - 1];
    const t = groupTransform(g);
    const px = g.origin.x + (dot.x - g.origin.x) * t.sc + t.tx;
    const py = g.origin.y + (dot.y - g.origin.y) * t.sc + t.ty;
    const r0 = (GLYPH.periodDot.r / 1000) * S * t.sc;
    const k = eInOut(prog(f, T.tFade, 18));
    const r = lerp(r0, 2, k);
    finalDot = (
      <div
        key="dot"
        style={{position: 'absolute', left: lerp(px, L.cx, k) - r, top: lerp(py, L.cy, k) - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: ink}}
      />
    );
  }

  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${inDx}px, ${inDy}px) scale(${inScale})`, transformOrigin: `${L.cx}px ${L.cy}px`, filter: inBlur > 0.05 ? `blur(${inBlur}px)` : undefined, opacity: inOp}}>
        {inv}
        {groups}
      </div>
      {finalDot}
    </>
  );
};
