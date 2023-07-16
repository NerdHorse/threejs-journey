import { IUIElements } from '../../interfaces/UIManager/IUIElements';
import { BufferAttribute, Mesh, MeshBasicMaterial } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Loader } from '../Loader';
import { Anchor } from '../../enums/Anchor';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { UIElementType } from '../../enums/UIElementType';
import { Origin } from '../../enums/Origin';
import { UIElementStage } from '../../enums/UIElementStage';

const ATTRIBUTE_ELEMENT_ID = "element_id";
export class UILayer{
  private elements:{
    [k:string]:IUIElements[]
  }={}

  object:Mesh = null;
  private nextId_ = 0;
  private created:boolean = false;
  constructor(
    private atlas:string,
    private material:MeshBasicMaterial,
    private zindex:number,
    private size:{w:number,h:number} = {w:window.innerWidth/100,h:window.innerHeight/100}
  ) {

  }
  private get nextId(){
    this.nextId_++;

    return this.nextId_;
  }
  /*
      A                          B
    +---+----------------------+---+
  C |   |                      |   |
    +---+----------------------+---+
    |   |                      |   |
    |   |                      |   |
    |   |                      |   |
    +---+----------------------+---+
  D |   |                      |   |
    +---+----------------------+---+
   */
  addNineSlice(
    name:string,
    frame:string,
    x:number,
    y:number,
    width:number,
    height:number,
    leftWidth:number=10, // size of the left vertical bar (A)
    topHeight:number=10, // size of the top horizontal bar (C)
    rightWidth:number=10, // size of the right vertical bar (B)
    bottomHeight:number=10, // size of the bottom horizontal bar (D)
    scale:number =1,
    anchor:Anchor = Anchor.MIDDLE,
    parentOrigin:Origin = Origin.MIDDLE,
  ){

  }
  addSprite(
    settings: {
      name: string,
      frames: {
        default: {
          normal: string,
          pressed?: string,
        },
        disabled?: {
          normal: string,
          pressed?: string,
        },
        custom?: {
          normal: string,
          pressed?: string,
        }
      },
      x?: number,
      y?: number,
      scale?: number,
      anchor?: Anchor,
      origin?: Origin,
      isButton?: boolean,
      callbacks?:{
        up:()=>void
        down:()=>void
        move?:()=>void
      }
    }
  )
  {





    let x = settings.x ? settings.x/100 : 0;
    let y = settings.y ? settings.y/100*-1 : 0;


    if(!this.elements.hasOwnProperty(settings.name) || this.elements[settings.name] == null){
      this.elements[settings.name] = [];
    }

    let data:IUIElements = {
      id:this.nextId,
      type:UIElementType.SPRITE,
      data:{
        frames:settings.frames,
        x:x,
        y:y,
        scale:settings.scale ? settings.scale : 1,
        anchor:settings.anchor ? settings.anchor : Anchor.MIDDLE,
        origin:settings.origin ? settings.origin : Origin.MIDDLE,
      },
      state:UIElementStage.DEFAULT,
      isButton:settings.isButton ? settings.isButton : false,
      isPressed:false
    };
    if(settings.callbacks){
      data.callbacks = settings.callbacks;
    }
    this.elements[settings.name].push(data)


  }

  makeSpriteGeometry(
    id:number,
    frame:string,
     x:number,
     y:number,
     scale:number,
     anchor:Anchor,
     origin:Origin
  ){
    let geometry:{geometry:BufferGeometry,size:{w:number, h:number}} = Loader.files.spriteSheets[this.atlas].getGeometry(frame);


    if(geometry == null){
      return;
    }

    geometry.geometry.scale(scale,scale,scale)
    let attributeCount = geometry.geometry.getAttribute("position").count;
    let array:number[] = [];
    for(let i=0;i<attributeCount;i++){
      array.push(id)
    }
    geometry.geometry.setAttribute(ATTRIBUTE_ELEMENT_ID,new BufferAttribute(  new Float32Array( array), 1 ))

    let anchorOffset = {
      x:0,
      y:0
    }
    let originOffset = {
      x:0,
      y:0
    }
    switch (anchor){
      case Anchor.TOP_LEFT:
        anchorOffset.x = geometry.size.w/2;
        anchorOffset.y = -geometry.size.h/2;
        break;
      case Anchor.TOP_RIGHT:
        anchorOffset.x = -geometry.size.w/2;
        anchorOffset.y = -geometry.size.h/2;
        break;
      case Anchor.BOTTOM_LEFT:
        anchorOffset.x = geometry.size.w/2;
        anchorOffset.y = geometry.size.h/2;
        break;
      case Anchor.BOTTOM_RIGHT:
        anchorOffset.x = -geometry.size.w/2;
        anchorOffset.y = geometry.size.h/2;
        break;
    }
    anchorOffset.x *= scale;
    anchorOffset.y *= scale;
    switch (origin){
      case Origin.TOP_LEFT:
        originOffset.x = -this.size.w/2;
        originOffset.y = this.size.h/2;
        break;
      case Origin.TOP_RIGHT:
        originOffset.x = this.size.w/2;
        originOffset.y = this.size.h/2;
        break;
      case Origin.BOTTOM_LEFT:
        originOffset.x = -this.size.w/2;
        originOffset.y = -this.size.h/2;
        break;
      case Origin.BOTTOM_RIGHT:
        originOffset.x = this.size.w/2;
        originOffset.y = -this.size.h/2;
        break;
    }
    geometry.geometry.translate(x+anchorOffset.x+originOffset.x,y+anchorOffset.y+originOffset.y,0)

    return geometry.geometry;
  }

  create(){
    if(this.created) return;

    let geometry:BufferGeometry = null;
    for(let k in this.elements){
      for(let i = 0;i< this.elements[k].length;i++){

        let element = this.elements[k][i];
        let newGeometry = null;

        switch (element.type){
          case UIElementType.SPRITE:

            let stage = element.data.frames[element.state] ? element.state : UIElementStage.DEFAULT;

            let frame = element.data.frames[stage][element.isPressed?"pressed":"normal"] ? element.data.frames[stage][element.isPressed?"pressed":"normal"] : element.data.frames[stage].normal;
            newGeometry = this.makeSpriteGeometry(
              element.id,
              frame,
              element.data.x,
              element.data.y,
              element.data.scale,
              element.data.anchor,
              element.data.origin
            )
            break;
          case UIElementType.NINE_SLICE:
            break;

        }
        if(newGeometry != null){
          if(geometry == null){
            geometry = newGeometry;
          }else{
            geometry = BufferGeometryUtils.mergeBufferGeometries([geometry,newGeometry])
          }
        }
      }
    }
    if(geometry!= null){
      this.created = true;
      this.object = new Mesh(geometry,this.material);
      this.object.renderOrder = this.zindex;
    }
  }

  getElementByVertices(vertices:{a:number,b:number,c:number}){
    let id =this.object.geometry.getAttribute(ATTRIBUTE_ELEMENT_ID).getX(vertices.a);

    for(let k in this.elements) {
      for (let i = 0; i < this.elements[k].length; i++) {
        let element = this.elements[k][i];
        if(element.id == id){
          return element;
        }
      }
    }
    return null
  }
  getElementByID(id:number){
    for(let k in this.elements) {
      for (let i = 0; i < this.elements[k].length; i++) {
        let element = this.elements[k][i];
        if(element.id == id){
          return element;
        }
      }
    }
    return
  }



  setElementsState(name:string,state:UIElementStage){
    if(this.elements[name]){
      for (let i = 0; i < this.elements[name].length; i++) {
        let element = this.elements[name][i];

        element.state = state;
      }
    }
    if(this.created){
      this.updateUvs();
    }
  }
  setElementsPressed(name:string,isPressed:boolean){
    if(this.elements[name]){
      for (let i = 0; i < this.elements[name].length; i++) {
        let element = this.elements[name][i];
        element.isPressed = isPressed;
      }
    }
    if(this.created){
      this.updateUvs();
    }
  }
  private updateUvs(){

  }

  setElementsCallbacks(
    name:string,
    callbacks:{
      up:(pointerId:number)=>void
      down:(pointerId:number)=>void
      move?:(pointerId:number)=>void
    }
  ){
    if(this.elements[name]){
      for (let i = 0; i < this.elements[name].length; i++) {
        let element = this.elements[name][i];
        element.callbacks = callbacks;
      }
    }
  }

}
