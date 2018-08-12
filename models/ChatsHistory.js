const mongoose = require('mongoose');

let childRecords = mongoose.Schema({
    recorderID: {type: String, ref: 'User'},
    type: {type: Number},
    value: {type: String},
    created: {type: Date, default: Date.now}
});

let chatsHistorySchema = mongoose.Schema({
    contentTopic: {type: String},
    patientId: {type: String, ref: 'User'},
    doctorId: {type: String, ref: 'User'},
    records: [childRecords],
    status: {type: Number},
    timeReplyApproval: {type: Date},
    typeAdvisoryID: {type: String, ref: 'TypeAdvisories'},
    paymentPatientID: {type: String, ref: 'PaymentsHistory'},
    paymentDoctorID: {type: String, ref: 'PaymentsHistory'},
    deletionFlag: {type: Number, default: 1}
}, {timestamps: true});

let ChatsHistory = module.exports = mongoose.model('ChatsHistory', chatsHistorySchema);

