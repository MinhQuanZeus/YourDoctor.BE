const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');
let UserSchema = mongoose.Schema({
	phoneNumber: {
		type: String,
		lowercase: true,
		trim: true,
		index: true,
		unique: true,
		sparse: true,
		validate: [validate({
			validator: 'isNumeric',
			arguments: [7, 20],
			message: 'Not a valid phone number.',
		})],
	},
	password: {
		type: String,
	},
	firstName: {
		type: String,
	},
	middleName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	birthday: {
		type: String,
	},
	address: {
		type: String,
	},
	avatar: {
		type: String,
	},
	remainMoney: {
		type: Number,
	},
	role: {
		type: Number,
	},
	gender: {
		type: Number,
	},
	status: {
		type: Number,
	},
	reportCount: {
		type: Number,
		default: 0,
	},
	deletionFlag: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Number,
		default: new Date().getTime(),
	},
	updatedAt: {
		type: Number,
		default: new Date().getTime(),
	},
});

UserSchema.pre('save', async function (next) {

	if (this.isModified('password') || this.isNew) {
		let err, salt, hash, error;
		[err, salt] = await to(bcrypt.genSalt(10));
		if (err) TE(err.message, true);
		{
			[error, hash] = await to(bcrypt.hash(this.password, salt));
			if (error) TE(err.message, true);
			this.password = hash;
		}
	}
	const currTime = new Date().getTime();
	this.updatedAt = currTime;
	if (this.isNew) {
		this.createdAt = currTime;
	}
	next();
});

UserSchema.methods.comparePassword = async function (pw) {
	let err, pass;
	if (!this.password) TE('password not set');

	[err, pass] = await to(bcrypt_p.compare(pw, this.password));
	if (err) {
		TE(err);
	}

	if (!pass) TE('invalid password');

	return this;
};

UserSchema.virtual('full_name').set(function (name) {
	var split = name.split(' ');
	this.first = split[0];
	this.last = split[1];
});

UserSchema.virtual('full_name').get(function () {
	if (!this.firstName) return null;
	if (!this.lastName) return this.firstName;

	return this.first + ' ' + this.last;
});

UserSchema.methods.getJWT = function () {
	let expiration_time = parseInt(CONFIG.jwt_expiration);
	return 'Bearer ' + jwt.sign({
		user_id: this._id,
	}, CONFIG.jwt_encryption, {
		expiresIn: expiration_time,
	});
};

UserSchema.methods.toWeb = function () {
	let json = {};
	json = this.toJSON();
	json.id = this._id;
	return json;
};

let User = module.exports = mongoose.model('User', UserSchema);
