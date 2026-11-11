import React from 'react';
import { Composition } from 'remotion';
import { Promo } from './Promo';
import { PromoVertical } from './PromoVertical';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="PromoVertical" component={PromoVertical} durationInFrames={900} fps={30} width={1080} height={1920} />
  </>
);
