const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    // index = -1 for no match
    // const index = users.findIndex((user) => {
    //     return user.id === id
    // })
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        // Start at index and remove one item, splice returns removed elements
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })

    if (!user) {
        return {
            error: 'No user found!'
        }
    }

    return user
}

const getUsersInRoom = (room) => {
    const roomName = room.trim().toLowerCase()

    const usersInRoom = users.filter((user) => {
        return user.room === roomName
    })

    if (usersInRoom.length < 1) {
        return {
            error: 'No users in this room!'
        }
    }

    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser, 
    getUsersInRoom
}