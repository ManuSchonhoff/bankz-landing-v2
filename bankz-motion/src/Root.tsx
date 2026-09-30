import React from 'react';
import {Composition} from 'remotion';
import {Master, MasterProps} from './Master';
import {Master2, Master2Props} from './v2/Master2';
import {Sfx2} from './v2/Sfx2';
import {DURATION, DURATION_12, FPS} from './timing';

export const Root: React.FC = () => (
  <>
    <Composition<any, MasterProps> id="V1-Bankz16x9" component={Master} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{aspect: '16x9'}} />
    <Composition<any, MasterProps> id="V1-Bankz9x16" component={Master} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{aspect: '9x16'}} />
    <Composition<any, MasterProps> id="V1-Bankz12s16x9" component={Master} durationInFrames={DURATION_12} fps={FPS} width={1920} height={1080} defaultProps={{aspect: '16x9', cut: '12'}} />
    <Composition<any, MasterProps> id="V1-Bankz12s9x16" component={Master} durationInFrames={DURATION_12} fps={FPS} width={1080} height={1920} defaultProps={{aspect: '9x16', cut: '12'}} />
    <Composition<any, Master2Props> id="Bankz16x9" component={Master2} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{aspect: '16x9'}} />
    <Composition<any, Master2Props> id="Bankz9x16" component={Master2} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{aspect: '9x16'}} />
    {/* Solo la pista v2 (mismos cues que el video): para re-mezclar audio sin volver a renderizar el 3D. */}
    <Composition id="BankzAudio" component={Sfx2} durationInFrames={DURATION} fps={FPS} width={16} height={16} />
  </>
);
