const mongoose = require('mongoose');

let TypeAdvisoriesSchema = mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    limitNumberRecords: {
        type: Number
    },
    description: {
        type: String
    },
    deletionFlag: {type: Boolean, default: false}
}, {
    timestamps: true
});

let TypeAdvisory = module.exports = mongoose.model('TypeAdvisory', TypeAdvisoriesSchema);