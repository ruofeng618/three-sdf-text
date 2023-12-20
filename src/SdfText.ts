import {Color, Mesh} from "three"
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
  public fontFamily = 'Monaco, monospace';
  public fontWeight = 400;
  public material:SdfMaterial;
  public set fontSize(v : number) {
    this.material.fontSize = v;
  }
  public get fontSize() : number {
    return this?.material?.fontSize??40
  }
  
  public get fontColor() : Color {
    return this.material.fontColor
  }
  
  public set fontColor(v : Color) {
    this.material.fontColor= v;
  }
  
  public get fontOpacity() : number {
    return this.material.fontOpacity
  }
  
  public set fontOpacity(v : number) {
    this.material.fontOpacity= v;
  }
  
  public get haloColor() : Color {
    return this.material.haloColor
  }
  
  public set haloColor(v : Color) {
    this.material.haloColor = v;
  }
  
  public get haloWidth() : number {
    return this.material.haloWidth
  }
  
  public set haloWidth(v : number) {
    this.material.haloWidth = v;
  }
  
  public get haloBlur() : number {
    return this.material.haloBlur
  }
  
  public set haloBlur(v : number) {
    this.material.haloBlur = v;
  }
  constructor(params:any){
    super()
    const {textFeatures,viewport}=params
    this.fontStack='';
    this.createGlyphAtlas()
    this.viewPort=viewport??{
      width:1920,
      height:1080,
    }
    this.material=new SdfMaterial({
      image:this.glyphAtlas.image,
      viewport:this.viewPort
    });
    this.geometry=new SdfGeometry({
      glyphMap:this.glyphMap,
      fontStack:this.fontStack,
      textArray:textFeatures,
      glyphAtlas:this.glyphAtlas,
    });
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