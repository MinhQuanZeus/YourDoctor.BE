const Report = require('../models').Report;

const create = async function (req, res) {
    const body = req.body;
    try {
        if(!body){
            return ReS(report, 'Bad request', 400);
        }else {
            let objReportUpdate = await Report.findOne({idReporter:body.idReporter, idPersonBeingReported: body.idPersonBeingReported});
            if(objReportUpdate){
                objReportUpdate.set(body);
                objReportUpdate.save();
                return ReS(res, {message: 'Gửi báo cáo thành công',objReportUpdate:objReportUpdate }, 200);
            }
            else {
                let reportCreateNew = new Report({
                    idReporter: body.idReporter,
                    idPersonBeingReported: body.idPersonBeingReported,
                    reason: body.reason
                });
                await reportCreateNew.save();
                return ReS(res, {message: 'Gửi báo cáo thành công',reportCreateNew:reportCreateNew }, 200);
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
        Report.find({}, function (err, listReport) {
            if(err){
                return ReS(report, 'Not found report', 404);
            }
            return ReS(res, {message: 'Tải danh sách báo cáo thành công',listReport:listReport }, 200);
        });
    }
    catch (e) {
        console.log(e)
    }
};

module.exports.get = get;

const remove = async function (req, res) {
    const body = req.body;
    Report.findByIdAndRemove(body.id, function (err, report) {
        if (err) return handleError(err);
        res.send('Delete report success');
    });
};

module.exports.remove = remove;