const mongoose = require('mongoose');

let PaymentsHistorySchema = mongoose.Schema({
    userID: {type: String, ref: 'User'},
    amount: {type: Number},
    remainMoney: {type: Number},
    fromUser: {type: String, ref: 'User'},
    typeAdvisoryID: {type: String, ref: 'TypeAdvisory'},
    status: {type: Number},
    deletionFlag: {type: Boolean, default: false}
}, {timestamps: true});

let PaymentsHistory = module.exports = mongoose.model('PaymentsHistory', PaymentsHistorySchema);