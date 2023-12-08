import {Matrix4,Vector3} from "three"

export const tileSize = 512;
/**
 * Converts a pixel value at a the given zoom level to tile units.
 */
// export function pixelsToTileUnits(overscaledZ: number, pixelValue: number, z: number): number {
//   return pixelValue * (EXTENT / (tileSize * Math.pow(2, z - overscaledZ)));
// }

export function getLabelPlaneMatrix(
  posMatrix: Matrix4,
  viewport: any,) {
  // @ts-ignore
  const m = new Matrix4 ()
  // if (pitchWithMap) {
  //   mat4.identity(m);
  //   mat4.scale(m, m, [1 / pixelsToTileUnits, 1 / pixelsToTileUnits, 1]);
  //   if (!rotateWithMap) {
  //     mat4.rotateZ(m, m, transform.angle);
  //   }
  // } else {
  //   mat4.scale(m, m, [transform.width / 2, -transform.height / 2, 1]);
  //   mat4.translate(m, m, [1, -1, 0]);
  //   mat4.multiply(m, m, posMatrix);
  // }
  m.scale(new Vector3(viewport.width / 2, -viewport.height / 2, 1));
  m.makeTranslation(1, -1, 0);
  m.multiply(posMatrix)
  return m;
}

/*
 * Returns a matrix for converting from the correct label coordinate space to gl coords.
 */
export function getGlCoordMatrix(viewport: any) {
  // @ts-ignore
  const m = new Matrix4();
  // if (pitchWithMap) {
  //   mat4.multiply(m, m, posMatrix);
  //   mat4.scale(m, m, [pixelsToTileUnits, pixelsToTileUnits, 1]);
  //   if (!rotateWithMap) {
  //     mat4.rotateZ(m, m, -transform.angle);
  //   }
  // } else {
  //   mat4.scale(m, m, [1, -1, 1]);
  //   mat4.translate(m, m, [-1, -1, 0]);
  //   mat4.scale(m, m, [2 / transform.width, 2 / transform.height, 1]);
  // }
  m.scale(new Vector3(1, -1, 1));
  m.makeTranslation(-1, -1, 0);
  m.scale(new Vector3(2 / viewport.width, 2 / viewport.height, 1));
  return m;
}

// For line label layout, we're not using z output and our w input is always 1
// This custom matrix transformation ignores those components to make projection faster
// export function xyTransformMat4(out: vec4, a: vec4, m: mat4) {
//   const x = a[0], y = a[1];
//   out[0] = m[0] * x + m[4] * y + m[12];
//   out[1] = m[1] * x + m[5] * y + m[13];
//   out[3] = m[3] * x + m[7] * y + m[15];
//   return out;
// }