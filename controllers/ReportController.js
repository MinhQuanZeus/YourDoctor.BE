const Report = require('../models').Report;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.idReporter){
        return ReE(res, 'Báo cáo không thành công',400);
    }
    else if(!body.idPersonBeingReported){
        return ReE(res, 'Báo cáo không thành công',400);
    }else {
        var report = new Report({
            idReporter: body.idReporter,
            idPersonBeingReported: body.idPersonBeingReported,
            reason: body.reason,
            timeCreate: body.timeCreate
        })
        return ReS(report, {message: 'Gửi báo cáo thành công',report:report }, 200);
    }


}

module.exports.create = create;

const get = async function (req, res) {
    Report.find({}, function (err, listReport) {
        if(err){
            res.send('Có lỗi khi load dữ liệu');
            next();
        }
        return ReS(res, {message: 'Tải danh sách báo cáo thành công',listReport:listReport }, 200);
    });
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