import {
  AnimationMixer,
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGL1Renderer,
  WebGLRenderer,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { mix } from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements';
import { EffectComposer } from 'postprocessing';
import { RenderComposer } from './RenderComposer';
import gsap from "gsap";
import { CharacterControls } from './CharacterControls';
import { FlowersManager } from '../components/FlowersManager';
import { CustomOrbitControls } from './CustomOrbitControls';
import { UIManagerClass } from './UIManager/UIManager';
import { World } from '../World';



const clock = new Clock();
class Loop {
  private mixers: (AnimationMixer|CharacterControls|FlowersManager)[];
  private controls: (CustomOrbitControls|UIManagerClass)[];
  stats: Stats;

  constructor() {
    this.mixers = [];
    this.controls = [];
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);
    gsap.ticker.remove(gsap.updateRoot);
  }

  addMixer(mixer:AnimationMixer|CharacterControls|FlowersManager){
    this.mixers.push(mixer);
  }
  removeMixer(mixer_:AnimationMixer|CharacterControls|FlowersManager){
    let newMixers:(AnimationMixer|CharacterControls|FlowersManager)[] = [];
    for (const mixer of this.mixers) {
      if(mixer != mixer_){
        newMixers.push(mixer)
      }
    }
    this.mixers = newMixers;
  }


  addControls(control:CustomOrbitControls|UIManagerClass){
    this.controls.push(control);
  }
  removeControls(control_:CustomOrbitControls|UIManagerClass){
    let newControls:(CustomOrbitControls|UIManagerClass)[] = [];
    for (const control of this.controls) {
      if(control != control_){
        newControls.push(control)
      }
    }
    this.controls = newControls;
  }
  start() {
    let this_ = this;
    World.renderer.setAnimationLoop(  () =>{
      this_.tick();
      RenderComposer.render()
      this_.stats.update();
      World.renderer.xr.getCamera().position.copy( World.elements.camera.position);
      World.renderer.xr.updateCamera( World.camera)
    } );

  }

  stop() {
    World.renderer.setAnimationLoop(null);
  }

  tick() {
    gsap.updateRoot(clock.elapsedTime);
    const delta: number = clock.getDelta();
    for (const mixer of this.mixers) {
      mixer.update(delta);
    }
    for (const control of this.controls) {
      control.update();
    }
  }
}

export { Loop };
