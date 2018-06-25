const Report = require('../models').Report;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.id_reporter){
        return ReE(res, 'Báo cáo không thành công',400);
    }
    else if(!body.id_person_being_reported){
        return ReE(res, 'Báo cáo không thành công',400);
    }else {
        var report = new Report({
            id_reporter: body.id_reporter,
            id_person_being_reported: body.id_person_being_reported,
            reason: body.reason,
            time_create: body.time_create
        })
        return ReS(report, {message: 'Gửi báo cáo thành công',report:report }, 200);
    }


}

module.exports.create = create;

const get = async function (req, res) {
    Report.find({}, function (err, list_report) {
        if(err){
            res.send('Có lỗi khi load dữ liệu');
            next();
        }
        return ReS(list_report, {message: 'Tải danh sách báo cáo thành công',list_report:list_report }, 200);
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