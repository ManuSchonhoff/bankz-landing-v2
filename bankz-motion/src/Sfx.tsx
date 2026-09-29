import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {wheelPos} from './scenes/04-Visita';
import {charFrame, Q_CHARS, Q_CPS, Q_T0, WA_CHARS, WA_CPS, WA_T0} from './timing';

type Cue = {at: number; file: string; volume: number};

const cues = (): Cue[] => {
  const c: Cue[] = [];
  // Tecleo de la pregunta: un click por caracter (dos variantes alternadas); el "?" es grave.
  for (let i = 0; i < Q_CHARS; i++) {
    const at = charFrame(i, Q_T0, Q_CPS);
    c.push(i === Q_CHARS - 1 ? {at, file: 'key-low', volume: 1} : {at, file: i % 2 ? 'key-2' : 'key-1', volume: 0.75});
  }
  // Drop: clack mecanico + impacto grave.
  c.push({at: 240, file: 'thud', volume: 0.45}, {at: 240, file: 'clack', volume: 0.5});
  // Hits
  for (const at of [264, 288, 336, 444, 456, 468, 480, 504, 600, 624, 792, 840, 864]) c.push({at, file: 'hit', volume: 0.55});
  // Ticks: chips.
  for (const at of [360, 372, 384, 396]) c.push({at, file: 'tick', volume: 0.8});
  // Inversion a negro: impacto grave.
  c.push({at: 432, file: 'thud', volume: 0.6});
  // Rueda: un tick por item que pasa por el centro.
  let last = Math.round(wheelPos(576));
  for (let f = 577; f <= 600; f++) {
    const cur = Math.round(wheelPos(f));
    if (cur !== last) c.push({at: f, file: 'tick', volume: 0.6});
    last = cur;
  }
  // CTA (lineas) y contactos.
  c.push({at: 648, file: 'tick', volume: 0.5});
  for (let i = 0; i < WA_CHARS; i++) {
    const at = charFrame(i, WA_T0, WA_CPS);
    c.push(i === WA_CHARS - 1 ? {at, file: 'key-low', volume: 0.9} : {at, file: i % 2 ? 'key-2' : 'key-1', volume: 0.6});
  }
  c.push({at: 720, file: 'tick', volume: 0.8}, {at: 744, file: 'tick', volume: 0.8});
  // Cierre: clack suave cuando el gancho vuelve al punto.
  c.push({at: 816, file: 'clack', volume: 0.45});
  return c;
};

const CUES = cues();

export const Sfx: React.FC = () => (
  <>
    <Audio src={staticFile('audio/beat-150.wav')} volume={0.72} />
    {CUES.map((q, i) => (
      <Sequence key={i} from={q.at} durationInFrames={Math.min(90, 960 - q.at)} layout="none">
        <Audio src={staticFile(`audio/${q.file}.wav`)} volume={q.volume} />
      </Sequence>
    ))}
  </>
);
