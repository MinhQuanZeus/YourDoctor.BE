var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var sequenceNumberByClient = new Map();

// event fired every time a new client connects:
io.sockets.on("connection", (socket) => {
    console.log("socket connect: "+socket.id);
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

    socket.on('leaveRoom', function (roomID) {
        socket.leave(roomID);
    })

    console.info('Client connected [id= ${socket.id}]');
    // initialize this client's sequence number
    // ng dung emit create add vao 1 map
    socket.on('addUser',function(userID){
        socket.id = userID;
        console.log(userID);
        sequenceNumberByClient.set(userID,socket);
    });

    socket.on('sendMessage',function(sender, receiver, message){

        console.log('send',sender);
        console.log('data',receiver);

        var send = sequenceNumberByClient.get(sender);
        var receive = sequenceNumberByClient.get(receiver);
        var megSender = {
            senderid : sender,
            mess : message
        };

        //console.log(send.id);
        if(send != null){
            send.emit('newMessage',{data: JSON.stringify(megSender)});
            console.log(JSON.stringify(megSender));
        }

        if(receive != null){
            receive.emit('newMessage',{data: JSON.stringify(megSender)});
            console.log(JSON.stringify(megSender));
        }


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
