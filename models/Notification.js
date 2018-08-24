const mongoose = require('mongoose');

let NotificationSchema = mongoose.Schema({
	senderId: {type: String, ref: 'User'},
	nameSender: {type: String},
	receiverId: {type: String, ref: 'User'},
	type: {type: Number},
	storageId: {type: String},
	message: {type: String},
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

let Notification = module.exports = mongoose.model('Notification', NotificationSchema);

NotificationSchema.pre('save', async function (next) {
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});