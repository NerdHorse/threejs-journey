import { GammaCorrectionEffect } from './GammaCorrectionEffect';
import {
  BlendFunction,
  BloomEffect, Effect,
  EffectComposer,
  EffectPass,
  HueSaturationEffect, KernelSize, NoiseEffect,
  RenderPass, ScanlineEffect, SMAAEffect, VignetteEffect,ShaderPass
} from 'postprocessing';
import { HalfFloatType, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import {FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

class RenderComposerManager{
  effects:{
    gammaCorrection:{
      activated: boolean
      effect:GammaCorrectionEffect
    }
    hueSaturation:{
      activated: boolean
      effect:HueSaturationEffect
    }
    bloom:{
      activated: boolean
      effect:BloomEffect

    }
    vignette:{
      activated: boolean
      effect:VignetteEffect

    }
    scanline:{
      activated: boolean
      effect:ScanlineEffect

    }
    noise:{
      activated: boolean
      effect:NoiseEffect

    }
    SMAA:{
      activated: boolean,
      effect: SMAAEffect
    },


  }={
    gammaCorrection:{
      activated: true,
      effect:new GammaCorrectionEffect({
        gamma:0.5
      })
    },
    hueSaturation:{
      activated: true,
      effect:new HueSaturationEffect({
        blendFunction:BlendFunction.NORMAL,
        saturation: 0.2,
        hue:0
      })
    },
    bloom:{
      activated: true,
      effect:new BloomEffect({
        intensity:0.2,
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.MEDIUM,
        luminanceThreshold: 0.54,
        luminanceSmoothing: 0.62,
        mipmapBlur: true,
      })
    },
    vignette:{
      activated: false,
      effect: new VignetteEffect({
        offset: 0.4,
        darkness: 0.65
      }),

    },
    scanline:{
      activated: false,
      effect: new ScanlineEffect({ density: 1.09 }),

    },
    noise:{
      activated: false,
      effect: new NoiseEffect({
        blendFunction: BlendFunction.MULTIPLY
      }),

    },
    SMAA:{
      activated: true,
      effect: new SMAAEffect()
    }
  }
  shaders:{
    FXAA:{
      activated: boolean,
      shaderPass: ShaderPass
    }
  } = {
    FXAA:{
      activated: false,
      // @ts-ignore
      shaderPass: new ShaderPass(FXAAShader)
    }
  }
  composer: EffectComposer;
  renderer:WebGLRenderer;
  currentPass:(EffectPass|ShaderPass)[]|null;
  scene:Scene;
  camera:PerspectiveCamera;
  init(renderer:WebGLRenderer,scene:Scene, camera:PerspectiveCamera){
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera
    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: HalfFloatType
    });
    this.composer.addPass(new RenderPass(this.scene, this.camera));



    this.currentPass = this.createPass();
    if(this.currentPass != null){
      for(let pass of this.currentPass ){
        this.composer.addPass(pass);
      }
    }
  }
  refreshComposer(){
    if(this.currentPass != null){
      for(let pass of this.currentPass ){
        this.composer.removePass(pass);
        pass.dispose();
      }
    }

    this.currentPass = this.createPass();
    if(this.currentPass != null){
      for(let pass of this.currentPass ){
        this.composer.addPass(pass);
      }
    }
  }
  private createPass(){
    let preEffects:Effect[] = [];
    let effects:Effect[] = [];
    for(let k in this.effects){
      if(this.effects[k].activated){
        effects.push(this.effects[k].effect)
        if(this.effects[k].pre){
          preEffects.push(this.effects[k].pre)
        }
      }
    }
    let shaders:ShaderPass[] = [];
    for(let k in this.shaders){
      if(this.shaders[k].activated){
        shaders.push(this.shaders[k].shaderPass)
      }
    }

    if(effects.length == 0 && preEffects.length == 0 && shaders.length == 0){
      return null;
    }
    let pass:(EffectPass|ShaderPass)[] = [];
    for(let pre of preEffects){
      pass.push(new EffectPass(this.camera,pre))
    }
    pass.push(new EffectPass(this.camera,...effects))

    for(let shader of shaders){
      pass.push(shader)
    }
    return pass;
  }
  render(){
    if(this.currentPass == null){
      this.renderer.render(this.scene,this.camera)
    }else{
      this.composer.render()
    }
  }
}
export const RenderComposer = new RenderComposerManager();
