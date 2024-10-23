'use strict'

function clear() {
  drawTable()
  divideField()
  drawGates()
  drawStartCircles()
  drawHoles()
}

function drawTable() {
  let p0 = new Point(0, 0)
  let p1 = new Point(table.width, table.height)
  rect(p0, p1, colors.table)
}

function rect(p0, p1, fillColor) {
  c.fillStyle = fillColor
  c.fillRect(p0.x, p0.y, p1.x, p1.y)
}

function divideField() {
  let startPoint = new Point(0, table.height / 2)
  let endPoint = new Point(table.width, table.height / 2)
  let width = table.width * ratios.lineTable
  line([startPoint, endPoint], width, colors.line)
}

function line(points, width, color) {
  c.strokeStyle = color
  c.lineWidth = width
  c.beginPath()
  for (let i of points) {
    c.lineTo(i.x, i.y)
  }
  c.stroke()
}

function drawGates() {
  let width = table.width * ratios.lineTable
  let pointsTop = [
    new Point(table.width * 0.25, 0),
    new Point(table.width * 0.25, table.height * 0.15),
    new Point(table.width * 0.75, table.height * 0.15),
    new Point(table.width * 0.75, 0)
  ]
  let pointsBottom = [
    new Point(table.width * 0.25, table.height),
    new Point(table.width * 0.25, table.height * 0.85),
    new Point(table.width * 0.75, table.height * 0.85),
    new Point(table.width * 0.75, table.height)
  ]
  line(pointsTop, width, colors.line)
  line(pointsBottom, width, colors.line)
}

function drawStartCircles() {
  let width = table.width * ratios.lineTable
  let centerTop = new Point(table.width / 2, table.height * 0.375)
  let centerBottom = new Point(table.width / 2, table.height * 0.625)
  let radius = table.width * 0.125
  circleStroke(centerTop, radius, width, colors.line)
  circleStroke(centerBottom, radius, width, colors.line)
}

function circle(center, radius, color) {
  c.fillStyle = color
  c.beginPath()
  c.arc(center.x, center.y, radius, 0, 2 * Math.PI)
  c.fill()
}

function circleStroke(center, radius, width, color) {
  c.strokeStyle = color
  c.lineWidth = width
  c.beginPath()
  c.arc(center.x, center.y, radius, 0, 2 * Math.PI)
  c.stroke()
}

function drawHoles() {
  let stepI = 0.04
  let stepJ = 0.0208
  for (let i = stepI; i < 1; i += stepI) {
    for (let j = stepJ; j < 1 - stepJ; j += stepJ) {
      let center = new Point(i * table.width, j * table.height)
      let radius = table.width * 0.005
      circle(center, radius, colors.hole)
    }
  }
}
