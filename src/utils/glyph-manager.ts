// @ts-ignore
import TinySDF from '@mapbox/tiny-sdf';
import { AlphaImage, StyleGlyph } from '../symbol/AlphaImage';

const fontsize = 40; // Font size in pixels
const buffer = 3;    // Whitespace buffer around a glyph in pixels
const radius = 8;    // How many pixels around the glyph shape to use for encoding distance
const cutoff = 0.25  // How much of the radius (relative) is used for the inside part the glyph

const sdfGeneratorCache: {
  [fontStack: string]: TinySDF;
} = {};
const textMetricsCache: {
  [fontStack: string]: {
    [char: string]: number;
  }
} = {};

export function isCJK(char: number): boolean {
  return char >= 0x4E00 && char <= 0x9FFF;
}

export function getDefaultCharacterSet(): string[] {
  const charSet = [];
  for (let i = 0; i < 300; i++) {
    charSet.push(String.fromCharCode(i));
  }
  return charSet;
}

function extractFontStack(fontStack: string) {
  const fontFamily = fontStack.trim().substring(0, fontStack.lastIndexOf(' '));
  let fontWeight = '400';
  if (/bold/i.test(fontStack)) {
    fontWeight = '900';
  } else if (/medium/i.test(fontStack)) {
    fontWeight = '500';
  } else if (/light/i.test(fontStack)) {
    fontWeight = '200';
  }
  return {
    fontFamily,
    fontWeight,
  };
}

export function generateSDF(fontStack: string = '', char: string): StyleGlyph {
  const { fontFamily, fontWeight } = extractFontStack(fontStack);
  
  const charCode = char.charCodeAt(0);
  let sdfGenerator = sdfGeneratorCache[fontStack];
  if (!sdfGenerator) {
    // 创建 SDF
    sdfGenerator = sdfGeneratorCache[fontStack]
      = new TinySDF({fontSize:fontsize, buffer, radius, cutoff, fontFamily, fontWeight});
  }
  if (!textMetricsCache[fontStack]) {
    textMetricsCache[fontStack] = {};
  }

  if (!textMetricsCache[fontStack][char]) {
    // 使用 mapbox/tiny-sdf 中的 context
    // @see https://stackoverflow.com/questions/46126565/how-to-get-font-glyphs-metrics-details-in-javascript
    //@ts-ignore
    textMetricsCache[fontStack][char] = sdfGenerator?.ctx.measureText(char).width;
  }
  //glyphAdvance,glyphHeight,glyphLeft,glyphTop,glyphWidth,height,width
  const {data, width, height, glyphWidth, glyphHeight, glyphLeft, glyphTop, glyphAdvance}=sdfGenerator.draw(char)
  return {
    id: charCode,
    // 在 canvas 中绘制字符，使用 Uint8Array 存储 30*30 sdf 数据
    //@ts-ignore
    bitmap: new AlphaImage({ width, height}, data),
    metrics: {
      width: glyphWidth,
      height: glyphHeight,
      left: glyphLeft,
      top: glyphTop,
      // 对于 CJK 需要调整字符间距
      // advance: getCharAdvance(charCode)
      advance: isCJK(charCode) ? glyphAdvance : textMetricsCache[fontStack][char]
    }
  };
}
