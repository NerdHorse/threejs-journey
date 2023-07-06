import {

  AmbientLight, AxesHelper, BufferAttribute, Color,
  DirectionalLight, GridHelper, HalfFloatType,
  MathUtils, Mesh, MeshLambertMaterial, MeshStandardMaterial, Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene, sRGBEncoding, Texture,
  WebGL1Renderer,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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


class WorldClass {

  private camera: PerspectiveCamera | OrthographicCamera;
  scene: Scene;
  renderer: WebGLRenderer | WebGL1Renderer;
  private controls: OrbitControls;
  loop: Loop;
  private isRunning_: boolean=false;
  private container: HTMLCanvasElement|null=null;

  public elements:{
    city:Object3D,
    helpers:{
      grid:GridHelper,
      axes:AxesHelper
    },
    characters:Character[]

    lights:{
      ambient:AmbientLight,
      directional:DirectionalLight
    }
  }
  materials:{
    types:{
      lambert:MeshLambertMaterial,
      standard:MeshStandardMaterial,
    }
  }
  constructor() {

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
    this.renderer.physicallyCorrectLights = false;
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);


    this.scene = new Scene();
    this.scene.background = new Color(0xdddddd);


    this.camera = new PerspectiveCamera(
      35, // fov = Field Of View
      1, // aspect ratio (dummy value)
      0.1, // near clipping plane
      100 // far clipping plane
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


    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 1;
    this.controls.maxDistance = 95;
    this.controls.enablePan = true;
    this.controls.enableDamping = true;




    const ambientLight = new AmbientLight( Utils.rgbToHex(255,185,158), 0.449);

    const directionalLight = new DirectionalLight('white', 1.796);
    directionalLight.position.set(1.2, 4.6, 1.8);

    const helperGrid = new GridHelper(20);
    const helperAxes = new AxesHelper(20);
    helperAxes.position.set(-10, 0, -10);

    this.elements={
      city:Loader.files.city.gltf.scene,
      helpers:{
        grid:helperGrid,
        axes:helperAxes
      },
      characters:[],
      lights:{
        ambient:ambientLight,
        directional:directionalLight
      }
    }



    let materialLambert = new MeshLambertMaterial({});
    materialLambert.map = TextureComposer.mainTexture;


    let materialStandard = new MeshStandardMaterial();
    materialStandard.map = TextureComposer.mainTexture;
    materialStandard.roughness=0.617;
    materialStandard.metalness = 0.393;



    this.materials={
      types:{
        lambert:materialLambert,
        standard:materialStandard,
      }
    };


    (this.elements.city.children[0] as Mesh).material = this.materials.types[Menu.generalData.material.selected];


    this.scene.add( ambientLight );
    this.scene.add( directionalLight );

    this.scene.add(helperGrid, helperAxes);
    this.scene.add( this.camera );




    const hueSaturationEffect = new HueSaturationEffect({
      saturation: 0
    })
    const gammaCorrectionEffect = new GammaCorrectionEffect({
      gamma:0.5
    })



    RenderComposer.init(this.renderer,this.scene,this.camera)


    this.container.append(this.renderer.domElement);



    this.loop = new Loop({
      camera:this.camera,
      scene:this.scene,
      renderer:this.renderer
    });
    this.loop.addControls(this.controls);

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
      this.scene.add(this.elements.city)
      this.scene.remove(this.elements.helpers.grid,this.elements.helpers.axes)
    }else{
      this.scene.remove(this.elements.city)
      this.scene.add(this.elements.helpers.grid,this.elements.helpers.axes)
    }
  }
  updateAmbientLightVisibility(visible){
    if(visible){
      this.scene.add(this.elements.lights.ambient)
    }else{
      this.scene.remove(this.elements.lights.ambient)
    }
  }
  updateDirectionalLightVisibility(visible){
    if(visible){
      this.scene.add(this.elements.lights.directional)
    }else{
      this.scene.remove(this.elements.lights.directional)
    }
  }
  setMaterial(name:string){
    for(let char of this.elements.characters){
      (char.obj?.children[0].children[0] as Mesh).material = this.materials.types[name]
    }
    (this.elements.city.children[0] as Mesh).material = this.materials.types[name]

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
      this.scene.remove(char.obj as Object3D)
    })
    this.elements.characters = this.elements.characters.slice(0,num);
  }

  updateCharactersTweenStatus(){
    this.elements.characters.forEach((char)=>{
      char.updateTweenStatus()
    })
  }

}
export const World = new WorldClass();
