const ReportConversation = require('../models').ReportConversation;
const ChatsHistory = require('../models').ChatsHistory;
const VideoCallHistory = require('../models').VideoCallHistory;
const SendNotification = require('./NotificationFCMController');
const phoneService = require('./../services/PhoneService');
const constants = require('./../constants');
const Doctor = require('../models').Doctor;
const Rating = require('../models').Rating;
const User = require('../models').User;
const Notification = require('../models').Notification;
const createReportConveration = async function (req, res) {
	try {
		let body = req.body;
		if (body) {
			let objReportCheck = await ReportConversation.findOne({
				idReporter: body.idReporter,
				idPersonBeingReported: body.idPersonBeingReported,
				idConversation: body.idConversation,
			});
			if (objReportCheck) {
				return ReS(res, {message: 'Trùng lặp! Bạn đã report cuộc tư vấn này.'}, 503);
			}
			else {
				let objReport = new ReportConversation({
					idReporter: body.idReporter,
					idPersonBeingReported: body.idPersonBeingReported,
					reason: body.reason,
					idConversation: body.idConversation,
					type: body.type,
				});
				let objReportReturn = await objReport.save();
				if (objReportReturn) {
					return ReS(res, {status: true, message: 'Gửi báo cáo thành công'}, 200);
				}
				else {
					return ReS(res, {message: 'Gửi báo cáo thất bại'}, 503);
				}
			}
		}
		else {
			return ReS(res, 'Bad request', 400);
		}
	}
	catch (e) {
		return ReS(res, {message: 'Gửi báo cáo thất bại'}, 503);
	}
};

module.exports.createReportConveration = createReportConveration;

const getListReport = async function (req, res) {
	try {
		let listReport = await ReportConversation.find(
			{})
			.select('idReporter idPersonBeingReported reason idConversation type status createdAt updatedAt')
			.populate(
				{
					path: 'idReporter idPersonBeingReported',
					select: 'firstName middleName lastName birthday avatar role',
				},
			);
		if (listReport) {
			return ReS(res, {message: 'Lấy danh sách báo cáo thành công', listReport: listReport}, 200);
		}
		else {
			return ReE(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
		}
	}
	catch (e) {
		return ReE(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
	}
};

module.exports.getListReport = getListReport;

const getReportById = async function (req, res) {
	const id = req.params.reportId;
	if (!id) {
		ReE(res, {message: 'Vui lòng nhập Id'}, 400);
	}
	try {
		let listReport = await ReportConversation.find(
			{
				_id: id,
			})
			.select('idReporter idPersonBeingReported reason punish idConversation type status createdAt updatedAt')
			.populate(
				{
					path: 'idReporter idPersonBeingReported',
					select: 'firstName middleName lastName birthday avatar role',
				},
			);
		if (!listReport || listReport.length === 0) {
			return ReE(res, {message: 'Lấy báo cáo không thành công'}, 403);
		}
		return ReS(res, {message: 'Lấy báo cáo thành công', report: listReport[0]}, 200);
	}
	catch (e) {
		return ReE(res, {message: 'Lấy danh sách báo cáo không thành công'}, 503);
	}
};
module.exports.getReportById = getReportById;

const getDetailReport = async function (req, res) {
	try {

		if (req.query.idConversation && req.query.type) {
			if (req.query.type === 1) {
				let objDetailChat = await ChatsHistory.findById({_id: req.query.idConversation});
				if (objDetailChat) {
					return ReS(res, {message: 'Detail conversation', objDetailChat: objDetailChat}, 200);
				}
				else {
					return ReE(res, {message: 'NOT FOUND'}, 503);
				}
			}
			else if (req.query.type === 2) {
				let objDetailVideo = await VideoCallHistory.findById({_id: req.query.idConversation});
				if (objDetailVideo) {
					return ReS(res, {message: 'Detail conversation', objDetailVideo: objDetailVideo}, 200);
				}
				else {
					return ReE(res, {message: 'NOT FOUND'}, 503);
				}
			}
		}
		else {
			return ReE(res, {message: 'BAD REQUEST'}, 503);
		}
	}
	catch (e) {
		return ReE(res, {message: 'ERROR'}, 503);
	}
};
module.exports.getDetailReport = getDetailReport;

const updateReportConversationProcessing = async function (req, res) {
	try {
		if (req.body.id) {
			let objReport = await ReportConversation.findById({_id: req.body.id});
			if (objReport) {
				objReport.set({status: true});
				let objReportReturn = await objReport.save();
				if (objReportReturn) {
					return ReS(res, {message: 'Xử lý báo cáo thành công', status: true}, 200);
				}
				else {
					return ReE(res, {message: 'Xử lý báo cáo không thành công'}, 503);
				}
			}
			else {
				return ReE(res, {message: 'Xử lý báo cáo không thành công'}, 503);
			}
		}
		else {
			return ReE(res, {message: 'BAD REQUEST'}, 503);
		}
	}
	catch (e) {
		return ReE(res, {message: 'Xử lý báo cáo không thành công'}, 503);
	}
};
module.exports.updateReportConversationProcessing = updateReportConversationProcessing;

const reportPunish = async function (req, res) {
	try {
		let body = req.body;
		if (body) {
			let objReport = await ReportConversation.findById({_id: body.id});
			let objUser = await User.findById({_id: objReport.idPersonBeingReported});
			let objAdmin = await User.findOne({role: constants.ROLE_ADMIN});
			let fullNameAdmin = ' ' + objAdmin.firstName + ' ' + objAdmin.middleName + ' ' + objAdmin.lastName + '';
			let reportLevel = body.type;
			if (objUser.role + '' === '2') {
				// doctor
				let doctorId = objReport.idPersonBeingReported;
				let objDoctor = await Doctor.findOne({doctorId: doctorId});
				switch (reportLevel) {
				case constants.REPORT_PUNISH_LEVEL_ONE: {
					// trừ sao hệ thống
					let newSystemRate = objDoctor.systemRating - 1;
					if (newSystemRate < 1) {
						newSystemRate = 1;
					}
					// tính lại current rate
					let currentRating = await newCurrentRate(objDoctor.id, newSystemRate);
					// set rate
					objDoctor.set({systemRating: newSystemRate, currentRating: currentRating});
					let objDoctorReturn = await objDoctor.save();
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_ONE});
					let objReturn = await objReport.save();
					// add report count
					User.findByIdAndUpdate({_id: doctorId}, {$inc: {reportCount: 1}}, {lean: true}, function (err, resUser) {
						if (err) {
							console.log(err);
						}
					});
					// notification
					if (objDoctorReturn && objReturn) {
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Bạn bị trừ 1 * hệ thống.';
						await sendNotification(objAdmin.id, fullNameAdmin, doctorId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_TWO: {
					// trừ sao hệ thống
					let newSystemRate = objDoctor.systemRating - 1.5;
					if (newSystemRate < 1) {
						newSystemRate = 1;
					}
					// tính lại current rate
					let currentRating = await newCurrentRate(objDoctor.id, newSystemRate);
					// set rate
					objDoctor.set({systemRating: newSystemRate, currentRating: currentRating});
					let objDoctorReturn = await objDoctor.save();
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_TWO});
					let objReturn = await objReport.save();
					// add report count
					User.findOneAndUpdate({id: doctorId}, {$inc: {reportCount: 1}}, {new: true}, function (err, resUser) {
						if (err) {

						}
					});
					// notification
					if (objDoctorReturn && objReturn) {
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Bạn bị trừ 1.5 * hệ thống.';
						await sendNotification(objAdmin.id, fullNameAdmin, doctorId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_THREE: {
					// trừ sao hệ thống
					let newSystemRate = objDoctor.systemRating - 2;
					if (newSystemRate < 1) {
						newSystemRate = 1;
					}
					// tính lại current rate
					let currentRating = await newCurrentRate(objDoctor.id, newSystemRate);
					// set rate
					objDoctor.set({systemRating: newSystemRate, currentRating: currentRating});
					let objDoctorReturn = await objDoctor.save();
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_THREE});
					let objReturn = await objReport.save();
					// add report count
					User.findOneAndUpdate({id: doctorId}, {$inc: {reportCount: 1}}, {new: true}, function (err, resUser) {
						if (err) {

						}
					});
					// notification
					if (objDoctorReturn && objReturn) {
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Bạn bị trừ 2 * hệ thống.';
						await sendNotification(objAdmin.id, fullNameAdmin, doctorId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_FOUR: {
					// trừ sao hệ thống
					let newSystemRate = objDoctor.systemRating - 2.5;
					if (newSystemRate < 1) {
						newSystemRate = 1;
					}
					// tính lại current rate
					let currentRating = await newCurrentRate(objDoctor.id, newSystemRate);
					// set rate
					objDoctor.set({systemRating: newSystemRate, currentRating: currentRating});
					let objDoctorReturn = await objDoctor.save();
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_FOUR});
					let objReturn = await objReport.save();
					// add report count
					User.findOneAndUpdate({id: doctorId}, {$inc: {reportCount: 1}}, {new: true}, function (err, resUser) {
						if (err) {

						}
					});
					// notification
					if (objDoctorReturn && objReturn) {
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Bạn bị trừ 2.5 * hệ thống.';
						await sendNotification(objAdmin.id, fullNameAdmin, doctorId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_FIVE: {
					let message = 'Tài khoản của bạn đã bị khóa do có quá nhiều báo cáo về chất lượng phục vụ không tốt. Mọi thắc mắc gửi về: yourdoctorFU@gmail.com';
					[errors, status] = await to(phoneService.adminSendSMS(objUser.phoneNumber, message));
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_FIVE});
					let objReturn = await objReport.save();
					// add report count
					let newReportCount = objUser.reportCount + 1;
					// set user
					objUser.set({reportCount:newReportCount, status:constants.STATUS_USER_BLOCK});
					let objUserReturn = await objUser.save();
					if (objReturn && objUserReturn) {
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_SIX: {
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_SIX});
					let objReturn = await objReport.save();
					if (objReturn) {
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				default: {

				}
				}
			}
			else if (objUser.role + '' === '1') {
				// patient
				let patientId = objReport.idPersonBeingReported;
				switch (reportLevel) {
				case constants.REPORT_PUNISH_LEVEL_ONE: {
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_ONE});
					let objReturn = await objReport.save();
					// add report count
					User.findByIdAndUpdate({_id: patientId}, {$inc: {reportCount: 1}}, {lean: true}, function (err, resUser) {
						if (err) {
							console.log(err);
						}
					});
					if (objReturn) {
						// notification
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Cảnh báo mức độ 1. Bạn sẽ bị block nếu vi phạm mức độ 5.';
						await sendNotification(objAdmin.id, fullNameAdmin, patientId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_TWO: {
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_TWO});
					let objReturn = await objReport.save();
					// add report count
					User.findByIdAndUpdate({_id: patientId}, {$inc: {reportCount: 1}}, {lean: true}, function (err, resUser) {
						if (err) {
							console.log(err);
						}
					});
					if (objReturn) {
						// notification
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Cảnh báo mức độ 2. Bạn sẽ bị block nếu vi phạm mức độ 5.';
						await sendNotification(objAdmin.id, fullNameAdmin, patientId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_THREE: {
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_THREE});
					let objReturn = await objReport.save();
					// add report count
					User.findByIdAndUpdate({_id: patientId}, {$inc: {reportCount: 1}}, {lean: true}, function (err, resUser) {
						if (err) {
							console.log(err);
						}
					});
					if (objReturn) {
						// notification
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Cảnh báo mức độ 3. Bạn sẽ bị block nếu vi phạm mức độ 5.';
						await sendNotification(objAdmin.id, fullNameAdmin, patientId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_FOUR: {
					// update status report true
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_ONE});
					let objReturn = await objReport.save();
					// add report count
					User.findByIdAndUpdate({_id: patientId}, {$inc: {reportCount: 1}}, {lean: true}, function (err, resUser) {
						if (err) {
							console.log(err);
						}
					});
					if (objReturn) {
						// notification
						let message = 'Chúng tôi đã xem xét tất cả những báo cáo tới bạn. Cảnh báo mức độ 4. Bạn sẽ bị block nếu tiếp tục vi phạm.';
						await sendNotification(objAdmin.id, fullNameAdmin, patientId, constants.NOTIFICATION_TYPE_REPORT, objReport.id, message);
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_FIVE: {
					let message = 'Tài khoản của bạn đã bị khóa do vi phạm qui định sử dụng hệ thống. Mọi thắc mắc gửi về: yourdoctorFU@gmail.com';
					[errors, status] = await to(phoneService.adminSendSMS(objUser.phoneNumber, message));
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_FIVE});
					let objReturn = await objReport.save();
                    // add report count
                    let newReportCount = objUser.reportCount + 1;
                    // set user
                    objUser.set({reportCount:newReportCount, status:constants.STATUS_USER_BLOCK});
                    let objUserReturn = await objUser.save();
					if (objReturn && objUserReturn) {
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công',}, 200);
					}
					break;
				}
				case constants.REPORT_PUNISH_LEVEL_SIX: {
					objReport.set({status: true, punish: constants.REPORT_PUNISH_LEVEL_SIX});
					let objReturn = await objReport.save();
					if (objReturn) {
						return ReS(res, {success: true, message: 'Xử lý báo cáo thành công'}, 200);
					}
					break;
				}
				default: {

				}
				}
			}
		}
		else {
			return ReE(res, {message: 'BAD REQUEST'}, 400);
		}
	}
	catch (e) {
		console.log(e);
		return ReE(res, {message: 'ERROR'}, 503);
	}
};

module.exports.reportPunish = reportPunish;

async function newCurrentRate(doctorId, newSystemRate) {
	let averagePatientRate = 0;
	let finalRate = 0;
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
	if (result.length > 0) {
		averagePatientRate = ((result[0].totalRating) / (result[0].count));
		finalRate = ((averagePatientRate * (1 - constants.SYSTEM_RATE_PERCENT)) + (newSystemRate * constants.SYSTEM_RATE_PERCENT)).toFixed(2);
	}
	else {
		finalRate = newSystemRate;
	}
	console.log(finalRate);
	return finalRate;
}

async function sendNotification(senderId, nameSender, receiverId, type, storageId, message) {
	let notification = {
		senderId: senderId,
		nameSender: nameSender,
		receiverId: receiverId,
		type: type,
		storageId: storageId,
		message: message,
	};
	await createNotification(notification);

	let payLoad = {
		data: {
			senderId: senderId,
			nameSender: nameSender,
			receiverId: receiverId,
			type: type + '',
			storageId: storageId,
			message: message,
			createTime: Date.now().toString(),
		},
	};
	// send
	await SendNotification.sendNotification(receiverId, payLoad);
}

const createNotification = async function (body) {
	try {
		let notification = Notification({
			senderId: body.senderId,
			nameSender: body.nameSender,
			receiverId: body.receiverId,
			type: body.type,
			storageId: body.storageId,
			message: body.message,
		});
		await notification.save(function (err, success) {
			if (err) {
				console.log(err);
			}
		});
	}
	catch (e) {
		console.log(e);
	}
};

async function getUser(userId) {
	let fullName;
	let objUser = await User.findById({_id: userId});
	if (objUser) {
		fullName = ' ' + objUser.firstName + ' ' + objUser.middleName + ' ' + objUser.lastName + '';
	}
	return fullName;
}
