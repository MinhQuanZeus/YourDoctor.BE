const Account = require('../models').Account;
const fs = require('fs');
const fileType = require('file-type');
const multiparty = require('multiparty');
const authService = require('./../services/AuthService');
const awsService = require('./../services/AWSService');
const constants = require('./../constants');
const uuidv4 = require('uuid/v4');

const register = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	const form = new multiparty.Form();
	form.parse(req, async (error, fields, files) => {
		if (error) throw new Error(error);
		try {
			let image = '';
			if (files && files.avatar) {
				const path = files.avatar[0].path;
				const buffer = fs.readFileSync(path);
				const type = fileType(buffer);
				const timestamp = uuidv4();
				const fileName = `${timestamp}-lg`;
				const data = await awsService.uploadFile(buffer, fileName, type);
				image = data.Location;
			}
			// Insert database
			const requestData = fields && fields.user && fields.user[0];
			let erro, user;
			[erro, user] = await to(authService.createUser(requestData, image));
			if (erro) return ReE(res, erro, 422);
			if (user.role === constants.ROLE_STAFF) {
				return ReS(res, {
					message: 'Successfully created new user.',
				}, 200);
			}
			return ReS(res, {
				message: 'Successfully created new user.',
				user: user.toWeb(),
				token: user.getJWT(),
			}, 200);
		} catch (error) {
			return ReE(res, 'Đăng ký không thành công, vui lòng thử lại sau', 400);
		}
	});
};
module.exports.register = register;

const login = async function (req, res) {
	let err, user;

	[err, user] = await to(authService.authUser(req.body));
	if (err) return ReE(res, err, 422);
	res.cookie('ACCESS_TOKEN', user.getJWT(), { maxAge: 900000 });
	// res.cookie('access_token', user.getJWT(), { signed: true , maxAge: 300000 });
	return ReS(res, {
		token: user.getJWT(),
		user: user.toWeb(),
	});
};
module.exports.login = login;

const logout = function (req, res) {
	res.clearCookie('ACCESS_TOKEN');
	req.logout();
	res.redirect('/');
};

module.exports.logout = logout;
