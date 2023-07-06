import { ICharacterUserData } from '../interfaces/ICharacterUserData';
import { ColorMAP } from '../constants/ColorMap';
import { World } from '../World';
import { Utils } from './Utils';
import { Menu } from './GUI';
import { Mesh, Texture } from 'three';
import { Loader } from './Loader';

class TextureComposerClass{

  private canvas:HTMLCanvasElement
  private canvasCtx:CanvasRenderingContext2D
  mainTexture:Texture
  constructor() {


    this.canvas =  <HTMLCanvasElement> document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.canvas.style.width = '1024px';
    this.canvas.style.height = '1024px';

    this.canvasCtx  = this.canvas.getContext('2d', {antialias: false}) as CanvasRenderingContext2D;



    this.mainTexture = new Texture(this.canvas);
    this.mainTexture.needsUpdate = true;

  }
  refreshMainTexture(){
    Menu.removeTextureSize()

    let canvas = this.canvas;
    let ctx = this.canvasCtx;
    canvas.width = Menu.generalData.texture_size;
    canvas.height =  Menu.generalData.texture_size;
    canvas.style.width =  Menu.generalData.texture_size+'px';
    canvas.style.height =  Menu.generalData.texture_size+'px';

    let scale = 1;
    let partsTotal = World.elements.characters.length + ( Menu.generalData.street?1:0);
    let gridSize = 1;
    if(partsTotal > 1){
      let num = Math.ceil(Math.sqrt(partsTotal));
      scale = 1/num;
      gridSize = num;

    }
    ctx.resetTransform()
    ctx.setTransform(1, 0, 0, -1, 0, canvas.height)
    ctx.clearRect(0, 0, canvas.width, canvas.height);



    let offSetIndex = 0;

    if(Menu.generalData.street){
      ctx.drawImage(Loader.files.city.texture.image, 0, 0, scale*canvas.width, scale*canvas.height);
      let geometry = (World.elements.city.children[0] as Mesh).geometry;
      let attribute = Loader.files.city.uvOri.clone();
      for(let i = 0;i<attribute.count;i++){
        attribute.setXY(i,attribute.getX(i) * scale,attribute.getY(i) * scale )
      }
      geometry.setAttribute('uv', attribute);

      offSetIndex++;
    }

    for(let char of World.elements.characters){
      if(char.obj!=null){
        let offset = {
          x: offSetIndex%gridSize,
          y: Math.floor(offSetIndex / gridSize)
        }


        this.characterTextureMaker(char.userData,{x:offset.x* scale*canvas.width, y:offset.y*scale*canvas.height},scale);
        let geometry = (char.obj.children[0].children[0] as Mesh).geometry;
        let attribute = char.uvOri.clone();
        for(let i = 0;i<attribute.count;i++){
          attribute.setXY(i,(attribute.getX(i) * scale) + (offset.x * scale),(attribute.getY(i) * scale) + (offset.y * scale) )
        }
        geometry.setAttribute('uv', attribute);

        offSetIndex++;
      }
    }

    this.mainTexture.needsUpdate=true;
    console.log(canvas.toDataURL('image/png'));
  }
  refreshCharactersTexture(){
    let mustUpdateMain = false;
    for(let i=0;i<World.elements.characters.length && !mustUpdateMain;i++){
      let charData = World.elements.characters [i].userData;
      let charData_ = Menu.generalData.characters.list[i];
      for(let part in charData.colors){
        let code_ = Utils.rgbToHex(charData_.colors[part].r,charData_.colors[part].g,charData_.colors[part].b)
        if(charData.colors[part] != code_){
          mustUpdateMain = true;
          World.elements.characters[i].userData.colors[part] = code_;
          //console.log(code_);
        }
      }

      if(!mustUpdateMain){
        for(let part in charData.patterns){
          if(charData.patterns[part] != charData_.patterns[part]){
            mustUpdateMain = true;
            charData.patterns[part] = charData_.patterns[part];
          }
        }
      }

    }
    if(mustUpdateMain){
      this.refreshMainTexture();
    }
  }
  characterTextureMaker(characterData:ICharacterUserData,offset:{x:number,y:number},scale:number){
    let ctx = this.canvasCtx;

    scale = scale * (this.canvas.width / Loader.files.character.textures.legL[0].image.width);

    ctx.beginPath();
    ctx.rect(offset.x+(232*scale), offset.y+(600*scale), 482*scale, 424*scale);
    ctx.rect(offset.x+(654*scale), offset.y+(564*scale), 370*scale, 460*scale);
    ctx.fillStyle = characterData.colors.body;
    ctx.fill();


    ctx.beginPath();
    ctx.rect(offset.x+(655*scale), offset.y, 369*scale, 564*scale);
    ctx.fillStyle = characterData.colors.pants1;
    ctx.fill();


    ctx.beginPath();
    ctx.rect(offset.x, offset.y, 654*scale, 408*scale);
    ctx.fillStyle = characterData.colors.shirt1;
    ctx.fill();

    if(characterData.patterns.legL >= 0){
      ctx.drawImage(
        Loader.files.character.textures.legL[characterData.patterns.legL].image,
        offset.x,
        offset.y,
        Loader.files.character.textures.legL[characterData.patterns.legL].image.width*scale,
        Loader.files.character.textures.legL[characterData.patterns.legL].image.height*scale
      )
    }
    if(characterData.patterns.legR >= 0){
      ctx.drawImage(
        Loader.files.character.textures.legR[characterData.patterns.legR].image,
        offset.x,
        offset.y,
        Loader.files.character.textures.legR[characterData.patterns.legR].image.width*scale,
        Loader.files.character.textures.legR[characterData.patterns.legR].image.height*scale
      )
    }
    if(characterData.patterns.armR >= 0){
      ctx.drawImage(
        Loader.files.character.textures.armR[characterData.patterns.armR].image,
        offset.x,
        offset.y,
        Loader.files.character.textures.armR[characterData.patterns.armR].image.width*scale,
        Loader.files.character.textures.armR[characterData.patterns.armR].image.height*scale
      )
    }
    if(characterData.patterns.armL >= 0){
      ctx.drawImage(
        Loader.files.character.textures.armL[characterData.patterns.armL].image,
        offset.x,
        offset.y,
        Loader.files.character.textures.armL[characterData.patterns.armL].image.width*scale,
        Loader.files.character.textures.armL[characterData.patterns.armL].image.height*scale
      )
    }
    if(characterData.patterns.shirt >= 0){
      ctx.drawImage(
        Loader.files.character.textures.shirt[characterData.patterns.shirt].image,
        offset.x,
        offset.y,
        Loader.files.character.textures.shirt[characterData.patterns.shirt].image.width*scale,
        Loader.files.character.textures.shirt[characterData.patterns.shirt].image.height*scale
      )
    }
    if(characterData.patterns.pants >= 0){
      ctx.drawImage(
        Loader.files.character.textures.pants[characterData.patterns.pants].image,
        offset.x,
        offset.y,
        Loader.files.character.textures.pants[characterData.patterns.pants].image.width*scale,
        Loader.files.character.textures.pants[characterData.patterns.pants].image.height*scale
      )
    }


    let init = {
      x: offset.x+(32*scale),
      y: offset.y+(600*scale)
    }
    let squareSize = 40*scale;

    for(let y=0;y<ColorMAP.length;y++){
      for(let x=0;x<ColorMAP[y].length;x++){
        if(Object.prototype.hasOwnProperty.call(characterData.colors,ColorMAP[y][x])){
          ctx.beginPath();
          ctx.rect(init.x + ( x * squareSize ), init.y + ( y * squareSize ), squareSize, squareSize);
          // @ts-ignore
          ctx.fillStyle = characterData.colors[ColorMAP[y][x]];
          ctx.fill();
        }
      }
    }
  }

  updateTextureSize(size:number){

    this.canvas =  <HTMLCanvasElement> document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.width = size+'px';
    this.canvas.style.height = size+'px';
    this.canvasCtx  = this.canvas.getContext('2d', {antialias: false}) as CanvasRenderingContext2D;

    this.mainTexture.image = this.canvas;

    this.mainTexture.needsUpdate = true;
  }
}
export const TextureComposer = new TextureComposerClass()
