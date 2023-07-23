import {
  AnimationAction,
  AnimationMixer,
  Camera,
  Group,
  Object3D, OrthographicCamera,
  PerspectiveCamera,
  Quaternion, Scene,
  Vector3,
} from 'three';
import { ControlKeys } from '../enums/ControlKeys';
import { World } from '../World';
import { CustomOrbitControls } from './CustomOrbitControls';
import { JoyStickControl } from './UIManager/parts/JoyStick/JoyStick';

const pi = Math.PI;

export class CharacterControls {

  private DIRECTIONS  =[ControlKeys.W, ControlKeys.A, ControlKeys.S, ControlKeys.D]
  orbitControl: CustomOrbitControls


  // temporary data
  private walkDirection = new Vector3()
  private rotateAngle = new Vector3(0, 1, 0)
  private rotateQuarternion: Quaternion = new Quaternion()
  private cameraTarget = new Vector3()

  // constants
  private fadeDuration: number = 0.2
  private runVelocity = 5
  private walkVelocity = 2;
  private lastDirection = 0;
  enabled_:boolean =true;
  private cameraContainer:Object3D
  constructor() {
    this.cameraContainer = World.elements.camera;



    this.orbitControl = new CustomOrbitControls();
    this.orbitControl.enabled = true;
    this.orbitControl.customBehavior = true;
    this.orbitControl.enableDamping = true;
    this.orbitControl.minDistance = 5;
    this.orbitControl.maxDistance = 15;
    this.orbitControl.enablePan = false;
    this.orbitControl.enableZoom = false;
    this.orbitControl.maxPolarAngle = pi / 2 - 0.05;

  }

  private isRunning(){
    return World.keysPressed[ControlKeys.SHIFT] || JoyStickControl.intensity > 0.8
  }

  set enabled(k){
    this.orbitControl.enabled  = k;
    this.enabled_ = k;
  }
  get enabled (){
    return this.enabled_;
  }
  public update(delta:number) {
    if(!this.enabled){
      return;
    }
    const character = World.elements.characters[0];
    if(character == null){
      return
    }
    this.orbitControl.update();



    let isFromJoyStick = false;
    let directionPressed = this.DIRECTIONS.some(key => World.keysPressed[key] == true);
    if(!directionPressed){
      directionPressed = JoyStickControl.intensity > 0;
      isFromJoyStick = JoyStickControl.intensity > 0;
    }

    var play = '';
    if (directionPressed && this.isRunning()) {
      play = 'running'
    } else if (directionPressed) {
      play = 'walking'
    } else {
      play = 'idle'
    }

    character.prepareCrossFade(play);

    if (character.actionSelected == 'running' || character.actionSelected == 'walking') {
      // calculate towards camera direction
      var angleYCameraDirection = Math.atan2(
        (this.cameraContainer.position.x - character.obj.position.x),
        (this.cameraContainer.position.z - character.obj.position.z))

      // diagonal movement angle offset
      var directionOffset = isFromJoyStick ? JoyStickControl.directionAngle   : this.directionOffsetFromKeys(World.keysPressed);
      this.lastDirection = directionOffset;

      // rotate model
      this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
      character.obj.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

      // calculate direction
      World.camera.getWorldDirection(this.walkDirection)
      this.walkDirection.y = 0
      this.walkDirection.normalize()
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

      // run/walk velocity
      const velocity = character.actionSelected == 'running' ? this.runVelocity : this.walkVelocity

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta
      const moveZ = this.walkDirection.z * velocity * delta
      character.obj.position.x += moveX
      character.obj.position.z += moveZ
      this.updateCameraTarget(character.obj,moveX, moveZ)
    }else{
      this.updateCameraTarget(character.obj,0,0)
    }
  }

  private updateCameraTarget(obj:Object3D,moveX: number, moveZ: number) {
    // move camera
    this.cameraContainer.position.x += moveX
    this.cameraContainer.position.z += moveZ

    // update camera target
    this.cameraTarget.x = obj.position.x
    this.cameraTarget.y = obj.position.y + 1
    this.cameraTarget.z = obj.position.z
    this.orbitControl.target = this.cameraTarget
  }

  private directionOffsetFromKeys(keysPressed: any) {
    var directionOffset = null;

    if (keysPressed[ControlKeys.W]) {
      if (keysPressed[ControlKeys.A]) {
        directionOffset = pi / 4 // w+a
      } else if (keysPressed[ControlKeys.D]) {
        directionOffset = - pi / 4 // w+d
      }else{
        directionOffset = 0 // w
      }
    } else if (keysPressed[ControlKeys.S]) {
      if (keysPressed[ControlKeys.A]) {
        directionOffset = pi / 4 + pi / 2 // s+a
      } else if (keysPressed[ControlKeys.D]) {
        directionOffset = -pi / 4 - pi / 2 // s+d
      } else {
        directionOffset = pi // s
      }
    } else if (keysPressed[ControlKeys.A]) {
      directionOffset = pi / 2 // a
    } else if (keysPressed[ControlKeys.D]) {
      directionOffset = - pi / 2 // d
    }

    if(directionOffset == null){
      directionOffset = this.lastDirection;
    }

    return directionOffset
  }

}
