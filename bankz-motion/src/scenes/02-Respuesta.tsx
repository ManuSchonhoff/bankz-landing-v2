import React from 'react';
import {useCurrentFrame} from 'remotion';
import {eBack, eBackSoft, enter, eOut, exit, prog, pulse} from '../anim';
import {Aro} from '../components/Aro';
import {Outline} from '../components/BoxFace';
import {Txt} from '../components/Txt';
import {Geom} from '../geom';
import {CHIPS, Layout} from '../layout';
import {themeAt} from '../theme';

// Barrido de entrada: lateral en 16:9, vertical en 9:16.
const sweepIn = (f: number, start: number, L: Layout, dir: 1 | -1, dist: number) => {
  const p = prog(f, start, 12);
  const e = f < start ? 0 : eBackSoft(p);
  const off = dir * dist * (1 - e);
  return {
    dx: L.aspect === '16x9' ? off * L.W : 0,
    dy: L.aspect === '9x16' ? Math.abs(off) * L.H : 0,
    blur: 10 * (1 - eOut(p)),
    opacity: f < start ? 0 : Math.min(1, p * 3),
  };
};

// Acto 2 (B11-B18, f240-431): el Aro cierra la boveda, titulo, subtitulo y chips.
export const Respuesta: React.FC<{L: Layout; G: Geom}> = ({L, G}) => {
  const f = useCurrentFrame();
  if (f < 240 || f >= 440) return null;
  const {ink} = themeAt(f);
  const a2 = G.a2;
  const els: React.ReactNode[] = [];

  // B11: los 12 segmentos entran 24 px hacia el centro con overshoot (8 f) y en f246
  // se cruzan en 3 f al isotipo oficial (capa de marca, ver Master).
  if (f < 249) {
    const r = L.aro.r - 24 * eBack(prog(f, 240, 8));
    const op = 1 - prog(f, 246, 3);
    els.push(<Aro key="aro" W={L.W} H={L.H} cx={L.cx} cy={L.cy} r={r} stroke={L.aro.stroke} dotR={14} color={ink} opacity={op} />);
  }

  // Salida general en la inversion a negro (f432): blur y opacidad.
  const out = f >= 432 ? exit(f, 432, 6, 14) : null;
  const outOp = out ? out.opacity : 1;
  const outBlur = out ? out.blur : 0;
  const outDy = out ? -20 * out.e : 0;

  // Titulo A: "Cajas de seguridad" (B12) + "privadas." (B13). Sale en B15.
  if (f >= 264 && f < 350) {
    const ex = exit(f, 336, 10, 10);
    const exDx = L.aspect === '16x9' ? -0.7 * L.W * ex.e : 0;
    const exDy = L.aspect === '9x16' ? -0.5 * L.H * ex.e : 0;
    const lastIdx = a2.titleA.lines.length - 1;
    a2.titleA.lines.forEach((l, i) => {
      let fx: {dx: number; dy: number; blur: number; opacity: number; scale: number};
      if (i < lastIdx) {
        const s = sweepIn(f, 264 + i * 2, L, -1, 0.55);
        fx = {...s, scale: 1};
      } else {
        // "privadas." se clava: blur -> nitido con overshoot.
        const e = enter(f, 288, 7, 14);
        fx = {dx: 0, dy: 0, blur: e.blur, opacity: e.opacity, scale: 1 + 0.15 * (1 - e.e)};
      }
      els.push(
        <Txt key={`ta${i}`} x={a2.x} y={l.y} size={a2.titleA.S} color={ink} align={a2.align} dx={fx.dx + exDx} dy={fx.dy + exDy} blur={Math.max(fx.blur, ex.blur)} opacity={fx.opacity * ex.opacity} scale={fx.scale}>
          {l.text}
        </Txt>,
      );
    });
  }

  // Titulo B: "Bóveda de estándar bancario certificada." entra en B15 desde el otro lado.
  if (f >= 338) {
    a2.titleB.lines.forEach((l, i) => {
      const s = sweepIn(f, 338 + i * 2, L, 1, 0.7);
      els.push(
        <Txt key={`tb${i}`} x={a2.x} y={l.y} size={a2.titleB.S} color={ink} align={a2.align} dx={s.dx} dy={s.dy + outDy} blur={Math.max(s.blur, outBlur)} opacity={s.opacity * outOp}>
          {l.text}
        </Txt>,
      );
    });
  }

  // Subtitulo (B14), queda hasta el final del acto.
  if (f >= 312) {
    const e = enter(f, 312, 8, 14);
    els.push(
      <Txt key="sub" x={a2.x} y={a2.sub.y} size={a2.sub.S} weight={400} color={ink} align={a2.align} dy={16 * (1 - e.e) + outDy} blur={Math.max(e.blur, outBlur)} opacity={e.opacity * outOp}>
        San Martín 133, Bahía Blanca.
      </Txt>,
    );
  }

  // Chips B16, B16½, B17, B17½. Laten en B18. En f432 colapsan en la BKZ 1 (Acto 3).
  if (f < 432) {
    G.chips.forEach((r, i) => {
      const t0 = 360 + i * 12;
      if (f < t0) return;
      const e = enter(f, t0, 7, 14);
      const dx = L.aspect === '16x9' ? 160 * (1 - e.e) : 0;
      const dy = L.aspect === '9x16' ? 140 * (1 - e.e) : 0;
      const s = pulse(f, 408 + i * 1.5, 0.05, 8);
      els.push(
        <div
          key={`chip${i}`}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            opacity: e.opacity,
            filter: e.blur > 0.05 ? `blur(${e.blur}px)` : undefined,
            transform: `translate(${dx}px, ${dy}px) scale(${s})`,
          }}
        >
          <Outline x={0} y={0} w={r.w} h={r.h} color={ink} radius={6} />
          <Txt x={r.w / 2} y={r.h / 2} size={L.size.chip} weight={400} color={ink}>
            {CHIPS[i]}
          </Txt>
        </div>,
      );
    });
  }
  return <>{els}</>;
};
