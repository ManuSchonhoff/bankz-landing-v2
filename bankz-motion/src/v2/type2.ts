// Tecleo v2: pregunta en B9½-B13 (el "?" cae en f288) y numero de WhatsApp en B30-B32.
import {eBack, eInOut, lerp, prog} from '../anim';
import {blinkOn} from '../components/Txt';
import {getGeom, waCaret} from '../geom';
import {getLayout} from '../layout';
import {measure} from '../text';
import {typedCount} from '../timing';
import {Aspect} from './t2';

export const Q2 = {appear: 204, t0: 210, cps: 10, chars: 14}; // 6 f por caracter: 210 + 13 x 6 = 288
// 12 car/s: arranca apenas el anillo se aplasta en el cursor (f734) y termina en f789; parpadea una vez y se va.
export const WA2 = {appear: 731, t0: 734, cps: 12, end: 789, gone: 813};

export const geomFor2 = (a: Aspect) => {
  const L = getLayout(a);
  return {L, G: getGeom(L)};
};

export const qCount = (f: number) => typedCount(f, Q2.t0, Q2.cps, Q2.chars);

// Cursor de la pregunta: nace del punto central de la puerta (estirado) y viaja al inicio de la linea.
export const qCaret2 = (f: number, a: Aspect) => {
  const {L, G} = geomFor2(a);
  const {S, lines} = G.q;
  const n = qCount(f);
  const scaleY = eBack(prog(f, Q2.appear, 6));
  const visible = f >= Q2.appear && f < 288;
  if (n === 0) {
    const t = eInOut(prog(f, Q2.appear + 2, 6));
    return {x: lerp(L.cx, lines[0].left, t), y: lerp(L.cy, lines[0].y, t), n, S, scaleY, visible};
  }
  let line = lines[0];
  for (const l of lines) if (l.start <= n && l.start > 0) line = l;
  const count = n - line.start;
  const x = line.left + (count > 0 ? measure(line.text.slice(0, count), S, 500) + 0.04 * S : 0);
  return {x, y: line.y, n, S, scaleY, visible};
};

export const waCaret2 = (f: number, a: Aspect) => waCaret(f, geomFor2(a).G, WA2);

// x del caret para la camara (null fuera de los tramos de tecleo).
export const caretXFor = (a: Aspect) => (f: number) => {
  if (f >= 200 && f < 300) return qCaret2(f, a).x;
  if (f >= 726 && f < 816) return waCaret2(f, a).x;
  return null;
};

export {blinkOn};
