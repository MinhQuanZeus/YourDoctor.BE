const Specialist = require('../models').Specialist;
const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const multiparty = require('multiparty');
const uuidv4 = require('uuid/v4');
const awsServices = require('../services/AWSService');

const create = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	const form = new multiparty.Form();
	form.parse(req, async (error, fields, files) => {
		if (error) throw new Error(error);
		try {
			let image = '';
			if (files && files.image) {
				const path = files.image[0].path;
				const buffer = fs.readFileSync(path);
				const type = fileType(buffer);
				const timestamp = uuidv4();
				const fileName = `${timestamp}-lg`;
				const data = await awsServices.uploadFile(buffer, fileName, type);
				image = data.Location;
			}
			// Insert database
			const requestData = fields && fields.specialist && fields.specialist[0];
			const body = JSON.parse(requestData);
			if(!body || !body.name){
				return ReE(res, 'ERROR0014', 400);
			}
			let duplicateSpecialist = await Specialist.findOne({name:body.name});
			if(duplicateSpecialist) return ReE(res, 'ERROR0014',409);
			let specialist = new Specialist({
				name: body.name,
				image: image,
				description: body.description,
				listQuestion: body.listQuestion
			});
			await  specialist.save();
			return ReS(res, {message: 'Tạo chuyên khoa thành công', specialist : specialist}, 200);
		} catch (error) {
			return ReE(res, 'Tạo chuyên khoa không thành công, vui lòng thử lại sau', 400);
		}
	});
};

module.exports.create = create;

const getAllSpecialist = async function (req, res) {
	try {
		let listSpecialist = await Specialist.find({ deletionFlag: false });
		if (listSpecialist) {
			return ReS(res, { message: 'Tạo danh sách chuyên khoa thành công', listSpecialist: listSpecialist }, 200);
		}
		else {
			return ReE(res, 'Tạo danh sách chuyên khoa không thành công', 503);
		}
	}
	catch (e) {
		console.log(e);
		return ReE(res, 'Tạo danh sách chuyên khoa không thành công', 503);
	}
};
module.exports.getAllSpecialist = getAllSpecialist;


const getListSpecialist = async function (req, res) {
	try {
		let listSpecialist = await Specialist.find({deletionFlag: false}).select('name image');
		if (listSpecialist) {
			return ReS(res, { message: 'Tạo danh sách chuyên khoa thành công', listSpecialist: listSpecialist }, 200);
		}
		else {
			return ReE(res, 'Tạo danh sách chuyên khoa không thành công', 503);
		}
	}
	catch (e) {
		console.log(e);
		return ReE(res, 'Tạo danh sách chuyên khoa không thành công', 503);
	}
};

module.exports.getListSpecialist = getListSpecialist;

const getDetailSpecialist = async function (req, res) {
	try {
		if (req.params.specialistId) {
			let objSpecialist = await Specialist.findById({ _id: req.params.specialistId });
			if (objSpecialist) {
				return ReS(res, { message: 'Lấy thông tin chuyên khoa thành công', objSpecialist: objSpecialist }, 200);
			}
			else {
				return ReE(res, 'Lấy thông tin chuyên khoa không thành công', 503);
			}
		}
		else {
			return ReE(res, 'Bad request', 400);
		}
	}
	catch (e) {
		console.log(e);
	}
};

module.exports.getDetailSpecialist = getDetailSpecialist;

const update = async function (req, res) {
	const form = new multiparty.Form();
	form.parse(req, async (error, fields, files) => {
		if (error) throw new Error(error);
		try {
			// Insert database
			const requestData = fields && fields.specialist && fields.specialist[0];
			const body = JSON.parse(requestData);
			if(!body || !body.name || !body.id) {
				return ReE(res, 'Vui lòng nhập id và tên chuyên khoa', 400);
			}
			let objSpecialist = await Specialist.findById({ _id: body.id });
			if (!objSpecialist) return ReE(res, 'Không tìm thấy chuyên khoa này', 400);
			let duplicateSpecialist = await Specialist.findOne({name:body.name, _id: { $ne: body.id }});
			if(duplicateSpecialist) return ReE(res, 'Chuyên khoa này đã tồn tại',409);
			let image = '';
			if (files && files.image) {
				const path = files.image[0].path;
				const buffer = fs.readFileSync(path);
				const type = fileType(buffer);
				const timestamp = uuidv4();
				const fileName = `${timestamp}-lg`;
				const data = await uploadFile(buffer, fileName, type);
				image = data.Location;
			}
			const data = {
				name: body.name,
				image: image ? image : objSpecialist.image,
				description: body.description,
				listQuestion: body.listQuestion
			};
			objSpecialist.set(data);
			objSpecialist.save(function (err, updateSpecialistSuccess) {
				if (err) return ReE(res, 'Update failed', 503);
				return ReS(res, {
					message: 'Cập nhật chuyên khoa thành công',
					updateSpecialistSuccess: updateSpecialistSuccess,
				}, 200);
			});
		} catch (error) {
			console.log(error);
			return ReE(res, 'Cập nhật chuyên khoa không thành công, vui lòng thử lại sau', 400);
		}
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

const deleteById = async function (req, res) {
	const updateTime = req.query.updateTime;
	const typeId = req.params.id;
	if (!typeId || !updateTime) {
		ReE(res, {
			status: false,
			message: 'Vui lòng nhập userId và updateTime',
		}, 400);
	}
	Specialist.find({
		_id: typeId,
	}, (err, results) => {
		if (err) {
			return ReE(res, err, 500);
		}

		if (results && results.length === 0) {
			return ReE(res, 'Chuyên khoa không tồn tại', 404);
		}
		let user = results[0];
		if (Number(user.updatedAt) !== Number(updateTime)) {
			return ReE(res, 'Chuyên khoa này đã được chỉnh sửa, vui lòng refresh và thử lại', 400);
		}

		user.deletionFlag = true;
		user.save((error, status) => {
			if (error) {
				return ReE(res, 'Xóa chuyên khoa không thành công, vui lòng thử lại', 400);
			}
			ReS(res, {
				status: true,
				message: 'Đã xóa thành công ' + user.name,
			}, 200);
		});

	});
};

module.exports.deleteById = deleteById;
