const Banking_history = require('../models').Banking_history;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.user_id || !body.amount || !body.remain_money || !body.name_bank || !body.account_number){
        //TODO validate
        return ReE(res, 'Tạo lịch sử giao dịch thất bại');
    }
    else {
        var banking_history = new Banking_history({
            user_id: body.user_id,
            amount: body.amount,
            remain_money: body.remain_money,
            type: body.type,
            name_bank: body.name_bank,
            account_number: body.account_number,
            time_deal: body.time_deal,
            create_time: body.create_time,
            update_time: body.update_time,
            deletion_flag: body.deletion_flag
        })
        await  banking_history.save()
        return ReS(res, {message: 'Tạo kiểu câu hỏi thành công',banking_history:banking_history}, 200);
    }
}

module.exports.create = create;

const get_history = async function (req, res) {
    let query = {}
    if ( req.query.user_id) query.user_id = req.query.user_id
    if ( req.query.deletion_flag) query.deletion_flag = req.query.deletion_flag
    console.log(query);
    Banking_history.find(query, function (err, all_history) {
        if(err){
            ReE(res, "ERROR0019", 404);
        }
        return ReS(res, {message: 'Tải lịch sử giao dịch thành công',all_history:all_history}, 200);
    });
};
module.exports.get_history = get_history;

const get_detail_history_by_id = async function(req, res){
    Banking_history.findById(req.params.id).then(doc => {
        if(!doc) ReE(res, "ERROR0019", 404);
        return ReS(res, {message: 'Tải lịch sử giao dịch thành công',doc:doc}, 200);
    })
        .catch(err => next(err));
}
module.exports.get_detail_history_by_id = get_detail_history_by_id;

const remove_logic = async function (req, res) {
    Banking_history.findByIdAndUpdate(req.params.id, { $set: { deletion_flag: "1"}}, function (err, remove_logic) {
            if (err) TE(err.message);
        res.send(remove_logic);
    });
};
module.exports.remove_logic = remove_logic;