const Specialist = require('../models').Specialist;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.name){
        return ReE(res, 'ERROR0014', 400);
    }
    let duplicateSpecialist = await Specialist.findOne({name:body.name});

    if(duplicateSpecialist) return ReE(res, 'ERROR0014',409);

    let specialist = new Specialist({
        name: body.name,
        description: body.description
    });
    await  specialist.save();
    return ReS(res, {message: 'Tạo chuyên khoa thành công', specialist : specialist}, 200);

};

module.exports.create = create;

const get = async function (req, res) {
    Specialist.find({}, function (err, specialist) {
        if(err){
            return ReE(res, 'ERROR0015', 404);
        }
        return ReS(res, {message: 'Tải danh sách chuyên khoa thành công', specialist : specialist}, 200);
    });
};

module.exports.get = get;

const update = async function (req, res) {
    let data = req.body;
    console.log(req.body);
    let objSpecialist = await Specialist.findById({_id:data.id});
    if(!objSpecialist) return ReE(res, 'Not found', 400);
    objSpecialist.set(data);
    objSpecialist.save(function (err, updateSpecialistSuccess) {
        if (err) return ReE(res, 'Update failed', 503);
        return ReS(res, {message: 'Cập nhật chuyên khoa thành công', updateSpecialistSuccess : updateSpecialistSuccess}, 200);
    })
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
