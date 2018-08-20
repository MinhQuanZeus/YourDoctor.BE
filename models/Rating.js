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
    comment: {type: String},
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
    updatedAt: {
        type: Number,
        default: new Date().getTime()
    },
});

let Rating = module.exports = mongoose.model('Rating', RatingSchema);

RatingSchema.pre('save', async function (next) {
    const currTime = new Date().getTime();
    this.updatedAt = currTime;
    if (this.isNew) {
        this.createdAt = currTime;
    }
    next();
});
