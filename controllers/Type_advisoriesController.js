const Type_advisories = require('../models').Type_advisories;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    console.log(body.name);
    console.log(body.price);
    console.log(body.limit_number_records);
    if(!body.name || !body.price || !body.limit_number_records){
        return ReE(res, 'Tạo kiểu câu hỏi thất bại');
    }
    else {
        var type_advisories = new Type_advisories({
            name: body.name,
            price: body.price,
            limit_number_records: body.limit_number_records,
        })
        await  type_advisories.save()
        res.json(type_advisories)
        return ReS(res, {message: 'Tạo kiểu câu hỏi thành công'}, 204);
    }
}
module.exports.create = create;

const get_all_type = async function (req, res) {
    Type_advisories.find({}, function (err, type_advisories) {
        if(err){
            res.send('Có lỗi khi load dữ liệu');
            next();
        }
        console.log(type_advisories);
        res.json(type_advisories);
    });
};
module.exports.get_all_type = get_all_type;

const get_by_id = async function(req, res){
    Type_advisories.findById(req.params.id).then(doc => {
        if(!doc) {return res.status(404).end();}
        return res.status(200).json(doc);
    })
        .catch(err => next(err));
}
module.exports.get_by_id = get_by_id;

const update = async function (req, res) {
    const body = req.body;
    Type_advisories.findByIdAndUpdate(body.id, { $set: { name: body.name, price:body.price,
            limit_number_records:body.limit_number_records }}, { new: true }, function (err, type_advisories) {
        if (err) return handleError(err);
        res.send(type_advisories);
    });
};
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    Type_advisories.findByIdAndRemove(body.id, function (err, type_advisories) {
        if (err) return handleError(err);
        res.send('Delete success');
    });
};

module.exports.remove = remove;