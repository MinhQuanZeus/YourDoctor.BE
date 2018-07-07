const ChatsHistory = require('../models').ChatsHistory;
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

    var sockets = {};
    io.on('connection', function(socket){

        socket.on('checkData', function (objData) {
            var data = JSON.parse(objData);
            if(checkConversationID(data.conversationID)===true)
            sockets[data.receiver] = socket;
        });
        socket.on('send message', function (data, to) {
            sockets[to].emit(data.records);
        });
    });
    function checkConversationID(conversationID){
        var exists = false;
        let conversation = ChatsHistory.findById(conversationID)
        if (conversation) {
            exists = true;
        }
        return exists;
    }
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });