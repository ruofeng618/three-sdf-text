import { BufferAttribute,Float32BufferAttribute,BufferGeometry } from "three";
import {shapeText,SymbolAnchor, TextJustify} from "./utils/symbol-layout"
import { ITextFeature } from "./types/texttypes";
import GlyphAtlas from "./symbol/GlyphAtlas";
import { StyleGlyph } from "./symbol/AlphaImage";
import { getGlyphQuads } from "./symbol/SymbolQuad";
export class SdfGeometry extends BufferGeometry{

  public dirty=true;

  public get glyphAtlas(){
    return this._glyphAtlas;
  }
  public set glyphAtlas(value){
    this.dirty=true;
    this._glyphAtlas=value;
  }
  public get glyphMap(){
    return this._glyphMap;
  }
  public set glyphMap(value){
    this.dirty=true;
    this._glyphMap=value
  }
  public get fontStack(){
    return this._fontStack;
  }
  public set fontStack(value){
    this.dirty=true;
    this._fontStack=value
  }
  public get symbolAnchor(){
    return this._symbolAnchor
  }
  public set symbolAnchor(value){
    this.dirty=true;
    this._symbolAnchor=value
  }
  public get textJustify(){
    return this._textJustify
  }
  public set textJustify(value){
    this.dirty=true;
    this._textJustify=value
  }
  public get textSpacing(){
    return this._textSpacing
  }
  public set textSpacing(value){
    this.dirty=true;
    this._textSpacing=value
  }
  public get textOffsetY(){
    return this._textOffsetY
  }
  public set textOffsetY(value){
    this.dirty=true;
    this._textOffsetY=value
  }
  public get textOffsetX(){
    return this._textOffsetX
  }
  public set textOffsetX(value){
    this.dirty=true;
    this._textOffsetX=value
  }
  public get textFeatures(){
    return this._textFeatures
  }
  public set textFeatures(value){
    this.dirty=true;
    this._textFeatures=value
    this.updateAttributes()
  }
  private _glyphAtlas!: GlyphAtlas;
  private _glyphMap!: { [key: number]: StyleGlyph; };
  private _fontStack!: string;
  private _textFeatures!:ITextFeature[];
  private _textOffsetY!:number;
  private _symbolAnchor!:SymbolAnchor;
  private _textJustify!:TextJustify;
  private _textSpacing!:number;
  private _textOffsetX!:number;
  private a_pos!: BufferAttribute;
  private a_tex!: BufferAttribute;
  private a_offset!: BufferAttribute;
  private indice!: BufferAttribute;
  constructor(params:any){
    super();
    const {glyphMap,fontStack,textFeatures,glyphAtlas}=params;
    this.glyphAtlas=glyphAtlas;
    this.fontStack=fontStack;
    this.glyphMap=glyphMap;
    this._textFeatures=textFeatures;
    this._symbolAnchor='center';
    this._textJustify= 'center';
    this._textSpacing= 2;
    this._textOffsetX= 0;
    this._textOffsetY= 0;
    this.updateAttributes();
  }
  public updateAttributes(){
    if(!this.dirty) return;
    // this.dispose();
    const { indexBuffer,charPositionBuffer,charUVBuffer,charOffsetBuffer}=this.buildTextBuffers();
    if(this.a_pos){
      //@ts-ignore
      this.updateAttribute(this.a_pos.array,charPositionBuffer?.flat());
      //@ts-ignore
      this.updateAttribute(this.a_tex.array,charUVBuffer?.flat());
      //@ts-ignore
      this.updateAttribute(this.a_offset.array,charOffsetBuffer?.flat());
      //@ts-ignore
      this.updateAttribute(this.indice.array,indexBuffer?.flat());
      this.a_pos.needsUpdate=true;
      this.a_tex.needsUpdate=true;
      this.a_offset.needsUpdate=true;
      this.indice.needsUpdate=true;
    }else{
      this.a_pos=new Float32BufferAttribute(charPositionBuffer?.flat(), 2);
      this.a_tex=new Float32BufferAttribute(charUVBuffer?.flat(), 2);
      this.a_offset=new Float32BufferAttribute(charOffsetBuffer?.flat(), 2);
      this.indice=new BufferAttribute(new Uint16Array(indexBuffer?.flat()), 1);
      this.setAttribute("a_pos", this.a_pos);
      this.setAttribute("a_tex",this.a_tex);
      this.setAttribute("a_offset",this.a_offset);
      this.setIndex(this.indice);
    }
    this.dirty=false;
  }
  private buildTextBuffers() {
    const charPositionBuffer = new Array();
    const charUVBuffer = new Array();
    const charOffsetBuffer = new Array();
    const indexBuffer= new Array();

    const textOffset= [ this.textOffsetX, this.textOffsetY ];
    // 首先按权重从高到低排序
    // textArray.sort(compareClusterText);

    let i = 0;
    this?.textFeatures?.forEach?.(({ text, position }) => {
      // 锚点
      // const anchor = new Point(position[0], position[1]);
      // 计算布局
      const shaping = shapeText(text, this.glyphMap, this.fontStack,  24, this.symbolAnchor, this.textJustify, this.textSpacing, textOffset);
      if (shaping) {
        // 加入索引
          // 计算每个独立字符相对于锚点的位置信息
          const glyphQuads = getGlyphQuads(shaping, textOffset,
            false, this.glyphAtlas.positions);

          glyphQuads.forEach((quad: { tex: { x: number; y: number; w: any; h: any; }; tl: { x: number; y: number; }; tr: { x: number; y: number; }; br: { x: number; y: number; }; bl: { x: number; y: number; }; }) => {
            // TODO: vertex compression
            charPositionBuffer.push(position);
            charPositionBuffer.push(position);
            charPositionBuffer.push(position);
            charPositionBuffer.push(position);

            charUVBuffer.push([ quad.tex.x, quad.tex.y ]);
            charUVBuffer.push([ quad.tex.x + quad.tex.w, quad.tex.y ]);
            charUVBuffer.push([ quad.tex.x + quad.tex.w, quad.tex.y + quad.tex.h ]);
            charUVBuffer.push([ quad.tex.x, quad.tex.y + quad.tex.h ]);

            charOffsetBuffer.push([ quad.tl.x, quad.tl.y ]);
            charOffsetBuffer.push([ quad.tr.x, quad.tr.y ]);
            charOffsetBuffer.push([ quad.br.x, quad.br.y ]);
            charOffsetBuffer.push([ quad.bl.x, quad.bl.y ]);

            indexBuffer.push([0 + i, 1 + i, 2 + i]);
            indexBuffer.push([2 + i, 3 + i, 0 + i]);
            i += 4;
          });
      }
    });
    return {
      indexBuffer,
      charPositionBuffer,
      charUVBuffer,
      charOffsetBuffer
    };
  }
  private updateAttribute(preValues:[],values:[]){
    for (let i = 0; i < values.length; i++) {
      preValues[i] = values[i];   
    }
  }
}