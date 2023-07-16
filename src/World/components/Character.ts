import {
  AnimationAction,
  AnimationClip,
  AnimationMixer, BackSide,
  BufferAttribute, BufferGeometry, Group, Material, MathUtils,
  Mesh, MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D, Skeleton, SkinnedMesh,
  Texture, Vector3,
} from 'three';
import { clone as SkeletonClone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Colors } from '../constants/Colors';
import { ICharacterUserData, ICharacterUserDataIndexes } from '../interfaces/ICharacterUserData';
import { CharacterBuilderData } from '../constants/CharacterBuilderData';
import { World } from '../World';
import { TextureComposer } from '../systems/TextureComposer';
import { Menu } from '../systems/GUI';
import { ICharacterBuilderPartBlockData } from '../interfaces/ICharacterBuilderPartData';
import { Loader } from '../systems/Loader';
import gsap from "gsap";
import { GUI } from 'dat.gui';

export class Character{
  obj:Object3D
  userData:ICharacterUserData
  mixer:AnimationMixer
  actions:{
    running:AnimationAction,
    walking:AnimationAction,
    idle:AnimationAction
  }
  uvOri:BufferAttribute
  actionSelected:string;

  tween:gsap.core.Tween|null;
  outline:boolean|null = null;
  private lastPos:Vector3=null;
  private lastRotation:Vector3=null;

  private loopAnimationFinished: {
    func:(event:any)=>void,
    nextAnimation:string,
    syncTimeoutAnimation:string
  }
  private ANIMATIONCROSSFADE = 0.25;
  constructor(private id:number,userData_?:ICharacterUserData) {

    if(userData_){
      this.userData = userData_;
    }else{
      this.userData = this.createNewUserData();
    }
    let this_=this;
    this.loopAnimationFinished= {
      func:(event)=> {
        if (this_.obj == null) {
          return
        }

        if (this_.loopAnimationFinished.nextAnimation) {
          this_.animationExecuteCrossFade(this_.actionSelected, this_.loopAnimationFinished.nextAnimation, this_.ANIMATIONCROSSFADE);
          this_.loopAnimationFinished.nextAnimation = null;
        }

      },
      nextAnimation:null,
      syncTimeoutAnimation:null
    }
  }

  private createNewUserData():ICharacterUserData{
    let skin = Colors.skin[Math.floor(Math.random()*Colors.skin.length)];
    return  {
      "colors": {
        "body": skin,
        "underwear1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "underwear2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "eyes": "#000000",
        "mouth": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "beard": skin,
        "necklace1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "necklace2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "necklace3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "eyeBrows": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "glasses1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "glasses2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "glasses3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "bracelet1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "bracelet2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "gloves1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "gloves2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "gloves3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "earrings1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "earrings2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "facial1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "facial2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "facial3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "facial4": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "facial5": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "hair1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "hair2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "hair3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "hair4": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "hair5": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shirt1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shirt2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shirt3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shirt4": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shirt5": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "pants1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "pants2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "pants3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "pants4": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "pants5": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shoes1": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shoes2": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shoes3": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shoes4": Colors.general[Math.floor(Math.random()*Colors.general.length)],
        "shoes5": Colors.general[Math.floor(Math.random()*Colors.general.length)],
      },
      "patterns": {
        "shirt": Math.floor(Math.random()*(CharacterBuilderData.patterns.shirt+1))-1,
        "pants": Math.floor(Math.random()*(CharacterBuilderData.patterns.pants+1))-1,
        "armL": Math.floor(Math.random()*(CharacterBuilderData.patterns.armL+1))-1,
        "armR": Math.floor(Math.random()*(CharacterBuilderData.patterns.armR+1))-1,
        "legL": Math.floor(Math.random()*(CharacterBuilderData.patterns.legL+1))-1,
        "legR": Math.floor(Math.random()*(CharacterBuilderData.patterns.legR+1))-1,
        "shoes": Math.floor(Math.random()*(CharacterBuilderData.patterns.shoes+1))-1,
        "gloves": Math.floor(Math.random()*(CharacterBuilderData.patterns.gloves+1))-1,
        "facial": Math.floor(Math.random()*(CharacterBuilderData.patterns.facial+1))-1,
      },
      "indexes": {
        "eyebrows": Math.floor(Math.random()*CharacterBuilderData.eyebrows.length),
        "eyes": Math.floor(Math.random()*CharacterBuilderData.eyes.length),
        "head": Math.floor(Math.random()*2),
        "shirts": Math.floor(Math.random()*(CharacterBuilderData.shirts.length+1))-1,
        "pants": Math.floor(Math.random()*(CharacterBuilderData.pants.length+1))-1,
        "shoes": Math.floor(Math.random()*(CharacterBuilderData.shoes.length+1))-1,
        "underwear": Math.floor(Math.random()*CharacterBuilderData.underwear.length),
        "glasses": CharacterBuilderData.glasses.length-1,
        "gloves": Math.floor(Math.random()*(CharacterBuilderData.gloves.length+1))-1,
        "hair": Math.floor(Math.random()*(CharacterBuilderData.hair.length+1))-1,
        "facial": Math.floor(Math.random()*(CharacterBuilderData.facial.length+1))-1,
        "earrings": Math.floor(Math.random()*(CharacterBuilderData.earrings.length+1))-1,
        "bracelet": CharacterBuilderData.bracelet.length-1,
        "necklace": CharacterBuilderData.necklace.length-1
      }
    }
  }

   refreshShape(indexes:ICharacterUserDataIndexes){

     const runningClip:AnimationClip =Loader.files.character.animations.running.animations[0].optimize()
     const walkingClip:AnimationClip =Loader.files.character.animations.walking.animations[0].optimize()
     const idleClip:AnimationClip =Loader.files.character.animations.idle.animations[0].optimize()

     let remake = this.obj == null;
     for(let config in indexes){
       if(this.userData.indexes[config] != indexes[config]){
         remake = true;
         this.userData.indexes[config] =indexes[config];
       }
     }
     remake =  remake || this.outline != Menu.generalData.characters.outline ;

     if(remake){
       this.outline = Menu.generalData.characters.outline;
       if(this.obj != null){
         if(this.id == 0){
           this.lastPos = new Vector3(this.obj.position.x,this.obj.position.y,this.obj.position.z)
           this.lastRotation  = new Vector3(this.obj.rotation.x,this.obj.rotation.y,this.obj.rotation.z)
         }
         World.scene.remove(this.obj);
         this.obj.children.forEach(child => {
           if((child as Mesh).isMesh){
             (child as Mesh).geometry.dispose();
             //((child as Mesh).material as Material).dispose();
           }
         });

         for(let k in  this.actions){
           this.actions[k].stop();
         }
         this.actions= null;

         this.mixer.removeEventListener( 'loop', this.loopAnimationFinished.func );
         World.loop.removeMixer(this.mixer);
         this.mixer= null;
       }

       let {mesh,outlineMesh} = this.meshMaker();

       let uvOri = (mesh.geometry.attributes["uv"] as BufferAttribute).clone();
       const container = new Object3D();

       this.mixer =  new AnimationMixer(mesh);
       this.actions ={
         running:this.mixer.clipAction(runningClip.clone()),
         walking:this.mixer.clipAction(walkingClip.clone()),
         idle:this.mixer.clipAction(idleClip.clone())
       };

       let offset = {
         x: this.id%7,
         y: Math.floor(this.id / 7)
       }
       offset.x = Math.floor((offset.x+1)/2) * (offset.x % 2 > 0 ? -1 : 1)
       container.attach(mesh)
       if(outlineMesh){
         outlineMesh.userData.outlineMesh = true;
         container.attach(outlineMesh);
       }
       container.rotation.set(0,MathUtils.degToRad(180),0)
       container.scale.set(-0.01, 0.01, -0.01);



       for(let k in this.actions){
         this.actions[k].play();
         this.animationSetWeight(this.actions[k],0)
       }

       let actionSelected =  "idle";
       this.animationSetWeight(this.actions[actionSelected],1)



       World.scene.add(container);
       this.obj = container;
       this.uvOri = uvOri;
       this.actionSelected = actionSelected;
       this.setDefaultPosition();
       this.updateTweenStatus();
       World.loop.addMixer(this.mixer);

       this.mixer.addEventListener( 'loop', this.loopAnimationFinished.func );
     }
   }
   dispose(){
    if(this.obj){
      this.obj.children.forEach(child => {
        if((child as Mesh).isMesh){
          (child as Mesh).geometry.dispose();
          ((child as Mesh).material as Material).dispose();
        }
      });
      for(let k in  this.actions){
        this.actions[k].stop();
      }
      this.actions= null;
      World.loop.removeMixer(this.mixer);
      this.mixer.removeEventListener( 'loop', this.loopAnimationFinished.func );
      this.mixer= null;
    }
    this.uvOri = null;
    this.actions = null;
    if(this.tween){
      this.tween.kill();
      this.tween = null;
    }
    this.obj = null;
    this.userData = null;

   }
  private animationSetWeight( action:AnimationAction, weight:number ){
    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

  }

  private animationSynchronizeCrossFade(  end:string) {


    this.loopAnimationFinished.nextAnimation = end;



  }
  private animationExecuteCrossFade(start:string, end:string, duration:number  ) {

    if(
      this.obj == null
      || this.actionSelected == end
    ){
      return
    }

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    let startAction = this.actions[start];
    let endAction = this.actions[end];

    this.animationSetWeight( endAction, 1 );
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false

    startAction.crossFadeTo( endAction, duration, true );

    this.actionSelected = end;

  }
  public prepareCrossFade( end:string) {
    if(
      this.obj == null
      || this.loopAnimationFinished.syncTimeoutAnimation == end
      || this.loopAnimationFinished.nextAnimation == end
    ){
      return
    }



    let startAction = this.actions[this.actionSelected]

    const duration = 0.250;

    this.loopAnimationFinished.nextAnimation = null;


    if ( startAction ===this.actions.idle ) {

      this.animationExecuteCrossFade( this.actionSelected, end, duration );

    } else if(this.obj && this.actionSelected != end) {
      let this_=this;
      this.loopAnimationFinished.syncTimeoutAnimation = end;
      this_.animationSynchronizeCrossFade( end );
      this_.loopAnimationFinished.syncTimeoutAnimation = null;

    }

  }

  private meshMaker(){

    let characterData = this.userData;

    let blockList = this.meshBlocker(characterData);


    let bufferGeometry1:BufferGeometry |null = null;
    let bufferGeometry2:BufferGeometry |null = null;
    let scene = SkeletonClone(Loader.files.character.gltf[this.outline?"withOutline":"noOutline"].scene);
    let skeleton:Skeleton | null= null;

    for(let i = 0;i<scene.children.length;i++){

      let obj = scene.children[i];
      let type = obj.name.split("_")[0]

      if(this.meshChecker(obj.name,characterData,blockList)){
        if((obj as Mesh).isMesh){

          if(bufferGeometry1){
            bufferGeometry1 = BufferGeometryUtils.mergeBufferGeometries([bufferGeometry1,(obj as Mesh).geometry])
          }else{
            bufferGeometry1 = (obj as Mesh).geometry.clone()
          }
          if(skeleton == null){
            skeleton = (obj as SkinnedMesh).skeleton;
          }
        }else{
          for(let j = 0;j<obj.children.length;j++){
            if(obj.children[j].name == obj.name+"_1"){

              if(bufferGeometry1){
                bufferGeometry1 = BufferGeometryUtils.mergeBufferGeometries([bufferGeometry1,(obj.children[j] as Mesh).geometry])
              }else{
                bufferGeometry1 = (obj.children[j] as Mesh).geometry.clone()
              }
              if(skeleton == null){
                skeleton = (obj.children[j] as SkinnedMesh).skeleton;
              }
            }else{

              if(bufferGeometry2){
                bufferGeometry2 = BufferGeometryUtils.mergeBufferGeometries([bufferGeometry2,(obj.children[j] as Mesh).geometry])
              }else{
                bufferGeometry2 = (obj.children[j] as Mesh).geometry.clone()
              }
            }



          }
        }



      }
    }





    const mesh  = new SkinnedMesh(bufferGeometry1 as BufferGeometry,World.materials.types[Menu.generalData.material.selected]);
    mesh.add(skeleton?.bones[0].parent as Object3D)
    mesh.bind(skeleton as Skeleton)




    let outline : SkinnedMesh|null = null;

    if(bufferGeometry2){
      outline  = new SkinnedMesh(bufferGeometry2 as BufferGeometry,World.materials.types.outline);
      outline.bind(skeleton as Skeleton)
    }


    return {mesh,outlineMesh: outline}

  }
  private meshBlocker(characterData:ICharacterUserData):ICharacterBuilderPartBlockData{

    let builderData = CharacterBuilderData;
    let blockList:ICharacterBuilderPartBlockData = {};

    if(characterData.indexes.shirts >=0) {
      for (let k in CharacterBuilderData.shirts[characterData.indexes.shirts].blocks) {
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.shirts[characterData.indexes.shirts].blocks[k];
      }
    }

    if(characterData.indexes.facial >=0) {
      for (let k in CharacterBuilderData.facial[characterData.indexes.facial].blocks) {
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.facial[characterData.indexes.facial].blocks[k];
      }
    }

    if(characterData.indexes.pants >=0) {
      for (let k in CharacterBuilderData.pants[characterData.indexes.pants].blocks) {
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.pants[characterData.indexes.pants].blocks[k];
      }
    }
    if(characterData.indexes.gloves >=0) {
      for (let k in CharacterBuilderData.gloves[characterData.indexes.gloves].blocks) {
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.gloves[characterData.indexes.gloves].blocks[k];
      }
    }
    if(characterData.indexes.shoes >=0){
      for(let k in CharacterBuilderData.shoes[characterData.indexes.shoes].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.shoes[characterData.indexes.shoes].blocks[k];
      }
    }
    if(blockList.earrings && characterData.indexes.earrings >=0){
      for(let k in CharacterBuilderData.earrings[characterData.indexes.earrings].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.earrings[characterData.indexes.earrings].blocks[k];
      }
    }
    if(blockList.eyebrows && characterData.indexes.eyebrows >=0){
      for(let k in CharacterBuilderData.eyebrows[characterData.indexes.eyebrows].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.eyebrows[characterData.indexes.eyebrows].blocks[k];
      }
    }
    if(blockList.eyes && characterData.indexes.eyes >=0){
      for(let k in CharacterBuilderData.eyes[characterData.indexes.eyes].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.eyes[characterData.indexes.eyes].blocks[k];
      }
    }
    if(blockList.glasses && characterData.indexes.glasses >=0){
      for(let k in CharacterBuilderData.glasses[characterData.indexes.glasses].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.glasses[characterData.indexes.glasses].blocks[k];
      }
    }
    if(blockList.bracelets && characterData.indexes.bracelet >=0){
      for(let k in CharacterBuilderData.bracelet[characterData.indexes.bracelet].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.bracelet[characterData.indexes.bracelet].blocks[k];
      }
    }
    if(blockList.necklace && characterData.indexes.necklace >=0){
      for(let k in CharacterBuilderData.necklace[characterData.indexes.necklace].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.necklace[characterData.indexes.necklace].blocks[k];
      }
    }
    if(blockList.hair && characterData.indexes.hair >=0){
      for(let k in CharacterBuilderData.hair[characterData.indexes.hair].blocks){
        // @ts-ignore
        blockList[k] = blockList[k] ? blockList[k] : CharacterBuilderData.hair[characterData.indexes.hair].blocks[k];
      }
    }

    return blockList;
  }
  private meshChecker(name:string, characterData:ICharacterUserData,blockList:ICharacterBuilderPartBlockData):boolean{
    let type = name.split("_")[0]
    return type == "m"
      && (
        (name == "m_arm_bot_l" && !blockList.armBotL)
        || (name == "m_arm_bot_r" && !blockList.armBotR)
        || (name == "m_arm_top_l" && !blockList.armTopL)
        || (name == "m_arm_top_r" && !blockList.armTopR)
        || (name == "m_back_top" && !blockList.backTop)
        || (name == "m_back_bot" && !blockList.backBot)
        || (name == "m_belly" && !blockList.belly)
        || (name == "m_chest_bot" && !blockList.chestBot)
        || (name == "m_chest_top" && !blockList.chestTop)
        || (name == "m_ears" && !blockList.ears)
        || (name == "m_feet" && !blockList.feet)
        || (name == "m_hand_l" && !blockList.handL)
        || (name == "m_hand_r" && !blockList.handR)
        || (name == "m_hip" && !blockList.hip)
        || (name == "m_shin_l" && !blockList.shinL)
        || (name == "m_shin_r" && !blockList.shinR)
        || (name == "m_shoulder_l" && !blockList.shoulderL)
        || (name == "m_shoulder_r" && !blockList.shoulderR)
        || (name == "m_thigh_l" && !blockList.thighL)
        || (name == "m_thigh_r" && !blockList.thighR)
        || (name == "m_wrist_l" && !blockList.wristL)
        || (name == "m_wrist_r" && !blockList.wristR)
        || (name == "m_eyebrows"+characterData.indexes.eyebrows && !blockList.eyebrows)
        || (name == "m_eyes"+characterData.indexes.eyes && !blockList.eyes)
        || (name == "m_head"+characterData.indexes.head)
        || (name == "m_shirt"+characterData.indexes.shirts)
        || (name == "m_pants"+characterData.indexes.pants)
        || (name == "m_shoes"+characterData.indexes.shoes)
        || (name == "m_underwear"+characterData.indexes.underwear+"_top" && !blockList.underwearTop)
        || (name == "m_underwear"+characterData.indexes.underwear+"_bot" && !blockList.underwearBot)
        || (name == "m_glasses"+characterData.indexes.glasses && !blockList.glasses)
        || (name == "m_gloves"+characterData.indexes.gloves)
        || (name == "m_hair"+characterData.indexes.hair && !blockList.hair)
        || (name == "m_facial"+characterData.indexes.facial)
        || (name == "m_earrings"+characterData.indexes.earrings && !blockList.earrings)
        || (name == "m_bracelet"+characterData.indexes.bracelet && !blockList.bracelets)
      );
  }

  private setDefaultPosition(){
    if(this.lastPos == null){
      let offset = {
        x: this.id%7,
        y: Math.floor(this.id / 7)
      }
      offset.x = Math.floor((offset.x+1)/2) * (offset.x % 2 > 0 ? -1 : 1);
      this.obj.position.set(offset.x*1.5, 0, (offset.y*-1.5)+5);
    }else{
      this.obj.position.set(this.lastPos.x, this.lastPos.y, this.lastPos.z);
      this.obj.rotation.set(this.lastRotation.x, this.lastRotation.y, this.lastRotation.z);
    }

  }

  updateTweenStatus(){
    let status = Menu.generalData.characters.moving;
    if(!status && this.tween){
      this.tween.pause();
      this.tween.kill();
      this.tween = null;
      this.setDefaultPosition();
    }else if(status && !this.tween){
      this.setTween()
    }
  }
  private setTween(){
    if(this.tween != null || this.id == 0){
      return
    }
    this.tween = gsap.to(this.obj.position,{
      x:(Math.random()*20)-10,
      z:(Math.random()*-20)+10,
      duration:1,
      onComplete:()=>{
        if(this.tween){
          this.tween.kill();
        }
        this.tween = null;
        this.setTween()
      }
    })
  }
}
