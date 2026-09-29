import React from 'react';
import {blurCss} from '../anim';
import {FONT} from '../text';

type Props = {
  x: number;
  y: number; // centro vertical de la caja (line-height 1)
  size: number;
  weight?: 400 | 500;
  color: string;
  align?: 'left' | 'center';
  opacity?: number;
  blur?: number;
  dx?: number;
  dy?: number;
  scale?: number;
  children: string;
};

export const Txt: React.FC<Props> = ({x, y, size, weight = 500, color, align = 'center', opacity = 1, blur = 0, dx = 0, dy = 0, scale = 1, children}) => {
  if (opacity <= 0.002 || children.length === 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1,
        whiteSpace: 'pre',
        fontKerning: 'normal',
        color,
        opacity: Math.min(1, opacity),
        filter: blurCss(blur),
        transform: `translate(${align === 'center' ? '-50%' : '0px'}, -50%) translate(${dx}px, ${dy}px) scale(${scale})`,
        transformOrigin: align === 'center' ? '50% 50%' : '0% 50%',
        willChange: 'transform, filter',
      }}
    >
      {children}
    </div>
  );
};

// Cursor solido del alto de la tipografia.
export const Caret: React.FC<{x: number; y: number; size: number; color: string; scaleY?: number; opacity?: number}> = ({x, y, size, color, scaleY = 1, opacity = 1}) => {
  if (opacity <= 0 || scaleY <= 0) return null;
  const w = Math.max(3, size * 0.06);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - size / 2,
        width: w,
        height: size,
        background: color,
        opacity,
        transform: `scaleY(${scaleY})`,
        transformOrigin: '50% 50%',
      }}
    />
  );
};

// Parpadeo 12 f on / 12 f off desde `from`.
export const blinkOn = (f: number, from: number) => Math.floor((f - from) / 12) % 2 === 0;
