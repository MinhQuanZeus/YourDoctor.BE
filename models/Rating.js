const mongoose = require('mongoose');

let RatingSchema = mongoose.Schema({
    patientId: {
        type: String,
        ref: 'User'
    },
    doctorId: {
        type: String,
        ref: 'User'
    },
    rating: {
        type: Number
    },
    comment: {type: String}
}, {timestamp: true});

let Rating = module.exports = mongoose.model('Rating', RatingSchema);