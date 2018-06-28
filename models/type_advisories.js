const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let TypeAdvisoriesSchema = mongoose.Schema({
    name: {type: String},
    price: {type: Number},
    limitNumberRecords: {type: Number},
    description:{type: String}
}, {timestamps: true});

let Type_advisories = module.exports = mongoose.model('Type_advisories', TypeAdvisoriesSchema);