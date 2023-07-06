import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  BufferAttribute, BufferGeometry,  Group, Material,
  Mesh,
  MeshLambertMaterial,
  Object3D, Skeleton, SkinnedMesh,
  Texture,
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
  canvas:HTMLCanvasElement;
  canvasCtx:CanvasRenderingContext2D;
  mixer:AnimationMixer
  actions:{
    running:AnimationAction,
    walking:AnimationAction,
    idle:AnimationAction
  }
  uvOri:BufferAttribute
  actionSelected:string;

  tween:gsap.core.Tween|null;
  constructor(private id:number,userData_?:ICharacterUserData) {

    if(userData_){
      this.userData = userData_;
    }else{
      this.userData = this.createNewUserData();
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
     if(!remake){
       for(let config in indexes){
         if(this.userData.indexes[config] != indexes[config]){
           remake = true;
           this.userData.indexes[config] =indexes[config];
         }
       }
     }

     if(remake){
       let material:MeshLambertMaterial;
       let canvas:HTMLCanvasElement;
       let texture:Texture;
       let canvasCtx:CanvasRenderingContext2D;

       if(this.obj != null){
         World.scene.remove(this.obj)
         canvas = this.canvas;
         canvasCtx = this.canvasCtx;
       }else{
         material = new MeshLambertMaterial();
         let textureObjs = TextureComposer.characterTextureMaker(this.userData);
         canvas = textureObjs.canvas;
         canvasCtx = textureObjs.ctx;
         texture = new Texture(canvas);
         texture.needsUpdate = true;
         material.map = texture;

       }
       let mesh = this.meshMaker(this.userData,World.materials.types[Menu.generalData.material.selected]);

       let uvOri = ((mesh.children[0] as Mesh).geometry.attributes["uv"] as BufferAttribute).clone();
       const container = new Object3D();
       const objMesh  = mesh;

       const mixer = new AnimationMixer(objMesh);
       const actions={
         running:mixer.clipAction(runningClip.clone()),
         walking:mixer.clipAction(walkingClip.clone()),
         idle:mixer.clipAction(idleClip.clone())
       };

       let offset = {
         x: this.id%7,
         y: Math.floor(this.id / 7)
       }
       offset.x = Math.floor((offset.x+1)/2) * (offset.x % 2 > 0 ? -1 : 1);

       container.attach(objMesh)
       container.scale.set(0.01, 0.01, 0.01);

       for(let k in actions){
         actions[k].play();
         this.animationSetWeight(actions[k],0)
       }

       let actionNames = ["idle","running","walking"];
       let actionSelected = actionNames[Math.floor(Math.random()*actionNames.length)]
       this.animationSetWeight(actions[actionSelected],1)


       World.loop.addMixer(mixer);

       World.scene.add(container);
       this.obj = container;
       this.canvas = canvas;
       this.canvasCtx = canvasCtx;
       this.mixer = mixer;
       this.uvOri = uvOri;
       this.actions = actions;
       this.actionSelected = actionSelected;
       this.setDefaultPosition();
       this.updateTweenStatus();
     }
   }
  private animationSetWeight( action:AnimationAction, weight:number ){
    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

  }
  private animationSynchronizeCrossFade( start:string, end:string, duration:number ) {

    this.mixer.addEventListener( 'loop', onLoopFinished );

    let startAction = this.actions[start];
    let this_=this;
    function onLoopFinished( event ) {

      if(this_.obj == null){
        return
      }
      if ( event.action === startAction ) {

        this_.mixer.removeEventListener( 'loop', onLoopFinished );

        this_.animationExecuteCrossFade( start, start, duration );

      }

    }

  }
  private animationExecuteCrossFade(start:string, end:string, duration:number  ) {

    if(this.obj == null){
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
  private prepareCrossFade( end:string, defaultDuration :number) {
    if(this.obj == null){
      return
    }


    let startAction = this.actions[this.actionSelected]

    const duration = 0.5;


    if ( startAction ===this.actions.idle ) {

      this.animationExecuteCrossFade( this.actionSelected, end, duration );

    } else if(this.obj) {
      this.animationSynchronizeCrossFade( this.actionSelected, end, duration );

    }

  }

  private meshMaker(characterData:ICharacterUserData,material:Material){

    let blockList = this.meshBlocker(characterData);


    let bufferGeometry:BufferGeometry |null = null;
    let scene = SkeletonClone(Loader.files.character.gltf.scene);
    let skeleton:Skeleton | null= null;
    let group = new Group();
    for(let i = 0;i<scene.children.length;i++){

      let obj = scene.children[i].clone(true);
      let type = obj.name.split("_")[0]

      if(this.meshChecker(obj.name,characterData,blockList) && (obj as Mesh).isMesh){
        if(bufferGeometry){
          bufferGeometry = BufferGeometryUtils.mergeBufferGeometries([bufferGeometry,(obj as Mesh).geometry.clone()],true)
        }else{
          bufferGeometry = (obj as Mesh).geometry.clone()
        }
        skeleton = (obj as SkinnedMesh).skeleton.clone();

      }
    }
    const objMesh1  = new SkinnedMesh(bufferGeometry as BufferGeometry,material);
    objMesh1.add(skeleton?.bones[0].parent as Object3D)
    objMesh1.bind(skeleton as Skeleton)
    group.attach(objMesh1)
    group.position.set(0, 0, 0);
    group.scale.set(0.01, 0.01, 0.01);


    return group

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
    let offset = {
      x: this.id%7,
      y: Math.floor(this.id / 7)
    }
    offset.x = Math.floor((offset.x+1)/2) * (offset.x % 2 > 0 ? -1 : 1);
    this.obj.position.set(offset.x*1.5, 0, (offset.y*-1.5)+5);
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
    if(this.tween != null){
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
