const Notification = require('../models').Notification;

const create = async function (req) {
    try {
    const body = req.body;
    console.log(body)
    if(!body){
        return;
    }

        var notification = new Notification({
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
        console.log(e)
    }
}

module.exports.create = create;