const Staff = require('../models').Staff;
const User = require('../models').User;
const constants = require('../constants');
const createStaff = async function (req, res) {
    try {
        let body = req.body;
        let objCheckDuplicate = await User.findOne({phoneNumber:body.phoneNumber});
        if(objCheckDuplicate){
            return ReS(res, {
                status: false,
                message: 'Đăng kí không thành công. Số điện thoại này đã thuộc tài khoản khác.'
            }, 503);
        }
        let createObjUser = new User({
            phoneNumber: body.phoneNumber,
            password: body.password,
            firstName: body.firstName,
            middleName: body.middleName,
            lastName: body.lastName,
            birthday: body.birthday,
            address: body.address,
            avatar: body.avatar,
            remainMoney: body.remainMoney,
            role: constants.ROLE_STAFF,
            gender: body.gender,
            status: constants.STATUS_USER_ACTIVE,
        });
        let objUserReturn = await createObjUser.save();
        if (objUserReturn) {
            let staff = new Staff({
                staffId:objUserReturn.id,
                department:body.department,
                role:body.role
            });
            let objStaffReturn = await  staff.save();
            if (objStaffReturn) {
                // send notification to staff or admin
                return ReS(res, {
                    status: true,
                    message: 'Đăng kí thành công.'
                }, 200);
            }
            else {
                return ReS(res, {
                    status: false,
                    message: 'Đăng kí không thành công.'
                }, 503);
            }
        }
        else {
            return ReS(res, {
                status: false,
                message: 'Đăng kí không thành công.'
            }, 503);
        }
    }
    catch (e) {
        console.log(e);
        return ReE(res, 'BAD REQUEST', 400);
    }
};

module.exports.createStaff = createStaff;