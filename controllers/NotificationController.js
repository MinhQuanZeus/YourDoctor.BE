const Notification = require('../models').Notification;

const create = async function (req) {
    try {
    const body = req.body;
    if(!body){
        return;
    }
        let notification = new Notification({
            senderId: body.senderId,
            nameSender: body.nameSender,
            receiverId: body.receiverId,
            type: body.type,
            storageId: body.storageId,
            message: body.message
        });
        await  notification.save();
    }
    catch (e) {
        console.log(e);
    }
};

module.exports.create = create;

const getAllNotificationByPatient = async function (req, res) {
    if (!req.params.receiverId) {
        return ReS(res, {message: 'Bad request'}, 400);
    }
    let pageSize = 0;
    let page = 0;
    if (req.query.pageSize) {
        pageSize = req.query.pageSize * 1;
    }
    if(req.query.page){
        page = req.query.pageSize * 1;
    }
    console.log(req.params.receiverId);
    console.log(pageSize);
    console.log(page);
    try {
        Notification.find({
            receiverId: req.params.receiverId,
            deletionFlag: {$ne: true}
        })
            .sort([['createdAt', -1]])
            .limit(pageSize)
            .skip(pageSize * page)
            .exec(function (err, listNotification) {
                if (err) {
                    return ReS(res, {message: 'Not found'}, 503);
                }
           return ReS(res, {message: 'Tạo danh sách notification thành công', listNotification: listNotification}, 200);
        });
    } catch (e) {
        console.log(e)
    }
};

module.exports.getAllNotificationByPatient = getAllNotificationByPatient;