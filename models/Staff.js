const mongoose = require('mongoose');

let StaffSchema = mongoose.Schema({
    staffId: {
        type: String,
        ref: 'User'
    },
    department: {type: String},
    role: {type: Number},
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
    updatedAt: {
        type: Number,
        default: new Date().getTime()
    },
    deletionFlag: {
        type: Boolean,
        default: false
    }
});

let Staff = module.exports = mongoose.model('Staff', StaffSchema);

StaffSchema.pre('save', async function (next) {
    const currTime = new Date().getTime();
    this.updatedAt = currTime;
    if (this.isNew) {
        this.createdAt = currTime;
    }
    next();
});
