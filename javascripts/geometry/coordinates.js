/*
Translates page x/y coordinates to garden x/y.
TODO: A type checker would be pretty sweet here.
*/
export function fromScreenToGarden(mouseX, mouseY, boxX, boxY) {
  var rawX = mouseX - boxX;
  var rawY = mouseY - boxY;
  return {x: rawX, y: rawY};
};
