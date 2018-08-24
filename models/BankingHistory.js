const mongoose = require('mongoose');
const constant = require('../constants');
let BankingHistorySchema = mongoose.Schema({
	userId: {
		type: String,
		ref: 'User'
	},
	amount: {
		type: Number
	},
	remainMoney: {
		type: Number
	},
	type: {
		type: Number
	},
	nameBank: {
		type: String
	},
	accountNumber: {
		type: String
	},
	status: {
		type: Number,
		default: constant.BANKING_HISTORY_PENDING_VERIFY
	},
	code: {
		type: String
	},
	timeInputCode:{
		type: Number,
		default: 1
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

let BankingHistory = module.exports = mongoose.model('BankingHistory', BankingHistorySchema);

BankingHistorySchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});
