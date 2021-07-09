const socket = io();

const $messageForm = document.querySelector("#form-sendMessage");
const $messageFormInput = document.querySelector('#form-input');
const $messageFormButton = document.querySelector('#form-submit');

const $sendLocationButton = document.querySelector('#sendLocationButton');

const $messages = document.querySelector("#messages");
const $locations = document.querySelector("#locations");
const messagesTemplate = document.querySelector("#messagesTemplate").innerHTML;
const locationTemplate = document.querySelector("#locationTemplate").innerHTML;
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollHeight = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollHeight) {
        $messages.scrollTop = $messages.scrollHeight;
    }
    //console.log(newMessageHeight);
}

socket.on('message', (msg) => {
    //console.log(msg);
    const html = Mustache.render(messagesTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on('messageLocation', (msg) => {
    //console.log(msg);
    const html = Mustache.render(locationTemplate, {
        username: msg.username,
        locationLink: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute("disabled", "disabled");
    //console.log('clicked');
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log("Message Delivered!!!");
    });
    //message.setAttribute('value', '');
});

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute("disabled", "disabled");
    if (!navigator.geolocation) {
        return alert('Geolocation is not available');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (message) => {
            $sendLocationButton.removeAttribute("disabled");
            console.log(message);
        });
    });
});


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = ('/');
    }
});