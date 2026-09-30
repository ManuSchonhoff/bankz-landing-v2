import React from 'react';
import {enter, smooth} from '../../anim';
import {Txt} from '../../components/Txt';
import {measure} from '../../text';
import {project, SIZE} from '../camera';
import {radarPoint, RR} from '../Scene3D';
import {Aspect, themeAt2} from '../t2';

// El barrido pasa por estos angulos (plano del radar) en B18, B19, B20 y B21.
export const SECURITY = [
  {text: 'Monitoreo 24/7', angle: 90, at: 408},
  {text: 'Acceso biométrico', angle: 180, at: 432},
  {text: 'Doble llave', angle: 270, at: 456},
  {text: 'Seguro por caja', angle: 0, at: 480},
];

// Acto 3 (B17-B21): el punto del centro del radar y las frases que revela el barrido.
export const Act3: React.FC<{f: number; a: Aspect}> = ({f, a}) => {
  if (f < 396 || f >= 520) return null;
  const {ink} = themeAt2(f);
  const [Wd] = SIZE[a];
  const els: React.ReactNode[] = [];
  // El punto (4 px) es el centro del radar; se apaga cuando el dial dibuja su centro.
  const c = project(radarPoint(f, 0, 0), f, a);
  const dotOp = 1 - smooth(f, 506, 516);
  els.push(<div key="dot" style={{position: 'absolute', left: c.x - 2, top: c.y - 2, width: 4, height: 4, borderRadius: '50%', background: ink, opacity: dotOp}} />);
  const S = a === '16x9' ? 48 : 44;
  const margin = a === '16x9' ? 120 : 72;
  const right = a === '16x9' ? Wd - 120 : 936;
  const fade = 1 - smooth(f, 504, 516); // B22: se apagan por distancia
  SECURITY.forEach((s, i) => {
    if (f < s.at) return;
    const e = enter(f, s.at, 7, 12);
    // Anclaje fuera del anillo del radar, del lado del angulo.
    const p = project(radarPoint(f, (s.angle * Math.PI) / 180, RR * 1.55), f, a);
    const w = measure(s.text, S, 400);
    const x = Math.min(Math.max(p.x, margin + w / 2), right - w / 2);
    els.push(
      <Txt key={`s${i}`} x={x} y={p.y} size={S} weight={400} color={ink} opacity={e.opacity * fade} blur={Math.max(e.blur, 10 * (1 - fade))}>
        {s.text}
      </Txt>,
    );
  });
  return <>{els}</>;
};
