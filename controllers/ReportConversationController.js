const ReportConversation = require('../models').ReportConversation;

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
        let listReport = await ReportConversation.find({
            status: false
        });
        if (listReport) {
            return ReS(res, {message: 'Lấy danh sách báo cáo thành công', listReport: listReport}, 200);
        }
        else {
            return ReS(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
        }
    }
    catch (e) {
        return ReS(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
    }
};

module.exports.getListReport = getListReport;

const updateReportConversationProcessing = async function (req, res) {
    try {
        if (req.params.id) {
            let objReport = await ReportConversation.findById({_id: req.params.id});
            if (objReport) {
                objReport.set({status: true});
                let objReportReturn = await objReport.save();
                if (objReportReturn) {
                    return ReS(res, {message: 'Xử lý báo cáo thành công', objReportReturn: objReportReturn}, 200);
                }
                else {
                    return ReS(res, {message: 'Xử lý báo cáo không thành công'}, 503);
                }
            }
            else {
                return ReS(res, {message: 'Xử lý báo cáo không thành công'}, 503);
            }
        }
        else {
            return ReS(res, {message: 'BAD REQUEST'}, 503);
        }
    }
    catch (e) {
        return ReS(res, {message: 'Xử lý báo cáo không thành công'}, 503);
    }
};
module.exports.updateReportConversationProcessing = updateReportConversationProcessing;


