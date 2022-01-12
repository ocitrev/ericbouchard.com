function Collider() {

  // points are projected on the form point+t*direction. Return value +1 if all t > 0
  // -1 if all t < 0, 0 otherwise, in wich case the line splits the polygon.
  this.WhichSide = function (points, direction, point) {
    var positive = 0;
    var negative = 0;

    for (var i=0; i!=points.length; ++i) {
      var t = direction.dot(Vector2d.sub(points[i], point));
      if (t > 0) {
        positive++;
      } else if (t < 0) {
        negative++;
      }
      if (positive && negative) {
        return 0;
      }
    }

    return positive? +1 : -1;
  };

  this.TestIntersection2d = function (convex0, convex1) {

    // corner case for empty polygons
    if (convex0.points.length == 0 || convex1.points.length == 0) {
      return false;
    }

    // Test edges of C0 for separation . Because of the counterclockwise ordering ,
    // the projection interval for C0 i s [m,0] where m <= 0. Only try to determine
    // if C1 i s on the ‘positive’ side of the line.
    for (var i0=0, i1=convex0.points.length-1; i0!=convex0.points.length; i1=i0, ++i0) {
      var d = Vector2d.sub(convex0.points[i0], convex0.points[i1]).perp();
      if (this.WhichSide(convex1.points, d, convex0.points[i0]) > 0) {
        // C1 is entirely on ‘positive’ side of line convex0.points[i0]+t∗D
        return false ;
      }
    }
    // Test edges of C1 for separation . Because of the counterclockwise ordering ,
    // the projection interval for C1 is [m,0] where m <= 0. Only try to determine
    // if C0 is on the ‘positive’ side of the line.
    for (var i0=0, i1=convex1.points.length-1; i0!=convex1.points.length; i1=i0, ++i0) {
      var d = Vector2d.sub(convex1.points[i0], convex1.points[i1]).perp();
      if (this.WhichSide(convex0.points, d, convex1.points[i0]) > 0) {
        // C0 is entirely on ‘positive’ side of line convex1.points[i0]+t∗D
        return false;
      }
    }

    return true;
  };

  this.lt = function (a, b, toler) {
    if (toler === undefined)
      toler = Number.EPSILON;
    else
      toler = Math.abs(toler);
    return (a - b) < -toler;
  }

  this.le = function (a, b, toler) {
    if (toler === undefined)
      toler = Number.EPSILON;
    else
      toler = Math.abs(toler);
    return (a - b) < toler;
  }

  this.gt = function (a, b, toler) {
    if (toler === undefined)
      toler = Number.EPSILON;
    else
      toler = Math.abs(toler);
    return (a - b) > toler;
  }

  this.ge = function (a, b, toler) {
    if (toler === undefined)
      toler = Number.EPSILON;
    else
      toler = Math.abs(toler);
    return (a - b) > -toler;
  }

  this.eq = function (a, b, toler) {
    if (toler === undefined)
      toler = Number.EPSILON;
    else
      toler = Math.abs(toler);
    return Math.abs(a-b) < toler;
  }

  this.applyReponseToCircle = function (px, py, dx, dy, circle) {
    //console.log(circle);
    var p = circle.pos;
    var o = circle.oldpos;
    
    //calc velocity
    var vx = p.x - o.x;
    var vy = p.y - o.y;
    
    // find component of velocity parallel to collision normal
    var dp = vx*dx + vy*dy;
    // project velocity onto collision normal
    var nx = dp * dx;
    
    // nx,ny is normal velocity
    var ny = dp * dy;
    
    // px,py is tangent velocity
    var tx = vx - nx;
    var ty = vy - ny;

    // we only want to apply collision response forces if the object is travelling into,
    // and not out of, the collision
    var b, bx, by, f, fx, fy;

    if (dp < 0) {
      f = 0; //FRICTION;
      fx = tx*f;
      fy = ty*f;		
      
      bx = (nx);
      by = (ny);
    }
    else
    {
      //moving out of collision, do not apply forces
      nx = ny = fx = fy = 0;
    }

    // project object out of collision
    p.x += px;
    p.y += py;
    
    // apply bounce+friction impulses which alter velocity
    o.x += px + nx + fx;
    o.y += py + ny + fy;
  }

  this.resolveCircleWithRect = function (px, py, oh, ov, circle, rectangle) {
    if (oh == 0) {
      if (ov == 0) {
        if (px < py) {
          // interieur
          var dx = circle.pos.x - rectangle.x;
          if (dx < 0) {
            this.applyReponseToCircle(-px, 0, -1, 0, circle);
            return true;
          } else {
            this.applyReponseToCircle(px, 0, 1, 0, circle);
            return true;
          }
        } else {
          var dy = circle.pos.y - rectangle.y;
          if (dy < 0) {
            this.applyReponseToCircle(0, -py, 0, -1, circle);
            return true;
          } else {
            this.applyReponseToCircle(0, py, 0, 1, circle);
            return true;
          }
        }
      } else {
        // collision verticale
        this.applyReponseToCircle(0, py * ov, 0, ov, circle);
        return true;
      }
    } else if (ov == 0) {
      // collision horizontale
      this.applyReponseToCircle(px * oh, 0, oh, 0, circle);
      return true;
    } else {
      // collision diagonale
      var rw = rectangle.width;
      var rh = rectangle.height;
      var rpos = new Vector2d(rectangle.x, rectangle.y);
      var v = rpos.copy().add(oh * rw, ov * rh);
			var d = circle.pos.copy().sub(v);
      var len = d.mag();
      var p = circle.r - len;

      if (0 < p) {
        if (len == 0) {
          d.x = oh / Math.SQRT2;
          d.y = ov / Math.SQRT2;
        } else {
          d.div(len);
        }

        this.applyReponseToCircle(d.x * p, d.y * p, d.x, d.y, circle);
        return true;
      }
    }
  }

  this.collideCircleWithRect = function (circle, rectangle) {
    // ref: http://www.metanetsoftware.com/2016/n-tutorial-a-collision-detection-and-response
    // ref: https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf

    var rx = rectangle.x;
    var ry = rectangle.y;
    var rw = rectangle.width;
    var rh = rectangle.height;
    var cx = circle.pos.x;
    var cy = circle.pos.y;
    var r = circle.r;
    var ret = null;

    var dx = cx - rx;
    var px = (rw + r) - Math.abs(dx);

    if (0 < px) {

      var dy = cy - ry;
      var py = (rh + r) - Math.abs(dy);

      if (0 < py) {
        // cercle cillisione peut-etre avec le rectangle.

        var ov = 0;
        var oh = 0;

        if (dx < -rw) {
          // cercle a gauche
          oh = -1;
        } else if (rw < dx) {
          // cercle a droite
          oh = 1;
        }

        if (dy < -rh) {
          // cercle en haut
          ov = -1;
        } else if (rh < dy) {
          // cercle en bas
          ov = 1;
        }

        return this.resolveCircleWithRect(px, py, oh, ov, circle, rectangle);
      }
    }

    return false;

    // if (this.le(cx + r, x1)
    //   || this.ge(cx - r, x2)) {
    //   return null;
    // }

    // if (this.le(cy + r, y1)
    //   || this.ge(cy - r, y2)) {
    //   return null;
    // }

    // var ret = null;

    // if (this.lt(cx, x1)) {
    //   if (this.lt(cy, y1)) {
    //     // ○
    //     //   ┌───────┐
    //     //   │       │
    //     //   └───────┘
    //     //
    //     var v = circle.pos.copy();
    //     v.sub(x1, y1);
    //     v.setMag(r - v.mag());
    //     ret = v;
    //   } else if (this.gt(cy, y2)) {
    //     //
    //     //   ┌───────┐
    //     //   │       │
    //     //   └───────┘
    //     // ○
    //     var v = circle.pos.copy();
    //     v.sub(x1, y2);
    //     v.setMag(r - v.mag());
    //     ret = v;
    //   } else {
    //     //
    //     //   ┌───────┐
    //     // ○ │       │
    //     //   └───────┘
    //     //
    //     ret = new Vector2d(x1 - r - cx, 0);
    //   }

    // } else if (this.gt(cx, x2)) {

    //   if (this.lt(cy, y1)) {
    //     //             ○
    //     //   ┌───────┐
    //     //   │       │ 
    //     //   └───────┘
    //     //
    //     var v = circle.pos.copy();
    //     v.sub(x2, y1);
    //     v.setMag(r - v.mag());
    //     ret = v;
    //   } else if (this.gt(cy, y2)) {
    //     //
    //     //   ┌───────┐
    //     //   │       │ 
    //     //   └───────┘
    //     //             ○
    //     var v = circle.pos.copy();
    //     v.sub(x2, y2);
    //     v.setMag(r - v.mag());
    //     ret = v;
    //   } else {
    //     //
    //     //   ┌───────┐
    //     //   │       │ ○
    //     //   └───────┘
    //     //
    //     ret = new Vector2d(x2 + r - cx, 0);
    //   }

    // } else {

    //   if (this.lt(cy, y1)) {
    //     //       ○
    //     //   ┌───────┐
    //     //   │       │
    //     //   └───────┘
    //     //
    //     ret = new Vector2d(0, y1 - r - cy);
    //   } else if (this.gt(cy, y2)) {
    //     //
    //     //   ┌───────┐
    //     //   │       │
    //     //   └───────┘
    //     //       ○
    //     ret = new Vector2d(0, y2 + r - cy);
    //   } else {
    //     //
    //     //   ┌───────┐
    //     //   │   ○   │
    //     //   └───────┘
    //     //

    //     //console.log('inside');
    //     var v1 = new Vector2d(x2, y2).sub(x1, y1);
    //     var v2 = new Vector2d(cx, cy).sub(x1, y1);
    //     var v3 = new Vector2d(x1, y2).sub(x2, y1);
    //     var v4 = new Vector2d(cx, cy).sub(x2, y1);
    //     var side1 = v1.x * v2.y - v1.y * v2.x < 0;
    //     var side2 = v3.x * v4.y - v3.y * v4.x < 0;

    //     if (side1) {
    //       if (side2) {
    //         // console.log('right');
    //         ret = new Vector2d(x2 + r - circle.pos.x, 0);
    //       } else {
    //         // console.log('top');
    //         ret = new Vector2d(0, y1 - r - cy);
    //       }
    //     } else {
    //       if (side2) {
    //         // console.log('bottom');
    //         ret = new Vector2d(0, y2 + r - circle.pos.y);
    //       } else {
    //         // console.log('left');
    //         ret = new Vector2d(x1 - r - cx, 0);
    //       }
    //     }
    //   }
    // }

    return ret;
  };
  
}
