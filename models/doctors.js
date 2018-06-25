const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let child_certificate = mongoose.Schema({
    name: {type: String},
    path_image: {type: String}
});

let child_specialist = mongoose.Schema({
    specialist_id:{type: String},
    name:{type: String}
});

let DoctorSchema = mongoose.Schema({
    doctor_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Accounts'},
    current_rating: {type: Number},
    certificates: [child_certificate],
    id_specialist: [child_specialist],
    university_graduate: {type: String},
    year_graduate: {type: String},
    place_working: {type: String},
    create_time:{type: Date},
    update_time:{type: Date},
    deletion_flag:{type: Number}
});

let Doctors = module.exports = mongoose.model('Doctors', DoctorSchema);