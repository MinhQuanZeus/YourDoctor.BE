const mongoose = require('mongoose');

let PatientsSchema = mongoose.Schema({
    patientId: {
        type: String,
        ref: 'User'
    },
    favoriteDoctors: [{
        type: String,
        ref: 'User'
    }],
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

let Patient = module.exports = mongoose.model('Patient', PatientsSchema);