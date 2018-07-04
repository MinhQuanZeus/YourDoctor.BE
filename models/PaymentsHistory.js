const mongoose = require('mongoose');

let PaymentsHistorySchema = mongoose.Schema({
    userID:{type:String, ref:'User'},
    amount:{type:Number},
    remainMoney:{type:Number},
    typeAdvisoryID:{type:String, ref:'TypeAdvisory'},
    status:{type:Number},
    deletionFlag:{type:Number},
},{timestamp:true});

let PaymentsHistory = module.exports = mongoose.model('PaymentsHistory',PaymentsHistorySchema)