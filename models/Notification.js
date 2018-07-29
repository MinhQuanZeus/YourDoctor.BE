const mongoose = require('mongoose');

let NotificationSchema = mongoose.Schema({
    senderId: {type: String, ref: 'User'},
    nameSender: {type: String},
    receiverId: {type: String, ref: 'User'},
    type: {type: Number},
    storageId: {type: String},
    message: {type: String},
    deletionFlag: {type: Boolean, default: false}
}, {timestamps: true});

let Notification = module.exports = mongoose.model('Notification', NotificationSchema);