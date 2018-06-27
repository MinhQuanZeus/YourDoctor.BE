const Account = require('../models').Account;
const authService = require('./../services/AuthService');

const register = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    
    let err, user;
    [err, user] = await to(authService.createUser(body));
    console.log(err);
    if (err) return ReE(res, err, 422);
    return ReS(res, {
        message: 'Successfully created new user.',
        user: user.toWeb(),
        jwt_token: user.getJWT()
    }, 201);

};
module.exports.register = register;

const login = async function (req, res) {
    const body = req.body;
    let err, user;

    [err, user] = await to(authService.authUser(req.body));
    if (err) return ReE(res, err, 422);

    return ReS(res, {
        token: user.getJWT(),
        user: user.toWeb()
    });
};
module.exports.login = login;