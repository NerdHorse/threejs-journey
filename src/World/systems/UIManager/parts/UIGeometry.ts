import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { PlaneGeometry } from 'three';
import TextureAtlas from '../../Loader/TextureAtlas';
import { UIElementType } from '../../../enums/UIElementType';
import { UIScaleDivider } from '../../../constants/UIScaleDivider';
import { Anchor } from '../../../enums/Anchor';

export class UIGeometry {
  /*
      A                          B
    +---+----------------------+---+
  C |   |                      |   |
    +---+----------------------+---+
    |   |                      |   |
    |   |                      |   |
    |   |                      |   |
    +---+----------------------+---+
  D |   |                      |   |
    +---+----------------------+---+
   */
  static makeNineSlice(
    atlas: TextureAtlas,
    frame: string,
    size: {
      width: number,
      height: number
    },
    margins: {
      leftWidth: number, // size of the left vertical bar (A)
      topHeight: number, // size of the top horizontal bar (C)
      rightWidth: number, // size of the right vertical bar (B)
      bottomHeight: number, // size of the bottom horizontal bar (D)
    },
    scale:number=1,
    anchor:Anchor=Anchor.MID_MIDDLE,
    translate: {
      x: number,
      y: number
    } = null
  ):  BufferGeometry {
    frame = frame.replace('.png', '').toLowerCase();
    let frameData = atlas.frames[frame].frame;

    if(frameData == null){
      return null;
    }

    var geometry = new PlaneGeometry(1, 1, 3, 3);

    let arrPosition = this.getPosition(UIElementType.NINE_SLICE, size,scale,anchor,translate,margins);
    let attrPosition = geometry.getAttribute('position');
    for (let i = 0; i < arrPosition.length; i++) {
      attrPosition.setXY(i, arrPosition[i][0], arrPosition[i][1]);
    }

    let arrUv = this.getUv(UIElementType.NINE_SLICE, atlas,frame,margins);
    let attrUv = geometry.getAttribute('uv');
    for (let i = 0; i < arrUv.length; i++) {
      attrUv.setXY(i, arrUv[i][0], arrUv[i][1]);
    }
    console.log(arrUv);



    return geometry;

  }


  static makeSprite(
    atlas: TextureAtlas,
    frame: string,
    scale:number=1,
    anchor:Anchor=Anchor.MID_MIDDLE,
    translate: {
      x: number,
      y: number
    } = null
  ): BufferGeometry {
    frame = frame.replace('.png', '').toLowerCase();
    let frameData = atlas.frames[frame].frame;

    if(frameData == null){
      return null;
    }

    var geometry = new PlaneGeometry(10, 10, 1, 1);

    let arrPosition = this.getPosition(UIElementType.SPRITE, { width: frameData.w, height: frameData.h },scale,anchor,translate);
    let attrPosition = geometry.getAttribute('position');
    for (let i = 0; i < arrPosition.length; i++) {
      attrPosition.setXY(i, arrPosition[i][0], arrPosition[i][1]);
    }

    let arrUv = this.getUv(UIElementType.SPRITE, atlas,frame);
    let attrUv = geometry.getAttribute('uv');
    for (let i = 0; i < arrUv.length; i++) {
      attrUv.setXY(i, arrUv[i][0], arrUv[i][1]);
    }

    return geometry;

  }

  private static getAnchorOffset(
    anchor:Anchor,
    size:{
      width: number,
      height: number
    },
    scale:number
  ){
    let anchorOffset = {
      x:0,
      y:0
    }
    switch (anchor){
      case Anchor.TOP_LEFT:
        anchorOffset.x = size.width/2;
        anchorOffset.y = -size.height/2;
        break;
      case Anchor.TOP_MIDDLE:
        anchorOffset.x = 0;
        anchorOffset.y = -size.height/2;
        break;
      case Anchor.TOP_RIGHT:
        anchorOffset.x = -size.width/2;
        anchorOffset.y = -size.height/2;
        break;
      case Anchor.MID_LEFT:
        anchorOffset.x = size.width/2;
        anchorOffset.y = 0;
        break;
      case Anchor.MID_MIDDLE:
        anchorOffset.x = 0;
        anchorOffset.y = 0;
        break;
      case Anchor.MID_RIGHT:
        anchorOffset.x = -size.width/2;
        anchorOffset.y = 0;
        break;
      case Anchor.BOT_LEFT:
        anchorOffset.x = size.width/2;
        anchorOffset.y = size.height/2;
        break;
      case Anchor.BOT_MIDDLE:
        anchorOffset.x = 0;
        anchorOffset.y = size.height/2;
        break;
      case Anchor.BOT_RIGHT:
        anchorOffset.x = -size.width/2;
        anchorOffset.y = size.height/2;
        break;
    }
    anchorOffset.x *=scale;
    anchorOffset.y *=scale;

    return anchorOffset;
  }

  static getPosition(
    type: UIElementType,
    size: {
      width: number,
      height: number
    },
    scale:number,
    anchor:Anchor,
    translate: {
      x: number,
      y: number
    } = null,
    margins: {
      leftWidth: number, // size of the left vertical bar (A)
      topHeight: number, // size of the top horizontal bar (C)
      rightWidth: number, // size of the right vertical bar (B)
      bottomHeight: number, // size of the bottom horizontal bar (D)
    } = {
      leftWidth: 0,
      topHeight: 0,
      rightWidth: 0,
      bottomHeight: 0,
    },
  ) {
    let arr: [number, number][] = [];

    switch (type) {
      case UIElementType.SPRITE:
        arr = [
          [
            size.width / 2 * -1,
            size.height / 2,
          ],
          [
            (size.width / 2),
            size.height / 2,
          ],
          [
            size.width / 2 * -1,
            size.height / 2 * -1,
          ],
          [
            size.width / 2,
            size.height / 2 * -1,
          ],
        ];
        break;
      case UIElementType.NINE_SLICE:
        arr = [
          [
            size.width / 2 * -1,
            size.height / 2,
          ],
          [
            ((size.width / 2) - margins.leftWidth) * -1,
            size.height / 2,
          ],
          [
            (size.width / 2) - margins.rightWidth,
            size.height / 2,
          ],
          [
            (size.width / 2),
            size.height / 2,
          ],
          [
            size.width / 2 * -1,
            (size.height / 2) - margins.topHeight,
          ],
          [
            ((size.width / 2) - margins.leftWidth) * -1,
            (size.height / 2) - margins.topHeight,
          ],
          [
            (size.width / 2) - margins.rightWidth,
            (size.height / 2) - margins.topHeight,
          ],
          [
            size.width / 2,
            (size.height / 2) - margins.topHeight,
          ],
          [
            size.width / 2 * -1,
            ((size.height / 2) - margins.bottomHeight) * -1,
          ],
          [
            ((size.width / 2) - margins.leftWidth) * -1,
            ((size.height / 2) - margins.bottomHeight) * -1,
          ],
          [
            (size.width / 2) - margins.rightWidth,
            ((size.height / 2) - margins.bottomHeight) * -1,
          ],
          [
            size.width / 2,
            ((size.height / 2) - margins.bottomHeight) * -1,
          ],
          [
            size.width / 2 * -1,
            size.height / 2 * -1,
          ],
          [
            ((size.width / 2) - margins.leftWidth) * -1,
            size.height / 2 * -1,
          ],
          [
            (size.width / 2) - margins.rightWidth,
            size.height / 2 * -1,
          ],
          [
            size.width / 2,
            size.height / 2 * -1,
          ],
        ];
        break;
    }

    let offset = this.getAnchorOffset(anchor,size,scale);

    for (let i = 0; i < arr.length; i++) {

      arr[i][0] *= scale;
      arr[i][1] *= scale;

      arr[i][0] += offset.x;
      arr[i][1] += offset.y;

      if (translate != null) {
        arr[i][0] += translate.x;
        arr[i][1] += translate.y;
      }

      arr[i][0] = arr[i][0] / UIScaleDivider;
      arr[i][1] = arr[i][1] / UIScaleDivider;
    }

    return arr;
  }

  static getUv(
    type: UIElementType,
    atlas: TextureAtlas,
    frame: string,
    margins?: {
      leftWidth: number, // size of the left vertical bar (A)
      topHeight: number, // size of the top horizontal bar (C)
      rightWidth: number, // size of the right vertical bar (B)
      bottomHeight: number, // size of the bottom horizontal bar (D)
    }
  ) {
    if(margins == null){
      margins = {
        leftWidth: 0,
          topHeight: 0,
        rightWidth: 0,
        bottomHeight: 0,
      }
    }
    frame = frame.replace('.png', '').toLowerCase();
    let frameData = atlas.frames[frame].frame;
    let offset = {
      x: frameData.x / atlas.width,
      y: 1 - (frameData.h / atlas.height) - (frameData.y / atlas.height),
    };
    let arr: [number, number][] = [];
    switch (type) {
      case UIElementType.SPRITE:
        arr = [
          [
            offset.x,
            offset.y + (frameData.h / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width),
            offset.y + (frameData.h / atlas.height),
          ],
          [
            offset.x,
            offset.y,
          ],
          [
            offset.x + (frameData.w / atlas.width),
            offset.y,
          ],
        ];
        break;
      case UIElementType.NINE_SLICE:
        arr = [
          [
            offset.x,
            offset.y + (frameData.h / atlas.height),
          ],
          [
            offset.x + (margins.leftWidth / atlas.width),
            offset.y + (frameData.h / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width) - (margins.rightWidth / atlas.width),
            offset.y + (frameData.h / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width),
            offset.y + (frameData.h / atlas.height),
          ],
          [
            offset.x,
            offset.y + (frameData.h / atlas.height) - (margins.topHeight / atlas.height),
          ],
          [
            offset.x + (margins.leftWidth / atlas.width),
            offset.y + (frameData.h / atlas.height) - (margins.topHeight / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width) - (margins.rightWidth / atlas.width),
            offset.y + (frameData.h / atlas.height) - (margins.topHeight / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width),
            offset.y + (frameData.h / atlas.height) - (margins.topHeight / atlas.height),
          ],
          [
            offset.x,
            offset.y + (margins.bottomHeight / atlas.height),
          ],
          [
            offset.x + (margins.leftWidth / atlas.width),
            offset.y + (margins.bottomHeight / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width) - (margins.rightWidth / atlas.width),
            offset.y + (margins.bottomHeight / atlas.height),
          ],
          [
            offset.x + (frameData.w / atlas.width),
            offset.y + (margins.bottomHeight / atlas.height),
          ],
          [
            offset.x,
            offset.y,
          ],
          [
            offset.x + (margins.leftWidth / atlas.width),
            offset.y,
          ],
          [
            offset.x + (frameData.w / atlas.width) - (margins.rightWidth / atlas.width),
            offset.y,
          ],
          [
            offset.x + (frameData.w / atlas.width),
            offset.y,
          ]
        ];
        break;
    }
    console.log(frameData,offset,arr)

    return arr;
  }
}
