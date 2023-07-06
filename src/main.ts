import { World } from './World/World';
import { Loader } from './World/systems/Loader';
import { Color } from 'three';
import { Menu } from './World/systems/GUI';

document.querySelector('#h1')?.append('Three.js Template');

async function main() {
  const container = document.querySelector(
    '#scene-container'
  ) as HTMLCanvasElement;

  await Loader.load()

  World.init(container);

  World.start();

  Menu.init();

  // addEventListener('click', () => {
  //   if (world.isRunning() === false) {
  //     world.start();
  //   } else {
  //     world.stop();
  //   }
  // });
}

main().catch((err) => {
  console.log(err);
});



let shaderData = {
  aoColor:  new Color(0x000000),
  hemisphereColor: new Color(0xffffff),
  irradianceColor:  new Color(0xffffff),
  radianceColor: new Color(0xffffff),
  aoPower:  1,
  aoSmoothing:  0,
  aoMapGamma:  1,
  lightMapGamma:  1,
  lightMapSaturation:  1,
  envPower:  1,
  roughnessPower:  1,
  sunIntensity:  0,
  mapContrast:  1,
  lightMapContrast:  1,
  smoothingPower:  0.25,
  irradianceIntensity:  Math.PI,
  radianceIntensity:  1,
  hardcodeValues:  false
}
