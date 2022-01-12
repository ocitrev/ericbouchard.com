function Player() {

  this.head = random(['🐭', '👦', '👧', '👨', '👩']);
  this.pos = new Vector2d(0, 0);
  this.oldpos = this.pos.copy();
  this.r = 1;
  this.color = color(255, 0, 0);
  this.breadCount = 0;

  this.render = function(ticks) {
    stroke(0, 100);
    strokeWeight(this.r / 6);
    fill(this.color);
    var border = this.r / 4.5;
    ellipse(this.pos.x, this.pos.y, this.r * 2 - border, this.r * 2 - border);
    
    var v = Vector2d.sub(this.endPos, this.pos);
    v.setMag(this.r / 3);
    v.add(this.pos);
    stroke(255, 200);
    strokeWeight(this.r / 2.25);
    point(v.x, v.y);
  };

  this.verletIntegration = function () {
    var ox = this.oldpos.x;
    var oy = this.oldpos.y;
    var px, py;
    this.oldpos.x = px = this.pos.x;
    this.oldpos.y = py = this.pos.y;
    // drag
    var d = 0.4;
    this.pos.x += d*px - d*ox;
    this.pos.y += d*py - d*oy;
  };

  var lastUpdate = window.performance.now();

  this.update = function(ticks) {

    var delta = ticks - lastUpdate;
    lastUpdate = ticks;
    this.verletIntegration();

    var speed = delta * (this.r * 0.009);
    var force = new Vector2d(0, 0);

    var bread = document.getElementById('bread');
    if (bread) {
      bread.innerHTML = this.breadCount;
    }

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      // A key
      force.x -= speed;
      //console.log('keyIsDown LEFT_ARROW');
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      // D key
      force.x += speed;
      //console.log('keyIsDown RIGHT_ARROW');
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      // W key
      force.y -= speed;
      //console.log('keyIsDown UP_ARROW');
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      // S key
      force.y += speed;
      //console.log('keyIsDown DOWN_ARROW');
    }

    // limit the speed
    var p = this.pos;
    var o = this.oldpos;
    var vx = p.x - o.x;
    var vy = p.y - o.y;
    //console.log(vx + force.x, vy + force.y);
    var newx = Math.min(this.MAXSPEED, Math.max(-this.MAXSPEED, vx + force.x));
    var newy = Math.min(this.MAXSPEED, Math.max(-this.MAXSPEED, vy + force.y));
    p.x = o.x + newx;
    p.y = o.y + newy;

    var col = this.getCol();
    var row = this.getRow();

    var idx = maze.getCellIndex(col, row);
    if (idx != -1) {
      var cell = maze.cells[idx];
      var item = cell.pickup();
      if (item) {
        this.breadCount += item;
      }
      if (this.breadCount > 0 && !cell.leaveBreadCrumbs()) {
        this.breadCount -= 1;
      }
    }

    var surroundings = this.getSurroundingCells();

    for (var i=0; i!=surroundings.length; ++i) {
      var cell = surroundings[i];
      for (var w=0; w!=cell.walls.length; ++w) {
        var wall = cell.walls[w];
        if (wall) {
          collider.collideCircleWithRect(this, wall);
        }
      }
    }
  };

  this.getCol = function() {
    return int(this.pos.x / maze.cellW);
  };

  this.getRow = function() {
    return int(this.pos.y / maze.cellH);
  };

  this.getSurroundingCells = function () {
    var ret = [];
    var col = this.getCol();
    var row = this.getRow();
    for (var y = -1; y != 2; ++y) {
      for (var x = -1; x != 2; ++x) {
        var i = maze.getCellIndex(col + x, row + y);
        if (i != -1) {
          ret.push(maze.cells[i]);
        }
      }
    }
    return ret;
  };

  this.setStart = function (maze) {
    var w = maze.cellW;
    var h = maze.cellH;
    this.pos.x = maze.start.col * w + w / 2;
    this.pos.y = maze.start.row * h + h / 2;
    this.oldpos = this.pos.copy();
    if (w < h) {
      this.r = w * 0.30;
    } else {
      this.r = h * 0.30;
    }

    this.endPos = new Vector2d(maze.end.col, maze.end.row);
    this.endPos.mul(w, h);
    this.endPos.add(w * 0.5, h * 0.5);
    this.MAXSPEED = Math.min(w, h) * 0.1;
  }

}
