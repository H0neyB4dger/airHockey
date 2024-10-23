'use strict'

class Puck {
  constructor(position, speed) {
    this.x = position.x
    this.y = position.y
    this.speed = speed
  }

  getRealX() {
    return this.x * table.width
  }

  getRealY() {
    return this.y * table.height
  }

  getRealR() {
    return ratios.puckRTableWidth * table.width
  }

  getRealSpeed() {
    return new Vec(this.speed.x * table.width, this.speed.y * table.height)
  }

  getRelativeSpeed(realSpeed) {
    return new Vec(realSpeed.x / table.width, realSpeed.y / table.height)
  }

  draw() {
    let realX = this.getRealX()
    let realY = this.getRealY()
    let realR = this.getRealR()
    let dx = realX - realR
    let dy = realY - realR
    c.drawImage(puckImage, dx, dy, realR * 2, realR * 2)
  }

  update() {
    this.#collision()
    this.#outOfTable()
    this.#friction()
    this.#move()
  }

  #collision() {
    let realX = this.getRealX()
    let realY = this.getRealY()
    let realR = this.getRealR()
    for (let i of picture) {
      if (this === i || !(i instanceof Bat)) {
        continue
      }
      let realBatX = i.getRealX()
      let realBatY = i.getRealY()
      let realBatR = i.getRealR()
      let realDist = hypo(realX, realY, realBatX, realBatY)
      if (realDist < realR + realBatR) {
        this.#bounce(
          realX, realY, realR, 
          realBatX, realBatY, realBatR, 
          realDist
        )
      }
    }
  }

  #bounce(realX, realY, realR, realOtherX, realOtherY, realOtherR, realDist) {
    let realDistX = realX - realOtherX
    let realDistY = realY - realOtherY
    let realSpeed = this.getRealSpeed()
    let newAxisX = new Vec(realDistX, realDistY)
    let angle = newAxisX.getAngle()
    let rotatedVec = realSpeed.rotated(-angle)
    let maxDist = realR + realOtherR
    let accelerateBy = ratios.acceleration * ((maxDist - realDist) / maxDist + 1)
    let afterBounce = rotatedVec
    if (realDistX * realSpeed.x + realDistY * realSpeed.y < 0) {
      afterBounce = Vec.reverseX(afterBounce)
    }
    let minSpeed = new Vec(ratios.minSpeedAfterBounce * table.width, 0)
    let newRealSpeed = afterBounce.plused(minSpeed)
                                  .multipliedX(accelerateBy)
                                  .rotated(angle)
    let newRelativeSpeed = this.getRelativeSpeed(newRealSpeed)
    this.speed = newRelativeSpeed
  }

  #outOfTable() {
    if (this.x < ratios.puckRTableWidth) {
      this.speed = Vec.positiveX(this.speed)
    }
    if (this.x > 1 - ratios.puckRTableWidth) {
      this.speed = Vec.negativeX(this.speed)
    }
    if (this.y < ratios.puckRTableHeight) {
      this.speed = Vec.positiveY(this.speed)
    }
    if (this.y > 1 - ratios.puckRTableHeight) {
      this.speed = Vec.negativeY(this.speed)
    }
  }

  #friction() {
    let realSpeed = this.getRealSpeed()
    let speedAfterFriction = realSpeed.multiplied(ratios.afterFriction)
    this.speed = this.getRelativeSpeed(speedAfterFriction)
  }

  #move() {
    this.x += this.speed.x
    this.y += this.speed.y
  }
}

class Bat {
  constructor(position, image) {
    this.x = position.x
    this.y = position.y
    this.image = image
  }

  getRealX() {
    return this.x * table.width
  }

  getRealY() {
    return this.y * table.height
  }

  getRealR() {
    return ratios.batRTableWidth * table.width
  }

  draw() {
    let realX = this.getRealX()
    let realY = this.getRealY()
    let realR = this.getRealR()
    let dx = realX - realR
    let dy = realY - realR
    c.drawImage(this.image, dx, dy, realR * 2, realR * 2)
  }

  update() {

  }
}

class PlayersBat extends Bat {
  update() {
    this.x = Math.max(
      Math.min(mouse.x, 1 - ratios.batRTableWidth), 
      ratios.batRTableWidth
    )
    this.y = Math.max(
      Math.min(mouse.y, 1 - ratios.batRTableHeight), 
      0.5 + ratios.batRTableHeight
    )
  }
}

class Vec {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static reverseX(vec) {
    return new Vec(-vec.x, vec.y)
  }

  static reverseY(vec) {
    return new Vec(vec.x, -vec.y)
  }

  static reverse(vec) {
    return new Vec(-vec.x, -vec.y)
  }

  static positiveX(vec) {
    return new Vec(Math.abs(vec.x), vec.y)
  }

  static negativeX(vec) {
    return new Vec(-Math.abs(vec.x), vec.y)
  }

  static positiveY(vec) {
    return new Vec(vec.x, Math.abs(vec.y))
  }
  
  static negativeY(vec) {
    return new Vec(vec.x, -Math.abs(vec.y))
  }

  getAngle(pres = 16) {
    let { x, y } = this
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

  rotated(rad) {
    let angle = this.getAngle()
    let newAngle = angle + rad
    let cos = Math.cos(newAngle)
    let sin = Math.sin(newAngle)
    let distance = hypo(0, 0, this.x, this.y )
    let x = distance * cos
    let y = distance * sin
    return new Vec(x, y)
  }

  plused(secondVec) {
    return new Vec(this.x + secondVec.x, this.y + secondVec.y)
  }

  minused(secondVec) {
    return this.plus(Vec.reverse(secondVec))
  }

  multipliedX(number) {
    return new Vec(this.x * number, this.y)
  }

  multipliedY(number) {
    return new Vec(this.x, this.y * number)
  }

  multiplied(number) {
    return new Vec(this.x * number, this.y * number)
  }
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}


function animate() {
  clear()
  for (let i = 0; i < picture.length; i++) {
    picture[i].draw()
    picture[i].update()
  }
  requestAnimationFrame(animate)
}

function clear() {
  c.drawImage(tableImage, 0, 0, table.width, table.height)
}

function resizeTable() {
  resizeWidthHeight()
  resizeOutline()
}

function resizeWidthHeight() {
  let maxWidth = tableContainer.offsetWidth * ratios.tableCont
  let maxHeight = tableContainer.offsetHeight * ratios.tableCont
  if (maxWidth < maxHeight * ratios.widthHeightTable) {
    table.width = maxWidth
    table.height = maxWidth / ratios.widthHeightTable
  }
  else {
    table.width = maxHeight * ratios.widthHeightTable
    table.height = maxHeight
  }
}

function resizeOutline() {
  let outlineWidth = table.width * ratios.outlineTable
  table.style.outline = `${outlineWidth}px solid ${colors.outline}`
}

function hypo(x0, y0, x1, y1) {
  return ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
}

function radToDeg(rad) {
  return rad * (180 / Math.PI)
}

function degToRad(deg) {
  return deg * (Math.PI / 180)
}

function round(n, presision) {
  return +n.toFixed(presision)
}

function rememberMouse(event) {
  let {left, top} = table.getClientRects()[0]
  let tableX = Math.max(Math.min(event.x - left, table.width), 0)
  let tableY = Math.max(Math.min(event.y - top, table.height), 0)
  let fracX = tableX / table.width
  let fracY = tableY / table.height
  mouse.x = fracX
  mouse.y = fracY
}


const tableContainer = document.querySelector('#tableContainer')
const table = document.querySelector('#table')
const c = table.getContext('2d')
const ratios = {
  widthHeightTable: 0.52,
  tableCont: 0.8,
  outlineTable: 0.05,
  lineTable: 0.01,
  puckRTableWidth: 0.1,
  puckRTableHeight: 0.052,
  batRTableWidth: 0.1,
  batRTableHeight: 0.052,
  afterFriction: 0.99,
  acceleration: 1.05,
  minSpeedAfterBounce: 0.0075
}
const colors = {
  table: '#eee',
  outline: '#111',
  line:  '#e00',
  hole: '#aaa',
  puck: '#ee0'
}
const tableImage = new Image()
tableImage.src = './images/table.png'
const puckImage = new Image()
puckImage.src = './images/puck.png'
const batRedImage = new Image()
batRedImage.src = './images/batRed.png'
const batBlueImage = new Image()
batBlueImage.src = './images/batBlue.png'
const mouse = {x: 0.5, y: 0.85}

let picture = []
let puck = new Puck(new Point(0.6, 0.5), new Vec(0.0, 0.01))
picture.push(puck)
let playersBatRed = new PlayersBat(new Point(0.5, 0.85), batRedImage)
picture.push(playersBatRed)


resizeTable()
requestAnimationFrame(animate)


window.addEventListener(
  'resize',
  resizeTable
)
tableContainer.addEventListener(
  'mousemove',
  rememberMouse
)


// Приближенные размеры стола:
//   Длинна 2500мм
//   Ширина 1300мм
// Для канваса длинна стола это высота элемента, а ширина остаётся шириной.
// Отношение ширины к высоте === 0.52.

// Такс, по идеи теперь ширина table никогда не больше 90% от ширины tableContainer и
// высота table никогда не больше 90% от высоты tableContainer

// Рисунок на столе теперь просто картинка, чтобы не нагружать браузер и экономить
// строки кода

// Качество биты - кал. Но это исправлять будем, когда (если) всё заработает

// Боже, если бы я знал как сильно нужна будет физика, математика и геометрия в 
// кодерском деле...

// По Х скорость меньше, чем по У при одинаковых значениях. Потому что я тупенький и
// не учёл очевидную вещь.

// Скорости по Х и У теперь одинаковые. С горем пополам сделал ускорение при отскоках.
// Теперь при слишком большой скорости эта тварь застревает в стенах.
// Это тварь не застревает. Теперь что? Наверно ворота...
// Нет, нифига не ворота. Шайба плохо ускоряется битой       ^^
//                                                           () 
//                                                          <()>
//                                                           /\
// Жёлтый цвет слишком незаметный
// Сделать базовые размеры для стола, чтоб всегда были одинаковые и изменять только масштаб отрисовки
