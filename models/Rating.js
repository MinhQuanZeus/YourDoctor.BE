const mongoose = require('mongoose');

let RatingSchema = mongoose.Schema({
    patientId: {
        type: String
    },
    doctorId: {
        type: String
    },
    rating: {
        type: Number
    },
    comment: {type: String}
}, {timestamp: true});

let Rating = module.exports = mongoose.model('Rating', RatingSchema);