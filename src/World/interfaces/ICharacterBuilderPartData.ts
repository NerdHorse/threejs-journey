

export interface ICharacterBuilderPartData {
  blocks?: ICharacterBuilderPartBlockData,
  incompatibility?: {
    eyebrows?: number[],
    eyes?: number[],
    glasses?: number[],
    gloves?: number[],
    hair?: number[],
    mask?: number[],
    pants?: number[],
    shirts?: number[],
    shoes?: number[],
    bracelets?: number[],
    necklace?: number[],
  },
  id:number,
  colors:number
}

export interface ICharacterBuilderPartBlockData{
  armTopL?: boolean,
  armTopR?: boolean,
  armBotL?: boolean,
  armBotR?: boolean,
  belly?: boolean,
  backTop?: boolean,
  backBot?: boolean,
  chestTop?: boolean,
  chestBot?: boolean,
  ears?:boolean,
  eyebrows?: boolean,
  eyes?: boolean,
  feet?: boolean,
  glasses?: boolean,
  hair?: boolean,
  handL?: boolean
  handR?: boolean,
  hip?: boolean,
  shinL?: boolean,
  shinR?: boolean,
  shoulderL?: boolean,
  shoulderR?: boolean,
  thighL?: boolean,
  thighR?: boolean,
  underwearTop?: boolean,
  underwearBot?: boolean,
  bracelets?: boolean,
  wristL?: boolean,
  wristR?: boolean,
  earrings?:boolean
  necklace?:boolean
}
