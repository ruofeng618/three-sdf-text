import {Matrix4,Vector3} from "three"

export function getLabelPlaneMatrix(
  viewport: any,) {
  // @ts-ignore
  const m = new Matrix4 ()
  m.scale(new Vector3(viewport.width / 2, -viewport.height / 2, 1));
  const  translate=new Matrix4();
  translate.makeTranslation(1, -1, 0);
  m.multiply(translate);
  return m;
}

/*
 * Returns a matrix for converting from the correct label coordinate space to gl coords.
 */
export function getGlCoordMatrix(viewport: any) {
  // @ts-ignore
  const m = new Matrix4();
  m.scale(new Vector3(1, -1, 1));
  const  translate=new Matrix4();
  translate.makeTranslation(-1, -1, 0);
  m.multiply(translate);
  m.scale(new Vector3(2 / viewport.width, 2 / viewport.height, 1));
  return m;
}