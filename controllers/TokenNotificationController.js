const TokenNotification = require('../models').TokenNotification;


const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.userId || !body.tokenDevice ) {
        return ReE(res, 'ERROR0028', 400);
    }
    let duplicateToken = await TokenNotification.findOne({userId:body.userId})
    if(duplicateToken) {
        return ReE(res, 'ERROR0041', 400);
    }
    try{
        var tokenNotification = new TokenNotification({
            userId : body.userId,
            tokenDevice :body.tokenDevice
        });
        await  tokenNotification.save();
        return ReS(res, {message: 'Tạo token device thành công', tokenNotification: tokenNotification}, 200);
    }catch (e) {
        ReS(res, e.message, 503);
    }

}

module.exports.create = create;

const update = async function (req, res) {
    let data;
    data = req.body;
    if (!data.userId || !data.tokenDevice) return ReE(res, "ERROR0010", 400);
    try {
        TokenNotification.findOne({userId: data.userId}, function (err, tokenUpdate) {
            if (err) return ReE(res, "ERROR0042", 503);
            if (!tokenUpdate) return ReE(res, "ERROR0043", 404);
            tokenUpdate.set(data);
            tokenUpdate.save(function (err, updatedToken) {
                if (err)return ReE(res, "ERROR0042", 503);
                return ReS(res, {message: 'Update token thành công', updatedToken: updatedToken}, 200);
            });
        });
    }catch (e) {
        return ReE(res, "ERROR0042", 503);
    }
}
module.exports.update = update;