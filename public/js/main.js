const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const leaveButton = document.getElementById('leave-btn'); // Added leave button reference

const socket = new WebSocket('ws://localhost:5000'); // Changed to WebSocket

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Join chatroom
socket.addEventListener('open', () => {
  socket.send(JSON.stringify({
    type: 'joinRoom',
    payload: {
      username,
      room,
    },
  }));
});

// Get room and users
socket.addEventListener('message', (event) => {
 
  const message = JSON.parse(event.data);
  if (message.type === 'roomUsers') {
    outputRoomName(message.payload.room);
    console.log("messages is ",message);
    outputUsers(message.payload.users);
    outputMessages(message.payload.messages)
  } else if (message.type === 'message') {
    console.log("message is message ",message);
    if (message.text && message.text.msg && !message.text.msg.includes(username)) {
      outputMessage(message);
    }
    
  }
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msgInput = e.target.elements.msg;
  const msg = msgInput.value.trim();

  if (msg) {
   console.log(msg,room);
    socket.send(JSON.stringify({
      type: 'chatMessage',
      payload: {msg,room},
    }));
    msgInput.value = '';
    msgInput.focus();
  }
});

// Output message to DOM
function outputMessage(message) {
  console.log(message);
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);

  const para = document.createElement('p');
  para.classList.add('text');

  // Check if message.text.msg exists, otherwise use message.text directly
  const messageText = message.text && message.text.msg ? message.text.msg : message.text;
  para.innerText = messageText;

  div.appendChild(para);
  chatMessages.appendChild(div); // Changed from document.querySelector('.chat-messages') to chatMessages
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

function outputMessages(messages) {
  messages.forEach((message) => {
    outputMessage(message)
  })
}



// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
leaveButton.addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '/';
  }
});
