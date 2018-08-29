const ChatsHistory = require('../models').ChatsHistory;
const TypeAdvisory = require('../models').TypeAdvisory;
const PaymentsHistory = require('../models').PaymentsHistory;
const User = require('../models').User;
const SendNotification = require('./NotificationFCMController');
const Notification = require('../models').Notification;
const constants = require('./../constants');

const create = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	const body = req.body;
	if (!body.patientId || !body.doctorId || !body.typeAdvisoryID ||
        !body.paymentPatientID || !body.contentTopic) {
		return ReE(res, 'ERROR0028', 400);
	}
	try {
		let dateApproval = new Date();
		dateApproval.setHours(dateApproval.getHours() + constants.DEADLINE_TIME_REPLY);
		let chatHistory = new ChatsHistory({
			contentTopic: body.contentTopic,
			patientId: body.patientId,
			doctorId: body.doctorId,
			records: body.records,
			status: body.status,
			timeReplyApproval: dateApproval,
			typeAdvisoryID: body.typeAdvisoryID,
			paymentPatientID: body.paymentPatientID,
			paymentDoctorID: body.paymentDoctorID,
			deletionFlag: body.deletionFlag
		});
		await  chatHistory.save();
		// trừ tiền user
		// get payment
		let objUser = await User.findById({_id: body.patientId});
		let objPayment = await PaymentsHistory.findById({_id: chatHistory.paymentPatientID});
		// update remain money
		let newRemainMoney = objUser.remainMoney - objPayment.amount;
		objUser.set({remainMoney: newRemainMoney});
		await objUser.save(function (err, success) {
			if (err) {
				ReE(res, err.toString(), 503);
			}
		});

		objPayment.set({status: constants.PAYMENT_SUCCESS});
		await objPayment.save(function (err, success) {
			if (err) {
				ReE(res, err.toString(), 503);
			}
		});

		let fullName;
		if (objUser) {
			fullName = ' ' + objUser.firstName + ' ' + objUser.middleName + ' ' + objUser.lastName + '';
		}
		// create data noti for doctor
		let payLoad = {
			data: {
				senderId: chatHistory.patientId,
				nameSender: fullName,
				receiverId: chatHistory.doctorId,
				type: constants.NOTIFICATION_TYPE_CHAT,
				storageId: chatHistory.id,
				message: '' + fullName + ' vừa tạo yêu cầu tư vấn qua nhắn tin với bạn',
				createTime: Date.now().toString()
			}
		};
		// send
		await SendNotification.sendNotification(chatHistory.doctorId, payLoad);
		// save
		let notificationDoctor = {
			senderId: chatHistory.patientId,
			nameSender: fullName,
			receiverId: chatHistory.doctorId,
			type: constants.NOTIFICATION_TYPE_CHAT,
			storageId: chatHistory.id,
			message: '' + fullName + ' vừa tạo yêu cầu tư vấn qua nhắn tin với bạn',
		};
		await createNotification(notificationDoctor);

		// create data noti for patients
		let fullNameDoctor = await getUser(chatHistory.doctorId);
		let payLoadForPatient = {
			data: {
				senderId: chatHistory.doctorId,
				nameSender: fullNameDoctor,
				receiverId: chatHistory.patientId,
				type: constants.NOTIFICATION_TYPE_PAYMENT,
				storageId: objPayment.id,
				message: 'Bạn vừa tạo một yêu cầu tư vấn với bác sỹ ' + fullNameDoctor + '. Bạn đã thanh toán: ' + objPayment.amount + 'VND. Số tiền bạn có hiện tại: ' + Math.round(newRemainMoney) + 'VND.',
				createTime: Date.now().toString()
			}
		};
		// send
		await SendNotification.sendNotification(chatHistory.patientId, payLoadForPatient);
		// save
		let notificationPatient = {
			senderId: chatHistory.doctorId,
			nameSender: fullNameDoctor,
			receiverId: chatHistory.patientId,
			type: constants.NOTIFICATION_TYPE_PAYMENT,
			storageId: objPayment.id,
			message: 'Bạn vừa tạo một yêu cầu tư vấn ' + fullNameDoctor + '. Bạn đã thanh toán: ' + objPayment.amount + 'VND.Số tiền bạn có hiện tại: ' + Math.round(newRemainMoney) + 'VND.'
		};
		await  createNotification(notificationPatient);
		return ReS(res, {message: 'Tạo cuộc tư vấn thành công', chatHistory: chatHistory}, 200);
	} catch (e) {
		ReS(res, e.message, 503);
	}
};

module.exports.create = create;

const updateRecord = async function (req, res) {
	let data = req.body;
	if (!data.id) TE(err.message);
	try {
		// check limit record
		let pushRecord = await ChatsHistory.findOne({_id: data.id});
		let objTypeAdvisory = await TypeAdvisory.findOne({_id: pushRecord.typeAdvisoryID});
		if (!objTypeAdvisory) ReS(res, 'Không tìm thấy type', 503);
		// loop check
		let countRecord = 0;
		for (let i = 0; i < pushRecord.records.length; i++) {

			if (pushRecord.records[i].recorderID === pushRecord.patientId) {
				countRecord++;
			}
		}
		if (countRecord >= (objTypeAdvisory.limitNumberRecords * 1)) {
			return ReE(res, 'ERROR0039', 503);
		}
		else {
			// update
			pushRecord.records.push(data.records);
			await pushRecord.save(function (err, pushRecord) {
				if (err) return ReE(res, 'ERROR0030', 503);
				return ReS(res, {message: 'Update tin nhắn thành công', pushRecord: pushRecord}, 200);
			});
		}
	} catch (e) {
		console.log(e);
	}
};

module.exports.updateRecord = updateRecord;

const getAllConversationByPatient = async function (req, res) {
	if (!req.params.patientId) {
		return ReS(res, {message: 'Bad request'}, 400);
	}
	let pageSize = 0;
	let page = 0;
	if (req.query.pageSize) {
		pageSize = req.query.pageSize * 1;
	}
	if (req.query.page) {
		page = req.query.page * 1;
	}
	if(req.query.pageSize && req.query.page){
		try {
			ChatsHistory.find({
				patientId: req.params.patientId,
				deletionFlag: {$ne: constants.CHAT_HISTORY_PATIENT_DELETE}
			})
				.select('contentTopic doctorId records status createdAt updatedAt')
				.sort([['status', 'ascending'], ['updatedAt', -1]])
				.limit(pageSize)
				.skip(pageSize * page)
				.populate(
					{
						path: 'doctorId',
						select: 'firstName middleName lastName avatar'
					}
				).exec(function (err, listChatsHistory) {
					if (err) {
						return ReS(res, {message: 'Not found'}, 503);
					}
					return ReS(res, {
						message: 'Tạo danh sách lịch sử chat thành công',
						listChatsHistory: listChatsHistory
					}, 200);
				});
		} catch (e) {
			return ReS(res, {message: 'Not found'}, 503);
		}
	}
	else {
		try {
			ChatsHistory.find({
				patientId: req.params.patientId,
				deletionFlag: {$ne: constants.CHAT_HISTORY_PATIENT_DELETE}
			})
				.select('contentTopic doctorId records status createdAt updatedAt')
				.sort([['status', 'ascending'], ['updatedAt', -1]])
				.populate(
					{
						path: 'doctorId',
						select: 'firstName middleName lastName avatar'
					}
				).exec(function (err, listChatsHistory) {
					if (err) {
						return ReS(res, {message: 'Not found'}, 503);
					}
					return ReS(res, {
						message: 'Tạo danh sách lịch sử chat thành công',
						listChatsHistory: listChatsHistory
					}, 200);
				});
		} catch (e) {
			return ReS(res, {message: 'Not found'}, 503);
		}
	}

};

module.exports.getAllConversationByPatient = getAllConversationByPatient;

const getAllConversationByDoctor = async function (req, res) {
	if (!req.params.doctorId) {
		return ReS(res, {message: 'Bad request'}, 400);
	}
	let pageSize = 0;
	let page = 0;
	if (req.query.pageSize) {
		pageSize = req.query.pageSize * 1;
	}
	if (req.query.page) {
		page = req.query.page * 1;
	}
	if(req.query.pageSize && req.query.page){
		try {
			ChatsHistory.find({
				doctorId: req.params.doctorId,
				deletionFlag: {$ne: constants.CHAT_HISTORY_DOCTOR_DELETE}
			})
				.select('contentTopic patientId records status createdAt updatedAt')
				.sort([['status', 1], ['updatedAt', -1]])
				.limit(pageSize)
				.skip(pageSize * page)
				.populate(
					{
						path: 'patientId',
						select: 'firstName middleName lastName avatar'
					}
				).exec(function (err, listChatsHistory) {
					if (err) {
						return ReS(res, {message: 'Not found'}, 503);
					}
					return ReS(res, {
						message: 'Tạo danh sách lịch sử chat thành công',
						listChatsHistory: listChatsHistory
					}, 200);
				});
		} catch (e) {
			return ReS(res, {message: 'Not found'}, 503);
		}
	}
	else {
		try {
			ChatsHistory.find({
				doctorId: req.params.doctorId,
				deletionFlag: {$ne: constants.CHAT_HISTORY_DOCTOR_DELETE}
			})
				.select('contentTopic patientId records status createdAt updatedAt')
				.sort([['status', 1], ['updatedAt', -1]])
				.populate(
					{
						path: 'patientId',
						select: 'firstName middleName lastName avatar'
					}
				).exec(function (err, listChatsHistory) {
					if (err) {
						return ReS(res, {message: 'Not found'}, 503);
					}
					return ReS(res, {
						message: 'Tạo danh sách lịch sử chat thành công',
						listChatsHistory: listChatsHistory
					}, 200);
				});
		} catch (e) {
			return ReS(res, {message: 'Not found'}, 503);
		}
	}
};

module.exports.getAllConversationByDoctor = getAllConversationByDoctor;

const getConversationByID = async function (req, res) {
	console.log(req.params.id);
	try {
		let objConversation = await ChatsHistory.findById({
			_id: req.params.id
		}).populate({
			path: 'patientId doctorId',
			select: 'firstName middleName lastName avatar'
		});
		if (!objConversation) {
			return ReE(res, 'Không tìm thấy cuộc trò chuyện', 404);
		}
		else {
			return ReS(res, {message: 'Lấy thông tin cuộc tư vấn thành công', objConversation: objConversation}, 200);
		}
	} catch (e) {
		console.log(e);
	}
};

module.exports.getConversationByID = getConversationByID;

const checkDoctorReply = async function (req, res) {
	let body = req.body;
	if (!body) {
		return ReE(res, 'Bad request', 400);
	}
	let arrayChatHistoryCheckFailed = [];
	for (let k = 0; k < body.listId.length; k++) {
		try {
			let objChatHistory = await ChatsHistory.findById({_id: body.listId[k]});
			// kiểm tra sự tồn tại của của cuộc trò chuyện
			if (!objChatHistory) {
				// nếu k tồn tại return
				arrayChatHistoryCheckFailed.push(body.listId[k]);
			}
			else {
				// nếu tồn tại check tiếp
				// Trường hợp cuộc tư vấn chưa kết thúc
				if (objChatHistory.status * 1 === constants.STATUS_CONVERSATION_TALKING) {
					// k có record
					if (objChatHistory.records.length === 0) {
						// chưa trả lời
						// get objPayment bệnh nhân
						let objPaymentPatient = await PaymentsHistory.findById({_id: objChatHistory.paymentPatientID});
						// get objUser bệnh nhân => trả lại tiền
						let objUser = await User.findById({_id: objChatHistory.patientId});
						let amount = objPaymentPatient.amount * 1;
						let remain_money = objUser.remainMoney * 1 + amount;
						// update remain_money
						objUser.set({remainMoney: remain_money});
						await objUser.save();
						// update payment history
						objPaymentPatient.set({amount: 0, remainMoney: remain_money, status: constants.PAYMENT_FAILED});
						await objPaymentPatient.save();
						// update status cuộc tư vấn
						objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
						await objChatHistory.save();
						// notification cho bác sỹ và bệnh nhân.
						// get name doctor
						let fullNameDoctor = await getUser(objChatHistory.doctorId);
						// create data noti for patients
						let payLoadForPatient = {
							data: {
								senderId: objChatHistory.doctorId,
								nameSender: fullNameDoctor,
								receiveId: objChatHistory.patientId,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: objPaymentPatient.id,
								message: 'Cuộc tư vấn với bác sỹ ' + fullNameDoctor + ' đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: ' + amount + 'VND. Số tiền bạn có hiện tại: ' + Math.round(remain_money) + 'VND',
								remainMoney: remain_money + '',
								createTime: Date.now().toString()
							}
						};
						// send
						await SendNotification.sendNotification(objChatHistory.patientId, payLoadForPatient);
						// save to notification
						let objNotificationPatientToSave = {
							senderId: objChatHistory.doctorId,
							nameSender: fullNameDoctor,
							receiveId: objChatHistory.patientId,
							type: constants.NOTIFICATION_TYPE_PAYMENT,
							storageId: objPaymentPatient.id,
							message: 'Cuộc tư vấn với bác sỹ ' + fullNameDoctor + ' đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: ' + amount + 'VND. Số tiền bạn có hiện tại: ' + Math.round(remain_money) + 'VND',
						};
						await createNotification(objNotificationPatientToSave);

						// send notification for doctor
						let fullNamePatient = await getUser(objChatHistory.patientId);
						// create data noti for patients
						let payLoadForDoctor = {
							data: {
								senderId: objChatHistory.patientId,
								nameSender: fullNamePatient,
								receiveId: objChatHistory.doctorId,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: objChatHistory.id,
								message: 'Cuộc tư vấn với bệnh nhân ' + fullNamePatient + ' đã kết thúc do qua thời gian trả lời',
								createTime: Date.now().toString()
							}
						};
						// send
						await SendNotification.sendNotification(objChatHistory.doctorId, payLoadForDoctor);
						// save to notification
						let objNotificationDoctorToSave = {
							senderId: objChatHistory.patientId,
							nameSender: fullNamePatient,
							receiveId: objChatHistory.doctorId,
							type: constants.NOTIFICATION_TYPE_PAYMENT,
							storageId: objChatHistory.id,
							message: 'Cuộc tư vấn với bệnh nhân ' + fullNamePatient + ' đã kết thúc do qua thời gian trả lời',
						};
						await createNotification(objNotificationDoctorToSave);
					} else {
						let isDoctorRely = false;
						for (let i = 0; i < objChatHistory.records.length; i++) {
							if (objChatHistory.records[i].recorderID === objChatHistory.doctorId) {
								isDoctorRely = true;
							}
						}

						if (isDoctorRely === true) {
							let paymentIdDoctor = await createPaymentForDoctor(objChatHistory.id);
							// update status done cho cuộc tư vấn, update payment id doctor vào cuộc chat
							objChatHistory.set({
								status: constants.STATUS_CONVERSATION_FINISH,
								paymentDoctorID: paymentIdDoctor.id
							});
							await objChatHistory.save();
							//
							let fullName = await getUser(objChatHistory.patientId);
							// bạn nhận được xx tiền, số tiền hiện tại là xxxx
							let objNotificationToSave = {
								senderId: objChatHistory.patientId,
								nameSender: fullName,
								receiveId: objChatHistory.doctorId,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: objChatHistory.id,
								remainMoney: paymentIdDoctor.remainMoney+'',
								message: 'Cuộc tư vấn với bệnh nhân ' + fullName + ' đã kết thúc. Bạn nhận được: ' + paymentIdDoctor.amount + ' VND.' + ' Số tiền bạn có hiện tại: ' + Math.round(paymentIdDoctor.remainMoney) + 'VND',
							};
							console.log(objNotificationToSave);
							// save to notification table
							await createNotification(objNotificationToSave);

							let payLoad = {
								data: {
									senderId: objChatHistory.patientId,
									nameSender: fullName,
									receiveId: objChatHistory.doctorId,
									type: constants.NOTIFICATION_TYPE_PAYMENT,
									storageId: ChatsHistory.id,
									message: 'Cuộc tư vấn với bệnh nhân ' + fullName + 'đã kết thúc. Bạn nhận được: ' + paymentIdDoctor.amount + ' VND.' + ' Số tiền bạn có hiện tại: ' + Math.round(paymentIdDoctor.remainMoney) + 'VND',
									createTime: Date.now().toString()
								}
							};
							// send notification cho bác sỹ
							await SendNotification.sendNotification(objChatHistory.doctorId, payLoad);

							/// thông báo notification cho bệnh nhân
							let fullNameDoctor = await getUser(objChatHistory.doctorId);
							// save to notification table
							let objNotificationPatientToSave = {
								senderId: objChatHistory.doctorId,
								nameSender: fullNameDoctor,
								receiveId: objChatHistory.patientId,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: objChatHistory.id,
								message: 'Cuộc tư vấn với bác sỹ ' + fullNameDoctor + ' đã kết thúc.',
							};
							await createNotification(objNotificationPatientToSave);
							let payLoadPatient = {
								data: {
									senderId: objChatHistory.doctorId,
									nameSender: fullNameDoctor,
									receiveId: objChatHistory.patientId,
									type: constants.NOTIFICATION_TYPE_PAYMENT,
									storageId: objChatHistory.id,
									message: 'Cuộc tư vấn với bác sỹ ' + fullNameDoctor + ' đã kết thúc.',
									createTime: Date.now().toString()
								}
							};
							// send notification
							await SendNotification.sendNotification(objChatHistory.doctorId, payLoadPatient);
						} else {
							let objPaymentPatient = await PaymentsHistory.findById({_id: objChatHistory.paymentPatientID});
							// get objUser bệnh nhân => trả lại tiền
							let objUser = await User.findById({_id: objChatHistory.patientId});
							let amount = objPaymentPatient.amount * 1;
							let remain_money = objUser.remainMoney * 1 + amount;
							// update remain_money
							objUser.set({remainMoney: remain_money});
							await objUser.save();
							// update payment history
							objPaymentPatient.set({
								amount: 0,
								remainMoney: remain_money,
								status: constants.PAYMENT_FAILED
							});
							await objPaymentPatient.save();
							// update status cuộc tư vấn
							objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
							await objChatHistory.save();
							// notification cho bác sỹ và bệnh nhân.
							// get name doctor
							let fullNameDoctor = await getUser(objChatHistory.doctorId);
							// create data noti for patients
							let payLoadForPatient = {
								data: {
									senderId: objChatHistory.doctorId,
									nameSender: fullNameDoctor,
									receiveId: objChatHistory.patientId,
									type: constants.NOTIFICATION_TYPE_PAYMENT,
									storageId: objPaymentPatient.id,
									remainMoney: remain_money+'',
									message: 'Cuộc tư vấn với bác sỹ ' + fullNameDoctor + ' đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: ' + amount + 'VND. Số tiền bạn có hiện tại: ' + Math.round(remain_money) + 'VND',
									createTime: Date.now().toString()
								}
							};
							// send
							await SendNotification.sendNotification(objChatHistory.patientId, payLoadForPatient);
							// save to notification
							let objNotificationPatientToSave = {
								senderId: objChatHistory.doctorId,
								nameSender: fullNameDoctor,
								receiveId: objChatHistory.patientId,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: objPaymentPatient.id,
								message: 'Cuộc tư vấn với bác sỹ ' + fullNameDoctor + ' đã bị hủy do quá thời gian trả lời. Bạn được hoàn trả: ' + amount + 'VND. Số tiền bạn có hiện tại: ' + Math.round(remain_money) + 'VND',
							};
							await createNotification(objNotificationPatientToSave);
						}
					}
				}
			}
		}
		catch (e) {
			console.log(e.toString());
			arrayChatHistoryCheckFailed.push(body.listId[k]);
		}
	}
	return ReS(res, {
		message: 'Danh sách ID chưa thể check',
		arrayChatHistoryCheckFailed: arrayChatHistoryCheckFailed
	}, 200);

	//return ReS(res, {message: 'Result check', arrayResultCheck: arrayResultCheck}, 200);
};

module.exports.checkDoctorReply = checkDoctorReply;

const getListConversationPending = async function (req, res) {
	try {
		if (req.params.patientId) {
			let listPending = await ChatsHistory.find({
				patientId: req.params.patientId,
				status: constants.STATUS_CONVERSATION_TALKING
			}).select('id createdAt');
			let finalListPending = [];
			if (listPending) {
				for (let objPending of listPending) {
					let created_date = new Date(objPending.createdAt);
					let objPendingToPush = {
						_id: objPending.id,
						createdAt: objPending.createdAt,
						timeRemain: Date.now() - created_date.getTime()
					};
					finalListPending.push(objPendingToPush);
				}
				return ReS(res, {message: 'Danh sách cuộc tư vấn pending', listPending: finalListPending}, 200);
			} else {
				return ReE(res, 'Not found', 503);
			}
		}
		else {
			return ReE(res, 'Bad request', 400);
		}
	}
	catch (e) {
		console.log(e);
		return ReE(res, 'Not found', 503);
	}
};

module.exports.getListConversationPending = getListConversationPending;

//
const createNotification = async function (body) {
	try {
		let notification = Notification({
			senderId: body.senderId,
			nameSender: body.nameSender,
			receiverId: body.receiverId,
			type: body.type,
			storageId: body.storageId,
			message: body.message
		});
		await  notification.save(function (err, success) {
			if (err) {
				console.log(err);
			}
		});
	}
	catch (e) {
		console.log(e);
	}
};

///
async function createPaymentForDoctor(conversationID) {
	let paymentID;
	// get conversation
	let objChatHistory = await ChatsHistory.findById({_id: conversationID});
	if (objChatHistory) {
		// get amount of type advisory
		let objTypeAdvisory = await TypeAdvisory.findById({_id: objChatHistory.typeAdvisoryID});
		// get user
		let objUser = await User.findById({_id: objChatHistory.doctorId});
		// calculate remain money
		let remainMoney = objUser.remainMoney * 1 + objTypeAdvisory.price * 1 * constants.PERCENT_PAY_FOR_DOCTOR;
		try {
			let objPaymentHistory = PaymentsHistory({
				userID: objChatHistory.doctorId,
				amount: objTypeAdvisory.price * 1 * constants.PERCENT_PAY_FOR_DOCTOR,
				remainMoney: remainMoney,
                fromUser: objChatHistory.patientId,
				typeAdvisoryID: objChatHistory.typeAdvisoryID,
				status: constants.PAYMENT_SUCCESS
			});
			// update remain money to User
			objUser.set({remainMoney: remainMoney});
			await objUser.save(function (err, objUser) {
				if (err) {

				}
			});
			// save to payment table
			await objPaymentHistory.save(function (err, objPaymentHistory) {
			});
			paymentID = objPaymentHistory;
		}
		catch (e) {
		}
	}
	return paymentID;
}

const checkStatusChatsHistory = async function (req, res) {
	let arrayResult = [];
	let body = req.body;
	if (!body) {
		return ReE(res, 'Bad request', 400);
	}
	else {
		for (let i = 0; i < body.listId.length; i++) {
			let objChatHistory = await ChatsHistory.findById({_id: body.listId[i]});
			if (!objChatHistory) {
				return ReE(res, 'Not found', 404);
			}
			else {
				if (objChatHistory.status * 1 !== constants.STATUS_CONVERSATION_FINISH) {
					let objChatDone = {
						ChatsHistoryID: objChatHistory.id,
						statusDone: false,
						message: 'Cuộc tư vấn này chưa kết thúc'
					};
					arrayResult.push(objChatDone);
				}
			}
		}
	}
	return ReS(res, {message: 'Result check', arrayResult: arrayResult}, 200);
};

module.exports.checkStatusChatsHistory = checkStatusChatsHistory;

async function getUser(userId) {
	let fullName;
	let objUser = await User.findById({_id: userId});
	if (objUser) {
		fullName = ' ' + objUser.firstName + ' ' + objUser.middleName + ' ' + objUser.lastName + '';
	}
	return fullName;
}

const doctorDenyRequestChat = async function (req, res) {
	try {
		if (req.params.id) {
			let objChatHistory = await ChatsHistory.findById({_id: req.params.id});
			if (objChatHistory) {
				// get payment
				let objPayment = await PaymentsHistory.findById({_id: objChatHistory.paymentPatientID});
				// get objUser
				let objUser = await User.findById({_id: objChatHistory.patientId});
				// update remainMoney
				let returnRemainMoney = objUser.remainMoney + objPayment.amount;
				objUser.set({remainMoney: returnRemainMoney});
				let objUserReturn = await objUser.save();
				// update status chat history
				objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
				let objChatHistoryReturn = await objChatHistory.save();
				// update payment
				objPayment.set({amount: 0, remainMoney: returnRemainMoney, status: constants.PAYMENT_FAILED});
				let objPaymentReturn = await objPayment.save();
				if (objUserReturn && objChatHistoryReturn && objPaymentReturn) {
					// send notification to patient
					let fullNameDoctor = await getUser(objChatHistory.doctorId);
					let payLoadPatient = {
						data: {
							senderId: objChatHistory.doctorId,
							nameSender: fullNameDoctor,
							receiverId: objChatHistory.patientId,
							type: constants.NOTIFICATION_TYPE_PAYMENT,
							storageId: objPayment.id,
							remainMoney: returnRemainMoney+'',
							message: 'Bác sỹ ' + fullNameDoctor + ' đã từ chối cuộc tư vấn với bạn vì lý do cá nhân. Bạn được hoàn trả lại toàn bộ phí tư vấn.',
							createTime: Date.now().toString()
						}
					};
					// send
					await SendNotification.sendNotification(objChatHistory.patientId, payLoadPatient);
					// save
					let notificationPatient = {
						senderId: objChatHistory.doctorId,
						nameSender: fullNameDoctor,
						receiverId: objChatHistory.patientId,
						type: constants.NOTIFICATION_TYPE_PAYMENT,
						storageId: objPayment.id,
						message: 'Bác sỹ ' + fullNameDoctor + ' đã từ chối cuộc tư vấn với bạn vì lý do cá nhân. Bạn được hoàn trả lại toàn bộ phí tư vấn.',
					};
					await createNotification(notificationPatient);

					return ReS(res, {status: true, message: 'Từ chối tư vấn thành công'}, 200);
				}
			}
			else {
				return ReE(res, 'Cuộc tư vấn không tồn tại.', 400);
			}
		}
		else {
			return ReE(res, 'Bad request', 400);
		}
	}
	catch (e) {
		return ReE(res, 'Có lỗi xảy ra', 400);
	}
};

module.exports.doctorDenyRequestChat = doctorDenyRequestChat;
