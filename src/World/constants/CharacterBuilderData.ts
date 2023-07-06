import { ICharacterBuilderPartData } from '../interfaces/ICharacterBuilderPartData';
import { ICharacterUserDataPatterns } from '../interfaces/ICharacterUserData';


export const CharacterBuilderData: {
  earrings:ICharacterBuilderPartData[],
  eyebrows: ICharacterBuilderPartData[],
  eyes: ICharacterBuilderPartData[],
  facial: ICharacterBuilderPartData[],
  glasses: ICharacterBuilderPartData[],
  gloves: ICharacterBuilderPartData[],
  hair: ICharacterBuilderPartData[],
  pants: ICharacterBuilderPartData[],
  shirts: ICharacterBuilderPartData[],
  shoes: ICharacterBuilderPartData[],
  underwear: ICharacterBuilderPartData[]
  bracelet: ICharacterBuilderPartData[]
  necklace: ICharacterBuilderPartData[],
  patterns:ICharacterUserDataPatterns
}={
  shirts: [
    {
      id:0,
      blocks:{
        armTopL: true,
        armTopR: true,
        armBotL: true,
        armBotR: true,
        backTop: true,
        backBot: true,
        belly: true,
        chestBot: true,
        hair: true,
        hip: true,
        shoulderL: true,
        shoulderR: true,
        underwearTop: true,
        bracelets: true,
        earrings:true,
        wristL:true,
        wristR:true,
      },
      colors:5,
    },
    {
      id:1,
      blocks:{
        armTopL: true,
        armTopR: true,
        armBotL: true,
        armBotR: true,
        backBot: true,
        belly: true,
        chestBot: true,
        shoulderL: true,
        shoulderR: true,
        underwearTop: true,
      },
      colors:5,
    },
    {
      id:2,
      blocks:{
        armTopL: true,
        armTopR: true,
        backBot: true,
        chestBot: true,
        shoulderL: true,
        shoulderR: true
      },
      colors:4,
    },

  ],
  earrings:[
    {
      id:0,
      colors:1
    }
  ],
  eyebrows: [
    {
      id:0,
      colors:1
    },
    {
      id:1,
      colors:1
    },
    {
      id:2,
      colors:1
    }
  ],
  eyes: [
    {
      id:0,
      colors:1
    },
    {
      id:1,
      colors:1
    }
  ],
  facial:[
    {
      id:0,
      colors:2
    },
    {
      id:1,
      blocks:{
        glasses:true,
      },
      colors:5
    }
  ],
  glasses: [

  ],
  gloves: [
    {
      id:0,
      colors:1
    },
    {
      id:1,
      blocks:{
        handL:true,
        handR:true,
        bracelets:true
      },
      colors:2
    }
  ],
  hair: [
    {
      id:0,
      colors:2
    },
    {
      id:1,
      colors:1
    },
    {
      blocks:{
        ears:true,
        earrings:true,
      },
      id:2,
      colors:1
    }
  ],
  pants: [
    {
      id:0,
      colors:3,
      blocks:{
        shinL: true,
        shinR: true,
        thighL: true,
        thighR: true,
      },
    },
    {
      id:1,
      colors:2,
      blocks:{
        thighL: true,
        thighR: true,
        underwearBot: true,
        hip:true
      },
    }
  ],
  shoes: [
    {
      id:0,
      blocks:{
        feet: true,
      },
      colors:1
    }
  ],
  bracelet: [ ],
  underwear:[
    {
      id:0,
      blocks:{
        hip:true
      },
      colors:2
    },
    {
      id:1,
      colors:2
    },
    {
      id:2,
      blocks:{
        hip:true
      },
      colors:2
    }
  ],
  necklace:[],
  patterns:{
    shirt:1,
    pants:1,
    armL:2,
    armR:2,
    legL:2,
    legR:2,
    shoes:0,
    gloves:0,
    facial:0
  }
}


