import { AlphaImage, GlyphMetrics, StyleGlyph } from './AlphaImage';
// @ts-ignore
import potpack from 'potpack';

const padding = 1;

type Rect = {
  x: number,
  y: number,
  w: number,
  h: number
};

export type GlyphPosition = {
  rect: Rect,
  metrics: GlyphMetrics
};

export type GlyphPositions = { [key: string]: { [key: number]: GlyphPosition } }

export default class GlyphAtlas {
  image: AlphaImage;
  positions: GlyphPositions;

  constructor(stacks: { [key: string]: { [key: number]: StyleGlyph } }) {
    const positions = {};
    const bins = [];

    for (const stack in stacks) {
      const glyphs = stacks[stack];
      // @ts-ignore
      const stackPositions = positions[stack] = {};

      for (const id in glyphs) {
        const src = glyphs[+id];
        if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) continue;

        const bin = {
          x: 0,
          y: 0,
          //@ts-ignore
          w: src.bitmap.width + 2 * padding,
          //@ts-ignore
          h: src.bitmap.height + 2 * padding
        };
        bins.push(bin);
        // @ts-ignore
        stackPositions[id] = { rect: bin, metrics: src.metrics };
      }
    }

    const { w, h } = potpack(bins);
    const image = new AlphaImage({ width: w || 1, height: h || 1 });

    for (const stack in stacks) {
      const glyphs = stacks[stack];

      for (const id in glyphs) {
        const src = glyphs[+id];
        if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) continue;
        // @ts-ignore
        const bin = positions[stack][id].rect;
        AlphaImage.copy(src.bitmap, image, { x: 0, y: 0 }, { x: bin.x + padding, y: bin.y + padding }, src.bitmap);
      }
    }

    this.image = image;
    this.positions = positions;
  }
}