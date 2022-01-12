function Cell(c, r, w, h) {
  this.width = w;
  this.height = h;
  this.col = c;
  this.row = r;
  this.walls;
  this.visited = false;
  this.start = false;
  this.end = false;
  var s = Math.min(w, h);
  this.wallThick = s / 15;
  var offset = s / 22.5;

  this.visit = function() {
    this.visited = true;

    var w = this.width;
    var h = this.height;
    var x = this.col * w;
    var y = this.row * h;

    this.walls = [
      // left
      new Wall(x, y, this.wallThick, h),
      // bottom
      new Wall(x, y + h - offset, w, this.wallThick),
      // right
      new Wall(x + w - offset, y, this.wallThick, h),
      // top
      new Wall(x, y, w, this.wallThick),
    ];

    for (var i=0; i<this.walls.length; ++i) {
      this.walls[i].color = color(0xcc);
    }

    var bw = w * 0.25;
    var bh = h * 0.25;
    this.bread = random(['🥖', '🥖', '🍞', '🍞', '🍞', '🥐']);
    this.breadCrumbPos = new Vector2d(random(-bw, bw), random(-bh, bh));
  };

  this.removeWall = function(other) {
    var x = this.col - other.col;
    var y = this.row - other.row;

    if (x === -1) {
      other.walls[kLEFT] = null;
      this.walls[kRIGHT] = null;
    } else if (x === 1) {
      this.walls[kLEFT] = null;
      other.walls[kRIGHT] = null;
    }

    if (y === -1) {
      other.walls[kTOP] = null;
      this.walls[kBOTTOM] = null;
    } else if (y === 1) {
      this.walls[kTOP] = null;
      other.walls[kBOTTOM] = null;
    }
  }

  this.getNeighbors = function() {
    var neighbors = [];
    if (!this.walls || !this.walls[kLEFT]) {
      neighbors.push(maze.cells[maze.getCellIndex(this.col - 1, this.row)]);
    }
    if (!this.walls || !this.walls[kTOP]) {
      neighbors.push(maze.cells[maze.getCellIndex(this.col, this.row - 1)]);
    }
    if (!this.walls || !this.walls[kRIGHT]) {
      neighbors.push(maze.cells[maze.getCellIndex(this.col + 1, this.row)]);
    }
    if (!this.walls || !this.walls[kBOTTOM]) {
      neighbors.push(maze.cells[maze.getCellIndex(this.col, this.row + 1)]);
    }
    return neighbors;
  }

  this.nextUnvisitedNeighbor = function() {
    var neighbors = [];

    var left = maze.cells[maze.getCellIndex(this.col - 1, this.row)];
    var top = maze.cells[maze.getCellIndex(this.col, this.row - 1)];
    var right = maze.cells[maze.getCellIndex(this.col + 1, this.row)];
    var bottom = maze.cells[maze.getCellIndex(this.col, this.row + 1)];

    if (left && !left.visited) {
      neighbors.push(left);
    }
    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }

    var r = int(random(0, neighbors.length));
    return neighbors[r];
  }

  var endColor = color(FINISH_COLOR);
  var breadColor = color(BREAD_COLOR);

  this.renderWallQuads = function(ticks) {
    if (this.walls) {
      for (var i=0; i!=this.walls.length; ++i) {
        var w = this.walls[i];
        if (w) {
          w.renderQuad();
        }
      }
    }
  };

  this.renderWallLines = function (ticks) {
    if (this.walls) {
      for (var i=0; i!=this.walls.length; ++i) {
        var w = this.walls[i];
        if (w) {
          w.renderLine(ticks);
        }
      }
    }
  }

  this.renderWalls = function () {
    noStroke();
    fill(WALL_COLOR);
    if (this.walls) {
      beginShape(QUADS);
      this.renderWallShapes();
      endShape(CLOSE);
    }
  };

  this.renderNoWalls = function (renderBG) {
    var w = this.width;
    var h = this.height;
    var s = Math.min(w, h);
    var x = this.col * w + w / 2;
    var y = this.row * h + h / 2;

    push();
    rectMode(CENTER);
    translate(x, y);

    if (renderBG) {
      noStroke();
      fill(MAZE_COLOR)
      rect(0, 0, w, h);
    }

    if (this.end) {
      noStroke();
      fill(FINISH_COLOR);
      textAlign(CENTER, CENTER);
      textSize(s * 0.6);
      text('🎁', 0, 0);
    }

    var idx = maze.getCellIndex(this.col, this.row);

    if (this.breadCrumbs) {
      stroke(BREAD_COLOR);
      strokeWeight(s / 7.5);
      noFill();
      point(this.breadCrumbPos.x, this.breadCrumbPos.y);
    } else if (this.hasBread) {
      noStroke();
      fill(BREAD_COLOR);
      textAlign(CENTER, CENTER);
      textSize(s * 0.5);
      text(this.bread, 0, 0);
    }

    pop();

  };

  this.render = function() {
    this.renderNoWalls(true);
    this.renderWalls();
  };

  this.setStart = function () {
    this.start = true;
  };

  this.setEnd = function () {
    this.end = true;
  };

  this.pickup = function () {
    var ret = this.hasBread;
    this.hasBread = 0;
    return ret;
  };

  this.leaveBreadCrumbs = function () {
    var old = this.breadCrumbs;
    this.breadCrumbs = true;
    return old;
  };

  this.addBread = function () {
    this.hasBread = int(random(10, 30));
  };

  this.getIndex = function () {
    return getCellIndex(this.col, this.row);
  };
  this.toString = function () {
    return 'Cell {' + this.col + ', ' + this.row + '}';
  }
}
