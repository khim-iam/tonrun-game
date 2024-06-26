class Player {
  constructor({x, y, radius, color,num}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.image = new Image();
      if(num===0){
        this.image.src = '../img/UFO/1.png';
      }
      else if(num===1){
        this.image.src = '../img/UFO/2.png';
      }
      else{
        this.image.src = '../img/UFO/3.png';
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
