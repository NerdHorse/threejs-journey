import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { UIElementType } from '../../enums/UIElementType';
import { UIElementStage } from '../../enums/UIElementStage';
import { Anchor } from '../../enums/Anchor';
import { Origin } from '../../enums/Origin';

export interface IUIElement {
  id:number,
  type:UIElementType
  data:{
    frames:{
      default:{
        normal:string,
        pressed?:string,
      },
      disabled?:{
        normal:string,
        pressed?:string,
      },
      custom?:{
        normal:string,
        pressed?:string,
      }
    },
    size?:{
      width:number,
      height:number,
    },
    margins?:{
      leftWidth:number, // size of the left vertical bar (A)
      topHeight:number, // size of the top horizontal bar (C)
      rightWidth:number, // size of the right vertical bar (B)
      bottomHeight:number, // size of the bottom horizontal bar (D)
    },
    x:number,
    y:number,
    scale:number,
    anchor:Anchor,
    origin:Origin,
  }
  state:UIElementStage,
  isButton:boolean,
  isPressed:boolean
  attributeIndexes:number[],
  callbacks?:{
    up:(pointerId:number,over:boolean)=>void
    down:(pointerId:number)=>void
    move?:(pointerId:number)=>void
  }
}
