import { UIScreenModel } from '../parts/UIScreenModel';
import { Object3D, Scene } from 'three';
import { UILayer } from '../parts/UILayer';
import { Anchor } from '../../../enums/Anchor';
import { Origin } from '../../../enums/Origin';
import { UIManager } from '../UIManager';
import { JoyStick } from '../parts/JoyStick/JoyStick';

export class UIScreenMain extends UIScreenModel{
  private joyStick:JoyStick;
  constructor() {
    super("general");



    let layer0 = new UILayer("general",this.material,10000);

    layer0.addSprite({
      name: "btn_popup",
      frames: {
        default: {
          normal: "square_custom_normal",
          pressed: "square_custom_pressed",
        },
      },
      x: -15,
      y: -15,
      scale: 1,
      anchor: Anchor.BOT_RIGHT,
      origin: Origin.BOTTOM_RIGHT,
      isButton: true,
  })

    let this_ = this;
    let openPopupCallbacks = {
      up:(e,over)=>{
        layer0.setElementsPressed("btn_popup",false)
        if(over){
          UIManager.openPopup()
        }
      },
      down:(e)=>{
        layer0.setElementsPressed("btn_popup",true)
      },
      move:(e)=>{},
    };
    layer0.setElementsCallbacks("btn_popup",openPopupCallbacks)

    this.layers.push(layer0)

    this.joyStick = new JoyStick(layer0);
    this.layers.push(this.joyStick.layers.nipple);


    for(let i = 0;i<this.layers.length;i++){
      this.layers[i].create();
      this.object.add(this.layers[i].object)
    }


    this.joyStick.init();
  }


  dispose() {
    this.joyStick.dispose();
    super.dispose();
  }
}
