import { BufferAttribute, BufferGeometry } from "three";
import {shapeText,SymbolAnchor, TextJustify} from "./utils/symbol-layout"
import { ITextFeature } from "./types/texttypes";
import { SdfText } from "./SdfText";
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
  public get textOffsetY(){
    return this._textOffsetY
  }
  public set textOffsetY(value){
    this.dirty=true;
    this._textOffsetY=value
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
  public get textOffsetX(){
    return this._textOffsetX
  }
  public set textOffsetX(value){
    this.dirty=true;
    this._textOffsetX=value
  }
  public get textArray(){
    return this._textArray
  }
  public set textArray(value){
    this.dirty=true;
    this._textArray=value
    this.updateAttributes()
  }
  private _glyphAtlas!: GlyphAtlas;
  private _glyphMap!: { [key: number]: StyleGlyph; };
  private _fontStack!: string;
  private _textArray!:ITextFeature[];
  private _textOffsetY!:number;
  private _symbolAnchor!:SymbolAnchor;
  private _textJustify!:TextJustify;
  private _textSpacing!:number;
  private _textOffsetX!:number;
  constructor(){
    super();
    this._textArray=[];
    this._symbolAnchor= 'center';
    this._textJustify= 'center';
    this._textSpacing= 2;
    this._textOffsetX= 0;
    this._textOffsetY= 0;
  }
  private updateAttributes(){
    const { indexBuffer,charPositionBuffer,charUVBuffer,charOffsetBuffer}=this.buildTextBuffers()
    this.setAttribute("a_pos", new BufferAttribute(new Float32Array(charPositionBuffer), 2));
    this.setAttribute("a_tex", new BufferAttribute(new Float32Array(charUVBuffer), 2));
    this.setAttribute("a_offset", new BufferAttribute(new Float32Array(charOffsetBuffer), 2));
    this.setIndex(indexBuffer)
  }
  private buildTextBuffers() {
    const textArray=this.textArray;
    const charPositionBuffer = new Array();
    const charUVBuffer = new Array();
    const charOffsetBuffer = new Array();
    const indexBuffer= new Array();

    const textOffset= [ this.textOffsetX, this.textOffsetY ];
    // 首先按权重从高到低排序
    // textArray.sort(compareClusterText);

    let i = 0;
    textArray?.forEach?.(({ text, position }) => {
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
  public update(sdfText:SdfText){
    const {glyphMap,fontStack}=sdfText
    this.fontStack=fontStack;
    this.glyphMap=glyphMap;
  }
}