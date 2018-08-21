const mongoose = require('mongoose');

let SpecialistSchema = mongoose.Schema({
    name: {
        type: String
    },
    image: {type: String},
    description: {
        type: String
    },
    listQuestion: [{
        type: String
    }],
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
    deletionFlag: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Number,
        default: new Date().getTime()
    }
});

let Specialist = module.exports = mongoose.model('Specialist', SpecialistSchema);

SpecialistSchema.pre('save', async function (next) {
    const currTime = new Date().getTime();
    this.updatedAt = currTime;
    if (this.isNew) {
        this.createdAt = currTime;
    }
    next();
});
