const socket = io()

// div for rooms
const $rooms = document.querySelector('#rooms')
const $roomsTemplate = document.querySelector('#rooms-template').innerHTML
const $noRoomsTemplate = document.querySelector('#no-rooms-template').innerHTML
const $roomButton = document.querySelector('#room')

socket.on('availableRooms', (rooms) => {
    if (rooms.length === 0) {
        rooms.push({
            text: 'There are currently no live rooms. Create one!'
        })

        const html = Mustache.render($noRoomsTemplate, {
            rooms
        })

        return $rooms.innerHTML = html
    }

    const html = Mustache.render($roomsTemplate, {
        rooms
    })

    return $rooms.innerHTML = html
})