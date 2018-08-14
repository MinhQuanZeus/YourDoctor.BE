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
            if(objReportCheck){
                return ReS(res, {message:'Trùng lặp! Bạn đã report cuộc tư vấn này.'}, 503);
            }
            else {
                let objReport = new ReportConversation({
                    idReporter: body.idReporter,
                    idPersonBeingReported: body.idPersonBeingReported,
                    reason:body.reason,
                    idConversation: body.idConversation,
                    type:body.type
                });
                let objReportReturn = await objReport.save();
                if(objReportReturn){
                    return ReS(res, {message: 'Gửi báo cáo thành công',objReportReturn:objReportReturn }, 200);
                }
                else {
                    return ReS(res, {message:'Gửi báo cáo thất bại'}, 503);
                }
            }
        }
        else {
            return ReS(res, 'Bad request', 400);
        }
    }
    catch (e) {
        return ReS(res, {message:'Gửi báo cáo thất bại'}, 503);
    }
};

module.exports.createReportConveration = createReportConveration;