class Powerup {
    constructor({ x, y, radius, type }) {
      this.x = x
      this.y = y
      this.radius = radius
      this.type = type
      this.color = this.getColorByType(type)
    }
  
    getColorByType(type) {
      switch (type) {
        case 'speed':
          return '#4caf50' // Green
        case 'slow':
          return '#ff9800' // Orange
        case 'freeze':
          return '#f44336' // Red
        default:
          return '#ccc' // Default grey
      }
    }
  
    draw() {
      c.beginPath()
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      c.fillStyle = this.color
      c.fill()
      c.closePath()
    }
  }