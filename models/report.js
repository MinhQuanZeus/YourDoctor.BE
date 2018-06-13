const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let ReportSchema = mongoose.Schema({
    id_reporter: {type: String},
    id_person_being_reported: {type: String},
    reason: {type: String},
    time_create: {type: Date}

});

let Report = module.exports = mongoose.model('Report', ReportSchema);