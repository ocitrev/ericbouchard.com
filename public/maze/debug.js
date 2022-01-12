const WALL_COLOR = 0xcc;
const MAZE_COLOR = '#2080ff';
const BREAD_COLOR = '#ede6b1';
const FINISH_COLOR = '#ff8000';

var player;
var maze;
var collider;

function setup() {
  collider = new Collider();
  createCanvas(600, 600);
  maze = new Maze(width, height, 600/4);
  maze.reset();
  player = new Player()
  player.setStart(maze);
}

var path;

function draw() {
  var ticks = window.performance.now()
  maze.update(ticks);
  maze.render();
  player.update(ticks);
  player.render();

  if (path) {
    var s = maze.cellSize;
    stroke(0);
    noFill();
    beginShape();
    for (var i=0; i!=path.length; ++i) {
      var c = path[i];
      vertex(c.col * s + s / 2, c.row * s + s / 2);
    }
    endShape();
  }

}

function mousePressed() {
  var start = maze.getCellIndex(player.getCol(), player.getRow());
  var target = maze.getCellIndex(int(mouseX / maze.cellSize), int(mouseY / maze.cellSize));
  path = maze.findPath(maze.cells[start], maze.cells[target]);
}

function keyPressed() {
  var ret = true;

  switch (keyCode) {
    case 65: // A key
    case 37: // left arrow
    case 87: // W key
    case 38: // up arrow
    case 68: // D key
    case 39: // right arrow
    case 83: // S Key
    case 40: // down arrow
      ret = false;
      break;
  }

  return ret;
}

function keyReleased() {
  var ret = true;

  switch (keyCode) {
    case 65: // A key
    case 37: // left arrow
    case 87: // W key
    case 38: // up arrow
    case 68: // D key
    case 39: // right arrow
    case 83: // S Key
    case 40: // down arrow
      ret = false;
      break;
  }

  return ret;
}
