const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let childFavoriteDoctors = mongoose.Schema({
    doctorId: {
        type: String,
        ref: 'User'
    }
});

let PatientsSchema = mongoose.Schema({
    patientId: {
        type: String,
        ref: 'User'
    },
    favoriteDoctors: [childFavoriteDoctors],
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

let Patient = module.exports = mongoose.model('Patient', PatientsSchema);