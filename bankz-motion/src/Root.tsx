import React from 'react';
import {Composition} from 'remotion';
import {Master, MasterProps} from './Master';
import {DURATION, FPS} from './timing';

export const Root: React.FC = () => (
  <>
    <Composition<any, MasterProps> id="Bankz16x9" component={Master} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{aspect: '16x9'}} />
    <Composition<any, MasterProps> id="Bankz9x16" component={Master} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{aspect: '9x16'}} />
  </>
);
