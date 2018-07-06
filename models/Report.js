const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let ReportSchema = mongoose.Schema({
    idReporter: {
        type: String
    },
    idPersonBeingReported: {
        type: String
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