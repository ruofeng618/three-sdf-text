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
  public fontSize = 40;
  constructor(params:any){
    super()
    const {textFeatures}=params
    this.fontStack='';
    this.createGlyphAtlas()
    this.viewPort={
      width:1920,
      height:1080,
    }
    this.material=new SdfMaterial({
      glyphAtlas:this.glyphAtlas,
      viewPort:this.viewPort
    });
    this.geometry=new SdfGeometry({
      glyphMap:this.glyphMap,
      fontStack:this.fontStack,
      textArray:textFeatures,
      glyphAtlas:this.glyphAtlas,
    });
    //this.setTextFeatures(textFeatures);
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
   public setTextFeatures(textFeatures: ITextFeature[]){
    // (this.geometry as SdfGeometry).textArray=textFeatures;
   }
}