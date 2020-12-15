const socket = io();

// Elements
const $messageForm = document.querySelector('#msg-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Get height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Get visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', data => {
  const html = Mustache.render(messageTemplate, {
    username: data.username || 'Admin',
    message: data.message,
    createdAt: moment(data.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', data => {
  const html = Mustache.render(locationTemplate, {
    username: data.username,
    url: data.url,
    createdAt: moment(data.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  $sidebar.innerHTML = '';
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');
  // disable

  const { value } = e.target.elements.message;

  socket.emit('sendMessage', value, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    // enable
    if (error) {
      return console.log(error);
    }
    console.log('Message delivered!');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser!');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      $sendLocationButton.removeAttribute('disabled');
      console.log('Location Shared!');
    });
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
