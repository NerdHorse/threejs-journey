import { PlaneGeometry, Texture } from 'three';
import { BufferGeometry } from 'three/src/core/BufferGeometry';

export default class TextureAtlas {
  private _textures:{[k:string]:Texture}
  private frames:{
    [k:string]:
      {
        "frame": {"x":number,"y":number,"w":number,"h":number},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":number,"y":number,"w":number,"h":number},
        "sourceSize": {"w":number,"h":number}
      }
  }
  mainTexture:Texture
  constructor(json:{[k:string]:any}, private image:HTMLImageElement) {
    this._textures = {};
    this.mainTexture = new Texture(this.image);
    this.mainTexture.needsUpdate = true;

    this.frames = json.frames;

    for(let key in this.frames){
      let t = this.mainTexture.clone();
      let data = this.frames[key].frame;
      t.repeat.set(data.w / this.image.width, data.h / this.image.height);
      t.offset.x = ((data.x) / this.image.width);
      t.offset.y = 1 - (data.h / this.image.height) - (data.y / this.image.height);
      t.needsUpdate = true;
      this._textures[key.replace('.png', '').toLowerCase()] = t;
    }
    console.log(this._textures)
  }

  getTexture(id) {
    return this._textures[id];
  }
  getGeometry(id:string):{geometry:BufferGeometry,size:{w:number, h:number}}{
    id = id .replace('.png', '').toLowerCase();


    for(let key in this.frames){
      let name =key.replace('.png', '').toLowerCase();
      if(name == id){

        let data = this.frames[key].frame;

        var geometry = new PlaneGeometry( data.w/100, data.h/100, 1, 1 );


        let offset={
          x : data.x / this.image.width,
          y : 1 - (data.h / this.image.height) - (data.y / this.image.height)
        }

        let attribute = geometry.getAttribute("uv");
        attribute.setXY(0,offset.x,offset.y+(data.h / this.image.height))
        attribute.setXY(1,offset.x+(data.w / this.image.width),offset.y+(data.h / this.image.height))
        attribute.setXY(2,offset.x,offset.y)
        attribute.setXY(3,offset.x+(data.w / this.image.width),offset.y)
        console.log(geometry)

        return {geometry,size:{w:data.w/100, h:data.h/100}};

      }
    }
    return null;

  }
}
