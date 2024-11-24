const rooms = []

const addRoom = (room) => {
    const findRoom = rooms.find((liveRoom) => {
        return liveRoom.name === room
    })

    if (findRoom) {
        return rooms
    }

    rooms.push({ name: room, number: 1})
    return rooms
}

const generateRooms = () => {
    return rooms
}

module.exports = {
    addRoom,
    generateRooms
}