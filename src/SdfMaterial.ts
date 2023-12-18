import { AlphaFormat, Color, DataTexture, Matrix4, ShaderMaterial, Texture, Vector2} from "three";
import { getGlCoordMatrix, getLabelPlaneMatrix } from "./utils/symbol-projection";
import { SdfText } from "./SdfText";

export class SdfMaterial extends ShaderMaterial{
  public labelPlaneMatrix!:Matrix4;
  public glCoordMatrix!:Matrix4;
  public glyphAtlasTexture!: Texture;
  public needUpdateGlyphAtlasTexture:boolean;
  public get textField() : string {
    return this._textField
  }
  
  public set textField(v : string) {
    this._textField = v;
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
  
  public set fontSize(v : number) {
    this._fontSize = v;
  }
  
  public get fontSize() : number {
    return this._fontSize
  }
  
  public get fontColor() : Color {
    return this._fontColor
  }
  
  public set fontColor(v : Color) {
    this._fontColor= v;
  }
  
  public get fontOpacity() : number {
    return this._fontOpacity
  }
  
  public set fontOpacity(v : number) {
    this. _fontOpacity= v;
  }
  
  public get haloColor() : Color {
    return this._haloColor
  }
  
  public set haloColor(v : Color) {
    this._haloColor = v;
  }
  
  public get haloWidth() : number {
    return this._haloWidth
  }
  
  public set haloWidth(v : number) {
    this._haloWidth = v;
  }
  
  public get haloBlur() : number {
    return this._haloBlur
  }
  
  public set haloBlur(v : number) {
    this._haloBlur = v;
  }
  
  public get mapSize() : Vector2 {
    return this._mapSize;
  }
  
  public set mapSize(v : Vector2) {
    this._mapSize= v;
  }
  private _textField: string;
  private _fontFamily: string;
  private _fontWeight: number;
  private _fontSize: number;
  private _fontColor:Color;
  private _fontOpacity: number;
  private _haloColor: Color;
  private _haloWidth: number;
  private _haloBlur: number;
  private _mapSize:Vector2;
    constructor(){
      super()
      this._init()
      this._textField = 'name';
      this._fontFamily = 'Monaco, monospace';
      this._fontWeight = 400;
      this._fontSize = 14.;
      this._fontColor = new Color(0,0,0);
      this._fontOpacity = 1.0;
      this._haloColor = new Color(255, 255, 255);
      this._haloWidth = 1.0;
      this._haloBlur = 0.2;
      this._mapSize=new Vector2(0,0);
      this.needUpdateGlyphAtlasTexture=true;

    }
    private _init(){
      this.uniforms={
        u_matrix: {value:new Matrix4()},
        u_label_matrix: {value:this.labelPlaneMatrix},
        u_gl_matrix: {value:this.glCoordMatrix},
        u_sdf_map: {value:this.glyphAtlasTexture},
        u_sdf_map_size: {value:this.mapSize},
        u_font_size: {value:this.fontSize},
        u_font_color: {value:this.fontColor},
        u_font_opacity: {value:this.fontOpacity},
        u_halo_width: {value:this.haloWidth},
        u_halo_blur: {value:this.haloBlur},
        u_halo_color: {value:this.haloColor},
        u_debug: {value:0.0},
        u_gamma_scale:{value:0.3}
      }
      this.fragmentShader=  `
            #define SDF_PX 8.0
            #define DEVICE_PIXEL_RATIO 2.0
            #define EDGE_GAMMA 0.105 / DEVICE_PIXEL_RATIO

            uniform sampler2D u_sdf_map;
            uniform float u_gamma_scale;
            uniform vec4 u_font_color;
            uniform float u_font_size;
            uniform float u_font_opacity;
            uniform vec4 u_halo_color;
            uniform float u_halo_width;
            uniform float u_halo_blur;
            uniform bool u_debug;

            varying vec2 v_uv;
            varying float v_gamma_scale;

            void main() {
                // get sdf from atlas
                float dist = texture2D(u_sdf_map, v_uv).a;

                float fontScale = u_font_size / 24.0;
                // lowp float buff = (256.0 - 64.0) / 256.0;
                // highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);

                lowp float buff = (6.0 - u_halo_width / fontScale) / SDF_PX;
                highp float gamma = (u_halo_blur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_gamma_scale);
                
                highp float gamma_scaled = gamma * v_gamma_scale;

                highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

                gl_FragColor = mix(u_font_color * u_font_opacity, u_halo_color, smoothstep(0., .5, 1. - dist)) * alpha;

                if (u_debug) {
                    vec4 debug_color = vec4(1., 0., 0., 1.);
                    gl_FragColor = mix(gl_FragColor, debug_color, 0.5);
                }
            }
      `
      this.vertexShader=  `
            attribute vec2 a_pos;
            attribute vec2 a_tex;
            attribute vec2 a_offset;

            uniform vec2 u_sdf_map_size;
            uniform mat4 u_label_matrix;
            uniform mat4 u_gl_matrix;
            uniform float u_font_size;

            varying vec2 v_uv;
            varying float v_gamma_scale;

            void main() {
                v_uv = a_tex / u_sdf_map_size;

                float fontScale = u_font_size / 24.;

                vec4 projected_pos = u_label_matrix * vec4(a_pos, 0.0, 1.0);
                gl_Position = u_gl_matrix * vec4(projected_pos.xy / projected_pos.w + a_offset * fontScale, 0.0, 1.0);

                v_gamma_scale = gl_Position.w;
            }
      `
    }
   public update (sdfText:SdfText){
    const {glyphAtlas,viewPort}=sdfText;
    const {data,width,height}=glyphAtlas?.image??{}
    this.glyphAtlasTexture = new DataTexture(data,width,height,AlphaFormat);
    this.labelPlaneMatrix=getLabelPlaneMatrix(new Matrix4(),viewPort);
    this.glCoordMatrix=getGlCoordMatrix(viewPort);
   }
}