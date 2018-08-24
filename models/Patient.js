const mongoose = require('mongoose');

let PatientsSchema = mongoose.Schema({
	patientId: {
		type: String,
		ref: 'User'
	},
	favoriteDoctors: [{
		type: String,
		ref: 'User'
	}],
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

let Patient = module.exports = mongoose.model('Patient', PatientsSchema);

PatientsSchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});