const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let childCertificate = mongoose.Schema({
    name: {type: String},
    pathImage: {type: String}
});

let childSpecialist = mongoose.Schema({
    specialistId:{type: String},
    name:{type: String}
});

let DoctorSchema = mongoose.Schema({
    doctorId: {type: String, ref: 'User'},
    currentRating: {type: Number},
    certificates: [childCertificate],
    idSpecialist: [childSpecialist],
    universityGraduate: {type: String},
    yearGraduate: {type: String},
    placeWorking: {type: String},
    deletionFlag:{type: Number}
}, {timestamps: true});

let Doctor = module.exports = mongoose.model('Doctor', DoctorSchema);