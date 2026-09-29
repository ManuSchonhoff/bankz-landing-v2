import React from 'react';
import {useFrame} from '../frame';
import {interpolate} from 'remotion';
import {eInOut, enter, eOut, exit, lerp, prog, pulse} from '../anim';
import {Caret, Txt} from '../components/Txt';
import {Geom, waCaret} from '../geom';
import {Layout, WA_NUMBER, WA_PREFIX} from '../layout';
import {fit} from '../text';
import {themeAt} from '../theme';

export const WHEEL = ['24 hs', 'semana', 'mes', 'semestre', 'año'];

// Posicion de la rueda (en items): gira rapido y desacelera hasta clavar "año" (indice 4) en f600.
export const wheelPos = (f: number) => 4 - 7 * (1 - eOut(prog(f, 576, 24)));

// Acto 4 (B25-B33, f576-791): rueda de plazos, "Plan anual.", CTA, WhatsApp, web e Instagram.
export const Visita: React.FC<{L: Layout; G: Geom}> = ({L, G}) => {
  const f = useFrame();
  if (f < 576 || f >= 808) return null;
  const {ink} = themeAt(f);
  const a4 = G.a4;
  const Sw = fit('semestre', L.size.wheel, 500, L.maxLine);
  const els: React.ReactNode[] = [];

  // Rueda de seleccion (B25).
  if (f < 612) {
    const p = wheelPos(f);
    const sp = 1.3 * Sw;
    const inOp = prog(f, 576, 6);
    const neighborsOut = 1 - prog(f, 600, 8);
    for (let i = Math.floor(p) - 3; i <= Math.ceil(p) + 3; i++) {
      const d = Math.abs(i - p);
      if (d > 3) continue;
      let op = interpolate(d, [0, 1, 2, 3], [1, 0.3, 0.12, 0]);
      const sc = interpolate(d, [0, 1, 2], [1, 0.8, 0.7], {extrapolateRight: 'clamp'});
      let blur = 0;
      if (i === 4 && f >= 600) {
        const x = exit(f, 600, 5, 10);
        op *= x.opacity;
        blur = x.blur;
      } else if (f >= 600) op *= neighborsOut;
      els.push(
        <Txt key={`w${i}`} x={L.cx} y={a4.wheelY + (i - p) * sp} size={Sw} color={ink} opacity={op * inOp} scale={sc} blur={blur}>
          {WHEEL[((i % 5) + 5) % 5]}
        </Txt>,
      );
    }
  }

  // B26: "año" se resuelve en "Plan anual.". B27: sube y baja al 30 %.
  if (f >= 601) {
    const e = enter(f, 601, 8, 12);
    const m = eInOut(prog(f, 624, 10));
    els.push(
      <Txt key="plan" x={L.cx} y={lerp(a4.wheelY, a4.planY, m)} size={Sw} color={ink} opacity={e.opacity * lerp(1, 0.3, m)} blur={e.blur} scale={(1.1 - 0.1 * e.e) * lerp(1, 0.5, m)}>
        Plan anual.
      </Txt>,
    );
  }

  // B27: CTA.
  const Scta = Math.min(...a4.ctaLines.map((l) => fit(l.text, L.size.cta, 500, L.maxLine)));
  a4.ctaLines.forEach((l, i) => {
    const e = enter(f, 624 + i * 3, 7, 14);
    if (f < 624 + i * 3) return;
    els.push(
      <Txt key={`cta${i}`} x={L.cx} y={l.y} size={Scta} color={ink} opacity={e.opacity} blur={e.blur} scale={1.12 - 0.12 * e.e}>
        {l.text}
      </Txt>,
    );
  });

  // B28-B30: vuelve el cursor y se teclea el numero.
  if (f >= 648) {
    const wa = G.wa;
    const e = enter(f, 648, 6, 12);
    els.push(
      <Txt key="waP" x={wa.left} y={wa.y} size={wa.S} weight={400} color={ink} align="left" opacity={e.opacity * 0.6} blur={e.blur}>
        {WA_PREFIX.trimEnd()}
      </Txt>,
    );
    const c = waCaret(f, G);
    els.push(
      <Txt key="waN" x={wa.numLeft} y={wa.y} size={wa.S} weight={400} color={ink} align="left">
        {WA_NUMBER.slice(0, c.n)}
      </Txt>,
    );
    if (c.visible) els.push(<Caret key="caret" x={c.x} y={c.y} size={wa.S} color={ink} opacity={e.opacity} />);
  }

  // B31, B32: web e Instagram.
  (
    [
      ['bankz.ar', 720, a4.webY],
      ['@bankzarg', 744, a4.igY],
    ] as [string, number, number][]
  ).forEach(([text, t0, y]) => {
    if (f < t0) return;
    const e = enter(f, t0, 7, 14);
    els.push(
      <Txt key={text} x={L.cx} y={y} size={G.wa.S} weight={400} color={ink} opacity={e.opacity} blur={e.blur} dy={18 * (1 - e.e)}>
        {text}
      </Txt>,
    );
  });

  // B33: el bloque late. B34: todo sale barrido.
  const s = pulse(f, 768, 0.03, 10);
  const ex = exit(f, 792, 10, 10);
  const dx = L.aspect === '16x9' ? -L.W * ex.e : 0;
  const dy = L.aspect === '9x16' ? -0.6 * L.H * ex.e : 0;
  const originY = (a4.planY + a4.igY) / 2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - eOut(ex.t), filter: ex.blur > 0.05 ? `blur(${ex.blur}px)` : undefined, transform: `translate(${dx}px, ${dy}px) scale(${s})`, transformOrigin: `${L.cx}px ${originY}px`}}>
      {els}
    </div>
  );
};
