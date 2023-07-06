import { BufferAttribute, Mesh, Texture } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
class LoaderClass{

  files:{
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
      gltf:GLTF,
      animations:{
        running:GLTF
        walking:GLTF
        idle:GLTF
      }
    }
    city:{
      texture:Texture
      gltf:GLTF,
      uvOri:BufferAttribute
    }
  }
  constructor() {
  }
  async load(){
    const [
      characterGLTF,
      characterGLTFWalking,
      characterGLTFRunning,
      characterGLTFIdle,
      cityGLTF,
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
      cityText

    ] = await Promise.all([
      gltfLoader.loadAsync('public/assets/models/character.glb'),
      gltfLoader.loadAsync('public/assets/models/character_walking.glb'),
      gltfLoader.loadAsync('public/assets/models/character_running.glb'),
      gltfLoader.loadAsync('public/assets/models/character_idle.glb'),
      gltfLoader.loadAsync('public/assets/models/city.glb'),
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
      this.loadTextureProm('public/assets/textures/city.png')
    ]);
    this.files={
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
        gltf:characterGLTF,
          animations:{
          running:characterGLTFRunning,
          walking:characterGLTFWalking,
          idle:characterGLTFIdle
        }
      },
      city:{
        texture:cityText,
        gltf:cityGLTF,
        uvOri:((cityGLTF.scene.children[0] as Mesh).geometry.attributes["uv"] as BufferAttribute).clone()
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
