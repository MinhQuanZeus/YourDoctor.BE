const Accounts = require('./../models').Accounts;
const validator = require('validator');

const getUniqueKeyFromBody = function (body) {
	let unique_key = null;
	if (typeof body.phone !== 'undefined') {
		unique_key = body.phone;
	} else {
		unique_key = null;
	}
	return unique_key;
};
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createAccount = async function (accountInfo) {
	let unique_key, auth_info, err;
	auth_info = {};
	auth_info.status = 'create';

	unique_key = getUniqueKeyFromBody(accountInfo);
	console.log(unique_key);
	if (!unique_key) TE('Phone number was not entered.');

	if (validator.isMobilePhone(unique_key, 'any')) {//checks if only phone number was sent
		auth_info.method = 'phone';
		accountInfo.phone = unique_key;

		[err, accountInfo] = await to(Accounts.create(accountInfo));
		if (err) TE('Account already exists with that phone number');
		return accountInfo;
	} else {
		TE('A valid phone number was not entered.');
	}
};
module.exports.createAccount = createAccount;

const authAccount = async function (accountInfo) {//returns token
	let unique_key;
	let auth_info = {};
	auth_info.status = 'login';
	unique_key = getUniqueKeyFromBody(accountInfo);

	if (!unique_key) TE('Please enter phone number to login');


	if (!accountInfo.password) TE('Please enter a password to login');

	let account;
	if (validator.isMobilePhone(unique_key, 'any')) {//checks if only phone number was sent
		auth_info.method = 'phone';

		[err, account] = await to(Accounts.findOne({phone: unique_key}));
		if (err) TE(err.message);

	} else {
		TE('A valid email or phone number was not entered');
	}

	if (!account) TE('Not registered');

	[err, account] = await to(account.comparePassword(accountInfo.password));

	if (err) TE(err.message);

	return account;

};
module.exports.authAccount = authAccount;

