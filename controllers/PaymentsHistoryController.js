const PaymentsHistory = require('../models').PaymentsHistory;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;
    console.log(body)
    if (!body.userID || !body.amount || !body.typeAdvisoryID) {
        return ReE(res, 'ERROR0028', 400);
    }
    try{
        var paymentsHistory = new PaymentsHistory({
            userID: body.userID,
            amount: body.amount,
            remainMoney: body.remainMoney,
            typeAdvisoryID: body.typeAdvisoryID,
            status: body.status
        });
        await  paymentsHistory.save();
        return ReS(res, {message: 'Tạo lịch sử thanh toán thành công thành công', paymentsHistory: paymentsHistory.id}, 200);
    }catch (e) {
        ReS(res, 'ERROR0040', 503);
    }

}

module.exports.create = create;