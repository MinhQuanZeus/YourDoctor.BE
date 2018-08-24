const mongoose = require('mongoose');
const validate = require('mongoose-validator');

let PhoneVerificationSchema = mongoose.Schema({
	phoneNumber: {
		type: String,
		lowercase: true,
		trim: true,
		index: true,
		unique: true,
		sparse: true,
		validate: [validate({
			validator: 'isNumeric',
			arguments: [7, 20],
			message: 'Not a valid phone number.',
		})]
	},
	code: {
		type: String
	},
	status: {
		type: Number
	},
	createdAt: {
		type: Number,
		default: new Date().getTime()
	},
	updatedAt: {
		type: Number,
		default: new Date().getTime()
	}
});

let PhoneVerification = module.exports = mongoose.model('PhoneVerification', PhoneVerificationSchema);

PhoneVerificationSchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});