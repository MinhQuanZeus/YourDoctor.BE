const mongoose = require('mongoose');

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
    status:{
      type:Number
    },
    code:{
        type: String
    },
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamp: true
});

let BankingHistory = module.exports = mongoose.model('BankingHistory', BankingHistorySchema);