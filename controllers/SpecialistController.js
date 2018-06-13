const Specialist = require('../models').Specialist;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.name){
        return ReE(res, 'Tạo chuyên khoa bị lỗi');
    }
    else {
        var specialist = new Specialist({
            name: body.name,
        })
        await  specialist.save()
        res.json(specialist)
        return ReS(res, {message: 'Tạo chuyên khoa thành công'}, 204);
    }
}

module.exports.create = create;

const get = async function (req, res) {
    Specialist.find({}, function (err, specialist) {
        if(err){
            res.send('Có lỗi khi load dữ liệu');
            next();
        }
        console.log(specialist);
        res.json(specialist);
    });
};

module.exports.get = get;

const update = async function (req, res) {
    const body = req.body;
    Specialist.findByIdAndUpdate(body.id, { $set: { name: body.name }}, { new: true }, function (err, specialist) {
        if (err) return handleError(err);
        res.send(specialist);
    });
};


module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    Specialist.findByIdAndRemove(body.id, function (err, specialist) {
        if (err) return handleError(err);
        res.send('Delete success');
    });
};

module.exports.remove = remove;
