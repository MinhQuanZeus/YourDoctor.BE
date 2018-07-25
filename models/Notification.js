const mongoose = require('mongoose');

let notificationSchema = mongoose.Schema({
    receiverId: {type: String, ref: 'User'},
    senderId: {type: String, ref: 'User'},
    typeNotification: {type: Number},
    ID: {type: String},
    deletionFlag: {type: Boolean, default: false}
}, {timestamps: true});