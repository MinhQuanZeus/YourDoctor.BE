const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let child_favarite_doctors = mongoose.Schema({
    doctor_id: {type: String}
});

let PatientsSchema = mongoose.Schema({
    patient_id:[{type: mongoose.Schema.Types.ObjectId, ref: 'Accounts'}],
    favorite_doctors: [child_favarite_doctors],
    create_time:{type: Date},
    update_time:{type: Date},
    deletion_flag:{type: Number}
});

let Patients = module.exports = mongoose.model('Patients', PatientsSchema);