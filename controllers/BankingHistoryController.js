const BankingHistory = require('../models').BankingHistory;
const Staff = require('../models').Staff;
const User = require('../models').User;
const SendNotification = require('./NotificationFCMController');
const Notification = require('../models').Notification;
const constants = require('../constants')
const doctorWithdrawal = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    try {
        const body = req.body;
        if(!body){
            return ReE(res, 'Bad request',400);
        }
        else {
            let bankingHistory = new BankingHistory({
                userId: body.userId,
                amount: body.amount,
                remainMoney: body.remainMoney,
                type: body.type,
                nameBank: body.nameBank,
                accountNumber: body.accountNumber,
                status:
                isSuccess:false,
                deletionFlag: body.deletionFlag
            });
            await  bankingHistory.save();

            // update remain money for doctor
            //get doctor
            let objDoctor = await User.findById({_id:body.userId});
            // update remain
            await objDoctor.set({remainMoney:body.remainMoney});
            let objSuccess = await objDoctor.save();
            // check update success - send notification

        }
    }catch (e) {
        console.log(e);
        return ReE(res, 'Tạo yêu cầu rút tiền không thành công',503);
    }

};

module.exports.doctorWithdrawal = doctorWithdrawal;



const patientRecharge = async function (req, res) {

};
module.exports.patientRecharge = patientRecharge;

const getAllHistoryBanking = async function (req, res) {
    let query = {};
    if ( req.query.userId) query.userId = req.query.userId;
    if ( req.query.deletionFlag) query.deletionFlag = req.query.deletionFlag;
    console.log(query);
    BankingHistory.find(query, function (err, allHistory) {
        if(err){
            ReE(res, "ERROR0019", 404);
        }
        return ReS(res, {message: 'Tải lịch sử giao dịch thành công',allHistory:allHistory}, 200);
    });
};
module.exports.getAllHistoryBanking = getAllHistoryBanking;

const getDetailHistoryById = async function(req, res){
    BankingHistory.findById(req.params.id).then(doc => {
        if(!doc) ReE(res, "ERROR0019", 404);
        return ReS(res, {message: 'Tải lịch sử giao dịch thành công',doc:doc}, 200);
    })
        .catch(err => next(err));
};
module.exports.getDetailHistoryById = getDetailHistoryById;

const removeLogic = async function (req, res) {
    BankingHistory.findByIdAndUpdate(req.params.id, { $set: { deletionFlag: "1"}}, function (err, removeLogic) {
            if (err) TE(err.message);
        res.send(removeLogic);
    });
};
module.exports.removeLogic = removeLogic;

const payCashForDoctor =  async function (req, res) {

};

async function getUser(userId) {
    let fullName;
    let objUser = await User.findById({_id: userId});
    if (objUser) {
        fullName = " " + objUser.firstName + " " + objUser.middleName + " " + objUser.lastName + "";
    }
    return fullName
}

const createNotification = async function (body) {
    try {
        let notification = Notification({
            senderId: body.senderId,
            nameSender: body.nameSender,
            receiverId: body.receiverId,
            type: body.type,
            storageId: body.storageId,
            message: body.message
        });
        await  notification.save(function (err, success) {
            if (err) {
                console.log(err)
            }
        });
    }
    catch (e) {
        console.log(e)
    }
};