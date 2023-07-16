import {

  AmbientLight,
  AxesHelper,
  BufferAttribute,
  Color,
  DirectionalLight, DirectionalLightHelper, DynamicDrawUsage,
  GridHelper,
  HalfFloatType, HemisphereLight, HemisphereLightHelper, InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial, MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene, Sprite, SpriteMaterial,
  sRGBEncoding,
  Texture,
  WebGL1Renderer,
  WebGLRenderer,
} from 'three';
import { Loop } from './systems/Loop';
import { NoToneMapping } from 'three/src/constants';
import { ICharacterUserData } from './interfaces/ICharacterUserData';
import { TextureComposer } from './systems/TextureComposer';
import { Menu } from './systems/GUI';
import { Utils } from './systems/Utils';
import { Character } from './components/Character';
import { Loader } from './systems/Loader';
import { HueSaturationEffect} from 'postprocessing';
import { GammaCorrectionEffect } from './systems/GammaCorrectionEffect';
import { RenderComposer } from './systems/RenderComposer';
import { ControlKeys } from './enums/ControlKeys';
import { CharacterControls } from './systems/CharacterControls';
import { FlowersManager } from './components/FlowersManager';
import { CustomOrbitControls } from './systems/CustomOrbitControls';
import { UIManager } from './systems/UIManager/UIManager';


class WorldClass {

  camera: PerspectiveCamera | OrthographicCamera;
  scene: Scene;
  renderer: WebGLRenderer | WebGL1Renderer;
   controls: {
    orbit:CustomOrbitControls,
    character_3th: CharacterControls

  };
  loop: Loop;
  private isRunning_: boolean=false;
  private container: HTMLCanvasElement|null=null;

  ui:UIManager;
  public elements:{
    city:{
      noOutline:Object3D
      withOutline:Object3D
    },
    helpers:{
      grid:GridHelper,
      axes:AxesHelper,
      hemisphereLight:HemisphereLightHelper,
      directionalLight:DirectionalLightHelper,
      directionalTarget:Object3D
    },
    characters:Character[]

    lights:{
      ambient:AmbientLight,
      directional:DirectionalLight,
      hemisphere:HemisphereLight
    }
    flowers:FlowersManager,
    textureViewer:Sprite
  }
  materials:{
    types:{
      lambert:MeshLambertMaterial,
      standard:MeshStandardMaterial,
      outline:MeshBasicMaterial,
      toon:MeshToonMaterial,
      physical:MeshPhysicalMaterial,
      phong:MeshPhongMaterial
    }
  }
  keysPressed:{
    [k:string]:boolean
  }={

  }
  constructor() {
    document.addEventListener('keydown', (event) => {
      if (event.shiftKey) {
        this.keysPressed[ControlKeys.SHIFT] = true
      }
      this.keysPressed[event.key.toLowerCase()] = true
    }, false);
    document.addEventListener('keyup', (event) => {
      this.keysPressed[event.key.toLowerCase()] = false
    }, false);
  }

  init(container: HTMLCanvasElement) {
    this.container = container;


    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      premultipliedAlpha: false,
      depth: true,
      stencil: false
    });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;

    this.renderer.toneMapping = NoToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);


    this.scene = new Scene();
    this.scene.background = new Color(0xdddddd);


    this.camera = new PerspectiveCamera(
      30, // fov = Field Of View
      window.innerWidth / window.innerHeight, // aspect ratio (dummy value)
      0.1, // near clipping plane
      50 // far clipping plane
    );

    this.camera.position.set(0, 2, 16);
    // @ts-ignore
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix(); // automatically recalculate the frustrum

    const radiansPerSecond = MathUtils.degToRad(60);

    // @ts-ignore
    this.camera.tick = (delta: number) => {
      this.camera.position.z += radiansPerSecond * delta;
      // camera.position.x += radiansPerSecond * delta;
      // camera.position.y += radiansPerSecond * delta;
    };

    this.ui = new UIManager(this.camera,this.scene);

    this.controls ={
      orbit:  new CustomOrbitControls(this.camera, this.renderer.domElement),
      character_3th: new CharacterControls(this.camera, this.scene, this.renderer.domElement)
    }

    this.controls.orbit.enabled = false;
    this.controls.orbit.enableDamping = true;
    this.controls.orbit.maxDistance = 60;
    this.controls.orbit.enablePan = true;
    this.controls.orbit.enableZoom = true;
    this.controls.orbit.enableRotate = true;
    this.controls.orbit.maxPolarAngle = Math.PI / 2 - 0.05;

    let uiListeners={
      myID:"ui",
      onContextMenu:this.ui.onContextMenu,
      onPointerDown:this.ui.onPointerDown,
      onPointerCancel:this.ui.onPointerCancel,
      onMouseWheel:this.ui.onMouseWheel,
      onPointerMove:this.ui.onPointerMove,
      onPointerUp:this.ui.onPointerUp,
      onKeyDown:this.ui.onKeyDown,
      ctx:this.ui
    }
    this.controls.orbit.addTriggerBefore(uiListeners);
    this.controls.character_3th.orbitControl.addTriggerBefore(uiListeners);




    const ambientLight = new AmbientLight( 'white', 1.1);

    const directionalTarget = new Object3D();
    const directionalLight = new DirectionalLight('white', 5);
    directionalLight.position.set(0, 5, 9);
    directionalLight.target = directionalTarget;

    const hemisphereLight = new HemisphereLight( 0xffc69a, 0xffc87f, 1.85 );

    hemisphereLight.position.set( 2, 5, 9 );


    const helperHemisphereLight = new HemisphereLightHelper( hemisphereLight, 1)
    const helperDirectionalLight = new DirectionalLightHelper( directionalLight, 1)


    const helperGrid = new GridHelper(20);
    const helperAxes = new AxesHelper(20);
    helperAxes.position.set(-10, 0, -10);







    let materialLambert = new MeshLambertMaterial({});
    materialLambert.map = TextureComposer.mainTexture;


    // @ts-ignore
    let materialStandard = new MeshStandardMaterial();

    materialStandard.map = TextureComposer.mainTexture;
    materialStandard.roughness=0.617;
    materialStandard.metalness = 0.393;

    let materialToon=new MeshToonMaterial({    })
    materialToon.map = TextureComposer.mainTexture;
    let materialPhysical=new MeshPhysicalMaterial({    })
    materialPhysical.map = TextureComposer.mainTexture;
    let materialPhong=new MeshPhongMaterial({    })
    materialPhong.map = TextureComposer.mainTexture;

    let materialOutline=new MeshBasicMaterial({
      color:'black'
    })

    this.materials={
      types:{
        lambert:materialLambert,
        standard:materialStandard,
        outline:materialOutline,
        toon:materialToon,
        physical:materialPhysical,
        phong:materialPhong
      }
    };




    const flowerInstanceMesh = new InstancedMesh((Loader.files.flower.noOutline.gltf.scene.children[0] as Mesh).geometry.clone(),this.materials.types[Menu.generalData.material.selected],1000)

    console.log(Loader.files.flower.noOutline.gltf.scene.children[0]);
    const flowerBaseInstanceMesh = new InstancedMesh((Loader.files.flower.withOutline.gltf.scene.children[0].children[0] as Mesh).geometry.clone(),this.materials.types[Menu.generalData.material.selected],1000)
    const flowerOutlineInstanceMesh = new InstancedMesh((Loader.files.flower.withOutline.gltf.scene.children[0].children[1] as Mesh).geometry.clone(),this.materials.types.outline,1000)

    const flowerManager = new FlowersManager(flowerInstanceMesh,flowerBaseInstanceMesh,flowerOutlineInstanceMesh);
    flowerManager.refreshTotal();


    const spriteMaterial = new SpriteMaterial( { map: TextureComposer.mainTexture,sizeAttenuation :false } );

    const textureViewerSprite = new Sprite( spriteMaterial );
    textureViewerSprite.scale.set(0.25,0.25,0.25);
    textureViewerSprite.position.set(0,2,0);


    console.log(Loader.files.city.noOutline.gltf.scene);

    this.elements={
      city:{
        noOutline:Loader.files.city.noOutline.gltf.scene,
        withOutline:Loader.files.city.withOutline.gltf.scene.children[0]
      },
      helpers:{
        grid:helperGrid,
        axes:helperAxes,
        directionalTarget:directionalTarget,
        hemisphereLight:helperHemisphereLight,
        directionalLight:helperDirectionalLight
      },
      characters:[],
      lights:{
        ambient:ambientLight,
        directional:directionalLight,
        hemisphere:hemisphereLight
      },
      flowers:flowerManager,
      textureViewer:textureViewerSprite
    };





    (this.elements.city.noOutline.children[0] as Mesh).material = this.materials.types[Menu.generalData.material.selected];


    (this.elements.city.withOutline.children[0] as Mesh).material = this.materials.types[Menu.generalData.material.selected];
    (this.elements.city.withOutline.children[1] as Mesh).material = this.materials.types.outline;

    this.scene.add( ambientLight );
    this.scene.add( directionalLight );
    this.scene.add(directionalTarget);
    this.scene.add(helperDirectionalLight);
    this.scene.add(helperHemisphereLight);
    this.scene.add( hemisphereLight );

    this.scene.add(helperGrid, helperAxes);
    this.scene.add( this.camera );

    ambientLight.visible = false;



    RenderComposer.init(this.renderer,this.scene,this.camera)


    this.container.append(this.renderer.domElement);




    this.loop = new Loop({
      camera:this.camera,
      scene:this.scene,
      renderer:this.renderer
    });

    this.loop.addControls(this.controls.orbit);
    this.loop.addMixer(this.controls.character_3th);

    this.loop.addMixer(flowerManager);
    this.loop.addControls(this.ui);

    this.updateStreetVisibility(true);





  }

  // for apps that update occasionally
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // for apps with constant animation
  start() {
    this.loop.start();
    this.isRunning_ = true;
  }

  stop() {
    this.loop.stop();
    this.isRunning_ = false;
  }

  isRunning() {
    return this.isRunning_;
  }


  updateStreetVisibility(visible:boolean){
    if(visible){
      this.scene.add(Menu.generalData.streetOutline?this.elements.city.withOutline:this.elements.city.noOutline)
      this.scene.remove(this.elements.helpers.grid,this.elements.helpers.axes)
    }else{
      this.scene.remove(Menu.generalData.streetOutline?this.elements.city.withOutline:this.elements.city.noOutline)
      this.scene.add(this.elements.helpers.grid,this.elements.helpers.axes)
    }
  }
  updateStreetOutline(outline:boolean){
    if(Menu.generalData.street){

      this.scene.add(outline?this.elements.city.withOutline:this.elements.city.noOutline)
      this.scene.remove(outline?this.elements.city.noOutline:this.elements.city.withOutline)
    }
  }
  setMaterial(name:string){
    for(let char of this.elements.characters){
      for(let i=0;i<  char.obj.children.length;i++){
        let mesh = char.obj.children[i] as Mesh;
        if(mesh.isMesh && !mesh.userData.outlineMesh){
          mesh.material = this.materials.types[name];
        }
      }
    }
    (this.elements.city.noOutline.children[0] as Mesh).material = this.materials.types[name];
    (this.elements.city.withOutline.children[0] as Mesh).material = this.materials.types[name];
    this.elements.flowers.refreshMaterial()

  }


  refreshCharactersShape(){


    for(let i = 0;i<  this.elements.characters.length;i++){
      this.elements.characters[i].refreshShape(Menu.generalData.characters.list[i].indexes)
    }

    TextureComposer.refreshMainTexture();
    //console.log(sceneConfig.scene)

  }

  createCharacter(userData?:ICharacterUserData){
    let character = new Character(this.elements.characters.length,userData);
    this.elements.characters.push(character)
    return character;
  }
  removeCharactersAfter(num:number){
    let remove = this.elements.characters.slice(num,this.elements.characters.length)
    remove.forEach((char)=>{
      this.scene.remove(char.obj as Object3D);
      char.dispose();
    })
    this.elements.characters = this.elements.characters.slice(0,num);
  }

  updateCharactersTweenStatus(){
    this.elements.characters.forEach((char)=>{
      char.updateTweenStatus()
    })
  }
  updateTextureViewer(k:boolean){
    if(k){
      this.scene.add(this.elements.textureViewer)
    }else{
      this.scene.remove(this.elements.textureViewer)
    }
  }
}
export const World = new WorldClass();
