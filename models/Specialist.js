const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let SpecialistSchema = mongoose.Schema({
    name: {
        type: String
    },
});

let Specialist = module.exports = mongoose.model('Specialist', SpecialistSchema);