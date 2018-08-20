const Account = require('../models').Account
const authService = require('./../services/AuthService')
const User = require('../models').User;
const Rating = require('../models').Rating;
const Doctor = require('../models').Doctor;
const SendNotification = require('./NotificationFCMController');
const constants = require('../constants')
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
    res.setHeader('Content-Type', 'application/json')
    let user = req.user

    return ReS(res, { user: user.toWeb() })
}
module.exports.get = get

const update = async function (req, res) {
    let data = req.body
    let objUpdateUser = await User.findById({ _id: data.id })
    console.log(objUpdateUser)
    if (!objUpdateUser) {
        ReS(res, { message: 'Not found user' }, 404)
    }
    else {
        objUpdateUser.set(data)
        await objUpdateUser.save(function (err, updateSuccess) {
            if (err) {
                ReS(res, { message: 'Update Failed' }, 503)
            }
            else {
                ReS(res, { message: 'Update Success', updateSuccess: updateSuccess }, 200)
            }
        })
    }
}
module.exports.update = update

const remove = async function (req, res) {
    let user, err
    user = req.user;

    [err, user] = await to(user.destroy())
    if (err) return ReE(res, 'error occured trying to delete user')

    return ReS(res, { message: 'Deleted User' }, 204)
}
module.exports.remove = remove

const changePassword = async function (req, res) {
    let data = req.body
    let objUpdateUser = await User.findById({ _id: data.id })
    console.log(objUpdateUser)
    if (!objUpdateUser) {
        ReS(res, { message: 'Not found user' }, 404)
    }
    else {
        [err, checkPassword] = await to(objUpdateUser.comparePassword(data.oldPassword))
        if (err) {
            ReS(res, { message: 'Password cũ không chính xác' }, 503)
        }
        else if (checkPassword) {
            [err, objDuplicatePassword] = await to(objUpdateUser.comparePassword(data.newPassword))
            if (objDuplicatePassword) {
                ReS(res, { message: 'Password mới không được trùng password cũ' }, 503)
            } else {
                objUpdateUser.set({ password: data.newPassword })
                await objUpdateUser.save(function (err, updateSuccess) {
                    if (err) {
                        let changePasswordSuccess = false
                        ReS(res, { message: 'Update Failed', changePasswordSuccess: changePasswordSuccess }, 503)
                    }
                    else {
                        let changePasswordSuccess = true
                        ReS(res, { message: 'Update Success', changePasswordSuccess: changePasswordSuccess }, 200)
                    }
                })
            }
        }
    }
}
module.exports.changePassword = changePassword
const phoneService = require('./../services/PhoneService')
const forgotPassword = async function (req, res) {
    if (!req.params.phoneNumber) {
        ReS(res, { message: 'Bad request' }, 400)
    }
    else {
        let objUser = await User.findOne({ phoneNumber: req.params.phoneNumber })
        if (objUser) {
            const newPassword = 'yd@' + Math.floor(10000 + 89999 * Math.random())
            objUser.set({ password: newPassword })
            let objUserReturn = await objUser.save()
            if (objUserReturn) {
                [errors, status] = await to(phoneService.sendSMSPassword(req.params.phoneNumber, newPassword))
                if (errors) {
                    return ReE(res, {
                        status: false,
                        message: 'Có lỗi khi gửi message!',
                    }, 400)
                } else {
                    return ReS(res, {
                        status: true,
                        message: 'Mật khẩu mới đã được gửi tới số điện thoại của bạn!',
                    }, 200)
                }
            }
        }
        else {
            return ReS(res, {
                status: false,
                message: 'Số điện thoại không đúng.',
            }, 404)
        }
    }

}

module.exports.forgotPassword = forgotPassword

const getAllUser = async function (req, res) {
    try {
        let query = {}
        if (req.query.page_size) {
            query.page_size = req.query.page_size
        }
        if (req.query.page_number) {
            query.page_number = req.query.page_number
        }
        if (req.query.search_keyword) {
            query.search_keyword = req.query.search_keyword
        }
        if (req.query.status) {
            query.status = req.query.status
        }
        if (req.query.role) {
            query.role = req.query.role
        }
        if (req.query.sort_key) {
            query.sort_key = req.query.sort_key
        }
        if (req.query.sort_direction) {
            query.sort_direction = req.query.sort_direction
        }
        // create query
        let queryToSearch = {}
        if (query.status !== '0' && query.role !== '0') {
            queryToSearch = { status: query.status, role: query.role, deletionFlag: { $ne: true } }
        }
        else if (query.status !== '0' && query.role === '0') {
            queryToSearch = { status: query.status, deletionFlag: { $ne: true } }
        }
        else if (query.status === '0' && query.role !== '0') {
            queryToSearch = { role: query.role, deletionFlag: { $ne: true } }
        }
        else if (query.status === '0' && query.role === '0') {
            queryToSearch = { deletionFlag: { $ne: true } }
        }
        let finalList = []
        let listUser = await User.find(queryToSearch)
        if (listUser) {
            if (query.search_keyword) {
                for (let objUser of listUser) {
                    let fullName = objUser.firstName + ' ' + objUser.middleName + ' ' + objUser.lastName
                    if (fullName.toLowerCase().includes(query.search_keyword.toLowerCase())) {
                        objUser.fullName = fullName
                        finalList.push(objUser)
                    }
                }
            } else {
                for (let objUser of listUser) {
                    let fullName = objUser.firstName + ' ' + objUser.middleName + ' ' + objUser.lastName
                    objUser.fullName = fullName
                    finalList.push(objUser)
                }
            }
            if (query.sort_key && query.sort_direction) {
                finalList.sort(function (a, b) {
                    switch (query.sort_key) {
                        case 'phoneNumber': {
                            let aSize = a.phoneNumber
                            let bSize = b.phoneNumber
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1
                            }
                            break
                        }
                        case 'fullName': {
                            let aSize = a.fullName
                            let bSize = b.fullName
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1
                            }
                            break
                        }
                        case 'roleString': {
                            let aSize = a.role
                            let bSize = b.role
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1
                            }
                            break
                        }
                        case 'statusString': {
                            let aSize = a.status
                            let bSize = b.status
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1
                            }
                            break
                        }
                        default : {
                            let aSize = a.role
                            let bSize = b.role
                            if (query.sort_direction.includes('desc')) {
                                return (aSize > bSize) ? -1 : 1
                            } else if (query.sort_direction.includes('asc')) {
                                return (aSize < bSize) ? -1 : 1
                            }
                            break
                        }
                    }
                })
            }
            ReS(res, { message: finalList.length, listUser: finalList }, 200)
        }
    }
    catch (e) {
        console.log(e)
    }
};

module.exports.getAllUser = getAllUser;

const updateUser = async function (req, res) {
    try {
        let body = req.body;
        if (body) {
            let objUser = await User.findById({_id: body.id});
            let objDoctor = await Doctor.findOne({doctorId: body.id});
            if (objUser.role === '2') {
                if (body.status === '1') {
                    let message = "Tài khoản bác sỹ của bạn đã được xác minh. Bạn đã có thể đăng nhập vào hệ thống ứng dụng của YourDoctor";
                    [errors, status] = await to(phoneService.adminSendSMS(objUser.phoneNumber, message));
                }
                if (body.status === '3') {
                    let message = "Tài khoản của bạn đã bị khóa do sai phạm trong quy chế và điều khoản sử dụng ứng dụng.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_REPORT, message);
                }
                if (body.status === '4') {
                    let message = "Tài khoản của bạn đã bị khóa tạm thời sử dụng ứng dụng YourDoctor Partner. Bạn vẫn có thể đăng nhập ứng dụng dành cho bệnh nhân.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_REPORT, message);
                }
                if (body.systemRating < objDoctor.systemRating) {
                    let message = "Bạn đã bị giảm chỉ số Rate do những báo cáo về chất lượng các cuộc tư vấn.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_REPORT, message);
                }
                if (body.role === '1') {
                    let message = "Tài khoản của bạn đã được cập nhật thành Bệnh nhân.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_ROLE, message);
                }
                if (body.role === '3') {
                    let message = "Tài khoản của bạn đã được cập nhật thành Admin.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_ROLE, message);
                }
                let finalRate = await calculateRate(body.id,body.systemRating);
                objDoctor.set({systemRating:body.systemRating, currentRating:finalRate});
                let objDoctorReturn = await objDoctor.save();
                objUser.set({status: body.status, role: body.role})
                let objUserReturn = objUser.save();
                if(objDoctorReturn && objUserReturn){
                    return ReS(res, {success: true}, 200);
                }
                else {
                    return ReS(res, {success: false}, 503);
                }
            }
            else if (objUser.role === '1') {
                if (body.status === '3') {
                    let message = "Tài khoản của bạn đã bị khóa do sai phạm trong quy chế và điều khoản sử dụng ứng dụng.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_REPORT, message);
                }
                if (body.role === '2') {
                    let message = "Tài khoản của bạn đã được cập nhật thành Bác sỹ.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_ROLE, message);
                }
                if (body.role === '3') {
                    let message = "Tài khoản của bạn đã được cập nhật thành Admin.";
                    await Notification(constants.ID_ADMIN, constants.NAME_ADMIN, objUser.id, constants.NOTIFICATION_TYPE_ROLE, message);
                }
                objUser.set({status: body.status});
                let objUserReturn = objUser.save();
                if (objUserReturn) {
                    return ReS(res, {success: true}, 200);
                }
                else {
                    return ReS(res, {success: false}, 503);
                }
            }
        }
        else {
            ReE(res, {message: 'Bad request'}, 400);
        }
    }
    catch (e) {

    }
};

module.exports.updateUser = updateUser

async function Notification(senderId, nameSender, receiverId, type, storageId, message) {
    let notification = {
        senderId: senderId,
        nameSender: nameSender,
        receiverId: receiverId,
        type: type,
        storageId: storageId,
        message: message
    };
    await createNotification(notification);

    let payLoad = {
        data: {
            senderId: senderId,
            nameSender: nameSender,
            receiverId: receiverId,
            type: type,
            storageId: storageId,
            message: message,
            createTime: Date.now().toString()
        }
    };
    // send
    await SendNotification.sendNotification(receiverId, payLoad);
}

const createNotification = async function (body) {
    try {
        let notification = Notification({
            senderId: body.senderId,
            nameSender: body.nameSender,
            receiverId: body.receiverId,
            type: body.type,
            storageId: body.storageId,
            message: body.message
        });
        await  notification.save(function (err, success) {
            if (err) {
                console.log(err)
            }
        });
    }
    catch (e) {
        console.log(e)
    }
};

const deleteUserById = async function (req, res) {
    const updateTime = req.query.updateTime
    const userId = req.params.userId
    if (!userId || !updateTime) {
        ReE(res, {
            status: false,
            message: 'Vui lòng nhập userId và updateTime',
        }, 400)
    }
    User.find({
        _id: userId,
    }, (err, results) => {
        if (err) {
            return ReE(res, err, 500)
        }

        if (results && results.length === 0) {
            return ReE(res, 'Người dùng không tồn tại', 404)
        }
        user = results[0]
        if (user.updatedAt !== updateTime) {
            return ReE(res, 'Người dùng đã được chỉnh sửa, vui lòng refresh và thử lại', 400)
        }

        user.deletionFlag = true
        user.save((error, status) => {
            if (error) {
                return ReE(res, 'Xóa người dùng không thành công, vui lòng thử lại', 400)
            }
            ReS(res, {
                status: true,
                message: 'Đã xóa thành công ' + user.full_name,
            }, 200)
        })

    })
}

module.exports.deleteUserById = deleteUserById

const getUserById = async function (req, res) {
    console.log('getUser');
    const userId = req.params.userId
    if (!userId) {
        ReE(res, {
            status: false,
            message: 'Vui lòng nhập userId',
        }, 400)
    }
    User.find({
        _id: userId,
        deletionFlag: false,
    }, (err, results) => {
        if (err) {
            return ReE(res, err, 500)
        }

        if (results && results.length === 0) {
            return ReE(res, 'Người dùng không tồn tại', 404)
        }
        user = results[0]
        if (user && user.role === constants.ROLE_DOCTOR) {
            Doctor.find({doctorId: user._id}, function (err, getDoctor) {
                if (err) {
                    if (err) return ReE(res, "ERROR0009", 404);
                    next();
                }
                let moreDoctorDetail = null;
                if (getDoctor && getDoctor.length> 0) {
                    moreDoctorDetail = getDoctor[0];
                }

                ReS(res, {
                    status: true,
                    user: user.toWeb(),
                    moreDoctorDetail: moreDoctorDetail
                }, 200)
            });
        }else {
            ReS(res, {
                status: true,
                user: user.toWeb(),
            }, 200)
        }

    })
}
module.exports.getUserById = getUserById;



async function calculateRate(doctorId, newSystemRating) {
    let averagePatientRate = 0;
    let finalRate = 0;
    // update to doctor table
    await Rating.aggregate([
        {
            $match: {doctorId: {$eq: doctorId}}
        },
        {
            $group: {
                _id: '$doctorId',  //$doctorId is the column name in collection
                totalRating: {
                    $sum: "$rating"
                },
                count: {$sum: 1}
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err)
        } else {
            if (result[0].totalRating > 0) {
                averagePatientRate = ((result[0].totalRating) / (result[0].count));
                finalRate = ((averagePatientRate * (1-constants.SYSTEM_RATE_PERCENT)) + (newSystemRating * constants.SYSTEM_RATE_PERCENT))
            }
            else {
                finalRate = newSystemRating
            }
        }
    });
    return finalRate.toFixed(2);
}


