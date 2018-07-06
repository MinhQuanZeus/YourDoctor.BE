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
        type: Number,
        default: 0
    },
    time: {
        type: Date
    }
});

let Rating = module.exports = mongoose.model('Rating', RatingSchema);