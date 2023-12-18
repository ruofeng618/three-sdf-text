import {Mesh} from "three"
import GlyphAtlas from "./symbol/GlyphAtlas";
import { StyleGlyph } from "./symbol/AlphaImage";
import { generateSDF, getDefaultCharacterSet } from "./utils/glyph-manager";
import { SdfMaterial } from "./SdfMaterial";
import { SdfGeometry } from "./SdfGeometry";
import { ITextFeature } from "./types/texttypes";
export  class SdfText extends Mesh{
  public glyphAtlas!: GlyphAtlas;
  public glyphMap!: { [key: number]: StyleGlyph };
  public viewPort!:{width:number,height:number}
  public fontStack!: string;
  public textField = 'name';
  public fontFamily = 'Monaco, monospace';
  public fontWeight = 400;
  public fontSize = 14.;
  public fontColor = [0, 0, 0];
  public fontOpacity = 1.0;
  public haloColor = [255, 255, 255];
  public haloWidth = 1.0;
  public haloBlur = 0.2;
  constructor(params:any){
    super()
    const {textFeatures}=params
    // this.glyphAtlas=undefined;
    // this.glyphMap=undefined;
    this.fontStack='';
    this.createGlyphAtlas()
    this.viewPort={
      width:100,
      height:100,
    }
    this.material=new SdfMaterial();
    this.geometry=new SdfGeometry();
    this.setTextFeatures(textFeatures);
  }
   private createGlyphAtlas() {
      this.fontStack = `${this.fontFamily} ${this.fontWeight}`;
      const glyphMap = getDefaultCharacterSet().map(char => {
        return generateSDF(this.fontStack, char);
      }).reduce((prev, cur) => {
        // @ts-ignore
        prev[cur.id] = cur;
        return prev;
      }, {});
  
      if (!this.glyphMap) {
        this.glyphMap = {};
      }
      //@ts-ignore
      this.glyphMap[this.fontStack] = glyphMap; 
      this.glyphAtlas = new GlyphAtlas(this.glyphMap);
   }
   public update(){
    (this.material as SdfMaterial).update(this);
    (this.geometry as SdfGeometry).update(this);
   }
   public setTextFeatures(textFeatures: ITextFeature[]){
     (this.geometry as SdfGeometry).textArray=textFeatures;
   }
}