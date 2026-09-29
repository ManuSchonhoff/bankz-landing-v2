import React from 'react';
import {useCurrentFrame} from 'remotion';
import {eBack, eInOut, enter, eOut, exit, lerp, prog, pulse} from '../anim';
import {BoxFace, Outline} from '../components/BoxFace';
import {Txt} from '../components/Txt';
import {Geom} from '../geom';
import {CHIPS, fitTitle, Layout, MODELS, SINGLE_PX, singleBlock} from '../layout';
import {themeAt} from '../theme';

const SWITCH = [444, 456, 468, 480]; // BKZ 2, 3, 4, 5

// Acto 3 (B19-B24, f432-575): los chips colapsan en la cara de la BKZ 1 y la cara recorre los cinco tamaños.
export const Tamanos: React.FC<{L: Layout; G: Geom}> = ({L, G}) => {
  const f = useCurrentFrame();
  if (f < 432 || f >= 592) return null;
  const {ink} = themeAt(f);
  const els: React.ReactNode[] = [];

  let mi = 0;
  SWITCH.forEach((s, i) => {
    if (f >= s) mi = i + 1;
  });
  const t = mi === 0 ? 1 : eBack(prog(f, SWITCH[mi - 1], 8));
  const prev = MODELS[Math.max(0, mi - 1)];
  const cur = MODELS[mi];
  const hPx = Math.max(2, lerp(prev.h, cur.h, t) * SINGLE_PX);
  const wPx = Math.max(2, lerp(prev.w, cur.w, t) * SINGLE_PX);
  const blk = singleBlock(L, hPx);
  const single = {x: blk.cx - wPx / 2, y: blk.top, w: wPx, h: hPx};

  const row = G.row;
  const rowFace5 = row.faces.find((r) => r.i === 4)!;
  const m = eInOut(prog(f, 504, 14)); // B22: la cara unica pasa a su lugar en la fila

  // Contenedor: latido en B23 y barrido de salida en B25.
  const ex = exit(f, 576, 10, 10);
  const s = pulse(f, 528, 0.03, 10);
  const cont = {
    dx: L.aspect === '16x9' ? -L.W * ex.e : 0,
    dy: L.aspect === '9x16' ? -0.6 * L.H * ex.e : 0,
  };

  if (f < 440) {
    // B19: los cuatro chips se contraen en un rectangulo de linea: la cara de la BKZ 1.
    const c = eBack(prog(f, 432, 8));
    const txt = exit(f, 432, 4, 10);
    G.chips.forEach((r, i) => {
      const x = lerp(r.x, single.x, c);
      const y = lerp(r.y, single.y, c);
      const w = Math.max(2, lerp(r.w, single.w, c));
      const h = Math.max(2, lerp(r.h, single.h, c));
      els.push(<Outline key={`c${i}`} x={x} y={y} w={w} h={h} color={ink} radius={lerp(6, 2, c)} />);
      els.push(
        <Txt key={`ct${i}`} x={x + w / 2} y={y + h / 2} size={L.size.chip} weight={400} color={ink} opacity={txt.opacity} blur={txt.blur}>
          {CHIPS[i]}
        </Txt>,
      );
    });
  } else {
    const detail = prog(f, 438, 6);
    const face = {
      x: lerp(single.x, rowFace5.x, m),
      y: lerp(single.y, rowFace5.y, m),
      w: lerp(single.w, rowFace5.w, m),
      h: lerp(single.h, rowFace5.h, m),
      px: lerp(SINGLE_PX, row.px, m),
    };
    els.push(<BoxFace key="single" {...face} color={ink} detail={detail} />);
  }

  // Etiquetas de la cara unica (B19-B21): cambian en cada medio beat.
  if (f < 512) {
    const t0 = mi === 0 ? 434 : SWITCH[mi - 1];
    const e = enter(f, t0, 6, 12);
    const out = exit(f, 504, 6, 12);
    const common = {color: ink, opacity: e.opacity * out.opacity, blur: Math.max(e.blur, out.blur), dy: 14 * (1 - e.e)};
    els.push(
      <Txt key={`n${mi}`} x={blk.cx} y={blk.nameY} size={L.size.boxName} {...common}>
        {cur.name}
      </Txt>,
    );
    els.push(
      <Txt key={`d${mi}`} x={blk.cx} y={blk.dimY} size={L.size.boxDim} weight={400} {...common}>
        {cur.dim}
      </Txt>,
    );
  }

  // B22: las cinco caras juntas a escala real entre si, con nombre y medida. Titulo "5 tamaños."
  if (f >= 504) {
    row.faces.forEach((r, k) => {
      if (r.i !== 4) {
        const e = enter(f, 506 + r.i * 2, 8, 12);
        els.push(<BoxFace key={`r${r.i}`} x={r.x} y={r.y} w={r.w} h={r.h} px={row.px} color={ink} opacity={e.opacity} blur={e.blur} scale={1.08 - 0.08 * e.e} />);
      }
      const e = enter(f, 510 + k * 2, 7, 10);
      const cx = r.x + r.w / 2;
      els.push(
        <Txt key={`rn${r.i}`} x={cx} y={r.nameY} size={row.nameS} color={ink} opacity={e.opacity} blur={e.blur} dy={10 * (1 - e.e)}>
          {MODELS[r.i].name}
        </Txt>,
      );
      els.push(
        <Txt key={`rd${r.i}`} x={cx} y={r.dimY} size={row.dimS} weight={400} color={ink} opacity={e.opacity} blur={e.blur} dy={10 * (1 - e.e)}>
          {MODELS[r.i].dim}
        </Txt>,
      );
    });
    const e = enter(f, 506, 7, 14);
    els.push(
      <Txt key="title" x={row.titleX} y={row.titleY} size={fitTitle(L, '5 tamaños.')} color={ink} align={row.titleAlign} opacity={e.opacity} blur={e.blur} scale={1.12 - 0.12 * e.e}>
        5 tamaños.
      </Txt>,
    );
  }

  const originY = L.aspect === '16x9' ? 560 : 880;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 1 - eOut(ex.t),
        filter: ex.blur > 0.05 ? `blur(${ex.blur}px)` : undefined,
        transform: `translate(${cont.dx}px, ${cont.dy}px) scale(${s})`,
        transformOrigin: `${L.cx}px ${originY}px`,
      }}
    >
      {els}
    </div>
  );
};
