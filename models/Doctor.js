const mongoose = require('mongoose');

let childCertificate = mongoose.Schema({
	name: {
		type: String
	},
	pathImage: {
		type: String
	}
});

let childSpecialist = mongoose.Schema({
	specialistId: {
		type: String
	},
	name: {
		type: String
	}
});

let DoctorSchema = mongoose.Schema({
	doctorId: {
		type: String,
		ref: 'User'
	},
	systemRating: {
		type: Number
	},
	currentRating: {
		type: Number
	},
	certificates: [childCertificate],
	idSpecialist: [childSpecialist],
	universityGraduate: {
		type: String
	},
	yearGraduate: {
		type: String
	},
	placeWorking: {
		type: String
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

let Doctor = module.exports = mongoose.model('Doctor', DoctorSchema);

DoctorSchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});
