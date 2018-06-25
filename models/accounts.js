const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

let AccountsSchema = mongoose.Schema({
    phone: {
        type: String, lowercase: true, trim: true, index: true, unique: true, sparse: true,
        validate: [validate({
            validator: 'isNumeric',
            arguments: [7, 20],
            message: 'Not a valid phone number.',
        })]
    },
    password: {type: String},
    first_name:{type: String},
    last_name:{type: String},
    birth_day: {type:String},
    address:{type:String},
    status:{type:Number},
    avatar:{type: String},
    remain_money:{type: Number},
    role:{type: Number},
    create_time:{type: Date},
    update_time:{type: String},
    deletion_flag:{type: Number}

}, {timestamps: true});

AccountsSchema.pre('save', async function (next) {

    if (this.isModified('password') || this.isNew) {

        let err, salt, hash;
        [err, salt] = await to(bcrypt.genSalt(10));
        if (err) TE(err.message, true);

        [err, hash] = await to(bcrypt.hash(this.password, salt));
        if (err) TE(err.message, true);

        this.password = hash;

    } else {
        return next();
    }
})

AccountsSchema.methods.comparePassword = async function (pw) {
    let err, pass;
    if (!this.password) TE('password not set');

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE('invalid password');

    return this;
}

AccountsSchema.virtual('full_name').set(function (name) {
    var split = name.split(' ');
    this.first_name = split[0];
    this.last_name = split[1];
});

AccountsSchema.virtual('full_name').get(function () {
    if (!this.first_name) return null;
    if (!this.last_name) return this.first_name;

    return this.first_name + ' ' + this.last_name;
});

AccountsSchema.methods.getJWT = function () {
    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return "Bearer " + jwt.sign({user_id: this._id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
};

AccountsSchema.methods.toWeb = function () {
    let json = this.toJSON();
    json.id = this._id;
    return json;
};

let Accounts = module.exports = mongoose.model('Accounts', AccountsSchema);
