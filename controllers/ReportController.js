const Report = require('../models').Report;

const create = async function (req, res) {
    const body = req.body;
    try {
        if(!body){
            return ReS(report, 'Bad request', 400);
        }else {
            let objReport = await Report.findOne({idReporter:body.idReporter, idPersonBeingReported: body.idPersonBeingReported});
            if(objReport){
                objReport.set(body);
                let isSuccess = await objReport.save();
                if(isSuccess){
                    return ReS(res, {message: 'Gửi báo cáo thành công',isSuccess:true }, 200);
                }
                else {
                    return ReS(res, {message: 'Gửi báo cáo không thành công',isSuccess:false }, 200);
                }
            }
            else {
                let objReport = new Report({
                    idReporter: body.idReporter,
                    idPersonBeingReported: body.idPersonBeingReported,
                    reason: body.reason
                });
                let isSuccess = await objReport.save();
                if(isSuccess){
                    return ReS(res, {message: 'Gửi báo cáo thành công',isSuccess:true }, 200);
                }
                else {
                    return ReS(res, {message: 'Gửi báo cáo không thành công',isSuccess:false }, 200);
                }
            }
        }
    }
    catch (e) {
        console.log(e)
    }
};

module.exports.create = create;

const get = async function (req, res) {
    try {
        Report.find({
            status: false
        }, function (err, listReport) {
            if(err){
                return ReS(res, {message:'Not found report'}, 404);
            }
            return ReS(res, {message: 'Tải danh sách báo cáo thành công',listReport:listReport }, 200);
        });
    }
    catch (e) {
        console.log(e)
        return ReS(res, {message:'Tải danh sách báo cáo không thành công'}, 503);
    }
};

module.exports.get = get;

const updateReportDoctorProcessing = async function (req, res) {
    try {
        if(req.params.id){
            let objReport = await Report.findById({_id:req.params.id});
            if(objReport){
                objReport.set({status:true});
                let objReportReturn = await objReport.save();
                if(objReportReturn){
                    return ReS(res, {message: 'Xử lý báo cáo thành công',objReportReturn:objReportReturn }, 200);
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
module.exports.updateReportDoctorProcessing = updateReportDoctorProcessing;