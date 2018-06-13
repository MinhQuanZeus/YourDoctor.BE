const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let RatingSchema = mongoose.Schema({
    patient_id: {type: String},
    doctor_id: {type: String},
    rating: {type: Number},
    time: {type: Date}
});

let Rating = module.exports = mongoose.model('Rating', RatingSchema);