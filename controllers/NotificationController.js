const Notification = require('../models').Notification;

const create = async function (req, res) {
    try {
        const body = req.body;
        if (!body) {
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
        return ReS(res, {message: 'insert notification thành công', notification: notification}, 200);
    }
    catch (e) {
        console.log(e);
    }
};

module.exports.create = create;

const getAllNotificationByUser = async function (req, res) {
    if (!req.params.receiverId) {
        return ReS(res, {message: 'Bad request'}, 400);
    }
    let pageSize = 0;
    let page = 0;
    if (req.query.pageSize) {
        pageSize = req.query.pageSize * 1;
    }
    if (req.query.page) {
        page = req.query.page * 1;
    }
    try {
        let listNotification = await Notification.find({
            receiverId: req.params.receiverId,
            deletionFlag: false
        })
            .sort([['createdAt', -1]])
            .limit(pageSize)
            .skip(pageSize * page)
            .populate({
                path:'senderId',
                select:'avatar'
            });
        if(!listNotification){
            return ReS(res, {message: 'Not found'}, 404);
        }
        return ReS(res, {message: 'Tạo danh sách notification thành công', listNotification: listNotification}, 200);
    } catch (e) {
        return ReS(res, {message: 'Not found'}, 503);
    }
};

module.exports.getAllNotificationByUser = getAllNotificationByUser;