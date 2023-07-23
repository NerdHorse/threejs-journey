import { UIScaleDivider } from '../../../../constants/UIScaleDivider';
import { Vector2 } from 'three';
import { UILayer } from '../UILayer';
import { UIManager } from '../../UIManager';
import { Anchor } from '../../../../enums/Anchor';
import { Origin } from '../../../../enums/Origin';

const pi = Math.PI;
const JOYSTICK_BASE_ID = "joystick_base";
const JOYSTICK_NIPPLE_ID = "joystick_nipple";
export const JoyStickControl:{
  intensity:number,
    directionAngle:number
}={
  intensity:0,
  directionAngle:0
};
export class JoyStick{
  layers:{
    base:UILayer,
    nipple:UILayer
  }

  constructor(baseLayer:UILayer) {
    this.layers = {
      base:baseLayer,
      nipple: new UILayer(baseLayer.atlas,baseLayer.material,baseLayer.zIndex+1)
    }
    this.layers.base.addSprite(
      {
        name:JOYSTICK_BASE_ID,
        frames: {
          default: {
            normal: "circle_big"
          }
        },
        x:15,
        y:-15,
        anchor:Anchor.BOT_LEFT,
        origin:Origin.BOTTOM_LEFT,
        isButton:true
      });

    this.layers.nipple.addSprite(
      {
        name:JOYSTICK_NIPPLE_ID,
        frames:{
          default:{
            normal:"circle_default_normal",
            pressed:"circle_default_pressed"
          }
        }
      });

  }

  get joyStickDefaultPosition(){

    let margin = (100+15)/UIScaleDivider;
    return new Vector2(((-window.innerWidth)/(UIScaleDivider*2))+margin,(-window.innerHeight/(UIScaleDivider*2))+margin);
  }
  onJoyStickUP(pointerId:number,over:boolean){
    this.layers.nipple.setElementsPressed(JOYSTICK_NIPPLE_ID,false)
    let margin = this.joyStickDefaultPosition;
    this.layers.nipple.object.position.set(margin.x,margin.y,0);
    JoyStickControl.intensity = 0;
  }
  onJoyStickDOWN(pointerId:number){
    this.layers.nipple.setElementsPressed(JOYSTICK_NIPPLE_ID,true)
    this.updateJoyStick(pointerId);
  }
  onJoyStickMOVE(pointerId:number){


    this.updateJoyStick(pointerId);

  }
  private updateJoyStick(pointerId:number){

    let listener = UIManager.getListener(pointerId);
    let newPos = {
      x:(listener.nowPos.x-(window.innerWidth/2))/UIScaleDivider,
      y:-(listener.nowPos.y-(window.innerHeight/2))/UIScaleDivider
    }

    let defaultPos = this.joyStickDefaultPosition;

    var distanceSquared = (newPos.x - defaultPos.x) * (newPos.x - defaultPos.x) + (newPos.y - defaultPos.y) * (newPos.y - defaultPos.y);
    let radius = 1;
    if(distanceSquared > radius * radius){
      var diffX = newPos.x - defaultPos.x;
      var diffY = newPos.y - defaultPos.y;
      var angle = Math.atan2(diffY, diffX);
      newPos.x = defaultPos.x + radius * Math.cos(angle);
      newPos.y = defaultPos.y + radius * Math.sin(angle);

    }

    this.layers.nipple.object.position.set(newPos.x,newPos.y,0)

    JoyStickControl.intensity = distanceSquared / (radius * radius);
    JoyStickControl.directionAngle = ((Math.atan2(newPos.y - defaultPos.y, newPos.x - defaultPos.x) * 180 / pi)-90)* (pi/180);
  }

  init(){

    let margin = this.joyStickDefaultPosition;
    this.layers.nipple.object.position.set(margin.x,margin.y,0);


    let this_ = this;
    let joyStickCallbacks = {
      up:(e,over)=>this_.onJoyStickUP(e,over),
      down:(e)=>this_.onJoyStickDOWN(e),
      move:(e)=>this_.onJoyStickMOVE(e),
    };

    this.layers.base.setElementsCallbacks(JOYSTICK_BASE_ID,joyStickCallbacks)
  }

  dispose(){

  }
}
