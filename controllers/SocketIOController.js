module.exports = function (io) {
	let doctorsOnline = [];

	var sequenceNumberByClient = new Map();

	// event fired every time a new client connects:
	io.sockets.on('connection', (socket) => {
		//let sender, conversationID, type, value;

		// initialize this client's sequence number
		// ng dung emit create add vao 1 map
		socket.on('addUser', function (userID, type) {
			socket.userID = userID;
			if (type === 2) {
				if (!doctorsOnline.includes(userID)) {
					doctorsOnline.push(userID);
				}
				socket.type = 2;
			} else {
				socket.type = 1;
			}
			console.log('Client connected User id ' + socket.userID);
			console.log('Client connected socket id ' + socket.id);
			console.log('Client connected socket type ' + socket.type);
			sequenceNumberByClient.set(userID, socket);
		});

		socket.on('getDoctorOnline', function () {
			console.log('lisOnline', JSON.stringify(doctorsOnline));
			socket.emit('getDoctorOnline', JSON.stringify(doctorsOnline));
		});

		// create room
		socket.on('createRoom', function (room) {
			socket.room = room;
			// join room
			//socket.join(room);
			console.log('User joined the room: ' + socket.room);
		});

		socket.on('joinRoom', function (roomID) {
			//socket.join(roomID);
			socket.room = roomID;
			sequenceNumberByClient.set(socket.userID, socket);
		});

		socket.on('leaveRoom', function (roomID) {
			//socket.leave(roomID);
			socket.room = null;
			sequenceNumberByClient.set(socket.userID, socket);
		});


		socket.on('sendMessage', async function (reqSender, reqReceiver, reqConversationID, reqType, reqValue) {
			let send = socket;
			let receive = sequenceNumberByClient.get(reqReceiver);

			if (receive != null) {
				console.log('check receiver' + receive.userID + ', ' + receive.room);

				if (reqConversationID !== receive.room) {
					receive = null;
				}
			}

			let megSender = {
				senderID: reqSender,
				type: reqType,
				value: reqValue,
				createTime: Date.now().toString()
			};
			// check status
			if (await getStatus(reqConversationID) === constants.STATUS_CONVERSATION_FINISH) {
				// cuộc tư vấn đã kết thúc
				if (send != null) {
					send.emit('conversationDone', 'Cuộc tư vấn đã kết thúc');
				}
			}
			// cuộc tư vấn chưa kết thúc
			else {
				// case 1: tin nhắn trong giới hạn của gói câu hỏi: update success
				// collect data
				let records = {
					recorderID: reqSender,
					type: reqType,
					value: reqValue
				};
				let objectUpdate = {
					id: reqConversationID,
					records: records
				};
				// update record chat success
				if (await updateRecord(objectUpdate)) {
					// check sender
					if (send != null) {
						send.emit('newMessage', {data: JSON.stringify(megSender)});
					} else {
					}
					// check receiver
					if (receive != null) {
						receive.emit('newMessage', {data: JSON.stringify(megSender)});
					} else {
						let fullName = await getUser(reqSender);
						let payLoad = {
							data: {
								senderId: reqSender,
								nameSender: fullName,
								receiverId: reqReceiver,
								type: constants.NOTIFICATION_TYPE_CHAT,
								storageId: reqConversationID,
								message: '' + fullName + ' vừa nhắn tin cho bạn',
								createTime: Date.now().toString()
							}
						};
						SendNotification.sendNotification(reqReceiver, payLoad);
						// save to notification table
						let objNotificationToSave = {
							senderId: reqSender,
							nameSender: fullName,
							receiverId: reqReceiver,
							type: constants.NOTIFICATION_TYPE_CHAT,
							storageId: reqConversationID,
							message: '' + fullName + ' vừa nhắn tin cho bạn',
						};
						await createNotification(objNotificationToSave);
					}
				}
				// update record chat failed do vượt quá giới hạn gói câu hỏi
				else {
					let paymentIdDoctor = await createPaymentForDoctor(reqConversationID);
					//let objPaymentDoctor = await PaymentsHistory.findById({_id: paymentIdDoctor})

					if (send != null) {
						console.log('ng nhan tin' + send + '');
						send.emit('errorUpdate', 'Số tin nhắn vượt qua giới hạn của gói tư vấn - Cuộc tư vấn đã kết thúc.');
					}
					if (receive != null) {
						// json: số tiền nhận được, số tiền hiện tại đang có
						console.log('ng nhan tin' + send + '');
						receive.emit('finishConversation', 'Cuộc tư vấn đã kết thúc. Bạn nhận được: ' + paymentIdDoctor.amount + 'VND. Số tiền bạn có hiện tại: ' + Math.round(paymentIdDoctor.remainMoney) + 'VND');
					}
					else {
						let fullName = await getUser(reqSender);
						// bạn nhận được xx tiền, số tiền hiện tại là xxxx
						let payLoad = {
							data: {
								senderId: reqSender,
								nameSender: fullName,
								receiverId: reqReceiver,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: reqConversationID,
								remainMoney: paymentIdDoctor.remainMoney + '',
								message: 'Bạn nhận được: ' + paymentIdDoctor.amount + 'VND.' + ' Số tiền bạn có hiện tại: ' + paymentIdDoctor.remainMoney + 'VND',
								createTime: Date.now().toString()
							}
						};
						// send notification
						await SendNotification.sendNotification(reqReceiver, payLoad);
						// save to notification table
						let objNotificationToSave = {
							senderId: reqSender,
							nameSender: fullName,
							receiverId: reqReceiver,
							type: constants.NOTIFICATION_TYPE_PAYMENT,
							storageId: reqConversationID,
							message: 'Bạn nhận được: ' + paymentIdDoctor.amount + 'VND.' + ' Số tiền bạn có hiện tại: ' + paymentIdDoctor.remainMoney + 'VND',
						};
						await createNotification(objNotificationToSave);
					}
				}
			}
		});

		socket.on('doneConversation', async function (reqSender, reqReceiver, reqConversationID) {

			let send = socket;
			//let send = sequenceNumberByClient.get(reqSender);
			let receive = sequenceNumberByClient.get(reqReceiver);
			if (receive != null) {
				console.log('check receiver' + receive.userID + ', ' + receive.room);

				if (reqConversationID !== receive.room) {
					receive = null;
				}
			}
			//Update status cua chat history là done (status : 2)

			if (updateStatus(reqConversationID)) {
				let paymentIdDoctor = await createPaymentForDoctor(reqConversationID);
				if (paymentIdDoctor) {
					// emit to sender
					if (send != null) {
						send.emit('finishConversation', 'Cuộc tư vấn đã kết thúc');
					}
					// emit to receiver
					if (receive != null) {
						// json: số tiền nhận được, số tiền hiện tại đang có
						receive.emit('finishConversation', 'Cuộc tư vấn đã kết thúc. Bạn nhận được: ' + paymentIdDoctor.amount + 'VND. Số tiền bạn có hiện tại: ' + paymentIdDoctor.remainMoney + 'VND');

					} else {
						let fullName = await getUser(reqSender);
						// bạn nhận được xx tiền, số tiền hiện tại là xxxx
						// save to notification table
						let objNotificationToSave = {
							senderId: reqSender,
							nameSender: fullName,
							receiverId: reqReceiver,
							type: constants.NOTIFICATION_TYPE_PAYMENT,
							storageId: reqConversationID,
							message: 'Bạn nhận được: ' + paymentIdDoctor.amount + 'VND.' + ' Số tiền bạn có hiện tại: ' + paymentIdDoctor.remainMoney + 'VND',
						};
						await createNotification(objNotificationToSave);
						let payLoad = {
							data: {
								senderId: reqSender,
								nameSender: fullName,
								receiverId: reqReceiver,
								type: constants.NOTIFICATION_TYPE_PAYMENT,
								storageId: reqConversationID,
								remainMoney: paymentIdDoctor.remainMoney + '',
								message: 'Bạn nhận được: ' + paymentIdDoctor.amount + 'VND.' + ' Số tiền bạn có hiện tại: ' + paymentIdDoctor.remainMoney + 'VND',
								createTime: Date.now().toString()
							}
						};
						// send notification
						await SendNotification.sendNotification(reqReceiver, payLoad);
					}
				}
				else {
					// TODO notification to Admin
				}
			} else {
				// TODO notification to Admin
				console.log('update is failed');
			}
		});
		/// socket upload image chat

		///
		socket.on('switchRoom', function (newroom) {
			// leave the current room (stored in session)
			socket.leave(socket.room);
			// join new room, received as function parameter
			socket.join(newroom);
			socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
			// sent message to OLD room
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.id + ' has left this room');
			// update socket session room title
			socket.room = newroom;
			socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.id + ' has joined this room');
			socket.emit('updaterooms', rooms, newroom);
		});

		// when socket disconnects, remove it from the list:
		socket.on('disconnect', () => {
			console.log(socket.id + ' disconnect');
			// Object.keys(JSON.stringify(doctorsOnline)).forEach(function (key) {
			//     if (doctorsOnline[key] === socket.id)
			//         delete doctorsOnline[key];
			// });
			// doctorsOnline.push(userID)
			if (socket.type === 2) {
				var index = doctorsOnline.indexOf(socket.userID);
				if (index > -1) {
					doctorsOnline.splice(index, 1);
				}
			}
			sequenceNumberByClient.delete(socket.userID);
			console.info('Client gone id' + socket.id);
			//socket.emit('getDoctorOnline',doctorsOnline);
		});
	}
	);
	/////////////////////////////////
	const ChatsHistory = require('../models').ChatsHistory;
	const TypeAdvisory = require('../models').TypeAdvisory;
	const PaymentsHistory = require('../models').PaymentsHistory;
	const SendNotification = require('./NotificationFCMController');
	const User = require('../models').User;
	const Notification = require('../models').Notification;
	const constants = require('./../constants');

	async function getUser(userId) {
		let fullName;
		let objUser = await User.findById({_id: userId});
		if (objUser) {
			fullName = ' ' + objUser.firstName + ' ' + objUser.middleName + ' ' + objUser.lastName + '';
		}
		return fullName;
	}

	async function updateRecord(data) {
		let updateSuccess = false;
		if (!data.id) {
			updateSuccess = false;
			return updateSuccess;
		}
		try {
			// check limit record
			let pushRecord = await ChatsHistory.findById({_id: data.id});
			let objTypeAdvisory = await TypeAdvisory.findById({_id: pushRecord.typeAdvisoryID});
			if (!objTypeAdvisory) {
				updateSuccess = false;
				return updateSuccess;
			}
			// loop check
			let countRecord = 0;
			for (let i = 0; i < pushRecord.records.length; i++) {
				if (pushRecord.records[i].recorderID === pushRecord.patientId) {
					countRecord++;
				}
			}
			if (countRecord >= (objTypeAdvisory.limitNumberRecords * 1)) {
				await updateStatus(data.id);
				updateSuccess = false;
				return updateSuccess;
			} else {
				// update
				pushRecord.records.push(data.records);
				await pushRecord.save(function (err, pushRecord) {
					if (err) {

					}
					else {

					}
				});
				updateSuccess = true;
			}
		} catch (e) {
			console.log(e);
		}
		return updateSuccess;
	}

	async function updateStatus(reqConversationID) {
		let success = false;
		let objChatHistory = await ChatsHistory.findById({_id: reqConversationID});
		if (objChatHistory) {
			objChatHistory.set({status: constants.STATUS_CONVERSATION_FINISH});
			await objChatHistory.save(function (err, objUpdate) {
			});

			if (await getStatus(reqConversationID) === constants.STATUS_CONVERSATION_FINISH) {
				success = true;
			}

		}
		return success;
	}

	async function getStatus(reqConversationID) {
		let status = 0;
		let objChatHistory = await ChatsHistory.findById({_id: reqConversationID});
		if (objChatHistory) {
			status = objChatHistory.status * 1;
		}
		return status;
	}

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
			let amount = objTypeAdvisory.price * constants.PERCENT_PAY_FOR_DOCTOR;
			let remainMoney = objUser.remainMoney + amount;
			try {
				let objPaymentHistory = PaymentsHistory({
					userID: objChatHistory.doctorId,
					amount: amount,
					remainMoney: remainMoney,
					fromUser: objChatHistory.patientId,
					typeAdvisoryID: objChatHistory.typeAdvisoryID,
					status: constants.PAYMENT_SUCCESS
				});

				// update remain money to User
				objUser.set({remainMoney: remainMoney});
				await objUser.save();

				// save to payment table
				paymentID = await objPaymentHistory.save();
			}
			catch (e) {
				console.log(e);
			}
		}
		return paymentID;
	}

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
};