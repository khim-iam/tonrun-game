// const express = require('express')
// const http = require('http')
// const { emit } = require('process')
// const cors = require('cors'); // Import cors
// const { Server } = require('socket.io')


// const app = express()
// const server = http.createServer(app)
// const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3001", "https://khim-iam.github.io"];


// // const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })
// const io = new Server(server, {
//   cors: {
//     // origin: "http://10.9.102.146:3001", // Replace with your frontend port
//     // origin: "http://192.168.56.1:3001", // Use the frontend server address
//     origin: process.env.FRONTEND_URL || "http://localhost:3001", // Use environment variable or default to localhost
//     methods: ["GET", "POST"]
//   },
//   pingInterval: 2000,
//   pingTimeout: 5000
// });
// // const port = 3000
// const port = process.env.PORT || 3000; // Use environment variable or default to 3000


// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// const instances = []
// let instanceIdCounter = 0

// const createInstance = (league) => {
//   const instance = {
//     id: instanceIdCounter++,
//     league: league, // Add league information to the instance
//     players: {},
//     coins: {},
//     coinId: 0,
//     coinRadius: 15,
//     powerUps: {},
//     powerUpId: 0,
//     powerUpRadius: 20,
//     coinSpawnInterval: null,
//     countdown: null
//   }

//   instance.coinSpawnInterval = setInterval(() => {
//     if (Object.keys(instance.players).length > 2) {
//       instance.coinId++
//       instance.coins[instance.coinId] = {
//         x: 200 + Math.random() * 1600,
//         y: 200 + Math.random() * 600,
//         colornum: Math.ceil(Math.random() * 100),
//         isdouble: false
//       }
//       //console.log(instance.coins)
//       setTimeout(() => {
//         clearInterval(instance.coinSpawnInterval)
//         // io.to(`instance-${instance.id}`).emit('endgame')
//         // setTimeout(() => {
//         //   io.to(`instance-${instance.id}`).emit('countdown', 'Stop!');
//         //   for (const playerId in instance.players) {
//         //     instance.players[playerId].vel = 0;
//         //   }
//         // }, 4000);
//       }, 300000)
//     }
//   }, 4000)

//   instances.push(instance)
//   return instance
// }

// io.on('connection', (socket) => {
//   let currentInstance
//   let playerLeague

//   socket.on('selectLeague', (league) => {
//     playerLeague = league

//     // Find an instance with the same league that isn't full
//     currentInstance = instances.find(
//       (instance) =>
//         instance.league === playerLeague &&
//         Object.keys(instance.players).length < 3
//     )

//     // If no instance is found, create a new one
//     if (!currentInstance) {
//       currentInstance = createInstance(playerLeague)
//     }

//     console.log(
//       `Player ${socket.id} joined instance ${currentInstance.id} in league ${playerLeague}`
//     )

//     currentInstance.players[socket.id] = {
//       x: 500 + 500 * Math.random(),
//       y: 400 + 500 * Math.random(),
//       color: `hsl(${Math.random() * 360},100%,50%)`,
//       sequencenumber: 0,
//       score: 0,
//       vel: 0,
//       radius: 20,
//       isdouble: false,
//       num:Object.keys(currentInstance.players).length
//     }

//     if (Object.keys(currentInstance.players).length === 3) {
//       let countdown = 5
//       currentInstance.countdown = setInterval(() => {
//         io.to(`instance-${currentInstance.id}`).emit('countdown', countdown)
//         countdown--
//         if (countdown < 0) {
//           for (const playerId in currentInstance.players) {
//             currentInstance.players[playerId].vel = 10
//           }
//           clearInterval(currentInstance.countdown)
//           io.to(`instance-${currentInstance.id}`).emit('countdown', 'Go!')
//         }
//       }, 1000)

//       setTimeout(() => {
//         io.to(`instance-${currentInstance.id}`).emit('countdown', 'Stop!');
//           for (const playerId in currentInstance.players) {
//             currentInstance.players[playerId].vel = 0;
//           }
//       }, 302000);
//     }

//     io.to(`instance-${currentInstance.id}`).emit(
//       'updatePlayers',
//       currentInstance.players
//     )

//     socket.join(`instance-${currentInstance.id}`)
//   })

//   socket.on('initcanvas', ({ width, height, devicepixelratio }) => {
//     // const playerPositions = [
//     //   { x: 0, y: -200 },
//     //   { x: -173, y: 100 },
//     //   { x: 173, y: 100 }
//     // ]
//     currentInstance.players[socket.id].canvas = { width, height }
//     // currentInstance.players[socket.id].x =
//     //   width / 2 +
//     //   playerPositions[Object.keys(currentInstance.players).length - 1].x
//     // currentInstance.players[socket.id].y =
//     //   height / 2 +
//     //   playerPositions[Object.keys(currentInstance.players).length - 1].y
//     currentInstance.players[socket.id].radius = 10
//     if (devicepixelratio > 1) {
//       currentInstance.players[socket.id].radius = 20
//     }
//   })

//   socket.on('placePowerUp', ({ type, x, y }) => {
//     currentInstance.powerUpId++
//     currentInstance.powerUps[currentInstance.powerUpId] = { type, x, y }
//   })

//   // socket.on('disconnect', (reason) => {
//   //   delete currentInstance.players[socket.id];
//   //   io.to(`instance-${currentInstance.id}`).emit('updatePlayers', currentInstance.players);
//   //   if (Object.keys(currentInstance.players).length === 0) {
//   //     clearInterval(currentInstance.coinSpawnInterval);
//   //     instances.splice(instances.indexOf(currentInstance), 1);
//   //   }
//   // });

//   socket.on('keydown', ({ keycode, sequencenumber }) => {
//     currentInstance.players[socket.id].sequencenumber = sequencenumber
//     switch (keycode) {
//       case 'KeyW':
//         currentInstance.players[socket.id].y -=
//           currentInstance.players[socket.id].vel
//         break
//       case 'KeyA':
//         currentInstance.players[socket.id].x -=
//           currentInstance.players[socket.id].vel
//         break
//       case 'KeyS':
//         currentInstance.players[socket.id].y +=
//           currentInstance.players[socket.id].vel
//         break
//       case 'KeyD':
//         currentInstance.players[socket.id].x +=
//           currentInstance.players[socket.id].vel
//         break
//     }
//   })
// })

// setInterval(() => {
//   instances.forEach((instance) => {
//     for (const playerId in instance.players) {
//       const player = instance.players[playerId]

//       for (const coinId in instance.coins) {
//         const coin = instance.coins[coinId]
//         const distance = Math.hypot(player.x - coin.x, player.y - coin.y)
//         if (distance <= player.radius + instance.coinRadius) {
//           const cond = player.isdouble
//           const inc = coin.colornum % 10
//           if (inc <= 3) {
//             if (cond) {
//               player.score += 20
//               player.isdouble = false
//             } else {
//               player.score += 10
//             }
//           } else if (inc > 3 && inc <= 6) {
//             if (cond) {
//               player.score += 40
//               player.isdouble = false
//             } else {
//               player.score += 20
//             }
//           } else if (inc > 6 && inc <= 8) {
//             if (cond) {
//               player.score += 100
//               player.isdouble = false
//             } else {
//               player.score += 50
//             }
//           } else {
//             player.isdouble = true
//           }

//           delete instance.coins[coinId]
//           break
//         }
//       }

//       for (const powerUpId in instance.powerUps) {
//         const powerUp = instance.powerUps[powerUpId]
//         const distance = Math.hypot(player.x - powerUp.x, player.y - powerUp.y)
//         if (distance <= player.radius + instance.powerUpRadius) {
//           if (powerUp.type === 'speed') {
//             player.vel = 25
//             setTimeout(() => {
//               player.vel = 10
//             }, 10000)
//           } else if (powerUp.type === 'slow') {
//             player.vel = 3
//             setTimeout(() => {
//               player.vel = 10
//             }, 10000)
//           } else if (powerUp.type === 'freeze') {
//             player.vel = 0
//             setTimeout(() => {
//               player.vel = 10
//             }, 10000)
//           }
//           delete instance.powerUps[powerUpId]
//           break
//         }
//       }
//     }

//     io.to(`instance-${instance.id}`).emit('updatePlayers', instance.players)
//     io.to(`instance-${instance.id}`).emit('updateCoins', instance.coins)
//     io.to(`instance-${instance.id}`).emit('updatePowerUps', instance.powerUps)
//   })
// }, 15)

// server.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3001", "https://khim-iam.github.io","http://10.9.102.146:3001","http://127.0.0.1:3001","http://192.168.156.111:3001"];

// Configure CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Configure Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  },
  pingInterval: 2000,
  pingTimeout: 5000
});

const port = process.env.PORT || 3000;

const instances = [];
let instanceIdCounter = 0;

const createInstance = (league) => {
  const instance = {
    id: instanceIdCounter++,
    league: league,
    players: {},
    coins: {},
    coinId: 0,
    coinRadius: 15,
    powerUps: {},
    powerUpId: 0,
    powerUpRadius: 20,
    coinSpawnInterval: null,
    countdown: null
  };

  instance.coinSpawnInterval = setInterval(() => {
    if (Object.keys(instance.players).length > 2) {
      instance.coinId++;
      instance.coins[instance.coinId] = {
        x: 200 + Math.random() * 1600,
        y: 200 + Math.random() * 600,
        colornum: Math.ceil(Math.random() * 100),
        isdouble: false
      };

      setTimeout(() => {
        clearInterval(instance.coinSpawnInterval);
      }, 300000);
    }
  }, 4000);

  instances.push(instance);
  return instance;
};

io.on('connection', (socket) => {
  let currentInstance;
  let playerLeague;

  let playername;

  socket.on('selectLeague', (backendInput) => {
  // socket.on('selectLeague', (league) => {
    // playerLeague = league;

    playerLeague = backendInput.selectedValue;
    playername = backendInput.username;
    // console.log("backend league",obj.league, obj.username)

    currentInstance = instances.find(
      (instance) =>
        instance.league === playerLeague &&
      // instance.backendInput === playerLeague &&
        Object.keys(instance.players).length < 3
    );

    if (!currentInstance) {
      currentInstance = createInstance(playerLeague);
    }

    console.log(
      `Player ${socket.id} joined instance ${currentInstance.id} in league ${playerLeague}`
    );

    currentInstance.players[socket.id] = {
      x: 500 + 500 * Math.random(),
      y: 400 + 500 * Math.random(),
      color: `hsl(${Math.random() * 360},100%,50%)`,
      sequencenumber: 0,
      score: 0,
      vel: 0,
      radius: 20,
      isdouble: false,
      num: Object.keys(currentInstance.players).length
    };

    if (Object.keys(currentInstance.players).length === 3) {
      let countdown = 5;
      currentInstance.countdown = setInterval(() => {
        io.to(`instance-${currentInstance.id}`).emit('countdown', countdown);
        countdown--;
        if (countdown < 0) {
          for (const playerId in currentInstance.players) {
            currentInstance.players[playerId].vel = 10;
          }
          clearInterval(currentInstance.countdown);
          io.to(`instance-${currentInstance.id}`).emit('countdown', 'Go!');
        }
      }, 1000);

      setTimeout(() => {
        io.to(`instance-${currentInstance.id}`).emit('countdown', 'Stop!');
        for (const playerId in currentInstance.players) {
          currentInstance.players[playerId].vel = 0;
        }
      }, 302000);
    }

    io.to(`instance-${currentInstance.id}`).emit(
      'updatePlayers',
      currentInstance.players
    );

    socket.join(`instance-${currentInstance.id}`);
  });

  socket.on('initcanvas', ({ width, height, devicepixelratio }) => {
    currentInstance.players[socket.id].canvas = { width, height };
    currentInstance.players[socket.id].radius = 10;
    if (devicepixelratio > 1) {
      currentInstance.players[socket.id].radius = 20;
    }
  });

  socket.on('placePowerUp', ({ type, x, y }) => {
    currentInstance.powerUpId++;
    currentInstance.powerUps[currentInstance.powerUpId] = { type, x, y };
  });

  socket.on('keydown', ({ keycode, sequencenumber }) => {
    currentInstance.players[socket.id].sequencenumber = sequencenumber;
    switch (keycode) {
      case 'KeyW':
        currentInstance.players[socket.id].y -=
          currentInstance.players[socket.id].vel;
        break;
      case 'KeyA':
        currentInstance.players[socket.id].x -=
          currentInstance.players[socket.id].vel;
        break;
      case 'KeyS':
        currentInstance.players[socket.id].y +=
          currentInstance.players[socket.id].vel;
        break;
      case 'KeyD':
        currentInstance.players[socket.id].x +=
          currentInstance.players[socket.id].vel;
        break;
    }
  });
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
