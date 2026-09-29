import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {blurCss, eBack, eIn, eInOut, eOut, lerp, prog} from '../anim';
import {Aro, QMark} from '../components/Aro';
import {Caret, Txt} from '../components/Txt';
import {Geom, questionCaret} from '../geom';
import {Layout} from '../layout';
import {BASE_K, GLYPH, measure} from '../text';
import {themeAt} from '../theme';

const PITCH = 48;

// Acto 1 (B1-B10, f0-239): punto -> linea -> grilla -> cursor -> "¿Estás seguro?" -> Aro.
export const Pregunta: React.FC<{L: Layout; G: Geom}> = ({L, G}) => {
  const f = useCurrentFrame();
  if (f >= 240) return null;
  const th = themeAt(f);
  const vertical = L.aspect === '9x16';
  return (
    <>
      {f < 48 ? <DotLine f={f} L={L} vertical={vertical} ink={th.ink} /> : null}
      {f >= 48 && f < 101 ? <Grid f={f} L={L} vertical={vertical} ink={th.ink} /> : null}
      {f >= 94 ? <Question f={f} L={L} G={G} ink={th.ink} /> : null}
    </>
  );
};

const DotLine: React.FC<{f: number; L: Layout; vertical: boolean; ink: string}> = ({f, L, vertical, ink}) => {
  let len = 4;
  let thick = 4;
  let op = 1;
  let blur = 0;
  if (f < 24) {
    // B1: el punto late en el beat, 1 -> 1,6 -> 1 en 6 f.
    const s = 1 + 0.6 * Math.sin(Math.PI * prog(f, 0, 6));
    len = 4 * s;
    thick = 4 * s;
  } else {
    // B2: se estira en una linea de 1 px al 60 %, de borroso a nitido.
    const p = prog(f, 24, 8);
    len = 4 + (L.lineLen - 4) * eBack(p);
    thick = 4 + (1 - 4) * eOut(p);
    op = 1 - 0.4 * eOut(p);
    blur = 12 * (1 - eOut(p)) * Math.min(1, p * 4);
  }
  const w = vertical ? thick : len;
  const h = vertical ? len : thick;
  return (
    <div
      style={{
        position: 'absolute',
        left: L.cx - w / 2,
        top: L.cy - h / 2,
        width: w,
        height: h,
        borderRadius: thick / 2,
        background: ink,
        opacity: op,
        filter: blurCss(blur),
      }}
    />
  );
};

const Grid: React.FC<{f: number; L: Layout; vertical: boolean; ink: string}> = ({f, L, vertical, ink}) => {
  // Lineas "primarias": paralelas a la linea de B2. "Secundarias": perpendiculares.
  const halfAlong = (vertical ? L.H : L.W) * 0.56;
  const halfAcross = (vertical ? L.W : L.H) * 0.56;
  const K = Math.floor(halfAcross / PITCH);
  const J = Math.floor(halfAlong / PITCH);
  const spread = eBack(prog(f, 48, 10));
  const grow = eOut(prog(f, 48, 12));
  const collapse = eIn(prog(f, 78, 20)); // B4: la grilla colapsa hacia el centro
  const beatPulse = 1 + 1.5 * Math.sin(Math.PI * prog(f, 72, 8)); // late en B4 (12 % -> 30 %)
  const fade = 1 - prog(f, 92, 8);
  const groupBlur = 8 * (1 - eOut(prog(f, 48, 8)));
  const k1 = 1 - collapse;
  const els: React.ReactNode[] = [];
  // Linea de 1 px: `off` es el desplazamiento perpendicular a su direccion.
  const line = (key: string, horizontal: boolean, off: number, len: number, op: number) => {
    const w = horizontal ? len : 1;
    const h = horizontal ? 1 : len;
    const x = L.cx + (horizontal ? 0 : off);
    const y = L.cy + (horizontal ? off : 0);
    els.push(
      <div key={key} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, background: ink, opacity: Math.min(0.3, op)}} />,
    );
  };
  // Primarias: paralelas a la linea de B2, se multiplican desde ella.
  for (let k = -K; k <= K; k++) {
    const base = k === 0 ? interpolate(f, [48, 58], [0.6, 0.12], {extrapolateRight: 'clamp'}) : 0.12 * prog(f, 48 + Math.abs(k) * 0.4, 6);
    const len = lerp(L.lineLen, 2 * halfAlong, grow) * k1;
    line(`p${k}`, !vertical, PITCH * k * spread * k1, len, base * beatPulse * fade);
  }
  // Secundarias: perpendiculares, crecen desde la linea central.
  for (let j = -J; j <= J; j++) {
    const g = eOut(prog(f, 52 + Math.abs(j) * 0.3, 10));
    const len = 2 * halfAcross * g * k1;
    if (len < 0.5) continue;
    line(`s${j}`, vertical, PITCH * j * k1, len, 0.12 * g * beatPulse * fade);
  }
  return <div style={{position: 'absolute', inset: 0, filter: blurCss(groupBlur)}}>{els}</div>;
};

const Question: React.FC<{f: number; L: Layout; G: Geom; ink: string}> = ({f, L, G, ink}) => {
  const {S, lines} = G.q;
  const c = questionCaret(f, L, G);
  const dim = f < 216 ? 1 : interpolate(f, [216, 222], [1, 0.3], {extrapolateRight: 'clamp'});
  const last = lines[lines.length - 1];
  const qIndex = 13;
  const els: React.ReactNode[] = [];
  lines.forEach((l, i) => {
    const count = Math.max(0, Math.min(l.text.length, c.n - l.start));
    // La ultima linea termina en "?", que se dibuja aparte.
    const shown = l.text.slice(0, i === lines.length - 1 ? Math.min(count, l.text.length - 1) : count);
    els.push(
      <Txt key={`l${i}`} x={l.left} y={l.y} size={S} color={ink} align="left" opacity={dim}>
        {shown}
      </Txt>,
    );
  });
  // El "?" es un elemento propio desde que se teclea (f192).
  if (c.n > qIndex) {
    const qLeft = last.left + measure(last.text.slice(0, -1), S, 500);
    const baseN = last.y + BASE_K * S;
    const dotN = {x: qLeft + (GLYPH.qDot.x / 1000) * S, y: baseN - (GLYPH.qDot.y / 1000) * S};
    const m = eOut(prog(f, 216, 10));
    const Se = S * lerp(1, 1.6, m);
    const dx = lerp(dotN.x, L.cx, m);
    const dy = lerp(dotN.y, L.cy, m);
    const blur = f < 216 ? 0 : 12 * (1 - prog(f, 216, 6));
    if (f < 218) {
      // Glifo de fuente, ubicado para que su punto siga la interpolacion.
      els.push(
        <Txt key="q" x={dx - (GLYPH.qDot.x / 1000) * Se} y={dy + (GLYPH.qDot.y / 1000) * Se - BASE_K * Se} size={Se} color={ink} align="left" blur={blur}>
          ?
        </Txt>,
      );
    } else {
      // Trazo SVG: el gancho se retrae y en el mismo movimiento se dibuja el Aro (f227-239).
      const p = eInOut(prog(f, 227, 12));
      const dotR = lerp((GLYPH.qDot.r / 1000) * Se, 14, p);
      els.push(<QMark key="q" W={L.W} H={L.H} dotX={dx} dotY={dy} size={Se} color={ink} mode="toTip" p={p} dotR={dotR} blur={blur} />);
      if (p > 0) {
        els.push(<Aro key="aro" W={L.W} H={L.H} cx={dx} cy={dy} r={L.aro.r} stroke={L.aro.stroke} dotR={dotR} color={ink} drawn={p} blur={blur} />);
      }
    }
  }
  if (c.visible) els.push(<Caret key="caret" x={c.x} y={c.y} size={S} color={ink} scaleY={c.scaleY} />);
  return <>{els}</>;
};
