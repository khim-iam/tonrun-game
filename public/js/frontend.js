
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// const socket = io();
// const socket = io('http://127.0.0.1:3000');
// const socket = io('http://192.168.156.111:3000');
const socket = io('https://tonrun-game-production.up.railway.app');
// const socket = io('process.env.BACKEND_URL');



const devicepixelratio = window.devicePixelRatio || 1;

canvas.width = innerWidth * devicepixelratio;
canvas.height = innerHeight * devicepixelratio;

const x = canvas.width / 2;
const y = canvas.height / 2;

const namearr=["Daksh","Kunal","Himanshu"];


const frontendplayers = {};
const frontendcoins = {};
const frontendpowerups = {};
let selectedPowerUp = null;
const powerupused = {
  speed: false,
  slow: false,
  freeze: false
};


const countdownElement = document.getElementById('countdown');

socket.on('countdown', (countdown) => {
  if (countdown === 'Go!') {
    countdownElement.innerText = countdown;
    setTimeout(() => {
      countdownElement.innerText = '';
    }, 1000);
  }
  else if(countdown==='Stop!'){
    countdownElement.innerText = countdown;
    setTimeout(() => {
      countdownElement.innerText = '';
      document.querySelector('#endpop').style.display="block"
    }, 1000);
  } else {
    countdownElement.innerText = countdown;
  }
});




document.querySelectorAll('.power-up').forEach(powerUp => {
  powerUp.addEventListener('click', () => {
      gsap.to(powerUp, {
          duration: 0.2,
          scale: 1.2,
          yoyo: true,
          repeat: 1
      });
  });
});


// socket.on('countdownend', (countdown) => {
//   if (countdown === 'Stop!') {
//     countdownElement.innerText = countdown;
//     setTimeout(() => {
//       countdownElement.innerText = '';
//       document.querySelector('#endpop').style.display="block"
//     }, 1000);
//   } else {
//     countdownElement.innerText = countdown;
//   }
// });


// socket.on('endgame',()=>{
//   document.querySelector('#endpop').style.display="block"
// })



document.querySelectorAll('.power-up').forEach(button => {
  button.addEventListener('click', () => {
    const type = button.getAttribute('data-type');
    if (powerupused[type]) {
      selectedPowerUp = null;
      powerupused[type] = false;
    } else {
      selectedPowerUp = type;
      powerupused[type] = true;
    }
  });
});

canvas.addEventListener('click', (event) => {
  if (selectedPowerUp) {
    const x = event.clientX * devicepixelratio;
    const y = event.clientY * devicepixelratio;
    socket.emit('placePowerUp', { type: selectedPowerUp, x, y });
    selectedPowerUp = null;
  }
});

socket.on('updatePowerUps', (backendpowerups) => {
  for (const id in backendpowerups) {
    const powerup = backendpowerups[id];
    if (!frontendpowerups[id]) {
      frontendpowerups[id] = new Powerup({
        x: powerup.x,
        y: powerup.y,
        radius: 20,
        type: powerup.type
      });
    }
  }
  for (const id in frontendpowerups) {
    if (!backendpowerups[id]) {
      delete frontendpowerups[id];
    }
  }
});

// socket.on('connect', () => {
//   const league = prompt('Enter league (1, 2, or 3):');
//   socket.emit('selectLeague', league);
//   socket.emit('initcanvas', {
//     width: canvas.width,
//     height: canvas.height,
//     devicepixelratio
//   });
// });




// Working but with bugs - so metimes taking null league
// socket.on('connect', async () => {
//   const selectLeague = async () => {
//     return new Promise((resolve) => {
//       const league = prompt('Enter league (1, 2, or 3):');
//       resolve(league);
//     });
//   };

//   const league = await selectLeague();
//   socket.emit('selectLeague', league);

//   socket.emit('initcanvas', {
//     width: canvas.width,
//     height: canvas.height,
//     devicepixelratio
//   });
// });


// const username = window.username;
// const selectedValue = window.selectedValue;
// Use these variables as needed in your script
const backendInput ={
  username : window.username,
  selectedValue : window.selectedValue
}
socket.on('connect', () => {
  // socket.on('connect', async () => {

  // const selectLeague = async () => {
  //   return new Promise((resolve) => {
  //     let league = null;
  //     while (!league || !['1', '2', '3'].includes(league)) {
  //       league = prompt('Enter league (1, 2, or 3):');
  //       // league = selectedValue;
  //     }
  //     resolve(league);
  //   });
  // };

  // const backendInput ={
  //   username : window.username,
  //   selectedValue : window.selectedValue
  // }
  
  
  // const league = await selectLeague();
  // socket.emit('selectLeague', league);

  socket.emit('selectLeague', backendInput);


  socket.emit('initcanvas', {
    width: canvas.width,
    height: canvas.height,
    devicepixelratio
  });
});

const colorarr = ['gray', 'gray', 'gray', 'gray', 'yellow', 'yellow', 'yellow', 'green', 'green', 'cyan'];

socket.on('updateCoins', (backendcoins) => {
  //console.log(1000000)
  for (const id in backendcoins) {
    const coin = backendcoins[id];
    if (!frontendcoins[id]) {
      frontendcoins[id] = new Coin({
        x: coin.x,
        y: coin.y,
        radius: 25,
        color: colorarr[(coin.colornum) % 10]
      });
    }
  }
  for (const id in frontendcoins) {
    if (!backendcoins[id]) {
      delete frontendcoins[id];
    }
  }
});

socket.on('updatePlayers', (backendplayers) => {
  for (const id in backendplayers) {
    const backendplayer = backendplayers[id];
    if (!frontendplayers[id]) {
      frontendplayers[id] = new Player({
        x: backendplayer.x,
        y: backendplayer.y,
        radius: backendplayer.radius,
        color: backendplayer.color,
        num:backendplayer.num
      });
      
      //document.querySelector('#playerlabels').innerHTML += `<div data-id="${id}" data-score="${backendplayer.score}">${id} :${backendplayer.score} </div>`;
      // const playerLabelHTML = `
      //   <div class="scorecard" data-id="${id}">
      //     <div class="circle"></div>
      //     <div class="username">${id}</div>
      //     <div class="score">${backendplayer.score}</div>
      //   </div>`;
      // document.querySelector('#playerlabels').innerHTML += playerLabelHTML;

      


      const playerLabelHTML = `
        <div class="scorecard" data-id="${id}">
          <div class="circle">
            <span class="score">${backendplayer.score}</span>
          </div>
          <div class="username">${namearr[backendplayer.num]}</div>
        </div>`;
      document.querySelector('#playerlabels').innerHTML += playerLabelHTML;
      console.log(namearr[backendplayer.num])
    
    } else {
      // document.querySelector(`div[data-id=${id}]`).innerHTML = `${id} :${backendplayer.score}`;
      // if (id === socket.id) {
      //   frontendplayers[id].x = backendplayer.x;
      //   frontendplayers[id].y = backendplayer.y;

      //   const lastbackendinputindex = playerinputs.findIndex((input) => backendplayer.sequencenumber === input.sequencenumber);

      //   if (lastbackendinputindex > -1) {
      //     playerinputs.splice(0, lastbackendinputindex + 1);
      //   }

      //   playerinputs.forEach((input) => {
      //     frontendplayers[id].x += input.dx;
      //     frontendplayers[id].y += input.dy;
      //   });


      // const playerLabel = document.querySelector(`.scorecard[data-id=${id}]`);
      // playerLabel.querySelector('.username').innerText = id;
      // playerLabel.querySelector('.score').innerText = backendplayer.score;

      // if (id === socket.id) {
      //   frontendplayers[id].x = backendplayer.x;
      //   frontendplayers[id].y = backendplayer.y;

      //   const lastbackendinputindex = playerinputs.findIndex((input) => backendplayer.sequencenumber === input.sequencenumber);

      //   if (lastbackendinputindex > -1) {
      //     playerinputs.splice(0, lastbackendinputindex + 1);
      //   }

      //   playerinputs.forEach((input) => {
      //     frontendplayers[id].x += input.dx;
      //     frontendplayers[id].y += input.dy;
      //   });


      const playerLabel = document.querySelector(`.scorecard[data-id="${id}"]`);
      playerLabel.querySelector('.username').innerText = namearr[backendplayer.num];
      playerLabel.querySelector('.score').innerText = backendplayer.score;

      if (id === socket.id) {
        frontendplayers[id].x = backendplayer.x;
        frontendplayers[id].y = backendplayer.y;

        const lastbackendinputindex = playerinputs.findIndex((input) => backendplayer.sequencenumber === input.sequencenumber);

        if (lastbackendinputindex > -1) {
          playerinputs.splice(0, lastbackendinputindex + 1);
        }

        playerinputs.forEach((input) => {
          frontendplayers[id].x += input.dx;
          frontendplayers[id].y += input.dy;
        });


      } else {
        frontendplayers[id].x = backendplayer.x;
        frontendplayers[id].y = backendplayer.y;

        gsap.to(frontendplayers[id], {
          x: backendplayer.x,
          y: backendplayer.y,
          duration: 0.015,
          ease: 'linear'
        });
      }
    }
  }

  for (const id in frontendplayers) {
    if (!backendplayers[id]) {
      const divtodelete = document.querySelector(`div[data-id=${id}]`);
      divtodelete.parentNode.removeChild(divtodelete);
      delete frontendplayers[id];
    }
  }
});

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  //c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  //c.fillRect(0, 0, canvas.width, canvas.height);
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in frontendplayers) {
    frontendplayers[id].draw();
  }

  for (const id in frontendcoins) {
    frontendcoins[id].draw();
  }

  for (const id in frontendpowerups) {
    frontendpowerups[id].draw();
  }

  canvas.style.backgroundImage= 1
}

animate();

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false }
};

const speed = 10;
const playerinputs = [];
let sequencenumber = 0;

setInterval(() => {
  if (keys.w.pressed) {
    sequencenumber++;
    playerinputs.push({ sequencenumber, dx: 0, dy: -speed });
    frontendplayers[socket.id].y -= speed;
    socket.emit('keydown', { keycode: 'KeyW', sequencenumber });
  }
  if (keys.a.pressed) {
    sequencenumber++;
    playerinputs.push({ sequencenumber, dx: -speed, dy: 0 });
    frontendplayers[socket.id].x -= speed;
    socket.emit('keydown', { keycode: 'KeyA', sequencenumber });
  }
  if (keys.s.pressed) {
    sequencenumber++;
    playerinputs.push({ sequencenumber, dx: 0, dy: speed });
    frontendplayers[socket.id].y += speed;
    socket.emit('keydown', { keycode: 'KeyS', sequencenumber });
  }
  if (keys.d.pressed) {
    sequencenumber++;
    playerinputs.push({ sequencenumber, dx: speed, dy: 0 });
    frontendplayers[socket.id].x += speed;
    socket.emit('keydown', { keycode: 'KeyD', sequencenumber });
  }
}, 15);

window.addEventListener('keydown', (e) => {
  if (!frontendplayers[socket.id]) return;

  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = true;
      break;
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyS':
      keys.s.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  if (!frontendplayers[socket.id]) return;

  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = false;
      break;
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyS':
      keys.s.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
  }
});

setInterval(() => {
  console.log(frontendplayers)
}, 5000);
