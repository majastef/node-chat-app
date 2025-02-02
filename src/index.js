const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { addRoom, generateRooms } = require('./utils/rooms')

const app = express()
const server = http.createServer(app)
// New socket.io instance
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// New client connected, socket is an object
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    io.emit('availableRooms', generateRooms())

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))

        // To everybody except the new user that is joining
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        io.emit('availableRooms', addRoom(room))

        callback()
    })

    // callback to send acknowledgment that the message was delivered
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        console.log(filter.isProfane(message))

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        // To send to everyone
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback('Location delivered!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})