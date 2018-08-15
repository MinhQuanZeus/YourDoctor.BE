const mongoose = require('mongoose');

let ReportConversationSchema = mongoose.Schema({
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
    idConversation: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    },
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

let ReportConversation = module.exports = mongoose.model('ReportConversation', ReportConversationSchema);