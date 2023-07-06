import { Color, RGB } from 'three';

export interface ICharacterUserData{
  colors:ICharacterUserDataColors,
  patterns:ICharacterUserDataPatterns
  indexes:ICharacterUserDataIndexes
}

export interface ICharacterUserDataColors {
  body:string,
  underwear1:string,
  underwear2:string,
  eyes:string,
  mouth:string,
  beard:string,
  necklace1:string,
  necklace2:string,
  necklace3:string,
  eyeBrows:string,
  glasses1:string,
  glasses2:string,
  glasses3:string,
  bracelet1:string,
  bracelet2:string,
  gloves1:string,
  gloves2:string,
  gloves3:string,
  earrings1:string,
  earrings2:string,
  facial1:string,
  facial2:string,
  facial3:string,
  facial4:string,
  facial5:string,
  hair1:string,
  hair2:string,
  hair3:string,
  hair4:string,
  hair5:string,
  shirt1:string,
  shirt2:string,
  shirt3:string,
  shirt4:string,
  shirt5:string,
  pants1:string,
  pants2:string,
  pants3:string,
  pants4:string,
  pants5:string,
  shoes1:string,
  shoes2:string,
  shoes3:string,
  shoes4:string,
  shoes5:string
}
export interface ICharacterUserDataColorsThreeJs {
  body:RGB,
  underwear1:RGB,
  underwear2:RGB,
  eyes:RGB,
  mouth:RGB,
  beard:RGB,
  necklace1:RGB,
  necklace2:RGB,
  necklace3:RGB,
  eyeBrows:RGB,
  glasses1:RGB,
  glasses2:RGB,
  glasses3:RGB,
  bracelet1:RGB,
  bracelet2:RGB,
  gloves1:RGB,
  gloves2:RGB,
  gloves3:RGB,
  earrings1:RGB,
  earrings2:RGB,
  facial1:RGB,
  facial2:RGB,
  facial3:RGB,
  facial4:RGB,
  facial5:RGB,
  hair1:RGB,
  hair2:RGB,
  hair3:RGB,
  hair4:RGB,
  hair5:RGB,
  shirt1:RGB,
  shirt2:RGB,
  shirt3:RGB,
  shirt4:RGB,
  shirt5:RGB,
  pants1:RGB,
  pants2:RGB,
  pants3:RGB,
  pants4:RGB,
  pants5:RGB,
  shoes1:RGB,
  shoes2:RGB,
  shoes3:RGB,
  shoes4:RGB,
  shoes5:RGB
}
export interface ICharacterUserDataPatterns{
  shirt:number,
    pants:number,
    armL:number,
    armR:number,
    legL:number,
    legR:number,
    shoes:number,
    gloves:number,
    facial:number
}
export interface ICharacterUserDataIndexes{
  eyebrows:number,
    eyes:number,
    head:number,
    shirts:number,
    pants:number,
    shoes:number,
    underwear:number,
    glasses:number,
    gloves:number,
    hair:number,
    facial:number,
    earrings:number,
    bracelet:number,
    necklace:number,
}