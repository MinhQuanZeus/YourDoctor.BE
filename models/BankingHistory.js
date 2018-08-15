const mongoose = require('mongoose');
const constant = require('../constants');
let BankingHistorySchema = mongoose.Schema({
    userId: {
        type: String
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
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamp: true
});

let BankingHistory = module.exports = mongoose.model('BankingHistory', BankingHistorySchema);