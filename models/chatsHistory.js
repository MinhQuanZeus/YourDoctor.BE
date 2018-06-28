const mongoose = require('mongoose');

let childRecords = mongoose.Schema({
    recorderID: {type: String, ref: 'User'},
    type: {type: Number},
    value: {type: String},
    createTime: {type: Date, default: Date.now()}
})

let chatsHistorySchema = mongoose.Schema({
    contentTopic: {type: String},
    patientId: {type: String, ref: 'User'},
    doctorId: {type: String, ref: 'User'},
    records: [childRecords],
    status: {type: Number},
    timeReplyApproval: {type: Date},
    typeAdvisoryID: {type: String, ref: 'type_advisories'},
    paymentPatientID: {type: String, ref: 'paymentsHistory'},
    paymentDoctorID: {type: String, ref: 'paymentsHistory'},
}, {timestamp: true});

let ChatsHistory = module.exports = mongoose.model('ChatsHistory', chatsHistorySchema);