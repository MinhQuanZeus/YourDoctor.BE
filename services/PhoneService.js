var https = require('https');
const phoneRepository = require('./../repositories/PhoneVerificationRepository');
const ACCESS_TOKEN = CONFIG.SPEED_SMS_AUTH_TOKEN;

const sendSMSVerification = async (phoneNumber) => {
	const code = Math.floor(10000 + 89999 * Math.random());
	const message = 'Your doctor! ' + code + ' là mã xác thực số điện thoại của bạn.';
	try {
		const statusSendSMS = await sendSMS(phoneNumber, message);
		if (statusSendSMS === 'success') {
			await phoneRepository.savePhoneVerification(phoneNumber, code);
			return Promise.resolve('success');
		}else {
			return Promise.reject('error');
		}
	} catch (error) {
		return Promise.reject('ERROR0007');
	}
};
module.exports.sendSMSVerification = sendSMSVerification;

const sendSMSPassword = async (phoneNumber, newPassword) => {
	const mesage = 'Your doctor! Mật khẩu tài khoản của bạn là: ' + newPassword;
	try {
		const statusSendSMS = await sendSMS(phoneNumber, mesage);
	} catch (error) {
		console.log(error);
		return Promise.reject('ERROR0007');
	}
};
module.exports.sendSMSPassword = sendSMSPassword;

const adminSendSMS = async (phoneNumber, message) => {
	try {
		const statusSendSMS = await sendSMS(phoneNumber, message);
	} catch (error) {
		console.log(error);
		return Promise.reject('ERROR0007');
	}
};
module.exports.adminSendSMS = adminSendSMS;

const sendSMSVerifyBanking = async (phoneNumber, verifyCode) => {
	const mesage = 'Your Doctor! Mã xác nhận giao dịch của bạn là: ' + verifyCode;
	try {
		const statusSendSMS = await sendSMS(phoneNumber, mesage);
	} catch (error) {
		console.log(error);
		return Promise.reject('ERROR0007');
	}
};
module.exports.sendSMSVerifyBanking = sendSMSVerifyBanking;

const sendSMS = async (phoneNumber, content) => {
	const url = CONFIG.SPEED_SMS_URL;
	const params = JSON.stringify({
		to: [phoneNumber + ''],
		content: content,
		sms_type: CONFIG.SPEED_SMS_TYPE,
		sender: '',
	});

	const buf = new Buffer(ACCESS_TOKEN + ':x');
	const auth = 'Basic ' + buf.toString('base64');
	const options = {
		hostname: url,
		port: 443,
		path: '/index.php/sms/send',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': auth,
		},
	};
	return new Promise((resolve, reject) => {
		let req = https.request(options);
		req.on('response', res => {
			res.setEncoding('utf8');
			var body = '';
			res.on('data', function (d) {
				body += d;
			});
			res.on('end', function () {
				var json = JSON.parse(body);
				if (json.status === 'success') {
					resolve('success');
				} else {
					reject('error');
				}
			});
		});

		req.on('error', err => {
			reject(err);
		});
		req.write(params);
		req.end();
	});
};
module.exports.sendSMS = sendSMS;
