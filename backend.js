const express = require('express');
// const cors = require('cors');

const app = express();

const http = require('http'); //socket.io
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

// app.use(cors());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const instances = [];
let instanceIdCounter = 0;

const createInstance = () => {
  const instance = {
    id: instanceIdCounter++,
    players: {},
    coins: {},
    coinId: 0,
    coinRadius: 15,
    powerUps: {},
    powerUpId: 0,
    powerUpRadius: 20,
    coinSpawnInterval: null,
    //
    countdown: null
  };

  instance.coinSpawnInterval = setInterval(() => {
    if (Object.keys(instance.players).length > 2) {
      instance.coinId++;
      instance.coins[instance.coinId] = {
        x: 100 + Math.random() * 1600,
        y: 100 + Math.random() * 700,
        colornum: Math.ceil(Math.random() * 100),
        isdouble: false
      }
      setTimeout(() => {
          clearInterval(instance.coinSpawnInterval)
      }, 60000);
    }
    // } else {
    //   instance.coinId = 0;
    //   instance.coins = {};
    // }
  }, 2000);

  

  instances.push(instance);
  return instance;
};

io.on('connection', (socket) => {
  let currentInstance;

  if (instances.length === 0 || Object.keys(instances[instances.length - 1].players).length === 3) {
    currentInstance = createInstance();
  } else {
    currentInstance = instances[instances.length - 1];
  }

  console.log(`Player ${socket.id} joined instance ${currentInstance.id}`);
  console.log(currentInstance.coins)
 

  currentInstance.players[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    color: `hsl(${Math.random() * 360},100%,50%)`,
    sequencenumber: 0,
    score: 0,
    vel: 10,
    radius: 10,
    isdouble: false
  };

  console.log(currentInstance.players)


  // Check if the player count is 3 to start the countdown
  if (Object.keys(currentInstance.players).length === 3) {
    let countdown = 5;
    currentInstance.countdown = setInterval(() => {
      io.to(`instance-${currentInstance.id}`).emit('countdown', countdown);
      countdown--;
      if (countdown < 0) {
        clearInterval(currentInstance.countdown);
        io.to(`instance-${currentInstance.id}`).emit('countdown', 'Go!');
      }
    }, 1000);
  }


  io.to(`instance-${currentInstance.id}`).emit('updatePlayers', currentInstance.players);

  // Adjusting players radius according to device pixel ratio
  socket.on('initcanvas', ({ width, height, devicepixelratio }) => {
    currentInstance.players[socket.id].canvas = {
      width,
      height
    };
    currentInstance.players[socket.id].radius = 10;
    if (devicepixelratio > 1) {
      currentInstance.players[socket.id].radius = 20;
    }
  });

  socket.on('placePowerUp', ({ type, x, y }) => {
    currentInstance.powerUpId++;
    currentInstance.powerUps[currentInstance.powerUpId] = { type, x, y };
  });

  socket.on('disconnect', (reason) => {
    delete currentInstance.players[socket.id];
    io.to(`instance-${currentInstance.id}`).emit('updatePlayers', currentInstance.players);
    if (Object.keys(currentInstance.players).length === 0) {
      clearInterval(currentInstance.coinSpawnInterval);
      instances.splice(instances.indexOf(currentInstance), 1);
    }
  });

  socket.on('keydown', ({ keycode, sequencenumber }) => {
    currentInstance.players[socket.id].sequencenumber = sequencenumber;
    switch (keycode) {
      case 'KeyW':
        currentInstance.players[socket.id].y -= currentInstance.players[socket.id].vel;
        break;
      case 'KeyA':
        currentInstance.players[socket.id].x -= currentInstance.players[socket.id].vel;
        break;
      case 'KeyS':
        currentInstance.players[socket.id].y += currentInstance.players[socket.id].vel;
        break;
      case 'KeyD':
        currentInstance.players[socket.id].x += currentInstance.players[socket.id].vel;
        break;
    }
  });

  socket.join(`instance-${currentInstance.id}`);
});

setInterval(() => {
  instances.forEach((instance) => {
    for (const playerId in instance.players) {
      const player = instance.players[playerId];

      for (const coinId in instance.coins) {
        const coin = instance.coins[coinId];
        const distance = Math.hypot(player.x - coin.x, player.y - coin.y);
        if (distance <= player.radius + instance.coinRadius) {
          const cond = player.isdouble;
          const inc = coin.colornum % 10;
          if (inc <= 3) {
            if (cond) {
              player.score += 20;
              player.isdouble = false;
            } else {
              player.score += 10;
            }
          } else if (inc > 3 && inc <= 6) {
            if (cond) {
              player.score += 40;
              player.isdouble = false;
            } else {
              player.score += 20;
            }
          } else if (inc > 6 && inc <= 8) {
            if (cond) {
              player.score += 100;
              player.isdouble = false;
            } else {
              player.score += 50;
            }
          } else {
            player.isdouble = true;
          }

          delete instance.coins[coinId];
          break;
        }
      }

      for (const powerUpId in instance.powerUps) {
        const powerUp = instance.powerUps[powerUpId];
        const distance = Math.hypot(player.x - powerUp.x, player.y - powerUp.y);
        if (distance <= player.radius + instance.powerUpRadius) {
          if (powerUp.type === 'speed') {
            player.vel = 25;
            setTimeout(() => {
              player.vel = 10;
            }, 10000);
          } else if (powerUp.type === 'slow') {
            player.vel = 3;
            setTimeout(() => {
              player.vel = 10;
            }, 10000);
          } else if (powerUp.type === 'freeze') {
            player.vel = 0;
            setTimeout(() => {
              player.vel = 10;
            }, 10000);
          }
          delete instance.powerUps[powerUpId];
          break;
        }
      }
    }

    io.to(`instance-${instance.id}`).emit('updatePlayers', instance.players);
    io.to(`instance-${instance.id}`).emit('updateCoins', instance.coins);
    io.to(`instance-${instance.id}`).emit('updatePowerUps', instance.powerUps);
  });
}, 15);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});