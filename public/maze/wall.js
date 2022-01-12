const kLEFT = 0;
const kBOTTOM = 1;
const kRIGHT = 2;
const kTOP = 3;

function Wall(x, y, w, h) {
  this.width = w / 2;
  this.height = h / 2;
  this.x = x + this.width;
  this.y = y + this.height;

  this.renderQuad = function (ticks) {
    var x = this.x;
    var y = this.y;
    var w = this.width;
    var h = this.height;
    vertex(x - w, y - h);
    vertex(x - w, y + h);
    vertex(x + w, y + h);
    vertex(x + w, y - h);
  }

  this.renderLine = function (ticks) {
    var x = this.x;
    var y = this.y;
    var w = this.width;
    var h = this.height;
    if (w < h) {
      // vertical wall
      vertex(x, y - h);
      vertex(x, y + h);
    } else {
      // horizontal wall
      vertex(x - w, y);
      vertex(x + w, y);
    }
  }

  this.render = function (ticks) {
    noStroke();
    fill(this.color);
    beginShape(QUADS);
    this.renderQuad(ticks);
    endShape(CLOSE);
  }
}
