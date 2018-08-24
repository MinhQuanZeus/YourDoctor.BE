const PhoneVerification = require('../models/PhoneVerification');

const savePhoneVerification = async (phoneNumber, code) => {
	const query = {
			phoneNumber: phoneNumber
		},
		update = {
			expire: new Date()
		},
		options = {
			upsert: true,
			new: true,
			setDefaultsOnInsert: true
		};
	const status = await PhoneVerification.findOneAndUpdate(query, update, options, (error, result) => {
		if (!error) {
			result.code = code;
			result.status = 1;
			result.save(err => {
				if (err) {
					return 'Failed update phone verification';
				} else {
					return 'success';
				}
			});
		}
	});
};
module.exports.savePhoneVerification = savePhoneVerification;
