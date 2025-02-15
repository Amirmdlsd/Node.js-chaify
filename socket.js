const socketIo = require('socket.io')
class Socket {
  userList = []
  constructor (server) {
    this.io = socketIo(server)
    this.connect()
  }

  connect () {
    this.io.on('connection', socket => {
      const socketId = socket.id
      const userId = socket.handshake.query.userId
      this.userList.push({
        socketId,
        userId
      })
      console.log('user list is ', this.userList)
      //   single chat
      socket.on('send-message', data => {
        if (!!data.roomId) {
          console.log(data.roomId)

          this.io.to(`Room_ID:${data.roomId}`).emit('on-message', {
            message: data.message,
            from: userId,
            roomId: data.roomId
          })
        } else {
          const targetUser = this.userList.filter(e => e.userId === data.to)[0]
          socket.broadcast.to(targetUser.socketId).emit('on-message', {
            message: data.message,
            from: userId
          })
        }
      })

      //   join room
      socket.on('join-room', data => {
        socket.join(`Room_ID:${data.roomId}`)
        console.log(`${socketId} joined`)

        socket.broadcast.to(`Room_ID:${data.roomId}`).emit('on-message', {
          message: `${userId} join ${data.roomId}`
        })
      })

      socket.on('leave-room', data => {
        socket.leave(`Room_ID:${data.roomId}`)
        console.log(`${socketId} left`)

        socket.broadcast.to(`Room_ID:${data.roomId}`).emit('on-message', {
          message: `${userId} left the ${data.roomId}`
        })
      })
      console.log(`client ${socket.id} connected`)

      socket.on('disconnect', () => {
        this.userList.splice(e => e.sicketId === socketId, 1)
        console.log(`client ${socket.id} dis-connected`, this.userList)
      })
    })
  }
}
module.exports = server => {
  const ServerIo = new Socket(server)
  return ServerIo
}
