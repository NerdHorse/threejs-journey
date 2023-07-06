export class Utils{
  static rgbToHex( r, g, b ) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}

function componentToHex(c:number) {
  var hex = Math.round(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
