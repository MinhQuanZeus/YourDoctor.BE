const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let Banking_historySchema = mongoose.Schema({
    user_id: {type: String},
    amount: {type: Number},
    remain_money: {type: Number},
    type: {type: Number},
    name_bank: {type: String},
    account_number: {type: String},
    time_deal: {type: Date},
    create_time:{type: Date},
    update_time:{type: Date},
    deletion_flag:{type: Number}
});

let BankingHistory = module.exports = mongoose.model('BankingHistory', Banking_historySchema);