import { BufferAttribute, Mesh, Texture } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TextureAtlas from './TextureAtlas';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const imageLoader = new THREE.ImageLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'public/vendor/draco/gltf/' );
gltfLoader.setDRACOLoader( dracoLoader );
class LoaderClass{

  files:{
    spriteSheets:{
      [k:string]:TextureAtlas
      general:TextureAtlas
    },
    maps:{
      threeTone:Texture,
      fourTone:Texture,
      fiveTone:Texture
    }
    character:{
      textures:{
        shirt:HTMLImageElement[],
        pants:HTMLImageElement[],
        armL:HTMLImageElement[],
        armR:HTMLImageElement[],
        legL:HTMLImageElement[],
        legR:HTMLImageElement[],
        shoes:HTMLImageElement[],
        gloves:HTMLImageElement[],
        facial:HTMLImageElement[]
      }
      gltf: {
        withOutline:GLTF,
        noOutline:GLTF
      },
      animations:{
        running:GLTF
        walking:GLTF
        idle:GLTF
      }
    }
    city:{
      texture:HTMLImageElement
      withOutline:{
        gltf:GLTF,
        uvOri:BufferAttribute
      },
      noOutline:{
        gltf:GLTF,
        uvOri:BufferAttribute
      }
    }
    flower:{
      withOutline:{
        gltf:GLTF,
        uvOri:BufferAttribute
      },
      noOutline:{
        gltf:GLTF,
        uvOri:BufferAttribute
      }
    }
  }
  constructor() {
  }
  async load(){
    const [
      characterGLTF,
      characterOutlineGLTF,
      characterGLTFWalking,
      characterGLTFRunning,
      characterGLTFIdle,
      cityGLTF,
      cityOutlineGLTF,
      flowerGLTF,
      flowerOutlineGLTF,
      characterTextArmL0,
      characterTextArmL1,
      characterTextArmR0,
      characterTextArmR1,
      characterTextLegL0,
      characterTextLegL1,
      characterTextLegR0,
      characterTextLegR1,
      characterTextPants0,
      characterTextShirt0,
      cityText,
      mapThreeTone,
      mapFourTone,
      mapFiveTone,
      generalSpriteSheetIMG,
      generalSpriteSheetJSON

    ] = await Promise.all([
      gltfLoader.loadAsync('public/assets/models/character.glb'),
      //gltfLoader.loadAsync('public/assets/models/character.glb'),
      gltfLoader.loadAsync('public/assets/models/character_outline.glb'),
      gltfLoader.loadAsync('public/assets/models/character_walking.glb'),
      gltfLoader.loadAsync('public/assets/models/character_running.glb'),
      gltfLoader.loadAsync('public/assets/models/character_idle.glb'),
      gltfLoader.loadAsync('public/assets/models/city.glb'),
      gltfLoader.loadAsync('public/assets/models/city_outline.glb'),
      gltfLoader.loadAsync('public/assets/models/flower.glb'),
      gltfLoader.loadAsync('public/assets/models/flower_outline.glb'),
      this.loadImageProm('public/assets/textures/character_arm_l0.png'),
      this.loadImageProm('public/assets/textures/character_arm_l1.png'),
      this.loadImageProm('public/assets/textures/character_arm_r0.png'),
      this.loadImageProm('public/assets/textures/character_arm_r1.png'),
      this.loadImageProm('public/assets/textures/character_leg_l0.png'),
      this.loadImageProm('public/assets/textures/character_leg_l1.png'),
      this.loadImageProm('public/assets/textures/character_leg_r0.png'),
      this.loadImageProm('public/assets/textures/character_leg_r1.png'),
      this.loadImageProm('public/assets/textures/character_pants0.png'),
      this.loadImageProm('public/assets/textures/character_shirt0.png'),
      this.loadImageProm('public/assets/textures/city.png'),
      this.loadTextureProm('public/assets/textures/mapThreeTone.jpg'),
      this.loadTextureProm('public/assets/textures/mapFourTone.jpg'),
      this.loadTextureProm('public/assets/textures/mapFiveTone.jpg'),
      this.loadImageProm('public/assets/textures/general.png'),
      this.loadJSONProm("public/assets/textures/general.json")
    ]);
    console.log(characterGLTF);


    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('uv');
    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('uv2');
    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('texcoord_2');
    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('normal');


    this.files={
      spriteSheets:{
        general:new TextureAtlas(generalSpriteSheetJSON,generalSpriteSheetIMG)
      },
      maps:{
        threeTone:mapThreeTone,
        fourTone:mapFourTone,
        fiveTone:mapFiveTone
      },
      flower:{
        withOutline:{
          gltf:flowerOutlineGLTF,
          uvOri:((flowerOutlineGLTF.scene.children[0].children[0] as Mesh).geometry.attributes["uv"] as BufferAttribute).clone()
        },
        noOutline:{
          gltf:flowerGLTF,
          uvOri:((flowerGLTF.scene.children[0] as Mesh).geometry.attributes["uv"] as BufferAttribute).clone()
        }
      },
      character:{
        textures:{
          shirt:[characterTextShirt0],
            pants:[characterTextPants0],
            armL:[characterTextArmL0,characterTextArmL1],
            armR:[characterTextArmR0,characterTextArmR1],
            legL:[characterTextLegL0,characterTextLegL1],
            legR:[characterTextLegR0,characterTextLegR1],
            shoes:[],
            gloves:[],
            facial:[]
        },
        gltf:{
          withOutline:characterOutlineGLTF,
          noOutline:characterGLTF
        },
          animations:{
          running:characterGLTFRunning,
          walking:characterGLTFWalking,
          idle:characterGLTFIdle
        }
      },
      city:{
        texture:cityText,
        withOutline:{
          gltf:cityOutlineGLTF,
          uvOri:((cityOutlineGLTF.scene.children[0].children[0] as Mesh).geometry.attributes["uv"] as BufferAttribute).clone()
        },
        noOutline:{
          gltf:cityGLTF,
          uvOri:((cityGLTF.scene.children[0] as Mesh).geometry.attributes["uv"] as BufferAttribute).clone()
        }
      }
    }


  }
  private loadTextureProm(path:string):Promise<Texture>{
    return new Promise<Texture>((resolve, reject)=>{
      textureLoader.load(
        // resource URL
        path,

        // onLoad callback
        resolve,

        // onProgress callback currently not supported
        undefined,

        // onError callback
        reject
      );
    })
  }
  private loadImageProm(path:string):Promise<HTMLImageElement>{
    return new Promise<HTMLImageElement>((resolve, reject)=>{
      imageLoader.load(
        // resource URL
        path,

        // onLoad callback
        resolve,

        // onProgress callback currently not supported
        undefined,

        // onError callback
        reject
      );
    })
  }
  private  loadJSONProm(url ) {
    return new Promise<{[k:string]:any}>((resolve, reject)=>{
      var rawFile = new XMLHttpRequest();
      rawFile.overrideMimeType("application/json");
      rawFile.open("GET", url, true);
      rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && (Number(rawFile.status) == 200)) {
          let json = {};
          console.log(rawFile.responseText)
          try {
            json = JSON.parse(rawFile.responseText)
          }catch (e){}
          console.log(rawFile.responseText,json)
          resolve(json);
        }
      }
      rawFile.send(null);
    })
  }
}
export const Loader = new LoaderClass();
