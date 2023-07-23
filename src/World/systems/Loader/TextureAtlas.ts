import { PlaneGeometry, Texture } from 'three';
import { BufferGeometry } from 'three/src/core/BufferGeometry';

export default class TextureAtlas {
  private _textures:{[k:string]:Texture}
  mainTexture:Texture
  frames:{
    [k:string]:
      {
        "frame": {"x":number,"y":number,"w":number,"h":number},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":number,"y":number,"w":number,"h":number},
        "sourceSize": {"w":number,"h":number}
      }
  }={};
  width:number;
  height:number;
  constructor(json:{[k:string]:any}, private image:HTMLImageElement) {
    this._textures = {};
    this.width = this.image.width;
    this.height = this.image.height;
    this.mainTexture = new Texture(this.image);
    this.mainTexture.needsUpdate = true;
    let frames = json.frames;
    for(let key in frames){
      this.frames[key.replace('.png', '').toLowerCase()] = frames[key]
    }
  }

  getTexture(frame) {
    if(!this._textures.hasOwnProperty(frame) || this._textures[frame] == null){
      let t = this.mainTexture.clone();
      let data = this.frames[frame].frame;
      t.repeat.set(data.w / this.image.width, data.h / this.image.height);
      t.offset.x = ((data.x) / this.image.width);
      t.offset.y = 1 - (data.h / this.image.height) - (data.y / this.image.height);
      t.needsUpdate = true;
      this._textures[frame.replace('.png', '').toLowerCase()] = t;
    }
    return this._textures[frame];
  }
  dispose(){
    this.mainTexture.dispose();
    for(let k in this._textures){
      this._textures[k].dispose();
      delete this._textures[k];
    }
    this.mainTexture=null;
    this._textures = null;
  }

}
