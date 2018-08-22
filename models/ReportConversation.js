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
    punish: {
        type: Number
    },
    idConversation: {
        type: String
    },
    type: {
        type: Number
    },
    status: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
    updatedAt: {
        type: Number,
        default: new Date().getTime()
    },
    deletionFlag: {
        type: Boolean,
        default: false
    }
});

let ReportConversation = module.exports = mongoose.model('ReportConversation', ReportConversationSchema);

ReportConversationSchema.pre('save', async function (next) {
    const currTime = new Date().getTime();
    this.updatedAt = currTime;
    if (this.isNew) {
        this.createdAt = currTime;
    }
    next();
});
