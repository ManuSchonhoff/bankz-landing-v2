import React from 'react';
import {eInOut, enter, exit, prog} from '../../anim';
import {FONT} from '../../text';
import {measure} from '../../text';
import {MODELS} from '../../layout';
import {Aspect, themeAt2} from '../t2';
import {HERO_STEPS} from '../world';

// Etiqueta flotante del frente: los caracteres que cambian ruedan como un odometro.
const Odometer: React.FC<{f: number; texts: string[]; steps: number[]; x: number; y: number; size: number; weight: 400 | 500; color: string; align: 'left' | 'center'}> = ({
  f,
  texts,
  steps,
  x,
  y,
  size,
  weight,
  color,
  align,
}) => {
  let i = 0;
  steps.forEach((s, k) => {
    if (f >= s) i = k + 1;
  });
  const cur = texts[i];
  const prev = i > 0 ? texts[i - 1] : cur;
  const t = i > 0 ? eInOut(prog(f, steps[i - 1], 10)) : 1;
  const n = Math.max(cur.length, prev.length);
  const lh = size * 1.1;
  const cells: React.ReactNode[] = [];
  let total = 0;
  for (let j = 0; j < n; j++) {
    const o = prev[j] ?? '';
    const c = cur[j] ?? '';
    const wo = o ? measure(o, size, weight) : 0;
    const wc = c ? measure(c, size, weight) : 0;
    const w = o === c ? wc : wo + (wc - wo) * t;
    total += w;
    const roll = o !== c && t < 1;
    cells.push(
      <span key={j} style={{display: 'inline-block', position: 'relative', width: w, height: lh, overflow: 'hidden', verticalAlign: 'top'}}>
        {roll ? <span style={{position: 'absolute', left: 0, top: -t * lh, lineHeight: `${lh}px`}}>{o}</span> : null}
        <span style={{position: 'absolute', left: 0, top: roll ? (1 - t) * lh : 0, lineHeight: `${lh}px`}}>{c}</span>
      </span>,
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? x - total / 2 : x,
        top: y - lh / 2,
        whiteSpace: 'nowrap',
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        height: lh,
      }}
    >
      {cells}
    </div>
  );
};

// Acto 5 (B25-B29): etiqueta "BKZ n" / medidas del frente que crece.
export const Act5: React.FC<{f: number; a: Aspect}> = ({f, a}) => {
  if (f < 584 || f >= 706) return null;
  const {ink} = themeAt2(f);
  const e = enter(f, 584, 8, 12);
  const x = exit(f, 696, 8, 12);
  const op = e.opacity * x.opacity;
  const blur = Math.max(e.blur, x.blur);
  const pos = a === '16x9' ? {x: 1290, y1: 500, y2: 566, align: 'left' as const} : {x: 540, y1: 1330, y2: 1396, align: 'center' as const};
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      <Odometer f={f} texts={MODELS.map((m) => m.name)} steps={HERO_STEPS} x={pos.x} y={pos.y1} size={56} weight={500} color={ink} align={pos.align} />
      <Odometer f={f} texts={MODELS.map((m) => m.dim)} steps={HERO_STEPS} x={pos.x} y={pos.y2} size={44} weight={400} color={ink} align={pos.align} />
    </div>
  );
};
