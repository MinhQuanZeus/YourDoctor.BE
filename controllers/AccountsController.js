const Accounts = require('../models').Accounts;
const authService = require('./../services/AuthServiceAccounts');

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.phone) {
        return ReE(res, 'Please enter phone number to register.');
    } else if (!body.password) {
        return ReE(res, 'Please enter a password to register.');
    } else {
        let err, account;

        [err, account] = await to(authService.createAccount(body));

        if (err) return ReE(res, err, 422);
        return ReS(res, {message: 'Successfully created new account.', account: account.toWeb(), token: account.getJWT()}, 201);
    }
}
module.exports.create = create;

const get = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let account = req.account;

    return ReS(res, {account: account.toWeb()});
}
module.exports.get = get;

const update = async function (req, res) {
    let  data;
    data = req.body;
    Accounts.findOne({doctor_id:data.doctor_id}, function (err, account_update) {
        if (err) return handleError(err);
        account_update.set(data);

        account_update.save(function (err, updatedAccount) {
            if (err) return handleError(err);
            res.send(updatedAccount);
        });
    });

}
module.exports.update = update;

const remove = async function (req, res) {
    let account, err;
    account = req.account;

    [err, account] = await to(account.destroy());
    if (err) return ReE(res, 'error occured trying to delete account');

    return ReS(res, {message: 'Deleted account'}, 204);
}
module.exports.remove = remove;


const login = async function (req, res) {
    const body = req.body;
    let err, account;

    [err, account] = await to(authService.authAccount(req.body));
    if (err) return ReE(res, err, 422);

    return ReS(res, {token: account.getJWT(), account: account.toWeb()});
}
module.exports.login = login;