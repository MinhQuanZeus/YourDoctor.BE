const Bank = require('../models').Bank;

const create = async function (req, res) {
	const body = req.body;
	if (!body) {
		return ReE(res, 'Bad request', 400);
	}
	else {
		let duplicateBank = await Bank.findOne({nameBank: body.nameBank});
		if (duplicateBank) {
			return ReS(res, {message: 'Đã tồn tại ngân hàng trong danh sách'}, 503);
		}
		else {
			let newBank = new Bank({
				nameBank: body.nameBank,
				nameBankEnglish: body.nameBankEnglish,
				nameTransaction: body.nameTransaction
			});
			await newBank.save();
			return ReS(res, {message: 'Thêm danh sách ngân hàng thành công', newBank: newBank}, 200);
		}
	}
};

module.exports.create = create;

const get = async function (req, res) {
	try {
		let listBank = await Bank.find({});
		if(listBank){
			return ReS(res, {message: 'Tải danh sách ngân hàng thành công', listBank: listBank}, 200);
		}
		else {
			return ReS(res, {message: 'Tải danh sách ngân hàng không thành công'}, 503);
		}
	}catch (e) {
		console.log(e);
	}
};

module.exports.get = get;
