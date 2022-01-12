// todo: connecter les murs continus pour en faire des listes de points.

p5.disableFriendlyErrors = true;

const WALL_COLOR = 0xcc;
const MAZE_COLOR = '#2080ff';
const BREAD_COLOR = '#ede6b1';
const FINISH_COLOR = '#ff8000';

var bravoMin = 80;
var bravoMax = 90;
var bravoSize = bravoMin;
var bravoRotate = 0;
var bravoRotateMax = Math.PI/12;

function drawBravo() {
  push();
  translate(width/2, height/2)
  rotate(bravoRotate);
  strokeWeight(3);
  stroke(255);
  textAlign(CENTER, CENTER);
  bravoRotate = lerp(bravoRotate, bravoRotateMax, 0.05);

  if (Math.abs(bravoRotate - bravoRotateMax) < 0.01) {
    bravoRotateMax = -bravoRotateMax;
  }

  bravoSize = lerp(bravoSize, bravoMax, 0.1);
  if (Math.abs(bravoSize - bravoMax) < 0.5) {
    var tmp = bravoMax;
    bravoMax = bravoMin;
    bravoMin = tmp;
  }
  textSize(bravoSize);
  fill("red");
  text("🎈 Gagné ! 🎈", 0, 0);
  pop();
}

var maze;
var lastTS;
var lastFPS;
var player;
var winSnapshot;

function resetMaze() {
  winSnapshot = null;
  player = new Player();
  maze.reset();
  player.setStart(maze);
}

function setup() {
  var w = 1280 * 0.75;
  var h = 720 * 0.75;
  createCanvas(w, h);
  collider = new Collider();
  maze = new Maze(w, h, w/32, h/18);
  resetMaze();
  textColor = color(51);
  bgColor = color(32, 128, 255, 255);

  fpsHolder = createDiv();
  fpsHolder.hide();
  lastFPS = window.performance.now();
}

function updateFPS(ticks) {
  var delta = ticks - lastFPS;

  if (delta > 500 && fpsHolder.style('display') !== 'none') {
    lastFPS = ticks;
    var fps = frameRate();
    fpsHolder.html("FPS: " + fps.toFixed(2));
  }
}

function finished() {
  player = null;
  loadPixels();
  winSnapshot = pixels.slice();
}

function draw() {
  var ticks = window.performance.now();

  if (player) {

    maze.update(ticks);
    maze.render(ticks);

    player.update(ticks);
    player.render(ticks);

    var c = player.getCol();
    var r = player.getRow();
    var idx = maze.getCellIndex(c, r);

    if (idx != -1) {
      if (maze.cells[idx].end) {
        finished();
      }
    }
  } else {
    if (winSnapshot) {
      pixels = winSnapshot;
      updatePixels();
    }

    drawBravo(ticks);
  }

  updateFPS(ticks);
}

function keyPressed() {
  switch (keyCode) {
    case 65: // A key
    case 37: // left arrow
    case 87: // W key
    case 38: // up arrow
    case 68: // D key
    case 39: // right arrow
    case 83: // S Key
    case 40: // down arrow
      return false;
    case 70: // F
      if (fpsHolder.style('display') === 'none') {
        fpsHolder.show();
      } else {
        fpsHolder.hide();
      }
      break;
    case 82: // R
      resetMaze();
      break;
  }

  return true;
}

function solve() {
  maze.solve();
}
