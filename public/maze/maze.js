
function Maze(w, h, cellW, cellH) {

  this.width = w;
  this.height = h;
  this.cols = floor(w / cellW);
  this.rows = floor(h / cellH);
  this.cells = [];
  this.cellW = cellW;
  this.cellH = cellH;
  this.bg = null;

  this.findPath = function (start, target) {

    // For each node, the total cost of getting from the start node to the goal
    // by passing by that node. That value is partly known, partly heuristic.
    var fScore = {};
    // For each node, the cost of getting from the start node to that node.
    var gScore = {};
    // The set of currently discovered nodes that are already evaluated.
    // Initially, only the start node is known.
    var openSet = {};
    openSet[start] = start;
    var openSetCount = 1;
    // The set of nodes already evaluated.
    var closedSet = {};
    // For each node, which node it can most efficiently be reached from.
    // If a node can be reached from many nodes, cameFrom will eventually contain the
    // most efficient previous step.
    var cameFrom = {};

    // helper function to get the fScore
    function getFScore(cell) {
      var f = fScore[cell];
      if (f === undefined) {
        f = Infinity;
        fScore[cell] = f;
      }
      return f;
    }

    // helper function to get the gScore
    function getGScore(cell) {
      var g = gScore[cell];
      if (g === undefined) {
        g = Infinity;
        gScore[cell] = g;
      }
      return g;
    }

    function getLowestFromOpenSet() {
      var low = Infinity;
      var ret = null;
      for (var k in openSet) {
        var i = openSet[k];
        var f = getFScore(i);
        if (f < low) {
          low = f;
          ret = i;
        }
      }
      return ret;
    }

    function heuristicCostEstimate(cur, goal) {
      return Math.abs(goal.col - cur.col) + Math.abs(goal.row - cur.row);
    }

    function reconstructPath(current) {
      var totalPath  = [];
      while (current) {
        totalPath.push(current);
        current = cameFrom[current];
      }
      return totalPath;
    }

    // The cost of going from start to start is zero.
    gScore[start] = 0;
    // For the first node, that value is completely heuristic.
    fScore[start] = heuristicCostEstimate(start, target);

    while (openSetCount > 0) {
      var current = getLowestFromOpenSet();
      if (current == target) {
        return reconstructPath(current);
      }

      delete openSet[current];
      openSetCount--;
      closedSet[current] = current;
      var neighbors = current.getNeighbors();

      for (var i=0; i!=neighbors.length; ++i) {
        var neighbor = neighbors[i];
        if (closedSet[neighbor]) {
          // Ignore the neighbor which is already evaluated.
          continue;
        }

        // The distance from start to a neighbor
        var tentative_gScore = getGScore(current) + 1;

        if (!openSet[neighbor]) {
          // Discover a new node
          openSet[neighbor] = neighbor;
          openSetCount++;
        } else if (tentative_gScore >= getGScore(neighbor)) {
          // This is not a better path.
          continue;
        }

        // This path is the best until now. Record it!
        cameFrom[neighbor] = current
        gScore[neighbor] = tentative_gScore;
        fScore[neighbor] = getGScore(neighbor) + heuristicCostEstimate(neighbor, target);
      }
    }


    return null;
  };

  this.reset = function(seed) {
    this.cellStack = [];
    this.cells = [];
    this.bg = null;
    this.path = null;

    for (var r = 0; r < this.rows; ++r) {
      for (var c = 0; c < this.cols; ++c) {
        this.cells.push(new Cell(c, r, this.cellW, this.cellH));
      }
    }

    this.current = this.cells[int(random(0, this.cells.length))];
    this.current.setStart();
    this.current.visit();
    this.start = this.current;

    this.longestPath = {
      size: 0,
      cell: null
    };

    // generate maze
    while (this.current) {
      var next = this.current.nextUnvisitedNeighbor();

      if (next) {
        next.visit();
        this.current.removeWall(next);
        this.cellStack.push(this.current);

        if (this.cellStack.length > this.longestPath.size) {
          this.longestPath.size = this.cellStack.length;
          this.longestPath.cell = next;
        }

        this.current = next;
      } else if (this.cellStack.length != 0) {
        this.current = this.cellStack.pop();
      } else {
        this.current = null
        this.longestPath.cell.setEnd();
        this.end = this.longestPath.cell;
      }
    }

    var p = this.getPath();
    p[p.length - 3].addBread();

    var breadCount = int(random(this.longestPath.size / 4, this.longestPath.size / 2) / 10);
    for (var i=0; i!=breadCount; ++i) {
      var b = random(this.cells);
      while (b.start || b.end) {
        b = random(this.cells);
      }

      b.addBread();
    }
  };

  this.getCellIndex = function (col, row) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) {
      return -1;
    }

    return row * this.cols + col;
  };

  this.removeRedundantWalls = function () {
    for (r=0; r!=this.rows; ++r) {
      for (var c=0; c!=this.cols; ++c) {
        var cell = this.cells[r * this.cols + c];
        if (r != 0) {
          cell.walls[kRIGHT] = null;
        }
        if (c != 0) {
          cell.walls[kBOTTOM] = null;
        }
      }
    }
  };

  this.update = function(ticks) {
  };

  this.invalidate = function() {
    this.bg = null;
  };

  this.path = null;

  this.drawPath = function (ticks) {
    if (this.path && this.path.length != 0) {
      var w = this.cellW;
      var h = this.cellH;
      var hw = w * 0.5;
      var hh = h * 0.5;
      stroke(0, 20);
      strokeWeight(Math.min(w, h) * 0.2);
      noFill();
      beginShape();
      
      var c = this.path[0];
      vertex(c.col * w + hw, c.row * h + hh);
      
      for (var i=0; i!=this.path.length; ++i) {
        c = this.path[i];
        curveVertex(c.col * w + hw, c.row * h + hh);
      }
      
      c = this.path[this.path.length-1];
      vertex(c.col * w + hw, c.row * h + hh);
      
      endShape();
    }
  };

  this.render = function(ticks) {

    if (this.bg) {
      pixels = this.bg;
      updatePixels();
    } else {
      background(MAZE_COLOR);
      // noStroke();
      // fill(WALL_COLOR);
      // beginShape(QUADS);
      // for (var i = 0; i<this.cells.length; ++i) {
      //   this.cells[i].renderWallQuads();
      // }
      // endShape(CLOSE);
      var w = this.cellW;
      var h = this.cellH;
      var s = Math.min(w, h) / 15;
      stroke(WALL_COLOR);
      strokeWeight(s);
      noFill();
      beginShape(LINES);
      for (var i = 0; i<this.cells.length; ++i) {
        this.cells[i].renderWallLines(ticks);
      }
      endShape();

      loadPixels();
      this.bg = pixels.slice();
    }

    this.drawPath(ticks);

    for (var i = 0; i<this.cells.length; ++i) {
      this.cells[i].renderNoWalls(false);
    }
  };

  this.getPath = function (fromPlayer) {
    var start;
    if (fromPlayer) {
      var idx = this.getCellIndex(player.getCol(), player.getRow());
      start = this.cells[idx];
    } else {
      start = this.start;
    }

    var target;
    for (var i=0; i!=this.cells.length; ++i) {
      var c = this.cells[i];
      if (c.end) {
        target = c;
        break;
      }
    }

    return this.findPath(start, target);
  };

  this.solve = function () {
    this.path = this.getPath(true);
  }


}
