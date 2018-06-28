const Type_advisories = require('../models').Type_advisories;
const create = async function (req, res) {
    const body = req.body;
    if (!body.name || !body.price || !body.limitNumberRecords || !body.description) {
        return ReE(res, 'ERROR0011', 400);
    }
    let duplicateTypeAdvisory = await Type_advisories.findOne({name:body.name});

    if (duplicateTypeAdvisory) return ReE(res, 'ERROR0014', 409);
    var typeAdvisories = new Type_advisories({
        name: body.name,
        price: body.price,
        limitNumberRecords: body.limitNumberRecords,
        description: body.description
    })
    await  typeAdvisories.save();
    return ReS(res, {message: 'Tạo kiểu câu hỏi thành công', typeAdvisories: typeAdvisories}, 200);

}
module.exports.create = create;

const getAllTypeAdvisories = async function (req, res) {
    Type_advisories.find({}, function (err, typeAdvisories) {
        if (err) return ReS(res, 'ERROR0012', 404);

        return ReS(res, {message: 'Tải kiểu câu hỏi thành công', typeAdvisories: typeAdvisories}, 200);
    });
};
module.exports.getAllTypeAdvisories = getAllTypeAdvisories;

const getTypeAdvisoriesById = async function (req, res) {
    console.log(req.params.id);
    if (!req.params.id) return ReS(res, 'ERROR0010', 400);
    Type_advisories.findById(req.params.id, function (err, objectAdvisory) {
        if (err) return ReS(res, 'ERROR0012', 404);
        return ReS(res, {message: 'Tải kiểu câu hỏi thành công', objectAdvisory: objectAdvisory}, 200);
    });
}
module.exports.getTypeAdvisoriesById = getTypeAdvisoriesById;

const update = async function (req, res) {
    let data = req.body;
    console.log(req.body);
    Type_advisories.findByIdAndUpdate(data.id,
        { $set: { name: data.name, price:data.price,limitNumberRecords:data.limitNumberRecords, description:data.description }},
        { new: true },
        function (err, updateTypeAdvisory) {

        if (err) TE(err.message);
        return ReS(res, {message: 'Update kiểu câu hỏi thành công', updateTypeAdvisory : updateTypeAdvisory}, 200);
    });
};
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    if (!body) return ReS(res, 'ERROR0010', 400);
    Type_advisories.findByIdAndRemove(body.id, function (err, typeAdvisories) {
        if (err) TE(err.message);
        res.send('Delete success');
    });
};

module.exports.remove = remove;