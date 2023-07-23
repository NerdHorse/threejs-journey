import { IUIElement } from '../../../interfaces/UIManager/IUIElement';
import { BufferAttribute, Mesh, MeshBasicMaterial } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Loader } from '../../Loader/Loader';
import { Anchor } from '../../../enums/Anchor';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { UIElementType } from '../../../enums/UIElementType';
import { Origin } from '../../../enums/Origin';
import { UIElementStage } from '../../../enums/UIElementStage';
import { UIGeometry } from './UIGeometry';
import { UIScaleDivider } from '../../../constants/UIScaleDivider';

const ATTRIBUTE_ELEMENT_ID = "element_id";
const ATTRIBUTE_ELEMENT_VERTEX_ORDER = "vertex_index";
export class UILayer{
  private elements:{
    [k:string]:IUIElement
  }={}

  object:Mesh = null;
  private nextId_ = 0;
  private created:boolean = false;
  constructor(
    public atlas:string,
    public material:MeshBasicMaterial,
    public zIndex:number,
    private size:{w:number,h:number} = {w:window.innerWidth/UIScaleDivider,h:window.innerHeight/UIScaleDivider}
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
      size:{
        width:number,
        height:number,
      },
      margins:{
        leftWidth:number, // size of the left vertical bar (A)
        topHeight:number, // size of the top horizontal bar (C)
        rightWidth:number, // size of the right vertical bar (B)
        bottomHeight:number, // size of the bottom horizontal bar (D)
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
  ){
    let x = settings.x!=null ? settings.x/UIScaleDivider : 0;
    let y = settings.y!=null ? settings.y/UIScaleDivider*-1 : 0;


    let data:IUIElement = {
      id:this.nextId,
      type:UIElementType.NINE_SLICE,
      data:{
        frames:settings.frames,
        x:x,
        y:y,
        scale:settings.scale!=null ? settings.scale : 1,
        anchor:settings.anchor!=null ? settings.anchor : Anchor.MID_MIDDLE,
        origin:settings.origin!=null ? settings.origin : Origin.MIDDLE,
        margins:settings.margins,
        size:settings.size
      },
      state:UIElementStage.DEFAULT,
      isButton:settings.isButton ? settings.isButton : false,
      isPressed:false,
      attributeIndexes:[]
    };
    if(settings.callbacks){
      data.callbacks = settings.callbacks;
    }
    this.elements[settings.name] = data;


    if(this.created){
      this.object.geometry.dispose();
      this.created = false;
      this.create();
    }



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

    let x = settings.x!=null ? settings.x/UIScaleDivider : 0;
    let y = settings.y!=null ? settings.y/UIScaleDivider*-1 : 0;


    let data:IUIElement = {
      id:this.nextId,
      type:UIElementType.SPRITE,
      data:{
        frames:settings.frames,
        x:x,
        y:y,
        scale:settings.scale!=null ? settings.scale : 1,
        anchor:settings.anchor!=null ? settings.anchor : Anchor.MID_MIDDLE,
        origin:settings.origin!=null ? settings.origin : Origin.MIDDLE,
      },
      attributeIndexes:[],
      state:UIElementStage.DEFAULT,
      isButton:settings.isButton ? settings.isButton : false,
      isPressed:false
    };
    if(settings.callbacks){
      data.callbacks = settings.callbacks;
    }
    this.elements[settings.name] = data;

    if(this.created){
      this.object.geometry.dispose();
      this.created = false;
      this.create();
    }

  }


  private setGeometry(
    id:number,
    geometry:BufferGeometry,
    x:number,
    y:number,
    origin: Origin
  ){
    let attributeCount = geometry.getAttribute("position").count;
    let arrayID:number[] = [];
    let arrayVertex:number[] = [];
    for(let i=0;i<attributeCount;i++){
      arrayID.push(id)
      arrayVertex.push(i)
    }
    geometry.setAttribute(ATTRIBUTE_ELEMENT_ID,new BufferAttribute(  new Int16Array( arrayID), 1 ));
    geometry.setAttribute(ATTRIBUTE_ELEMENT_VERTEX_ORDER,new BufferAttribute(  new Int16Array( arrayVertex), 1 ));
    let originOffset = {
      x:0,
      y:0
    }
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
    geometry.translate(x+originOffset.x,y+originOffset.y,0)
  }

  create(){
    if(this.created) return;

    let mainGeometry:BufferGeometry = null;
    for(let k in this.elements){
      let element = this.elements[k];
      let elementGeometry:BufferGeometry = null;

      let stage = element.data.frames[element.state] ? element.state : UIElementStage.DEFAULT;
      let frame = element.data.frames[stage][element.isPressed?"pressed":"normal"] ? element.data.frames[stage][element.isPressed?"pressed":"normal"] : element.data.frames[stage].normal;
      let atlas = Loader.files.spriteSheets[this.atlas];
      switch (element.type){
        case UIElementType.SPRITE:
          elementGeometry = UIGeometry.makeSprite(
            atlas,
            frame,
            element.data.scale,
            element.data.anchor
          );
          break;
        case UIElementType.NINE_SLICE:
          elementGeometry = UIGeometry.makeNineSlice(
            atlas,
            frame,
            element.data.size,
            element.data.margins,
            element.data.scale,
            element.data.anchor
          );

          break;

      }
      if(elementGeometry != null){
        this.setGeometry(
          element.id,
          elementGeometry,
          element.data.x,
          element.data.y,
          element.data.origin
        )
        if(mainGeometry == null){
          mainGeometry = elementGeometry;
        }else{
          mainGeometry = BufferGeometryUtils.mergeBufferGeometries([mainGeometry,elementGeometry]);
          elementGeometry.dispose();
        }
      }
    }
    if(mainGeometry!= null){
      this.created = true;
      if( this.object == null){
        this.object = new Mesh(mainGeometry,this.material);
      }else{
        this.object.geometry = mainGeometry;
      }
      this.refreshAttributeIndexes();
      this.object.renderOrder = this.zIndex;
    }
  }
  private refreshAttributeIndexes(){
    let idAttr = this.object.geometry.getAttribute(ATTRIBUTE_ELEMENT_ID);
    let indexAttr = this.object.geometry.getAttribute(ATTRIBUTE_ELEMENT_VERTEX_ORDER);
    for(let i=0;i<idAttr.count;i++){
      let element = this.getElementByID(idAttr.getX(i));
      element.attributeIndexes[indexAttr.getX(i)] = i;
    }
  }

  getElementByVertices(vertices:{a:number,b:number,c:number}){
    let id =this.object.geometry.getAttribute(ATTRIBUTE_ELEMENT_ID).getX(vertices.a);

    for(let k in this.elements) {
      let element = this.elements[k];
      if(element.id == id){
        return element;
      }
    }
    return null
  }
  getElementByID(id:number){
    for(let k in this.elements) {
      let element = this.elements[k];
      if(element.id == id){
        return element;
      }
    }
    return
  }
  getElementByName(name:string){
    return this.elements[name]
  }



  setElementsState(name:string,state:UIElementStage){
    if(this.elements[name]){
      let element = this.elements[name];
      element.state = state;
    }
    if(this.created){
      this.updateUvs(name);
    }
  }
  setElementsPressed(name:string,isPressed:boolean){
    if(this.elements[name]){
      let element = this.elements[name];
      element.isPressed = isPressed;
    }
    if(this.created){
      this.updateUvs(name);
    }
  }
  private updateUvs(name:string){

    let element = this.elements[name];
    let elementGeometry:BufferGeometry = null;

    let stage = element.data.frames[element.state] ? element.state : UIElementStage.DEFAULT;
    let frame = element.data.frames[stage][element.isPressed?"pressed":"normal"] ? element.data.frames[stage][element.isPressed?"pressed":"normal"] : element.data.frames[stage].normal;
    let atlas = Loader.files.spriteSheets[this.atlas];
    let uvs = UIGeometry.getUv(element.type,atlas,frame,element.data.margins);
    let uvAttr = this.object.geometry.getAttribute("uv");
    for(let i = 0;i< element.attributeIndexes.length;i++){
      uvAttr.setXY(element.attributeIndexes[i],uvs[i][0],uvs[i][1]);
    }
    uvAttr.needsUpdate = true;
  }


  setElementsCallbacks(
    name:string,
    callbacks:{
      up:(pointerId:number,over:boolean)=>void
      down:(pointerId:number)=>void
      move?:(pointerId:number)=>void
    }
  ){
    if(this.elements[name]){
      let element = this.elements[name];
      element.callbacks = callbacks;
    }
  }
  dispose(){
    this.object.geometry.dispose();
  }
}
