const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')
const {verify} = require("jsonwebtoken");

class Socket {
    userList = []

    constructor(server) {
        this.io = socketIo(server)
        this.connect()
    }

    getUserNameByToken(socket) {
        const token = socket.handshake.query.token;

        if (!token) {
            socket.disconnect();
            throw new Error("Token is missing");
        }

        try {
            const isTokenVerify = jwt.verify(token, "*this-is-secret-key*");
            console.log("Token is:", isTokenVerify);

            return {isTokenVerify, token};
        } catch (e) {
            socket.disconnect();
            throw new Error("Invalid token");
        }
    }

    connect() {
        this.io.on('connection', socket => {
            const socketId = socket.id
            const tokenData = this.getUserNameByToken(socket)
            const userId = tokenData.isTokenVerify.user_name;
            this.userList.push({
                socketId, userId
            })
            console.log(this.userList)
            //   single chat
            socket.on('send-message', data => {
                if (!!data.roomId) {
                    console.log(data.roomId)

                    this.io.to(`Room_ID:${data.roomId}`).emit('on-message', {
                        message: data.message,
                        from: tokenData.isTokenVerify.user_name,
                        roomId: data.roomId
                    })
                } else {
                    const targetUser = this.userList.filter(e => e.userId === data.to)[0]
                    console.log(targetUser)
                    socket.broadcast.to(targetUser.socketId).emit('on-message', {
                        message: data.message,
                        from: tokenData.isTokenVerify.user_name
                    })
                }
            })

            //   join room
            socket.on('join-room', data => {
                socket.join(`Room_ID:${data.roomId}`)
                console.log(`${socketId} joined`)

                socket.broadcast.to(`Room_ID:${data.roomId}`).emit('on-message', {
                    message: `${tokenData.isTokenVerify.user_name} join ${data.roomId}`
                })
            })

            socket.on('leave-room', data => {
                socket.leave(`Room_ID:${data.roomId}`)
                console.log(`${socketId} left`)

                socket.broadcast.to(`Room_ID:${data.roomId}`).emit('on-message', {
                    message: `${tokenData.isTokenVerify.user_name} left the ${data.roomId}`
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
