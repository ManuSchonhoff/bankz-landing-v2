import React from 'react';
import * as THREE from 'three';
import {eBack, eIn, eInOut, enter, lerp, prog} from '../../anim';
import {Caret, Txt} from '../../components/Txt';
import {WA_NUMBER, WA_PREFIX} from '../../layout';
import {fit} from '../../text';
import {CENTER, project} from '../camera';
import {Aspect, themeAt2} from '../t2';
import {geomFor2, WA2, waCaret2} from '../type2';
import {HERO, W} from '../world';

// Cerradura derecha del BKZ 5 protagonista (de ahi sale el anillo de B30).
const LOCK = new THREE.Vector3(W.wallX, W.frontsY0 + 0.55 * 0.51, HERO.z + 0.2 * 0.27);

// Acto 6 (B30-B34) y el vuelo que lo deja atras en B35.
export const Act6: React.FC<{f: number; a: Aspect; Wd: number; Hd: number}> = ({f, a, Wd, Hd}) => {
  if (f < 720 || f >= 856) return null;
  const {ink} = themeAt2(f);
  const {L, G} = geomFor2(a);
  const a4 = G.a4;
  const wa = G.wa;
  const els: React.ReactNode[] = [];

  // B30: de la cerradura sale un anillo que crece hasta la camara y se aplasta en el cursor.
  if (f < WA2.appear) {
    const lock = project(LOCK, 720, a);
    const g = eIn(prog(f, 720, 6));
    const flat = eInOut(prog(f, 726, 5));
    const target = {x: wa.numLeft + 0.03 * wa.S, y: wa.y};
    const cx = lerp(lock.x, target.x, eInOut(prog(f, 720, 10)));
    const cy = lerp(lock.y, target.y, eInOut(prog(f, 720, 10)));
    const big = Math.max(Wd, Hd) * 0.6;
    const r = lerp(4, big, g);
    const rx = lerp(r, 0.03 * wa.S, flat);
    const ry = lerp(r, wa.S / 2, flat);
    els.push(
      <svg key="ring" width={Wd} height={Hd} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <ellipse cx={cx} cy={cy} rx={Math.max(rx, 0.5)} ry={Math.max(ry, 0.5)} fill={ink} fillOpacity={flat > 0.92 ? 1 : 0} stroke={ink} strokeWidth={2} />
      </svg>,
    );
  }

  // "Agendá tu visita." se resuelve arriba del cursor.
  const Scta = Math.min(...a4.ctaLines.map((l) => fit(l.text, L.size.cta, 500, L.maxLine)));
  a4.ctaLines.forEach((l, i) => {
    const t0 = 726 + i * 3;
    if (f < t0) return;
    const e = enter(f, t0, 8, 14);
    els.push(
      <Txt key={`cta${i}`} x={L.cx} y={l.y} size={Scta} color={ink} opacity={e.opacity} blur={e.blur} scale={1.08 - 0.08 * e.e}>
        {l.text}
      </Txt>,
    );
  });

  // B31-B32: tecleo del numero con el prefijo "WhatsApp".
  if (f >= WA2.appear) {
    const e = enter(f, WA2.appear, 6, 12);
    els.push(
      <Txt key="waP" x={wa.left} y={wa.y} size={wa.S} weight={400} color={ink} align="left" opacity={e.opacity * 0.6} blur={e.blur}>
        {WA_PREFIX.trimEnd()}
      </Txt>,
    );
    const c = waCaret2(f, a);
    els.push(
      <Txt key="waN" x={wa.numLeft} y={wa.y} size={wa.S} weight={400} color={ink} align="left">
        {WA_NUMBER.slice(0, c.n)}
      </Txt>,
    );
    if (c.visible) els.push(<Caret key="caret" x={c.x} y={c.y} size={wa.S} color={ink} />);
  }

  // B33 y B34: llegan desde la profundidad por el eje del vuelo y frenan debajo.
  (
    [
      ['bankz.ar', 792, a4.webY],
      ['@bankzarg', 816, a4.igY],
    ] as [string, number, number][]
  ).forEach(([text, t0, y]) => {
    if (f < t0) return;
    const t = prog(f, t0, 10);
    const s = lerp(0.2, 1, eBack(t));
    els.push(
      <Txt key={text} x={L.cx} y={y} size={wa.S} weight={400} color={ink} opacity={Math.min(1, t * 3)} blur={16 * (1 - Math.min(1, t * 1.4))} scale={s}>
        {text}
      </Txt>,
    );
  });

  // B35: la camara vuela de nuevo y el bloque pasa por los costados.
  const fly = eIn(prog(f, 840, 14));
  const [ccx, ccy] = CENTER[a];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${lerp(1, 3.4, fly)})`,
        transformOrigin: `${ccx}px ${ccy}px`,
        opacity: 1 - fly,
        filter: fly > 0.01 ? `blur(${(18 * fly).toFixed(2)}px)` : undefined,
      }}
    >
      {els}
    </div>
  );
};
