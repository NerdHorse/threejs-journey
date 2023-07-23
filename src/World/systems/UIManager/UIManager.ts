import {
  Layers,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene, Vector2,
  Vector3,
} from 'three';
import { IUIListener } from '../../interfaces/UIManager/IUIListener';
import { UIScaleDivider } from '../../constants/UIScaleDivider';
import { UIScreenMain } from './screens/UIScreenMain';
import { UIScreenModel } from './parts/UIScreenModel';
import { World } from '../../World';
import { UIPopupModel } from './parts/UIPopupModel';
import { UILayer } from './parts/UILayer';
import { UIPopupExample } from './popups/UIPopupExample';

const pi = Math.PI;
export class UIManagerClass{
  container:Object3D = new Object3D();

  private lastDistanceFromCamera = null;


  private listening:IUIListener[]=[];


  private currentScren:UIScreenModel;

  private currentPopup:UIPopupModel;

  constructor(){}
  init() {
    World.scene.add(this.container);



    this.currentScren = new UIScreenMain();

  }
  private to2D(pos:Vector3) {

    let vector = pos.project(World.camera);
    vector.x = window.innerWidth * (vector.x + 1) / 2;
    vector.y = -window.innerHeight * (vector.y - 1) / 2;

    return vector;
  }
  private raycaster = new Raycaster();

  update(){


    World.camera.updateWorldMatrix( true, false );


    let distanceFromCamera = this.lastDistanceFromCamera;  // 3 units;
    if(distanceFromCamera == null){
      distanceFromCamera = 15;
      let done = false;
      const target = new Vector3(-window.innerWidth/(UIScaleDivider*2),window.innerHeight/(UIScaleDivider*2),-distanceFromCamera);
      target.applyMatrix4(World.camera.matrixWorld);
      let pos2D = this.to2D(target);

      if(Math.round(pos2D.x) != 0){
        if(pos2D.x < 0){
          for(let i = distanceFromCamera*1000; i<50000 && !done;i++){
            distanceFromCamera = i / 1000;
            target.set(-window.innerWidth/(UIScaleDivider*2),window.innerHeight/(UIScaleDivider*2),-distanceFromCamera)
            target.applyMatrix4(World.camera.matrixWorld);
            let pos2D = this.to2D(target);
            if(Math.round(pos2D.x) == 0 ){
              done = true;
            }
          }
        }else{
          for(let i = distanceFromCamera*1000; i>0 && !done;i--){
            distanceFromCamera = i / 1000;
            target.set(-window.innerWidth/(UIScaleDivider*2),window.innerHeight/(UIScaleDivider*2),-distanceFromCamera)
            target.applyMatrix4(World.camera.matrixWorld);
            let pos2D = this.to2D(target);
            if(Math.round(pos2D.x) == 0){
              done = true;
            }
          }
        }
      }
    }
    //console.log(distanceFromCamera, World.renderer.xr.getSession().);

    this.lastDistanceFromCamera = distanceFromCamera;

    const target = new Vector3(0,0,-distanceFromCamera);
    target.applyMatrix4(World.camera.matrixWorld);

    this.container.position.set(target.x,target.y,target.z);
    this.container.updateMatrix();
    this.container.lookAt(World.elements.camera.position)
    this.container.updateMatrix();
  }

  onContextMenu(event:MouseEvent):boolean{
    console.log("onContextMenu",event);

    return true;
  }
  onPointerDown(event:PointerEvent){
    console.log("onPointerDown",event,this.currentPopup);
    let stop = false;

    this.raycaster.setFromCamera( {
      x: ( event.clientX / window.innerWidth ) * 2 - 1,
      y: - ( event.clientY / window.innerHeight ) * 2 + 1,
    }, World.camera );

    let layers:UILayer[] = [];
    layers.push(...this.currentScren.layers)
    if(this.currentPopup != null){
      console.log("this.currentPopup != null",this.currentPopup);
      layers.push(this.currentPopup.bkg);
      layers.push(...this.currentPopup.layers);
    }

    for(let i = layers.length-1;i>=0 && !stop;i--){
      const intersects = this.raycaster.intersectObject( layers[i].object );
      if ( intersects.length > 0 ) {
        let element = layers[i].getElementByVertices(intersects[0].face);
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

    console.log(this.listening,layers)


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
    let layers:UILayer[] = [];
    layers.push(...this.currentScren.layers)
    if(this.currentPopup != null){
      console.log("this.currentPopup != null",this.currentPopup);
      layers.push(this.currentPopup.bkg);
      layers.push(...this.currentPopup.layers);
    }
    for(let i =0;i<this.listening.length;i++){
      if(event.pointerId == this.listening[i].pointerId){
        let element = layers[this.listening[i].layer].getElementByID(this.listening[i].element);

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
    this.raycaster.setFromCamera( {
      x: ( event.clientX / window.innerWidth ) * 2 - 1,
      y: - ( event.clientY / window.innerHeight ) * 2 + 1,
    }, World.camera );
    let layers:UILayer[] = [];
    layers.push(...this.currentScren.layers)
    if(this.currentPopup != null){
      layers.push(this.currentPopup.bkg);
      layers.push(...this.currentPopup.layers);
    }
    console.log(this.currentPopup,this.listening);
    for(let i =0;i<this.listening.length;i++){
      if(event.pointerId != this.listening[i].pointerId){



        newArray.push(this.listening[i]);
      }else{
        let element = layers[this.listening[i].layer].getElementByID(this.listening[i].element);

        this.listening[i].nowPos.x = event.clientX;
        this.listening[i].nowPos.y = event.clientY;

        if(element.callbacks){
          const intersects = this.raycaster.intersectObject( layers[this.listening[i].layer].object );
          let isOver = false;
          if ( intersects.length > 0 ) {
            let element_ = layers[this.listening[i].layer].getElementByVertices(intersects[0].face);
            isOver = element.id == element_.id;
          }
          element.callbacks.up.call(this, event.pointerId,isOver)
        }
      }
    }
    this.listening=newArray;


    return true;
  }





  getListener(pointerId){

    for(let i =0;i<this.listening.length;i++) {
      if (pointerId == this.listening[i].pointerId) {
        return this.listening[i];
      }
    }

  }


  openPopup(){
    this.currentPopup = new UIPopupExample("general",this.currentScren.material);
    this.currentPopup.show();
  }

  hidePopup(){
    let this_ = this;
    this.currentPopup.hide().then(()=>{
      this.currentPopup.dispose();
      this.currentPopup = null;
      console.log("hidePopup");
    });

  }

}

export const UIManager = new UIManagerClass();
