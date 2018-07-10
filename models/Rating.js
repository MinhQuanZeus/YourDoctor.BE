const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let RatingSchema = mongoose.Schema({
    patientId: {
        type: String
    },
    doctorId: {
        type: String
    },
    rating: {
        type: Number
    }
},{timestamp:true});

let Rating = module.exports = mongoose.model('Rating', RatingSchema);