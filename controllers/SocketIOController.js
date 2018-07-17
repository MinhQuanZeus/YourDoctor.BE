module.exports = function (io) {

    var sequenceNumberByClient = new Map();

// event fired every time a new client connects:
    io.sockets.on("connection", (socket) => {
        //let sender, conversationID, type, value;
        console.log("socket connect: " + socket.id);
        // create room
        socket.on('createRoom', function (room) {
            socket.room = room;
            // join room
            socket.join(room);
            console.log("User joined the room: " + socket.room);
        });

        socket.on('joinRoom', function (roomID) {
            socket.join(roomID);
        })

        socket.on('leaveRoom', function (roomID) {
            socket.leave(roomID);
        })

        console.info("Client connected id"+socket.id);
        // initialize this client's sequence number
        // ng dung emit create add vao 1 map
        socket.on('addUser', function (userID) {
            socket.id = userID;
            console.log(userID);
            sequenceNumberByClient.set(userID, socket);
        });

        socket.on('sendMessage', function (reqSender, reqReceiver, reqConversationID, reqType, reqValue) {

            console.log(reqSender);
            console.log(reqReceiver);
            var send = sequenceNumberByClient.get(reqSender);
            var receive = sequenceNumberByClient.get(reqReceiver);
            var megSender = {
                senderID: reqSender,
                type: reqType,
                value: reqValue
            };

            //console.log(send.id);
            if (send != null) {
                send.emit('newMessage', {data: JSON.stringify(megSender)});
                console.log(JSON.stringify(megSender));
            }

            if (receive != null) {
                receive.emit('newMessage', {data: JSON.stringify(megSender)});
                console.log(JSON.stringify(megSender));
            }

            // collect data
            var records = {
                recorderID: reqSender,
                type: reqType,
                value: reqValue
            }
            var objectUpdate = {
                id: reqConversationID,
                records: records
            }
            console.log(objectUpdate)
            if(!updateRecord(objectUpdate)){
                if (send != null) {
                    send.emit('errorUpdate', 'Gủi tin nhắn không thành công');
                    console.log(JSON.stringify(megSender));
                }
            }
        });


        socket.on('switchRoom', function (newroom) {
            // leave the current room (stored in session)
            socket.leave(socket.room);
            // join new room, received as function parameter
            socket.join(newroom);
            socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
            // sent message to OLD room
            socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.id + ' has left this room');
            // update socket session room title
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.id + ' has joined this room');
            socket.emit('updaterooms', rooms, newroom);
        });

        // when socket disconnects, remove it from the list:
        socket.on("disconnect", () => {
            sequenceNumberByClient.delete(socket);
            console.info("Client gone id" +socket.id);
        });
    });

    /////////////////////////////////
    const ChatsHistory = require('../models').ChatsHistory;
    const TypeAdvisory = require('../models').TypeAdvisory;
    async function updateRecord(data) {
        let updateSuccess = true;
        if (!data.id) updateSuccess = false;
        try {
            // check limit record
            let pushRecord = await ChatsHistory.findOne({_id: data.id})
            let objTypeAdvisory = await TypeAdvisory.findOne({_id: pushRecord.typeAdvisoryID});
            if (!objTypeAdvisory) updateSuccess = false;
            // loop check
            let countRecord = 0;
            for (var i = 0; i < pushRecord.records.length; i++) {

                if (pushRecord.records[i].recorderID === pushRecord.patientId) {
                    countRecord++;
                }
            }
            if (countRecord >= (objTypeAdvisory.limitNumberRecords * 1)) {
                updateSuccess = false;
            }
            else {
                // update
                pushRecord.records.push(data.records)
                await pushRecord.save(function (err, pushRecord) {
                    if (err) updateSuccess = false;
                    updateSuccess = true;
                });
            }
        } catch (e) {
            console.log(e);
        }
        return updateSuccess;
    }
}