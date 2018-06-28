const Specialist = require('../models').Specialist;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.name){
        return ReE(res, 'ERROR0014', 400);
    }
    let dupplicateSpecialist = await Specialist.findOne({name:body.name})

    if(dupplicateSpecialist) return ReE(res, 'ERROR0014',409);

    var specialist = new Specialist({
        name: body.name,
    })
    await  specialist.save()
    return ReS(res, {message: 'Tạo chuyên khoa thành công', specialist : specialist}, 200);

}

module.exports.create = create;

const get = async function (req, res) {
    Specialist.find({}, function (err, specialist) {
        if(err){
            return ReE(res, 'ERROR0015', 404);
            next();
        }
        return ReS(res, {message: 'Tải danh sách chuyên khoa thành công', specialist : specialist}, 200);
    });
};

module.exports.get = get;

const update = async function (req, res) {
    let data = req.body;
    console.log(req.body);
    Specialist.findByIdAndUpdate(data.id,{ $set: { name: data.name }}, { new: true }, function (err, updateSpecialist) {

        if (err) TE(err.message);
        return ReS(res, {message: 'Cập nhật chuyên khoa thành công', updateSpecialist : updateSpecialist}, 200);
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
