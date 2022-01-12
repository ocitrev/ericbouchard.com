function Vector2d(x, y) {
  this.x = x;
  this.y = y;

  this.copy = function () {
    return new Vector2d(this.x, this.y);
  }

  this.perp = function () {
    return new Vector2d(this.y, -this.x);
  }

  this.dot = function (other) {
    if (other instanceof Vector2d) {
      return this.x * other.x + this.y * other.y;
    }
    return NaN;
  }

  this.add = function (x, y) {
    if (x instanceof Vector2d) {
      this.x += x.x;
      this.y += x.y;
    } else {
      this.x += x;
      if (y === undefined)
        this.y += x;
      else
        this.y += y;
    }
    return this;
  }

  this.sub = function (x, y) {
    if (x instanceof Vector2d) {
      this.x -= x.x;
      this.y -= x.y;
    } else {
      this.x -= x;
      if (y === undefined)
        this.y -= x;
      else
        this.y -= y;
    }
    return this;
  }

  this.mul = function (x, y) {
    if (x instanceof Vector2d) {
      this.x *= x.x;
      this.y *= x.y;
    } else {
      this.x *= x;
      if (y === undefined)
        this.y *= x;
      else
        this.y *= y;
    }
    return this;
  }

  this.div = function (x, y) {
    if (x instanceof Vector2d) {
      this.x /= x.x;
      this.y /= x.y;
    } else {
      this.x /= x;
      if (y === undefined)
        this.y /= x;
      else
        this.y /= y;
    }
    return this;
  }

  this.mag = function () {
    return Math.hypot(this.x, this.y);
  }

  this.setMag = function (mag) {
    return this.normalize().mul(mag);
  }

  this.normalize = function () {
    if (this.x === 0 && this.y === 0) return this;
    return this.div(this.mag());
  }

  this.getNormalized = function () {
    return this.copy().normalize();
  }

  this.heading = function () {
    return Math.atan2(this.y, this.x);
  }

  this.getNegated = function () {
    return this.copy().mul(-1);
  }

  this.inspect = function(depth, opts) {
    return "dd {x: " + this.x.toFixed(2) + ", y: " + this.y + "}";
  }
}

Vector2d.dot = function (vec1, vec2) {
  if (vec1 instanceof Vector2d && vec2 instanceof Vector2d) {
    return vec1.x*vec2.x + vec1.y*vec2.y;
  }
  return NaN;
};

Vector2d.add = function (vec1, vec2) {
  return new Vector2d(vec1.x, vec1.y).add(vec2);
};

Vector2d.sub = function (vec1, vec2) {
  return new Vector2d(vec1.x, vec1.y).sub(vec2);
};

Vector2d.mul = function (vec1, vec2) {
  return new Vector2d(vec1.x, vec1.y).mul(vec2);
};

Vector2d.div = function (vec1, vec2) {
  return new Vector2d(vec1.x, vec1.y).div(vec2);
};
