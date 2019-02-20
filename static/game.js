var socket = io();
socket.on('message', (data) => {
  console.log(data);
});