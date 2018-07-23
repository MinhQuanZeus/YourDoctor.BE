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

        console.info("Client connected id" + socket.id);
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
            }else{
                var payLoad = {
                    data: {
                        senderId: reqSender,
                        nameSender:"",
                        receiveId: reqReceiver,
                        type: constants.NOTIFICATION_TYPE_CHAT,
                        storageId: reqConversationID,
                        message: "Demo send notification",
                        createTime: Date.now().toString()
                    }
                }
                SendNotification.sendNotification(reqReceiver, payLoad)
            }

            if (receive != null) {
                receive.emit('newMessage', {data: JSON.stringify(megSender)});
                // var tokenDevice = getToken(reqReceiver)
                //them name ng gui vao neu co


                console.log(JSON.stringify(megSender));
            }else {
                var payLoad = {
                    data: {
                        senderId: reqSender,
                        nameSender:"",
                        receiveId: reqReceiver,
                        type: constants.NOTIFICATION_TYPE_CHAT,
                        storageId: reqConversationID,
                        message: "vừa nhắn tin cho bạn",
                        createTime: Date.now().toString()
                    }
                }
                SendNotification.sendNotification(reqReceiver, payLoad)
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
            if (!updateRecord(objectUpdate)) {
                if (send != null) {
                    send.emit('errorUpdate', 'Gủi tin nhắn không thành công');
                    console.log(JSON.stringify(megSender));
                }
            }
        });

        socket.on('doneConversation', function (reqSender, reqReceiver, reqConversationID) {
            var send = sequenceNumberByClient.get(reqSender);
            var receive = sequenceNumberByClient.get(reqReceiver);
            //Update status cua chat history là done (status : 2)
            if (createPaymentForDoctor(reqConversationID)) {
                if (send != null) {
                    send.emit('finishConversation', 'Cuộc tư vấn đã kết thúc');
                }else {
                    var payLoad = {
                        data: {
                            senderId: reqSender,
                            nameSender:"",
                            receiveId: reqReceiver,
                            type: constants.NOTIFICATION_TYPE_CHAT,
                            storageId: reqConversationID,
                            message: "cuộc trò chuyện đã hoàn thành",
                            createTime: Date.now().toString()
                        }
                    }
                    SendNotification.sendNotification(reqReceiver, payLoad)
                }

                if (receive != null) {
                    receive.emit('finishConversation', 'Cuộc tư vấn đã kết thúc');
                }else {
                    var payLoad = {
                        data: {
                            senderId: reqSender,
                            nameSender:"",
                            receiveId: reqReceiver,
                            type: constants.NOTIFICATION_TYPE_CHAT,
                            storageId: reqConversationID,
                            message: "cuộc trò chuyện đã hoàn thành",
                            createTime: Date.now().toString()
                        }
                    }
                    SendNotification.sendNotification(reqReceiver, payLoad)
                }
            }
            else {
                // TODO notification to Admin
            }
        })
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
            console.info("Client gone id" + socket.id);
        });
    });
}
/////////////////////////////////
const ChatsHistory = require('../models').ChatsHistory;
const TypeAdvisory = require('../models').TypeAdvisory;
const PaymentsHistory = require('../models').PaymentsHistory;
const TokenNotification = require('../models').TokenNotification;
const SendNotification = require('./NotificationFCMController')
const User = require('../models').User;
const constants = require('./../constants');

// async function getToken(userId) {
//     var tokenDevice;
//     let objToken = await TokenNotification.findOne({userId: userId})
//     tokenDevice = objToken.tokenDevice
//     return tokenDevice
// }

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

async function createPaymentForDoctor(conversationID) {
    let success = false;
    // get conversation
    let objChatHistory = await ChatsHistory.findOne({id: conversationID})
    if (objChatHistory) {
        // get amount of type advisory
        let objTypeAdvisory = await TypeAdvisory.findOne({id: objChatHistory.typeAdvisoryID})
        // get user
        let objUser = await User.findOne({id: objChatHistory.doctorId})
        // calculate remain money
        var remainMoney = objUser.remainMoney * 1 + objTypeAdvisory.price * 1;
        try {
            var objPaymentHistory = PaymentsHistory({
                userID: objChatHistory.doctorId,
                amount: objTypeAdvisory.price * 1,
                remainMoney: remainMoney,
                typeAdvisoryID: objChatHistory.typeAdvisoryID,
                status: constants.PAYMENT_SUCCESS
            });
            // save to payment table
            await objPaymentHistory.save(function (err, objPaymentHistory) {
                if (err) {
                    success = false;
                    //TODO notification to Admin
                }
                else {
                    success = true;
                }
            });

            // update remain money to User
            objUser.set({remainMoney: remainMoney});
            await objUser.save(function (err, objUser) {
                if (err) {
                    success = false;
                    //TODO notification to Admin
                }
                else {
                    success = true;
                }
            })
        }
        catch (e) {
        }
    }
    return success;
}