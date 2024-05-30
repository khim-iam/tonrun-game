class Coin {
    constructor({x, y, radius, color}) {
      this.x = x
      this.y = y
      this.radius = radius
      this.image = new Image();
      if(color==='gray'){
        this.image.src = '../img/silver.jpg';
      }
      else if(color==='yellow'){
        this.image.src = '../img/gold.jpg';
      }
      else if(color==='green'){
        this.image.src = '../img/diamond.png';
      }
      else{
        this.image.src = '../img/ton.png';
      }
        this.imageLoaded = false;

        // Ensure the image is fully loaded before drawing it
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
  
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
  