let fs = require('fs');
let path = require('path');
let basename = path.basename(__filename);
let models = {};
const mongoose = require('mongoose');
if (CONFIG.db_host !== '') {
	let files = fs
		.readdirSync(__dirname)
		.filter((file) => {
			return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
		})
		.forEach((file) => {
			let filename = file.split('.')[0];
			let model_name = filename.charAt(0).toUpperCase() + filename.slice(1);
			models[model_name] = require('./' + file);
		});

	mongoose.Promise = global.Promise;
	const mongoLocation = 'mongodb://' + CONFIG.db_user + ':' + CONFIG.db_password + '@' + CONFIG.db_host + ':' + CONFIG.db_port + '/' + CONFIG.db_name;

	mongoose.connect(mongoLocation).catch((err) => {
		console.log('*** Can Not Connect to Mongo Server:', mongoLocation);
	});

	let db = mongoose.connection;
	module.exports = db;
	db.once('open', () => {
		console.log('Connected to mongo at ' + mongoLocation);
	});
	db.on('error', (error) => {
		console.log('error', error);
	});
	// End of Mongoose Setup
} else {
	console.log('No Mongo Credentials Given');
}

module.exports = models;