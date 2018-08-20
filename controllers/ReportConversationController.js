const ReportConversation = require('../models').ReportConversation;
const ChatsHistory = require('../models').ChatsHistory;
const VideoCallHistory = require('../models').VideoCallHistory;

const createReportConveration = async function (req, res) {
    try {
        let body = req.body;
        if (body) {
            let objReportCheck = await ReportConversation.findOne({
                idReporter: body.idReporter,
                idPersonBeingReported: body.idPersonBeingReported,
                idConversation: body.idConversation
            });
            if (objReportCheck) {
                return ReS(res, {message: 'Trùng lặp! Bạn đã report cuộc tư vấn này.'}, 503);
            }
            else {
                let objReport = new ReportConversation({
                    idReporter: body.idReporter,
                    idPersonBeingReported: body.idPersonBeingReported,
                    reason: body.reason,
                    idConversation: body.idConversation,
                    type: body.type
                });
                let objReportReturn = await objReport.save();
                if (objReportReturn) {
                    return ReS(res, {status: true, message: 'Gửi báo cáo thành công'}, 200);
                }
                else {
                    return ReS(res, {message: 'Gửi báo cáo thất bại'}, 503);
                }
            }
        }
        else {
            return ReS(res, 'Bad request', 400);
        }
    }
    catch (e) {
        return ReS(res, {message: 'Gửi báo cáo thất bại'}, 503);
    }
};

module.exports.createReportConveration = createReportConveration;

const getListReport = async function (req, res) {
    try {
        let listReport = await ReportConversation.find(
            {
                status: false
            })
            .select('idReporter idPersonBeingReported reason idConversation type status createdAt updatedAt')
            .populate(
                {
                    path: 'idReporter idPersonBeingReported',
                    select: 'firstName middleName lastName birthday avatar'
                }
            );
        if (listReport) {
            return ReS(res, {message: 'Lấy danh sách báo cáo thành công', listReport: listReport}, 200);
        }
        else {
            return ReE(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
        }
    }
    catch (e) {
        return ReE(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
    }
};

module.exports.getListReport = getListReport;

const getDetailReport = async function (req, res) {
    try {

        if(req.query.idConversation && req.query.type){
            if(req.query.type === 'chat'){
                let objDetailChat = await ChatsHistory.findById({_id:req.query.idConversation});
                if(objDetailChat){
                    return ReS(res, {message: 'Detail conversation', objDetailChat: objDetailChat}, 200);
                }
                else {
                    return ReE(res, {message: 'NOT FOUND'}, 503);
                }
            }
            else if(req.query.type === 'video'){
                let objDetailVideo = await VideoCallHistory.findById({_id:req.query.idConversation});
                if(objDetailVideo){
                    return ReS(res, {message: 'Detail conversation', objDetailVideo: objDetailVideo}, 200);
                }
                else {
                    return ReE(res, {message: 'NOT FOUND'}, 503);
                }
            }
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 503);
        }
    }
    catch (e) {
        return ReE(res, {message: 'ERROR'}, 503);
    }
};
module.exports.getDetailReport = getDetailReport;

const updateReportConversationProcessing = async function (req, res) {
    try {
        if (req.body.id) {
            let objReport = await ReportConversation.findById({_id: req.body.id});
            if (objReport) {
                objReport.set({status: true});
                let objReportReturn = await objReport.save();
                if (objReportReturn) {
                    return ReS(res, {message: 'Xử lý báo cáo thành công', status: true}, 200);
                }
                else {
                    return ReE(res, {message: 'Xử lý báo cáo không thành công'}, 503);
                }
            }
            else {
                return ReE(res, {message: 'Xử lý báo cáo không thành công'}, 503);
            }
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 503);
        }
    }
    catch (e) {
        return ReE(res, {message: 'Xử lý báo cáo không thành công'}, 503);
    }
};
module.exports.updateReportConversationProcessing = updateReportConversationProcessing;


