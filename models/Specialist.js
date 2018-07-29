const mongoose = require('mongoose');

let SpecialistSchema = mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    }
});

let Specialist = module.exports = mongoose.model('Specialist', SpecialistSchema);