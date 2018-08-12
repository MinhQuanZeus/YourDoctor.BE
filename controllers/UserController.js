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
const phoneService = require('./../services/PhoneService');
const forgotPassword = async function (req, res) {
    if (!req.params.phoneNumber) {
        ReS(res, {message: 'Bad request'}, 400);
    }
    else {
        let objUser = await User.findOne({phoneNumber: req.params.phoneNumber});
        if (objUser) {
            const newPassword = "yd@" + Math.floor(10000 + 89999 * Math.random());
            objUser.set({password: newPassword});
            let objUserReturn = await objUser.save();
            if (objUserReturn) {
                [errors, status] = await to(phoneService.sendSMSPassword(req.params.phoneNumber, newPassword));
                if (errors) {
                    return ReE(res, {
                        status: false,
                        message: "Có lỗi khi gửi message!"
                    }, 400);
                } else {
                    return ReS(res, {
                        status: true,
                        message: "Mật khẩu mới đã được gửi tới số điện thoại của bạn!"
                    }, 200);
                }
            }
        }
        else {
            return ReS(res, {
                status: false,
                message: "Số điện thoại không đúng."
            }, 404);
        }
    }

};

module.exports.forgotPassword = forgotPassword;

const getAllUser = async function (req, res) {
    try {
        let query = {};
        if (req.query.page_size) {
            query.page_size = req.query.page_size;
        }
        if (req.query.page_number) {
            query.page_number = req.query.page_number;
        }
        if (req.query.search_keyword) {
            query.search_keyword = req.query.search_keyword;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.role) {
            query.role = req.query.role;
        }
        if (req.query.sort_key) {
            query.sort_key = req.query.sort_key;
        }
        if (req.query.sort_direction) {
            query.sort_direction = req.query.sort_direction;
        }
        // create query
        let queryToSearch = {};
        if (query.status !== '0' && query.role !== '0') {
            queryToSearch = {status: query.status, role: query.role, deletionFlag: {$ne: true}}
        }
        else if (query.status !== '0' && query.role === '0') {
            queryToSearch = {status: query.status, deletionFlag: {$ne: true}}
        }
        else if (query.status === '0' && query.role !== '0') {
            queryToSearch = {role: query.role, deletionFlag: {$ne: true}}
        }
        else if (query.status === '0' && query.role === '0') {
            queryToSearch = {deletionFlag: {$ne: true}}
        }
        let finalList = [];
        let listUser = await User.find(queryToSearch);
        if (listUser) {
            if (query.search_keyword) {
                for (let objUser of listUser) {
                    let fullName = objUser.firstName + " " + objUser.middleName + " " + objUser.lastName;
                    if (fullName.toLowerCase().includes(query.search_keyword.toLowerCase())) {
                        objUser.fullName = fullName;
                        finalList.push(objUser);
                    }
                }
            } else {
                for (let objUser of listUser) {
                    let fullName = objUser.firstName + " " + objUser.middleName + " " + objUser.lastName;
                    objUser.fullName = fullName;
                    finalList.push(objUser);
                }
            }
            if (query.sort_key && query.sort_direction) {
                finalList.sort(function (a, b) {
                    switch (query.sort_key) {
                        case 'fullName': {
                            let aSize = a.fullName;
                            let bSize = b.fullName;
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1;
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1;
                            }
                            break;
                        }
                        case 'role': {
                            let aSize = a.role;
                            let bSize = b.role;
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1;
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1;
                            }
                            break;
                        }
                        case 'status': {
                            let aSize = a.status;
                            let bSize = b.status;
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1;
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1;
                            }
                            break;
                        }
                        default : {
                            let aSize = a.role;
                            let bSize = b.role;
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1;
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1;
                            }
                            break;
                        }
                    }
                });
            }
            ReS(res, {message: finalList.length, listUser: finalList}, 200);
        }
    }
    catch (e) {
        console.log(e)
    }
};

module.exports.getAllUser = getAllUser;


