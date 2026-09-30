import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {eInOut, prog} from '../anim';
import {Brand} from '../components/Brand';
import {useFonts} from '../fonts';
import {Cierre, CierreTiming} from '../scenes/05-Cierre';
import {NEGRO} from '../theme';
import {cam2At, cam2Css, SIZE} from './camera';
import {Act2} from './overlay/Act2';
import {Act3} from './overlay/Act3';
import {Act5} from './overlay/Act5';
import {Act6} from './overlay/Act6';
import {Scene3D} from './Scene3D';
import {Sfx2} from './Sfx2';
import {Aspect, themeAt2} from './t2';
import {caretXFor, geomFor2} from './type2';

export type Master2Props = {aspect: Aspect};

// Acto 7: el cierre de la v1 con los tiempos del guion v2 (B35-B40).
const CIERRE_V2: CierreTiming = {tIn: 840, tInv: 864, tHook: 868, tRecenter: 870, tGlyph: 880, tPlaca: 888, tFade: 936, entry: 'depth'};

// Capa HTML en coordenadas de escena, con la misma camara 2D que el 3D.
const Overlay: React.FC<{aspect: Aspect}> = ({aspect}) => {
  const f = useCurrentFrame();
  const [w, h] = SIZE[aspect];
  const {ink, brand} = themeAt2(f);
  const {L, G} = geomFor2(aspect);
  const cam = cam2At(f, aspect, caretXFor(aspect));
  const els: React.ReactNode[] = [];
  // B1: punto de 4 px que late (1 -> 1,6 -> 1 en 6 f). En B2 se abre en el primer anillo.
  if (f < 30) {
    const s = (1 + 0.6 * Math.sin(Math.PI * prog(f, 0, 6))) * (1 - prog(f, 24, 5));
    const d = 4 * s;
    if (d > 0.05) els.push(<div key="dot" style={{position: 'absolute', left: L.cx - d / 2, top: L.cy - d / 2, width: d, height: d, borderRadius: '50%', background: ink}} />);
  }
  els.push(<Act2 key="a2" f={f} a={aspect} W={w} H={h} />);
  els.push(<Act3 key="a3" f={f} a={aspect} />);
  els.push(<Act5 key="a5" f={f} a={aspect} />);
  els.push(<Act6 key="a6" f={f} a={aspect} Wd={w} Hd={h} />);
  els.push(<Cierre key="a7" L={L} G={G} T={CIERRE_V2} frame={f} />);
  // B37: logotipo oficial por opacidad, 6 f. Se apaga en B40.
  if (f >= 888) {
    const op = prog(f, 890, 6) * (1 - eInOut(prog(f, 936, 12)));
    els.push(<Brand key="logo" kind="logo-h" variant={brand} cx={L.logo.cx} cy={L.logo.cy} w={L.logo.w} opacity={op} />);
  }
  return <AbsoluteFill style={cam2Css(cam, aspect)}>{els}</AbsoluteFill>;
};

export const Master2: React.FC<Master2Props> = ({aspect}) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const [w, h] = SIZE[aspect];
  if (!ready) return <AbsoluteFill style={{background: NEGRO}} />;
  return (
    <AbsoluteFill style={{background: themeAt2(f).bg, overflow: 'hidden'}}>
      <Scene3D aspect={aspect} width={w} height={h} />
      <Overlay aspect={aspect} />
      <Sfx2 />
    </AbsoluteFill>
  );
};
