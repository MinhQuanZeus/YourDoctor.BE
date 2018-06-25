const Type_advisories = require('../models').Type_advisories;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.name || !body.price || !body.limit_number_records || !body.description){
        return ReE(res, 'ERROR0011',400);
    }
    else {
        var type_advisories = new Type_advisories({
            name: body.name,
            price: body.price,
            limit_number_records: body.limit_number_records,
            description: body.description
        })
        await  type_advisories.save();
        return ReS(res, {message: 'Tạo kiểu câu hỏi thành công',type_advisories:type_advisories}, 204);
    }
}
module.exports.create = create;

const get_all_type = async function (req, res) {
    Type_advisories.find({}, function (err, type_advisories) {
        if(err){
            return ReS(res, 'ERROR0012', 404);
            next();
        }
        return ReS(res, {message: 'Tải kiểu câu hỏi thành công', type_advisories : type_advisories}, 200);
    });
};
module.exports.get_all_type = get_all_type;

const get_by_id = async function(req, res){
    if(!req.params.id) return ReS(res, 'ERROR0010', 400);
    Type_advisories.findById(req.params.id).then(doc => {
        if(!doc) {return res.status(404).end();}
        return ReS(res, {message: 'Tải kiểu câu hỏi thành công', doc : doc}, 200);
    })
        .catch(err => next(err));
}
module.exports.get_by_id = get_by_id;

const update = async function (req, res) {
    let data = req.body;
    if(!data) return ReS(res, 'ERROR0010', 400);
    Type_advisories.findByIdAndUpdate(data.id, function (err, update_advisories) {
        if (err) TE(err.message);
        if(!update_advisories) return ReS(res, 'ERROR0013', 404);
        update_advisories.set(data)
        update_advisories.save(function (err, updateAdvisories) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Cập nhật câu hỏi thành công', updateAdvisories : updateAdvisories}, 200);
        });
    });
};
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    if(!body) return ReS(res, 'ERROR0010', 400);
    Type_advisories.findByIdAndRemove(body.id, function (err, type_advisories) {
        if (err) TE(err.message);
        res.send('Delete success');
    });
};

module.exports.remove = remove;