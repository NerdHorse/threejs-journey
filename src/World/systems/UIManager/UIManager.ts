import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene, Vector2,
  Vector3,
} from 'three';
import { Loader } from '../Loader';
import { UILayer } from './UILayer';
import { Anchor } from '../../enums/Anchor';
import { Origin } from '../../enums/Origin';
import { UIElementStage } from '../../enums/UIElementStage';
import { IUIListener } from '../../interfaces/UIManager/IUIListener';

const pi = Math.PI;
export class UIManager{
  container:Object3D = new Object3D();

  private lastDistanceFromCamera = null;

  private layers:UILayer[] = [];

  private listening:IUIListener[]=[];

  private material = new MeshBasicMaterial();

  constructor(private camera:OrthographicCamera|PerspectiveCamera,private scene:Scene) {
    this.scene.add(this.container);


    this.material.map = Loader.files.spriteSheets.general.mainTexture;
    this.material.transparent = true;
    this.material.depthTest = false;

    this.createContent();

  }
  private to2D(pos:Vector3) {

    let vector = pos.project(this.camera);
    vector.x = window.innerWidth * (vector.x + 1) / 2;
    vector.y = -window.innerHeight * (vector.y - 1) / 2;

    return vector;
  }

  update(){


    this.camera.updateWorldMatrix( true, false );


    let distanceFromCamera = this.lastDistanceFromCamera;  // 3 units;
    if(distanceFromCamera == null){
      distanceFromCamera = 15;
      let done = false;
      const target = new Vector3(-window.innerWidth/200,window.innerHeight/200,-distanceFromCamera);
      target.applyMatrix4(this.camera.matrixWorld);
      let pos2D = this.to2D(target);

      if(Math.round(pos2D.x) != 0){
        if(pos2D.x < 0){
          for(let i = distanceFromCamera*1000; i<50000 && !done;i++){
            distanceFromCamera = i / 1000;
            target.set(-window.innerWidth/200,window.innerHeight/200,-distanceFromCamera)
            target.applyMatrix4(this.camera.matrixWorld);
            let pos2D = this.to2D(target);
            if(Math.round(pos2D.x) == 0 ){
              done = true;
            }
          }
        }else{
          for(let i = distanceFromCamera*1000; i>0 && !done;i--){
            distanceFromCamera = i / 1000;
            target.set(-window.innerWidth/200,window.innerHeight/200,-distanceFromCamera)
            target.applyMatrix4(this.camera.matrixWorld);
            let pos2D = this.to2D(target);
            if(Math.round(pos2D.x) == 0){
              done = true;
            }
          }
        }
      }
    }

    this.lastDistanceFromCamera = distanceFromCamera;

    const target = new Vector3(0,0,-distanceFromCamera);
    target.applyMatrix4(this.camera.matrixWorld);

    this.container.position.set(target.x,target.y,target.z);
    this.container.updateMatrix();
    this.container.lookAt(this.camera.position)
    this.container.updateMatrix();
  }

  private raycaster = new Raycaster();
  onContextMenu(event:MouseEvent):boolean{
    console.log("onContextMenu",event);

    return true;
  }
  onPointerDown(event:PointerEvent){
    console.log("onPointerDown",event);
    let stop = false;

    this.raycaster.setFromCamera( {
      x: ( event.clientX / window.innerWidth ) * 2 - 1,
      y: - ( event.clientY / window.innerHeight ) * 2 + 1,
    }, this.camera );

    for(let i = this.layers.length-1;i>=0 && !stop;i--){
      const intersects = this.raycaster.intersectObject( this.layers[i].object );
      if ( intersects.length > 0 ) {
        let element = this.layers[i].getElementByVertices(intersects[0].face);
        if(element.isButton){

          this.listening.push({
            pointerId: event.pointerId,
            layer:i,
            element:element.id,
            startPos: { x: event.clientX, y: event.clientY },
            nowPos: { x: event.clientX, y: event.clientY }
          })

          if(element.callbacks){
            element.callbacks.down.call(this, event.pointerId)
          }

        }
        stop = element.isButton;
      }
      //
    }



    return !stop;
  }

  onPointerCancel(event:PointerEvent){
    return this.onPointerUp(event);

  }
  onMouseWheel(event:MouseEvent){
    console.log("onMouseWheel",event);

    return true;
  }
  onKeyDown(event:KeyboardEvent){
    console.log("onKeyDown",event);

    return true;
  }
  onPointerMove(event:PointerEvent){
    //console.log("onPointerMove",event);
    for(let i =0;i<this.listening.length;i++){
      if(event.pointerId == this.listening[i].pointerId){
        let element = this.layers[this.listening[i].layer].getElementByID(this.listening[i].element);

        this.listening[i].nowPos.x = event.clientX;
        this.listening[i].nowPos.y = event.clientY;

        if(element.callbacks && element.callbacks.move){
          element.callbacks.move.call(this, event.pointerId)
        }
        return false;
      }
    }

    return true;
  }
  onPointerUp(event:PointerEvent){
    console.log("onPointerUp",event);
    let newArray = [];
    for(let i =0;i<this.listening.length;i++){
      if(event.pointerId != this.listening[i].pointerId){



        newArray.push(this.listening[i]);
      }else{
        let element = this.layers[this.listening[i].layer].getElementByID(this.listening[i].element);

        this.listening[i].nowPos.x = event.clientX;
        this.listening[i].nowPos.y = event.clientY;

        if(element.callbacks){
          element.callbacks.up.call(this, event.pointerId)
        }
      }
    }
    this.listening=newArray;


    return true;
  }




  createContent(){
    let layer0 = new UILayer("general",this.material,10000);
    layer0.addSprite(
      {
        name:"joystick_base",
        frames: {
          default: {
            normal: "circle_big"
          }
        },
        x:15,
        y:-15,
        anchor:Anchor.BOTTOM_LEFT,
        origin:Origin.BOTTOM_LEFT,
        isButton:true
      });

    layer0.addSprite(
      {
        name:"btn_run",
        frames:{
          default:{
            normal:"square_default_normal",
            pressed:"square_default_pressed"
          },
          custom:{
            normal:"square_custom_normal",
            pressed:"square_custom_pressed"
          }
        },
        x:-15,
        y:-15,
        anchor:Anchor.BOTTOM_RIGHT,
        origin:Origin.BOTTOM_RIGHT,
        isButton:true
      });


    layer0.create();
    this.layers.push(layer0)


    let layer1 = new UILayer("general",this.material,10001);
    layer1.addSprite(
      {
        name:"joystick_nipple",
        frames:{
          default:{
            normal:"circle_default_normal",
            pressed:"circle_default_pressed"
          }
        }
      });
    layer1.create();


    let margin = this.joyStickDefaultPosition;
    layer1.object.position.set(margin.x,margin.y,0);
    this.layers.push(layer1);


    for(let i = 0;i<this.layers.length;i++){
      this.container.add(this.layers[i].object)
    }



    let joyStickCallbacks = {
      up:this.onJoyStickUP,
      down:this.onJoyStickDOWN,
      move:this.onJoyStickMOVE,
    };
    let runCallbacks = {
      up:this.onRunBtnUP,
      down:this.onRunBtnDOWN
    }

    layer0.setElementsCallbacks("joystick_base",joyStickCallbacks)
    layer0.setElementsCallbacks("btn_run",runCallbacks)
  }

  private getListener(pointerId){

    for(let i =0;i<this.listening.length;i++) {
      if (pointerId == this.listening[i].pointerId) {
        return this.listening[i];
      }
    }

  }
  onJoyStickUP(pointerId:number){
    this.characterControl.walking = false;
    let margin = this.joyStickDefaultPosition;
    this.layers[1].object.position.set(margin.x,margin.y,0);
  }
  onJoyStickDOWN(pointerId:number){
    this.characterControl.walking = true;
    this.updateJoyStick(pointerId);
  }
  onJoyStickMOVE(pointerId:number){


    this.updateJoyStick(pointerId);

  }
  private updateJoyStick(pointerId:number){

    let listener = this.getListener(pointerId);
    let newPos = {
      x:(listener.nowPos.x-(window.innerWidth/2))/100,
      y:-(listener.nowPos.y-(window.innerHeight/2))/100
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

    this.layers[1].object.position.set(newPos.x,newPos.y,0)

    this.characterControl.directionAngle = ((Math.atan2(newPos.y - defaultPos.y, newPos.x - defaultPos.x) * 180 / pi)-90)* (pi/180);
  }
  onRunBtnUP(pointerId:number){
    console.log("onRunBtnUP")
    this.characterControl.running = false;
  }
  onRunBtnDOWN(pointerId:number){
    console.log("onRunBtnDOWN")
    this.characterControl.running = true;
  }

  get joyStickDefaultPosition(){

    let margin = (100+15)/100;
    return new Vector2(((-window.innerWidth)/200)+margin,(-window.innerHeight/200)+margin);
  }

  characterControl:{
    running:boolean,
    walking:boolean,
    directionAngle:number
  }={
    running:false,
    walking:false,
    directionAngle:0
  }

}
