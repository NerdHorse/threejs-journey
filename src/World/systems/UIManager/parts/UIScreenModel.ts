import { UILayer } from './UILayer';
import { MeshBasicMaterial, Object3D, Scene } from 'three';
import { Loader } from '../../Loader/Loader';
import { UIManager } from '../UIManager';

export class UIScreenModel {
  public layers:UILayer[] = [];

  public material = new MeshBasicMaterial();
  public object:Object3D = new Object3D();
  constructor(atlas:string) {
    this.material.map = Loader.files.spriteSheets[atlas].mainTexture;
    this.material.transparent = true;
    this.material.depthTest = false;
    UIManager.container.add(this.object);
  }
  dispose(){
    for(let i = 0;i<this.layers.length;i++){
      UIManager.container.remove(this.object);
      this.layers[i].dispose();
    }
  }
}
