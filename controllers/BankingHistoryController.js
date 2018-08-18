const BankingHistory = require('../models').BankingHistory;
const phoneService = require('./../services/PhoneService');
const Staff = require('../models').Staff;
const User = require('../models').User;
const SendNotification = require('./NotificationFCMController');
const Notification = require('../models').Notification;
const constants = require('../constants')
const doctorWithdrawal = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    try {
        const body = req.body;
        if (!body) {
            return ReE(res, 'Bad request', 400);
        }
        else {
            const code = Math.floor(10000 + 89999 * Math.random());
            let bankingHistory = new BankingHistory({
                userId: body.userId,
                amount: body.amount,
                remainMoney: body.remainMoney,
                type: constants.BANKKING_TYPE_Withdrawal,
                nameBank: body.nameBank,
                accountNumber: body.accountNumber,
                code: code
            });
            let objBankingHistoryReturn = await  bankingHistory.save();
            if (objBankingHistoryReturn) {
                // update remain money for doctor
                //get doctor
                let objDoctor = await User.findById({_id: body.userId});
                // update remain
                await objDoctor.set({remainMoney: body.remainMoney});
                let objSuccess = await objDoctor.save();
                // check update success - send notification
                if (objSuccess) {
                    [errors, codeVerify] = await to(phoneService.sendSMSVerifyBanking(objDoctor.phoneNumber, code));
                    if (errors) {
                        return ReE(res, {
                            status: false,
                            message: "Có lỗi khi gửi message!"
                        }, 400);
                    } else {
                        return ReS(res, {
                            status: true,
                            message: "Code xác minh giao dịch đã được gửi tới số điện thoại của bạn!"
                            , bankingId: objBankingHistoryReturn.id
                        }, 200);
                    }
                }
                else {
                    return ReE(res, {
                        status: false,
                        message: "Có lỗi khi tạo giao dịch!"
                    }, 400);
                }
            }
        }
    } catch (e) {
        console.log(e);
        return ReE(res, 'Tạo yêu cầu rút tiền không thành công', 503);
    }

};

module.exports.doctorWithdrawal = doctorWithdrawal;

const checkCodeVerify = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let body = req.body;
        if (body) {
            let objBanking = await BankingHistory.findById({_id: body.id});
            if ('2' === objBanking.status + "") {
                return ReE(res, {message: 'Giao dịch đã được xác mminh.'}, 503);
            }
            if (objBanking) {
                if (body.code === objBanking.code + "") {
                    objBanking.set({status: constants.BANKING_HISTORY_VERIFIED});
                    let objBankingReturn = await objBanking.save();
                    if (objBankingReturn) {

                        // save
                        let notificationDoctor = {
                            senderId: constants.ID_ADMIN,
                            nameSender: "ADMIN",
                            receiverId: objBanking.userId,
                            type: constants.NOTIFICATION_TYPE_BANKING,
                            storageId: objBanking.id,
                            message: "Tạo yêu cầu rút tiền thành công. Yêu cầu của bạn đang trong quá trình kiểm tra và xử lí.",
                        };
                        await createNotification(notificationDoctor);

                        let listAdmin = await User.find({role: '3'}).select('id');
                        console.log(listAdmin);
                        //send notification to Admin
                        let fullNameDoctor = await getUser(objBanking.userId);
                        for (let objStaff of listAdmin) {
                            // save
                            let notificationAdmin = {
                                senderId: objBanking.userId,
                                nameSender: fullNameDoctor,
                                receiverId: objStaff.id,
                                type: constants.NOTIFICATION_TYPE_BANKING,
                                storageId: objBanking.id,
                                message: "Bác sỹ " + fullNameDoctor + " đã tạo yêu cầu rút tiền qua tài khoản ngân hàng - Chờ xử lí",
                            };
                            await createNotification(notificationAdmin);
                            //send notification to doctor
                            let payLoadDoctor = {
                                data: {
                                    senderId: constants.ID_ADMIN,
                                    nameSender: "ADMIN",
                                    receiverId: objBanking.userId,
                                    type: constants.NOTIFICATION_TYPE_BANKING,
                                    storageId: objBanking.id,
                                    message: "Tạo yêu cầu rút tiền thành công. Yêu cầu của bạn đang trong quá trình kiểm tra và xử lí.",
                                    createTime: Date.now().toString()
                                }
                            };
                            // send
                            await SendNotification.sendNotification(objBanking.userId, payLoadDoctor);

                            /// send noti admin
                            let payLoadAdmin = {
                                data: {
                                    senderId: objBanking.userId,
                                    nameSender: fullNameDoctor,
                                    receiverId: objStaff.id,
                                    type: constants.NOTIFICATION_TYPE_BANKING,
                                    storageId: objBanking.id,
                                    message: "Bác sỹ " + fullNameDoctor + " đã tạo yêu cầu rút tiền qua tài khoản ngân hàng - Chờ xử lí",
                                    createTime: Date.now().toString()
                                }
                            };
                            // send
                            await SendNotification.sendNotification(objStaff.id, payLoadAdmin);
                        }
                        return ReS(res, {status: true, message: 'Giao dịch thành công. Chờ xử lí từ hệ thống'}, 200);
                    }
                }
                else {
                    let timeInputCode = objBanking.timeInputCode + 1;
                    objBanking.set({timeInputCode: timeInputCode});
                    let objBankingReturn = await objBanking.save();
                    console.log(objBankingReturn)
                    if ('4' === objBankingReturn.timeInputCode + "") {
                        console.log('vao day');
                        let objUser = await User.findById({_id: objBanking.userId});
                        let oldRemainMoney = objBanking.amount + objBanking.remainMoney;
                        objUser.set({remainMoney: oldRemainMoney});
                        let objUserReturn = await objUser.save();
                        if (objUserReturn) {
                            // xóa giao dịch
                            BankingHistory.findByIdAndRemove({_id: objBanking.id}, function (err, success) {
                                if (err) {
                                    return ReE(res, {message: 'Có lỗi xảy ra khi xóa giao dịch'}, 503);
                                }
                            });
                            return ReS(res, {
                                status: false,
                                message: 'Giao dịch đã bị hủy',
                                oldRemainMoney: oldRemainMoney
                            }, 200);
                        }
                    }
                    else {
                        return ReS(res, {message: 'Bạn đã nhập sai code'}, 503);
                    }
                }
            }
            else {
                return ReE(res, {message: 'Giao dịch không tồn tại.'}, 503);
            }
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 400);
        }
    }
    catch (e) {

    }
};
module.exports.checkCodeVerify = checkCodeVerify;

const patientRecharge = async function (req, res) {

};
module.exports.patientRecharge = patientRecharge;

const getHistoryBanking = async function (req, res) {
    try {
        let pageSize = 0;
        let page = 0;
        if (req.query.pageSize) {
            pageSize = req.query.pageSize * 1;
        }
        if (req.query.page) {
            page = req.query.page * 1;
        }
        if (req.params.userId) {
            let listBankingHistory = await BankingHistory.find({
                userId: req.params.userId,
                deletionFlag : false
            })
                .select('-timeInputCode -code')
                .limit(pageSize)
                .skip(pageSize * page);
            if(listBankingHistory){
                return ReS(res, {
                    status: true,
                    message: 'Danh sách giao dịch ngân hàng.',
                    listBankingHistory: listBankingHistory
                }, 200);
            }
            else {
                return ReE(res, {message: 'Không tìm thấy lịch sử giao dịch'}, 400);
            }
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 400);
        }
    }
    catch (e) {
        return ReE(res, {message: 'ERROR'}, 400);
    }
};
module.exports.getHistoryBanking = getHistoryBanking;

const getDetailHistoryById = async function (req, res) {
    BankingHistory.findById(req.params.id).then(doc => {
        if (!doc) ReE(res, "ERROR0019", 404);
        return ReS(res, {message: 'Tải lịch sử giao dịch thành công', doc: doc}, 200);
    })
        .catch(err => next(err));
};
module.exports.getDetailHistoryById = getDetailHistoryById;

const removeLogic = async function (req, res) {
    BankingHistory.findByIdAndUpdate(req.params.id, {$set: {deletionFlag: "1"}}, function (err, removeLogic) {
        res.send(removeLogic);
    });
};
module.exports.removeLogic = removeLogic;

const payCashForDoctor = async function (req, res) {

};

async function getUser(userId) {
    let fullName;
    let objUser = await User.findById({_id: userId});
    if (objUser) {
        fullName = " " + objUser.firstName + " " + objUser.middleName + " " + objUser.lastName + "";
    }
    return fullName
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
