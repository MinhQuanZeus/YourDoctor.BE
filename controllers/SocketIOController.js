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

            socket.on('sendMessage', async function (reqSender, reqReceiver, reqConversationID, reqType, reqValue) {
                var send = sequenceNumberByClient.get(reqSender);
                var receive = sequenceNumberByClient.get(reqReceiver);
                var megSender = {
                    senderID: reqSender,
                    type: reqType,
                    value: reqValue
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
                                    message: "" + fullName + " vừa nhắn tin cho bạn",
                                    createTime: Date.now()
                                }
                            }
                            console.log("ban notification for" + reqReceiver);
                            SendNotification.sendNotification(reqReceiver, payLoad);
                        }
                    }
                    // update record chat failed do vượt quá giới hạn gói câu hỏi
                    else {
                        let paymentIdDoctor = await createPaymentForDoctor(reqConversationID);
                        let objPaymentDoctor = await PaymentsHistory.findById({_id:paymentIdDoctor})
                        if (send != null) {
                            //
                            send.emit('errorUpdate', 'Số tin nhắn vượt qua giới hạn của gói tư vấn - Cuộc tư vấn đã kết thúc');
                        }
                        if(receive!=null){
                            // json: số tiền nhận được, số tiền hiện tại đang có
                            receive.emit('finishConversation', "Cuộc tư vấn đã kết thúc \n Bạn nhận được: "+objPaymentDoctor.amount +"\nSố tiền bạn có hiện tại: "+objPaymentDoctor.remainMoney);
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
                                    message: "Cuộc tư vấn với "+fullName+"đã kết thúc\n"+ "Bạn nhận được: "+objPaymentDoctor.amount+"VND\n" +"Số tiền bạn có hiện tại: "+objPaymentDoctor.remainMoney,
                                    createTime: Date.now()
                                }
                            }
                            // send notification
                            SendNotification.sendNotification(reqReceiver, payLoad)
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
                            let objPaymentDoctor = await PaymentsHistory.findById({_id:paymentIdDoctor})
                            // json: số tiền nhận được, số tiền hiện tại đang có
                            receive.emit('finishConversation', "Cuộc tư vấn đã kết thúc \n Bạn nhận được: "+objPaymentDoctor.amount +"\nSố tiền bạn có hiện tại: "+objPaymentDoctor.remainMoney);

                        } else {
                            let fullName = await getUser(reqSender)
                            // bạn nhận được xx tiền, số tiền hiện tại là xxxx
                            let objPaymentDoctor = await PaymentsHistory.findById({_id:paymentIdDoctor})
                            let payLoad = {
                                data: {
                                    senderId: reqSender,
                                    nameSender: fullName,
                                    receiveId: reqReceiver,
                                    type: constants.NOTIFICATION_TYPE_PAYMENT,
                                    storageId: reqConversationID,
                                    message: "Cuộc tư vấn với "+fullName+"đã kết thúc\n"+ "Bạn nhận được: "+objPaymentDoctor.amount+"VND\n" +"Số tiền bạn có hiện tại: "+objPaymentDoctor.remainMoney,
                                    createTime: Date.now()
                                }
                            }
                            // send notification
                            SendNotification.sendNotification(reqReceiver, payLoad)
                        }
                    }
                    else {
                        // TODO notification to Admin
                    }
                } else {
                    // TODO notification to Admin
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
        let updateSuccess = false;
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

    async function updateStatus(reqConversationID) {
        let success = false;
        let objChatHistory = await ChatsHistory.findById({_id: reqConversationID})
        if (objChatHistory) {
            objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
            await objChatHistory.save(function (err, objUpdate) {
                if (err) {
                    console.log(e);
                    success = false;
                }
                else {
                    success = true;
                }
            });
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
        let paymentID = "";
        // get conversation
        let objChatHistory = await ChatsHistory.findOne({id: conversationID})
        if (objChatHistory) {
            // get amount of type advisory
            let objTypeAdvisory = await TypeAdvisory.findOne({id: objChatHistory.typeAdvisoryID})
            // get user
            let objUser = await User.findOne({id: objChatHistory.doctorId})
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
                // save to payment table
                await objPaymentHistory.save(function (err, objPaymentHistory) {
                    if (err) {
                        paymentID = null;
                    }
                    else {
                        paymentID = objPaymentHistory.id;
                    }
                });

                // update remain money to User
                objUser.set({remainMoney: remainMoney});
                await objUser.save(function (err, objUser) {
                    if (err) {
                        TE(err);
                        return
                    }
                })
            }
            catch (e) {
            }
        }
        return paymentID;
    }

}