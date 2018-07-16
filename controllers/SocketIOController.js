var app = require('express')();
var http = require('http').Server(app);
const ChatsHistory = require('../models').ChatsHistory;
app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
const
    io = require("socket.io"),
    server = io.listen(8000);

let
    sequenceNumberByClient = new Map();

// event fired every time a new client connects:
server.on("connection", (socket) => {
    // create room
    socket.on('createRoom', function(room) {
        socket.room = room;
        // join room
        socket.join(room);
        console.log("User joined the room: "+socket.room);
    });

    socket.on('joinRoom', function (roomID) {
        socket.join(roomID);
    })

    console.info('Client connected [id= ${socket.id}]');
    // initialize this client's sequence number
    // ng dung emit create add vao 1 map
    socket.on('addUser',function(userID){
        socket.id = userID;
        console.log(userID);
        sequenceNumberByClient.set(userID,socket);
    });

    socket.on('sendMessage',function(sender, receiver, data){
        console.log('send',sender);
        console.log('data',receiver);
        var send = sequenceNumberByClient.get(sender);
        var receive = sequenceNumberByClient.get(receiver);
        console.log(send.id);
        send.emit('newMessage',{msg:'xinchao',nick:send.id},data);
        receive.emit('newMessage',{msg:'xinchao',nick:receive.id}, data);
    });

    socket.on('switchRoom', function(newroom){
        // leave the current room (stored in session)
        socket.leave(socket.room);
        // join new room, received as function parameter
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.id+' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.id+' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        sequenceNumberByClient.delete(socket);
        console.info('Client gone [id=${socket.id}]');
    });
});
