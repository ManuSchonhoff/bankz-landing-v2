import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';

// Remapeo de tiempo (corte de 12 s): las escenas leen el frame con useFrame().
// Freeze de Remotion no sirve aca porque no acepta frames fuera de la duracion.
export const FrameMap = createContext<((f: number) => number) | null>(null);

export const useFrame = () => {
  const f = useCurrentFrame();
  const map = useContext(FrameMap);
  return map ? map(f) : f;
};
