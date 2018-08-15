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
        image: body.image,
        description: body.description,
        listQuestion: body.listQuestion
    });
    await  specialist.save();
    return ReS(res, {message: 'Tạo chuyên khoa thành công', specialist : specialist}, 200);

};

module.exports.create = create;

const getAllSpecialist = async function (req, res) {
    try {
        let listSpecialist = await Specialist.find({});
        if(listSpecialist){
            return ReS(res, {message: 'Tạo danh sách chuyên khoa thành công', listSpecialist : listSpecialist}, 200);
        }
        else {
            return ReE(res, 'Tạo danh sách chuyên khoa không thành công',503);
        }
    }
    catch (e) {
        console.log(e)
        return ReE(res, 'Tạo danh sách chuyên khoa không thành công',503);
    }
};
module.exports.getAllSpecialist = getAllSpecialist;


const getListSpecialist = async function (req, res) {
    try {
        let listSpecialist = await Specialist.find({}).select('name image');
        if(listSpecialist){
            return ReS(res, {message: 'Tạo danh sách chuyên khoa thành công', listSpecialist : listSpecialist}, 200);
        }
        else {
            return ReE(res, 'Tạo danh sách chuyên khoa không thành công',503);
        }
    }
    catch (e) {
        console.log(e)
        return ReE(res, 'Tạo danh sách chuyên khoa không thành công',503);
    }
};

module.exports.getListSpecialist = getListSpecialist;

const getDetailSpecialist = async function (req, res) {
    try {
        if(req.params.specialistId){
            let objSpecialist = await Specialist.findById({_id:req.params.specialistId});
            if(objSpecialist){
                return ReS(res, {message: 'Lấy thông tin chuyên khoa thành công', objSpecialist : objSpecialist}, 200);
            }
            else {
                return ReE(res, 'Lấy thông tin chuyên khoa không thành công',503);
            }
        }
        else {
            return ReE(res, 'Bad request',400);
        }
    }
    catch (e) {
        console.log(e)
    }
};

module.exports.getDetailSpecialist = getDetailSpecialist;

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
