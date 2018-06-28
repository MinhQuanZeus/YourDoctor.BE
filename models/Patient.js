const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let childFavariteDoctors = mongoose.Schema({
    doctorID: {
        type: String
    }
});

let PatientSchema = mongoose.Schema({
    patientID: [{
        type: String,
        ref: 'User'
    }],
    favoriteDoctors: [childFavariteDoctors],
    deletionFlag: {
        type: Number
    }
}, {
    timestamps: true
});

let Patient = module.exports = mongoose.model('Patient', PatientSchema);