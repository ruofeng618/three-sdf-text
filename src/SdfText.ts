import { Color,  Mesh, } from "three"
import GlyphAtlas from "./symbol/GlyphAtlas";
import { StyleGlyph } from "./symbol/AlphaImage";
import { generateSDF, getDefaultCharacterSet } from "./utils/glyph-manager";
import { SdfMaterial } from "./SdfMaterial";
import { SdfGeometry } from "./SdfGeometry";
import { ITextFeature } from "./types/texttypes";
export  class SdfText extends Mesh{
  public set fontSize(v : number) {
    this.material.fontSize = v;
  }
  public get fontSize() : number {
    return this?.material?.fontSize??40
  }
  
  public get fontColor() : Color {
    return this.material.fontColor
  }
  
  public set fontColor(v : string|Object) {
    //@ts-ignore
    const color= v instanceof Object?new Color(v.r,v.g,v.b):new Color(v)
    this.material.fontColor= color;
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
  
  public set haloColor(v : string|Object) {
    //@ts-ignore
    const color= v instanceof Object ?new Color(v.r,v.g,v.b):new Color(v)
    this.material.haloColor = color;
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
  
  public get fontFamily() : string {
    return this._fontFamily
  }
  
  public set fontFamily(v : string) {
    this._fontFamily = v;
  }
  
  public get fontWeight() : number {
    return this._fontWeight
  }
  
  public set fontWeight(v : number) {
    this._fontWeight = v;
  }


  public get charSets() : Array<string> {
    return this._charSets
  }

  public set charSets(v : Array<string>) {
    this._charSets = v;
  }

  public get symbolAnchor(){
    return this.geometry.symbolAnchor
  }
  public set symbolAnchor(value){
    this.geometry.symbolAnchor=value
  }
  public get textJustify(){
    return this.geometry.textJustify
  }
  public set textJustify(value){
    this.geometry.textJustify=value
  }
  public get textSpacing(){
    return this.geometry.textSpacing
  }
  public set textSpacing(value){
    this.geometry.textSpacing=value
  }
  public get textOffsetY(){
    return this.geometry.textOffsetY
  }
  public set textOffsetY(value){
    this.geometry.textOffsetY=value
  }
  public get textOffsetX(){
    return this.geometry.textOffsetX
  }
  public set textOffsetX(value){
    this.geometry.textOffsetX=value
  }
  public get textFeatures(){
    return this._textFeatures
  }
  public set textFeatures(value){
    this._textFeatures=value
  }

  public dirty=true;

  public glyphAtlas!: GlyphAtlas;

  public glyphMap!: { [key: number]: StyleGlyph };

  public viewport!:{width:number,height:number}

  public fontStack!: string;

  public material:SdfMaterial;

  public geometry:SdfGeometry;

  private _fontFamily:string;

  private _fontWeight:number;

  private _charSets:Array<string>

  private _textFeatures!:ITextFeature[];

  constructor(params:any){
    super()
    const {textFeatures,viewport}=params
    this.fontStack='';
    this._fontFamily = 'Monaco, monospace';
    this._fontWeight = 400;
    this._charSets=getDefaultCharacterSet();
    this.createGlyphAtlas()
    this.viewport=viewport??{
      width:1920,
      height:1080,
    }
    this.material=new SdfMaterial({
      image:this.glyphAtlas.image,
      viewport:this.viewport
    });
    this.geometry=new SdfGeometry({
      glyphMap:this.glyphMap,
      fontStack:this.fontStack,
      textFeatures:textFeatures,
      glyphAtlas:this.glyphAtlas,
    });
  }
   private createGlyphAtlas() {
      this.fontStack = `${this.fontFamily} ${this.fontWeight}`;
      const glyphMap = this?.charSets?.map(char => {
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
   public onBeforeRender(): void {
      if(this.dirty)this.createGlyphAtlas();
      this?.geometry?.updateAttributes();
      this?.material?.updateUniforms();
      this.dirty=false;
   }
   public setTextFeatures(textFeatures: ITextFeature[]){
    // (this.geometry as SdfGeometry).textArray=textFeatures;
   }
}