const ChatsHistory = require('../models').ChatsHistory;
const TypeAdvisory = require('../models').TypeAdvisory;
const PaymentsHistory = require('../models').PaymentsHistory;
const User = require('../models').User;
const SendNotification = require('./NotificationFCMController')
const CreateNotification = require('./NotificationController')
const constants = require('./../constants');

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.patientId || !body.doctorId || !body.typeAdvisoryID ||
        !body.paymentPatientID || !body.contentTopic) {
        return ReE(res, 'ERROR0028', 400);
    }
    try {
        var dateApproval = new Date();
            dateApproval.setHours(dateApproval.getHours() + constants.DEADLINE_TIME_REPLY)
        var chatHistory = new ChatsHistory({
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
        let objUser = await User.findById({_id:body.patientId})
        let objPayment = await PaymentsHistory.findById({_id:chatHistory.paymentPatientID});
        objPayment.set({status:constants.PAYMENT_SUCCESS});
        await objPayment.save(function (err,success) {
            if(err) {
                ReE(res, err.toString(), 503);
            }
        });
        // update remain money
        objUser.set({remainMoney:objPayment.remainMoney});
        await objUser.save(function (err,success) {
            if(err) {
                ReE(res, err.toString(), 503);
            }
        });

        var fullName;
        if(objUser) {
            fullName = " "+objUser.firstName+" "+objUser.middleName+" "+objUser.lastName+"";
        }
        // create data noti for doctor
        var payLoad = {
            data: {
                senderId: chatHistory.patientId,
                nameSender:fullName,
                receiveId: chatHistory.doctorId,
                type: constants.NOTIFICATION_TYPE_CHAT,
                storageId: chatHistory.id,
                message: ""+fullName+" vừa tạo yêu cầu tư vấn qua nhắn tin với bạn",
                createTime: Date.now().toString()
            }
        }
        // send
        await SendNotification.sendNotification(chatHistory.doctorId, payLoad)
        // save
        var notiDoctor = {
            senderId: chatHistory.patientId,
            nameSender:fullName,
            receiveId: chatHistory.doctorId,
            type: constants.NOTIFICATION_TYPE_CHAT,
            storageId: chatHistory.id,
            message: ""+fullName+" vừa tạo yêu cầu tư vấn qua nhắn tin với bạn",
        };
        await CreateNotification.create(notiDoctor);

        // create data noti for patients
        var payLoadForPatient = {
            data:{
                senderId: constants.ID_ADMIN,
                nameSender: constants.NAME_ADMIN,
                receiveId: chatHistory.patientId,
                type: constants.NOTIFICATION_TYPE_PAYMENT,
                storageId: objPayment.id,
                message: "Bạn vừa tạo một yêu cầu tư vấn.\nBạn đã thanh toán: " + objPayment.amount + "VND\nSố tiền bạn có hiện tại: " + objPayment.remainMoney+"VND",
                createTime: Date.now().toString()
            }
        };
        // send
        await SendNotification.sendNotification(chatHistory.patientId, payLoadForPatient)
        // save
        var notipatient = {
            senderId: constants.ID_ADMIN,
            nameSender: constants.NAME_ADMIN,
            receiveId: chatHistory.patientId,
            type: constants.NOTIFICATION_TYPE_PAYMENT,
            storageId: objPayment.id,
            message: "Bạn vừa tạo một yêu cầu tư vấn. \nBạn đã thanh toán: " + objPayment.amount + "VND\nSố tiền bạn có hiện tại: " + objPayment.remainMoney+"VND"
        };
        CreateNotification.create(notipatient);
        return ReS(res, {message: 'Tạo cuộc tư vấn thành công', chatHistory: chatHistory}, 200);
    } catch (e) {
        ReS(res, e.message, 503);
    }

}

module.exports.create = create;

const updateRecord = async function (req, res) {
    let data = req.body;
    if (!data.id) TE(err.message);
    try {
        // check limit record
        let pushRecord = await ChatsHistory.findOne({_id: data.id})
        let objTypeAdvisory = await TypeAdvisory.findOne({_id: pushRecord.typeAdvisoryID});
        if (!objTypeAdvisory) ReS(res, "Không tìm thấy type", 503);
        // loop check
        let countRecord = 0;
        for (var i = 0; i < pushRecord.records.length; i++) {

            if (pushRecord.records[i].recorderID === pushRecord.patientId) {
                countRecord++;
            }
        }
        if (countRecord >= (objTypeAdvisory.limitNumberRecords * 1)) {
            return ReE(res, "ERROR0039", 503);
        }
        else {
            // update
            pushRecord.records.push(data.records)
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

}

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

}

module.exports.getAllConversationByDoctor = getAllConversationByDoctor;

const getConversationByID = async function (req, res) {
    console.log(req.params.id)
    try {
        let objConversation = await ChatsHistory.findById({
            _id: req.params.id
        }).populate({
            path: 'patientId doctorId',
            select: 'firstName middleName lastName'
        })
        if (!objConversation) {
            return ReE(res, "Không tìm thấy cuộc trò chuyện", 404);
        }
        else {
            return ReS(res, {message: 'Lấy thông tin cuộc tư vấn thành công', objConversation: objConversation}, 200);
        }
    } catch (e) {
        console.log(e)
    }
}

module.exports.getConversationByID = getConversationByID;

const checkDoctorReply = async function (req, res) {
    let doctorReply = false;
    if(!req.params.id){
        return ReE(res, "Bad request", 400);
    }
    let objChatHistory = await ChatsHistory.findById({_id:req.params.id})
    if(!objChatHistory){
        return ReE(res, "Not Found", 404);
    }
    for (var i = 0; i < objChatHistory.records.length; i++){
        if(objChatHistory.records[i].recorderID !== objChatHistory.doctorId){
            doctorReply = false;
        }
        else {
            doctorReply = true;
        }
    }
    if(doctorReply){
        // đã trả lời
        return ReS(res, {message: 'Kiểm tra bác sỹ đã trả lời tin nhắn hay chưa', doctorReply: doctorReply}, 200);
    }
    else {
        // chưa trả lời
        // get objPayment bệnh nhân
        let objPaymentPatient = await PaymentsHistory.findById({_id:objChatHistory.paymentPatientID})
        var amount = objPaymentPatient.amount *1;
        var remain_money = objPaymentPatient.remainMoney * 1 + amount;
        // get objUser bệnh nhân => trả lại tiền
        let objUser = User.findById({_id:objChatHistory.patientId})
        // update remain_money
        objUser.set({remainMoney:remain_money});
        await objUser.save();
        // update payment history
        objPaymentPatient.set({amount:0, remainMoney:remain_money})
        await objPaymentPatient.save()
        // xóa cuộc tư vấn
        ChatsHistory.findByIdAndDelete({_id:req.params.id},function (err, success) {
            if(err) return
        });
        // notification cho bác sỹ và bệnh nhân.
        // get name doctor
        let objDoctor = await User.findById({_id:objChatHistory.doctorId})
        var fullNameDoctor;
        if(objUser) {
            fullNameDoctor = " "+objDoctor.firstName+" "+objDoctor.middleName+" "+objDoctor.lastName+"";
        }
        // create data noti for patients
        var payLoadForPatient = {
            data:{
                senderId: constants.ID_ADMIN,
                nameSender: constants.NAME_ADMIN,
                receiveId: objChatHistory.patientId,
                type: constants.NOTIFICATION_TYPE_PAYMENT,
                storageId: objPaymentPatient.id,
                message: "Cuộc tư vấn với bác sỹ "+fullNameDoctor+" đã bị hủy do quá thời gian trả lời.\nBạn được hoàn trả: " + amount + "VND\nSố tiền bạn có hiện tại: " + remain_money+"VND",
                remain_money: remain_money,
                createTime: Date.now().toString()
            }
        };
        // send
        await SendNotification.sendNotification(objChatHistory.patientId, payLoadForPatient)
        return ReS(res, {message: 'Kiểm tra bác sỹ đã trả lời tin nhắn hay chưa', doctorReply: doctorReply}, 200);
    }
}

module.exports.checkDoctorReply = checkDoctorReply;

const checkStatusChatsHistory = async function (req, res) {
    let statusDone = false;
    if(!req.params.id){
        return ReE(res, "Bad request", 400);
    }
    else {
        let objChatHistory = await ChatsHistory.findById({_id:req.params.id});
        if(!objChatHistory) {
            return ReE(res, "Not found", 404);
        }
        else {
            if(objChatHistory.status*1 === constants.STATUS_CONVERSATION_FINISH){
                statusDone = true;
                return ReS(res, {message: 'Kiểm tra cuộc tư vấn đã kết thúc hay chưa', statusDone: statusDone}, 200);
            }
            else {
                statusDone = false;
                return ReS(res, {message: 'Kiểm tra cuộc tư vấn đã kết thúc hay chưa', statusDone: statusDone}, 200);
            }
        }
    }
}

module.exports.checkStatusChatsHistory = checkStatusChatsHistory;

