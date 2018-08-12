const mongoose = require('mongoose');

let introAndRuleSchema = mongoose.Schema({
    type: {type: String},
    content: {type: String}
});

let IntroduceAndRule = module.exports = mongoose.model('IntroduceAndRule', introAndRuleSchema);