const ChatsHistory = require('../models').ChatsHistory;
const constants = require('./../constants');

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.patientId || !body.doctorId || !body.typeAdvisoryID ||
        !body.paymentPatientID || !body.paymentDoctorID || !body.contentTopic) {
        return ReE(res, 'ERROR0028', 400);
    }

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
        deletionFlag:body.deletionFlag
    });
    await  chatHistory.save();
    return ReS(res, {message: 'Tạo cuộc tư vấn thành công', chatHistory: chatHistory}, 200);
}

module.exports.create = create;

const updateRecord = async function (req, res) {
    let data = req.body;
    if (!data.id) TE(err.message);
    try {
        let pushRecord = await ChatsHistory.findOne({_id:data.id})
        pushRecord.records.push(data.records)
        await pushRecord.save(function (err, pushRecord) {
            if(err) TE(err.message);
            return ReS(res, {message: 'Update tin nhắn thành công', pushRecord: pushRecord}, 200);
        })
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
            patientId:req.params.patientId,
            deletionFlag:{$ne:constants.CHAT_HISTORY_PATIENT_DELETE}
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
            return ReS(res, {message: 'Tạo danh sách lịch sử chat thành công', listChatsHistory: listChatsHistory}, 200);
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
            doctorId:req.params.doctorId,
            deletionFlag:{$ne:constants.CHAT_HISTORY_DOCTOR_DELETE}
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
            return ReS(res, {message: 'Tạo danh sách lịch sử chat thành công', listChatsHistory: listChatsHistory}, 200);
        });
    } catch (e) {

    }

}

module.exports.getAllConversationByDoctor = getAllConversationByDoctor;

const getConversationByID = async function (req, res) {
    let query = {};
    if (req.params.id) {
        query.id = req.params.id
    }
    try {
        ChatsHistory.find({
            query
        })
        //.select('doctorId, records, status')
        //.sort([['status', 'ascending'],['updatedAt','descending'],['records.createTime','1']])
            .populate(
                {
                    select: 'firstName middleName lastName avatar'
                }
            ).exec(function (err, listChatsHistory) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Lấy thông tin cuộc tư vấn thành công', listChatsHistory: listChatsHistory}, 200);
        });
    } catch (e) {

    }

}

module.exports.getConversationByID = getConversationByID;
