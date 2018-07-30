const Account = require('../models').Account;
const authService = require('./../services/AuthService');
const User = require('../models').User;
// const create = async function (req, res) {
//     res.setHeader('Content-Type', 'application/json');
//     const body = req.body;
//     if (!body.phone_number) {
//         return ReE(res, 'Please enter a phone number to register.');
//     } else if (!body.password) {
//         return ReE(res, 'Please enter a password to register.');
//     } else {
//         let err, user;

//         [err, user] = await to(authService.createUser(body));
//         if (err) return ReE(res, err, 422);
//         return ReS(res, {message: 'Successfully created new user.', user: user.toWeb(), jwt_token: user.getJWT()}, 201);
//     }
// };
// module.exports.create = create;

const get = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let user = req.user;

    return ReS(res, {user: user.toWeb()});
};
module.exports.get = get;

const update = async function (req, res) {
    let data = req.body;
    let objUpdateUser = await User.findById({_id: data.id});
    console.log(objUpdateUser)
    if (!objUpdateUser) {
        ReS(res, {message: 'Not found user'}, 404);
    }
    else {
        objUpdateUser.set(data);
        await objUpdateUser.save(function (err, updateSuccess) {
            if (err) {
                ReS(res, {message: 'Update Failed'}, 503);
            }
            else {
                ReS(res, {message: 'Update Success', updateSuccess: updateSuccess}, 200);
            }
        })
    }
};
module.exports.update = update;

const remove = async function (req, res) {
    let user, err;
    user = req.user;

    [err, user] = await to(user.destroy());
    if (err) return ReE(res, 'error occured trying to delete user');

    return ReS(res, {message: 'Deleted User'}, 204);
};
module.exports.remove = remove;

const changePassword = async function (req, res) {
    let data = req.body;
    let objUpdateUser = await User.findById({_id: data.id});
    console.log(objUpdateUser)
    if (!objUpdateUser) {
        ReS(res, {message: 'Not found user'}, 404);
    }
    else {
        [err, checkPassword] = await to(objUpdateUser.comparePassword(data.oldPassword))
        if (err) {
            ReS(res, {message: 'Password cũ không chính xác'}, 503);
        }
        else if (checkPassword) {
            [err, objDuplicatePassword] = await to(objUpdateUser.comparePassword(data.newPassword))
            if (objDuplicatePassword) {
                ReS(res, {message: 'Password mới không được trùng password cũ'}, 503);
            } else {
                objUpdateUser.set({password: data.newPassword});
                await objUpdateUser.save(function (err, updateSuccess) {
                    if (err) {
                        let changePasswordSuccess = false;
                        ReS(res, {message: 'Update Failed', changePasswordSuccess: changePasswordSuccess}, 503);
                    }
                    else {
                        let changePasswordSuccess = true;
                        ReS(res, {message: 'Update Success', changePasswordSuccess: changePasswordSuccess}, 200);
                    }
                })
            }
        }
    }
};
module.exports.changePassword = changePassword;

const fogotPassword = async function (req, res) {
    let data = req.body;
    if (!data) {
        ReS(res, {message: 'Bad request'}, 400);
    }
    else {
        let objUser =
    }
}

