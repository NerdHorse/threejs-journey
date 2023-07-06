import { GammaCorrectionEffect } from './GammaCorrectionEffect';
import {
  BlendFunction,
  BloomEffect, Effect,
  EffectComposer,
  EffectPass,
  HueSaturationEffect, KernelSize, NoiseEffect,
  RenderPass, ScanlineEffect, VignetteEffect,
} from 'postprocessing';
import { HalfFloatType, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

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


  }={
    gammaCorrection:{
      activated: false,
      effect:new GammaCorrectionEffect({
        gamma:0.5
      })
    },
    hueSaturation:{
      activated: false,
      effect:new HueSaturationEffect({
        blendFunction:BlendFunction.NORMAL,
        saturation: 0,
        hue:0
      })
    },
    bloom:{
      activated: false,
      effect:new BloomEffect({
        intensity: 1.6,
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.MEDIUM,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 1,
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

    }

  }
  composer: EffectComposer;
  renderer:WebGLRenderer;
  currentPass:EffectPass|null;
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
      this.composer.addPass(this.currentPass);
    }
  }
  refreshComposer(){
    if(this.currentPass != null){
      this.composer.removePass(this.currentPass);
    }

    this.currentPass = this.createPass();
    if(this.currentPass != null){
      this.composer.addPass(this.currentPass);
    }
  }
  private createPass(){
    let effects:Effect[] = [];
    for(let k in this.effects){
      if(this.effects[k].activated){
        effects.push(this.effects[k].effect)
      }
    }
    if(effects.length == 0){
      return null;
    }
    return new EffectPass(this.camera,...effects);
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
