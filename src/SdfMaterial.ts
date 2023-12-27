//@ts-nocheck
import { AlphaFormat, Color, DataTexture, Matrix4, Material, Texture, Vector2, Shader,RGBAFormat, DoubleSide,UnsignedByteType,UVMapping,ClampToEdgeWrapping,ClampToEdgeWrapping,LinearFilter,LinearFilter, Vector3, WebGLRenderer} from "three";
import { getGlCoordMatrix, getLabelPlaneMatrix } from "./utils/symbol-projection";

export class SdfMaterial extends Material{
  public labelPlaneMatrix!:Matrix4;
  public glCoordMatrix!:Matrix4;
  public glyphAtlasTexture!: Texture;
  public needUpdateGlyphAtlasTexture:boolean;
  public get textField() : string {
    return this._textField
  }
  public set textField(v : string) {
    this._textField = v;
    this.dirty=true;
  }
  
  public get fontFamily() : string {
    return this._fontFamily
  }
  
  public set fontFamily(v : string) {
    this._fontFamily = v;
    this.dirty=true;
  }
  
  public get fontWeight() : number {
    return this._fontWeight
  }
  
  public set fontWeight(v : number) {
    this._fontWeight = v;
    this.dirty=true;
  }
  
  public set fontSize(v : number) {
    this._fontSize = v;
    this.dirty=true;
  }
  
  public get fontSize() : number {
    return this._fontSize;
  }
  
  public get fontColor() : Color {
    return this._fontColor
  }
  
  public set fontColor(v : Color) {
    this._fontColor= v;
    this.dirty=true;
  }
  
  public get fontOpacity() : number {
    return this._fontOpacity
  }
  
  public set fontOpacity(v : number) {
    this. _fontOpacity= v;
    this.dirty=true;
  }
  
  public get haloColor() : Color {
    return this._haloColor
  }
  
  public set haloColor(v : Color) {
    this._haloColor = v;
    this.dirty=true;
  }
  
  public get haloWidth() : number {
    return this._haloWidth
  }
  
  public set haloWidth(v : number) {
    this._haloWidth = v;
    this.dirty=true;
  }
  
  public get haloBlur() : number {
    return this._haloBlur
  }
  
  public set haloBlur(v : number) {
    this._haloBlur = v;
    this.dirty=true;
  }
  
  public get mapSize() : Vector2 {
    return this._mapSize;
  }
  
  public set mapSize(v : Vector2) {
    this._mapSize= v;
    this.dirty=true;
  }
  public dirty:boolean;
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
  
    constructor(params:any){
      super()
      const {image,viewport}=params;
      this.updatagLyphAtlasTexture(image)
      this.dirty=true;
      this.labelPlaneMatrix=getLabelPlaneMatrix(viewport);
      this.glCoordMatrix=getGlCoordMatrix(viewport);
      this._textField = 'name';
      this._fontFamily = 'Monaco, monospace';
      this._fontWeight = 400;
      this._fontSize = 14.;
      this._fontColor = new Color(1,0,0);
      this._fontOpacity = 1.0;
      this._haloColor = new Color(1,1,1);
      this._haloWidth = 1.0;
      this._haloBlur = 0.2;
      this.needUpdateGlyphAtlasTexture=true;
      this.setValues();
      this._init();
      this.needsUpdate = true;
      this.depthTest=false;
      this.side=DoubleSide

    }
    private _init(){
      this.uniforms={
        u_sdf_map:{value:this.glyphAtlasTexture},
        u_label_matrix: {value:this.labelPlaneMatrix},
        u_gl_matrix: {value:this.glCoordMatrix},
        u_sdf_map_size: {value:this.mapSize},
        u_font_size: {value:this.fontSize},
        u_font_color: {value:this.fontColor},
        u_font_opacity: {value:this.fontOpacity},
        u_halo_width: {value:this.haloWidth},
        u_halo_blur: {value:this.haloBlur},
        u_halo_color: {value:this.haloColor},
        u_debug: {value:0.0},
        u_gamma_scale:{value:0.8},
      }
      this.fragmentShader=  `
            #define SDF_PX 8.0
            #define DEVICE_PIXEL_RATIO 2.0
            #define EDGE_GAMMA 0.105 / DEVICE_PIXEL_RATIO

            uniform sampler2D u_sdf_map;
            uniform float u_gamma_scale;
            uniform vec3 u_font_color;
            uniform float u_font_size;
            uniform float u_font_opacity;
            uniform vec3 u_halo_color;
            uniform float u_halo_width;
            uniform float u_halo_blur;
            uniform bool u_debug;

            varying vec2 v_uv;
            varying float v_gamma_scale;

            void main() {
                // get sdf from atlas
                float dist = texture2D(u_sdf_map, v_uv).r;
                vec4 test_color = texture2D(u_sdf_map, v_uv);
                float fontScale = u_font_size / 24.0;
                // lowp float buff = (256.0 - 64.0) / 256.0;
                // highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);

                lowp float buff = (6.0 - u_halo_width / fontScale) / SDF_PX;
                highp float gamma = (u_halo_blur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_gamma_scale);
                
                highp float gamma_scaled = gamma * v_gamma_scale;

                highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

                //gl_FragColor = mix(vec4(u_font_color.rgb,1.0) * u_font_opacity, vec4(u_halo_color.rgb,1.0), smoothstep(0., .5, 1. - dist)) * alpha;
                gl_FragColor = vec4(alpha,0.0,0.0,1.0);

                // if (u_debug) {
                //     vec4 debug_color = vec4(1., 0., 0., 1.);
                //     gl_FragColor = mix(gl_FragColor, debug_color, 0.5);
                // }
                //gl_FragColor =vec4(1.0,0.0,0.0,1.0);
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
                //转成裁剪坐标
                vec4 clip_pos=projectionMatrix*modelViewMatrix*vec4(a_pos, 0.0, 1.0);
                //转ndc
                vec2 ndc_pos=clip_pos.xy/clip_pos.w;
                //转屏幕坐标
                vec4 projected_pos = u_label_matrix * vec4(ndc_pos, 0.0, 1.0);
                //转裁剪坐标
                gl_Position = u_gl_matrix * vec4(projected_pos.xy / projected_pos.w + a_offset * fontScale, 0.0, 1.0);
                //gl_Position =projectionMatrix*modelViewMatrix*vec4(a_pos+a_offset * fontScale, 0.0, 1.0);
                v_gamma_scale = gl_Position.w;
            }
      `
    }
    onBeforeCompile(shader: Shader, renderer: WebGLRenderer): void {
        if(this.dirty) this.updateUniforms();
    }
    public updatagLyphAtlasTexture(image){
      const {data,width,height}=image??{};
      let pixels = [].slice.call(data);
      let pixelData=new Array(width*height*4);
      for (let i = 0; i < pixels.length; i++) {
        pixelData[4 * i + 0] = pixels[i];
        pixelData[4 * i + 1] = pixels[i];
        pixelData[4 * i + 2] = pixels[i];
        pixelData[4 * i + 3] = 0.0;
      }
      this._mapSize=new Vector2(width,height);
      this.glyphAtlasTexture =new DataTexture(new Uint8Array(pixelData),width,height,RGBAFormat,UnsignedByteType,UVMapping,ClampToEdgeWrapping,ClampToEdgeWrapping,LinearFilter,LinearFilter);
      this.glyphAtlasTexture.needsUpdate = true;
    }
    private updateUniforms(){
      this.uniforms.u_sdf_map.value=this.glyphAtlasTexture;
      this.uniforms.u_label_matrix.value=this.labelPlaneMatrix;
      this.uniforms.u_gl_matrix.value=this.glCoordMatrix;
      this.uniforms.u_sdf_map_size.value=this.mapSize;
      this.uniforms.u_font_size.value=this.fontSize;
      this.uniforms.u_font_color.value=this.fontColor;
      this.uniforms.u_font_opacity.value=this.fontOpacity;
      this.uniforms.u_halo_width.value=this.haloWidth;
      this.uniforms.u_halo_blur.value=this.haloBlur;
      this.uniforms.u_halo_color.value=this.haloColor;
      this.uniforms.u_debug.value=0.0;
      this.uniforms.u_gamma_scale.value=0.8;
      this.dirty=false;
    }
}