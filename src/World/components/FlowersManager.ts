import { DynamicDrawUsage, InstancedMesh, MathUtils, Matrix4, Object3D } from 'three';
import { World } from '../World';
import { Loop } from '../systems/Loop';
import { Menu } from '../systems/GUI';
import { TextureComposer } from '../systems/TextureComposer';

export class FlowersManager {
  private dummy:Object3D = new Object3D<Event>();
  private outline:boolean = false;
  private added:boolean = false;
  constructor(

    public flowerSimple:InstancedMesh,
    public flowerOutline1:InstancedMesh,
    public flowerOutline2:InstancedMesh
  ) {

    flowerSimple.instanceMatrix.setUsage( DynamicDrawUsage );
    flowerOutline1.instanceMatrix.setUsage( DynamicDrawUsage );
    flowerOutline2.instanceMatrix.setUsage( DynamicDrawUsage );

    this.update(-1);
  }
  refreshTotal(){
    if(Menu.generalData.instanceMesh.total > 0 && !this.added){
      if(this.outline){
        World.scene.add(this.flowerOutline1,this.flowerOutline2)
      }else{
        World.scene.add(this.flowerSimple)
      }
      TextureComposer.refreshMainTexture();

    }else if(Menu.generalData.instanceMesh.total == 0 && this.added){
      if(this.outline){
        World.scene.remove(this.flowerOutline1,this.flowerOutline2)
      }else{
        World.scene.remove(this.flowerSimple)
      }
      TextureComposer.refreshMainTexture();
    }
    this.flowerOutline1.count = this.outline?Menu.generalData.instanceMesh.total:0;
    this.flowerOutline2.count = this.outline?Menu.generalData.instanceMesh.total:0;
    this.flowerSimple.count = !this.outline?Menu.generalData.instanceMesh.total:0;
    this.added = Menu.generalData.instanceMesh.total>0;

  }
  refreshMaterial(){
    this.flowerOutline1.material = World.materials.types[Menu.generalData.material.selected];
    this.flowerSimple.material = World.materials.types[Menu.generalData.material.selected];
  }
  refreshOutline(){
    if(this.added && this.outline != Menu.generalData.instanceMesh.outline){
      this.outline = Menu.generalData.instanceMesh.outline;
      if(this.outline){
        World.scene.remove(this.flowerSimple)
        World.scene.add(this.flowerOutline1,this.flowerOutline2)
      }else{
        World.scene.remove(this.flowerOutline1,this.flowerOutline2)
        World.scene.add(this.flowerSimple)
      }
      this.flowerOutline1.count = this.outline?Menu.generalData.instanceMesh.total:0;
      this.flowerOutline2.count = this.outline?Menu.generalData.instanceMesh.total:0;
      this.flowerSimple.count = !this.outline?Menu.generalData.instanceMesh.total:0;
    }

    this.outline = Menu.generalData.instanceMesh.outline;
  }
  update(delta:number){
    if(!this.added){
      return
    }
    let distance = 0.5;
    this.dummy.rotation.y += delta * 45 * Math.PI / 180;
    this.dummy.rotation.z = this.dummy.rotation.y * 2;
    for(let i =0; i<Menu.generalData.instanceMesh.total;i++){
      let offset = {
        x: i%28,
        z: Math.floor(i / 28)
      }
      offset.x = Math.floor((offset.x+1)/2) * (offset.x % 2 > 0 ? -1 : 1)
      this.dummy.position.set( offset.x*distance, 2, (offset.z*distance*-1)+10  );
      this.dummy.updateMatrix();
      if(this.outline){
        this.flowerOutline1.setMatrixAt(i,this.dummy.matrix)
        this.flowerOutline2.setMatrixAt(i,this.dummy.matrix)
      }else{
        this.flowerSimple.setMatrixAt(i,this.dummy.matrix)
      }
    }
    if(this.outline) {
      this.flowerOutline1.instanceMatrix.needsUpdate = true;
      this.flowerOutline2.instanceMatrix.needsUpdate = true;
    }else{
      this.flowerSimple.instanceMatrix.needsUpdate = true;
    }
  }
}
