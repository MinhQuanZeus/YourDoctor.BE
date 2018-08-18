const mongoose = require('mongoose');

let PaymentsHistorySchema = mongoose.Schema({
    userID: {type: String, ref: 'User'},
    amount: {type: Number},
    remainMoney: {type: Number},
    fromUser: {type: String, ref: 'User'},
    typeAdvisoryID: {type: String, ref: 'TypeAdvisory'},
    status: {type: Number},
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

let PaymentsHistory = module.exports = mongoose.model('PaymentsHistory', PaymentsHistorySchema);

PaymentsHistorySchema.pre('save', async function (next) {
    const currTime = new Date().getTime();
    this.updatedAt = currTime;
    if (this.isNew) {
        this.createdAt = currTime;
    }
    next();
});
