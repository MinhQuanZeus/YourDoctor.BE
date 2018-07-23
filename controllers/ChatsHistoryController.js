const ChatsHistory = require('../models').ChatsHistory;
const TypeAdvisory = require('../models').TypeAdvisory;
const User = require('../models').User;
const SendNotification = require('./NotificationFCMController')
const constants = require('./../constants');

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.patientId || !body.doctorId || !body.typeAdvisoryID ||
        !body.paymentPatientID || !body.contentTopic) {
        return ReE(res, 'ERROR0028', 400);
    }
    let objChatPending = await ChatsHistory.find({
        'patientId':body.patientId,
        'doctorId': body.doctorId,
        'status': constants.STATUS_CONVERSATION_TALKING
    });
    if(objChatPending){
        return ReE(res, 'Bạn đang có một cuộc tư vấn chưa hoàn thành với bác sỹ này', 400);
    }
    try {
        var chatHistory = new ChatsHistory({
            contentTopic: body.contentTopic,
            patientId: body.patientId,
            doctorId: body.doctorId,
            records: body.records,
            status: body.status,
            timeReplyApproval: body.timeReplyApproval,
            typeAdvisoryID: body.typeAdvisoryID,
            paymentPatientID: body.paymentPatientID,
            paymentDoctorID: body.paymentDoctorID,
            deletionFlag: body.deletionFlag
        });
        await  chatHistory.save();

        let objUser = await User.findById({_id:body.patientId})
        var fullName;
        if(objUser) {
            fullName = " "+objUser.firstName+" "+objUser.middleName+" "+objUser.lastName+"";
        }
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
        await SendNotification.sendNotification(chatHistory.doctorId, payLoad)
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
