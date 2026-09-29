import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

// Motion blur de camara (shutter 180 grados, 6 muestras) centrado en el frame actual,
// misma tecnica que CameraMotionBlur de @remotion/motion-blur pero sin adelantar el tiempo:
// asi no hay salto al entrar o salir de una ventana de barrido.
export const MotionBlur: React.FC<{children: React.ReactNode; samples?: number; shutterAngle?: number}> = ({children, samples = 6, shutterAngle = 180}) => {
  const f = useCurrentFrame();
  const shutter = shutterAngle / 360;
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {new Array(samples).fill(0).map((_, i) => {
        const off = shutter * (i / (samples - 1) - 0.5);
        return (
          <AbsoluteFill key={i} style={{mixBlendMode: 'plus-lighter', filter: `opacity(${1 / samples})`}}>
            <Freeze frame={f + off}>{children}</Freeze>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
