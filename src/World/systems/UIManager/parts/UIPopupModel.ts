import { UILayer } from './UILayer';
import { MeshBasicMaterial, Object3D, Scene } from 'three';
import { Loader } from '../../Loader/Loader';
import { UIManager } from '../UIManager';
import { World } from '../../../World';
import gsap from "gsap";
import { UIScaleDivider } from '../../../constants/UIScaleDivider';
import { Anchor } from '../../../enums/Anchor';
import { Origin } from '../../../enums/Origin';

export class UIPopupModel {
  public layers:UILayer[] = [];
  public bkg:UILayer;


  public flags:{
    opened:boolean,
    closed:boolean,
    opening:boolean,
    closing:boolean
  } = {
    opened:false,
    closed:false,
    opening:false,
    closing:false
  }
  public object:Object3D = new Object3D();
  private mainTween:gsap.core.Tween = null;
  private nextID_ = 20000;
  public get nextID(){
    this.nextID_++;
    return this.nextID_;
  }
  private bkgMaterial:MeshBasicMaterial;
  constructor(public atlas:string,public material:MeshBasicMaterial) {
    this.bkgMaterial = this.material.clone();
    this.bkg = new UILayer(this.atlas,this.bkgMaterial,this.nextID);
    this.bkg.addNineSlice(
      {
        name:"bkg",
        frames:{
          default:{
            normal:"popup_bkg"
          }
        },
        size:{
          width:window.innerWidth,
          height:window.innerHeight
        },
        margins:{
          leftWidth:10,
          topHeight:10,
          rightWidth:10,
          bottomHeight:10,
        },
        x:0,
        y:0,
        anchor:Anchor.MID_MIDDLE,
        origin:Origin.MIDDLE,
        isButton:true
      });
    this.bkg.create();
    this.object.visible = false;
    this.bkg.object.visible = false;



    this.object.position.setY(window.innerHeight / UIScaleDivider * -1);
    (this.bkg.object.material as MeshBasicMaterial).opacity = 0;
    UIManager.container.add(this.bkg.object);
    UIManager.container.add(this.object);
  }
  dispose(){
    if(this.mainTween != null){
      this.mainTween.kill();
      this.mainTween = null;
    }
    UIManager.container.remove(this.bkg.object)
    this.bkg.dispose();
    for(let i = 0;i<this.layers.length;i++){
      UIManager.container.remove(this.layers[i].object)
      this.layers[i].dispose();
    }
    this.bkgMaterial.dispose();
  }
  show(){
    if(this.flags.opened || this.flags.opening){
      return;
    }
    if(this.flags.closing){
      this.mainTween.kill();
      this.mainTween = null;
    }
    this.flags.opening = true;
    this.flags.opened = false;
    this.flags.closed = false;
    this.flags.closing = false;

    let tweenData = {
      x:0,
      final:1000
    };
    let this_= this;
    this.object.visible = true;
    this.bkg.object.visible = true;
    this.mainTween = gsap.to(tweenData,{
      x:tweenData.final,
      duration:0.350,
      ease:'back.out',
      onUpdate:()=>{
        let posInit = window.innerHeight / UIScaleDivider * -1;
        let delta = tweenData.x/tweenData.final;
        this_.object.position.setY(posInit*(1-delta));
        (this.bkg.object.material as MeshBasicMaterial).opacity = delta;
      },
      onComplete:()=>{
        (this.bkg.object.material as MeshBasicMaterial).opacity = 1;
        this_.object.position.setY(0);
        this_.flags.closing = false;
        this_.flags.opened = true;
        this_.flags.closed = false;
        this_.flags.opening = false;
        this.mainTween = null;
      }
    })
  }
  hide(){

    if(this.flags.closed || this.flags.closing){
      return Promise.resolve();
    }
    if(this.flags.opening){
      this.mainTween.kill();
      this.mainTween = null;
    }
    this.flags.closing = true;
    this.flags.opened = false;
    this.flags.closed = false;
    this.flags.opening = false;

    return new Promise<void>((resolve, reject)=>{
      let tweenData = {
        x:0,
        final:1000
      };
      let this_= this;
      this.mainTween = gsap.to(tweenData,{
        x:tweenData.final,
        duration:0.350,
        ease:'expo.in',
        onUpdate:()=>{
          let posFinal = window.innerHeight / UIScaleDivider * -1;
          let delta = tweenData.x/tweenData.final;
          this_.object.position.setY(posFinal*delta);
          (this.bkg.object.material as MeshBasicMaterial).opacity = 1-delta;
        },
        onComplete:()=>{
          (this.bkg.object.material as MeshBasicMaterial).opacity = 0;
          let posFinal = window.innerHeight / UIScaleDivider * -1;
          this_.object.position.setY(posFinal);
          this_.flags.closing = false;
          this_.flags.opened = false;
          this_.flags.closed = true;
          this_.flags.opening = false;
          this.mainTween = null;
          this.object.visible = false;
          this.bkg.object.visible = false;
          resolve()
        }
      })
    })

  }
}
