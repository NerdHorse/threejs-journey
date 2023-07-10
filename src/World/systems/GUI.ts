import { GUI, GUIController } from 'dat.gui';
import {
  ICharacterUserData,
  ICharacterUserDataColorsThreeJs,
  ICharacterUserDataIndexes,
  ICharacterUserDataPatterns,
} from '../interfaces/ICharacterUserData';
import {
  ACESFilmicToneMapping,
  CineonToneMapping,
  Color,
  LinearToneMapping,
  Mesh,
  Object3D,
  ReinhardToneMapping, Uniform,
} from 'three';
import { World } from '../World';
import { TextureComposer } from './TextureComposer';
import { Utils } from './Utils';
import { CharacterBuilderData } from '../constants/CharacterBuilderData';
import { NoToneMapping } from 'three/src/constants';
import { RenderComposer } from './RenderComposer';
import { GammaCorrectionEffect } from './GammaCorrectionEffect';
import {
  BlendFunction,
  BloomEffect,
  HueSaturationEffect,
  KernelSize, NoiseEffect,
  ScanlineEffect,
  VignetteEffect, VignetteTechnique,
} from 'postprocessing';
import { Loader } from './Loader';

class MenuManager{

  private folders:{
    main:GUI,
    scene:GUI,
    charsMain:GUI,
    chars:GUI[],
    materials:{
      standard:GUI
    }

  };
  generalData:{
    renderer:{
      toneMapping:string
      postProcessing:{
        antialias:{
          type:string
        }
        gammaCorrection:{
          blendFunction:string,
          gamma:number
        },
        hueSaturation:{
          blendFunction:string,
          saturation: number,
          hue:number
        },
        bloom:{
          intensity: number,
          blendFunction: string,
          kernelSize: string,
          luminanceThreshold: number,
          luminanceSmoothing: number,
          mipmapBlur: boolean,
        },
        vignette:{
          offset: number,
          darkness: number

          blendFunction:string,
          technique:string,
        },
        scanline:{
          blendFunction:string,
          density: number
        },
        noise:{
          blendFunction: string,
          premultiply: boolean
        }
      }
    }
    characters:{
      moving: boolean,
      outline:boolean,
      total:number
      list:{
        colors:ICharacterUserDataColorsThreeJs,
        patterns:ICharacterUserDataPatterns
        indexes:ICharacterUserDataIndexes
      }[]
    }
    material:{
      wireframe:boolean,
      color:{r:number,g:number,b:number},
      emissive:{r:number,g:number,b:number},
      emissiveIntensity:number,
      fog:boolean
      selected:string,
      toon:{
        gradientMap:string
      }

  }

    lights:{
      ambientLight:{
        visible:boolean,
        color:{r:number,g:number,b:number}
      }
      directionalLight:{
        visible:boolean
        color:{r:number,g:number,b:number}
      }
      hemisphereLight:{
        visible:boolean,
        color:{r:number,g:number,b:number}
        groundColor :{r:number,g:number,b:number}
      },
      pointLight:{
        visible:boolean,
        color:{r:number,g:number,b:number}
      },

      spotLight:{
        visible:boolean,
        color:{r:number,g:number,b:number}
      },
    }
    street:boolean,
    streetOutline:boolean,
    texture:{
      viewer:boolean,
      size:number
    },
    instanceMesh:{
      total:number
      outline:boolean
    }


  } =
  {

    renderer:{
      toneMapping:"NoToneMapping",
      postProcessing: {
        antialias:{
          type:'none'
        },
        gammaCorrection: {
          blendFunction: 'NORMAL',
          gamma: 0.75
        },
        hueSaturation: {
          blendFunction: 'NORMAL',
          saturation: 0.15,
          hue: 0
        },
        bloom: {
          blendFunction: 'SCREEN',
          intensity: 0.71,
          kernelSize: 'MEDIUM',
          luminanceThreshold: 0.54,
          luminanceSmoothing: 0.62,
          mipmapBlur: true,
        },
        vignette: {
          offset: 0.4,
          darkness: 0.65,

          blendFunction: 'NORMAL',
          technique: 'DEFAULT'
        },
        scanline: {
          blendFunction: 'OVERLAY',
          density: 1.09
        },
        noise: {
          blendFunction: 'MULTIPLY',
          premultiply: false
        }
      }
    },
    characters:{
      moving:false,
      total:1,
      outline:false,
      list:[]
    },
    lights:{
      ambientLight:{
        visible:true,
        color:{r:255,g:255,b:255}
      },
      directionalLight:{
        visible:true,
        color:{r:255,g:255,b:255}
      },

      hemisphereLight:{
        visible:false,
        color:{r:255,g:255,b:255},
        groundColor :{r:255,g:255,b:255}
      },

      pointLight:{
        visible:false,
        color:{r:255,g:255,b:255}
      },

      spotLight:{
        visible:false,
        color:{r:255,g:255,b:255}
      },
    },
    material:{


      wireframe:false,
      color:{r:255,g:255,b:255},
      selected:"standard",
      emissive:{r:0,g:0,b:0},
      emissiveIntensity:1,
      fog:true, // faltando,
      toon:{
        gradientMap:'none'
      }
    },
    street:false,
    streetOutline:false,
    texture:{
      viewer:false,
      size:1024
    },
    instanceMesh:{
      total:0,
      outline:false
    }
  }

  constructor() {

  }

  init() {
    let main = new GUI();
    let scene = main.addFolder('Renderer / Scene');
    scene.open();

    let textureFolder = scene.addFolder("Texture");
    textureFolder.add(this.generalData.texture, "viewer").onFinishChange((k)=>{
      World.updateTextureViewer(k);
    })
    textureFolder.add(this.generalData.texture, "size",  [256,512,1024,2048,4096]).onFinishChange((k)=>{
      TextureComposer.updateTextureSize(k);
    })
    textureFolder.open();

    let toneMapping = scene.addFolder("Tone Mapping");
    toneMapping.add(this.generalData.renderer, "toneMapping",[
      "NoToneMapping",
      "LinearToneMapping",
      "ReinhardToneMapping",
      "CineonToneMapping",
      "ACESFilmicToneMapping"
    ]).onChange(val => {
      let num = 0;
      switch (val){
        case "NoToneMapping": num = NoToneMapping; break;
        case "LinearToneMapping": num = LinearToneMapping; break;
        case "ReinhardToneMapping": num = ReinhardToneMapping; break;
        case "CineonToneMapping": num = CineonToneMapping; break;
        case "ACESFilmicToneMapping": num = ACESFilmicToneMapping; break;
      }
      World.renderer.toneMapping = num
    })
    toneMapping.add(World.renderer, "toneMappingExposure",0,5,0.0125)
    toneMapping.open();



    let Lights = scene.addFolder("Lights");

    let ambientLight = Lights.addFolder("Ambient Light");
    ambientLight.add(this.generalData.lights.ambientLight,"visible").onFinishChange(this.onAmbientLightVisibilityChange)
    ambientLight.addColor(this.generalData.lights.ambientLight,"color").onChange(this.onAmbientLightColorChange)
    ambientLight.add(World.elements.lights.ambient,"intensity",0,5,0.001)
    ambientLight.open();

    let directionalLight = Lights.addFolder("Directional Light");
    directionalLight.add(this.generalData.lights.directionalLight,"visible").onFinishChange(this.onDirectionalLightVisibilityChange)
    directionalLight.addColor(this.generalData.lights.directionalLight,"color").onChange(this.onDirectionalLightColorChange)
    directionalLight.add(World.elements.lights.directional,"intensity",0,5,0.001)
    let directionalLightPos = directionalLight.addFolder("Position");
    directionalLightPos.add(World.elements.lights.directional.position,"x",-10,10,0.01)
    directionalLightPos.add(World.elements.lights.directional.position,"y",-10,10,0.01)
    directionalLightPos.add(World.elements.lights.directional.position,"z",-10,10,0.01)
    let directionalLightTarget = directionalLight.addFolder("Target Position");
    directionalLightTarget.add(World.elements.lights.directional.target.position,"x",-10,10,0.01)
    directionalLightTarget.add(World.elements.lights.directional.target.position,"y",-10,10,0.01)
    directionalLightTarget.add(World.elements.lights.directional.target.position,"z",-10,10,0.01)
    directionalLight.open();

    let materialFolder = scene.addFolder("Material");
    materialFolder.add(this.generalData.material, "selected",["lambert","standard",'toon','physical','phong']).onFinishChange((k)=>this.onMaterialTypeChange(k));
    materialFolder.add(this.generalData.material, "wireframe").onFinishChange(this.onMaterialWireframeChange);
    materialFolder.addColor(this.generalData.material, "color").onChange(this.onMaterialColorChange);
    materialFolder.addColor(this.generalData.material, "emissive").onChange(this.onMaterialEmissiveColorChange);
    materialFolder.add(this.generalData.material, "emissiveIntensity",0,1,0.001).onChange(this.onMaterialEmissiveIntensity);

    let standardFolder = materialFolder.addFolder("Standard Config");
    standardFolder.add(World.materials.types.standard,"metalness",0,1,0.001);
    standardFolder.add(World.materials.types.standard,"roughness",0,1,0.001);


    let toonFolder = materialFolder.addFolder("Toon Config");
    toonFolder.add(this.generalData.material.toon,"gradientMap",['none','Three Tone',"Four Tone","Five Tone"]).onFinishChange((k)=>this.onMaterialToonChange());




    let physicalFolder = materialFolder.addFolder("Physical Config");
    physicalFolder.add(World.materials.types.physical,"metalness",0,1,0.001);
    physicalFolder.add(World.materials.types.physical,"roughness",0,1,0.001);
    physicalFolder.add(World.materials.types.physical,"reflectivity",0,1,0.01);
    physicalFolder.add(World.materials.types.physical,"clearcoat",0,1,0.01);
    physicalFolder.add(World.materials.types.physical,"clearcoatRoughness",0,1,0.01);



    let postProcessingFolder = scene.addFolder('Post Processing');

    let antialiasFolder = postProcessingFolder.addFolder('Anti Aliasing')
    antialiasFolder.add(this.generalData.renderer.postProcessing.antialias, 'type',['none','SMAA','FXAA']).onFinishChange(()=>this.onAntialiasChange())
    antialiasFolder.open()


    let gammaCorrectionFolder = postProcessingFolder.addFolder('Gamma Correction')
    gammaCorrectionFolder.add(RenderComposer.effects.gammaCorrection, 'activated').onFinishChange(()=>this.onPostProcessingActivationChange())
    gammaCorrectionFolder.add(this.generalData.renderer.postProcessing.gammaCorrection, "blendFunction",this.getBlendFunctionValues()).onChange((k)=>this.onPostProcessingSettingsChange());
    gammaCorrectionFolder.add(this.generalData.renderer.postProcessing.gammaCorrection,"gamma",-1,1,0.01).onChange((k)=>this.onPostProcessingSettingsChange());


    let hueSaturationFolder = postProcessingFolder.addFolder('Hue Saturation')
    hueSaturationFolder.add(RenderComposer.effects.hueSaturation, 'activated').onFinishChange(()=>this.onPostProcessingActivationChange())
    hueSaturationFolder.add(this.generalData.renderer.postProcessing.hueSaturation, "blendFunction",this.getBlendFunctionValues()).onChange((k)=>this.onPostProcessingSettingsChange());
    hueSaturationFolder.add(this.generalData.renderer.postProcessing.hueSaturation, "hue",0,5,0.01).onChange((k)=>this.onPostProcessingSettingsChange());
    hueSaturationFolder.add(this.generalData.renderer.postProcessing.hueSaturation, "saturation",-1,1,0.01).onChange((k)=>this.onPostProcessingSettingsChange());


    let bloomFolder = postProcessingFolder.addFolder('Bloom')
    bloomFolder.add(RenderComposer.effects.bloom, 'activated').onFinishChange(()=>this.onPostProcessingActivationChange())
    bloomFolder.add(this.generalData.renderer.postProcessing.bloom, "blendFunction",this.getBlendFunctionValues()).onChange((k)=>this.onPostProcessingSettingsChange());
    bloomFolder.add(this.generalData.renderer.postProcessing.bloom, "kernelSize",["VERY_SMALL", "SMALL", "MEDIUM", "LARGE", "VERY_LARGE", "HUGE"]).onChange((k)=>this.onPostProcessingSettingsChange());
    bloomFolder.add(this.generalData.renderer.postProcessing.bloom, "intensity",0,3,0.01).onChange((k)=>this.onPostProcessingSettingsChange());
    bloomFolder.add(this.generalData.renderer.postProcessing.bloom, "luminanceThreshold",0,1,0.01).onChange((k)=>this.onPostProcessingSettingsChange());
    bloomFolder.add(this.generalData.renderer.postProcessing.bloom, "luminanceSmoothing",0,1,0.01).onChange((k)=>this.onPostProcessingSettingsChange());

    let vignetteFolder = postProcessingFolder.addFolder('Vignette')
    vignetteFolder.add(RenderComposer.effects.vignette, 'activated').onFinishChange(()=>this.onPostProcessingActivationChange())
    vignetteFolder.add(this.generalData.renderer.postProcessing.vignette, "blendFunction",this.getBlendFunctionValues()).onChange((k)=>this.onPostProcessingSettingsChange());
    vignetteFolder.add(this.generalData.renderer.postProcessing.vignette, "technique",["DEFAULT","ESKIL"]).onChange((k)=>this.onPostProcessingSettingsChange());
    vignetteFolder.add(this.generalData.renderer.postProcessing.vignette, "offset",0,1,0.01).onChange((k)=>this.onPostProcessingSettingsChange());
    vignetteFolder.add(this.generalData.renderer.postProcessing.vignette, "darkness",0,1,0.01).onChange((k)=>this.onPostProcessingSettingsChange());



    let scanlineFolder = postProcessingFolder.addFolder('Scanline')
    scanlineFolder.add(RenderComposer.effects.scanline, 'activated').onFinishChange(()=>this.onPostProcessingActivationChange())
    scanlineFolder.add(this.generalData.renderer.postProcessing.scanline, "blendFunction",this.getBlendFunctionValues()).onChange((k)=>this.onPostProcessingSettingsChange());
    scanlineFolder.add(this.generalData.renderer.postProcessing.scanline, "density",0,2,0.01).onChange((k)=>this.onPostProcessingSettingsChange());


    let noiseFolder = postProcessingFolder.addFolder('noise')
    noiseFolder.add(RenderComposer.effects.noise, 'activated').onFinishChange(()=>this.onPostProcessingActivationChange())
    noiseFolder.add(this.generalData.renderer.postProcessing.noise, "blendFunction",this.getBlendFunctionValues()).onChange((k)=>this.onPostProcessingSettingsChange());
    noiseFolder.add(this.generalData.renderer.postProcessing.noise, "premultiply").onChange((k)=>this.onPostProcessingSettingsChange());




    let street = main.addFolder("Street");
    street.add(this.generalData, "street").onFinishChange(this.onStreetChange);
    street.add(this.generalData, "streetOutline").onFinishChange(this.onStreetOutlineChange);
    street.open();

    let flowers = main.addFolder("Flowers");
    flowers.add(this.generalData.instanceMesh, "total",0,1000,1).onChange(()=>World.elements.flowers.refreshTotal());
    flowers.add(this.generalData.instanceMesh, "outline").onFinishChange(()=>World.elements.flowers.refreshOutline());
    flowers.open();

    let charsMainFolder = main.addFolder('Characters')
    charsMainFolder.open();


    charsMainFolder.add(this.generalData.characters, "total",this.makeArrayFromRange(0,224)).onFinishChange(()=>this.onCharactersTotalChange())
    charsMainFolder.add(this.generalData.characters, "moving").onFinishChange(()=>this.onCharactersMovingChange())
    charsMainFolder.add(this.generalData.characters, "outline").onFinishChange(()=>World.refreshCharactersShape())


    this.folders = {
      main:main,
      scene:scene,
      charsMain:charsMainFolder,
      chars:[],
      materials:{
        standard:standardFolder

      }
    }
    this.folders.scene.open();

    Menu.onCharactersTotalChange()
  }

  onAntialiasChange(){
    RenderComposer.effects.SMAA.activated = false;
    RenderComposer.shaders.FXAA.activated = false;
    switch (this.generalData.renderer.postProcessing.antialias.type){
      case'SMAA':
        RenderComposer.effects.SMAA.activated = true;
        break;
      case'FXAA':
        RenderComposer.effects.SMAA.activated = true;
        break;
    }
    RenderComposer.refreshComposer()
  }
  private onOrbitControlsChange(k:boolean){

  }
  private onStreetChange(k:boolean){
    World.updateStreetVisibility(k);
    TextureComposer.refreshMainTexture();
  }
  private onStreetOutlineChange(k:boolean){
    World.updateStreetOutline(k);
  }
  private onAmbientLightVisibilityChange(k){
    World.updateAmbientLightVisibility(k)
  }
  private onAmbientLightColorChange(color:{r:number,g:number,b:number}){
    let code_ = Utils.rgbToHex(color.r,color.g,color.b)
    World.elements.lights.ambient.color = new Color(code_)
  }
  private onDirectionalLightVisibilityChange(k){
    World.updateDirectionalLightVisibility(k)
  }
  private onDirectionalLightColorChange(color:{r:number,g:number,b:number}){
    let code_ = Utils.rgbToHex(color.r,color.g,color.b)
    World.elements.lights.directional.color = new Color(code_)
  }
  private onMaterialTypeChange(name:string){
    World.setMaterial(name)
    for(let material in World.materials.types){
      if(material == name){
        this.folders.materials.standard.show();
      }else{
        this.folders.materials.standard.hide();
      }
    }
  }
  private onMaterialWireframeChange(k){
    for(let material in World.materials.types){
      World.materials.types[material].wireframe = k;
    }
  }
  private onMaterialColorChange(color:{r:number,g:number,b:number}){
    let code_ = Utils.rgbToHex(color.r,color.g,color.b)
    for(let material in World.materials.types){
      if(material != "outline"){
        World.materials.types[material].color = new Color(code_);
      }
    }
  }
  private onMaterialEmissiveColorChange(color:{r:number,g:number,b:number}){
    let code_ = Utils.rgbToHex(color.r,color.g,color.b)
    for(let material in World.materials.types){

      if(material != "outline") {
        World.materials.types[material].emissive = new Color(code_);
      }
    }
  }
  private onMaterialEmissiveIntensity(k){
    for(let material in World.materials.types){

      if(material != "outline") {
        World.materials.types[material].emissiveIntensity = k;
      }
    }
  }
  onCharactersTotalChange(){
    if(World.elements.characters.length > this.generalData.characters.total){
      World.removeCharactersAfter(this.generalData.characters.total)
      let removeGUI = this.folders.chars.slice(this.generalData.characters.total,this.folders.chars.length)
      removeGUI.forEach((char)=>{
        if(char){
          this.folders.charsMain.removeFolder(char)
        }
      })
      this.folders.chars = this.folders.chars.slice(0,this.generalData.characters.total);
      this.generalData.characters.list = this.generalData.characters.list.slice(0,this.generalData.characters.total);

      TextureComposer.refreshMainTexture();
    }else if(World.elements.characters.length < this.generalData.characters.total){
      for(let i = World.elements.characters.length;i<this.generalData.characters.total;i++){
        let character = World.createCharacter();
        let charData = this.createCharacterData(character.userData)
        this.generalData.characters.list.push(charData)
        if(i == 0){
          let guiCharFolder = this.folders.charsMain.addFolder('Char '+(i+1));
          this.createCharacterFolder(guiCharFolder,charData);
          this.folders.chars.push(guiCharFolder)
        }
      }
      World.refreshCharactersShape();
    }
  }
  private onCharactersMovingChange(){
    World.updateCharactersTweenStatus()
  }
  private createCharacterData(userData:ICharacterUserData){
    let userData_:{
      colors:ICharacterUserDataColorsThreeJs,
      patterns:ICharacterUserDataPatterns
      indexes:ICharacterUserDataIndexes
    } = {
      colors:{
        body:new Color(userData.colors.body).getRGB({r:0,g:0,b:0}),
        underwear1:new Color(userData.colors.underwear1).getRGB({r:0,g:0,b:0}),
        underwear2:new Color(userData.colors.underwear2).getRGB({r:0,g:0,b:0}),
        eyes:new Color(userData.colors.eyes).getRGB({r:0,g:0,b:0}),
        mouth:new Color(userData.colors.mouth).getRGB({r:0,g:0,b:0}),
        beard:new Color(userData.colors.beard).getRGB({r:0,g:0,b:0}),
        necklace1:new Color(userData.colors.necklace1).getRGB({r:0,g:0,b:0}),
        necklace2:new Color(userData.colors.necklace2).getRGB({r:0,g:0,b:0}),
        necklace3:new Color(userData.colors.necklace3).getRGB({r:0,g:0,b:0}),
        eyeBrows:new Color(userData.colors.eyeBrows).getRGB({r:0,g:0,b:0}),
        glasses1:new Color(userData.colors.glasses1).getRGB({r:0,g:0,b:0}),
        glasses2:new Color(userData.colors.glasses2).getRGB({r:0,g:0,b:0}),
        glasses3:new Color(userData.colors.glasses3).getRGB({r:0,g:0,b:0}),
        bracelet1:new Color(userData.colors.bracelet1).getRGB({r:0,g:0,b:0}),
        bracelet2:new Color(userData.colors.bracelet2).getRGB({r:0,g:0,b:0}),
        gloves1:new Color(userData.colors.gloves1).getRGB({r:0,g:0,b:0}),
        gloves2:new Color(userData.colors.gloves2).getRGB({r:0,g:0,b:0}),
        gloves3:new Color(userData.colors.gloves3).getRGB({r:0,g:0,b:0}),
        earrings1:new Color(userData.colors.earrings1).getRGB({r:0,g:0,b:0}),
        earrings2:new Color(userData.colors.earrings2).getRGB({r:0,g:0,b:0}),
        facial1:new Color(userData.colors.facial1).getRGB({r:0,g:0,b:0}),
        facial2:new Color(userData.colors.facial2).getRGB({r:0,g:0,b:0}),
        facial3:new Color(userData.colors.facial3).getRGB({r:0,g:0,b:0}),
        facial4:new Color(userData.colors.facial4).getRGB({r:0,g:0,b:0}),
        facial5:new Color(userData.colors.facial5).getRGB({r:0,g:0,b:0}),
        hair1:new Color(userData.colors.hair1).getRGB({r:0,g:0,b:0}),
        hair2:new Color(userData.colors.hair2).getRGB({r:0,g:0,b:0}),
        hair3:new Color(userData.colors.hair3).getRGB({r:0,g:0,b:0}),
        hair4:new Color(userData.colors.hair4).getRGB({r:0,g:0,b:0}),
        hair5:new Color(userData.colors.hair5).getRGB({r:0,g:0,b:0}),
        shirt1:new Color(userData.colors.shirt1).getRGB({r:0,g:0,b:0}),
        shirt2:new Color(userData.colors.shirt2).getRGB({r:0,g:0,b:0}),
        shirt3:new Color(userData.colors.shirt3).getRGB({r:0,g:0,b:0}),
        shirt4:new Color(userData.colors.shirt4).getRGB({r:0,g:0,b:0}),
        shirt5:new Color(userData.colors.shirt5).getRGB({r:0,g:0,b:0}),
        pants1:new Color(userData.colors.pants1).getRGB({r:0,g:0,b:0}),
        pants2:new Color(userData.colors.pants2).getRGB({r:0,g:0,b:0}),
        pants3:new Color(userData.colors.pants3).getRGB({r:0,g:0,b:0}),
        pants4:new Color(userData.colors.pants4).getRGB({r:0,g:0,b:0}),
        pants5:new Color(userData.colors.pants5).getRGB({r:0,g:0,b:0}),
        shoes1:new Color(userData.colors.shoes1).getRGB({r:0,g:0,b:0}),
        shoes2:new Color(userData.colors.shoes2).getRGB({r:0,g:0,b:0}),
        shoes3:new Color(userData.colors.shoes3).getRGB({r:0,g:0,b:0}),
        shoes4:new Color(userData.colors.shoes4).getRGB({r:0,g:0,b:0}),
        shoes5:new Color(userData.colors.shoes5).getRGB({r:0,g:0,b:0})
      },
      patterns:{
        shirt:userData.patterns.shirt,
        pants:userData.patterns.pants,
        armL:userData.patterns.armL,
        armR:userData.patterns.armR,
        legL:userData.patterns.legL,
        legR:userData.patterns.legR,
        shoes:userData.patterns.shoes,
        gloves:userData.patterns.gloves,
        facial:userData.patterns.facial
      },
      indexes:{
        eyebrows:userData.indexes.eyebrows,
        eyes:userData.indexes.eyes,
        head:userData.indexes.head,
        shirts:userData.indexes.shirts,
        pants:userData.indexes.pants,
        shoes:userData.indexes.shoes,
        underwear:userData.indexes.underwear,
        glasses:userData.indexes.glasses,
        gloves:userData.indexes.gloves,
        hair:userData.indexes.hair,
        facial:userData.indexes.facial,
        earrings:userData.indexes.earrings,
        bracelet:userData.indexes.bracelet,
        necklace:userData.indexes.necklace,
      }
    }
    for(let k in userData_.colors){
      userData_.colors[k] = {
        r:userData_.colors[k].r*255,
        g:userData_.colors[k].g*255,
        b:userData_.colors[k].b*255,
      }

    }
    return userData_;
  }
  private createCharacterFolder(guiCharFolder:GUI|null,userData_:{
    colors:ICharacterUserDataColorsThreeJs,
    patterns:ICharacterUserDataPatterns
    indexes:ICharacterUserDataIndexes
  })
  {
    if(guiCharFolder){
      let shapeFolder = guiCharFolder.addFolder('Shape');
      let colorFolder = guiCharFolder.addFolder('Color');
      let patternFolder = guiCharFolder.addFolder('Pattern');
      let animation= guiCharFolder.addFolder('Animation');


      let lastGroupName = "";
      let lastGroup:GUI|null = null;
      for(let k in userData_.colors){
        let group = k.replace(/[^A-Za-z]/g,"");
        if(lastGroupName != group){
          lastGroup = colorFolder.addFolder(group)
          lastGroupName = group;
        }
        //console.log(userData_.colors[k])
        lastGroup?.addColor(userData_.colors,k).setValue(userData_.colors[k]).onFinishChange((k)=>{
          TextureComposer.refreshCharactersTexture();
        })
      }

      for(let k in userData_.indexes){
        if( k == "head"){
          shapeFolder.add(userData_.indexes,k as keyof ICharacterUserDataIndexes,this.makeArrayFromRange(0,1)).onFinishChange((val)=>{
            World.refreshCharactersShape()
          })
        }else{
          let min = k != "eyes" ? -1:0;
          shapeFolder.add(userData_.indexes,k as keyof ICharacterUserDataIndexes,this.makeArrayFromRange(min,CharacterBuilderData[k].length-1)).onFinishChange((val)=>{
            userData_.indexes[k] = val;
            World.refreshCharactersShape()
          })
        }
      }

      for(let k in userData_.patterns){
        patternFolder.add(userData_.patterns,k as keyof ICharacterUserDataPatterns,this.makeArrayFromRange(-1,CharacterBuilderData.patterns[k]-1)).onFinishChange((val)=>{
          userData_.patterns[k] = val;
          TextureComposer.refreshCharactersTexture()
        })
      }
    }



    return userData_;
  }
  private makeArrayFromRange(min,max){
    let arr:number[] = [];
    for(let i =min;i<=max;i++){
      arr.push(i);
    }
    return arr
  }


  private onPostProcessingActivationChange(){

    RenderComposer.refreshComposer();
  }
  private onPostProcessingSettingsChange(){

    RenderComposer.effects.gammaCorrection.effect.blendMode.blendFunction = BlendFunction[this.generalData.renderer.postProcessing.gammaCorrection.blendFunction];
    (RenderComposer.effects.gammaCorrection.effect.uniforms.get("gamma") as Uniform).value = this.generalData.renderer.postProcessing.gammaCorrection.gamma;


    RenderComposer.effects.hueSaturation.effect.hue = this.generalData.renderer.postProcessing.hueSaturation.hue;
    RenderComposer.effects.hueSaturation.effect.blendMode.blendFunction = BlendFunction[this.generalData.renderer.postProcessing.hueSaturation.blendFunction];
    RenderComposer.effects.hueSaturation.effect.saturation = this.generalData.renderer.postProcessing.hueSaturation.saturation;



    RenderComposer.effects.bloom.effect.blendMode.blendFunction = BlendFunction[this.generalData.renderer.postProcessing.bloom.blendFunction];
    RenderComposer.effects.bloom.effect.blurPass.kernelSize = KernelSize[this.generalData.renderer.postProcessing.bloom.kernelSize];
    RenderComposer.effects.bloom.effect.intensity = this.generalData.renderer.postProcessing.bloom.intensity;
    RenderComposer.effects.bloom.effect.luminanceMaterial.threshold = this.generalData.renderer.postProcessing.bloom.luminanceThreshold;
    RenderComposer.effects.bloom.effect.luminanceMaterial.smoothing = this.generalData.renderer.postProcessing.bloom.luminanceSmoothing;





    RenderComposer.effects.vignette.effect.blendMode.blendFunction = BlendFunction[this.generalData.renderer.postProcessing.vignette.blendFunction];
    RenderComposer.effects.vignette.effect.technique = VignetteTechnique[this.generalData.renderer.postProcessing.vignette.technique];
    RenderComposer.effects.vignette.effect.offset = this.generalData.renderer.postProcessing.vignette.offset;
    RenderComposer.effects.vignette.effect.darkness = this.generalData.renderer.postProcessing.vignette.darkness;


    RenderComposer.effects.scanline.effect.blendMode.blendFunction = BlendFunction[this.generalData.renderer.postProcessing.scanline.blendFunction];
    RenderComposer.effects.scanline.effect.density = this.generalData.renderer.postProcessing.scanline.density;


    RenderComposer.effects.noise.effect.blendMode.blendFunction = BlendFunction[this.generalData.renderer.postProcessing.noise.blendFunction];
    RenderComposer.effects.noise.effect.premultiply = this.generalData.renderer.postProcessing.noise.premultiply;

  }
  private onMaterialToonChange(){
    switch (this.generalData.material.toon.gradientMap.toLowerCase()){
      case 'none': World.materials.types.toon.gradientMap = null;break;
      case 'three tone':World.materials.types.toon.gradientMap = Loader.files.maps.threeTone; break;
      case "four tone": World.materials.types.toon.gradientMap = Loader.files.maps.fourTone;break;
      case "five tone": World.materials.types.toon.gradientMap = Loader.files.maps.fiveTone;break;

    }
    World.setMaterial(this.generalData.material.selected);
  }

  private getBlendFunctionValues(){
    return ["SKIP",
      "SET",
      "ADD",
      "ALPHA",
      "AVERAGE",
      "COLOR",
      "COLOR_BURN",
      "COLOR_DODGE",
      "DARKEN",
      "DIFFERENCE",
      "DIVIDE",
      "DST",
      "EXCLUSION",
      "HARD_LIGHT",
      "HARD_MIX",
      "HUE",
      "INVERT",
      "INVERT_RGB",
      "LIGHTEN",
      "LINEAR_BURN",
      "LINEAR_DODGE",
      "LINEAR_LIGHT",
      "LUMINOSITY",
      "MULTIPLY",
      "NEGATION",
      "NORMAL",
      "OVERLAY",
      "PIN_LIGHT",
      "REFLECT",
      "SATURATION",
      "SCREEN",
      "SOFT_LIGHT",
      "SRC",
      "SUBTRACT",
      "VIVID_LIGHT"]
  }

}

export const Menu = new MenuManager()
