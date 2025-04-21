const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // Object to store users in each room

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (room) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = new Set();
        }
        rooms[room].add(socket.id);
        socket.emit('message', { room: room, text: 'Welcome to the room!' });
        socket.broadcast.to(room).emit('userJoined', room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('leaveRoom', (room) => {
        if (rooms[room]) {
            rooms[room].delete(socket.id);
            socket.leave(room);
            socket.broadcast.to(room).emit('userLeft', room);
            console.log(`User ${socket.id} left room: ${room}`);
            if (rooms[room].size === 0) {
                delete rooms[room]; // Clean up empty rooms
            }
        }
    });

    socket.on('sendMessage', (data) => {
        io.to(data.room).emit('message', { room: data.room, text: data.text });
        console.log(`Message sent to room ${data.room}: ${data.text}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Remove user from all rooms they might be in
        for (const room in rooms) {
            if (rooms[room].has(socket.id)) {
                rooms[room].delete(socket.id);
                socket.broadcast.to(room).emit('userLeft', room);
                if (rooms[room].size === 0) {
                    delete rooms[room];
                }
            }
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

// Serve the static HTML file (optional, if your front-end is in a separate location)
app.use(express.static('../')); // Assuming your index.html is one level up