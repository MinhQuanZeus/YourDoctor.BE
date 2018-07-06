const Account = require('../models').Account;
const multiparty = require('multiparty');
const authService = require('./../services/AuthService');
const awsService = require('./../services/AWSService')

const register = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let userInfo;
    const form = new multiparty.Form();
    form.on('field', function (name, value) {
        if (name == "user") {
            userInfo = value;
        }
    });
    form.on('part', async function (part) {
        if (part.filename) {
            filePart = part;
            let status;
            try {
                status = await to(awsService.uploadAvatar(part));
            } catch (ex) {
                RE(res, ex, 422);
            }
        }
    });
    form.on('close', async function () {
        const avatar = CONFIG.AWS_S3_DOMAIN + CONFIG.AWS_BUKET_PUBLIC + "/" + filePart.filename;      
        [erro, user] = await to(authService.createUser(userInfo, avatar));
        if (erro) return ReE(res, erro, 422);
        return ReS(res, {
            message: 'Successfully created new user.',
            user: user.toWeb(),
            jwt_token: user.getJWT()
        }, 200);
    });
    form.on('error', function (err) {
        if (erro) return ReE(res, err, 422);
    });
    form.parse(req);
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