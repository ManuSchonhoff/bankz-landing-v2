import {blinkOn} from './components/Txt';
import {eBack, eInOut, lerp, prog} from './anim';
import {act2Geom, act4Geom, chipRects, getLayout, Layout, questionGeom, rowGeom, WA_NUMBER, WA_PREFIX, Aspect} from './layout';
import {fit, measure} from './text';
import {Q_CHARS, Q_CPS, Q_T0, typedCount, WA16, WA_CHARS} from './timing';

const build = (L: Layout) => {
  const S = fit(WA_PREFIX + WA_NUMBER, L.size.contact, 400, L.maxLine);
  const left = L.cx - measure(WA_PREFIX + WA_NUMBER, S, 400) / 2;
  const a4 = act4Geom(L);
  return {
    q: questionGeom(L),
    chips: chipRects(L),
    a2: act2Geom(L),
    row: rowGeom(L),
    a4,
    wa: {S, left, numLeft: left + measure(WA_PREFIX, S, 400), y: a4.waY},
  };
};

export type Geom = ReturnType<typeof build>;

const cache = new Map<Aspect, Geom>();
export const getGeom = (L: Layout) => {
  let g = cache.get(L.aspect);
  if (!g) {
    g = build(L);
    cache.set(L.aspect, g);
  }
  return g;
};

export const geomFor = (a: Aspect) => getGeom(getLayout(a));

// Cursor del Acto 1 (pregunta).
export const questionCaret = (f: number, L: Layout, G: Geom) => {
  const {S, lines} = G.q;
  const n = typedCount(f, Q_T0, Q_CPS, Q_CHARS);
  const scaleY = eBack(prog(f, 94, 8));
  const visible = f >= 94 && f < 216 && (n < Q_CHARS || blinkOn(f, 192));
  if (n === 0) {
    const t = eInOut(prog(f, 96, 9));
    return {x: lerp(L.cx, lines[0].left, t), y: lerp(L.cy, lines[0].y, t), n, S, scaleY, visible};
  }
  let line = lines[0];
  for (const l of lines) if (l.start <= n && l.start > 0) line = l;
  const count = n - line.start;
  const x = line.left + (count > 0 ? measure(line.text.slice(0, count), S, 500) + 0.04 * S : 0);
  return {x, y: line.y, n, S, scaleY, visible};
};

// Cursor del numero de WhatsApp (Acto 4 del corte largo, B19-B21 del corte de 12 s).
export const waCaret = (f: number, G: Geom, t: typeof WA16 = WA16) => {
  const {S, numLeft, y} = G.wa;
  const n = typedCount(f, t.t0, t.cps, WA_CHARS);
  const x = numLeft + (n > 0 ? measure(WA_NUMBER.slice(0, n), S, 400) + 0.04 * S : 0);
  // Solido mientras teclea; al terminar parpadea una vez y desaparece.
  const visible = f >= t.appear && f < t.gone && (f < t.end || blinkOn(f, t.end));
  return {x, y, n, S, visible};
};
