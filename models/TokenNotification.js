const mongoose = require('mongoose');

let TokenNotificationSchema = mongoose.Schema({
    userId: {type: String, ref: 'User'},
    tokenDevice: {type: String}
});

let TokenNotification = module.exports = mongoose.model('TokenNotification', TokenNotificationSchema);