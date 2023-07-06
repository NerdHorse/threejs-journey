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
      if(partsTotal <=4 ){
        scale = 1/2
        gridSize = 2;
      }else if(partsTotal <= 9){
        scale = 1/3
        gridSize = 3;
      }else if(partsTotal <= 16){
        scale = 1/4
        gridSize = 4;
      }else if(partsTotal <= 25){
        scale = 1/5
        gridSize = 5;
      }else if(partsTotal <= 36){
        scale = 1/6
        gridSize = 6;
      }else if(partsTotal <= 49){
        scale = 1/7
        gridSize = 7;
      }else if(partsTotal <= 64){
        scale = 1/8
        gridSize = 8;
      }else if(partsTotal <= 81){
        scale = 1/9
        gridSize = 9;
      }else{
        scale = 1/10
        gridSize = 10;
      }
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
        ctx.drawImage(char.canvas, offset.x* scale*canvas.width, offset.y*scale*canvas.height, scale*canvas.width, scale*canvas.height);
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
    for(let i=0;i<World.elements.characters.length;i++){
      let charData = World.elements.characters [i].userData;
      let mustUpdate = false;
      let charData_ = Menu.generalData.characters.list[i];
      for(let part in charData.colors){
        let code_ = Utils.rgbToHex(charData_.colors[part].r,charData_.colors[part].g,charData_.colors[part].b)
        if(charData.colors[part] != code_){
          mustUpdateMain = true;
          mustUpdate =true;
          World.elements.characters[i].userData.colors[part] = code_;
          //console.log(code_);
        }
      }

      if(!mustUpdate){
        for(let part in charData.patterns){
          if(charData.patterns[part] != charData_.patterns[part]){
            mustUpdateMain = true;
            mustUpdate =true;
            charData.patterns[part] = charData_.patterns[part];
          }
        }
      }


      if(mustUpdate){
        this.characterTextureMaker(World.elements.characters[i].userData,World.elements.characters [i].canvas,World.elements.characters [i].canvasCtx);
      }
    }
    if(mustUpdateMain){
      this.refreshMainTexture();
    }
  }
  characterTextureMaker(characterData:ICharacterUserData,canvas?:HTMLCanvasElement, ctx?:CanvasRenderingContext2D):{canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D}{
    canvas = canvas?canvas: <HTMLCanvasElement> document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    canvas.style.width = '1024px';
    canvas.style.height = '1024px';

    ctx=ctx?ctx: canvas.getContext('2d', {antialias: false}) as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ctx.transform(1, 0, 0, -1, 0, canvas.height)
    if(ctx == null){
      return {canvas,ctx};
    }

    ctx.beginPath();
    ctx.rect(232, 600, 482, 424);
    ctx.rect(654, 564, 370, 460);
    ctx.fillStyle = characterData.colors.body;
    ctx.fill();


    ctx.beginPath();
    ctx.rect(655, 0, 369, 564);
    ctx.fillStyle = characterData.colors.pants1;
    ctx.fill();


    ctx.beginPath();
    ctx.rect(0, 0, 654, 408);
    ctx.fillStyle = characterData.colors.shirt1;
    ctx.fill();

    if(characterData.patterns.legL >= 0){
      ctx.drawImage(Loader.files.character.textures.legL[characterData.patterns.legL].image,0,0,canvas.width,canvas.height)
    }
    if(characterData.patterns.legR >= 0){
      ctx.drawImage(Loader.files.character.textures.legR[characterData.patterns.legR].image,0,0,canvas.width,canvas.height)
    }
    if(characterData.patterns.armR >= 0){
      ctx.drawImage(Loader.files.character.textures.armR[characterData.patterns.armR].image,0,0,canvas.width,canvas.height)
    }
    if(characterData.patterns.armL >= 0){
      ctx.drawImage(Loader.files.character.textures.armL[characterData.patterns.armL].image,0,0,canvas.width,canvas.height)
    }
    if(characterData.patterns.shirt >= 0){
      ctx.drawImage(Loader.files.character.textures.shirt[characterData.patterns.shirt].image,0,0,canvas.width,canvas.height)
    }
    if(characterData.patterns.pants >= 0){
      ctx.drawImage(Loader.files.character.textures.pants[characterData.patterns.pants].image,0,0,canvas.width,canvas.height)
    }


    let init = {
      x: 32,
      y: 600
    }
    let squareSize = 40;

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
    return {canvas,ctx};
  }
}
export const TextureComposer = new TextureComposerClass()