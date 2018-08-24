const PaymentsHistory = require('../models').PaymentsHistory;

const create = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	let body = req.body;
	if (!body.userID || !body.amount || !body.typeAdvisoryID) {
		return ReE(res, 'ERROR0028', 400);
	}
	try{
		let paymentsHistory = new PaymentsHistory({
			userID: body.userID,
			amount: body.amount,
			remainMoney: body.remainMoney,
			fromUser: body.fromUser,
			typeAdvisoryID: body.typeAdvisoryID,
			status: body.status
		});
		await  paymentsHistory.save();
		return ReS(res, {message: 'Tạo lịch sử thanh toán thành công thành công', paymentsHistory: paymentsHistory.id}, 200);
	}catch (e) {
		ReS(res, 'ERROR0040', 503);
	}

};

module.exports.create = create;

const getPaymentHistoryByUser = async function (req, res) {
	if (!req.params.userID) {
		return ReS(res, {message: 'Bad request'}, 400);
	}
	let pageSize = 0;
	let page = 0;
	if (req.query.pageSize) {
		pageSize = req.query.pageSize * 1;
	}
	if (req.query.page) {
		page = req.query.page * 1;
	}
	try {
		let listPaymentHistory = await PaymentsHistory.find({
			userID: req.params.userID,
			deletionFlag: false
		})
			.sort([['createdAt', -1]])
			.limit(pageSize)
			.skip(pageSize * page)
			.populate({
				path: 'fromUser',
				select:'firstName middleName lastName avatar -_id'

			})
			.populate({
				path: 'typeAdvisoryID',
				select:'name -_id'
			});
		if(!listPaymentHistory){
			return ReS(res, {message: 'Not found'}, 404);
		}
		return ReS(res, {message: 'Tạo danh sách payment history thành công', listPaymentHistory: listPaymentHistory}, 200);
	} catch (e) {
		return ReS(res, {message: 'Not found'}, 503);
	}
};
module.exports.getPaymentHistoryByUser = getPaymentHistoryByUser;