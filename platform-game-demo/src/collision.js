function onTheLeftOf(r1, r2) {
  return r1.x + r1.width/2 < r2.x + r2.width/2;
}

function rectSeperatedOnX(r1, r2) {
  return r1.x >= r2.x + r2.width || r2.x >= r1.x + r1.width
}
function rectSeperatedOnY(r1, r2) {
  return r1.y >= r2.y + r2.height || r2.y >= r1.y + r1.height
}
function hitRectangle(r1, r2) {
  return !rectSeperatedOnX(r1, r2) && !rectSeperatedOnY(r1, r2);
}

function collideBlocks(blocks, rect) {
  return blocks.find(block => hitRectangle(block, rect));
}

function collideAllBlocks(blocks, rect) {
  return blocks.filter(block => hitRectangle(block, rect));
}

function reachOutOfRectangleOnX(smallRect, largeRect) {
  return Math.min(smallRect.x - largeRect.x, 0) ||
      Math.max(0, (smallRect.x+smallRect.width - (largeRect.x+largeRect.width)));
}
function reachOutOfRectangleOnY(smallRect, largeRect) {
  return Math.min(smallRect.y - largeRect.y, 0) ||
      Math.max(0, (smallRect.y+smallRect.height - (largeRect.y+largeRect.height)));
}
