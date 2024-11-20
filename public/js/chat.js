// Function to connect client to a server
const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options, to get username and room name from a url 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled from the top?
    const scrollOffset = $messages.scrollTop + visibleHeight

    // If we are not at the bottom
    if (Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username, 
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()

    //disable the button
    $messageFormButton.setAttribute('disabled', 'disabled')

    // Better if there are more forms in html so it doesnt confuse
    // target=form, elements=elements inside the form, message=name of element we want, value=it's value
    const message = event.target.elements.message.value

    // Callback function will run when the event is acknowledged
    socket.emit('sendMessage', message, (error) => {
        // enable the button
        $messageFormButton.removeAttribute('disabled')
        // clear the input box
        $messageFormInput.value = ''
        // set the cursor inside the input box
        $messageFormInput.focus()
        
        if (error) {
            return alert(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    // If the browser doesnt support geolocation
   if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
   }

   $sendLocationButton.setAttribute('disabled', 'disabled')

   navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    }, () => {
        $sendLocationButton.removeAttribute('disabled')

        console.log('Location shared!')
    })
   })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})