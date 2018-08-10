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
    }]
});

let Specialist = module.exports = mongoose.model('Specialist', SpecialistSchema);