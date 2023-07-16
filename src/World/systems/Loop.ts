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
import { UIManager } from './UIManager/UIManager';

interface LoopTypes {
  camera: PerspectiveCamera | OrthographicCamera;
  scene: Scene;
  renderer: WebGLRenderer | WebGL1Renderer;
}

const clock = new Clock();
class Loop {
  camera: LoopTypes['camera'];
  scene: LoopTypes['scene'];
  renderer: LoopTypes['renderer'];
  private mixers: (AnimationMixer|CharacterControls|FlowersManager)[];
  private controls: (CustomOrbitControls|UIManager)[];
  stats: Stats;

  constructor({ camera, scene, renderer }: LoopTypes) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.mixers = [];
    this.controls = [];
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);
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


  addControls(control:CustomOrbitControls|UIManager){
    this.controls.push(control);
  }
  removeControls(control_:CustomOrbitControls|UIManager){
    let newControls:(CustomOrbitControls|UIManager)[] = [];
    for (const control of this.controls) {
      if(control != control_){
        newControls.push(control)
      }
    }
    this.controls = newControls;
  }
  start() {
    gsap.ticker.add(() => {
      this.tick();
      RenderComposer.render()
      this.stats.update();
    })
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
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
