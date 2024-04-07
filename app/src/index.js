const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessages } = require('./utils/create-messages');
const { getUserList, addUser, removeUser, findUser } = require('./utils/user');

const app = express();

const port = process.env.PORT || 3000;
const publicPathDirectory = path.join(__dirname, '../public');

const server = http.createServer(app);
const io = socketio(server); //Khởi tạo socketio


// let count = 1;
// let message = `Chào mọi người`;
// Lắng nghe sự kiện kết nối từ client
io.on('connection', (socket) => {
    console.log(`new client connect`);
    // Truyền từ server về client
    // socket.emit(`send count to client`, count);
    // socket.emit(`send message to client`, message);
    socket.on('join room form client to server', ({ room, username }) => {
        // Joim vào phòng
        socket.join(room);
        socket.emit('send message to all client', createMessages(`Bạn đã tham gia phòng: ${room}`, `Note`));
        socket.broadcast.to(room).emit('send message to all client', createMessages(`Người dùng ${username} vừa vào phòng.`, `Note`));
        socket.on('send message to server', (messageText, callback) => {
            const filter = new Filter();
            if (filter.isProfane(messageText)) {
                return callback("messageText illegal");
            }
            const id = socket.id;
            const user = findUser(id);
            const message = createMessages(messageText, user.username, user.id);
            io.to(room).emit('send message to all client', message);
            callback();
        })
        socket.on('share location from client to server', ({ latitude, longitude }) => {
            const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const id = socket.id;
            const user = findUser(id);
            io.to(room).emit('send location from server to client', createMessages(linkLocation, user.username, user.id));
        })
        const newUser = {
            id: socket.id,
            username,
            room,
        };
        addUser(newUser);
        io.to(room).emit('send user list to client', getUserList(room));
        socket.on(`disconnect`, () => {
            removeUser(socket.id);
            io.to(room).emit('send user list to client', getUserList(room));
            console.log(`client disconnected`);
        })
    });
    // // Nhận lại sự kiện từ client

    // socket.on(`send increment client to server`, function(){
    //     count++;
    //     io.emit(`send count to client`, count);
    // })
    // ngắt kết nối
})

app.use(express.static(publicPathDirectory));
server.listen(port, () => {
    console.log(`app listening on http://localhost:${port}`);
});