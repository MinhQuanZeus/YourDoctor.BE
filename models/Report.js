const mongoose = require('mongoose');

let ReportSchema = mongoose.Schema({
	idReporter: {
		type: String,
		ref: 'User'
	},
	idPersonBeingReported: {
		type: String,
		ref: 'User'
	},
	reason: {
		type: String
	},
	status: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Number,
		default: new Date().getTime()
	},
	updatedAt: {
		type: Number,
		default: new Date().getTime()
	},
	deletionFlag: {
		type: Boolean,
		default: false
	}
});

let Report = module.exports = mongoose.model('Report', ReportSchema);

ReportSchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});