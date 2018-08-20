const mongoose = require('mongoose');

let BankSchema = mongoose.Schema({
    nameBank: {type: String},
    nameBankEnglish: {type: String},
    nameTransaction: {type: String},
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

let Bank = module.exports = mongoose.model('Bank', BankSchema);

BankSchema.pre('save', async function (next) {
    const currTime = new Date().getTime();
    this.updatedAt = currTime;
    if (this.isNew) {
        this.createdAt = currTime;
    }
    next();
});