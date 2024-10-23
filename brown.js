'use strict'

class Circle {
  constructor({x, y}, r, speed, color) {
    this.x = x
    this.y = y
    this.r = r
    this.speed = speed
    this.color = color
    this.alpha = 0
  }

  distBetweenCenters(otherObj) {
    return Math.sqrt((this.x - otherObj.x) ** 2 + (this.y - otherObj.y) ** 2)
  }

  update() {
    this.#collision()
    this.#outOfArena()
    this.#move()
    this.#changeAlpha()
  }

  #collision() {
    for (let i = 0; i < picture.length; i++) {
      let dist = this.distBetweenCenters(picture[i])
      if (this !== picture[i] && dist < this.r + picture[i].r) {
        this.#bounce(picture[i])
      }
    }
  }

  #bounce(otherObj) {
    let distX = this.x - otherObj.x
    let distY = this.y - otherObj.y
    let speedDifX = this.speed.x - otherObj.speed.x
    let speedDifY = this.speed.y - otherObj.speed.y
    let newAxisX = new Vector(distX, distY)
    let angle = newAxisX.getAngle()

    if (distX * speedDifX + distY * speedDifY < 0) {
      let rotatedVec = this.speed.rotated(-angle)
      let afterBounce = rotatedVec.mirroredHorizontal()
      let newSpeed = afterBounce.rotated(angle)
      this.speed = newSpeed

      let rotatedVecOther = otherObj.speed.rotated(-angle)
      let afterBounceOther = rotatedVecOther.mirroredHorizontal()
      let newSpeedOther = afterBounceOther.rotated(angle)
      otherObj.speed = newSpeedOther
    }
  }

  #outOfArena() {
    if (this.x + this.speed.x < this.r || this.x + this.speed.x > canvas.width - this.r) {
      this.speed = this.speed.mirroredHorizontal()
    }
    if (this.y + this.speed.y < this.r || this.y + this.speed.y > canvas.height - this.r) {
      this.speed = this.speed.mirroredVertical()
    }
  }

  #move() {
    let {x, y} = this.speed
    this.x += x
    this.y += y
  }

  #changeAlpha() {
    if (this.distBetweenCenters(mousePosition) < 150) {
      this.alpha = Math.min(this.alpha + 0.1, 1)
    }
    else {
      this.alpha = Math.max(this.alpha - 0.1, 0)
    }
  }

  draw() {
    c.fillStyle = this.color
    c.strokeStyle = this.color
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    c.fill()    
    c.restore()
    c.stroke()
  }

  static random(r=null) {
    r = r? r: randRange(5, 20)
    let x = randRange(r, canvas.width - r)
    let y = randRange(r, canvas.height - r)
    let speed = new Vector(
      randRange(1, 3), randRange(1, 3)).rotated(randRange(0, 2 * Math.PI))
    let colorArr = Object.values(colors)
    let color = colorArr[randRange(0, colorArr.length)]
    return new Circle({x, y}, r, speed, color)
  }
}

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  getAngle(pres = 16) {
    let {x, y} = this
    let tan = y / x
    let angle
    if (x === 0 && y === 0) {
      angle = 0
    }
    else if (x >= 0 && y >= 0) {
      angle = Math.atan(tan)
    }
    else if (x < 0 && y >= 0) {
      angle = Math.PI + Math.atan(tan)
    }
    else if (x < 0 && y < 0) {
      angle = Math.PI + Math.atan(tan)
    }
    else if (x >= 0 && y < 0) {
      angle = 2 * Math.PI + Math.atan(tan)
    }
    return round(angle, pres)
  }

  getAngleInDeg(pres = 16) {
    return round(radToDeg(this.getAngle()), pres)
  }

  multiplied(n) {
    return new Vector(this.x * n, this.y * n)
  }

  added(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y)
  }

  rotated(rad) {
    let angle = this.getAngle()
    let newAngle = angle + rad
    let cos = Math.cos(newAngle)
    let sin = Math.sin(newAngle)
    let distance = hypotenuse({ x1: 0, y1: 0 }, { x2: this.x, y2: this.y })
    let x = distance * cos
    let y = distance * sin
    return new Vector(x, y)
  }

  mirroredHorizontal() {
    return new Vector(-this.x, this.y)
  }

  mirroredVertical() {
    return new Vector(this.x, -this.y)
  }
}


function animate() {
  clear()
  for (let i = 0; i < picture.length; i++) {
    picture[i].update()
    picture[i].draw()
  }
  requestAnimationFrame(animate)
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height)
}

function radToDeg(rad) {
  return (180 / Math.PI) * rad
}

function degToRad(deg) {
  return (Math.PI / 180) * deg
}

function hypotenuse({ x1, y1 }, { x2, y2 }) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function round(n, presision) {
  return +n.toFixed(presision)
}

function makeCanvasFullWidth() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function rememberMousePosition(event) {
  mousePosition.x = event.x
  mousePosition.y = event.y
}

function randRange(floor, ceil) {
  return Math.floor(Math.random() * (ceil - floor) + floor)
}

function radToDeg(rad) {
  return (360 / (2 * Math.PI)) * rad
}

function degToRad(deg) {
  return ((2 * Math.PI) / 360) * deg
}

function fillRandom(n, r=null) {
  for (let i = 0; i < n; i++) {
    let circle = Circle.random(r)
    let counter = 0
    while (overlap(circle)) {
      circle = Circle.random(r)
      counter++
      if (counter >= 100) {
        throw Error('To much generation attempts')
      }
    }
    picture.push(circle)
  }
}

function overlap(circle) {
  for (let i = 0; i < picture.length; i++) {
    if (circle.distBetweenCenters(picture[i]) < circle.r + picture[i].r) {
      return true
    }
  }
  return false
}


const colors = {
  blue: '#1500ff',
  pink: '#ed00b8',
  red: '#ff0071',
  orange: '#ff693e',
  lightOrange: '#ffbb33',
  yellow: '#f9f871',
  green: '#00cd9a'
}
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const picture = []
const mousePosition = {x: 0, y: 0}


makeCanvasFullWidth()
fillRandom(200, 20)
// picture.push(new Circle({x: 100, y: 100}, 50, new Vector(5, 5), colors.blue))
// picture.push(new Circle({x: 170, y: 170}, 50, new Vector(-10, -5), colors.red))
requestAnimationFrame(animate)


window.addEventListener(
  'resize',
  makeCanvasFullWidth
)
window.addEventListener(
  'mousemove',
  rememberMousePosition
)

// Если поумнеешь, доделай
