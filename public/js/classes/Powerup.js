class Powerup {
    constructor({ x, y, radius, type }) {
      this.x = x
      this.y = y
      this.radius = radius
      this.type = type
      //this.color = this.getColorByType(type)
      this.image = new Image();
      this.image.src= this.getsrcByType(type)

      this.imageLoaded = false;

      // Ensure the image is fully loaded before drawing it
      this.image.onload = () => {
          this.imageLoaded = true;
      };

    }
  
    getsrcByType(type) {
      switch (type) {
        case 'speed':
          return '../img/speed.png' 
        case 'slow':
          return '../img/slow.png' 
        case 'freeze':
          return '../img/stop.png' 
        default:
          return '../img/gold.png' 
      }
    }
  
    // draw() {
    //   c.beginPath()
    //   c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    //   c.fillStyle = this.color
    //   c.fill()
    //   c.closePath()
    // }



    draw() {
      if (this.imageLoaded) {
        c.save();

        // Create a circular clipping path
        c.beginPath();
        c.arc(this.x, this.y, this.radius * window.devicePixelRatio, 0, Math.PI * 2, false);
        c.clip();

        // Draw the image centered at (x, y)
        const pixelRatio = window.devicePixelRatio;
        const width = this.radius * 2 * pixelRatio;
        const height = this.radius * 2 * pixelRatio;
        const x = this.x - this.radius * pixelRatio;
        const y = this.y - this.radius * pixelRatio;
        c.drawImage(this.image, x, y, width, height);

        c.restore()
    } else {
        // Fallback to drawing a circle if the image hasn't loaded yet
        c.beginPath();
        c.arc(this.x, this.y, this.radius * window.devicePixelRatio, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    }
  }