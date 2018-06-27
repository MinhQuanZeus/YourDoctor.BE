const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let childFavariteDoctors = mongoose.Schema({
    doctorId: {type: String, ref: 'User'}
});

let PatientsSchema = mongoose.Schema({
    patientId:[{type: String, ref: 'User'}],
    favoriteDoctors: [childFavariteDoctors],
    deletionFlag:{type: Number}
}, {
    timestamps: true
});

let Patients = module.exports = mongoose.model('Patients', PatientsSchema);