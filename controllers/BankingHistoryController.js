const BankingHistory = require('../models').BankingHistory;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.userId || !body.amount || !body.remainMoney || !body.nameBank || !body.accountNumber){
        //TODO validate
        return ReE(res, 'Tạo lịch sử giao dịch thất bại');
    }
    else {
        var bankingHistory = new BankingHistory({
            userId: body.userId,
            amount: body.amount,
            remainMoney: body.remainMoney,
            type: body.type,
            nameBank: body.nameBank,
            accountNumber: body.accountNumber,
            timeDeal: body.timeDeal,
            deletionFlag: body.deletionFlag
        })
        await  bankingHistory.save()
        return ReS(res, {message: 'Tạo lịch sử giao dịch ngân hàng thành công',bankingHistory:bankingHistory}, 200);
    }
}

module.exports.create = create;

const getAllHistoryBanking = async function (req, res) {
    let query = {}
    if ( req.query.userId) query.userId = req.query.userId
    if ( req.query.deletionFlag) query.deletionFlag = req.query.deletionFlag
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
}
module.exports.getDetailHistoryById = getDetailHistoryById;

const removeLogic = async function (req, res) {
    BankingHistory.findByIdAndUpdate(req.params.id, { $set: { deletionFlag: "1"}}, function (err, removeLogic) {
            if (err) TE(err.message);
        res.send(removeLogic);
    });
};
module.exports.removeLogic = removeLogic;