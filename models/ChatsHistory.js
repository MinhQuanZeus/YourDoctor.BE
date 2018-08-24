const mongoose = require('mongoose');

let childRecords = mongoose.Schema({
	recorderID: {type: String, ref: 'User'},
	type: {type: Number},
	value: {type: String},
	createdAt: {
		type: Number,
		default: new Date().getTime()
	}
});

let chatsHistorySchema = mongoose.Schema({
	contentTopic: {type: String},
	patientId: {type: String, ref: 'User'},
	doctorId: {type: String, ref: 'User'},
	records: [childRecords],
	status: {type: Number},
	timeReplyApproval: {type: Date},
	typeAdvisoryID: {type: String, ref: 'TypeAdvisories'},
	paymentPatientID: {type: String, ref: 'PaymentsHistory'},
	paymentDoctorID: {type: String, ref: 'PaymentsHistory'},
	createdAt: {
		type: Number,
		default: new Date().getTime()
	},
	updatedAt: {
		type: Number,
		default: new Date().getTime()
	},
	deletionFlag: {type: Number, default: 1}
});

let ChatsHistory = module.exports = mongoose.model('ChatsHistory', chatsHistorySchema);

chatsHistorySchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});

childRecords.pre('save', async function (next) {
	const currTime = new Date().getTime();
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});