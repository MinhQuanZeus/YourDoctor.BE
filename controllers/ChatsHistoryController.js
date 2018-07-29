const ChatsHistory = require('../models').ChatsHistory;
const TypeAdvisory = require('../models').TypeAdvisory;
const PaymentsHistory = require('../models').PaymentsHistory;
const User = require('../models').User;
const SendNotification = require('./NotificationFCMController');
const Notification = require('../models').Notification;
const constants = require('./../constants');

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.patientId || !body.doctorId || !body.typeAdvisoryID ||
        !body.paymentPatientID || !body.contentTopic) {
        return ReE(res, 'ERROR0028', 400);
    }
    try {
        let dateApproval = new Date();
        dateApproval.setHours(dateApproval.getHours() + constants.DEADLINE_TIME_REPLY);
        let chatHistory = new ChatsHistory({
            contentTopic: body.contentTopic,
            patientId: body.patientId,
            doctorId: body.doctorId,
            records: body.records,
            status: body.status,
            timeReplyApproval: dateApproval,
            typeAdvisoryID: body.typeAdvisoryID,
            paymentPatientID: body.paymentPatientID,
            paymentDoctorID: body.paymentDoctorID,
            deletionFlag: body.deletionFlag
        });
        await  chatHistory.save();
        // trừ tiền user
        // get payment
        let objUser = await User.findById({_id: body.patientId});
        let objPayment = await PaymentsHistory.findById({_id: chatHistory.paymentPatientID});

        // update remain money
        objUser.set({remainMoney: objPayment.remainMoney});
        await objUser.save(function (err, success) {
            if (err) {
                ReE(res, err.toString(), 503);
            }
        });

        objPayment.set({status: constants.PAYMENT_SUCCESS});
        await objPayment.save(function (err, success) {
            if (err) {
                ReE(res, err.toString(), 503);
            }
        });

        let fullName;
        if (objUser) {
            fullName = " " + objUser.firstName + " " + objUser.middleName + " " + objUser.lastName + "";
        }
        // create data noti for doctor
        let payLoad = {
            data: {
                senderId: chatHistory.patientId,
                nameSender: fullName,
                receiveId: chatHistory.doctorId,
                type: constants.NOTIFICATION_TYPE_CHAT,
                storageId: chatHistory.id,
                message: "" + fullName + " vừa tạo yêu cầu tư vấn qua nhắn tin với bạn",
                createTime: Date.now().toString()
            }
        };
        // send
        await SendNotification.sendNotification(chatHistory.doctorId, payLoad);
        // save
        let notificationDoctor = {
            senderId: chatHistory.patientId,
            nameSender: fullName,
            receiveId: chatHistory.doctorId,
            type: constants.NOTIFICATION_TYPE_CHAT,
            storageId: chatHistory.id,
            message: "" + fullName + " vừa tạo yêu cầu tư vấn qua nhắn tin với bạn",
        };
        await createNotification(notificationDoctor);

        // create data noti for patients
        let payLoadForPatient = {
            data: {
                senderId: constants.ID_ADMIN,
                nameSender: constants.NAME_ADMIN,
                receiveId: chatHistory.patientId,
                type: constants.NOTIFICATION_TYPE_PAYMENT,
                storageId: objPayment.id,
                message: "Bạn vừa tạo một yêu cầu tư vấn. Bạn đã thanh toán: " + objPayment.amount + "VND. Số tiền bạn có hiện tại: " + objPayment.remainMoney + "VND.",
                createTime: Date.now().toString()
            }
        };
        // send
        await SendNotification.sendNotification(chatHistory.patientId, payLoadForPatient);
        // save
        let notificationPatient = {
            senderId: constants.ID_ADMIN,
            nameSender: constants.NAME_ADMIN,
            receiveId: chatHistory.patientId,
            type: constants.NOTIFICATION_TYPE_PAYMENT,
            storageId: objPayment.id,
            message: "Bạn vừa tạo một yêu cầu tư vấn. Bạn đã thanh toán: " + objPayment.amount + "VND.Số tiền bạn có hiện tại: " + objPayment.remainMoney + "VND."
        };
        await  createNotification(notificationPatient);
        return ReS(res, {message: 'Tạo cuộc tư vấn thành công', chatHistory: chatHistory}, 200);
    } catch (e) {
        ReS(res, e.message, 503);
    }

};

module.exports.create = create;

const updateRecord = async function (req, res) {
    let data = req.body;
    if (!data.id) TE(err.message);
    try {
        // check limit record
        let pushRecord = await ChatsHistory.findOne({_id: data.id});
        let objTypeAdvisory = await TypeAdvisory.findOne({_id: pushRecord.typeAdvisoryID});
        if (!objTypeAdvisory) ReS(res, "Không tìm thấy type", 503);
        // loop check
        let countRecord = 0;
        for (let i = 0; i < pushRecord.records.length; i++) {

            if (pushRecord.records[i].recorderID === pushRecord.patientId) {
                countRecord++;
            }
        }
        if (countRecord >= (objTypeAdvisory.limitNumberRecords * 1)) {
            return ReE(res, "ERROR0039", 503);
        }
        else {
            // update
            pushRecord.records.push(data.records);
            await pushRecord.save(function (err, pushRecord) {
                if (err) return ReE(res, "ERROR0030", 503);
                return ReS(res, {message: 'Update tin nhắn thành công', pushRecord: pushRecord}, 200);
            });
        }
    } catch (e) {
        console.log(e);
    }
};

module.exports.updateRecord = updateRecord;

const getAllConversationByPatient = async function (req, res) {
    //Todo get
    // sort status, time
    try {
        ChatsHistory.find({
            patientId: req.params.patientId,
            deletionFlag: {$ne: constants.CHAT_HISTORY_PATIENT_DELETE}
        })
            .select('doctorId records status updatedAt deletionFlag')
            .sort([['status', 'ascending'], ['updatedAt', -1]])
            .populate(
                {
                    path: 'doctorId',
                    select: 'firstName middleName lastName'
                }
            ).exec(function (err, listChatsHistory) {
            if (err) TE(err.message);
            return ReS(res, {
                message: 'Tạo danh sách lịch sử chat thành công',
                listChatsHistory: listChatsHistory
            }, 200);
        });
    } catch (e) {

    }

};

module.exports.getAllConversationByPatient = getAllConversationByPatient;

const getAllConversationByDoctor = async function (req, res) {
    //Todo get
    // sort status, time
    try {
        ChatsHistory.find({
            doctorId: req.params.doctorId,
            deletionFlag: {$ne: constants.CHAT_HISTORY_DOCTOR_DELETE}
        })
            .select('patientId records status updatedAt deletionFlag')
            .sort([['status', 'ascending'], ['updatedAt', -1]])
            .populate(
                {
                    path: 'patientId',
                    select: 'firstName middleName lastName'
                }
            ).exec(function (err, listChatsHistory) {
            if (err) TE(err.message);
            return ReS(res, {
                message: 'Tạo danh sách lịch sử chat thành công',
                listChatsHistory: listChatsHistory
            }, 200);
        });
    } catch (e) {

    }

};

module.exports.getAllConversationByDoctor = getAllConversationByDoctor;

const getConversationByID = async function (req, res) {
    console.log(req.params.id);
    try {
        let objConversation = await ChatsHistory.findById({
            _id: req.params.id
        }).populate({
            path: 'patientId doctorId',
            select: 'firstName middleName lastName'
        });
        if (!objConversation) {
            return ReE(res, "Không tìm thấy cuộc trò chuyện", 404);
        }
        else {
            return ReS(res, {message: 'Lấy thông tin cuộc tư vấn thành công', objConversation: objConversation}, 200);
        }
    } catch (e) {
        console.log(e)
    }
};

module.exports.getConversationByID = getConversationByID;

const checkDoctorReply = async function (req, res) {
    let body = req.body;
    if (!body) {
        return ReE(res, "Bad request", 400);
    }
    try {
        let arrayResultCheck = [];
        for (let k = 0; k < body.listId.length; k++) {
            let objChatHistory = await ChatsHistory.findById({_id: body.listId[k]});
            if (!objChatHistory) {
                return ReE(res, "Not Found", 404);
            }
            if (objChatHistory.records.length <= 0) {

                // chưa trả lời
                // get objPayment bệnh nhân
                let objPaymentPatient = await PaymentsHistory.findById({_id: objChatHistory.paymentPatientID});
                // get objUser bệnh nhân => trả lại tiền
                let objUser = await User.findById({_id: objChatHistory.patientId});
                let amount = objPaymentPatient.amount * 1;
                let remain_money = objUser.remainMoney * 1 + amount;
                // update remain_money
                objUser.set({remainMoney: remain_money});
                await objUser.save();
                // update payment history
                objPaymentPatient.set({amount: 0, remainMoney: remain_money, status: constants.PAYMENT_FAILED});
                await objPaymentPatient.save();
                // update status cuộc tư vấn
                objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
                await objChatHistory.save();
                // notification cho bác sỹ và bệnh nhân.
                // get name doctor
                let fullNameDoctor = await getUser(objChatHistory.doctorId);
                // save to notification
                let objNotificationPatientToSave = {
                    senderId: objChatHistory.doctorId,
                    nameSender: fullNameDoctor,
                    receiveId: objChatHistory.patientId,
                    type: constants.NOTIFICATION_TYPE_PAYMENT,
                    storageId: objPaymentPatient.id,
                    message: "Cuộc tư vấn với bác sỹ " + fullNameDoctor + " đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: " + amount + "VND. Số tiền bạn có hiện tại: " + remain_money + "VND",
                };
                await createNotification(objNotificationPatientToSave);

                // create data noti for patients
                let payLoadForPatient = {
                    data: {
                        senderId: objChatHistory.doctorId,
                        nameSender: fullNameDoctor,
                        receiveId: objChatHistory.patientId,
                        type: constants.NOTIFICATION_TYPE_PAYMENT,
                        storageId: objPaymentPatient.id,
                        message: "Cuộc tư vấn với bác sỹ " + fullNameDoctor + " đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: " + amount + "VND. Số tiền bạn có hiện tại: " + remain_money + "VND",
                        remain_money: remain_money + "",
                        createTime: Date.now().toString()
                    }
                };
                // send
                await SendNotification.sendNotification(objChatHistory.patientId, payLoadForPatient);
                //
                let resultCheck = {
                    ChatsHistoryID: objChatHistory.id,
                    DoctorReply: false,
                    StatusChatHistory: constants.STATUS_CONVERSATION_FINISH,
                    Message: "Hoàn trả tiền"
                };
                arrayResultCheck.push(resultCheck)
            }
            else {
                for (let i = 0; i < objChatHistory.records.length; i++) {
                    if (objChatHistory.records[i].recorderID !== objChatHistory.doctorId) {
                        // chưa trả lời
                        // get objPayment bệnh nhân
                        let objPaymentPatient = await PaymentsHistory.findById({_id: objChatHistory.paymentPatientID});
                        // get objUser bệnh nhân => trả lại tiền
                        let objUser = await User.findById({_id: objChatHistory.patientId});
                        let amount = objPaymentPatient.amount * 1;
                        let remain_money = objUser.remainMoney * 1 + amount;
                        // update remain_money
                        objUser.set({remainMoney: remain_money});
                        await objUser.save();
                        // update payment history
                        objPaymentPatient.set({amount: 0, remainMoney: remain_money, status: constants.PAYMENT_FAILED});
                        await objPaymentPatient.save();
                        // update status cuộc tư vấn
                        objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
                        await objChatHistory.save();
                        // notification cho bác sỹ và bệnh nhân.
                        // get name doctor
                        let fullNameDoctor = await getUser(objChatHistory.doctorId);
                        // create data noti for patients
                        let payLoadForPatient = {
                            data: {
                                senderId: objChatHistory.doctorId,
                                nameSender: fullNameDoctor,
                                receiveId: objChatHistory.patientId,
                                type: constants.NOTIFICATION_TYPE_PAYMENT,
                                storageId: objPaymentPatient.id,
                                message: "Cuộc tư vấn với bác sỹ " + fullNameDoctor + " đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: " + amount + "VND. Số tiền bạn có hiện tại: " + remain_money + "VND",
                                remain_money: remain_money + "",
                                createTime: Date.now().toString()
                            }
                        };
                        // send
                        await SendNotification.sendNotification(objChatHistory.patientId, payLoadForPatient);
                        // save to notification
                        let objNotificationPatientToSave = {
                            senderId: objChatHistory.doctorId,
                            nameSender: fullNameDoctor,
                            receiveId: objChatHistory.patientId,
                            type: constants.NOTIFICATION_TYPE_PAYMENT,
                            storageId: objPaymentPatient.id,
                            message: "Cuộc tư vấn với bác sỹ " + fullNameDoctor + " đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: " + amount + "VND. Số tiền bạn có hiện tại: " + remain_money + "VND",
                        };
                        await createNotification(objNotificationPatientToSave);
                        //
                        let resultCheck = {
                            ChatsHistoryID: ChatsHistory.id,
                            DoctorReply: false,
                            StatusChatHistory: constants.STATUS_CONVERSATION_FINISH,
                            Message: "Hoàn trả tiền"
                        };
                        arrayResultCheck.push(resultCheck)
                    }
                    else {
                        // bác sỹ có reply tin nhắn
                        // check status done của cuộc tư vấn
                        if (objChatHistory.status * 1 === constants.STATUS_CONVERSATION_FINISH) {
                            let resultCheck = {
                                ChatsHistoryID: objChatHistory.id,
                                DoctorReply: true,
                                StatusChatHistory: constants.STATUS_CONVERSATION_FINISH,
                                Message: "Đã thanh toán tiền cho bác sỹ"
                            };
                            arrayResultCheck.push(resultCheck)
                        }
                        else {
                            // cuộc tư vấn chưa done
                            // Tạo payment cho bác sỹ, thanh toán cho bác sỹ
                            let paymentIdDoctor = await createPaymentForDoctor(objChatHistory.id);
                            // update status done cho cuộc tư vấn, update payment id doctor vào cuộc chat
                            objChatHistory.set({
                                status: constants.STATUS_CONVERSATION_FINISH,
                                paymentDoctorID: paymentIdDoctor.id
                            });
                            await objChatHistory.save();
                            //
                            let fullName = await getUser(objChatHistory.patientId);
                            // bạn nhận được xx tiền, số tiền hiện tại là xxxx
                            let objNotificationToSave = {
                                senderId: objChatHistory.patientId,
                                nameSender: fullName,
                                receiveId: objChatHistory.doctorId,
                                type: constants.NOTIFICATION_TYPE_PAYMENT,
                                storageId: objChatHistory.id,
                                message: "Cuộc tư vấn với bệnh nhân " + fullName + " đã kết thúc. Bạn nhận được: " + paymentIdDoctor.amount + " VND." + " Số tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney + "VND",
                            };
                            console.log(objNotificationToSave);
                            // save to notification table
                            await createNotification(objNotificationToSave);

                            let payLoad = {
                                data: {
                                    senderId: objChatHistory.patientId,
                                    nameSender: fullName,
                                    receiveId: objChatHistory.doctorId,
                                    type: constants.NOTIFICATION_TYPE_PAYMENT,
                                    storageId: ChatsHistory.id,
                                    message: "Cuộc tư vấn với bệnh nhân " + fullName + "đã kết thúc. Bạn nhận được: " + paymentIdDoctor.amount + " VND." + " Số tiền bạn có hiện tại: " + paymentIdDoctor.remainMoney + "VND",
                                    createTime: Date.now().toString()
                                }
                            };
                            // send notification cho bác sỹ
                            await SendNotification.sendNotification(objChatHistory.doctorId, payLoad);

                            /// thông báo notification cho bệnh nhân
                            let fullNameDoctor = await getUser(objChatHistory.doctorId);
                            // save to notification table
                            let objNotificationPatientToSave = {
                                senderId: objChatHistory.doctorId,
                                nameSender: fullNameDoctor,
                                receiveId: objChatHistory.patientId,
                                type: constants.NOTIFICATION_TYPE_PAYMENT,
                                storageId: objChatHistory.id,
                                message: "Cuộc tư vấn với bác sỹ " + fullNameDoctor + " đã kết thúc.",
                            };
                            await createNotification(objNotificationPatientToSave);
                            let payLoadPatient = {
                                data: {
                                    senderId: objChatHistory.doctorId,
                                    nameSender: fullNameDoctor,
                                    receiveId: objChatHistory.patientId,
                                    type: constants.NOTIFICATION_TYPE_PAYMENT,
                                    storageId: objChatHistory.id,
                                    message: "Cuộc tư vấn với bác sỹ " + fullNameDoctor + " đã kết thúc.",
                                    createTime: Date.now().toString()
                                }
                            };
                            // send notification
                            await SendNotification.sendNotification(objChatHistory.doctorId, payLoadPatient);
                            //
                            let resultCheck = {
                                ChatsHistoryID: objChatHistory.id,
                                DoctorReply: true,
                                StatusChatHistory: constants.STATUS_CONVERSATION_FINISH,
                                Message: "Tạo payment thanh toán tiền cho bác sỹ."
                            };
                            arrayResultCheck.push(resultCheck);
                        }
                    }
                }
            }
        }
        return ReS(res, {message: 'Result check', arrayResultCheck: arrayResultCheck}, 200);
    }
    catch (e) {

    }
};

module.exports.checkDoctorReply = checkDoctorReply;
//
const createNotification = async function (body) {
    try {
        let notification = Notification({
            senderId: body.senderId,
            nameSender: body.nameSender,
            receiverId: body.receiverId,
            type: body.type,
            storageId: body.storageId,
            message: body.message
        });
        await  notification.save(function (err, success) {
            if (err) {
                console.log(err)
            }
        });
    }
    catch (e) {
        console.log(e)
    }
};


///
async function createPaymentForDoctor(conversationID) {
    let paymentID;
    // get conversation
    let objChatHistory = await ChatsHistory.findById({_id: conversationID});
    if (objChatHistory) {
        // get amount of type advisory
        let objTypeAdvisory = await TypeAdvisory.findById({_id: objChatHistory.typeAdvisoryID});
        // get user
        let objUser = await User.findById({_id: objChatHistory.doctorId});
        // calculate remain money
        let remainMoney = objUser.remainMoney * 1 + objTypeAdvisory.price * 1 * constants.PERCENT_PAY_FOR_DOCTOR;
        try {
            let objPaymentHistory = PaymentsHistory({
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
    return paymentID;
}

async function getUser(userId) {
    let fullName;
    let objUser = await User.findById({_id: userId});
    if (objUser) {
        fullName = " " + objUser.firstName + " " + objUser.middleName + " " + objUser.lastName + "";
    }
    return fullName
}


const checkStatusChatsHistory = async function (req, res) {
    let arrayResult = [];
    let body = req.body;
    if (!body) {
        return ReE(res, "Bad request", 400);
    }
    else {
        for (let i = 0; i < body.listId.length; i++) {
            let objChatHistory = await ChatsHistory.findById({_id: body.listId[i]});
            if (!objChatHistory) {
                return ReE(res, "Not found", 404);
            }
            else {
                if (objChatHistory.status * 1 !== constants.STATUS_CONVERSATION_FINISH) {
                    let objChatDone = {
                        ChatsHistoryID: objChatHistory.id,
                        statusDone: false,
                        message: "Cuộc tư vấn này chưa kết thúc"
                    };
                    arrayResult.push(objChatDone);
                }
            }
        }
    }
    return ReS(res, {message: 'Result check', arrayResult: arrayResult}, 200);
};

module.exports.checkStatusChatsHistory = checkStatusChatsHistory;

