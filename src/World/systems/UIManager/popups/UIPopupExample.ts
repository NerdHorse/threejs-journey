import { UIPopupModel } from '../parts/UIPopupModel';
import { MeshBasicMaterial } from 'three';
import { UILayer } from '../parts/UILayer';
import { Anchor } from '../../../enums/Anchor';
import { Origin } from '../../../enums/Origin';
import { UIManager } from '../UIManager';
import { UIElementStage } from '../../../enums/UIElementStage';

export class UIPopupExample extends UIPopupModel{
  constructor(atlas:string,material:MeshBasicMaterial) {
    super(atlas,material);

    let layer0 = new UILayer(this.atlas,this.material,this.nextID);
    layer0.addNineSlice(
      {
        name:"popup_container",
        frames:{
          default:{
            normal:"popup_container"
          }
        },
        size:{
          width:400,
          height:500
        },
        margins:{
          leftWidth:20,
          topHeight:20,
          rightWidth:20,
          bottomHeight:20,
        },
        x:0,
        y:0,
        anchor:Anchor.MID_MIDDLE,
        origin:Origin.MIDDLE,
        isButton:true
      });
    this.layers.push(layer0);


    let layer1 = new UILayer(this.atlas,this.material,this.nextID);
    layer1.addSprite(
      {
        name:"btn_close",
        frames:{
          default:{
            normal:"square_default_normal",
            pressed:"square_default_pressed"
          }
        },
        x:200,
        y:-250,
        scale:0.5,
        anchor:Anchor.MID_MIDDLE,
        origin:Origin.MIDDLE,
        isButton:true
      });

    layer1.addSprite(
      {
        name:"btn_test_1",
        frames:{
          default:{
            normal:"circle_default_normal",
            pressed:"circle_default_pressed"
          },
        },
        x:-100,
        y:0,
        anchor:Anchor.MID_MIDDLE,
        origin:Origin.MIDDLE,
        isButton:true
      });

    layer1.addSprite(
      {
        name:"btn_test_2",
        frames:{
          default:{
            normal:"square_default_normal",
            pressed:"square_default_pressed"
          },
          disabled:{
            normal:"square_disabled_normal",
            pressed:"square_disabled_pressed"
          },
          custom:{
            normal:"square_custom_normal",
            pressed:"square_custom_pressed"
          }
        },
        x:100,
        y:0,
        anchor:Anchor.MID_MIDDLE,
        origin:Origin.MIDDLE,
        isButton:true
      });
    this.layers.push(layer1);

    let closePopupCallbacks = {
      up:(e,over)=>{
        layer1.setElementsPressed("btn_close",false);
        if(over){
          UIManager.hidePopup()
        }
      },
      down:(e)=>{
        layer1.setElementsPressed("btn_close",true);
        }
    };
    layer1.setElementsCallbacks("btn_close",closePopupCallbacks)


    let btn1Callbacks = {
      up:(e,over)=>{
        layer1.setElementsPressed("btn_test_1",false);
        if(over){
          let el = layer1.getElementByName("btn_test_2");
          switch (el.state){
            case UIElementStage.DEFAULT:
              layer1.setElementsState("btn_test_2",UIElementStage.DISABLED)
              break;
            case UIElementStage.DISABLED:
              layer1.setElementsState("btn_test_2",UIElementStage.CUSTOM)
              break;
            case UIElementStage.CUSTOM:
              layer1.setElementsState("btn_test_2",UIElementStage.DEFAULT)
              break;
          }
        }
      },
      down:(e)=>{
        layer1.setElementsPressed("btn_test_1",true);
      }
    };
    layer1.setElementsCallbacks("btn_test_1",btn1Callbacks)

    let btn2Callbacks = {
      up:(e,over)=>{
        layer1.setElementsPressed("btn_test_2",false);
      },
      down:(e)=>{
        layer1.setElementsPressed("btn_test_2",true);
      }
    };
    layer1.setElementsCallbacks("btn_test_2",btn2Callbacks)

    for(let i = 0;i<this.layers.length;i++){

      this.layers[i].create();
      this.object.add(this.layers[i].object)
    }
  }
}
