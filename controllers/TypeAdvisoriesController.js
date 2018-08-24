const TypeAdvisory = require('../models').TypeAdvisory;
const create = async function (req, res) {
	const body = req.body;
	if (!body.name || !body.price || (!body.limitNumberRecords && body.type === 1) || !body.description) {
		return ReE(res, 'ERROR0011', 400);
	}
	if (body.type === 2) {
		let duplicateTypeAdvisory = await TypeAdvisory.findOne({ type: body.type });
		if (duplicateTypeAdvisory) return ReE(res, 'ERROR0014', 409);
	}
	let typeAdvisories = new TypeAdvisory({
		name: body.name,
		price: body.price,
		type: body.type,
		limitNumberRecords: body.limitNumberRecords,
		description: body.description,
	});
	await typeAdvisories.save();
	return ReS(res, { message: 'Tạo kiểu câu hỏi thành công', typeAdvisories: typeAdvisories }, 200);

};
module.exports.create = create;

const getAllTypeAdvisories = async function (req, res) {
	TypeAdvisory.find({ deletionFlag: { $ne: true } }, function (err, typeAdvisories) {
		if (err) return ReS(res, 'ERROR0012', 404);

		return ReS(res, { message: 'Tải kiểu câu hỏi thành công', typeAdvisories: typeAdvisories }, 200);
	});
};
module.exports.getAllTypeAdvisories = getAllTypeAdvisories;

const getTypeAdvisoriesById = async function (req, res) {
	if (!req.params.id) return ReS(res, 'ERROR0010', 400);
	TypeAdvisory.findById(req.params.id, function (err, objectAdvisory) {
		if (err) return ReS(res, 'ERROR0012', 404);
		return ReS(res, { message: 'Tải kiểu câu hỏi thành công', objectAdvisory: objectAdvisory }, 200);
	});
};
module.exports.getTypeAdvisoriesById = getTypeAdvisoriesById;

const update = async function (req, res) {
	let data = req.body;
	if (data.type === 2) {
		let duplicateTypeAdvisory = await TypeAdvisory.findOne({
			type: 2,
			_id: { $ne: data.id },
			deletionFlag: { $ne: true },
		});
		if (duplicateTypeAdvisory) return ReE(res, 'ERROR0014', 409);
	}
	TypeAdvisory.findByIdAndUpdate(data.id,
		{
			$set: {
				name: data.name,
				price: data.price,
				limitNumberRecords: data.limitNumberRecords,
				description: data.description,
			},
		},
		{ new: true },
		function (err, updateTypeAdvisory) {

			if (err) TE(err.message);
			return ReS(res, {
				message: 'Update kiểu câu hỏi thành công',
				updateTypeAdvisory: updateTypeAdvisory,
			}, 200);
		});
};
module.exports.update = update;

const remove = async function (req, res) {
	const body = req.body;
	if (!body) return ReS(res, 'ERROR0010', 400);
	TypeAdvisory.findByIdAndRemove(body.id, function (err, typeAdvisories) {
		if (err) TE(err.message);
		res.send('Delete success');
	});
};

module.exports.remove = remove;

const deleteById = async function (req, res) {
	const updateTime = req.query.updateTime;
	const typeId = req.params.typeId;
	if (!typeId || !updateTime) {
		ReE(res, {
			status: false,
			message: 'Vui lòng nhập userId và updateTime',
		}, 400);
	}
	TypeAdvisory.find({
		_id: typeId,
	}, (err, results) => {
		if (err) {
			return ReE(res, err, 500);
		}

		if (results && results.length === 0) {
			return ReE(res, 'Loại tư vấn không tồn tại', 404);
		}
		let user = results[0];
		if (Number(user.updatedAt) !== Number(updateTime)) {
			return ReE(res, 'Loại tư vấn này đã được chỉnh sửa, vui lòng refresh và thử lại', 400);
		}

		user.deletionFlag = true;
		user.save((error, status) => {
			if (error) {
				return ReE(res, 'Xóa loại tư vấn không thành công, vui lòng thử lại', 400);
			}
			ReS(res, {
				status: true,
				message: 'Đã xóa thành công ' + user.name,
			}, 200);
		});

	});
};

module.exports.deleteById = deleteById;
