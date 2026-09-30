import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {charFrame} from '../timing';
import {dialPhi} from './Scene3D';
import {Q2, WA2} from './type2';
import {HERO_STEPS} from './world';

type Cue = {at: number; file: string; volume: number};

const cues = (): Cue[] => {
  const c: Cue[] = [];
  // B5-B8: un whoosh corto por beat en el vuelo.
  for (const at of [96, 120, 144, 168]) c.push({at, file: 'whoosh', volume: 0.55});
  // B9½-B13: tecleo de la pregunta en el silencio; el "?" es grave.
  for (let i = 0; i < Q2.chars; i++) {
    const at = charFrame(i, Q2.t0, Q2.cps);
    c.push(i === Q2.chars - 1 ? {at, file: 'key-low', volume: 1} : {at, file: i % 2 ? 'key-2' : 'key-1', volume: 0.75});
  }
  // B14: drop, clack mecanico e impacto grave. B17: impacto grave.
  c.push({at: 312, file: 'thud', volume: 0.45}, {at: 312, file: 'clack', volume: 0.5}, {at: 384, file: 'thud', volume: 0.6});
  // B18-B21: el barrido revela cada frase.
  for (const at of [408, 432, 456, 480]) c.push({at, file: 'tick', volume: 0.7});
  // B22-B24: clicks del dial, uno por marca que pasa por el indice (maximo uno por frame).
  let last = Math.floor(dialPhi(504) / 6);
  for (let f = 505; f <= 552; f++) {
    const cur = Math.floor(dialPhi(f) / 6);
    if (cur !== last) c.push({at: f, file: 'dial', volume: 0.45});
    last = cur;
  }
  c.push({at: 552, file: 'dial', volume: 1}, {at: 552, file: 'hit', volume: 0.45});
  // B25 y B29: vuelos. Un tick por tamano.
  c.push({at: 576, file: 'whoosh', volume: 0.6}, {at: 696, file: 'whoosh', volume: 0.6});
  for (const at of HERO_STEPS) c.push({at, file: 'tick', volume: 0.7}, {at, file: 'hit', volume: 0.3});
  // B30-B34: cursor, tecleo del numero, web e Instagram.
  c.push({at: WA2.appear, file: 'tick', volume: 0.5});
  for (let i = 0; i < 12; i++) {
    const at = charFrame(i, WA2.t0, WA2.cps);
    c.push(i === 11 ? {at, file: 'key-low', volume: 0.9} : {at, file: i % 2 ? 'key-2' : 'key-1', volume: 0.6});
  }
  c.push({at: 792, file: 'tick', volume: 0.8}, {at: 816, file: 'tick', volume: 0.8});
  // B35-B37: vuelo, clack suave, hit y hit final.
  c.push({at: 840, file: 'whoosh', volume: 0.6}, {at: 864, file: 'clack', volume: 0.35}, {at: 864, file: 'hit', volume: 0.35}, {at: 888, file: 'hit', volume: 0.55});
  return c;
};

const CUES = cues();

export const Sfx2: React.FC = () => (
  <>
    <Audio src={staticFile('audio/beat-150-v2.wav')} volume={0.72} />
    {CUES.map((q, i) => (
      // Nada de lo que suena antes del corte (f192) se filtra al silencio.
      <Sequence key={i} from={q.at} durationInFrames={Math.min(90, 960 - q.at, q.at < 192 ? 192 - q.at : 90)} layout="none">
        <Audio src={staticFile(`audio/${q.file}.wav`)} volume={q.volume} />
      </Sequence>
    ))}
  </>
);
