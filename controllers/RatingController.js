const Rating = require('../models').Rating;
const Doctor = require('../models').Doctor;
const constants = require('./../constants');
const create = async function (req, res) {
	const body = req.body;
	if (!body) {
		return ReE(res, 'Tạo đánh giá thất bại', 400);
	}
	let duplicateRating = await Rating.findOne({patientId: body.patientId, doctorId: body.doctorId});
	if (duplicateRating) {
		await duplicateRating.set(body);
		await duplicateRating.save();
	}
	else {
		let rating = new Rating({
			patientId: body.patientId,
			doctorId: body.doctorId,
			rating: body.rating,
			comment: body.comment
		});
		await rating.save();
	}
	let currentRating = await updateCurrentRating(body.doctorId, res);
	let objDoctor = await Doctor.findOne({doctorId:body.doctorId});
	objDoctor.set({currentRating:currentRating});
	let objDoctorReturn = await objDoctor.save();
	if (objDoctorReturn) {
		return ReS(res, {message: 'Update rating bác sỹ thành công', newRating: objDoctorReturn.currentRating}, 200);
	}
	else {
		return ReE(res, {message: 'Failed'}, 503);
	}
};

module.exports.create = create;

async function updateCurrentRating(doctorId, res) {
	let averagePatientRate = 0;
	let finalRate = 0;
	// update to doctor table
	let updateToDoctor = await Doctor.findOne({doctorId: doctorId});
	if (!updateToDoctor) {
		ReS(res, 'Update Failed', 503);
	}
	let result = await Rating.aggregate([
		{
			$match: {doctorId: {$eq: doctorId}}
		},
		{
			$group: {
				_id: '$doctorId',  //$doctorId is the column name in collection
				totalRating: {
					$sum: '$rating'
				},
				count: {$sum: 1}
			}
		}
	]);
	if (result[0].totalRating > 0) {
		averagePatientRate = ((result[0].totalRating) / (result[0].count));
		finalRate = ((averagePatientRate * (1 - constants.SYSTEM_RATE_PERCENT)) + (updateToDoctor.systemRating * constants.SYSTEM_RATE_PERCENT)).toFixed(2);
	}
	else {
		finalRate = (updateToDoctor.systemRating).toFixed(2);
	}
	return finalRate;
}

const getCommentAndRating = async function (req, res) {
	let pageSize = 0;
	let page = 0;
	if (req.query.pageSize) {
		pageSize = req.query.pageSize * 1;
	}
	if (req.query.page) {
		page = req.query.page * 1;
	}
	try {
		let listComment = await Rating.find({
			doctorId: req.params.doctorId
		})
			.select('patientId rating comment createdAt -_id')
			.sort([['createdAt', -1]])
			.limit(pageSize)
			.skip(pageSize * page)
			.populate({
				path: 'patientId',
				select: 'firstName middleName lastName avatar'
			});
		if (!listComment) {
			return ReE(res, {message: 'Not found list comment'}, 404);
		}
		else {
			return ReS(res, {message: 'Get list comment success', listComment: listComment}, 404);
		}
	} catch (e) {
		return ReE(res, {message: 'Not found list comment'}, 503);
	}
};

module.exports.getCommentAndRating = getCommentAndRating;

const countPatientRatingForDoctor = async function (req, res) {
	try {
		Rating.find({
			doctorId: req.params.doctorId
		}).count(function (err, count) {
			if (err) {
				return ReE(res, {message: 'Error count'}, 503);
			}
			else {
				return ReS(res, {message: 'Count success', numberOfRecordRate: count}, 200);
			}
		});
	}
	catch (e) {
		return ReE(res, {message: 'Error count'}, 503);
	}
};

module.exports.countPatientRatingForDoctor = countPatientRatingForDoctor;

