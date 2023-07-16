import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { UIElementType } from '../../enums/UIElementType';
import { UIElementStage } from '../../enums/UIElementStage';
import { Anchor } from '../../enums/Anchor';
import { Origin } from '../../enums/Origin';

export interface IUIElements{
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
    x:number,
    y:number,
    scale:number,
    anchor:Anchor,
    origin:Origin,
  }
  state:UIElementStage,
  isButton:boolean,
  isPressed:boolean

  callbacks?:{
    up:(pointerId:number)=>void
    down:(pointerId:number)=>void
    move?:(pointerId:number)=>void
  }
}
