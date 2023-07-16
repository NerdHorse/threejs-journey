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


    this.refreshCanvas();

  }
  refreshMainTexture(){

    let canvas = this.canvas;
    let ctx = this.canvasCtx;

    let scale = 1;
    let partsTotal = World.elements.characters.length + ( Menu.generalData.street || Menu.generalData.instanceMesh.total > 0?1:0);
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

    if(Menu.generalData.street || Menu.generalData.instanceMesh.total > 0){

      ctx.drawImage(Loader.files.city.texture, 0, 0, scale*canvas.width, scale*canvas.height);
      let geometry = (World.elements.city.noOutline.children[0] as Mesh).geometry;
      let attribute = Loader.files.city.noOutline.uvOri.clone();
      for(let i = 0;i<attribute.count;i++){
        attribute.setXY(i,attribute.getX(i) * scale,attribute.getY(i) * scale )
      }
      geometry.setAttribute('uv', attribute);



      geometry = (World.elements.city.withOutline.children[0] as Mesh).geometry;
      attribute = Loader.files.city.withOutline.uvOri.clone();
      for(let i = 0;i<attribute.count;i++){
        attribute.setXY(i,attribute.getX(i) * scale,attribute.getY(i) * scale )
      }
      geometry.setAttribute('uv', attribute);


      geometry = World.elements.flowers.flowerSimple.geometry;
      attribute = Loader.files.flower.noOutline.uvOri.clone();
      for(let i = 0;i<attribute.count;i++){
        attribute.setXY(i,attribute.getX(i) * scale,attribute.getY(i) * scale )
      }
      geometry.setAttribute('uv', attribute);


      geometry = World.elements.flowers.flowerOutline1.geometry;
      attribute = Loader.files.flower.withOutline.uvOri.clone();
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
        let geometry = (char.obj.children[0] as Mesh).geometry;
        let attribute = char.uvOri.clone();
        for(let i = 0;i<attribute.count;i++){
          if(attribute.getX(i) != 0.0000000001 || attribute.getY(i) !=0.0000000001){
            attribute.setXY(i,(attribute.getX(i) * scale) + (offset.x * scale),(attribute.getY(i) * scale) + (offset.y * scale) )
          }
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

    scale = scale * (this.canvas.width / Loader.files.character.textures.legL[0].width);

    ctx.beginPath();
    ctx.rect(
      offset.x,
      offset.y,
      Loader.files.character.textures.legL[0].width*scale,
      Loader.files.character.textures.legL[0].height*scale
    );
    ctx.fillStyle = "#000000";
    ctx.fill();

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
        Loader.files.character.textures.legL[characterData.patterns.legL],
        offset.x,
        offset.y,
        Loader.files.character.textures.legL[characterData.patterns.legL].width*scale,
        Loader.files.character.textures.legL[characterData.patterns.legL].height*scale
      )
    }
    if(characterData.patterns.legR >= 0){
      ctx.drawImage(
        Loader.files.character.textures.legR[characterData.patterns.legR],
        offset.x,
        offset.y,
        Loader.files.character.textures.legR[characterData.patterns.legR].width*scale,
        Loader.files.character.textures.legR[characterData.patterns.legR].height*scale
      )
    }
    if(characterData.patterns.armR >= 0){
      ctx.drawImage(
        Loader.files.character.textures.armR[characterData.patterns.armR],
        offset.x,
        offset.y,
        Loader.files.character.textures.armR[characterData.patterns.armR].width*scale,
        Loader.files.character.textures.armR[characterData.patterns.armR].height*scale
      )
    }
    if(characterData.patterns.armL >= 0){
      ctx.drawImage(
        Loader.files.character.textures.armL[characterData.patterns.armL],
        offset.x,
        offset.y,
        Loader.files.character.textures.armL[characterData.patterns.armL].width*scale,
        Loader.files.character.textures.armL[characterData.patterns.armL].height*scale
      )
    }
    if(characterData.patterns.shirt >= 0){
      ctx.drawImage(
        Loader.files.character.textures.shirt[characterData.patterns.shirt],
        offset.x,
        offset.y,
        Loader.files.character.textures.shirt[characterData.patterns.shirt].width*scale,
        Loader.files.character.textures.shirt[characterData.patterns.shirt].height*scale
      )
    }
    if(characterData.patterns.pants >= 0){
      ctx.drawImage(
        Loader.files.character.textures.pants[characterData.patterns.pants],
        offset.x,
        offset.y,
        Loader.files.character.textures.pants[characterData.patterns.pants].width*scale,
        Loader.files.character.textures.pants[characterData.patterns.pants].height*scale
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

  private refreshCanvas(){

    this.canvas =  <HTMLCanvasElement> document.createElement('canvas');
    this.canvas .width = Menu.generalData.texture.size;
    this.canvas .height =  Menu.generalData.texture.size;
    this.canvas .style.width =  Menu.generalData.texture.size+'px';
    this.canvas .style.height =  Menu.generalData.texture.size+'px';

    this.canvasCtx  = this.canvas.getContext('2d', {antialias: false,alpha:false}) as CanvasRenderingContext2D;
    if(this.mainTexture != null){
      this.mainTexture.dispose();
      this.mainTexture= null;
    }
    this.mainTexture = new Texture(this.canvas);
    this.mainTexture.needsUpdate = true;
  }
  updateTextureSize(size:number){

    this.refreshCanvas();


    for(let k in World.materials.types){
      if(k != 'outline'){
        World.materials.types[k].map = this.mainTexture;
        World.materials.types[k].needsUpdate = true;
      }
    }
    World.elements.textureViewer.material.map = this.mainTexture;
    World.elements.textureViewer.material.needsUpdate = true;
    this.refreshMainTexture();
  }
}
export const TextureComposer = new TextureComposerClass()
