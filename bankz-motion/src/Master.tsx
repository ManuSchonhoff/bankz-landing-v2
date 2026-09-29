import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FrameMap, useFrame} from './frame';
import {eInOut, lerp, prog} from './anim';
import {CameraLayer} from './Camera';
import {Brand} from './components/Brand';
import {MotionBlur} from './components/MotionBlur';
import {useFonts} from './fonts';
import {getGeom} from './geom';
import {Aspect, getLayout, Layout} from './layout';
import {Pregunta} from './scenes/01-Pregunta';
import {Respuesta} from './scenes/02-Respuesta';
import {Tamanos} from './scenes/03-Tamanos';
import {Visita} from './scenes/04-Visita';
import {VisitaCorta} from './scenes/04b-VisitaCorta';
import {Cierre} from './scenes/05-Cierre';
import {Sfx} from './Sfx';
import {NEGRO, themeAt} from './theme';
import {Cut, MOTION_BLUR, MOTION_BLUR_12, toLong} from './timing';

export type MasterProps = {aspect: Aspect; cut?: Cut};

// Corte de 12 s: el cierre reutiliza el Acto 5 del corte largo con el tiempo remapeado.
const Remap: React.FC<{children: React.ReactNode}> = ({children}) => <FrameMap.Provider value={toLong}>{children}</FrameMap.Provider>;

// Marca oficial: fuera del motion blur (solo opacidad, posicion y escala uniforme).
const BrandLayer: React.FC<{L: Layout}> = ({L}) => {
  const f = useFrame();
  const th = themeAt(f);
  const els: React.ReactNode[] = [];
  if (f >= 246 && f < 438) {
    // Isotipo: aparece en el lugar del Aro (f246, 3 f) y se ancla en B12.
    const size0 = 2 * (L.aro.r - 24 + L.aro.stroke / 2);
    const m = eInOut(prog(f, 264, 18));
    const op = prog(f, 246, 3) * (f >= 432 ? 1 - prog(f, 432, 6) : 1);
    els.push(
      <Brand key="iso" kind="isotipo" variant={th.brand} cx={lerp(L.cx, L.isoDocked.cx, m)} cy={lerp(L.cy, L.isoDocked.cy, m)} w={lerp(size0, L.isoDocked.size, m)} opacity={op} />,
    );
  }
  if (f >= 864) {
    // Placa final: logotipo solo por opacidad, 6 f. Se funde en B40.
    const op = prog(f, 866, 6) * (1 - eInOut(prog(f, 936, 12)));
    els.push(<Brand key="logo" kind="logo-h" variant={th.brand} cx={L.logo.cx} cy={L.logo.cy} w={L.logo.w} opacity={op} />);
  }
  return <>{els}</>;
};

export const Master: React.FC<MasterProps> = ({aspect, cut = '16'}) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const L = getLayout(aspect);
  if (!ready) return <AbsoluteFill style={{background: NEGRO}} />;
  const G = getGeom(L);
  const th = themeAt(f);
  const blurOn = (cut === '16' ? MOTION_BLUR : MOTION_BLUR_12).some(([a, b]) => f >= a && f <= b);
  const world =
    cut === '16' ? (
      <CameraLayer L={L} G={G}>
        <Pregunta L={L} G={G} />
        <Respuesta L={L} G={G} />
        <Tamanos L={L} G={G} />
        <Visita L={L} G={G} />
        <Cierre L={L} G={G} />
      </CameraLayer>
    ) : (
      <CameraLayer L={L} G={G} cut="12">
        <Pregunta L={L} G={G} />
        <Respuesta L={L} G={G} />
        <VisitaCorta L={L} G={G} />
        {f >= 576 ? (
          <Remap>
            <Cierre L={L} G={G} />
          </Remap>
        ) : null}
      </CameraLayer>
    );
  return (
    <AbsoluteFill style={{background: th.bg, overflow: 'hidden'}}>
      {blurOn ? <MotionBlur samples={10}>{world}</MotionBlur> : world}
      <CameraLayer L={L} G={G} cut={cut}>
        <BrandLayer L={L} />
        {cut === '12' && f >= 576 ? (
          <Remap>
            <BrandLayer L={L} />
          </Remap>
        ) : null}
      </CameraLayer>
      <Sfx cut={cut} />
    </AbsoluteFill>
  );
};
