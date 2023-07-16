export interface IUIListener{
  pointerId:number,
  layer:number,
  element:number,
  startPos:{
    x:number,
    y:number
  },
  nowPos:{
    x:number,
    y:number
  }
}
