const mongoose = require('mongoose');

let ReportSchema = mongoose.Schema({
    idReporter: {
        type: String,
        ref: 'User'
    },
    idPersonBeingReported: {
        type: String,
        ref: 'User'
    },
    reason: {
        type: String
    },
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

let Report = module.exports = mongoose.model('Report', ReportSchema);