const ChatsHistory = require('../models').ChatsHistory;
const User = require('../models').User;

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
        paymentDoctorID: body.paymentDoctorID
    });
    await  chatHistory.save();
    return ReS(res, {message: 'Tạo cuộc tư vấn thành công', chatHistory: chatHistory}, 200);
}

module.export.create = create;

const updateRecord = async function (req, res) {
    let data = req.body;
    if (!data.id) TE(err.message);
    try {
        ChatsHistory.findByIdAndUpdate(data.id, {$set: {records: data.records}}, {new: true}, function (err, updateRecordChat) {
            if (err) TE(err.message)
            return ReS(res, {message: 'Update record chat thành công', updateRecordChat: updateRecordChat}, 200);
        })
    } catch (e) {
        console.log(e);
    }
};

module.exports.updateRecord = updateRecord;

const getAllConversationByUser = async function (req, res) {
    //Todo get
    // sort status, time
    let query = {};
    if (req.params.patientId) {
        query.patientId = req.params.patientId
    }
    let checkUser = await User.findOne({id:req.params.id})
    if(checkUser.role)
    try {
        ChatsHistory.find({
            query
        })
            .select('doctorId, records, status')
            .sort([['status', 'ascending'], ['updatedAt', 'descending'], ['records.createTime', '1']])
            .populate(
                {
                    path: 'doctorId',
                    select: 'firstName middleName lastName'
                }
            ).exec(function (err, listChatsHistory) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Tạo list lịch sử chat thành công', listChatsHistory: listChatsHistory}, 200);
        });
    } catch (e) {

    }

}

module.export.getAllConversationByUser = getAllConversationByUser;

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
                    path: 'doctorId',
                    select: 'firstName middleName lastName avatar'
                }
            )
            .populate(
                {
                    path: 'patientId',
                    select: 'firstName middleName lastName avatar'
                }
            ).exec(function (err, listChatsHistory) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Lấy thông tin cuộc tư vấn thành công', listChatsHistory: listChatsHistory}, 200);
        });
    } catch (e) {

    }

}

module.export.getConversationByID = getConversationByID;
