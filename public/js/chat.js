const socket = io();
const $messageForm = document.querySelector('#msg-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $sendLocationButton = document.querySelector('#send-location');

socket.on('message', msg => {
  console.log(msg);
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
