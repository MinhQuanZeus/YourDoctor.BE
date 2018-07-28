module.exports = function (io,redis) {
    let clientsOnline = {}

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
                // add id client online to array
                clientsOnline[userID] = socket.id;
                redis.set('userOnline', JSON.stringify(clientsOnline), redis.print);
                console.log(userID);
                sequenceNumberByClient.set(userID, socket.id);
            });

            socket.on('sendMessage', async function (reqSender, reqReceiver, reqConversationID, reqType, reqValue) {
                let send = sequenceNumberByClient.get(reqSender);
                let receive = sequenceNumberByClient.get(reqReceiver);
                let megSender = {
                    senderID: reqSender,
                    type: reqType,
                    value: reqValue,
                    createTime: Date.now().toString()
                };
                // check status
                if (await getStatus(reqConversationID) === constants.STATUS_CONVERSATION_FINISH) {
                    // cuộc tư vấn đã kết thúc
                    if (send != null) {
                        send.emit('conversationDone', 'Cuộc tư vấn đã kết thúc');
                        return;
                    }
                }
                // cuộc tư vấn chưa kết thúc
                else {
                    // case 1: tin nhắn trong giới hạn của gói câu hỏi: update success
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
                    // update record chat success
                    if (await updateRecord(objectUpdate)) {
                        // check sender
                        if (send != null) {
                            send.emit('newMessage', {data: JSON.stringify(megSender)});
                        } else {
                        }
                        // check receiver
                        if (receive != null) {
                            receive.emit('newMessage', {data: JSON.stringify(megSender)});
                        } else {
                            let fullName = await getUser(reqSender)
                            let payLoad = {
                                data: {
                                    senderId: reqSender,
                                    nameSender: fullName,
                                    receiveId: reqReceiver,
                                    type: constants.NOTIFICATION_TYPE_CHAT,
                                    storageId: reqConversationID,
                                    message: ""+ fullName +" vừa nhắn tin cho bạn",
                                    createTime: Date.now().toString()
                                }
                            }
                            SendNotification.sendNotification(reqReceiver, payLoad);
                            // save to notification table
                            let objNotificationToSave = {
                                senderId: reqSender,
                                nameSender: fullName,
                                receiverId: reqReceiver,
                                type: constants.NOTIFICATION_TYPE_CHAT,
                                storageId: reqConversationID,
                                message: ""+ fullName +" vừa nhắn tin cho bạn",
                            }
                            await CreateNotification.create(objNotificationToSave)
                        }
                    }
                    // update record chat failed do vượt quá giới hạn gói câu hỏi
                    else {
                        let paymentIdDoctor = await createPaymentForDoctor(reqConversationID);
                        //let objPaymentDoctor = await PaymentsHistory.findById({_id: paymentIdDoctor})

                        if (send != null) {
                            console.log("ng nhan tin" +send + "");
                            send.emit('errorUpdate', 'Số tin nhắn vượt qua giới hạn của gói tư vấn - Cuộc tư vấn đã kết thúc.');
                        }
                        if (receive != null) {
                            // json: số tiền nhận được, số tiền hiện tại đang có
                            console.log("ng nhan tin" +send + "");
                            receive.emit('finishConversation', "Cuộc tư vấn đã kết thúc. \nBạn nhận được: " + paymentIdDoctor.amount + "VND\nSố tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney+"VND");
                        }
                        else {
                            let fullName = await getUser(reqSender)
                            // bạn nhận được xx tiền, số tiền hiện tại là xxxx
                            let payLoad = {
                                data: {
                                    senderId: reqSender,
                                    nameSender: fullName,
                                    receiveId: reqReceiver,
                                    type: constants.NOTIFICATION_TYPE_PAYMENT,
                                    storageId: reqConversationID,
                                    message: "Bạn nhận được: " + paymentIdDoctor.amount + " VND\n" + "Số tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney+"VND",
                                    createTime: Date.now().toString()
                                }
                            }
                            // send notification
                            SendNotification.sendNotification(reqReceiver, payLoad)
                            // save to notification table
                            let objNotificationToSave = {
                                senderId: reqSender,
                                nameSender: fullName,
                                receiverId: reqReceiver,
                                type: constants.NOTIFICATION_TYPE_PAYMENT,
                                storageId: reqConversationID,
                                message: "Bạn nhận được: " + paymentIdDoctor.amount + " VND\n" + "Số tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney+"VND",
                            }
                            await CreateNotification.create(objNotificationToSave)
                        }
                    }
                }

            });

            socket.on('doneConversation', async function (reqSender, reqReceiver, reqConversationID) {

                var send = sequenceNumberByClient.get(reqSender);
                var receive = sequenceNumberByClient.get(reqReceiver);

                //Update status cua chat history là done (status : 2)

                if (updateStatus(reqConversationID)) {
                    let paymentIdDoctor = await createPaymentForDoctor(reqConversationID)
                    if (paymentIdDoctor) {
                        // emit to sender
                        if (send != null) {
                            send.emit('finishConversation', 'Cuộc tư vấn đã kết thúc');
                        }
                        // emit to receiver
                        if (receive != null) {
                            // json: số tiền nhận được, số tiền hiện tại đang có
                            receive.emit('finishConversation', "Cuộc tư vấn đã kết thúc \nBạn nhận được: " + paymentIdDoctor.amount + "+VND\nSố tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney+"VND");

                        } else {
                            let fullName = await getUser(reqSender)
                            // bạn nhận được xx tiền, số tiền hiện tại là xxxx
                            let payLoad = {
                                data: {
                                    senderId: reqSender,
                                    nameSender: fullName,
                                    receiveId: reqReceiver,
                                    type: constants.NOTIFICATION_TYPE_PAYMENT,
                                    storageId: reqConversationID,
                                    message: "Bạn nhận được: " + paymentIdDoctor.amount + " VND\n" + "Số tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney +"VND",
                                    createTime: Date.now().toString()
                                }
                            }
                            // send notification
                            SendNotification.sendNotification(reqReceiver, payLoad)
                            // save to notification table
                            let objNotificationToSave = {
                                senderId: reqSender,
                                nameSender: fullName,
                                receiverId: reqReceiver,
                                type: constants.NOTIFICATION_TYPE_PAYMENT,
                                storageId: reqConversationID,
                                message: "Bạn nhận được: " + paymentIdDoctor.amount + " VND\n" + "Số tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney+"VND",
                            }
                            await CreateNotification.create(objNotificationToSave)
                        }
                    }
                    else {
                        // TODO notification to Admin
                    }
                } else {
                    // TODO notification to Admin
                    console.log("update is failed")
                }
            })
            /// socket upload image chat

            ///
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
                Object.keys(JSON.stringify(clientsOnline)).forEach(function(key){
                    if(clientsOnline[key]===socket.id)
                        delete clientsOnline[key];
                });
                redis.set('userOnline', JSON.stringify(clientsOnline), redis.print);
                sequenceNumberByClient.delete(socket.id);
                console.info("Client gone id" + socket.id);
            });
        }
    )
/////////////////////////////////
    const ChatsHistory = require('../models').ChatsHistory;
    const TypeAdvisory = require('../models').TypeAdvisory;
    const PaymentsHistory = require('../models').PaymentsHistory;
    const SendNotification = require('./NotificationFCMController')
    const User = require('../models').User;
    const UploadImageChat = require('./UploadImageController');
    const CreateNotification = require('./NotificationController');
    const constants = require('./../constants');

    async function getUser(userId) {
        let fullName;
        let objUser = await User.findById({_id: userId})
        console.log(objUser)
        if (objUser) {
            fullName = " " + objUser.firstName + " " + objUser.middleName + " " + objUser.lastName + "";
        }
        return fullName
    }

    async function updateRecord(data) {
        console.log(data)
        let updateSuccess = false;
        if (!data.id) {
            console.log("data id is null");
            updateSuccess = false
            return updateSuccess;
        }
        ;
        try {
            // check limit record
            let pushRecord = await ChatsHistory.findById({_id: data.id})
            console.log("chat history" + pushRecord);
            console.log("id type " + pushRecord.typeAdvisoryID)
            let objTypeAdvisory = await TypeAdvisory.findById({_id: pushRecord.typeAdvisoryID});

            console.log("type " + objTypeAdvisory);
            if (!objTypeAdvisory) {
                console.log("type is null");
                updateSuccess = false
                return updateSuccess;
            }
            ;
            // loop check
            var countRecord = 0;
            for (var i = 0; i < pushRecord.records.length; i++) {

                if (pushRecord.records[i].recorderID === pushRecord.patientId) {
                    countRecord++;
                }
            }
            console.log(countRecord)
            console.log(objTypeAdvisory.limitNumberRecords * 1)
            if (countRecord >= (objTypeAdvisory.limitNumberRecords * 1)) {
                await updateStatus(data.id)
                updateSuccess = false;
                return updateSuccess;
            } else {
                // update
                pushRecord.records.push(data.records)
                await pushRecord.save(function (err, pushRecord) {
                    if (err) {

                    }
                    else {

                    }
                });
                updateSuccess = true;
            }
        } catch (e) {
            console.log(e);
        }
        console.log( "final " + updateSuccess)
        return updateSuccess;
    }

    async function updateStatus(reqConversationID) {
        let success = false;
        let objChatHistory = await ChatsHistory.findById({_id: reqConversationID})
        if (objChatHistory) {
            objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
            await objChatHistory.save(function (err, objUpdate) {
            });

            if(await getStatus(reqConversationID)=== constants.STATUS_CONVERSATION_FINISH){
                success = true;
            }

        }
        return success;
    }

    async function getStatus(reqConversationID) {
        let status = 0;
        let objChatHistory = await ChatsHistory.findById({_id: reqConversationID})
        if (objChatHistory) {
            status = objChatHistory.status * 1;
        }
        return status;
    }

    async function createPaymentForDoctor(conversationID) {
        var paymentID;
        // get conversation
        let objChatHistory = await ChatsHistory.findById({_id: conversationID})
        if (objChatHistory) {
            // get amount of type advisory
            let objTypeAdvisory = await TypeAdvisory.findById({_id: objChatHistory.typeAdvisoryID})
            // get user
            let objUser = await User.findById({_id: objChatHistory.doctorId})
            // calculate remain money
            var remainMoney = objUser.remainMoney * 1 + objTypeAdvisory.price * 1 * constants.PERCENT_PAY_FOR_DOCTOR;
            try {
                var objPaymentHistory = PaymentsHistory({
                    userID: objChatHistory.doctorId,
                    amount: objTypeAdvisory.price * 1 * constants.PERCENT_PAY_FOR_DOCTOR,
                    remainMoney: remainMoney,
                    typeAdvisoryID: objChatHistory.typeAdvisoryID,
                    status: constants.PAYMENT_SUCCESS
                });

                // update remain money to User
                objUser.set({remainMoney: remainMoney});
                await objUser.save(function (err, objUser) {
                    if (err) {

                    }
                });

                // save to payment table
                await objPaymentHistory.save(function (err, objPaymentHistory) {
                });
                paymentID = objPaymentHistory;
            }
            catch (e) {
            }
        }
        console.log("su" + paymentID)
        return paymentID;
    }
}