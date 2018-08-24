const mongoose = require('mongoose');

let videoCallHistorySchema = mongoose.Schema({
	patientId: { type: String, ref: 'User' },
	doctorId: { type: String, ref: 'User' },
	timeStart: { type: Number },
	timeEnd: { type: Number },
	typeAdvisoryID: { type: String, ref: 'TypeAdvisories' },
	paymentPatientID: { type: String, ref: 'PaymentsHistory' },
	paymentDoctorID: { type: String, ref: 'PaymentsHistory' },
	linkVideo: { type: String },
	createdAt: {
		type: Number,
		default: new Date().getTime(),
	},
	updatedAt: {
		type: Number,
		default: new Date().getTime(),
	},
	deletionFlag: { type: Number, default: 1 },
});

let VideoCallHistory = module.exports = mongoose.model('VideoCallHistory', videoCallHistorySchema);

videoCallHistorySchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});
