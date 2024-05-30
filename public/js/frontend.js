const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const devicepixelratio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicepixelratio
canvas.height = innerHeight * devicepixelratio

const x = canvas.width / 2
const y = canvas.height / 2

const frontendplayers = {}
const frontendcoins={}
const frontendpowerups = {}
let selectedPowerUp = null
const powerupused={
  speed:false,
  slow:false,
  freeze:false
}

document.querySelectorAll('.power-up').forEach(button => {
  button.addEventListener('click', () => {
    selectedPowerUp = button.getAttribute('data-type')
    if(!powerupused[selectedPowerUp]){      
      powerupused[selectedPowerUp]=true      
    }
    else{
      selectedPowerUp=null
    }
    console.log(selectedPowerUp)
    console.log(powerupused)
  })
})

canvas.addEventListener('click', (event) => {
  if (selectedPowerUp) {
    //const rect = canvas.getBoundingClientRect()
    const x = event.clientX * devicepixelratio
    const y = event.clientY * devicepixelratio

    socket.emit('placePowerUp', { type: selectedPowerUp, x, y })
    selectedPowerUp = null
  }
})

socket.on('updatePowerUps', (backendpowerups) => {
  for (const id in backendpowerups) {
    const powerup = backendpowerups[id]
    if (!frontendpowerups[id]) {
      frontendpowerups[id] = new Powerup({
        x: powerup.x,
        y: powerup.y,
        radius: 20,
        type: powerup.type,
      })
    }
  }
  for (const id in frontendpowerups) {
    if (!backendpowerups[id]) {
      delete frontendpowerups[id]
    }
  }
})


socket.on('connect', () => {
  socket.emit('initcanvas', {
    widht: canvas.width,
    height: canvas.height,
    devicepixelratio
  })
})

const colorarr=['gray','gray','gray','gray','yellow','yellow','yellow','green','green','cyan']

socket.on('updatecoins',(backendcoins)=>{
  for(const id in backendcoins){
    const coin = backendcoins[id]
    if(!frontendcoins[id]){
      frontendcoins[id]=new Coin({
        x:coin.x,
        y:coin.y,
        radius:15,
        color:colorarr[(coin.colornum)%10],
      })
    }
  }
  for (const id in frontendcoins) {
    if (!backendcoins[id]) {
      delete frontendcoins[id]
    }
  }
})

socket.on('updatePlayers', (backendplayers) => {
  for (const id in backendplayers) {
    const backendplayer = backendplayers[id]
    if (!frontendplayers[id]) {
      frontendplayers[id] = new Player({
        x: backendplayer.x,
        y: backendplayer.y,
        radius: 10,
        color: backendplayer.color
      })
      document.querySelector(
        '#playerlabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backendplayer.score}">${id} :${backendplayer.score} </div>`
    } else {
      document.querySelector(
        `div[data-id=${id}]`
      ).innerHTML = `${id} :${backendplayer.score}`
      //  document.querySelector(`div[data-id=${id}]`).setAttribute('data-score',backendplayer.score)

      //  const parentdiv=document.querySelector('#playerlabels')
      // const childdivs=Array.from(parentdiv.querySelectorAll('div'))
      // childdivs.sort((a,b)=>{
      //   const scorea=Number(a.getAttribute('data-score'))
      //   const scoreb=Number(b.getAttribute('data-score'))
      //   return scoreb-scoreas
      // })
      // childdivs.forEach(div=>{
      //   parentdiv.removeChild(div)
      // })
      // childdivs.forEach((div)=>{
      //   parentdiv.appendChild(div)
      // })

      if (id === socket.id) {
        frontendplayers[id].x = backendplayer.x
        frontendplayers[id].y = backendplayer.y

        const lastbackendinputindex = playerinputs.findIndex((input) => {
          return backendplayer.sequencenumber === input.sequencenumber
        })

        if (lastbackendinputindex > -1) {
          playerinputs.splice(0, lastbackendinputindex + 1)
        }

        playerinputs.forEach((input) => {
          frontendplayers[id].x += input.dx
          frontendplayers[id].y += input.dy
        })
      } else {
        frontendplayers[id].x = backendplayer.x
        frontendplayers[id].y = backendplayer.y

        gsap.to(frontendplayers[id], {
          x: backendplayer.x,
          y: backendplayer.y,
          duaration: 0.015,
          ease: 'linear'
        })
      }
    }
  }

  for (const id in frontendplayers) {
    if (!backendplayers[id]) {
      const divtodelete = document.querySelector(`div[data-id=${id}]`)
      divtodelete.parentNode.removeChild(divtodelete)
      delete frontendplayers[id]
    }
  }
})

let animationId

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontendplayers) {
    const player = frontendplayers[id]
    player.draw()
  }

  for (const id in frontendcoins) {
    const coin = frontendcoins[id]
    coin.draw()
  }

  for (const id in frontendpowerups) {
    const powerup = frontendpowerups[id]
    powerup.draw()
  }

}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const speed = 10
const playerinputs = []
let sequencenumber = 0

setInterval(() => {
  if (keys.w.pressed) {
    sequencenumber++
    playerinputs.push({ sequencenumber, dx: 0, dy: -speed })
    frontendplayers[socket.id].y -= 10
    socket.emit('keydown', { keycode: 'KeyW', sequencenumber })
  }
  if (keys.a.pressed) {
    sequencenumber++
    playerinputs.push({ sequencenumber, dx: -speed, dy: 0 })
    frontendplayers[socket.id].x -= 10
    socket.emit('keydown', { keycode: 'KeyA', sequencenumber })
  }
  if (keys.s.pressed) {
    sequencenumber++
    playerinputs.push({ sequencenumber, dx: 0, dy: speed })
    frontendplayers[socket.id].y += 10
    socket.emit('keydown', { keycode: 'KeyS', sequencenumber })
  }
  if (keys.d.pressed) {
    sequencenumber++
    playerinputs.push({ sequencenumber, dx: speed, dy: 0 })
    frontendplayers[socket.id].x += 10
    socket.emit('keydown', { keycode: 'KeyD', sequencenumber })
  }
}, 15)

window.addEventListener('keydown', (e) => {
  if (!frontendplayers[socket.id]) return

  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (e) => {
  if (!frontendplayers[socket.id]) return

  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = false
      break
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
  }
})
