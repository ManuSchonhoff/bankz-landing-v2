import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT} from './text';

// Alexandria variable (la misma de bankz.ar), servida localmente: render sin red.
let loaded = false;
let promise: Promise<void> | null = null;

const load = () => {
  if (!promise) {
    const files: [string, string][] = [
      ['fonts/alexandria-latin.woff2', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'],
      ['fonts/alexandria-latin-ext.woff2', 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'],
    ];
    promise = Promise.all(
      files.map(([file, range]) => {
        const face = new FontFace(FONT, `url(${staticFile(file)}) format('woff2')`, {weight: '100 900', style: 'normal', unicodeRange: range});
        return face.load().then((ff) => {
          document.fonts.add(ff);
        });
      }),
    )
      .then(() => Promise.all([document.fonts.load(`400 64px ${FONT}`, '¿×·á'), document.fonts.load(`500 64px ${FONT}`, '¿×·á')]))
      .then(() => {
        loaded = true;
      });
  }
  return promise;
};

export const useFonts = () => {
  const [ready, setReady] = useState(loaded);
  const [handle] = useState(() => (loaded ? null : delayRender('Cargando Alexandria')));
  useEffect(() => {
    if (loaded) return;
    load().then(() => {
      setReady(true);
      if (handle !== null) continueRender(handle);
    });
  }, [handle]);
  return ready;
};
