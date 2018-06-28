const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let BankingHistorySchema = mongoose.Schema({
    userId: {type: String},
    amount: {type: Number},
    remainMoney: {type: Number},
    type: {type: Number},
    nameBank: {type: String},
    accountNumber: {type: String},
    timeDeal: {type: Date},
    deletionFlag:{type: Number}
},{timestamp:true});

let BankingHistory = module.exports = mongoose.model('BankingHistory', BankingHistorySchema);