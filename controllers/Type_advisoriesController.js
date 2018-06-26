const TypeAdvisories = require('../models').TypeAdvisories;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.name || !body.price || !body.limitNumberRecords || !body.description){
        return ReE(res, 'ERROR0011',400);
    }
    else {
        var typeAdvisories = new TypeAdvisories({
            name: body.name,
            price: body.price,
            limitNumberRecords: body.limitNumberRecords,
            description: body.description
        })
        await  typeAdvisories.save();
        return ReS(res, {message: 'Tạo kiểu câu hỏi thành công',typeAdvisories:typeAdvisories}, 204);
    }
}
module.exports.create = create;

const getAllTypeAdvisories = async function (req, res) {
    TypeAdvisories.find({}, function (err, typeAdvisories) {
        if(err){
            return ReS(res, 'ERROR0012', 404);
            next();
        }
        return ReS(res, {message: 'Tải kiểu câu hỏi thành công', typeAdvisories : typeAdvisories}, 200);
    });
};
module.exports.getAllTypeAdvisories = getAllTypeAdvisories;

const getTypeAdvisoriesById = async function(req, res){
    if(!req.params.id) return ReS(res, 'ERROR0010', 400);
    TypeAdvisories.findById(req.params.id).then(doc => {
        if(!doc) {return res.status(404).end();}
        return ReS(res, {message: 'Tải kiểu câu hỏi thành công', doc : doc}, 200);
    })
        .catch(err => next(err));
}
module.exports.getTypeAdvisoriesById = getTypeAdvisoriesById;

const update = async function (req, res) {
    let data = req.body;
    if(!data) return ReS(res, 'ERROR0010', 400);
    TypeAdvisories.findByIdAndUpdate(data.id, function (err, updateAdvisories) {
        if (err) TE(err.message);
        if(!updateAdvisories) return ReS(res, 'ERROR0013', 404);
        updateAdvisories.set(data)
        updateAdvisories.save(function (err, updateAdvisories) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Cập nhật câu hỏi thành công', updateAdvisories : updateAdvisories}, 200);
        });
    });
};
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    if(!body) return ReS(res, 'ERROR0010', 400);
    TypeAdvisories.findByIdAndRemove(body.id, function (err, typeAdvisories) {
        if (err) TE(err.message);
        res.send('Delete success');
    });
};

module.exports.remove = remove;