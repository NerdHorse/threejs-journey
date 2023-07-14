import { BufferAttribute, Mesh, Texture } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'public/vendor/draco/gltf/' );
gltfLoader.setDRACOLoader( dracoLoader );
class LoaderClass{

  files:{
    maps:{
      threeTone:Texture,
      fourTone:Texture,
      fiveTone:Texture
    }
    character:{
      textures:{
        shirt:Texture[],
        pants:Texture[],
        armL:Texture[],
        armR:Texture[],
        legL:Texture[],
        legR:Texture[],
        shoes:Texture[],
        gloves:Texture[],
        facial:Texture[]
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
      texture:Texture
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
      mapFiveTone

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
      this.loadTextureProm('public/assets/textures/character_arm_l0.png'),
      this.loadTextureProm('public/assets/textures/character_arm_l1.png'),
      this.loadTextureProm('public/assets/textures/character_arm_r0.png'),
      this.loadTextureProm('public/assets/textures/character_arm_r1.png'),
      this.loadTextureProm('public/assets/textures/character_leg_l0.png'),
      this.loadTextureProm('public/assets/textures/character_leg_l1.png'),
      this.loadTextureProm('public/assets/textures/character_leg_r0.png'),
      this.loadTextureProm('public/assets/textures/character_leg_r1.png'),
      this.loadTextureProm('public/assets/textures/character_pants0.png'),
      this.loadTextureProm('public/assets/textures/character_shirt0.png'),
      this.loadTextureProm('public/assets/textures/city.png'),
      this.loadTextureProm('public/assets/textures/mapThreeTone.jpg'),
      this.loadTextureProm('public/assets/textures/mapFourTone.jpg'),
      this.loadTextureProm('public/assets/textures/mapFiveTone.jpg'),
    ]);
    console.log(characterGLTF);


    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('uv');
    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('uv2');
    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('texcoord_2');
    (cityOutlineGLTF.scene.children[0].children[1] as Mesh).geometry.deleteAttribute('normal');


    this.files={
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
}
export const Loader = new LoaderClass();
