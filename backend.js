const express = require('express')
const app = express()

const http = require('http') //socket.io
const server = http.createServer(app)

const { Server } = require('socket.io')
const { setInterval } = require('timers')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backendplayers = {}

let backendcoins={}
let coinid=0
const coinradius=15

const backendpowerups={}
let powerupid = 0
const powerupradius = 20

const spawnintervalid=setInterval(() => {
  if(Object.keys(backendplayers).length>0){
      coinid++
      backendcoins[coinid]={
        x:100 + Math.random()*(1600),
        y:100 + Math.random()*(700),
        colornum: Math.ceil(Math.random()*100),
        isdouble:false
      }
      //console.log(backendcoins)
  }
  else{
    coinid=0
    backendcoins={}
  }
  //console.log(backendpowerups)
}, 2000);


setInterval(() => {
  clearInterval(spawnintervalid)
}, 60000);




io.on('connection', (socket) => {

  console.log('a user connected')


  backendplayers[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    color: `hsl(${Math.random() * 360},100%,50%)`,
    sequencenumber: 0,
    score: 0,
    vel:10
  }
  io.emit('updatePlayers', backendplayers)


  // adjusting players radius acc to device pixel ratio
  socket.on('initcanvas', ({ width, height, devicepixelratio }) => {
    backendplayers[socket.id].canvas = {
      width,
      height
    }
    backendplayers[socket.id].radius = 10
    if (devicepixelratio > 1) {
      backendplayers[socket.id].radius = 2 * 10
    }
  })


  socket.on('placePowerUp', ({ type, x, y }) => {
    powerupid++
    backendpowerups[powerupid] = { type, x, y }
  })

  socket.on('disconnect', (reason) => {
    delete backendplayers[socket.id]
    io.emit('updateplayers', backendplayers)
  })


  socket.on('keydown', ({ keycode, sequencenumber }) => {
    backendplayers[socket.id].sequencenumber = sequencenumber
    switch (keycode) {
      case 'KeyW':
        backendplayers[socket.id].y -= backendplayers[socket.id].vel
        break
      case 'KeyA':
        backendplayers[socket.id].x -= backendplayers[socket.id].vel
        break
      case 'KeyS':
        backendplayers[socket.id].y += backendplayers[socket.id].vel
        break
      case 'KeyD':
        backendplayers[socket.id].x += backendplayers[socket.id].vel
        break
    }
  })

  console.log(backendplayers)
})

setInterval(() => {
  
  for(const playerid in backendplayers){
    for (const coinid in backendcoins) {
      const backendplayer = backendplayers[playerid]
      const coin = backendcoins[coinid]
      const distance = Math.hypot(
        backendplayer.x - coin.x,
        backendplayer.y - coin.y
      )
      if (
        distance <= backendplayer.radius + coinradius 
        
      ) {
        const cond=backendplayers[playerid].isdouble
        const inc = coin.colornum%10
        if(inc<=3){
          if(cond){
            backendplayers[playerid].score +=20
            backendplayers[playerid].isdouble=false
          }
          else{
            backendplayers[playerid].score +=10
          }          
        }
        else if(inc>3 && inc<=6){
          if(cond){
            backendplayers[playerid].score +=40
            backendplayers[playerid].isdouble=false
          }
          else{
            backendplayers[playerid].score +=20
          }  
        }
        else if(inc>6 && inc<=8) {
          if(cond){
            backendplayers[playerid].score +=100
            backendplayers[playerid].isdouble=false
          }
          else{
            backendplayers[playerid].score +=50
          }  
        }
        else{
          backendplayers[playerid].isdouble=true
        }

        delete backendcoins[coinid]

        
        break
      }
    }


    for (const powerupid in backendpowerups) {
      const backendplayer = backendplayers[playerid]
      const powerup = backendpowerups[powerupid]
      const distance = Math.hypot(backendplayer.x - powerup.x, backendplayer.y - powerup.y)
      if (distance <= backendplayer.radius + powerupradius) {
        if (powerup.type === 'speed') {
          backendplayers[playerid].vel = 25
          setInterval(() => {
            backendplayers[playerid].vel = 10
          }, 10000);
        } else if (powerup.type === 'slow') {
          backendplayers[playerid].vel = 3
          setInterval(() => {
            backendplayers[playerid].vel = 10
          }, 10000);
        } else if (powerup.type === 'freeze') {
          backendplayers[playerid].vel = 0
          setInterval(() => {
            backendplayers[playerid].vel = 10
          }, 10000);
        }
        delete backendpowerups[powerupid]
        break
      }
    }

  }

  io.emit('updatePlayers', backendplayers)
  io.emit('updatecoins',backendcoins)
  io.emit('updatePowerUps',backendpowerups)
}, 15)


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
