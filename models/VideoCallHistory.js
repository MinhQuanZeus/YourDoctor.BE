const mongoose = require('mongoose');

let videoCallHistorySchema = mongoose.Schema({
    patientId: {type: String, ref: 'User'},
    doctorId: {type: String, ref: 'User'},
    timeStart: {type: Number},
    timeEnd: {type: Number},
    typeAdvisoryID: {type: String, ref: 'TypeAdvisories'},
    paymentPatientID: {type: String, ref: 'PaymentsHistory'},
    paymentDoctorID: {type: String, ref: 'PaymentsHistory'},
    linkVideo: {type: String},
    deletionFlag: {type: Number, default: 1}
}, {timestamps: true});

let VideoCallHistory = module.exports = mongoose.model('VideoCallHistory', videoCallHistorySchema);