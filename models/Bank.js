const mongoose = require('mongoose');

let BankSchema = mongoose.Schema({
    nameBank: {type: String},
    nameBankEnglish:{type: String},
    nameTransaction:{type: String}
}, {timestamps: true});

let Bank = module.exports = mongoose.model('Bank', BankSchema);