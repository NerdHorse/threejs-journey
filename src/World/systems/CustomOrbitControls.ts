import {
  Camera,
  EventDispatcher,
  MOUSE, OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
} from 'three';
import { World } from '../World';

const STATE = {
  NONE: - 1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
};

let state = STATE.NONE;

const EPS = 0.000001;

// current position in spherical coordinates
const spherical = new Spherical();
const sphericalDelta = new Spherical();

let scale = 1;
const panOffset = new Vector3();
let zoomChanged = false;

const rotateStart = new Vector2();
const rotateEnd = new Vector2();
const rotateDelta = new Vector2();

const panStart = new Vector2();
const panEnd = new Vector2();
const panDelta = new Vector2();

const dollyStart = new Vector2();
const dollyEnd = new Vector2();
const dollyDelta = new Vector2();

const pointers_:{
  event:any,
  active:boolean,
  position?:Vector2
}[] = [];



/**
 * Orbit controls allow the camera to orbit around a target.
 * @param object - The camera to be controlled. The camera must not
 * be a child of another object, unless that object is the scene itself.
 * @param domElement - The HTML element used for
 * event listeners.
 */


export class CustomOrbitControls extends EventDispatcher {
  private updateOffset = new Vector3();

  private panLeftV= new Vector3();
  private panUpV= new Vector3();
  private panOffset = new Vector3();

  private quat:Quaternion;
  // so camera.up is the orbit axis
  private quatInverse:Quaternion;

  private lastPosition = new Vector3();
  private lastQuaternion = new Quaternion();

  private twoPI = 2 * Math.PI;

  private _changeEvent = { type: 'change' };
  private _startEvent = { type: 'start' };
  private _endEvent = { type: 'end' };

  /**
   * The HTMLElement used to listen for mouse / touch events.
   * This must be passed in the constructor;
   * changing it here will not set up new event listeners.
   */
  domElement: HTMLElement | Document;

  /**
   * When set to `false`, the controls will not respond to user input.
   * @default true
   */
  enabled: boolean;

  /**
   * The focus point of the controls, the .object orbits around this.
   * It can be updated manually at any point to change the focus
   * of the controls.
   */
  target: Vector3;

  /** @deprecated */
  center: Vector3;

  /**
   * How far you can dolly in ( PerspectiveCamera only ).
   * @default 0
   */
  minDistance: number;

  /**
   * How far you can dolly out ( PerspectiveCamera only ).
   * @default Infinity
   */
  maxDistance: number;

  /**
   * How far you can zoom in ( OrthographicCamera only ).
   * @default 0
   */
  minZoom: number;

  /**
   * How far you can zoom out ( OrthographicCamera only ).
   * @default Infinity
   */
  maxZoom: number;

  /**
   * How far you can orbit vertically, lower limit.
   * Range is 0 to Math.PI radians.
   * @default 0
   */
  minPolarAngle: number;

  /**
   * How far you can orbit vertically, upper limit.
   * Range is 0 to Math.PI radians.
   * @default Math.PI.
   */
  maxPolarAngle: number;

  /**
   * How far you can orbit horizontally, lower limit.
   * If set, the interval [ min, max ]
   * must be a sub-interval of [ - 2 PI, 2 PI ],
   * with ( max - min < 2 PI ).
   * @default Infinity
   */
  minAzimuthAngle: number;

  /**
   * How far you can orbit horizontally, upper limit.
   * If set, the interval [ min, max ] must be a sub-interval
   * of [ - 2 PI, 2 PI ], with ( max - min < 2 PI ).
   * @default Infinity
   */
  maxAzimuthAngle: number;

  /**
   * Set to true to enable damping (inertia), which can
   * be used to give a sense of weight to the controls.
   * Note that if this is enabled, you must call
   * .update () in your animation loop.
   * @default false
   */
  enableDamping: boolean;

  /**
   * The damping inertia used if .enableDamping is set to true.
   * Note that for this to work,
   * you must call .update () in your animation loop.
   * @default 0.05
   */
  dampingFactor: number;

  /**
   * Enable or disable zooming (dollying) of the camera.
   * @default true
   */
  enableZoom: boolean;

  /**
   * Speed of zooming / dollying.
   * @default 1
   */
  zoomSpeed: number;

  /**
   * Enable or disable horizontal and
   * vertical rotation of the camera.
   * Note that it is possible to disable a single axis
   * by setting the min and max of the polar angle or
   * azimuth angle to the same value, which will cause
   * the vertical or horizontal rotation to be fixed at that value.
   * @default true
   */
  enableRotate: boolean;

  /**
   * Speed of rotation.
   * @default 1
   */
  rotateSpeed: number;

  /**
   * Enable or disable camera panning.
   * @default true
   */
  enablePan: boolean;

  /**
   * Speed of panning.
   * @default 1
   */
  panSpeed: number;

  /**
   * Defines how the camera's position is translated when panning.
   * If true, the camera pans in screen space. Otherwise,
   * the camera pans in the plane orthogonal to the camera's
   * up direction. Default is true for OrbitControls; false for MapControls.
   * @default true
   */
  screenSpacePanning: boolean;

  /**
   * How fast to pan the camera when the keyboard is used.
   * Default is 7.0 pixels per keypress.
   * @default 7
   */
  keyPanSpeed: number;

  /**
   * Set to true to automatically rotate around the target.
   * Note that if this is enabled, you must call
   * .update () in your animation loop.
   */
  autoRotate: boolean;

  /**
   * How fast to rotate around the target if .autoRotate is true.
   * Default is 2.0, which equates to 30 seconds per orbit at 60fps.
   * Note that if .autoRotate is enabled, you must call
   * .update () in your animation loop.
   * @default 2
   */
  autoRotateSpeed: number;

  /**
   * This object contains references to the keycodes for controlling
   * camera panning. Default is the 4 arrow keys.
   */
  keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };

  /**
   * This object contains references to the mouse actions used
   * by the controls.
   */
  mouseButtons: Partial<{ LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE }>;

  /**
   * This object contains references to the touch actions used by
   * the controls.
   */
  touches: Partial<{ ONE: TOUCH; TWO: TOUCH }>;

  /**
   * Used internally by the .saveState and .reset methods.
   */
  target0: Vector3;

  /**
   * Used internally by the .saveState and .reset methods.
   */
  position0: Vector3;

  /**
   * Used internally by the .saveState and .reset methods.
   */

  zoom0: number;

  private triggerInterface:{
    onContextMenu:( event:MouseEvent )=>void,
    onPointerDown:( event:PointerEvent )=>void,
    onPointerCancel:( event:PointerEvent )=>void,
    onMouseWheel:( event:WheelEvent )=>void,
    onPointerMove:( event:PointerEvent )=>void,
    onPointerUp:( event:PointerEvent )=>void,
    onKeyDown:( event: KeyboardEvent)=>void
  }

  customBehavior:boolean = false;

  constructor( ){
    super();
    this.quat = new Quaternion().setFromUnitVectors( World.camera.up, new Vector3( 0, 1, 0 ) );
    this.quatInverse = this.quat.clone().invert();
    this.domElement = World.renderer.domElement;
    this.domElement.style.touchAction = 'none'; // disable touch scroll

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

    // The four arrow keys
    this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

    // Mouse buttons
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

    // Touch fingers
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = World.elements.camera.position.clone();
    this.zoom0 = World.camera.zoom;

    // the target DOM element for key events
    this._domElementKeyEvents = null;

    let this_=this;
    this.triggerInterface={
      onContextMenu:( event:any )=>{this_.onContextMenu(event)},
      onPointerDown:( event:any )=>{this_.onPointerDown(event)},
      onPointerCancel:( event:any )=>{this_.onPointerCancel(event)},
      onMouseWheel:( event:any )=>{this_.onMouseWheel(event)},
      onPointerMove:( event:any )=>{this_.onPointerMove(event)},
      onPointerUp:( event:any )=>{this_.onPointerUp(event)},
      onKeyDown:( event:any )=>{this_.onKeyDown(event)}
    };

    this.domElement.addEventListener( 'contextmenu', this.triggerInterface.onContextMenu );

    this.domElement.addEventListener( 'pointerdown', this.triggerInterface.onPointerDown );
    this.domElement.addEventListener( 'pointercancel', this.triggerInterface.onPointerCancel );
    this.domElement.addEventListener( 'wheel', this.triggerInterface.onMouseWheel, { passive: false } );

    // force an update at start

    this.update();
  }
  _domElementKeyEvents:any;

  private triggerBefore:{
    myID:string
    onContextMenu:(( event:MouseEvent )=>boolean),
    onPointerDown:(( event:PointerEvent )=>boolean),
    onPointerCancel:(( event:PointerEvent )=>boolean),
    onMouseWheel:(( event:WheelEvent )=>boolean),
    onPointerMove:(( event:PointerEvent )=>boolean),
    onPointerUp:(( event:PointerEvent )=>boolean),
    onKeyDown:(( event: KeyboardEvent)=>boolean)
    ctx:any
  }[]=[];
  addTriggerBefore(
    listeners:{
      myID:string
      onContextMenu:( event:MouseEvent )=>boolean,
      onPointerDown:( event:PointerEvent )=>boolean,
      onPointerCancel:( event:PointerEvent )=>boolean,
      onMouseWheel:( event:WheelEvent )=>boolean,
      onPointerMove:( event:PointerEvent )=>boolean,
      onPointerUp:( event:PointerEvent )=>boolean,
      onKeyDown:( event: KeyboardEvent)=>boolean,
      ctx:any
    }
  ){
    this.triggerBefore.push(listeners)
  };
  removeTriggerBefore(id:string){
    let newArray = [];
    for(let i = 0;i<this.triggerBefore.length;i++){
      if(this.triggerBefore[i].myID != id){
        newArray.push(this.triggerBefore[i])
      }
    }
    this.triggerBefore = newArray;
  }
  private getAutoRotationAngle() {

    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

  }
  private rotateLeft( angle ) {

    sphericalDelta.theta -= angle;

  }
  private getZoomScale() {

    return Math.pow( 0.95, this.zoomSpeed );

  }
  private rotateUp( angle ) {

    sphericalDelta.phi -= angle;

  }
  private panLeft( distance, objectMatrix ) {

    this.panLeftV.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
    this.panLeftV.multiplyScalar( - distance );

    panOffset.add( this.panLeftV );

  }
  private panUp( distance, objectMatrix ) {

    if (this.screenSpacePanning === true ) {

      this.panUpV.setFromMatrixColumn( objectMatrix, 1 );

    } else {

      this.panUpV.setFromMatrixColumn( objectMatrix, 0 );
      this.panUpV.crossVectors(World.camera.up, this.panUpV );

    }

    this.panUpV.multiplyScalar( distance );

    panOffset.add( this.panUpV );

  }

  private pan( deltaX, deltaY ) {

    const element =this.domElement;

    // perspective
    const position =World.elements.camera.position;
    this.panOffset.copy( position ).sub(this.target );
    let targetDistance = this.panOffset.length();

    // half of the fov is center to top of screen
    targetDistance *= Math.tan( (World.camera.fov / 2 ) * Math.PI / 180.0 );

    // we use only clientHeight here so aspect ratio does not distort speed
    // @ts-ignore
    this.panLeft( 2 * deltaX * targetDistance / element.clientHeight,this.object.matrix );
    // @ts-ignore
    this.panUp( 2 * deltaY * targetDistance / element.clientHeight,this.object.matrix );

  }
  /**
   * Update the controls. Must be called after any manual changes
   * to the camera's transform, or in the update loop if .autoRotate
   * or .enableDamping are set.
   */
  update() {
    if(!this.enabled){
      return ;
    }

    const position = World.elements.camera.position;

    this.updateOffset.copy( position ).sub( this.target );

    // rotate offset to "y-axis-is-up" space
    this.updateOffset.applyQuaternion( this.quat );

    // angle from z-axis around y-axis
    spherical.setFromVector3( this.updateOffset );

    if ( this.autoRotate && state === STATE.NONE ) {

      this.rotateLeft( this.getAutoRotationAngle() );

    }

    if ( this.enableDamping ) {

      spherical.theta += sphericalDelta.theta * this.dampingFactor;
      spherical.phi += sphericalDelta.phi * this.dampingFactor;

    } else {

      spherical.theta += sphericalDelta.theta;
      spherical.phi += sphericalDelta.phi;

    }

    // restrict theta to be between desired limits

    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;

    if ( isFinite( min ) && isFinite( max ) ) {

      if ( min < - Math.PI ) min += this.twoPI; else if ( min > Math.PI ) min -= this.twoPI;

      if ( max < - Math.PI ) max += this.twoPI; else if ( max > Math.PI ) max -= this.twoPI;

      if ( min <= max ) {

        spherical.theta = Math.max( min, Math.min( max, spherical.theta ) );

      } else {

        spherical.theta = ( spherical.theta > ( min + max ) / 2 ) ?
          Math.max( min, spherical.theta ) :
          Math.min( max, spherical.theta );

      }

    }

    // restrict phi to be between desired limits
    spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, spherical.phi ) );

    spherical.makeSafe();


    spherical.radius *= scale;

    // restrict radius to be between desired limits
    spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, spherical.radius ) );

    // move target to panned location

    if ( this.enableDamping === true ) {

      this.target.addScaledVector( panOffset, this.dampingFactor );

    } else {

      this.target.add( panOffset );

    }

    this.updateOffset.setFromSpherical( spherical );

    // rotate offset back to "camera-up-vector-is-up" space
    this.updateOffset.applyQuaternion(this. quatInverse );

    position.copy( this.target ).add( this.updateOffset );

    World.camera.lookAt( this.target );

    if ( this.enableDamping === true ) {

      sphericalDelta.theta *= ( 1 - this.dampingFactor );
      sphericalDelta.phi *= ( 1 - this.dampingFactor );

      panOffset.multiplyScalar( 1 - this.dampingFactor );

    } else {

      sphericalDelta.set( 0, 0, 0 );

      panOffset.set( 0, 0, 0 );

    }

    scale = 1;

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if ( zoomChanged ||
      this.lastPosition.distanceToSquared( World.elements.camera.position ) > EPS ||
      8 * ( 1 - this.lastQuaternion.dot( World.elements.camera.quaternion ) ) > EPS ) {

      this.dispatchEvent( this._changeEvent );

      this.lastPosition.copy( World.elements.camera.position );
      this.lastQuaternion.copy( World.elements.camera.quaternion );
      zoomChanged = false;

      return true;

    }

    return false;

  }

  /**
   * Adds key event listeners to the given DOM element. `window`
   * is a recommended argument for using this method.
   * @param domElement
   */
  listenToKeyEvents(domElement: HTMLElement | Window): void{
    // @ts-ignore
    domElement.addEventListener( 'keydown', this.triggerInterface.onKeyDown );
    this._domElementKeyEvents = domElement;
  }

  /**
   * Save the current state of the controls. This can later be
   * recovered with .reset.
   */
  saveState(): void{

    this.target0.copy( this.target );
    this.position0.copy( World.elements.camera.position );
    this.zoom0 =World.camera.zoom;
  }

  /**
   * Reset the controls to their state from either the last time
   * the .saveState was called, or the initial state.
   */
  reset(): void{
    this.target.copy( this.target0 );
    World.elements.camera.position.copy( this.position0 );
    World.camera.zoom = this.zoom0;

    World.camera.updateProjectionMatrix();
    this.dispatchEvent( this._changeEvent );

    this.update();

    state = STATE.NONE;

  }

  /**
   * Remove all the event listeners.
   */


  dispose(): void{

    // @ts-ignore
    this.domElement.removeEventListener( 'contextmenu', this.triggerInterface.onContextMenu );

    // @ts-ignore
    this.domElement.removeEventListener( 'pointerdown', this.triggerInterface.onPointerDown );
    // @ts-ignore
    this.domElement.removeEventListener( 'pointercancel', this.triggerInterface.onPointerCancel );
    // @ts-ignore
    this.domElement.removeEventListener( 'wheel', this.triggerInterface.onMouseWheel );

    // @ts-ignore
    this.domElement.removeEventListener( 'pointermove', this.triggerInterface.onPointerMove );
    // @ts-ignore
    this.domElement.removeEventListener( 'pointerup', this.triggerInterface.onPointerUp );


    if ( this._domElementKeyEvents !== null ) {

      this._domElementKeyEvents.removeEventListener( 'keydown', this.triggerInterface.onKeyDown );

    }

  }

  /**
   * Get the current vertical rotation, in radians.
   */
  getPolarAngle(): number{

    return spherical.phi;
  }

  /**
   * Get the current horizontal rotation, in radians.
   */
  getAzimuthalAngle(): number{

    return spherical.theta;
  }

  /**
   * Returns the distance from the camera to the target.
   */
  getDistance(): number{
    return World.elements.camera.position.distanceTo( this.target );
  }
  private dollyOut( dollyScale ) {


    scale /= dollyScale;

  }

  private dollyIn( dollyScale ) {


    scale *= dollyScale;

  }

  //
  // event callbacks - update the object state
  //

  private handleMouseDownRotate( event ) {

    rotateStart.set( event.clientX, event.clientY );

  }

  private handleMouseDownDolly( event ) {

    dollyStart.set( event.clientX, event.clientY );

  }

  private handleMouseDownPan( event ) {

    panStart.set( event.clientX, event.clientY );

  }

  private handleMouseMoveRotate( event ) {

    rotateEnd.set( event.clientX, event.clientY );

    rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( this.rotateSpeed );

    const element = this.domElement;

    // @ts-ignore
    this.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

    // @ts-ignore
    this.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

    rotateStart.copy( rotateEnd );

    this.update();

  }

  private handleMouseMoveDolly( event ) {

    dollyEnd.set( event.clientX, event.clientY );

    dollyDelta.subVectors( dollyEnd, dollyStart );

    if ( dollyDelta.y > 0 ) {

      this.dollyOut( this.getZoomScale() );

    } else if ( dollyDelta.y < 0 ) {

      this.dollyIn( this.getZoomScale() );

    }

    dollyStart.copy( dollyEnd );

    this.update();

  }

  private handleMouseMovePan( event ) {

    panEnd.set( event.clientX, event.clientY );

    panDelta.subVectors( panEnd, panStart ).multiplyScalar( this.panSpeed );

    this.pan( panDelta.x, panDelta.y );

    panStart.copy( panEnd );

    this.update();

  }

  private handleMouseWheel( event ) {

    if ( event.deltaY < 0 ) {

      this.dollyIn( this.getZoomScale() );

    } else if ( event.deltaY > 0 ) {

      this.dollyOut( this.getZoomScale() );

    }

    this.update();

  }

  private handleKeyDown( event ) {

    let needsUpdate = false;

    switch ( event.code ) {

      case this.keys.UP:

        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

          // @ts-ignore
          this.rotateUp( 2 * Math.PI * this.rotateSpeed / this.domElement.clientHeight );

        } else {

          this.pan( 0, this.keyPanSpeed );

        }

        needsUpdate = true;
        break;

      case this.keys.BOTTOM:

        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

          // @ts-ignore
          this.rotateUp( - 2 * Math.PI * this.rotateSpeed / this.domElement.clientHeight );

        } else {

          this.pan( 0, - this.keyPanSpeed );

        }

        needsUpdate = true;
        break;

      case this.keys.LEFT:

        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

          // @ts-ignore
          this.rotateLeft( 2 * Math.PI * this.rotateSpeed / this.domElement.clientHeight );

        } else {

          this.pan( this.keyPanSpeed, 0 );

        }

        needsUpdate = true;
        break;

      case this.keys.RIGHT:

        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

          // @ts-ignore
          this.rotateLeft( - 2 * Math.PI * this.rotateSpeed / this.domElement.clientHeight );

        } else {

          this.pan( - this.keyPanSpeed, 0 );

        }

        needsUpdate = true;
        break;

    }

    if ( needsUpdate ) {

      // prevent the browser from scrolling on cursor keys
      event.preventDefault();

      this.update();

    }


  }

  private handleTouchStartRotate() {

    let pointers = this.getActivePointers();
    if ( pointers.length === 1 ) {

      rotateStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

    } else {

      const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
      const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

      rotateStart.set( x, y );

    }

  }

  private handleTouchStartPan() {

    let pointers = this.getActivePointers();
    if ( pointers.length === 1 ) {

      panStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

    } else {

      const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
      const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

      panStart.set( x, y );

    }

  }

  private handleTouchStartDolly() {

    let pointers = this.getActivePointers();
    const dx = pointers[ 0 ].pageX - pointers[ 1 ].pageX;
    const dy = pointers[ 0 ].pageY - pointers[ 1 ].pageY;

    const distance = Math.sqrt( dx * dx + dy * dy );

    dollyStart.set( 0, distance );

  }

  private handleTouchStartDollyPan() {

    if ( this.enableZoom ) this.handleTouchStartDolly();

    if ( this.enablePan ) this.handleTouchStartPan();

  }

  private handleTouchStartDollyRotate() {

    if ( this.enableZoom ) this.handleTouchStartDolly();

    if ( this.enableRotate ) this.handleTouchStartRotate();

  }

  private handleTouchMoveRotate( event ) {

    let pointers = this.getActivePointers();
    if ( pointers.length == 1 ) {

      rotateEnd.set( event.pageX, event.pageY );

    } else {

      const position = this.getSecondPointerPosition( event );

      const x = 0.5 * ( event.pageX + position.x );
      const y = 0.5 * ( event.pageY + position.y );

      rotateEnd.set( x, y );

    }

    rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( this.rotateSpeed );

    const element = this.domElement;

    // @ts-ignore
    this.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

    // @ts-ignore
    this.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

    rotateStart.copy( rotateEnd );

  }

  private handleTouchMovePan( event ) {

    let pointers = this.getActivePointers();
    if ( pointers.length === 1 ) {

      panEnd.set( event.pageX, event.pageY );

    } else {

      const position = this.getSecondPointerPosition( event );

      const x = 0.5 * ( event.pageX + position.x );
      const y = 0.5 * ( event.pageY + position.y );

      panEnd.set( x, y );

    }

    panDelta.subVectors( panEnd, panStart ).multiplyScalar( this.panSpeed );

    this.pan( panDelta.x, panDelta.y );

    panStart.copy( panEnd );

  }

  private handleTouchMoveDolly( event ) {

    const position = this.getSecondPointerPosition( event );

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;

    const distance = Math.sqrt( dx * dx + dy * dy );

    dollyEnd.set( 0, distance );

    dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, this.zoomSpeed ) );

    this.dollyOut( dollyDelta.y );

    dollyStart.copy( dollyEnd );

  }

  private handleTouchMoveDollyPan( event ) {

    if ( this.enableZoom ) this.handleTouchMoveDolly( event );

    if ( this.enablePan ) this.handleTouchMovePan( event );

  }

  private handleTouchMoveDollyRotate( event ) {

    if ( this.enableZoom ) this.handleTouchMoveDolly( event );

    if ( this.enableRotate ) this.handleTouchMoveRotate( event );

  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  private onPointerDown( event ) {

    if ( this.enabled === false ) return;



    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onPointerDown.call(this.triggerBefore[i].ctx,event)
    }


    if ( pointers_.length === 0 ) {

      // @ts-ignore
      this.domElement.setPointerCapture( event.pointerId );

      // @ts-ignore
      this.domElement.addEventListener( 'pointermove', this.triggerInterface.onPointerMove );
      // @ts-ignore
      this.domElement.addEventListener( 'pointerup', this.triggerInterface.onPointerUp );

    }

    //

    this.addPointer( event,!stop );


    if(stop) return;

    if ( event.pointerType === 'touch' ) {

      this.onTouchStart( event );

    } else {

      this.onMouseDown( event );

    }

  }

  private onPointerMove( event ) {

    if ( this.enabled === false ) return;

    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onPointerMove.call(this.triggerBefore[i].ctx,event)
    }

    if(stop) return;

    if ( event.pointerType === 'touch' ) {

      this.onTouchMove( event );

    } else {

      this.onMouseMove( event );

    }

  }

  private onPointerUp( event ) {

    this.removePointer( event );

    if ( pointers_.length === 0 ) {

      // @ts-ignore
      this.domElement.releasePointerCapture( event.pointerId );

      // @ts-ignore
      this.domElement.removeEventListener( 'pointermove', this.triggerInterface.onPointerMove );
      // @ts-ignore
      this.domElement.removeEventListener( 'pointerup', this.triggerInterface.onPointerUp );

    }
    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onPointerUp.call(this.triggerBefore[i].ctx,event)
    }
    if(stop) return

    this.dispatchEvent( this._endEvent );

    state = STATE.NONE;

  }

  private onPointerCancel( event ) {


    this.removePointer( event );

    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onPointerCancel.call(this.triggerBefore[i].ctx,event)
    }


  }

  private onMouseDown( event ) {

    let mouseAction;

    switch ( event.button ) {

      case 0:

        mouseAction = this.mouseButtons.LEFT;
        break;

      case 1:

        mouseAction = this.mouseButtons.MIDDLE;
        break;

      case 2:

        mouseAction = this.mouseButtons.RIGHT;
        break;

      default:

        mouseAction = - 1;

    }

    switch ( mouseAction ) {

      case MOUSE.DOLLY:

        if ( this.enableZoom === false ) return;

        this.handleMouseDownDolly( event );

        state = STATE.DOLLY;

        break;

      case MOUSE.ROTATE:

        if (!this.customBehavior && ( event.ctrlKey || event.metaKey || event.shiftKey ) ){

          if ( this.enablePan === false ) return;

          this.handleMouseDownPan( event );

          state = STATE.PAN;

        } else {

          if ( this.enableRotate === false ) return;

          this.handleMouseDownRotate( event );

          state = STATE.ROTATE;

        }

        break;

      case MOUSE.PAN:

        if (!this.customBehavior && ( event.ctrlKey || event.metaKey || event.shiftKey )) {

          if ( this.enableRotate === false ) return;

          this.handleMouseDownRotate( event );

          state = STATE.ROTATE;

        } else {

          if ( this.enablePan === false ) return;

          this.handleMouseDownPan( event );

          state = STATE.PAN;

        }

        break;

      default:

        state = STATE.NONE;

    }

    if ( state !== STATE.NONE ) {

      this.dispatchEvent( this._startEvent );

    }

  }

  private onMouseMove( event ) {

    switch ( state ) {

      case STATE.ROTATE:

        if ( this.enableRotate === false ) return;

        this.handleMouseMoveRotate( event );

        break;

      case STATE.DOLLY:

        if ( this.enableZoom === false ) return;

        this.handleMouseMoveDolly( event );

        break;

      case STATE.PAN:

        if ( this.enablePan === false ) return;

        this.handleMouseMovePan( event );

        break;

    }

  }

  private onMouseWheel( event ) {

    if ( this.enabled === false) return;



    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onMouseWheel.call(this.triggerBefore[i].ctx,event)
    }


    if(this.enableZoom === false || state !== STATE.NONE ) return;

    event.preventDefault();

    if(stop) return;

    this.dispatchEvent( this._startEvent );

    this.handleMouseWheel( event );

    this.dispatchEvent( this._endEvent );

  }

  private onKeyDown( event ) {

    if ( this.enabled === false) return;

    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onKeyDown.call(this.triggerBefore[i].ctx,event)
    }
    if(stop) return;

    if(this.enablePan === false ) return;

    this.handleKeyDown( event );

  }

  private onTouchStart( event ) {

    this.trackPointer( event );

    let pointers = this.getActivePointers();
    switch ( pointers.length ) {

      case 1:

        switch ( this.touches.ONE ) {

          case TOUCH.ROTATE:

            if ( this.enableRotate === false ) return;

            this.handleTouchStartRotate();

            state = STATE.TOUCH_ROTATE;

            break;

          case TOUCH.PAN:

            if ( this.enablePan === false ) return;

            this.handleTouchStartPan();

            state = STATE.TOUCH_PAN;

            break;

          default:

            state = STATE.NONE;

        }

        break;

      case 2:

        switch ( this.touches.TWO ) {

          case TOUCH.DOLLY_PAN:

            if ( this.enableZoom === false && this.enablePan === false ) return;

            this.handleTouchStartDollyPan();

            state = STATE.TOUCH_DOLLY_PAN;

            break;

          case TOUCH.DOLLY_ROTATE:

            if ( this.enableZoom === false && this.enableRotate === false ) return;

            this.handleTouchStartDollyRotate();

            state = STATE.TOUCH_DOLLY_ROTATE;

            break;

          default:

            state = STATE.NONE;

        }

        break;

      default:

        state = STATE.NONE;

    }

    if ( state !== STATE.NONE ) {

      this.dispatchEvent( this._startEvent );

    }

  }

  private onTouchMove( event ) {

    this.trackPointer( event );

    switch ( state ) {

      case STATE.TOUCH_ROTATE:

        if ( this.enableRotate === false ) return;

        this.handleTouchMoveRotate( event );

        this.update();

        break;

      case STATE.TOUCH_PAN:

        if ( this.enablePan === false ) return;

        this.handleTouchMovePan( event );

        this.update();

        break;

      case STATE.TOUCH_DOLLY_PAN:

        if ( this.enableZoom === false && this.enablePan === false ) return;

        this.handleTouchMoveDollyPan( event );

        this.update();

        break;

      case STATE.TOUCH_DOLLY_ROTATE:

        if ( this.enableZoom === false && this.enableRotate === false ) return;

        this.handleTouchMoveDollyRotate( event );

        this.update();

        break;

      default:

        state = STATE.NONE;

    }

  }




  private onContextMenu( event ) {

    if ( this.enabled === false ) return;

    let stop = false;
    for(let i = 0;i< this.triggerBefore.length && !stop;i++){
      stop = !this.triggerBefore[i].onContextMenu.call(this.triggerBefore[i].ctx,event)
    }

    event.preventDefault();

  }

  private addPointer( event,active:boolean ) {

    pointers_.push( {event:event,active:active} );

  }

  private removePointer( event ) {


    for ( let i = 0; i < pointers_.length; i ++ ) {

      if ( pointers_[ i ].event.pointerId == event.pointerId ) {

        pointers_.splice( i, 1 );
        return;

      }

    }

  }

  private trackPointer( event ) {

    let position =undefined;
    let index = -1;
    for(let i = 0 ;i < pointers_.length && index < 0;i++){
      if(pointers_[i].event.pointerId == event.pointerId){
        index = i;
      }
    }

    position = pointers_[ index ].position;

    if ( position === undefined ) {

      position = new Vector2();
      pointers_[ index ].position = position;

    }

    position.set( event.pageX, event.pageY );

  }
  private getActivePointers(){
    let pointers = [];
    for(let i = 0;i<pointers_.length;i++){
      if(pointers_[i].active){
        pointers.push(pointers_[i].event)
      }
    }
    return pointers
  }
  private getActivePointers_(){
    let pointers = [];
    for(let i = 0;i<pointers_.length;i++){
      if(pointers_[i].active){
        pointers.push(pointers_[i])
      }
    }
    return pointers
  }
  private getSecondPointerPosition( event ) {
    let pointers = this.getActivePointers_();
    return ( event.pointerId === pointers[ 0 ].event.pointerId ) ? pointers[ 1 ].position : pointers[ 0 ].position;


  }


}
