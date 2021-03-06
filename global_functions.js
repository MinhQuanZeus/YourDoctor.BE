to = function (promise) {//global function that will help use handle promise rejections
	return promise
		.then(data => {
			return [null, data];
		}).catch(err =>
			[pe(err)]
		);
};

pe = require('parse-error');

TE = function (err_message, log) { // Throw Error
	if (log === true) {
		console.error(err_message);
	}

	throw new Error(err_message);
};

ReE = function (res, err, code) { // Error Web Response
	if (typeof err == 'object' && typeof err.message != 'undefined') {
		err = err.message;
	}

	if (typeof code !== 'undefined') res.statusCode = code;

	return res.json({success: false, error: err});
};

ReS = function (res, data, code) { // Success Web Response
	let send_data = {success: true};

	if (typeof data == 'object') {
		send_data = Object.assign(data, send_data);
	}

	if (typeof code !== 'undefined') res.statusCode = code;
	return res.json(send_data);
};

compareDate = function(date1, date2) {
	try {
		temp1 = new Date(date1);
		temp2 = new Date(date2);
		if (temp1.getTime() === temp2.getTime()) {
			return true;
		}
		return false;
	}catch (e) {
		return false;
	}
};

//This is here to handle all the uncaught promise rejections
process.on('unhandledRejection', error => {
	console.error('Uncaught Error', pe(error));
});
