const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let Type_acvisoriesSchema = mongoose.Schema({
    name: {type: String},
    price: {type: Number},
    limit_number_records: {type: Number}
});

let Type_advisories = module.exports = mongoose.model('Type_advisories', Type_acvisoriesSchema);