import React from 'react';
import {useFrame} from '../frame';
import {enter, eOut, exit, pulse} from '../anim';
import {Outline} from '../components/BoxFace';
import {Caret, Txt} from '../components/Txt';
import {Geom, waCaret} from '../geom';
import {CHIPS, Layout, WA_NUMBER, WA_PREFIX} from '../layout';
import {fit} from '../text';
import {themeAt} from '../theme';
import {WA12} from '../timing';

// Corte de 12 s, B19-B24 (f432-575): inversion a negro + "Agendá tu visita.",
// tecleo de "WhatsApp 291 448-5665", "bankz.ar", "@bankzarg" y latido.
export const VisitaCorta: React.FC<{L: Layout; G: Geom}> = ({L, G}) => {
  const f = useFrame();
  if (f < 432 || f >= 592) return null;
  const {ink} = themeAt(f);
  const a4 = G.a4;
  const els: React.ReactNode[] = [];

  // Los chips del Acto 2 salen de borroso en la inversion.
  if (f < 440) {
    const x = exit(f, 432, 6, 14);
    G.chips.forEach((r, i) => {
      els.push(
        <div key={`chip${i}`} style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: x.opacity, filter: `blur(${x.blur}px)`, transform: `translateY(${20 * x.e}px)`}}>
          <Outline x={0} y={0} w={r.w} h={r.h} color={ink} radius={6} />
          <Txt x={r.w / 2} y={r.h / 2} size={L.size.chip} weight={400} color={ink}>
            {CHIPS[i]}
          </Txt>
        </div>,
      );
    });
  }

  // B19: se clava el CTA.
  const Scta = Math.min(...a4.ctaLines.map((l) => fit(l.text, L.size.cta, 500, L.maxLine)));
  a4.ctaLines.forEach((l, i) => {
    const t0 = 432 + i * 3;
    if (f < t0) return;
    const e = enter(f, t0, 7, 14);
    els.push(
      <Txt key={`cta${i}`} x={L.cx} y={l.y} size={Scta} color={ink} opacity={e.opacity} blur={e.blur} scale={1.12 - 0.12 * e.e}>
        {l.text}
      </Txt>,
    );
  });

  // B19½: prefijo y cursor. B20-B21: tecleo del numero.
  if (f >= WA12.appear) {
    const wa = G.wa;
    const e = enter(f, WA12.appear, 6, 12);
    els.push(
      <Txt key="waP" x={wa.left} y={wa.y} size={wa.S} weight={400} color={ink} align="left" opacity={e.opacity * 0.6} blur={e.blur}>
        {WA_PREFIX.trimEnd()}
      </Txt>,
    );
    const c = waCaret(f, G, WA12);
    els.push(
      <Txt key="waN" x={wa.numLeft} y={wa.y} size={wa.S} weight={400} color={ink} align="left">
        {WA_NUMBER.slice(0, c.n)}
      </Txt>,
    );
    if (c.visible) els.push(<Caret key="caret" x={c.x} y={c.y} size={wa.S} color={ink} opacity={e.opacity} />);
  }

  // B22 y B23: web e Instagram.
  (
    [
      ['bankz.ar', 504, a4.webY],
      ['@bankzarg', 528, a4.igY],
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

  // B24: el bloque late. B25: todo sale barrido (lateral en 16:9, vertical en 9:16).
  const s = pulse(f, 552, 0.03, 10);
  const ex = exit(f, 576, 10, 10);
  const dx = L.aspect === '16x9' ? -L.W * ex.e : 0;
  const dy = L.aspect === '9x16' ? -0.6 * L.H * ex.e : 0;
  const originY = (a4.ctaLines[0].y + a4.igY) / 2;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 1 - eOut(ex.t),
        filter: ex.blur > 0.05 ? `blur(${ex.blur}px)` : undefined,
        transform: `translate(${dx}px, ${dy}px) scale(${s})`,
        transformOrigin: `${L.cx}px ${originY}px`,
      }}
    >
      {els}
    </div>
  );
};
