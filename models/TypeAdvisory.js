const mongoose = require('mongoose');

let TypeAdvisoriesSchema = mongoose.Schema({
	name: {
		type: String
	},
	price: {
		type: Number
	},
	limitNumberRecords: {
		type: Number
	},
	type: {
		type: Number
	},
	description: {
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
	deletionFlag: {type: Boolean, default: false}
});

let TypeAdvisory = module.exports = mongoose.model('TypeAdvisory', TypeAdvisoriesSchema);

TypeAdvisoriesSchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});
