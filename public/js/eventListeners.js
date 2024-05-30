// window.addEventListener('click', (event) => {
//     const playerposition={
//         x:frontendplayers[socket.id].x,
//         y:frontendplayers[socket.id].y
//     }
//   const angle = Math.atan2(
//     (event.clientY*window.devicePixelRatio) - playerposition.y,
//     (event.clientX*window.devicePixelRatio) - playerposition.x
//   )

// //   const velocity = {
// //     x: Math.cos(angle) * 5,
// //     y: Math.sin(angle) * 5
// //   }

//   socket.emit('shoot',{
//     x:playerposition.x,
//     y:playerposition.y,
//     angle
//   })
// //   frontendprojectiles.push(
// //     new Projectile({x:playerposition.x, y:playerposition.y,radius: 5, color:'white', velocity})
// //   )
//   //console.log(frontendprojectiles)
// })
