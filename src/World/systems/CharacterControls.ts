import {
  AnimationAction,
  AnimationMixer,
  Camera,
  Group,
  Object3D, OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from 'three';
import { ControlKeys } from '../enums/ControlKeys';
import { World } from '../World';
import { CustomOrbitControls } from './CustomOrbitControls';


export class CharacterControls {

  private DIRECTIONS  =[ControlKeys.W, ControlKeys.A, ControlKeys.S, ControlKeys.D]
  private orbitControl: CustomOrbitControls
  private camera: Camera


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
  enabled:boolean =true;

  constructor(camera: PerspectiveCamera | OrthographicCamera,domElement?: HTMLElement) {

    this.orbitControl = new CustomOrbitControls(camera,domElement);
    this.orbitControl.enabled = true;
    this.orbitControl.customBehavior = true;
    this.orbitControl.enableDamping = true;
    this.orbitControl.minDistance = 5;
    this.orbitControl.maxDistance = 15;
    this.orbitControl.enablePan = false;
    this.orbitControl.maxPolarAngle = Math.PI / 2 - 0.05;
    this.camera = camera;
  }

  private isRunning(){
    return World.keysPressed[ControlKeys.SHIFT]
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
    const directionPressed = this.DIRECTIONS.some(key => World.keysPressed[key] == true)

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
        (this.camera.position.x - character.obj.position.x),
        (this.camera.position.z - character.obj.position.z))

      // diagonal movement angle offset
      var directionOffset = this.directionOffset(World.keysPressed)

      // rotate model
      this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
      character.obj.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

      // calculate direction
      this.camera.getWorldDirection(this.walkDirection)
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
    }
  }

  private updateCameraTarget(obj:Object3D,moveX: number, moveZ: number) {
    // move camera
    this.camera.position.x += moveX
    this.camera.position.z += moveZ

    // update camera target
    this.cameraTarget.x = obj.position.x
    this.cameraTarget.y = obj.position.y + 1
    this.cameraTarget.z = obj.position.z
    this.orbitControl.target = this.cameraTarget
  }

  private directionOffset(keysPressed: any) {
    var directionOffset = null;

    if (keysPressed[ControlKeys.W]) {
      if (keysPressed[ControlKeys.A]) {
        directionOffset = Math.PI / 4 // w+a
      } else if (keysPressed[ControlKeys.D]) {
        directionOffset = - Math.PI / 4 // w+d
      }else{
        directionOffset = 0 // w
      }
    } else if (keysPressed[ControlKeys.S]) {
      if (keysPressed[ControlKeys.A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
      } else if (keysPressed[ControlKeys.D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
      } else {
        directionOffset = Math.PI // s
      }
    } else if (keysPressed[ControlKeys.A]) {
      directionOffset = Math.PI / 2 // a
    } else if (keysPressed[ControlKeys.D]) {
      directionOffset = - Math.PI / 2 // d
    }

    if(directionOffset == null){
      directionOffset = this.lastDirection;
    }
    this.lastDirection = directionOffset;
    return directionOffset
  }
}
