const mongoose = require('mongoose');

let StaffSchema = mongoose.Schema({
    staffId: {
        type: String,
        ref: 'User'
    },
    department: {type: String},
    role: {type: Number},
    deletionFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

let Staff = module.exports = mongoose.model('Staff', StaffSchema);