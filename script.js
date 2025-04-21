const socket = io(); // Connect to the WebSocket server

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const roomInput = document.getElementById('roomInput');
const joinButton = document.getElementById('joinButton');
const currentRoomDisplay = document.getElementById('currentRoom');

let currentRoom = null;

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && currentRoom) {
        socket.emit('sendMessage', { room: currentRoom, text: message });
        messageInput.value = '';
    } else if (!currentRoom) {
        alert('Please join a room first!');
    }
});

joinButton.addEventListener('click', () => {
    const room = roomInput.value.trim();
    if (room) {
        if (currentRoom) {
            socket.emit('leaveRoom', currentRoom);
        }
        socket.emit('joinRoom', room);
        currentRoom = room;
        currentRoomDisplay.textContent = `Joined room: ${room}`;
        messagesDiv.innerHTML = ''; // Clear previous messages
        roomInput.value = '';
    }
});

socket.on('message', (data) => {
    if (data.room === currentRoom) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = data.text;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
    }
});

socket.on('userJoined', (room) => {
    if (room === currentRoom) {
        const joinNotification = document.createElement('div');
        joinNotification.classList.add('message');
        joinNotification.style.fontStyle = 'italic';
        joinNotification.style.color = '#777';
        joinNotification.textContent = `A user joined ${room}`;
        messagesDiv.appendChild(joinNotification);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
});

socket.on('userLeft', (room) => {
    if (room === currentRoom) {
        const leaveNotification = document.createElement('div');
        leaveNotification.classList.add('message');
        leaveNotification.style.fontStyle = 'italic';
        leaveNotification.style.color = '#777';
        leaveNotification.textContent = `A user left ${room}`;
        messagesDiv.appendChild(leaveNotification);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
});